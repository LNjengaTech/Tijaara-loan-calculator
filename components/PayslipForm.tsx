'use client';

import React, { useState } from 'react';
import { PayslipInput, LoanType, CreditFacility } from '@/lib/types';
import { CURRENCY, MIN_WORKING_AGE } from '@/lib/schedule';
import BuyOffForm from '@/components/BuyOffForm';

interface PayslipFormProps {
  onSubmit: (input: PayslipInput) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export default function PayslipForm({ onSubmit, onReset, isLoading = false }: PayslipFormProps) {
  const [basicSalary, setBasicSalary] = useState<string>('');
  const [netSalary, setNetSalary] = useState<string>('');
  const [hasAllowanceArrears, setHasAllowanceArrears] = useState<boolean>(false);
  const [allowanceArrears, setAllowanceArrears] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [loanType, setLoanType] = useState<LoanType>('conventional');

  // Phase 2: Buy-Off State
  const [hasCreditFacility, setHasCreditFacility] = useState<boolean>(false);
  const [creditFacilities, setCreditFacilities] = useState<CreditFacility[]>([
    { id: '1', lenderName: '', outstandingBalance: 0, monthlyInstallment: 0 },
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calculate max allowable DOB (must be at least 18 years ago)
  const today = new Date();
  const maxDobDate = new Date(today.getFullYear() - MIN_WORKING_AGE, today.getMonth(), today.getDate());
  const maxDobString = maxDobDate.toISOString().split('T')[0];
  const minDobString = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const basicNum = parseFloat(basicSalary);
    if (!basicSalary || isNaN(basicNum)) {
      newErrors.basicSalary = 'Basic salary is required.';
    } else if (basicNum <= 0) {
      newErrors.basicSalary = 'Basic salary must be greater than zero.';
    }

    const netNum = parseFloat(netSalary);
    if (!netSalary || isNaN(netNum)) {
      newErrors.netSalary = 'Net salary is required.';
    } else if (netNum <= 0) {
      newErrors.netSalary = 'Net salary must be greater than zero.';
    }

    if (hasAllowanceArrears) {
      const arrearsNum = parseFloat(allowanceArrears);
      if (!allowanceArrears || isNaN(arrearsNum)) {
        newErrors.allowanceArrears = 'Arrears amount is required when enabled.';
      } else if (arrearsNum < 0) {
        newErrors.allowanceArrears = 'Arrears amount cannot be negative.';
      } else if (netNum && arrearsNum >= netNum) {
        newErrors.allowanceArrears = 'Arrears cannot be greater than or equal to net salary.';
      }
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required.';
    } else {
      const dobDate = new Date(dateOfBirth);
      if (isNaN(dobDate.getTime())) {
        newErrors.dateOfBirth = 'Please enter a valid date.';
      } else if (dobDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future.';
      } else if (dobDate > maxDobDate) {
        newErrors.dateOfBirth = `Client must be at least ${MIN_WORKING_AGE} years old.`;
      }
    }

    // Phase 2: Credit facilities validation
    if (hasCreditFacility) {
      if (creditFacilities.length === 0) {
        newErrors.creditFacilities = 'Please add at least one credit facility.';
      } else {
        creditFacilities.forEach((fac, idx) => {
          if (!fac.outstandingBalance || fac.outstandingBalance <= 0) {
            newErrors[`facility_${fac.id}_balance`] = `Facility #${idx + 1}: Balance must be > 0.`;
          }
          if (!fac.monthlyInstallment || fac.monthlyInstallment <= 0) {
            newErrors[`facility_${fac.id}_installment`] = `Facility #${idx + 1}: Installment must be > 0.`;
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      basicSalary: parseFloat(basicSalary),
      netSalary: parseFloat(netSalary),
      hasAllowanceArrears,
      allowanceArrears: hasAllowanceArrears ? parseFloat(allowanceArrears) : 0,
      dateOfBirth,
      loanType,
      hasCreditFacility,
      creditFacilities: hasCreditFacility ? creditFacilities : [],
    });
  };

  const handleReset = () => {
    setBasicSalary('');
    setNetSalary('');
    setHasAllowanceArrears(false);
    setAllowanceArrears('');
    setDateOfBirth('');
    setLoanType('conventional');
    setHasCreditFacility(false);
    setCreditFacilities([{ id: '1', lenderName: '', outstandingBalance: 0, monthlyInstallment: 0 }]);
    setErrors({});
    onReset();
  };

  // Preset loader for quick branch testing
  const loadPreset = (preset: 'standard' | 'arrears' | 'nearRetirement' | 'sharia' | 'buyOff') => {
    setErrors({});
    if (preset === 'standard') {
      setBasicSalary('45000');
      setNetSalary('38000');
      setHasAllowanceArrears(false);
      setAllowanceArrears('');
      setDateOfBirth('1988-05-14');
      setLoanType('conventional');
      setHasCreditFacility(false);
    } else if (preset === 'arrears') {
      setBasicSalary('60000');
      setNetSalary('42000');
      setHasAllowanceArrears(true);
      setAllowanceArrears('8000');
      setDateOfBirth('1985-11-20');
      setLoanType('conventional');
      setHasCreditFacility(false);
    } else if (preset === 'nearRetirement') {
      // 58 years old
      const nearYear = today.getFullYear() - 58;
      setBasicSalary('50000');
      setNetSalary('45000');
      setHasAllowanceArrears(false);
      setAllowanceArrears('');
      setDateOfBirth(`${nearYear}-08-10`);
      setLoanType('conventional');
      setHasCreditFacility(false);
    } else if (preset === 'sharia') {
      setBasicSalary('55000');
      setNetSalary('48000');
      setHasAllowanceArrears(false);
      setAllowanceArrears('');
      setDateOfBirth('1992-03-25');
      setLoanType('sharia');
      setHasCreditFacility(false);
    } else if (preset === 'buyOff') {
      setBasicSalary('45000');
      setNetSalary('38000');
      setHasAllowanceArrears(false);
      setAllowanceArrears('');
      setDateOfBirth('1988-05-14');
      setLoanType('conventional');
      setHasCreditFacility(true);
      setCreditFacilities([
        {
          id: '1',
          lenderName: 'Platinum Credit',
          outstandingBalance: 200753,
          monthlyInstallment: 1687,
        },
      ]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:hidden">
      {/* Card Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-emerald-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Payslip Salary Details
          </h2>
          <p className="text-xs text-slate-500">
            Enter verified figures from client's latest payslip
          </p>
        </div>

        {/* Quick Presets for Loan Officer testing */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Sample Presets:</span>
          <button
            type="button"
            onClick={() => loadPreset('standard')}
            className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded transition"
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => loadPreset('arrears')}
            className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded transition"
          >
            With Arrears
          </button>
          <button
            type="button"
            onClick={() => loadPreset('nearRetirement')}
            className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded transition"
          >
            Age 58 (Cutoff)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('sharia')}
            className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-1 rounded transition"
          >
            Sharia
          </button>
          <button
            type="button"
            onClick={() => loadPreset('buyOff')}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold px-2 py-1 rounded transition"
          >
            Buy-Off Sample
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Loan Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Loan Product Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLoanType('conventional')}
              className={`p-3 rounded-lg border text-left flex items-start gap-3 transition ${
                loanType === 'conventional'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center ${
                  loanType === 'conventional'
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-slate-300'
                }`}
              >
                {loanType === 'conventional' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Conventional Loan</p>
                <p className="text-xs text-slate-500">Standard interest rate & ledger fee schedule</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLoanType('sharia')}
              className={`p-3 rounded-lg border text-left flex items-start gap-3 transition ${
                loanType === 'sharia'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center ${
                  loanType === 'sharia'
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-slate-300'
                }`}
              >
                {loanType === 'sharia' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Profit-Sharing / Sharia Loan</p>
                <p className="text-xs text-slate-500">Sharia-compliant terms with profit rate</p>
              </div>
            </button>
          </div>
        </div>

        {/* Salary Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Basic Salary */}
          <div>
            <label
              htmlFor="basicSalary"
              className="block text-sm font-semibold text-slate-800 mb-1"
            >
              Basic Salary ({CURRENCY}) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-medium text-sm">
                {CURRENCY}
              </span>
              <input
                id="basicSalary"
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 45000"
                value={basicSalary}
                onChange={(e) => {
                  setBasicSalary(e.target.value);
                  if (errors.basicSalary) setErrors({ ...errors, basicSalary: '' });
                }}
                className={`w-full pl-14 pr-3 py-2.5 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 transition text-sm ${
                  errors.basicSalary
                    ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                    : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-600'
                }`}
              />
            </div>
            {errors.basicSalary ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.basicSalary}</p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">1/3rd is deducted per policy</p>
            )}
          </div>

          {/* Net Salary */}
          <div>
            <label
              htmlFor="netSalary"
              className="block text-sm font-semibold text-slate-800 mb-1"
            >
              Net Salary ({CURRENCY}) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-medium text-sm">
                {CURRENCY}
              </span>
              <input
                id="netSalary"
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 38000"
                value={netSalary}
                onChange={(e) => {
                  setNetSalary(e.target.value);
                  if (errors.netSalary) setErrors({ ...errors, netSalary: '' });
                }}
                className={`w-full pl-14 pr-3 py-2.5 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 transition text-sm ${
                  errors.netSalary
                    ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                    : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-600'
                }`}
              />
            </div>
            {errors.netSalary ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.netSalary}</p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">Take-home salary after statutory deductions</p>
            )}
          </div>
        </div>

        {/* Allowance Arrears Section */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Has Allowance Arrears?</p>
              <p className="text-xs text-slate-500">
                Check if any allowance arrears are currently owed on the payslip
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={hasAllowanceArrears}
                onClick={() => setHasAllowanceArrears(!hasAllowanceArrears)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
                  hasAllowanceArrears ? 'bg-emerald-700' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    hasAllowanceArrears ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-semibold text-slate-700 w-8">
                {hasAllowanceArrears ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {hasAllowanceArrears && (
            <div className="pt-2 border-t border-slate-200">
              <label
                htmlFor="allowanceArrears"
                className="block text-sm font-semibold text-slate-800 mb-1"
              >
                Allowance Arrears Amount ({CURRENCY}) <span className="text-red-500">*</span>
              </label>
              <div className="relative max-w-sm">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-medium text-sm">
                  {CURRENCY}
                </span>
                <input
                  id="allowanceArrears"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g. 5000"
                  value={allowanceArrears}
                  onChange={(e) => {
                    setAllowanceArrears(e.target.value);
                    if (errors.allowanceArrears) setErrors({ ...errors, allowanceArrears: '' });
                  }}
                  className={`w-full pl-14 pr-3 py-2 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 transition text-sm ${
                    errors.allowanceArrears
                      ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                      : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-600'
                  }`}
                />
              </div>
              {errors.allowanceArrears ? (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.allowanceArrears}</p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  Arrears will be deducted from Net Salary before computing ability
                </p>
              )}
            </div>
          )}
        </div>

        {/* Phase 2: Buy-Off Credit Facilities Section */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Does the client have a credit facility to buy off?
              </p>
              <p className="text-xs text-slate-500">
                Settle client's existing commercial debts with a new Tijaara loan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={hasCreditFacility}
                onClick={() => setHasCreditFacility(!hasCreditFacility)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
                  hasCreditFacility ? 'bg-emerald-700' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    hasCreditFacility ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-semibold text-slate-700 w-8">
                {hasCreditFacility ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {hasCreditFacility && (
            <div className="pt-2 border-t border-slate-200">
              <BuyOffForm
                facilities={creditFacilities}
                onChange={setCreditFacilities}
                errors={errors}
              />
              {errors.creditFacilities && (
                <p className="text-xs text-red-600 mt-2 font-medium">{errors.creditFacilities}</p>
              )}
            </div>
          )}
        </div>

        {/* Date of Birth / Retirement Rule */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-slate-800 mb-1">
            Client Date of Birth <span className="text-red-500">*</span>
          </label>
          <div className="max-w-sm">
            <input
              id="dateOfBirth"
              type="date"
              max={maxDobString}
              min={minDobString}
              value={dateOfBirth}
              onChange={(e) => {
                setDateOfBirth(e.target.value);
                if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: '' });
              }}
              className={`w-full px-3 py-2.5 rounded-lg border bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 transition text-sm ${
                errors.dateOfBirth
                  ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                  : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-600'
              }`}
            />
          </div>
          {errors.dateOfBirth ? (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.dateOfBirth}</p>
          ) : (
            <p className="text-xs text-slate-500 mt-1">
              Enforces the 60-year retirement cutoff rule (max term = months to retirement - 3)
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition text-sm text-center cursor-pointer"
          >
            Clear / Reset
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm transition flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            {hasCreditFacility
              ? 'Compute Buy-Off Qualification & Schedule'
              : 'Compute Qualification & Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
}
