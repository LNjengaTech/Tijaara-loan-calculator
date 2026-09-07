'use client';

import React from 'react';
import { QualificationResult } from '@/lib/types';
import { CURRENCY } from '@/lib/schedule';

interface PrintableSummaryProps {
  result: QualificationResult;
}

export default function PrintableSummary({ result }: PrintableSummaryProps) {
  const {
    ability,
    newNetSalary,
    netSalary,
    basicSalary,
    hadArrears,
    allowanceArrears,
    dob,
    loanType,
    retirementDate,
    monthsToRetirement,
    maxAllowedTerm,
    viableTerms,
    maxAvailableLoan,
  } = result;

  const isSharia = loanType === 'sharia';
  const rateLabel = isSharia ? 'Profit Rate' : 'Interest Rate';
  const loanTypeTitle = isSharia ? 'Profit-Sharing / Sharia Loan' : 'Conventional Loan';

  const formatMoney = (val: number) =>
    val.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const currentDate = new Date().toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="hidden print:block text-slate-900 bg-white font-sans text-xs p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            TIJAARA MICROFINANCE
          </h1>
          <p className="text-xs font-semibold text-slate-600">
            Official Loan Qualification & Schedule Assessment
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-800">Date: {currentDate}</p>
          <p className="text-slate-500">Document Ref: TIJ-LQ-{Date.now().toString().slice(-6)}</p>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Client & Payslip Info */}
        <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            Client Payslip Information
          </h2>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Date of Birth:</span>
              <span className="font-medium text-slate-900">{dob}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Retirement Date (Age 60):</span>
              <span className="font-medium text-slate-900">{retirementDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Months to Retirement:</span>
              <span className="font-medium text-slate-900">{monthsToRetirement} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Max Permitted Term:</span>
              <span className="font-bold text-slate-900">{maxAllowedTerm} months</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-600">Loan Product:</span>
              <span className="font-bold text-emerald-800">{loanTypeTitle}</span>
            </div>
          </div>
        </div>

        {/* Ability Assessment */}
        <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            Repayment Ability Assessment
          </h2>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Basic Salary:</span>
              <span className="font-medium text-slate-900">{CURRENCY} {formatMoney(basicSalary)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Gross Net Salary:</span>
              <span className="font-medium text-slate-900">{CURRENCY} {formatMoney(netSalary)}</span>
            </div>
            {hadArrears && (
              <div className="flex justify-between text-amber-800">
                <span>Allowance Arrears Deducted:</span>
                <span>-{CURRENCY} {formatMoney(allowanceArrears)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">1/3rd Basic Salary Deducted:</span>
              <span className="font-medium text-slate-900">-{CURRENCY} {formatMoney(basicSalary / 3)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-black text-slate-900">
              <span>Monthly Capacity (Ability):</span>
              <span className="text-emerald-800">{CURRENCY} {formatMoney(ability)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Max Loan Banner */}
      {maxAvailableLoan && (
        <div className="mb-4 p-2.5 bg-slate-100 border border-slate-300 rounded flex justify-between items-center">
          <div>
            <span className="font-bold text-slate-700">Recommended Maximum Eligibility:</span>
            <span className="ml-2 font-black text-emerald-900 text-sm">
              {CURRENCY} {formatMoney(maxAvailableLoan.amount)}
            </span>
          </div>
          <div className="text-slate-600">
            Term: <span className="font-bold text-slate-900">{maxAvailableLoan.term} Months</span> | 
            Repayment: <span className="font-bold text-slate-900">{CURRENCY} {formatMoney(maxAvailableLoan.installment)}/mo</span>
          </div>
        </div>
      )}

      {/* Schedule Table */}
      <div className="mb-6">
        <h2 className="font-bold text-slate-800 uppercase tracking-wider mb-1.5">
          Eligible Loan Options Across Approved Terms ({viableTerms.length} options)
        </h2>
        <table className="w-full border-collapse border border-slate-300 text-left">
          <thead>
            <tr className="bg-slate-200 text-slate-800 border-b border-slate-300">
              <th className="py-1.5 px-3 border-r border-slate-300">Term (Months)</th>
              <th className="py-1.5 px-3 border-r border-slate-300">{rateLabel}</th>
              <th className="py-1.5 px-3 border-r border-slate-300">Insurance (p.a.)</th>
              <th className="py-1.5 px-3 border-r border-slate-300">Ledger Fee</th>
              <th className="py-1.5 px-3 border-r border-slate-300 text-right">Max Eligible Principal</th>
              <th className="py-1.5 px-3 text-right">Monthly Installment</th>
            </tr>
          </thead>
          <tbody>
            {viableTerms.map((t, idx) => (
              <tr
                key={t.term}
                className={`border-b border-slate-300 ${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
              >
                <td className="py-1.5 px-3 border-r border-slate-300 font-bold">
                  {t.term} Months ({t.term / 12 >= 1 ? `${(t.term / 12).toFixed(t.term % 12 === 0 ? 0 : 1)} yrs` : `${t.term} mos`})
                </td>
                <td className="py-1.5 px-3 border-r border-slate-300">
                  {(t.interestOrProfitRate * 100).toFixed(3).replace(/\.?0+$/, '')}%
                </td>
                <td className="py-1.5 px-3 border-r border-slate-300">
                  {(t.insuranceRate * 100).toFixed(2)}%
                </td>
                <td className="py-1.5 px-3 border-r border-slate-300">
                  {CURRENCY} {t.ledgerFee}
                </td>
                <td className="py-1.5 px-3 border-r border-slate-300 text-right font-bold text-slate-900">
                  {CURRENCY} {formatMoney(t.maxLoanAmount)}
                </td>
                <td className="py-1.5 px-3 text-right font-medium text-slate-800">
                  {CURRENCY} {formatMoney(t.monthlyRepayment)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signature & Sign-off Block */}
      <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-8">
        <div>
          <p className="font-bold text-slate-800 mb-6">Assessed By (Loan Officer):</p>
          <div className="border-b border-slate-400 w-full mb-1"></div>
          <div className="flex justify-between text-slate-500">
            <span>Signature & Stamp</span>
            <span>Date</span>
          </div>
        </div>

        <div>
          <p className="font-bold text-slate-800 mb-6">Client Acknowledgment:</p>
          <div className="border-b border-slate-400 w-full mb-1"></div>
          <div className="flex justify-between text-slate-500">
            <span>Signature</span>
            <span>Date</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-center text-slate-400 text-[10px]">
        This document is an indicative qualification assessment based on current payslip inputs and approved Tijaara lending formulas. Final approval is subject to branch appraisal and credit committee sanction.
      </p>
    </div>
  );
}
