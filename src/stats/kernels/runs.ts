/**
 * Runs test (Wald–Wolfowitz) for a single sequence.
 *
 * The observations are split at a cut point — the median by default, as in
 * Minitab and R's `randtests::runs.test` — and the test counts how often the
 * side changes. Too few runs means clustering, too many means alternation;
 * both depart from exchangeability.
 *
 * Ties at the cut point are assigned to the lower side (`value <= cut`), the
 * same convention as `randtests`. The asymptotic p-value uses the normal
 * approximation with the usual continuity correction; when the sequence is
 * small enough the exact conditional distribution of the number of runs is
 * also returned, so the approximation can be checked instead of trusted.
 */
import { zTwoSidedP } from './distributions';
import type { RunsResult } from '../analysisResults';
export type { RunsResult } from '../analysisResults';

const medianOf = (values: number[]): number => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/** Binomial coefficient as a double; exact for the n ≤ 50 range used here. */
const choose = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0;
  const limit = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < limit; i += 1) result = (result * (n - i)) / (i + 1);
  return Math.round(result);
};

/**
 * Exact two-sided p-value from the conditional distribution of the number of
 * runs given `above` and `below` (a standard combinatorial result).
 */
export const exactRunsPValue = (runs: number, above: number, below: number): number | null => {
  const n = above + below;
  if (n > 50 || above < 1 || below < 1) return null;
  const total = choose(n, above);
  const atMost = (limit: number): number => {
    let count = 0;
    for (let r = 2; r <= limit; r += 1) {
      const even = r % 2 === 0;
      const a = even ? r / 2 : (r - 1) / 2;
      const b = even ? r / 2 : (r + 1) / 2;
      count +=
        choose(above - 1, a - 1) * choose(below - 1, b - 1) +
        choose(above - 1, b - 1) * choose(below - 1, a - 1);
    }
    return count;
  };
  const lower = atMost(runs);
  const upper = total - atMost(runs - 1);
  return Math.min(1, (2 * Math.min(lower, upper)) / total);
};

/** Wald–Wolfowitz runs test around the median (or an explicit cut point). */
export const runsTest = (
  values: number[],
  options: { cut?: number } = {}
): RunsResult | null => {
  const observed = values.filter(value => Number.isFinite(value));
  const n = observed.length;
  if (n < 4) return null;
  const cut = options.cut ?? medianOf(observed);
  const sides = observed.map(value => (value > cut ? 1 : 0) as 0 | 1);
  const above = sides.reduce((sum, side) => sum + side, 0);
  const below = n - above;
  if (above < 1 || below < 1) return null;

  let runs = 1;
  for (let i = 1; i < n; i += 1) if (sides[i] !== sides[i - 1]) runs += 1;

  const expected = (2 * above * below) / n + 1;
  const variance = (2 * above * below * (2 * above * below - n)) / (n * n * (n - 1));
  const sd = Math.sqrt(Math.max(0, variance));
  const correction = sd > 0 ? (0.5 * Math.sign(expected - runs)) / sd : 0;
  const z = sd > 0 ? (runs - expected) / sd + correction : Number.NaN;
  const p = Number.isFinite(z) ? zTwoSidedP(z) : Number.NaN;

  return {
    n,
    above,
    below,
    cut,
    runs,
    expected,
    sd,
    z,
    p,
    exactP: exactRunsPValue(runs, above, below),
    firstSide: sides[0],
  };
};
