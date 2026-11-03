/**
 * Chi-square goodness-of-fit for a single categorical variable.
 *
 * Observed counts are compared with expected counts derived from a set of
 * proportions (equal shares by default). The statistic is Pearson's χ², the
 * same as `chisq.test(observed, p = proportions)`.
 */
import { chi2SF } from './distributions';
import type { GofResult } from '../analysisResults';
export type { GofResult } from '../analysisResults';

export const goodnessOfFit = (
  labels: string[],
  observed: number[],
  expectedProportions?: number[]
): GofResult | null => {
  if (labels.length < 2 || labels.length !== observed.length) return null;
  if (observed.some(count => !(count >= 0))) return null;
  const total = observed.reduce((sum, count) => sum + count, 0);
  if (!(total > 0)) return null;

  if (expectedProportions && expectedProportions.length > 0 && expectedProportions.length !== observed.length) {
    return null;
  }
  const raw =
    expectedProportions && expectedProportions.length === observed.length
      ? expectedProportions
      : observed.map(() => 1);
  if (raw.some(value => !(value > 0))) return null;
  const rawTotal = raw.reduce((sum, value) => sum + value, 0);
  if (!(rawTotal > 0)) return null;
  const proportions = raw.map(value => value / rawTotal);
  const expected = proportions.map(value => value * total);
  if (expected.some(value => !(value > 0))) return null;

  const chi2 = observed.reduce(
    (sum, count, index) => sum + Math.pow(count - expected[index], 2) / expected[index],
    0
  );
  const df = observed.length - 1;
  return { labels, observed, expected, proportions, total, chi2, df, p: chi2SF(chi2, df) };
};
