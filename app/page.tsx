'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import PayslipForm from '@/components/PayslipForm';
import ResultsTable from '@/components/ResultsTable';
import RejectionNotice from '@/components/RejectionNotice';
import PrintableSummary from '@/components/PrintableSummary';
import { PayslipInput, QualificationResult } from '@/lib/types';
import { evaluateLoanQualification } from '@/lib/calculations';
import { CURRENCY, MIN_ABILITY, MAX_ABILITY, RETIREMENT_AGE } from '@/lib/schedule';

export default function Home() {
  const [result, setResult] = useState<QualificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFormSubmit = (input: PayslipInput) => {
    setIsProcessing(true);
    // Calculations are pure client-side
    const evaluation = evaluateLoanQualification(input);
    setResult(evaluation);
    setIsProcessing(false);

    // Smooth scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setResult(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* App Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Top Info Header when no result is active */}
        {!result && (
          <div className="mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Loan Qualification & Term Schedule
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                    Evaluates monthly repayment capacity (Ability) from client payslips, automatically enforces the {RETIREMENT_AGE}-year retirement cutoff rule, and computes exact continuous loan amounts across the 13 approved terms.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Formula-Driven Schedule
                  </span>
                </div>
              </div>

              {/* Quick Policy Highlights */}
              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Repayment Capacity:</span>{' '}
                    Ability must be between {CURRENCY} {MIN_ABILITY} and {CURRENCY} {MAX_ABILITY.toLocaleString()}.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Retirement Rule:</span>{' '}
                    Term cannot exceed (Months to Age {RETIREMENT_AGE} − 3).
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Sharia / Conventional:</span>{' '}
                    Identical math, specialized labeling ("Profit Rate").
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Display based on evaluation state */}
        {!result && (
          <PayslipForm
            onSubmit={handleFormSubmit}
            onReset={handleReset}
            isLoading={isProcessing}
          />
        )}

        {result && !result.qualified && (
          <div className="space-y-6">
            <RejectionNotice result={result} onEdit={handleReset} />
          </div>
        )}

        {result && result.qualified && (
          <div className="space-y-6">
            <ResultsTable
              result={result}
              onEdit={handleReset}
              onPrint={handlePrint}
            />
            {/* Printable summary visible only when printing */}
            <PrintableSummary result={result} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 print:hidden mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <p className="font-medium text-slate-700">
            Tijaara Microfinance Ltd — Credit Operations & Branch Tool
          </p>
          <p className="mt-1">
            Authoritative 13-Term Schedule Formula Engine • Fully Offline Capable Progressive Web App (PWA)
          </p>
        </div>
      </footer>
    </div>
  );
}
