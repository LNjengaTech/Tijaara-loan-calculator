// lib/schedule.ts
// Single source of truth for the 13 approved loan terms and system constants.
// Do not duplicate these values elsewhere in the codebase.

/**
 * Currency configuration.
 * Configurable symbol and locale for standard display across the app.
 */
export const CURRENCY = 'KES';
export const CURRENCY_LOCALE = 'en-KE';

/**
 * Retirement age used for the cutoff rule (months to retirement).
 * // CONFIRM WITH TIJAARA: Default set to 60 years.
 */
export const RETIREMENT_AGE = 60; // CONFIRM WITH TIJAARA

/**
 * Minimum working age for date of birth validation.
 */
export const MIN_WORKING_AGE = 18;

/**
 * Ability boundaries:
 * - Below 371: Reject outright (floor).
 * - Above 78,887: Reject outright (ceiling).
 */
export const MIN_ABILITY = 371;
export const MAX_ABILITY = 78887;

/**
 * Minimum and maximum loan amount limits:
 * - Minimum loan amount: 5,000
 *   // CONFIRM WITH TIJAARA: Option (a) applied - terms with raw amount < 5,000 are excluded.
 * - Maximum loan ceiling: 3,000,000 (clamped).
 */
export const MIN_LOAN_AMOUNT = 5000; // CONFIRM WITH TIJAARA
export const MAX_LOAN_AMOUNT = 3000000;

export interface TermConfig {
  term: number; // in months
  interestRate: number; // decimal (e.g., 0.10 for 10.00%)
  insuranceRate: number; // decimal per annum pro-rated over term (e.g., 0.025 for 2.50%)
  ledgerFee: number; // fixed monthly ledger fee in KES
  processingFeeRate: number; // upfront deduction rate (currently 0)
}

/**
 * The 13 approved terms from the authoritative "New Schedule" tab.
 */
export const APPROVED_TERMS: readonly TermConfig[] = [
  { term: 3,   interestRate: 0.1000,  insuranceRate: 0.0250, ledgerFee: 150, processingFeeRate: 0 },
  { term: 6,   interestRate: 0.0850,  insuranceRate: 0.0250, ledgerFee: 150, processingFeeRate: 0 },
  { term: 12,  interestRate: 0.0750,  insuranceRate: 0.0250, ledgerFee: 150, processingFeeRate: 0 },
  { term: 18,  interestRate: 0.0600,  insuranceRate: 0.0375, ledgerFee: 150, processingFeeRate: 0 },
  { term: 24,  interestRate: 0.0500,  insuranceRate: 0.0500, ledgerFee: 150, processingFeeRate: 0 },
  { term: 36,  interestRate: 0.0450,  insuranceRate: 0.0750, ledgerFee: 150, processingFeeRate: 0 },
  { term: 48,  interestRate: 0.0400,  insuranceRate: 0.1000, ledgerFee: 150, processingFeeRate: 0 },
  { term: 60,  interestRate: 0.0350,  insuranceRate: 0.1250, ledgerFee: 150, processingFeeRate: 0 },
  { term: 72,  interestRate: 0.02181, insuranceRate: 0.1500, ledgerFee: 200, processingFeeRate: 0 },
  { term: 84,  interestRate: 0.02254, insuranceRate: 0.1750, ledgerFee: 200, processingFeeRate: 0 },
  { term: 96,  interestRate: 0.02322, insuranceRate: 0.1750, ledgerFee: 200, processingFeeRate: 0 },
  { term: 108, interestRate: 0.02384, insuranceRate: 0.1750, ledgerFee: 200, processingFeeRate: 0 },
  { term: 120, interestRate: 0.02442, insuranceRate: 0.1750, ledgerFee: 200, processingFeeRate: 0 },
] as const;
