// tests/buyOff.test.ts
// Phase 2: Buy-Off Calculation Unit Tests

import {
  calculateFirstAbility,
  calculateSingleFacilityBuyOff,
  calculateTotalFacilities,
  calculateBuyOffAbility,
  calculateBuyOffTermResult,
  evaluateBuyOffQualification,
} from '../lib/buyOff';
import { APPROVED_TERMS } from '../lib/schedule';
import { CreditFacility } from '../lib/types';

describe('Tijaara Phase 2: Buy-Off Calculations', () => {
  describe('Single Facility Buy-Off Amount', () => {
    test('verifies exact worked example from spec: balance 200,753 and installment 1,687 -> 68,604.67', () => {
      const facility: CreditFacility = {
        id: '1',
        lenderName: 'Platinum Credit',
        outstandingBalance: 200753,
        monthlyInstallment: 1687,
      };

      const result = calculateSingleFacilityBuyOff(facility);

      // (200,753 / 3) + 1,687 = 66,917.6666... + 1,687 = 68,604.6666...
      expect(result.buyOffAmount).toBeCloseTo(68604.67, 2);
      expect(result.buyOffAmount.toFixed(2)).toBe('68604.67');
      expect(result.outstandingBalance).toBe(200753);
      expect(result.monthlyInstallment).toBe(1687);
    });

    test('handles zero balance or zero installment correctly', () => {
      const facility: CreditFacility = {
        id: '2',
        lenderName: 'Test Credit',
        outstandingBalance: 30000,
        monthlyInstallment: 0,
      };
      const result = calculateSingleFacilityBuyOff(facility);
      expect(result.buyOffAmount).toBe(10000);
    });
  });

  describe('Summation Across Multiple Facilities', () => {
    test('correctly aggregates multiple commercial credit facilities', () => {
      const facilities: CreditFacility[] = [
        {
          id: '1',
          lenderName: 'Platinum Credit',
          outstandingBalance: 200753,
          monthlyInstallment: 1687,
        },
        {
          id: '2',
          lenderName: 'Izwe Loans',
          outstandingBalance: 60000,
          monthlyInstallment: 3000,
        },
      ];

      const { totalBuyOffAmount, totalInstallments, facilityResults } =
        calculateTotalFacilities(facilities);

      expect(facilityResults.length).toBe(2);
      // Facility 1: 68604.6667
      // Facility 2: (60,000 / 3) + 3,000 = 23,000
      // Total: 91,604.6667
      expect(totalBuyOffAmount).toBeCloseTo(91604.67, 2);
      // Total installments: 1,687 + 3,000 = 4,687
      expect(totalInstallments).toBe(4687);
    });
  });

  describe('First Ability Calculation', () => {
    test('produces positive first ability when net > basic / 3', () => {
      const res = calculateFirstAbility(35000, 30000, false, 0);
      // 35,000 - 10,000 = 25,000
      expect(res.firstAbility).toBe(25000);
    });

    test('produces negative first ability when net < basic / 3', () => {
      const res = calculateFirstAbility(5000, 30000, false, 0);
      // 5,000 - 10,000 = -5,000
      expect(res.firstAbility).toBe(-5000);
    });

    test('deducts allowance arrears before first ability calculation', () => {
      const res = calculateFirstAbility(30000, 30000, true, 8000);
      // newNet = 22,000. firstAbility = 22,000 - 10,000 = 12,000
      expect(res.newNetSalary).toBe(22000);
      expect(res.firstAbility).toBe(12000);
    });
  });

  describe('Buy Off Ability Logic', () => {
    test('when firstAbility is negative: uses totalInstallments only', () => {
      const firstAbility = -4500;
      const totalInstallments = 6000;
      const buyOffAbility = calculateBuyOffAbility(firstAbility, totalInstallments);
      expect(buyOffAbility).toBe(6000);
    });

    test('when firstAbility is positive: adds firstAbility + totalInstallments', () => {
      const firstAbility = 12000;
      const totalInstallments = 4000;
      const buyOffAbility = calculateBuyOffAbility(firstAbility, totalInstallments);
      expect(buyOffAbility).toBe(16000);
    });

    test('at firstAbility === 0 boundary: both branches agree', () => {
      const totalInstallments = 5000;
      // if evaluated with firstAbility = 0: 0 + 5000 = 5000
      const buyOffAbility = calculateBuyOffAbility(0, totalInstallments);
      expect(buyOffAbility).toBe(5000);
    });
  });

  describe('Per-Term Qualification', () => {
    const term120 = APPROVED_TERMS.find((t) => t.term === 120)!;

    test('qualifies when buyOffLoanAmount >= totalBuyOffAmount', () => {
      // Ability 5,000 at 120 months gives ~150,000+ loan
      const totalBuyOffAmount = 68604.67;
      const result = calculateBuyOffTermResult(5000, term120, 120, totalBuyOffAmount);

      expect(result.buyOffLoanAmount).toBeGreaterThan(totalBuyOffAmount);
      expect(result.qualifies).toBe(true);
      expect(result.surplusAmount).toBe(result.buyOffLoanAmount - totalBuyOffAmount);
    });

    test('disqualifies when buyOffLoanAmount < totalBuyOffAmount', () => {
      const totalBuyOffAmount = 500000; // very high debt
      const result = calculateBuyOffTermResult(2000, term120, 120, totalBuyOffAmount);

      expect(result.buyOffLoanAmount).toBeLessThan(totalBuyOffAmount);
      expect(result.qualifies).toBe(false);
      expect(result.disqualificationReason).toContain('less than required settlement');
    });
  });

  describe('Full Evaluation Flow', () => {
    test('qualifying case: client qualifies for buy-off with spec values', () => {
      const result = evaluateBuyOffQualification(
        {
          basicSalary: 30000,
          netSalary: 25000,
          hasAllowanceArrears: false,
          allowanceArrears: 0,
          age: 41, // Ample months to retirement
          loanType: 'conventional',
          hasCreditFacility: true,
          creditFacilities: [
            {
              id: '1',
              lenderName: 'Platinum Credit',
              outstandingBalance: 200753,
              monthlyInstallment: 1687,
            },
          ],
        }
      );

      expect(result.qualified).toBe(true);
      expect(result.firstAbility).toBe(15000); // 25,000 - 10,000
      expect(result.totalInstallments).toBe(1687);
      expect(result.buyOffAbility).toBe(16687); // 15,000 + 1,687
      expect(result.totalBuyOffAmount).toBeCloseTo(68604.67, 2);
      expect(result.qualifyingTerms.length).toBeGreaterThan(0);
      expect(result.maxAvailableLoan).toBeDefined();
      expect(result.maxAvailableLoan?.amount).toBeGreaterThan(result.totalBuyOffAmount);
    });

    test('fully disqualifying case: no term reaches totalBuyOffAmount even at 120 months', () => {
      // Very high debt relative to small buyOffAbility
      const result = evaluateBuyOffQualification(
        {
          basicSalary: 30000,
          netSalary: 1000, // Very low net
          hasAllowanceArrears: false,
          allowanceArrears: 0,
          age: 41,
          loanType: 'conventional',
          hasCreditFacility: true,
          creditFacilities: [
            {
              id: '1',
              lenderName: 'Commercial Lender',
              outstandingBalance: 900000, // 300,000 + 500 = 300,500 needed
              monthlyInstallment: 500, // buyOffAbility = 500 (since firstAbility is negative)
            },
          ],
        }
      );

      expect(result.qualified).toBe(false);
      expect(result.rejectionType).toBe('NO_QUALIFYING_TERMS');
      expect(result.qualifyingTerms.length).toBe(0);
      expect(result.rejectionReason).toContain('insufficient to cover the required total debt settlement');
    });

    test('retirement cutoff disqualification when within 3 months of retirement', () => {
      const result = evaluateBuyOffQualification(
        {
          basicSalary: 30000,
          netSalary: 25000,
          hasAllowanceArrears: false,
          allowanceArrears: 0,
          age: 60, // At retirement age
          loanType: 'conventional',
          hasCreditFacility: true,
          creditFacilities: [
            {
              id: '1',
              lenderName: 'Platinum Credit',
              outstandingBalance: 50000,
              monthlyInstallment: 2000,
            },
          ],
        }
      );

      expect(result.qualified).toBe(false);
      expect(result.rejectionType).toBe('RETIREMENT_CUTOFF');
      expect(result.rejectionReason).toContain('within 3 months of retirement');
    });

    test('invalid input when no credit facilities entered in buy-off mode', () => {
      const result = evaluateBuyOffQualification(
        {
          basicSalary: 30000,
          netSalary: 25000,
          hasAllowanceArrears: false,
          allowanceArrears: 0,
          age: 41,
          loanType: 'conventional',
          hasCreditFacility: true,
          creditFacilities: [],
        }
      );

      expect(result.qualified).toBe(false);
      expect(result.rejectionType).toBe('INVALID_INPUT');
    });
  });
});
