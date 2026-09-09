// lib/buyOff.ts
// Phase 2: Buy-Off Loan Calculation Engine
// Reuses the 13-term table from lib/schedule.ts and core formula from lib/calculations.ts without duplication.

import {
  APPROVED_TERMS,
  MIN_LOAN_AMOUNT,
  MAX_LOAN_AMOUNT,
  MIN_WORKING_AGE,
  TermConfig,
} from './schedule';
import {
  calculateInstallment,
  calculateRawLoanAmount,
  calculateRetirementCutoff,
} from './calculations';
import {
  CreditFacility,
  CreditFacilityResult,
  BuyOffTermResult,
  BuyOffQualificationResult,
  PayslipInput,
} from './types';

/**
 * Step 1: First ability calculation.
 * Formula: netSalary (or newNetSalary if arrears) - (basicSalary / 3)
 *
 * Note: Can be negative, zero, or positive.
 * // CONFIRM WITH TIJAARA: Buy-off flow is exempt from the standard ability bounds (371 / 78,887) per section 11.3.
 */
export function calculateFirstAbility(
  netSalary: number,
  basicSalary: number,
  hasAllowanceArrears: boolean,
  allowanceArrears: number
): { firstAbility: number; newNetSalary: number } {
  const safeBasic = Math.max(0, basicSalary);
  const safeNet = Math.max(0, netSalary);
  const safeArrears = hasAllowanceArrears ? Math.max(0, allowanceArrears) : 0;

  const newNetSalary = safeNet - safeArrears;
  const firstAbility = newNetSalary - safeBasic / 3;

  return { firstAbility, newNetSalary };
}

/**
 * Step 2a: Estimated credit balance ("buy-off amount") for a single credit facility i:
 * buyOffAmount_i = (outstandingBalance_i / 3) + installment_i
 *
 * Worked example: balance 200,753.00, installment 1,687 -> (200,753 / 3) + 1,687 = 68,604.6666... (68,604.67)
 * // CONFIRM WITH TIJAARA: No rounding applied to buyOffAmount for consistency with Phase 1 per section 11.4.
 */
export function calculateSingleFacilityBuyOff(facility: CreditFacility): CreditFacilityResult {
  const safeBalance = Math.max(0, facility.outstandingBalance);
  const safeInstallment = Math.max(0, facility.monthlyInstallment);

  // Exact unrounded formula
  const buyOffAmount = safeBalance / 3 + safeInstallment;

  return {
    ...facility,
    outstandingBalance: safeBalance,
    monthlyInstallment: safeInstallment,
    buyOffAmount,
  };
}

/**
 * Step 2b: Sum across all entered commercial credit facilities:
 * totalBuyOffAmount = sum(buyOffAmount_i)
 * totalInstallments = sum(installment_i)
 *
 * // CONFIRM WITH TIJAARA: Multiple credit facilities approach: sum across all facilities per section 11.2.
 */
export function calculateTotalFacilities(facilities: CreditFacility[]): {
  totalBuyOffAmount: number;
  totalInstallments: number;
  facilityResults: CreditFacilityResult[];
} {
  const facilityResults = facilities.map(calculateSingleFacilityBuyOff);

  const totalBuyOffAmount = facilityResults.reduce((acc, f) => acc + f.buyOffAmount, 0);
  const totalInstallments = facilityResults.reduce((acc, f) => acc + f.monthlyInstallment, 0);

  return {
    totalBuyOffAmount,
    totalInstallments,
    facilityResults,
  };
}

/**
 * Step 3: Buy Off Ability:
 * if (firstAbility < 0) {
 *   buyOffAbility = totalInstallments
 * } else {
 *   buyOffAbility = firstAbility + totalInstallments
 * }
 */
export function calculateBuyOffAbility(firstAbility: number, totalInstallments: number): number {
  if (firstAbility < 0) {
    return totalInstallments;
  }
  return firstAbility + totalInstallments;
}

/**
 * Step 4 helper: Evaluates a single term for Buy-Off eligibility.
 * Reuses same per-term formula as section 5.2.
 */
