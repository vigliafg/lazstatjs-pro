/**
 * Sign test for paired differences (or a one-sample median).
 *
 * The sign test ignores magnitudes: it counts how many differences are above
 * and below zero and compares that split with a fair coin. It is the most
 * robust paired test, at the price of low power. Zeros are discarded, as in
 * `binom.test` applied to the non-zero differences.
 */
import { zTwoSidedP } from './distributions';
import { exactBinomialP } from './proportions';

export interface SignTestResult {
  /** Non-zero differences actually used. */
  n: number;
  zeros: number;
  positive: number;
  negative: number;
  /** Exact two-sided binomial p-value with p = 0.5. */
  exactP: number;
  /** Normal approximation with continuity correction. */
  z: number;
  asymptoticP: number;
  median: number;
}

export const signTest = (differences: number[]): SignTestResult | null => {
  const finite = differences.filter(value => Number.isFinite(value));
  const nonZero = finite.filter(value => value !== 0);
  if (nonZero.length < 1) return null;
  const n = nonZero.length;
  const positive = nonZero.filter(value => value > 0).length;
  const negative = n - positive;
  const z = (positive - n / 2 - 0.5 * Math.sign(positive - n / 2)) / Math.sqrt(n * 0.25);

  return {
    n,
    zeros: finite.length - n,
    positive,
    negative,
    exactP: exactBinomialP(positive, n, 0.5),
    z,
    asymptoticP: zTwoSidedP(z),
    median: medianOf(nonZero),
  };
};

const medianOf = (values: number[]): number => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
