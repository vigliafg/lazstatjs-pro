/**
 * Tabular CUSUM (cumulative sum) control chart.
 *
 * The chart accumulates small shifts that a Shewhart chart ignores. With the
 * target μ and the process SD σ, the one-sided sums are
 *
 *   C⁺ᵢ = max(0, C⁺ᵢ₋₁ + (xᵢ − μ) − kσ)
 *   C⁻ᵢ = max(0, C⁻ᵢ₋₁ − (xᵢ − μ) − kσ)
 *
 * with allowance k and decision interval h expressed in sigma units. The
 * conventional choices are k = 0.5 and h = 4 or 5; the first point above h is
 * the signal. Parameters are in sigma units so the chart does not depend on
 * the scale of the measurement.
 */

import type { CusumPoint, CusumResult } from '../analysisResults';
export type { CusumPoint, CusumResult } from '../analysisResults';
export interface CusumOptions {
  /** Target mean; the sample mean when omitted. */
  target?: number;
  /** Allowance in sigma units (default 0.5). */
  k?: number;
  /** Decision interval in sigma units (default 4). */
  h?: number;
}

const mean = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const sampleSd = (values: number[], centre: number): number => {
  if (values.length < 2) return Number.NaN;
  const sse = values.reduce((sum, value) => sum + Math.pow(value - centre, 2), 0);
  return Math.sqrt(sse / (values.length - 1));
};

export const cusumChart = (
  values: number[],
  options: CusumOptions = {}
): CusumResult | null => {
  const observed = values.filter(value => Number.isFinite(value));
  if (observed.length < 4) return null;
  const centre = options.target ?? mean(observed);
  const sigma = sampleSd(observed, mean(observed));
  if (!(sigma > 0)) return null;
  const k = options.k ?? 0.5;
  const h = options.h ?? 4;
  if (!(k > 0) || !(h > 0)) return null;

  const allowance = k * sigma;
  const limit = h * sigma;
  const upper = limit;
  const lower = -limit;
  let cplus = 0;
  let cminus = 0;
  let firstHigh: number | null = null;
  let firstLow: number | null = null;

  const points: CusumPoint[] = observed.map((value, position) => {
    cplus = Math.max(0, cplus + (value - centre) - allowance);
    cminus = Math.max(0, cminus + (centre - value) - allowance);
    let signal: 'high' | 'low' | null = null;
    if (cplus > limit && firstHigh === null) {
      signal = 'high';
      firstHigh = position + 1;
    }
    if (cminus > limit && firstLow === null) {
      signal = 'low';
      firstLow = position + 1;
    }
    return { index: position + 1, value, cplus, cminus, signal };
  });

  return { center: centre, sigma, k, h, upper, lower, points, firstHigh, firstLow };
};
