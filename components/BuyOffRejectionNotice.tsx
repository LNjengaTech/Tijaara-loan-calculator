'use client';

import React from 'react';
import { BuyOffQualificationResult } from '@/lib/types';
import { CURRENCY } from '@/lib/schedule';

interface BuyOffRejectionNoticeProps {
  result: BuyOffQualificationResult;
  onEdit: () => void;
}

export default function BuyOffRejectionNotice({
  result,
  onEdit,
}: BuyOffRejectionNoticeProps) {
  const {
    firstAbility,
    newNetSalary,
    netSalary,
    basicSalary,
    hadArrears,
    allowanceArrears,
    facilities,
    totalBuyOffAmount,
    totalInstallments,
    buyOffAbility,
    rejectionReason,
    rejectionType,
    age,
    yearsToRetirement,
    monthsToRetirement,
    maxAllowedTerm,
  } = result;

  const formatMoney = (val: number) =>
    val.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden print:hidden">
      {/* Rejection Banner */}
      <div className="bg-red-50 border-b border-red-200 p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
          <svg
            className="w-6 h-6"
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
        </div>
        <div className="flex-1">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-200 text-red-800 mb-1">
            Buy-Off Status: Does Not Qualify
          </span>
          <h3 className="text-xl font-bold text-red-900">
            {rejectionType === 'NO_QUALIFYING_TERMS' && 'Insufficient Buy-Off Capacity for Debt Clearance'}
            {rejectionType === 'RETIREMENT_CUTOFF' && 'Ineligible Due to Retirement Cutoff Rule'}
            {rejectionType === 'INVALID_INPUT' && 'Eligibility Requirement Not Met'}
            {!rejectionType && 'Buy-Off Application Rejected'}
          </h3>
          <p className="text-sm text-red-700 mt-1 font-medium">{rejectionReason}</p>
        </div>
      </div>

      {/* Audit & Computation Breakdown */}
      <div className="p-6 space-y-5">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Buy-Off Assessment & Audit Breakdown
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500">Gross Net Salary</p>
            <p className="text-base font-bold text-slate-900">
              {CURRENCY} {formatMoney(netSalary)}
            </p>
          </div>

          {hadArrears && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500">Allowance Arrears Deducted</p>
              <p className="text-base font-bold text-amber-700">
                - {CURRENCY} {formatMoney(allowanceArrears)}
              </p>
            </div>
          )}

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500">First Ability (Net - Basic/3)</p>
            <p className={`text-base font-bold ${firstAbility < 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {CURRENCY} {formatMoney(firstAbility)}
            </p>
            {firstAbility < 0 && (
              <p className="text-[10px] text-amber-600 mt-0.5">Negative (treated as 0 in buy-off addition)</p>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500">Released Installments ({facilities.length} facilities)</p>
            <p className="text-base font-bold text-slate-900">
              {CURRENCY} {formatMoney(totalInstallments)}/mo
            </p>
          </div>

          <div className="p-3.5 bg-blue-50/60 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 font-medium">Computed Buy-Off Ability</p>
            <p className="text-lg font-extrabold text-blue-950">
              {CURRENCY} {formatMoney(buyOffAbility)}/mo
            </p>
          </div>

          <div className="p-3.5 bg-red-50/60 rounded-lg border border-red-200">
            <p className="text-xs text-red-700 font-medium">Total Debt Required to Settle</p>
            <p className="text-lg font-extrabold text-red-900">
              {CURRENCY} {formatMoney(totalBuyOffAmount)}
            </p>
          </div>
        </div>

        {/* Commercial Facilities List */}
        {facilities.length > 0 && (
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <div className="px-4 py-2 bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
              Entered Commercial Facilities
            </div>
            <div className="divide-y divide-slate-200">
              {facilities.map((fac, idx) => (
                <div key={fac.id} className="p-3 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-900">
                      {fac.lenderName || `Facility #${idx + 1}`}
                    </span>
                    <span className="text-slate-500 ml-2">
                      (Balance: {CURRENCY} {formatMoney(fac.outstandingBalance)}, Installment: {CURRENCY} {formatMoney(fac.monthlyInstallment)})
                    </span>
                  </div>
                  <div className="font-bold text-slate-800">
                    Buy-Off: {CURRENCY} {formatMoney(fac.buyOffAmount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retirement Rule Details */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">Retirement Rule Details:</p>
          <p>
            • Client Age: <span className="font-semibold text-slate-800">{age} years</span>
          </p>
          <p>
            • Remaining Years to Retirement (Age 60): <span className="font-semibold text-slate-800">{yearsToRetirement} years</span>
          </p>
          <p>
            • Estimated Months to Retirement: <span className="font-semibold text-slate-800">{monthsToRetirement} months</span>
          </p>
          <p>
            • Maximum Permitted Term (Months - 3): <span className="font-semibold text-slate-800">{maxAllowedTerm} months</span>
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onEdit}
            className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm transition flex items-center gap-2 cursor-pointer"
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
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            Edit Payslip & Facilities
          </button>
        </div>
      </div>
    </div>
  );
}
