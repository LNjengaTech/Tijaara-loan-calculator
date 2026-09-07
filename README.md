# Tijaara Microfinance — Loan Qualification PWA

A Progressive Web App (PWA) built with Next.js and TypeScript for credit officers and clients to calculate loan qualification, repayment capacity, and eligible amounts across the 13 approved terms.

## Key Features

- **Formula-Driven Schedule Engine**: Continuous, exact loan calculations using the authoritative reverse-engineered branch schedule formula (no lookup table gaps or artificial rounding).
- **Payslip Repayment Capacity (Ability)**:
  $$\text{Ability} = (\text{Net Salary} - \text{Allowance Arrears}) - \frac{\text{Basic Salary}}{3}$$
- **13 Approved Loan Terms (3 to 120 Months)**: Hardcoded single source of truth (`lib/schedule.ts`) based on the approved schedule tab.
- **Retirement Cutoff Enforcement**: Automatically determines remaining months until retirement age (default 60) and caps eligible terms at $\text{Months to Retirement} - 3$. Rejects clients within 3 months of retirement.
- **Dual Labeling for Sharia-Compliant Loans**: Identical mathematical engine with specialized labeling ("Profit Rate" & "Profit-Sharing / Sharia Loan").
- **Offline-Ready PWA**: Service worker caching and web app manifest for installation on mobile devices and offline field branch operation.
- **One-Click Print / PDF Summary**: Uses native `@media print` styling to generate a single-page official qualification assessment ready for officer stamp and client sign-off.

---

## Quick Start Commands

To run the app locally:

```bash
# Navigate to project directory
cd /home/lonnex/Tijaara/tijaara-loan-app

# Start the development server
npm run dev

# Open your browser at http://localhost:3000
```

To build for production:

```bash
npm run build
npm run start
```

To verify the mathematical formulas against the approved schedule:

```bash
python3 scripts/verify-schedule.py
```

---

## Architecture & Code Structure

```
tijaara-loan-app/
├── app/
│   ├── layout.tsx                # Root layout with PWA meta tags & SW registration
│   ├── page.tsx                  # Main application flow orchestrator
│   └── globals.css               # Tailwind CSS styles & native print media stylesheet
├── components/
│   ├── Navbar.tsx                # Header with branding, online status & PWA install
│   ├── PayslipForm.tsx           # Payslip input form with inline validation & presets
│   ├── ResultsTable.tsx          # 13-term schedule table & max loan highlight card
│   ├── RejectionNotice.tsx       # Rejection banner with transparent formula audit
│   ├── PrintableSummary.tsx      # Clean single-page printable assessment view
│   └── ServiceWorkerRegister.tsx # Client-side PWA service worker registration
├── lib/
│   ├── schedule.ts               # Single source of truth for 13 terms & business constants
│   ├── calculations.ts           # Pure calculation functions (ability, terms, retirement)
│   └── types.ts                  # TypeScript interfaces for inputs and outputs
├── public/
│   ├── manifest.json             # PWA Web App Manifest
│   ├── sw.js                     # Offline caching Service Worker
│   └── icons/                    # App icons (192x192, 512x512, SVG)
├── scripts/
│   └── verify-schedule.py        # Independent verification test suite
└── tests/
    └── calculations.test.ts      # Unit tests for Jest / Vitest
```

---

## Business Rules & Formula Reference

### 1. Installment Forward Formula
$$\text{Installment}(P, T) = P \times \left(\frac{1}{T} + \text{InterestRate}(T) + \frac{\text{InsuranceRate}(T)}{T}\right) + \text{LedgerFee}(T)$$

### 2. Maximum Loan Inverse Formula
$$\text{MaxLoanAmount}(A, T) = \frac{A - \text{LedgerFee}(T)}{\frac{1}{T} + \text{InterestRate}(T) + \frac{\text{InsuranceRate}(T)}{T}}$$

- **Loan Floor**: KES 5,000 (terms below 5,000 are excluded per Option A).
- **Loan Ceiling**: KES 3,000,000 (clamped).
- **Ability Limits**: Floor of KES 371; Ceiling of KES 78,887.
