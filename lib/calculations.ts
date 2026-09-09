// lib/calculations.ts
import {
  APPROVED_TERMS,
  MIN_ABILITY,
  MAX_ABILITY,
  MIN_LOAN_AMOUNT,
  MAX_LOAN_AMOUNT,
  RETIREMENT_AGE,
  MIN_WORKING_AGE,
  TermConfig,
} from './schedule';
import { PayslipInput, QualificationResult, TermResult, LoanType } from './types';

/**
 * Calculates complete months between two dates.
 * E.g., from today to retirement date.
 */
export function calculateMonthsBetween(from: Date, to: Date): number {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

/**
 * Forward formula: (Loan Amount P, Term T) -> Monthly Installment
 * Installment(P, T) = P * ( 1/T + InterestRate(T) + InsuranceRate(T)/T ) + LedgerFee(T)
 */
export function calculateInstallment(principal: number, config: TermConfig): number {
  if (config.term <= 0) return 0;
  const termFactor = 1 / config.term + config.interestRate + config.insuranceRate / config.term;
  return principal * termFactor + config.ledgerFee;
}

/**
 * Inverse formula: (Ability A, Term T) -> Max Loan Amount P
 * MaxLoanAmount(A, T) = (A - LedgerFee(T)) / ( 1/T + InterestRate(T) + InsuranceRate(T)/T )
 */
export function calculateRawLoanAmount(ability: number, config: TermConfig): number {
  if (config.term <= 0) return 0;
  const netAbility = ability - config.ledgerFee;
  if (netAbility <= 0) return 0;
  const termFactor = 1 / config.term + config.interestRate + config.insuranceRate / config.term;
  return netAbility / termFactor;
}

/**
 * Calculates monthly repayment capacity (Ability) from payslip inputs:
 *
 * if (hasAllowanceArrears) {
 *   newNetSalary = netSalary - allowanceArrears
 *   ability = newNetSalary - (basicSalary / 3)
 * } else {
 *   ability = netSalary - (basicSalary / 3)
 * }
 */
export function calculateAbility(
  netSalary: number,
  basicSalary: number,
  hasAllowanceArrears: boolean,
  allowanceArrears: number
): { ability: number; newNetSalary: number } {
  const safeBasic = Math.max(0, basicSalary);
  const safeNet = Math.max(0, netSalary);
  const safeArrears = hasAllowanceArrears ? Math.max(0, allowanceArrears) : 0;

  const newNetSalary = safeNet - safeArrears;
  const ability = newNetSalary - safeBasic / 3;

  return { ability, newNetSalary };
}

/**
 * Computes retirement cutoff from client age in whole years:
 * yearsToRetirement  = retirementAge - age
 * monthsToRetirement = yearsToRetirement * 12
 * maxAllowedTerm     = monthsToRetirement - 3
 *
 * Deliberate simplification per Section 5.3: Age is entered directly in whole years
 * (no date picker or date-of-birth calculation).
 *
 * // CONFIRM WITH TIJAARA: Retirement age defaults to 60.
 */
export function calculateRetirementCutoff(
  age: number,
  retirementAge: number = RETIREMENT_AGE // CONFIRM WITH TIJAARA
): {
  yearsToRetirement: number;
  monthsToRetirement: number;
  maxAllowedTerm: number;
  isWithin3Months: boolean;
  age: number;
} {
  const safeAge = Math.floor(age);
  const yearsToRetirement = retirementAge - safeAge;
  const monthsToRetirement = yearsToRetirement * 12;
  const maxAllowedTerm = monthsToRetirement - 3;

  return {
    yearsToRetirement,
    monthsToRetirement,
    maxAllowedTerm,
    isWithin3Months: maxAllowedTerm < 3,
    age: safeAge,
  };
}

/**
 * Conventional loan calculator per term.
 * Separate function identity preserved per section 2.7 to allow independent logic divergence later.
 */
export function calculateConventionalLoan(
  ability: number,
  config: TermConfig,
  maxAllowedTerm: number
): TermResult {
  return calculateTermResult(ability, config, maxAllowedTerm);
}

/**
 * Sharia-compliant loan calculator per term.
 * Separate function identity preserved per section 2.7 to allow independent logic divergence later.
 */
export function calculateShariaLoan(
  ability: number,
  config: TermConfig,
  maxAllowedTerm: number
): TermResult {
  return calculateTermResult(ability, config, maxAllowedTerm);
}

/**
 * Core per-term computation helper.
 */
function calculateTermResult(
  ability: number,
  config: TermConfig,
  maxAllowedTerm: number
): TermResult {
  const isAllowedByRetirement = config.term <= maxAllowedTerm;
  const rawAmount = calculateRawLoanAmount(ability, config);

  // Viability checks
  const isViableByFee = ability > config.ledgerFee && rawAmount > 0;

  // CONFIRM WITH TIJAARA: Option (a) - exclude terms where computed amount < 5,000
  const meetsMinFloor = rawAmount >= MIN_LOAN_AMOUNT; // CONFIRM WITH TIJAARA

  const isViable = isViableByFee && meetsMinFloor;

  // Loan amount clamped to 3,000,000 ceiling. Subject to section 2.5: no rounding.
  const maxLoanAmount = Math.min(rawAmount, MAX_LOAN_AMOUNT);

  // Processing fee wired into calculation (currently 0% for all terms)
  const processingFeeAmount = maxLoanAmount * config.processingFeeRate;
  const netDisbursedPrincipal = maxLoanAmount - processingFeeAmount;

  // Monthly repayment is the client's ability (or forward installment if clamped down to 3,000,000)
  const monthlyRepayment =
    rawAmount > MAX_LOAN_AMOUNT
      ? calculateInstallment(MAX_LOAN_AMOUNT, config)
      : ability;

  let disqualificationReason: string | undefined;
  if (!isAllowedByRetirement) {
    disqualificationReason = `Exceeds retirement cutoff (max allowed term: ${maxAllowedTerm} months)`;
  } else if (!isViableByFee) {
    disqualificationReason = `Repayment capacity is less than term ledger fee (${config.ledgerFee})`;
  } else if (!meetsMinFloor) {
    disqualificationReason = `Computed amount (${Math.round(rawAmount)}) is below minimum loan floor (${MIN_LOAN_AMOUNT.toLocaleString()})`;
  }

  return {
    term: config.term,
    interestOrProfitRate: config.interestRate,
    insuranceRate: config.insuranceRate,
    ledgerFee: config.ledgerFee,
    processingFeeRate: config.processingFeeRate,
    maxLoanAmount,
    monthlyRepayment,
    netDisbursedPrincipal,
    isAllowedByRetirement,
    isViable,
    disqualificationReason,
  };
}

/**
 * Evaluates loan qualification for all 13 terms and business rules.
 */
export function evaluateLoanQualification(
  input: PayslipInput
): QualificationResult {
  const { basicSalary, netSalary, hasAllowanceArrears, allowanceArrears, loanType } = input;

  // Age in whole years (fallback to DOB if provided)
  const clientAge =
    input.age !== undefined
      ? input.age
      : input.dateOfBirth
      ? Math.max(0, Math.floor((new Date().getTime() - new Date(input.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000)))
      : 0;

  // Compute ability
  const { ability, newNetSalary } = calculateAbility(
    netSalary,
    basicSalary,
    hasAllowanceArrears,
    allowanceArrears
  );

  // Retirement cutoff evaluation per Section 5.3
  const { yearsToRetirement, monthsToRetirement, maxAllowedTerm, isWithin3Months } =
    calculateRetirementCutoff(clientAge);

  const baseResult = {
    ability,
    newNetSalary,
    hadArrears: hasAllowanceArrears,
    allowanceArrears: hasAllowanceArrears ? allowanceArrears : 0,
    basicSalary,
    netSalary,
    age: clientAge,
    dob: input.dateOfBirth,
    loanType,
    yearsToRetirement,
    monthsToRetirement,
    maxAllowedTerm,
  };

  // 1. Age validation: must be whole number in sane working range [18, 100]
  if (clientAge < MIN_WORKING_AGE) {
    return {
      ...baseResult,
      qualified: false,
      rejectionType: 'INVALID_INPUT',
      rejectionReason: `Client age must be at least ${MIN_WORKING_AGE} years old.`,
      viableTerms: [],
      disallowedTerms: [],
    };
  }

  if (clientAge > 100) {
    return {
      ...baseResult,
      qualified: false,
      rejectionType: 'INVALID_INPUT',
      rejectionReason: 'Please enter a valid client age (maximum 100).',
      viableTerms: [],
      disallowedTerms: [],
    };
  }

  // 2. Outright rejection if ability < 371
  if (ability < MIN_ABILITY) {
    return {
      ...baseResult,
      qualified: false,
      rejectionType: 'LOW_ABILITY',
      rejectionReason: `Computed repayment ability (${ability.toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}) is below the minimum required threshold of ${MIN_ABILITY.toLocaleString('en-KE')}.`,
      viableTerms: [],
      disallowedTerms: [],
    };
  }

  // 3. Outright rejection if ability > 78,887 (hard ceiling, not a cap)
  if (ability > MAX_ABILITY) {
    return {
      ...baseResult,
      qualified: false,
      rejectionType: 'HIGH_ABILITY',
      rejectionReason: `Computed repayment ability (${ability.toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}) exceeds the maximum allowable threshold of ${MAX_ABILITY.toLocaleString('en-KE')}. Per policy, this application cannot proceed.`,
      viableTerms: [],
      disallowedTerms: [],
    };
  }

  // 4. Retirement cutoff rule check: if maxAllowedTerm < 3, client is ineligible for any new loan
  if (isWithin3Months) {
    return {
      ...baseResult,
      qualified: false,
      rejectionType: 'RETIREMENT_CUTOFF',
      rejectionReason:
        'Client is within 3 months of retirement and cannot be issued a new loan per policy.',
      viableTerms: [],
      disallowedTerms: [],
    };
  }

  // 5. Evaluate all 13 terms
  const allTerms: TermResult[] = APPROVED_TERMS.map((config) => {
    return loanType === 'sharia'
      ? calculateShariaLoan(ability, config, maxAllowedTerm)
      : calculateConventionalLoan(ability, config, maxAllowedTerm);
  });

  // Segregate viable terms and disallowed terms
  const viableTerms = allTerms.filter((t) => t.isViable && t.isAllowedByRetirement);
  const disallowedTerms = allTerms.filter((t) => !t.isViable || !t.isAllowedByRetirement);

  if (viableTerms.length === 0) {
    return {
      ...baseResult,
      qualified: false,
      rejectionType: 'LOW_ABILITY',
      rejectionReason:
        'No approved loan terms meet both the repayment viability and retirement cutoff criteria.',
      viableTerms: [],
      disallowedTerms,
    };
  }

  // Find maximum available loan (longest allowed, viable term)
  // Since terms are in ascending order, the last viable term is the longest term
  const longestViable = viableTerms[viableTerms.length - 1];

  return {
    ...baseResult,
    qualified: true,
    viableTerms,
    disallowedTerms,
    maxAvailableLoan: {
      term: longestViable.term,
      amount: longestViable.maxLoanAmount,
      installment: longestViable.monthlyRepayment,
    },
  };
}
