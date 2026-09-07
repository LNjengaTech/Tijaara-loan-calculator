# scripts/verify-schedule.py
# Independent verification script in Python to test all calculations against Tijaara requirements

APPROVED_TERMS = [
  { 'term': 3,   'interestRate': 0.1000,  'insuranceRate': 0.0250, 'ledgerFee': 150, 'processingFeeRate': 0 },
  { 'term': 6,   'interestRate': 0.0850,  'insuranceRate': 0.0250, 'ledgerFee': 150, 'processingFeeRate': 0 },
  { 'term': 12,  'interestRate': 0.0750,  'insuranceRate': 0.0250, 'ledgerFee': 150, 'processingFeeRate': 0 },
  { 'term': 18,  'interestRate': 0.0600,  'insuranceRate': 0.0375, 'ledgerFee': 150, 'processingFeeRate': 0 },
  { 'term': 24,  'interestRate': 0.0500,  'insuranceRate': 0.0500, 'ledgerFee': 150, 'processingFeeRate': 0 },
  { 'term': 36,  'interestRate': 0.0450,  'insuranceRate': 0.0750, 'ledgerFee': 150, 'processingFeeRate': 0 },
  { 'term': 48,  'interestRate': 0.0400,  'insuranceRate': 0.1000, 'ledgerFee': 150, 'processingFeeRate': 0 },
  { 'term': 60,  'interestRate': 0.0350,  'insuranceRate': 0.1250, 'ledgerFee': 150, 'processingFeeRate': 0 },
  { 'term': 72,  'interestRate': 0.02181, 'insuranceRate': 0.1500, 'ledgerFee': 200, 'processingFeeRate': 0 },
  { 'term': 84,  'interestRate': 0.02254, 'insuranceRate': 0.1750, 'ledgerFee': 200, 'processingFeeRate': 0 },
  { 'term': 96,  'interestRate': 0.02322, 'insuranceRate': 0.1750, 'ledgerFee': 200, 'processingFeeRate': 0 },
  { 'term': 108, 'interestRate': 0.02384, 'insuranceRate': 0.1750, 'ledgerFee': 200, 'processingFeeRate': 0 },
  { 'term': 120, 'interestRate': 0.02442, 'insuranceRate': 0.1750, 'ledgerFee': 200, 'processingFeeRate': 0 },
]

def installment(p, cfg):
    t = cfg['term']
    term_factor = 1.0 / t + cfg['interestRate'] + (cfg['insuranceRate'] / t)
    return p * term_factor + cfg['ledgerFee']

def max_loan(a, cfg):
    t = cfg['term']
    net_a = a - cfg['ledgerFee']
    if net_a <= 0:
        return 0
    term_factor = 1.0 / t + cfg['interestRate'] + (cfg['insuranceRate'] / t)
    return net_a / term_factor

def ability(net_salary, basic_salary, has_arrears, arrears):
    new_net = net_salary - arrears if has_arrears else net_salary
    return new_net - (basic_salary / 3.0)

t120 = [t for t in APPROVED_TERMS if t['term'] == 120][0]

# Test 1: Ability that yields exactly 5,000 at 120 months -> installment 371.06
inst_5k = installment(5000, t120)
print(f"5,000 at 120 months installment: {inst_5k:.2f}")
assert round(inst_5k, 2) == 371.06, f"Expected 371.06, got {inst_5k:.2f}"
inv_5k = max_loan(inst_5k, t120)
print(f"Inverse of {inst_5k:.2f} at 120 months: {inv_5k:.2f}")
assert round(inv_5k) == 5000

# Test 2: Ability that yields exactly 2,300,000 at 120 months -> installment 78,886.83
inst_23m = installment(2300000, t120)
print(f"2,300,000 at 120 months installment: {inst_23m:.2f}")
assert round(inst_23m, 2) == 78886.83, f"Expected 78886.83, got {inst_23m:.2f}"
inv_23m = max_loan(inst_23m, t120)
print(f"Inverse of {inst_23m:.2f} at 120 months: {inv_23m:.2f}")
assert round(inv_23m) == 2300000

# Test 3: Ability without arrears
ab1 = ability(25000, 30000, False, 0)
assert ab1 == 15000, f"Expected 15000, got {ab1}"

# Test 4: Ability with arrears
ab2 = ability(25000, 30000, True, 5000)
assert ab2 == 10000, f"Expected 10000, got {ab2}"

print("ALL MATHEMATICAL CHECKS PASSED WITH 100% ACCURACY!")