export function calculateBuyOffTermResult(
  buyOffAbility: number,
  config: TermConfig,
  maxAllowedTerm: number,
  totalBuyOffAmount: number
): BuyOffTermResult {
  const isAllowedByRetirement = config.term <= maxAllowedTerm;
  const rawAmount = calculateRawLoanAmount(buyOffAbility, config);

  // Viability checks
  const isViableByFee = buyOffAbility > config.ledgerFee && rawAmount > 0;
  // // CONFIRM WITH TIJAARA: Option (a) min floor of 5,000 applies to schedule viability
  const meetsMinFloor = rawAmount >= MIN_LOAN_AMOUNT;
  const isViable = isViableByFee && meetsMinFloor;

  // Max loan amount clamped to 3,000,000 ceiling (no rounding per section 2.5 & 11.4)
  const maxLoanAmount = Math.min(rawAmount, MAX_LOAN_AMOUNT);

  const processingFeeAmount = maxLoanAmount * config.processingFeeRate;
  const netDisbursedPrincipal = maxLoanAmount - processingFeeAmount;

  // Monthly repayment is buyOffAbility (or clamped installment)
  const monthlyRepayment =
    rawAmount > MAX_LOAN_AMOUNT
      ? calculateInstallment(MAX_LOAN_AMOUNT, config)
      : buyOffAbility;

  // Qualification condition: buyOffLoanAmount >= totalBuyOffAmount
  const qualifies = isViable && isAllowedByRetirement && maxLoanAmount >= totalBuyOffAmount;

  // Surplus amount: // CONFIRM WITH TIJAARA: whether to disburse full amount or cap at totalBuyOffAmount per section 11.1
  const surplusAmount = Math.max(0, maxLoanAmount - totalBuyOffAmount);

  let disqualificationReason: string | undefined;
  if (!isAllowedByRetirement) {
    disqualificationReason = `Exceeds retirement cutoff (max allowed term: ${maxAllowedTerm} months)`;
  } else if (!isViableByFee) {
    disqualificationReason = `Buy-off ability (${buyOffAbility.toFixed(2)}) is less than term ledger fee (${config.ledgerFee})`;
  } else if (!meetsMinFloor) {
    disqualificationReason = `Computed amount (${Math.round(rawAmount)}) is below minimum loan floor (${MIN_LOAN_AMOUNT.toLocaleString()})`;
  } else if (maxLoanAmount < totalBuyOffAmount) {
    disqualificationReason = `Loan amount (${Math.round(maxLoanAmount).toLocaleString()}) is less than required settlement (${Math.round(totalBuyOffAmount).toLocaleString()})`;
  }

  return {
    term: config.term,
    interestOrProfitRate: config.interestRate,
    insuranceRate: config.insuranceRate,
    ledgerFee: config.ledgerFee,
    processingFeeRate: config.processingFeeRate,
    maxLoanAmount,
    buyOffLoanAmount: maxLoanAmount,
    totalBuyOffAmount,
    monthlyRepayment,
    netDisbursedPrincipal,
    isAllowedByRetirement,
    isViable,
    qualifies,
    surplusAmount,
    disqualificationReason,
  };
}

/**
 * Step 4 full evaluation: Evaluates Buy-Off Loan Qualification across all 13 terms.
 */
