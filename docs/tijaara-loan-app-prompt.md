# Build Prompt: Tijaara Microfinance — Loan Qualification PWA

## 1. Overview

Build a Progressive Web App (PWA) using **Next.js** that lets a loan officer (or client)
enter salary details from a payslip and instantly see:
- The client's computed **ability** (monthly repayment capacity)
- Whether the client qualifies for a loan at all
- A table of eligible **loan amounts across the 13 approved term options** (3–120 months)
- A separate labeling path for **Sharia-compliant** loans (same math, different terms)
- Automatic enforcement of the **retirement cutoff rule**

The app should be installable (PWA manifest + service worker), work well on mobile,
and should not require a backend/database unless specified otherwise below — all
calculations can run client-side.

---

## 2. Confirmed business rules

The following have been confirmed by the product owner and should be treated as final.

### 2.1 The schedule — implement as an exact formula, not a lookup table

The "physical schedule" used at the branch is a printed table of pre-computed monthly
installments for round loan amounts. It has been reverse-engineered and verified against
the source spreadsheet (`New Schedule` tab — confirmed authoritative) to the cent. It is
driven by a closed-form formula, so the app should implement the **formula directly**
rather than a lookup table — this gives exact, continuous results for any ability value,
not just the round loan amounts printed on the physical sheet.

**Forward formula** (loan amount `P`, term `T` in months → monthly installment):

```
Installment(P, T) = P * ( 1/T + InterestRate(T) + InsuranceRate(T)/T ) + LedgerFee(T)
```

**Inverse formula** (what the app actually needs — ability `A`, term `T` → max loan amount):

```
MaxLoanAmount(A, T) = (A - LedgerFee(T)) / ( 1/T + InterestRate(T) + InsuranceRate(T)/T )
```

If `A <= LedgerFee(T)` for a given term, that term is not viable (would produce a
negative or zero loan amount) — exclude it from the results table.

### 2.2 Term-specific constants (from the approved "New Schedule" tab)

There are exactly **13 approved terms** — not every 3 months up to 120. Hardcode this
table as a single array of objects (one per term) so every other calculation reads from it:

| Term (months) | Interest Rate | Insurance Rate (per annum, pro-rated) | Ledger Fee |
|---:|---:|---:|---:|
| 3   | 10.00%  | 2.50%  | 150 |
| 6   | 8.50%   | 2.50%  | 150 |
| 12  | 7.50%   | 2.50%  | 150 |
| 18  | 6.00%   | 3.75%  | 150 |
| 24  | 5.00%   | 5.00%  | 150 |
| 36  | 4.50%   | 7.50%  | 150 |
| 48  | 4.00%   | 10.00% | 150 |
| 60  | 3.50%   | 12.50% | 150 |
| 72  | 2.181%  | 15.00% | 200 |
| 84  | 2.254%  | 17.50% | 200 |
| 96  | 2.322%  | 17.50% | 200 |
| 108 | 2.384%  | 17.50% | 200 |
| 120 | 2.442%  | 17.50% | 200 |

There is also a **Processing Fee** row in the source ("5% upfront") whose value is
currently **0% for every term**. Include it as a named constant per term
(`PROCESSING_FEE_RATE[T] = 0`) wired into the formula as a placeholder — e.g. an upfront
deduction from disbursed principal — so it's a one-line change to activate later, but it
should have **no effect on any calculation today**.

### 2.3 Loan amount range

- **Minimum loan**: 5,000. The formula floor (ability = 371) corresponds almost exactly
  to a 5,000 loan at the most generous term (120 months). See section 3, item 1, for how
  to handle terms where the computed amount would fall below this floor.
- **Maximum loan**: 3,000,000 (the full extent of the approved schedule). Clamp any
  computed `MaxLoanAmount(A, T)` above 3,000,000 down to 3,000,000 — do not display a
  larger figure even if the formula would produce one. Note: given the ability ceiling
  of 78,887 (below), the 3,000,000 ceiling is only reachable at very long terms with the
  lowest per-term rates; this is expected and not a bug.

