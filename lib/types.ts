export type LoanType = 'conventional' | 'sharia';

export interface PayslipInput {
  basicSalary: number;
  netSalary: number;
  hasAllowanceArrears: boolean;
  allowanceArrears: number;
  dateOfBirth: string; // YYYY-MM-DD
  loanType: LoanType;
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
