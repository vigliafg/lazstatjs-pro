/**
 * Normal tolerance interval.
 *
 * A tolerance interval is not a confidence interval for the mean: it is an
 * interval that contains a stated proportion of the *population* with a stated
 * confidence. For a normal population the interval is x̄ ± k·s, where k grows
 * when the sample is small or the requested confidence/proportion is high.
 *
 * The factor uses Howe's approximation
 *
 *   k = sqrt( (n - 1)(1 + 1/n) z² / χ²_{α, n-1} ),
 *   z = z_{(1 + p) / 2},  α = 1 − confidence,
 *
 * which is the closed form used by most textbooks and agrees with the exact
 * noncentral-t factor to about 0.1% at n = 10. The exact factor is not
 * implemented: the reference test pins Howe's value and the published table
 * entry, and the procedure labels the method so the difference is visible.
 */
import { jStat } from '../jstat';

export interface ToleranceInterval {
  n: number;
  mean: number;
  sd: number;
  /** Population proportion covered, 0–1. */
  proportion: number;
  /** Confidence that the interval covers it, 0–1. */
  confidence: number;
  /** Tolerance factor k. */
  k: number;
  lo: number;
  hi: number;
  method: string;
}

const mean = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const sampleSd = (values: number[], centre: number): number => {
  if (values.length < 2) return Number.NaN;
  const sse = values.reduce((sum, value) => sum + Math.pow(value - centre, 2), 0);
  return Math.sqrt(sse / (values.length - 1));
};

/** Two-sided normal tolerance interval (Howe's factor). */
export const toleranceInterval = (
  values: number[],
  proportion = 0.95,
  confidence = 0.95
): ToleranceInterval | null => {
  const n = values.length;
  if (n < 2 || values.some(value => !Number.isFinite(value))) return null;
  if (!(proportion > 0 && proportion < 1) || !(confidence > 0 && confidence < 1)) return null;
  const centre = mean(values);
  const sd = sampleSd(values, centre);
  if (!(sd > 0)) return null;

  // z_{(1 + p) / 2} of the standard normal.
  const z = jStat.normal.inv((1 + proportion) / 2, 0, 1);
  const alpha = 1 - confidence;
  const chi2 = jStat.chisquare.inv(alpha, n - 1);
  if (!(chi2 > 0)) return null;
  const k = Math.sqrt(((n - 1) * (1 + 1 / n) * z * z) / chi2);

  return {
    n,
    mean: centre,
    sd,
    proportion,
    confidence,
    k,
    lo: centre - k * sd,
    hi: centre + k * sd,
    method: 'approssimazione di Howe (normale, due code)',
  };
};

/** Fraction of the observed sample inside the interval (a sanity check). */
export const observedCoverage = (values: number[], interval: ToleranceInterval): number => {
  if (values.length === 0) return Number.NaN;
  return values.filter(value => value >= interval.lo && value <= interval.hi).length / values.length;
};