### 2.4 Ability

```
if (hasAllowanceArrears) {
  newNetSalary = netSalary - allowanceArrears
  ability = newNetSalary - (basicSalary / 3)
} else {
  ability = netSalary - (basicSalary / 3)
}
```

- If `ability < 371` → **reject outright**. Show a clear rejection message with the
  computed ability shown for transparency (do not proceed to the loan table).
- If `ability > 78,887` → **reject outright** as well (hard ceiling, not a cap — do not
  clamp the value and continue).
- `ability <= 0` is already covered by the `< 371` rejection above.

### 2.5 No rounding

Loan amounts are shown exactly as calculated (subject only to the 3,000,000 ceiling
above) — no rounding to the nearest 100/1,000/etc.

### 2.6 Arrears

Only **allowance arrears** are considered (no other arrears types — e.g. no separate
handling for loan arrears or salary advances at this stage). The form should have a
single "Allowance Arrears Amount" field.

### 2.7 Sharia-compliant loans

Use the exact same calculation as conventional loans (section 2.1–2.2). The only
difference is labeling — "Profit Rate" instead of "Interest Rate" and "Profit-Sharing /
Sharia loan" instead of "Conventional loan" in the UI. No separate calculation path or
rate table is needed, but keep the function name/label distinct
(`calculateShariaLoan` vs `calculateConventionalLoan`, even if they call the same
underlying formula) so the two can diverge later without a refactor.

---

## 3. ⚠️ Still open — confirm with the product owner before finalizing logic

1. **Minimum loan floor of 5,000**: for short terms, a client at the ability floor (371)
   will compute to a loan amount *below* 5,000 (since a shorter term demands a higher
   ability for the same principal). Should the app:
   - (a) exclude any term whose computed amount falls below 5,000 from the results table, or
   - (b) show the exact computed amount anyway, even if it's below 5,000?
   Default assumption if unconfirmed: **(a)**, matching the schedule's printed minimum row.
2. **Retirement age** used for the cutoff rule (used to compute months-to-retirement).
   Build this as a single named constant (e.g. `RETIREMENT_AGE`) so it's a one-line
   change once confirmed — do not hardcode it inline in multiple places.

Wherever these are used in the code, add a `// CONFIRM WITH TIJAARA` comment so they're
easy to locate and adjust later.

---

## 4. Core inputs (from payslip, manual entry)

Build a form with the following fields:
- Basic Salary (number)
- Net Salary (number)
- Has Allowance Arrears? (yes/no toggle)
  - If yes: Allowance Arrears Amount (number)
- Age (number, whole years) — read directly off the payslip (e.g. 40, 35); used for the
  retirement rule. No date picker and no date-of-birth calculation — just take the
  age value as given.
- Loan Type: Conventional / Sharia-compliant (toggle) — same calculation, different labels
  ("Interest Rate" vs "Profit Rate") per section 2.7

All fields should have inline validation (no negative numbers, required fields, etc.).

---

## 5. Calculation logic (implementation reference)

### 5.1 Ability — see section 2.4 for the full rule.

### 5.2 Loan amount per term

For each of the 13 terms `T` in the table in section 2.2:

```
rawAmount = (ability - ledgerFee[T]) / (1/T + interestRate[T] + insuranceRate[T]/T)
maxLoanAmount(T) = min(rawAmount, 3_000_000)
```

- If `rawAmount <= 0`, this term is not viable at all — exclude it entirely.
- If `rawAmount < 5000`, apply the rule confirmed for section 3, item 1.
- Display exactly as calculated (section 2.5) — no rounding.

### 5.3 Retirement cutoff rule

Age is entered directly (no date of birth, no date picker — see section 4). This means
the calculation works in whole years, not exact months:

```
yearsToRetirement  = retirementAge - age
monthsToRetirement = yearsToRetirement * 12
maxAllowedTerm      = monthsToRetirement - 3
```

