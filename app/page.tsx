'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import PayslipForm from '@/components/PayslipForm';
import ResultsTable from '@/components/ResultsTable';
import RejectionNotice from '@/components/RejectionNotice';
import BuyOffResultsTable from '@/components/BuyOffResultsTable';
import BuyOffRejectionNotice from '@/components/BuyOffRejectionNotice';
import PrintableSummary from '@/components/PrintableSummary';
import { PayslipInput, QualificationResult, BuyOffQualificationResult } from '@/lib/types';
import { evaluateLoanQualification } from '@/lib/calculations';
import { evaluateBuyOffQualification } from '@/lib/buyOff';
// import { CURRENCY, MIN_ABILITY, MAX_ABILITY, RETIREMENT_AGE } from '@/lib/schedule';

export default function Home() {
  const [result, setResult] = useState<QualificationResult | null>(null);
  const [buyOffResult, setBuyOffResult] = useState<BuyOffQualificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFormSubmit = (input: PayslipInput) => {
    setIsProcessing(true);

    if (input.hasCreditFacility && input.creditFacilities && input.creditFacilities.length > 0) {
      // Phase 2: Buy-Off Evaluation
      const evaluation = evaluateBuyOffQualification(input);
      setBuyOffResult(evaluation);
      setResult(null);
    } else {
      // Phase 1: Standard Qualification Evaluation
      const evaluation = evaluateLoanQualification(input);
      setResult(evaluation);
      setBuyOffResult(null);
    }

    setIsProcessing(false);

    // Smooth scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setResult(null);
    setBuyOffResult(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const hasAnyResult = result !== null || buyOffResult !== null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* App Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Top Info Header when no result is active */}
        {!hasAnyResult && (
          <div className="mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Credit Qualification & Term Schedule
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                    Evaluates monthly repayment capacity (Ability) from client payslips.
                  </p>
                </div>
              </div>

              {/* Quick Policy Highlights */}
              {/* <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Repayment Capacity:</span>{' '}
                    Standard ability must be between {CURRENCY} {MIN_ABILITY} and {CURRENCY} {MAX_ABILITY.toLocaleString()}.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Buy-Off:</span>{' '}
                    Settles external commercial credit facilities using specialized Buy-Off Ability.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Retirement Rule:</span>{' '}
                    Term cannot exceed (Months to Age {RETIREMENT_AGE} − 3).
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Sharia / Conventional:</span>{' '}
                    Identical math, specialized labeling (&quot;Profit Rate&quot;).
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        )}

        {/* Dynamic Display based on evaluation state */}
        {!hasAnyResult && (
          <PayslipForm
            onSubmit={handleFormSubmit}
            onReset={handleReset}
            isLoading={isProcessing}
          />
        )}

        {/* Phase 2: Buy-Off Results Display */}
        {buyOffResult && !buyOffResult.qualified && (
          <div className="space-y-6">
            <BuyOffRejectionNotice result={buyOffResult} onEdit={handleReset} />
          </div>
        )}

        {buyOffResult && buyOffResult.qualified && (
          <div className="space-y-6">
            <BuyOffResultsTable
              result={buyOffResult}
              onEdit={handleReset}
              onPrint={handlePrint}
            />
            <PrintableSummary buyOffResult={buyOffResult} />
          </div>
        )}

        {/* Phase 1: Standard Results Display */}
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
        </div>
      </footer>
    </div>
  );
}
