'use client';

import React from 'react';
import { CreditFacility } from '@/lib/types';
import { CURRENCY } from '@/lib/schedule';

interface BuyOffFormProps {
  facilities: CreditFacility[];
  onChange: (facilities: CreditFacility[]) => void;
  errors?: { [key: string]: string };
}

export default function BuyOffForm({ facilities, onChange, errors = {} }: BuyOffFormProps) {
  const handleAddFacility = () => {
    const newFacility: CreditFacility = {
      id: Date.now().toString(),
      lenderName: '',
      outstandingBalance: 0,
      monthlyInstallment: 0,
    };
    onChange([...facilities, newFacility]);
  };

  const handleRemoveFacility = (id: string) => {
    if (facilities.length <= 1) return;
    onChange(facilities.filter((f) => f.id !== id));
  };

  const handleUpdateFacility = (
    id: string,
    field: keyof CreditFacility,
    value: string | number
  ) => {
    const updated = facilities.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          [field]: value,
        };
      }
      return f;
    });
    onChange(updated);
  };

  // Compute live aggregates for immediate officer feedback
  // const totalBalance = facilities.reduce((sum, f) => sum + (Number(f.outstandingBalance) || 0), 0);
  const totalInstallments = facilities.reduce((sum, f) => sum + (Number(f.monthlyInstallment) || 0), 0);
  const totalEstimatedBuyOff = facilities.reduce((sum, f) => {
    const bal = Number(f.outstandingBalance) || 0;
    const inst = Number(f.monthlyInstallment) || 0;
    return sum + (bal / 3 + inst);
  }, 0);

  const formatMoney = (val: number) =>
    val.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-4 pt-2">
      {/* Policy Warning & Instruction Notice */}
      {/* <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <svg
          className="w-5 h-5 text-amber-700 shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="space-y-1">
          <p className="font-bold text-amber-950">
            Commercial Credit Facilities Only (e.g. ComL: Platinum Credit)
          </p>
          <p className="text-amber-800 leading-relaxed">
            Only enter commercial credit facility deductions (payslip lines usually starting with{' '}
            <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">ComL:</code>).
            <span className="font-bold text-amber-950"> Bank loan deductions and scheme deductions must NEVER be entered</span> — they are strictly out of scope for buy-off.
          </p>
        </div>
      </div> */}

      {/* Facilities Repeatable Rows */}
      <div className="space-y-3">
        {facilities.map((facility, index) => {
          const rowEstimatedBuyOff =
            (Number(facility.outstandingBalance) || 0) / 3 +
            (Number(facility.monthlyInstallment) || 0);

          const balanceError = errors[`facility_${facility.id}_balance`];
          const installmentError = errors[`facility_${facility.id}_installment`];

          return (
            <div
              key={facility.id}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs relative transition hover:border-slate-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  Credit Facility #{index + 1}
                </span>

                {facilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFacility(facility.id)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Facility / Lender Name */}
                {/* <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lender / Facility Name <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Platinum Credit"
                    value={facility.lenderName || ''}
                    onChange={(e) => handleUpdateFacility(facility.id, 'lenderName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                  />
                </div> */}

                {/* Outstanding Balance */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Outstanding Balance ({CURRENCY}) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
                      {CURRENCY}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 200753"
                      value={facility.outstandingBalance === 0 ? '' : facility.outstandingBalance}
                      onChange={(e) =>
                        handleUpdateFacility(
                          facility.id,
                          'outstandingBalance',
                          e.target.value === '' ? 0 : parseFloat(e.target.value)
                        )
                      }
                      className={`w-full pl-12 pr-3 py-2 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 transition ${
                        balanceError
                          ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                          : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  {balanceError ? (
                    <p className="text-xs text-red-600 mt-1 font-medium">{balanceError}</p>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-0.5">Figure in brackets on payslip</p>
                  )}
                </div>

                {/* Monthly Installment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Installment ({CURRENCY}) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
                      {CURRENCY}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 1687"
                      value={facility.monthlyInstallment === 0 ? '' : facility.monthlyInstallment}
                      onChange={(e) =>
                        handleUpdateFacility(
                          facility.id,
                          'monthlyInstallment',
                          e.target.value === '' ? 0 : parseFloat(e.target.value)
                        )
                      }
                      className={`w-full pl-12 pr-3 py-2 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 transition ${
                        installmentError
                          ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                          : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  {installmentError ? (
                    <p className="text-xs text-red-600 mt-1 font-medium">{installmentError}</p>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-0.5">Deduction amount on payslip</p>
                  )}
                </div>
              </div>

              {/* Per-Facility Live Calculation Preview */}
              {(facility.outstandingBalance > 0 || facility.monthlyInstallment > 0) && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-1 bg-slate-50/60 p-2 rounded">
                  <div className="font-mono text-[11px]">
                    Estimated Buy-Off Amount = ({CURRENCY} {formatMoney(facility.outstandingBalance)} / 3) + {CURRENCY} {formatMoney(facility.monthlyInstallment)}
                  </div>
                  <div className="font-bold text-emerald-800 text-xs">
                    = {CURRENCY} {formatMoney(rowEstimatedBuyOff)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Row Button & Live Totals Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handleAddFacility}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-dashed border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold text-xs transition cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Credit Facility
        </button>

        {totalEstimatedBuyOff > 0 && (
          <div className="flex items-center gap-4 text-xs bg-emerald-50/80 border border-emerald-200 px-3.5 py-2 rounded-lg">
            <div>
              <span className="text-emerald-700 font-medium">Total Installments Released: </span>
              <span className="font-bold text-slate-900">{CURRENCY} {formatMoney(totalInstallments)}/mo</span>
            </div>
            <div className="border-l border-emerald-300 pl-4">
              <span className="text-emerald-700 font-medium">Total Debt to Clear: </span>
              <span className="font-black text-emerald-900">{CURRENCY} {formatMoney(totalEstimatedBuyOff)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