- Only show/allow term options `T <= maxAllowedTerm`, drawn from the fixed 13-term list
  in section 2.2 (not every value up to `maxAllowedTerm`).
- If `maxAllowedTerm < 3`, the client is ineligible for any new loan — show a clear
  message ("Client is within 3 months of retirement and cannot be issued a new loan
  per policy.").
- Note this is a deliberate simplification: since only a whole-number age is available
  (not an exact birth date), `monthsToRetirement` is necessarily an estimate accurate to
  within about a year, not to the month. This is expected and does not need finer
  precision.

### 5.4 Sharia-compliant loans

See section 2.7 — identical calculation, different labels only.

---

## 6. Output / Results screen

After the form is submitted and the client qualifies, show:
- Computed ability (and new net salary, if arrears applied), with the formula shown
  for transparency/auditability.
- A table with columns: **Term (months) | Interest/Profit Rate | Max Loan Amount |
  Monthly Repayment (=ability)** for every one of the 13 approved terms that is both
  viable (section 5.2) and allowed by the retirement rule (section 5.3).
- Terms disallowed by the retirement rule should either be omitted or shown greyed-out
  with a note explaining why.
- A summary card highlighting the maximum loan amount available (longest allowed,
  viable term).
- A "Print / Save as PDF" button that produces a clean, single-page printable summary
  (client details, ability, chosen loan type, and the full term/amount table) — use the
  browser's native print stylesheet (`@media print`) rather than a heavy PDF library,
  to keep this simple.

---

## 7. Non-functional requirements

- **Framework**: Next.js (App Router), TypeScript.
- **Styling**: Tailwind CSS, clean and simple — this is an internal financial tool, not
  a marketing site. Favor clarity and legibility of numbers over decoration.
- **PWA**: Add a manifest.json, service worker (e.g., via `next-pwa` or manual
  implementation), and app icons so it's installable on mobile home screens.
  All calculations should work fully offline once the app shell is cached — no backend
  calls are required for the core calculator.
- **State**: No database or auth required for v1. The app is a stateless calculator —
  each session starts fresh. Do not persist client data unless later told otherwise
  (this involves handling personal financial data, so persistence should not be added
  without an explicit decision on storage/privacy requirements).
- **Validation**: All numeric fields should reject negative numbers and non-numeric input.
  Age should be a whole number within a sane working-age range (e.g. reject under 18 or
  over ~100).
- **Accessibility**: Use semantic HTML, proper label/input associations, and sufficient
  color contrast — this may be used on a variety of devices in branch settings.
- **Currency formatting**: Use a configurable currency symbol/locale constant at the top
  of the codebase (default to a placeholder like "KES" until confirmed) so it's a
  one-line change to adjust later.

---

## 8. Suggested file/component structure

- `app/page.tsx` — main form + results flow
- `lib/schedule.ts` — the 13-term constant table from section 2.2 (single source of truth)
- `lib/calculations.ts` — pure functions for ability, loan-amount-per-term, retirement
  cutoff, clearly separated and unit-testable, with the `// CONFIRM WITH TIJAARA` markers
  from section 3
- `components/PayslipForm.tsx`
- `components/ResultsTable.tsx`
- `components/PrintableSummary.tsx`
- `public/manifest.json`, service worker config

## 9. Testing

Include a small set of unit tests for `lib/calculations.ts` covering:
- Ability calculation with and without arrears
- Boundary conditions (ability just below 371, just above 78,887)
- Retirement cutoff producing a reduced max term, and the "ineligible" case
- Loan amount formula reproducing known values from the source schedule exactly, e.g.:
  - Ability that yields exactly 5,000 at 120 months → installment 371.06
  - Ability that yields exactly 2,300,000 at 120 months → installment 78,886.83
  - A handful of other (loan amount, term) → installment pairs pulled directly from
    the "New Schedule" tab, to catch any transcription error in the constants table
