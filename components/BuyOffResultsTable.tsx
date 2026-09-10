'use client';

import React, { useState } from 'react';
import { BuyOffQualificationResult } from '@/lib/types';
import { CURRENCY } from '@/lib/schedule';

interface BuyOffResultsTableProps {
  result: BuyOffQualificationResult;
  onEdit: () => void;
  onPrint: () => void;
}

export default function BuyOffResultsTable({
  result,
  onEdit,
  onPrint,
}: BuyOffResultsTableProps) {
  const [showDisallowed, setShowDisallowed] = useState(false);

  const {
    firstAbility,
    // newNetSalary,
    netSalary,
    basicSalary,
    hadArrears,
    allowanceArrears,
    loanType,
    facilities,
    totalBuyOffAmount,
    totalInstallments,
    buyOffAbility,
    qualifyingTerms,
    disqualifiedTerms,
    maxAvailableLoan,
    maxAllowedTerm,
  } = result;

  const isSharia = loanType === 'sharia';
  const rateLabel = isSharia ? 'Profit Rate' : 'Interest Rate';
  const loanTypeTitle = isSharia ? 'Profit-Sharing / Sharia Buy-Off' : 'Commercial Buy-Off Loan';

  const formatMoney = (val: number) =>
    val.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6 print:hidden">
      {/* Top Banner & Action Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              BUY-OFF QUALIFIED
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {facilities.length} {facilities.length === 1 ? 'Facility' : 'Facilities'} Included
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {loanTypeTitle}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            Buy-Off Loan Assessment & Term Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evaluates settlement of existing commercial credit debts with a new consolidated Tijaara loan
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onEdit}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 text-sm transition cursor-pointer"
          >
            Edit Payslip & Facilities
          </button>
          <button
            onClick={onPrint}
            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition flex items-center gap-2 cursor-pointer"
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Highlights & Ability Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maximum Loan Available Highlight Card */}
        {maxAvailableLoan && (
          <div className="bg-linear-to-br from-emerald-800 to-emerald-950 text-white rounded-xl shadow-md p-6 flex flex-col justify-between border border-emerald-700">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                Recommended Buy-Off Loan ({maxAvailableLoan.term} months)
              </span>
              <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight text-white">
                {CURRENCY} {formatMoney(maxAvailableLoan.amount)}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-700/60 space-y-2 text-xs">
              <div className="flex justify-between text-emerald-200">
                <span>Total Debt Settlement:</span>
                <span className="font-bold text-white">
                  {CURRENCY} {formatMoney(totalBuyOffAmount)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Net Cash Surplus to Client:</span>
                <span className="font-bold text-emerald-300">
                  +{CURRENCY} {formatMoney(maxAvailableLoan.surplus)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Monthly Repayment:</span>
                <span className="font-bold text-white">
                  {CURRENCY} {formatMoney(maxAvailableLoan.installment)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Buy-Off Ability Computation Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Buy-Off Ability Computation
            </h3>
          </div>

          {/* Audit Steps Box */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-700 space-y-2">
            <div>
              <span className="font-semibold text-slate-900">Step 1 — First Ability: </span>
              <span className="text-slate-600">
                [{formatMoney(netSalary)} {hadArrears && `- ${formatMoney(allowanceArrears)}`}] - ({formatMoney(basicSalary)} / 3) ={' '}
              </span>
              <span className={`font-bold ${firstAbility < 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                {CURRENCY} {formatMoney(firstAbility)}
              </span>
              {firstAbility < 0 && (
                <span className="text-[11px] text-amber-700 font-sans block mt-0.5">
                  (Negative first ability is treated as 0 for ability addition)
                </span>
              )}
            </div>

            <div>
              <span className="font-semibold text-slate-900">Step 2 — Released Installments: </span>
              <span className="text-slate-600">Sum of existing commercial facility deductions = </span>
              <span className="font-bold text-slate-900">
                {CURRENCY} {formatMoney(totalInstallments)} / month
              </span>
            </div>

            <div className="pt-1.5 border-t border-slate-200">
              <span className="font-bold text-slate-900">Step 3 — Buy Off Ability: </span>
              <span className="text-emerald-800 font-extrabold text-sm">
                {CURRENCY} {formatMoney(buyOffAbility)} / month
              </span>
              <span className="text-[11px] text-slate-500 font-sans ml-2">
                {firstAbility < 0 ? '(= Total Installments)' : '(= First Ability + Total Installments)'}
              </span>
            </div>
          </div>

          {/* Key Metrics Quick View */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <p className="text-slate-500">First Ability</p>
              <p className={`font-bold ${firstAbility < 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                {CURRENCY} {formatMoney(firstAbility)}
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <p className="text-slate-500">Required Settlement</p>
              <p className="font-bold text-emerald-800">{CURRENCY} {formatMoney(totalBuyOffAmount)}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <p className="text-slate-500">Buy-Off Ability</p>
              <p className="font-bold text-slate-900">{CURRENCY} {formatMoney(buyOffAbility)}/mo</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <p className="text-slate-500">Retirement Cutoff</p>
              <p className="font-bold text-slate-900">Max {maxAllowedTerm} mos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Credit Facilities Breakdown Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Commercial Credit Facilities to Settle ({facilities.length})
            </h3>
            <p className="text-xs text-slate-500">
              Estimated Buy-Off Amount per facility = (Balance / 3) + Monthly Installment
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-200 text-slate-700">
            Total Clearance: {CURRENCY} {formatMoney(totalBuyOffAmount)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Lender / Facility</th>
                <th className="py-3 px-4 text-right">Outstanding Balance</th>
                <th className="py-3 px-4 text-right">Monthly Installment</th>
                <th className="py-3 px-4 text-right">Estimated Buy-Off Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {facilities.map((fac, idx) => (
                <tr key={fac.id} className="hover:bg-slate-50/80 transition text-slate-800">
                  <td className="py-3 px-4 font-semibold text-slate-500 text-xs">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {fac.lenderName || `Commercial Facility #${idx + 1}`}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {CURRENCY} {formatMoney(fac.outstandingBalance)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    {CURRENCY} {formatMoney(fac.monthlyInstallment)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-800">
                    {CURRENCY} {formatMoney(fac.buyOffAmount)}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-slate-100/60 font-bold border-t-2 border-slate-300">
                <td colSpan={2} className="py-3 px-4 text-slate-900">
                  Total Across All Facilities
                </td>
                <td className="py-3 px-4 text-right text-slate-900">
                  {CURRENCY} {formatMoney(facilities.reduce((s, f) => s + f.outstandingBalance, 0))}
                </td>
                <td className="py-3 px-4 text-right text-slate-900">
                  {CURRENCY} {formatMoney(totalInstallments)}
                </td>
                <td className="py-3 px-4 text-right text-emerald-900 text-base">
                  {CURRENCY} {formatMoney(totalBuyOffAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Eligible Buy-Off Loan Schedule Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Eligible Buy-Off Terms ({qualifyingTerms.length} Terms Meet Debt Clearance)
            </h3>
            <p className="text-xs text-slate-500">
              Qualifying terms produce a loan amount sufficient to settle the required debt ({CURRENCY} {formatMoney(totalBuyOffAmount)})
            </p>
          </div>

          {disqualifiedTerms.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showDisallowed}
                onChange={(e) => setShowDisallowed(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Show non-qualifying terms ({disqualifiedTerms.length})
            </label>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-4">Term</th>
                <th className="py-3.5 px-4">{rateLabel}</th>
                <th className="py-3.5 px-4">Insurance (p.a.)</th>
                <th className="py-3.5 px-4 text-right">Max Schedule Amount</th>
                <th className="py-3.5 px-4 text-right">Required Settlement</th>
                <th className="py-3.5 px-4 text-right">Surplus to Client</th>
                <th className="py-3.5 px-4 text-right">Monthly Installment</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Qualifying Terms */}
              {qualifyingTerms.map((t) => (
                <tr
                  key={t.term}
                  className="hover:bg-emerald-50/40 transition font-medium text-slate-800"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {t.term} Months
                    <span className="text-xs font-normal text-slate-500 block">
                      ({(t.term / 12).toFixed(t.term % 12 === 0 ? 0 : 1)} yrs)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {(t.interestOrProfitRate * 100).toFixed(3).replace(/\.?0+$/, '')}%
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {(t.insuranceRate * 100).toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-900 text-base whitespace-nowrap">
                    {CURRENCY} {formatMoney(t.buyOffLoanAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600 whitespace-nowrap">
                    {CURRENCY} {formatMoney(totalBuyOffAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                    +{CURRENCY} {formatMoney(t.surplusAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                    {CURRENCY} {formatMoney(t.monthlyRepayment)}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800">
                      Qualifies
                    </span>
                  </td>
                </tr>
              ))}

              {/* Non-qualifying / Disallowed Terms */}
              {showDisallowed &&
                disqualifiedTerms.map((t) => (
                  <tr key={t.term} className="bg-slate-50/80 text-slate-400 text-xs">
                    <td className="py-3 px-4 font-semibold text-slate-500 whitespace-nowrap">
                      {t.term} Months
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {(t.interestOrProfitRate * 100).toFixed(3).replace(/\.?0+$/, '')}%
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {(t.insuranceRate * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {t.buyOffLoanAmount > 0 ? `${CURRENCY} ${formatMoney(t.buyOffLoanAmount)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {CURRENCY} {formatMoney(totalBuyOffAmount)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">—</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">—</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-medium">
                        {t.disqualificationReason || 'Does not qualify'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Schedule Policy Notes */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 space-y-1">
          <p>
            • <span className="font-semibold text-slate-700">Disbursement Policy Notice:</span> Displays both maximum eligible loan for the term and debt clearance amount ({CURRENCY} {formatMoney(totalBuyOffAmount)}). Branch credit policy determines whether to cap disbursement at the settlement amount or disburse the surplus to the client.
          </p>
          <p>
            • Max schedule ceiling: {CURRENCY} 3,000,000. Minimum floor: {CURRENCY} 5,000.
          </p>
        </div>
      </div>
    </div>
  );
}
