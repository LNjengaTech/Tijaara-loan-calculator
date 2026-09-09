import {
  calculateAbility,
  calculateInstallment,
  calculateRawLoanAmount,
  calculateRetirementCutoff,
  evaluateLoanQualification,
} from '../lib/calculations';
import { APPROVED_TERMS, MIN_ABILITY, MAX_ABILITY } from '../lib/schedule';

describe('Tijaara Loan Calculations', () => {
  describe('Ability Calculation', () => {
    test('calculates ability without arrears: net - (basic / 3)', () => {
      // Basic 30,000, Net 25,000 => ability = 25,000 - 10,000 = 15,000
      const res = calculateAbility(25000, 30000, false, 0);
      expect(res.newNetSalary).toBe(25000);
      expect(res.ability).toBe(15000);
    });

    test('calculates ability with allowance arrears: (net - arrears) - (basic / 3)', () => {
      // Basic 30,000, Net 25,000, Arrears 5,000 => newNet = 20,000 => ability = 20,000 - 10,000 = 10,000
      const res = calculateAbility(25000, 30000, true, 5000);
      expect(res.newNetSalary).toBe(20000);
      expect(res.ability).toBe(10000);
    });
  });

  describe('Boundary Conditions for Ability', () => {
    const defaultInput = {
      basicSalary: 30000,
      netSalary: 10370, // 10370 - 10000 = 370 (< 371)
      hasAllowanceArrears: false,
      allowanceArrears: 0,
      age: 35,
      loanType: 'conventional' as const,
    };

    test('rejects ability just below 371', () => {
      const res = evaluateLoanQualification(
        { ...defaultInput, netSalary: 10370, basicSalary: 30000 }
      );
      expect(res.qualified).toBe(false);
      expect(res.rejectionType).toBe('LOW_ABILITY');
      expect(res.ability).toBe(370);
    });

    test('accepts ability at or above 371', () => {
      const res = evaluateLoanQualification(
        { ...defaultInput, netSalary: 10371, basicSalary: 30000 }
      );
      expect(res.qualified).toBe(true);
      expect(res.ability).toBe(371);
    });

    test('rejects ability just above 78,887', () => {
      // Net 88888, Basic 30000 => ability = 88888 - 10000 = 78888 (> 78887)
      const res = evaluateLoanQualification(
        { ...defaultInput, netSalary: 88888, basicSalary: 30000 }
      );
      expect(res.qualified).toBe(false);
      expect(res.rejectionType).toBe('HIGH_ABILITY');
    });

    test('accepts ability at or below 78,887', () => {
      // Net 88887, Basic 30000 => ability = 78887
      const res = evaluateLoanQualification(
        { ...defaultInput, netSalary: 88887, basicSalary: 30000 }
      );
      expect(res.qualified).toBe(true);
      expect(res.ability).toBe(78887);
    });
  });

  describe('Retirement Cutoff Rule (Section 5.3)', () => {
    test('correctly computes retirement cutoff for age 30', () => {
      // Age 30 => retirement at 60 (30 years = 360 months)
      // maxAllowedTerm = 360 - 3 = 357 months (allows all 13 terms)
      const res = calculateRetirementCutoff(30, 60);
      expect(res.yearsToRetirement).toBe(30);
      expect(res.monthsToRetirement).toBe(360);
      expect(res.maxAllowedTerm).toBe(357);
      expect(res.isWithin3Months).toBe(false);
    });

    test('restricts terms when retirement is near (e.g. age 58)', () => {
      // Age 58 => 2 years = 24 months to retirement
      // maxAllowedTerm = 24 - 3 = 21 months
      const res = calculateRetirementCutoff(58, 60);
      expect(res.yearsToRetirement).toBe(2);
      expect(res.monthsToRetirement).toBe(24);
      expect(res.maxAllowedTerm).toBe(21);

      const evalRes = evaluateLoanQualification({
        basicSalary: 30000,
        netSalary: 30000,
        hasAllowanceArrears: false,
        allowanceArrears: 0,
        age: 58,
        loanType: 'conventional',
      });
      expect(evalRes.qualified).toBe(true);
      // Terms <= 21: [3, 6, 12, 18]
      expect(evalRes.viableTerms.map((t) => t.term)).toEqual([3, 6, 12, 18]);
      // Disallowed terms: [24, 36, 48, 60, 72, 84, 96, 108, 120]
      expect(evalRes.disallowedTerms.map((t) => t.term)).toEqual([
        24, 36, 48, 60, 72, 84, 96, 108, 120,
      ]);
    });

    test('rejects client within 3 months of retirement (e.g. age 60)', () => {
      // Age 60 => 0 months to retirement
      // maxAllowedTerm = 0 - 3 = -3 (< 3)
      const res = calculateRetirementCutoff(60, 60);
      expect(res.isWithin3Months).toBe(true);
      expect(res.maxAllowedTerm).toBeLessThan(3);

      const evalRes = evaluateLoanQualification({
        basicSalary: 30000,
        netSalary: 30000,
        hasAllowanceArrears: false,
        allowanceArrears: 0,
        age: 60,
        loanType: 'conventional',
      });
      expect(evalRes.qualified).toBe(false);
      expect(evalRes.rejectionType).toBe('RETIREMENT_CUTOFF');
      expect(evalRes.rejectionReason).toContain('within 3 months of retirement');
    });

    test('rejects client under minimum working age (18)', () => {
      const evalRes = evaluateLoanQualification({
        basicSalary: 30000,
        netSalary: 30000,
        hasAllowanceArrears: false,
        allowanceArrears: 0,
        age: 17,
        loanType: 'conventional',
      });
      expect(evalRes.qualified).toBe(false);
      expect(evalRes.rejectionType).toBe('INVALID_INPUT');
    });
  });

  describe('Known Schedule Values Verification', () => {
    const term120 = APPROVED_TERMS.find((t) => t.term === 120)!;

    test('Ability that yields exactly 5,000 at 120 months -> installment 371.06', () => {
      const installment = calculateInstallment(5000, term120);
      expect(installment.toFixed(2)).toBe('371.06');

      // Check inverse
      const rawLoan = calculateRawLoanAmount(installment, term120);
      expect(Math.round(rawLoan)).toBe(5000);
    });

    test('Ability that yields exactly 2,300,000 at 120 months -> installment 78,886.83', () => {
      const installment = calculateInstallment(2300000, term120);
      expect(installment.toFixed(2)).toBe('78886.83');

      // Check inverse
      const rawLoan = calculateRawLoanAmount(installment, term120);
      expect(Math.round(rawLoan)).toBe(2300000);
    });

    test('3-month term with 10,000 principal produces exact installment', () => {
      const term3 = APPROVED_TERMS.find((t) => t.term === 3)!;
      // Formula: 10000 * (1/3 + 0.10 + 0.025/3) + 150
      // 1/3 + 0.10 + 0.0083333 = 0.44166667
      // 10000 * 0.44166667 = 4416.67 + 150 = 4566.67
      const installment = calculateInstallment(10000, term3);
      expect(installment.toFixed(2)).toBe('4566.67');

      const rawAmount = calculateRawLoanAmount(installment, term3);
      expect(Math.round(rawAmount)).toBe(10000);
    });

    test('12-month term with 50,000 principal produces exact installment', () => {
      const term12 = APPROVED_TERMS.find((t) => t.term === 12)!;
      // Formula: 50000 * (1/12 + 0.075 + 0.025/12) + 150
      // 1/12 = 0.083333; 0.025/12 = 0.0020833; sum = 0.16041667
      // 50000 * 0.16041667 = 8020.83 + 150 = 8170.83
      const installment = calculateInstallment(50000, term12);
      expect(installment.toFixed(2)).toBe('8170.83');

      const rawAmount = calculateRawLoanAmount(installment, term12);
      expect(Math.round(rawAmount)).toBe(50000);
    });

    test('Clamping at 3,000,000 loan ceiling', () => {
      // Very high ability below 78887 e.g. 75000 at 120 months
      const term120 = APPROVED_TERMS.find((t) => t.term === 120)!;
      const raw = calculateRawLoanAmount(75000, term120);
      expect(raw).toBeGreaterThan(2000000);

      const res = evaluateLoanQualification({
        basicSalary: 10000,
        netSalary: 78000,
        hasAllowanceArrears: false,
        allowanceArrears: 0,
        age: 35,
        loanType: 'conventional',
      });
      expect(res.qualified).toBe(true);
      // All loan amounts in viableTerms should be <= 3,000,000
      res.viableTerms.forEach((t) => {
        expect(t.maxLoanAmount).toBeLessThanOrEqual(3000000);
      });
    });
  });
});