export function evaluateBuyOffQualification(
  input: PayslipInput
): BuyOffQualificationResult {
  const {
    basicSalary,
    netSalary,
    hasAllowanceArrears,
    allowanceArrears,
    loanType,
    creditFacilities = [],
  } = input;

  // Age in whole years (fallback to DOB if provided)
  const clientAge =
    input.age !== undefined
      ? input.age
      : input.dateOfBirth
      ? Math.max(0, Math.floor((new Date().getTime() - new Date(input.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000)))
      : 0;

  // 1. First ability (can be negative)
  const { firstAbility, newNetSalary } = calculateFirstAbility(
    netSalary,
    basicSalary,
    hasAllowanceArrears,
    allowanceArrears
  );

  // 2. Facilities calculation
  const { totalBuyOffAmount, totalInstallments, facilityResults } =
    calculateTotalFacilities(creditFacilities);

  // 3. Buy Off Ability
  const buyOffAbility = calculateBuyOffAbility(firstAbility, totalInstallments);

  // 4. Retirement Cutoff Rule (same as Phase 1)
  const { yearsToRetirement, monthsToRetirement, maxAllowedTerm, isWithin3Months } =
    calculateRetirementCutoff(clientAge);

  const baseResult = {
    firstAbility,
    newNetSalary,
    basicSalary,
    netSalary,
    hadArrears: hasAllowanceArrears,
    allowanceArrears: hasAllowanceArrears ? allowanceArrears : 0,
    age: clientAge,
    dob: input.dateOfBirth,
    loanType,
    yearsToRetirement,
    monthsToRetirement,
    maxAllowedTerm,
    facilities: facilityResults,
    totalBuyOffAmount,
    totalInstallments,
    buyOffAbility,
  };

  // Age validation
  if (clientAge < MIN_WORKING_AGE) {
    return {
      ...baseResult,
      qualified: false,
      rejectionType: 'INVALID_INPUT',
      rejectionReason: `Client age must be at least ${MIN_WORKING_AGE} years old.`,
      qualifyingTerms: [],
      disqualifiedTerms: [],
    };
  }

  if (clientAge > 100) {
    return {
      ...baseResult,
      qualified: false,
      rejectionType: 'INVALID_INPUT',
      rejectionReason: 'Please enter a valid client age (maximum 100).',
      qualifyingTerms: [],
      disqualifiedTerms: [],
    };
  }

  // Retirement cutoff ineligibility
  if (isWithin3Months) {
    return {
      ...baseResult,
      qualified: false,
      rejectionType: 'RETIREMENT_CUTOFF',
      rejectionReason:
        'Client is within 3 months of retirement and cannot be issued a new loan per policy.',
      qualifyingTerms: [],
      disqualifiedTerms: [],
    };
  }

  // Must have at least one credit facility entered
  if (facilityResults.length === 0 || totalBuyOffAmount <= 0) {
    return {
      ...baseResult,
      qualified: false,
      rejectionType: 'INVALID_INPUT',
      rejectionReason: 'At least one valid commercial credit facility must be entered for buy-off evaluation.',
      qualifyingTerms: [],
      disqualifiedTerms: [],
    };
  }

  // 5. Evaluate all 13 terms
  const allTerms: BuyOffTermResult[] = APPROVED_TERMS.map((config) => {
    return calculateBuyOffTermResult(buyOffAbility, config, maxAllowedTerm, totalBuyOffAmount);
  });

  const qualifyingTerms = allTerms.filter((t) => t.qualifies);
  const disqualifiedTerms = allTerms.filter((t) => !t.qualifies);

  if (qualifyingTerms.length === 0) {
    // Find the highest amount reachable to provide transparent feedback
    const highestReachable = Math.max(...allTerms.map((t) => (t.isAllowedByRetirement ? t.buyOffLoanAmount : 0)));
    const formattedHighest = highestReachable > 0 ? highestReachable.toLocaleString('en-KE', { maximumFractionDigits: 0 }) : '0';

    return {
      ...baseResult,
      qualified: false,
      rejectionType: 'NO_QUALIFYING_TERMS',
      rejectionReason: `Buy-off ability of KES ${buyOffAbility.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} is insufficient to cover the required total debt settlement of KES ${totalBuyOffAmount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} under any approved term up to 120 months (highest attainable loan is KES ${formattedHighest}).`,
      qualifyingTerms: [],
      disqualifiedTerms,
    };
  }

  // Longest qualifying term (last in ascending array)
  const bestTerm = qualifyingTerms[qualifyingTerms.length - 1];

  return {
    ...baseResult,
    qualified: true,
    qualifyingTerms,
    disqualifiedTerms,
    maxAvailableLoan: {
      term: bestTerm.term,
      amount: bestTerm.buyOffLoanAmount,
      installment: bestTerm.monthlyRepayment,
      surplus: bestTerm.surplusAmount,
    },
  };
}
