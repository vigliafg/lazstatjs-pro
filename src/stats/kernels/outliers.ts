/**
 * Outlier tests for a single numeric sample: Grubbs (extreme value) and Dixon
 * (ratio of adjacent order statistics).
 *
 * Both tests ask the same question — is the most extreme observation
 * consistent with the rest of the sample? — but they answer it differently:
 * Grubbs standardises against the mean and SD, Dixon compares neighbouring
 * gaps and is therefore more robust and only defined for small samples.
 *
 * Dixon's null distribution is exact and worth deriving rather than tabulating.
 * For n uniform observations the spacings are exchangeable exponentials, so:
 *
 * - r10 = D1 / (D1 + … + D(n-1))                 → Beta(1, n-2)
 * - r11 = D1 / (D1 + … + D(n-2))                 → Beta(1, n-3)
 * - r21 = (D1 + D2) / (D1 + … + D(n-2))          → Beta(2, n-4)
 * - r22 = (D1 + D2) / (D1 + … + D(n-3))          → Beta(2, n-5)
 *
 * The p-value is the upper tail of that Beta distribution, doubled for the
 * two-sided test. This reproduces the published Dixon tables without
 * interpolating them.
 */
import { jStat } from '../jstat';
import { tSF } from './distributions';
import type { GrubbsResult, DixonResult, DixonType } from '../analysisResults';
export type { GrubbsResult, DixonResult, DixonType } from '../analysisResults';

const mean = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const sampleSd = (values: number[], centre: number): number => {
  if (values.length < 2) return Number.NaN;
  const sse = values.reduce((sum, value) => sum + Math.pow(value - centre, 2), 0);
  return Math.sqrt(sse / (values.length - 1));
};

/** Largest absolute deviation, with the index that produced it. */
const extreme = (values: number[], centre: number): { index: number; deviation: number } => {
  let index = 0;
  let deviation = -1;
  values.forEach((value, position) => {
    const distance = Math.abs(value - centre);
    if (distance > deviation) {
      deviation = distance;
      index = position;
    }
  });
  return { index, deviation };
};

/**
 * Two-sided Grubbs test. The p-value comes from the Student t distribution
 * with n − 2 degrees of freedom (Grubbs 1969):
 *
 *   t = sqrt(n (n - 2) G² / ((n - 1)² - n G²)),  p = 2 n P(T > t).
 */
export const grubbsTest = (values: number[], level = 95): GrubbsResult | null => {
  const n = values.length;
  if (n < 3 || values.some(value => !Number.isFinite(value))) return null;
  const centre = mean(values);
  const sd = sampleSd(values, centre);
  if (!(sd > 0)) return null;

  const { index, deviation } = extreme(values, centre);
  const statistic = deviation / sd;
  const denominator = Math.pow(n - 1, 2) - n * statistic * statistic;
  const t = denominator > 0 ? Math.sqrt((n * (n - 2) * statistic * statistic) / denominator) : Infinity;
  const p = Math.min(1, 2 * n * tSF(t, n - 2));

  const alpha = 1 - level / 100;
  const tCritical = jStat.studentt.inv(1 - alpha / (2 * n), n - 2);
  const critical =
    ((n - 1) / Math.sqrt(n)) *
    Math.sqrt((tCritical * tCritical) / (n - 2 + tCritical * tCritical));

  return {
    n,
    statistic,
    critical,
    p,
    outlier: values[index],
    side: values[index] > centre ? 'high' : 'low',
    mean: centre,
    sd,
  };
};

/** Dixon Q test; defined for 3 ≤ n ≤ 30 and selects the published ratio. */
export const dixonTest = (values: number[], level = 95): DixonResult | null => {
  const n = values.length;
  if (n < 3 || n > 30 || values.some(value => !Number.isFinite(value))) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const first = sorted[0];
  const last = sorted[n - 1];

  let type: DixonType;
  let low: number;
  let high: number;
  let beta: { a: number; b: number };

  if (n <= 7) {
    type = 'r10';
    low = (sorted[1] - first) / (last - first);
    high = (last - sorted[n - 2]) / (last - first);
    beta = { a: 1, b: n - 2 };
  } else if (n <= 10) {
    type = 'r11';
    low = (sorted[1] - first) / (sorted[n - 2] - first);
    high = (last - sorted[n - 2]) / (last - sorted[1]);
    beta = { a: 1, b: n - 3 };
  } else if (n <= 13) {
    type = 'r21';
    low = (sorted[2] - first) / (sorted[n - 2] - first);
    high = (last - sorted[n - 3]) / (last - sorted[1]);
    beta = { a: 2, b: n - 4 };
  } else {
    type = 'r22';
    low = (sorted[2] - first) / (sorted[n - 3] - first);
    high = (last - sorted[n - 3]) / (last - sorted[2]);
    beta = { a: 2, b: n - 5 };
  }

  if (!Number.isFinite(low) || !Number.isFinite(high)) return null;
  const side = low >= high ? 'low' : 'high';
  const statistic = side === 'low' ? low : high;
  const oneSided = Math.min(1, Math.max(0, 1 - jStat.beta.cdf(statistic, beta.a, beta.b)));
  const p = Math.min(1, 2 * oneSided);
  const critical = jStat.beta.inv(1 - (1 - level / 100) / 2, beta.a, beta.b);

  return {
    n,
    type,
    statistic,
    critical,
    p,
    outlier: side === 'low' ? first : last,
    side,
    beta,
  };
};
