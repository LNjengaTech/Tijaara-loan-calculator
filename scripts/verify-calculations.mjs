// scripts/verify-calculations.mjs
// Standalone runner to verify all calculation test cases with zero extra dependencies

const APPROVED_TERMS = [
  { term: 3,   interestRate: 0.1000,  insuranceRate: 0.0250, ledgerFee: 150, processingFeeRate: 0 },
  { term: 6,   interestRate: 0.0850,  insuranceRate: 0.0250, ledgerFee: 150, processingFeeRate: 0 },
  { term: 12,  interestRate: 0.0750,  insuranceRate: 0.0250, ledgerFee: 150, processingFeeRate: 0 },
  { term: 18,  interestRate: 0.0600,  insuranceRate: 0.0375, ledgerFee: 150, processingFeeRate: 0 },
  { term: 24,  interestRate: 0.0500,  insuranceRate: 0.0500, ledgerFee: 150, processingFeeRate: 0 },
  { term: 36,  interestRate: 0.0450,  insuranceRate: 0.0750, ledgerFee: 150, processingFeeRate: 0 },
  { term: 48,  interestRate: 0.0400,  insuranceRate: 0.1000, ledgerFee: 150, processingFeeRate: 0 },
  { term: 60,  interestRate: 0.0350,  insuranceRate: 0.1250, ledgerFee: 150, processingFeeRate: 0 },
  { term: 72,  interestRate: 0.02181, insuranceRate: 0.1500, ledgerFee: 200, processingFeeRate: 0 },
  { term: 84,  interestRate: 0.02254, insuranceRate: 0.1750, ledgerFee: 200, processingFeeRate: 0 },
  { term: 96,  interestRate: 0.02322, insuranceRate: 0.1750, ledgerFee: 200, processingFeeRate: 0 },
  { term: 108, interestRate: 0.02384, insuranceRate: 0.1750, ledgerFee: 200, processingFeeRate: 0 },
  { term: 120, interestRate: 0.02442, insuranceRate: 0.1750, ledgerFee: 200, processingFeeRate: 0 },
];

function calculateInstallment(principal, config) {
  const termFactor = 1 / config.term + config.interestRate + config.insuranceRate / config.term;
  return principal * termFactor + config.ledgerFee;
}

function calculateRawLoanAmount(ability, config) {
  const netAbility = ability - config.ledgerFee;
  if (netAbility <= 0) return 0;
  const termFactor = 1 / config.term + config.interestRate + config.insuranceRate / config.term;
  return netAbility / termFactor;
}

function calculateAbility(netSalary, basicSalary, hasAllowanceArrears, allowanceArrears) {
  const newNetSalary = hasAllowanceArrears ? netSalary - allowanceArrears : netSalary;
  const ability = newNetSalary - basicSalary / 3;
  return { ability, newNetSalary };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- Running Tijaara Calculations Verification ---');

// 1. Ability without arrears
const ab1 = calculateAbility(25000, 30000, false, 0);
assert(ab1.ability === 15000, 'Ability without arrears: 25000 - (30000/3) = 15000');

// 2. Ability with arrears
const ab2 = calculateAbility(25000, 30000, true, 5000);
assert(ab2.ability === 10000, 'Ability with arrears: (25000 - 5000) - (30000/3) = 10000');

// 3. Known Schedule: 5,000 at 120 months -> 371.06
const t120 = APPROVED_TERMS.find(t => t.term === 120);
const inst1 = calculateInstallment(5000, t120);
assert(inst1.toFixed(2) === '371.06', `5,000 at 120 months produces 371.06 (got ${inst1.toFixed(2)})`);

const loan1 = calculateRawLoanAmount(inst1, t120);
assert(Math.round(loan1) === 5000, `Inverse calculation of 371.06 at 120m produces 5,000 (got ${Math.round(loan1)})`);

// 4. Known Schedule: 2,300,000 at 120 months -> 78,886.83
const inst2 = calculateInstallment(2300000, t120);
assert(inst2.toFixed(2) === '78886.83', `2,300,000 at 120 months produces 78,886.83 (got ${inst2.toFixed(2)})`);

const loan2 = calculateRawLoanAmount(inst2, t120);
assert(Math.round(loan2) === 2300000, `Inverse calculation of 78,886.83 at 120m produces 2,300,000 (got ${Math.round(loan2)})`);

// 5. 10,000 at 3 months
const t3 = APPROVED_TERMS.find(t => t.term === 3);
const inst3 = calculateInstallment(10000, t3);
assert(inst3.toFixed(2) === '4566.67', `10,000 at 3 months produces 4566.67 (got ${inst3.toFixed(2)})`);

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
