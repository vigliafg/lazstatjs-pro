// Helper for log-factorials to prevent overflow in Fisher's exact test
export const logFactorial = (n: number): number => {
  let ans = 0;
  for (let i = 2; i <= n; i++) {
    ans += Math.log(i);
  }
  return ans;
};

// Calculate probability of a specific 2x2 table configuration
export const fisherTableProb = (a: number, b: number, c: number, d: number): number => {
  const n = a + b + c + d;
  const logNumerator = logFactorial(a + b) + logFactorial(c + d) + logFactorial(a + c) + logFactorial(b + d);
  const logDenominator = logFactorial(a) + logFactorial(b) + logFactorial(c) + logFactorial(d) + logFactorial(n);
  return Math.exp(logNumerator - logDenominator);
};

/**
 * Fisher's Exact Test for 2x2 contingency tables
 * Returns the exact two-tailed p-value
 */
export const calcFisherExact = (a: number, b: number, c: number, d: number): number => {
  const r1 = a + b;
  const r2 = c + d;
  const c1 = a + c;
  const c2 = b + d;
  const n = r1 + r2;

  if (n === 0) return 1.0;

  const obsProb = fisherTableProb(a, b, c, d);

  // Determine limits for the top-left cell (x)
  const minX = Math.max(0, r1 - c2, c1 - r2);
  const maxX = Math.min(r1, c1);

  let pValue = 0;
  for (let x = minX; x <= maxX; x++) {
    const ta = x;
    const tb = r1 - x;
    const tc = c1 - x;
    const td = r2 - tc;

    const prob = fisherTableProb(ta, tb, tc, td);
    // Sum probabilities <= observed probability (with tolerance for floating point)
    if (prob <= obsProb + 1e-9) {
      pValue += prob;
    }
  }

  // Cap at 1.0
  return Math.min(1.0, pValue);
};
