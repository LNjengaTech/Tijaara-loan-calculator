export type LoanType = 'conventional' | 'sharia';

export interface CreditFacility {
  id: string;
  lenderName?: string;
  outstandingBalance: number;
  monthlyInstallment: number;
}

export interface CreditFacilityResult extends CreditFacility {
  buyOffAmount: number; // (outstandingBalance / 3) + monthlyInstallment
}

export interface PayslipInput {
  basicSalary: number;
  netSalary: number;
  hasAllowanceArrears: boolean;
  allowanceArrears: number;
  dateOfBirth: string; // YYYY-MM-DD
  loanType: LoanType;
  hasCreditFacility?: boolean;
  creditFacilities?: CreditFacility[];
}

export interface TermResult {
  term: number; // months
  interestOrProfitRate: number; // decimal e.g. 0.10
  insuranceRate: number;
  ledgerFee: number;
  processingFeeRate: number;
  maxLoanAmount: number;
  monthlyRepayment: number; // equal to ability (or forward installment if clamped)
  netDisbursedPrincipal: number; // after processing fee
  isAllowedByRetirement: boolean;
  isViable: boolean;
  disqualificationReason?: string;
}

export interface BuyOffTermResult extends TermResult {
  buyOffLoanAmount: number;
  totalBuyOffAmount: number;
  qualifies: boolean; // buyOffLoanAmount >= totalBuyOffAmount
  surplusAmount: number; // buyOffLoanAmount - totalBuyOffAmount
}

export interface QualificationResult {
  qualified: boolean;
  ability: number;
  newNetSalary: number;
  hadArrears: boolean;
  allowanceArrears: number;
  basicSalary: number;
  netSalary: number;
  dob: string;
  loanType: LoanType;
  retirementDate: string;
  monthsToRetirement: number;
  maxAllowedTerm: number;
  rejectionReason?: string;
  rejectionType?: 'LOW_ABILITY' | 'HIGH_ABILITY' | 'RETIREMENT_CUTOFF' | 'INVALID_INPUT';
  viableTerms: TermResult[];
  disallowedTerms: TermResult[]; // Terms disallowed by retirement or minimum floor
  maxAvailableLoan?: {
    term: number;
    amount: number;
    installment: number;
  };
}

export interface BuyOffQualificationResult {
  qualified: boolean;
  firstAbility: number; // Can be negative
  newNetSalary: number;
  basicSalary: number;
  netSalary: number;
  hadArrears: boolean;
  allowanceArrears: number;
  dob: string;
  loanType: LoanType;
  retirementDate: string;
  monthsToRetirement: number;
  maxAllowedTerm: number;
  facilities: CreditFacilityResult[];
  totalBuyOffAmount: number; // Sum of buyOffAmount_i
  totalInstallments: number; // Sum of installment_i
  buyOffAbility: number; // Ability calculated for buy-off
  rejectionReason?: string;
  rejectionType?: 'NO_QUALIFYING_TERMS' | 'RETIREMENT_CUTOFF' | 'INVALID_INPUT';
  qualifyingTerms: BuyOffTermResult[]; // Terms where buyOffLoanAmount >= totalBuyOffAmount and viable
  disqualifiedTerms: BuyOffTermResult[]; // Terms that did not qualify or disallowed by retirement
  maxAvailableLoan?: {
    term: number;
    amount: number;
    installment: number;
    surplus: number;
  };
}

