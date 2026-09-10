'use client';

import React, { useState } from 'react';
import { QualificationResult } from '@/lib/types';
import { CURRENCY } from '@/lib/schedule';

interface ResultsTableProps {
  result: QualificationResult;
  onEdit: () => void;
  onPrint: () => void;
}

export default function ResultsTable({ result, onEdit, onPrint }: ResultsTableProps) {
  const [showDisallowed, setShowDisallowed] = useState(true);

  const {
    ability,
    // newNetSalary,
    netSalary,
    basicSalary,
    hadArrears,
    allowanceArrears,
    // loanType,
    viableTerms,
    disallowedTerms,
    maxAvailableLoan,
    // monthsToRetirement,
    // maxAllowedTerm,
    // age,
    // yearsToRetirement,
  } = result;

  // const isSharia = loanType === 'sharia';
  // const rateLabel = isSharia ? 'Profit Rate' : 'Interest Rate';
  // const loanTypeTitle = isSharia ? 'Profit-Sharing / Sharia Loan' : 'Conventional Loan';

  const formatMoney = (val: number) =>
    val.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6 print:hidden">
      {/* Top Banner & Action Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-sm text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              QUALIFIED
            </span>
            {/* <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {loanTypeTitle}
            </span> */}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            Loan Qualification & Term Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            13-term schedule derived from the authoritative physical schedule formula
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onEdit}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 text-sm transition"
          >
            Edit Payslip
          </button>
          <button
            onClick={onPrint}
            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition flex items-center gap-2"
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

      {/* Cards: Max Loan Summary + Computed Ability Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maximum Loan Available Highlight Card */}
        {maxAvailableLoan && (
          <div className="bg-linear-to-br from-emerald-800 to-emerald-950 text-white rounded-xl shadow-md p-6 flex flex-col justify-between border border-emerald-700">
            <div className='flex items-center justify-between'>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                Ability
              </span>
              <p className="text-2xl sm:text-4xl font-black mt-2 tracking-tight text-white">
                {formatMoney(maxAvailableLoan.installment)}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                Max. Credit ({maxAvailableLoan.term} mnts)
              </span>
              <p className="text-2xl sm:text-4xl font-black mt-2 tracking-tight text-white">
                {formatMoney(maxAvailableLoan.amount)}
              </p>
            </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-700/60 space-y-2 text-xs">
              <div className="flex justify-between text-emerald-200">
                <span>Max Term Allowed:</span>
                <span className="font-bold text-white">{maxAvailableLoan.term} Months</span>
              </div>
            </div>
          </div>
        )}

        {/* Ability Breakdown Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Ability Breakdown
            </h3>
          </div>

          {/* Formula Display Box */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">
              Formula: Ability = [Net Salary {hadArrears && '- Arrears'}] - (Basic Salary / 3)
            </p>
            <p className="text-slate-600">
              = [{formatMoney(netSalary)} {hadArrears && `- ${formatMoney(allowanceArrears)}`}] - ({formatMoney(basicSalary)} / 3)
            </p>
            <p className="text-emerald-700 font-bold text-sm pt-1">
              = {CURRENCY} {formatMoney(ability)} / month
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <p className="text-slate-500">Basic Salary</p>
              <p className="font-bold text-slate-900">{CURRENCY} {formatMoney(basicSalary)}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <p className="text-slate-500">Net Salary</p>
              <p className="font-bold text-slate-900">{CURRENCY} {formatMoney(netSalary)}</p>
            </div>
            {hadArrears && (
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <p className="text-slate-500">Arrears</p>
                <p className="font-bold text-amber-700">-{CURRENCY} {formatMoney(allowanceArrears)}</p>
              </div>
            )}
            {/* <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <p className="text-slate-500">Client Age / Cutoff</p>
              <p className="font-bold text-slate-900">{age} yrs (Max {maxAllowedTerm} mos)</p>
            </div> */}
          </div>
        </div>
      </div>

      {/* Eligible Loan Schedule Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Approved Term Options ({viableTerms.length} Viable Terms)
            </h3>
            <p className="text-xs text-slate-500">
              Exact continuous amounts (no arbitrary rounding)
            </p>
          </div>

          {disallowedTerms.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showDisallowed}
                onChange={(e) => setShowDisallowed(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Show disallowed terms ({disallowedTerms.length})
            </label>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-4">Term</th>
                {/* <th className="py-3.5 px-4">{rateLabel}</th>
                <th className="py-3.5 px-4">Insurance (p.a.)</th>
                <th className="py-3.5 px-4">Ledger Fee</th> */}
                <th className="py-3.5 px-4 text-right">Max Loan Amount</th>
                <th className="py-3.5 px-4 text-right">Monthly Repayment</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Viable Terms */}
              {viableTerms.map((t) => (
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
                  {/* <td className="py-3.5 px-4 whitespace-nowrap">
                    {(t.interestOrProfitRate * 100).toFixed(3).replace(/\.?0+$/, '')}%
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {(t.insuranceRate * 100).toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {CURRENCY} {t.ledgerFee}
                  </td> */}
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-900 text-base whitespace-nowrap">
                    {CURRENCY} {formatMoney(t.maxLoanAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                    {CURRENCY} {formatMoney(t.monthlyRepayment)}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800">
                      Eligible
                    </span>
                  </td>
                </tr>
              ))}

              {/* Disallowed Terms */}
              {showDisallowed &&
                disallowedTerms.map((t) => (
                  <tr
                    key={t.term}
                    className="bg-slate-50/80 text-slate-400 text-xs"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-500 whitespace-nowrap">
                      {t.term} Months
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {(t.interestOrProfitRate * 100).toFixed(3).replace(/\.?0+$/, '')}%
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {(t.insuranceRate * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {CURRENCY} {t.ledgerFee}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {t.maxLoanAmount > 0 ? `${CURRENCY} ${formatMoney(t.maxLoanAmount)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      —
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-medium">
                        {t.disqualificationReason || 'Disallowed'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Schedule Footer Note */}
        {/* <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p>
            • Processing fee rate: 0.00% (placeholder). Net disbursed amount equals maximum loan principal.
          </p>
          <p>
            • Max schedule ceiling: {CURRENCY} 3,000,000. Minimum loan floor: {CURRENCY} 5,000.
          </p>
        </div> */}
      </div>
    </div>
  );
}
