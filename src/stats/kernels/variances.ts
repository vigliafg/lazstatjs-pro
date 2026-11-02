/**
 * Tests for one variance and for the equality of several variances.
 *
 * - One sample: the chi-square test for σ² (and its exact interval).
 * - Two samples: the F test for the ratio of variances, with the exact F
 *   interval (what `var.test` reports).
 * - Several groups: Bartlett's test (sensitive to non-normality) and Levene /
 *   Brown–Forsythe on the absolute deviations from the group medians (robust
 *   to non-normality), which is the default of `car::leveneTest(center =
 *   median)`.
 */
import { jStat } from '../jstat';
import { chi2SF, fSF } from './distributions';
import type { OneVarianceResult, VarianceGroupSummary, TwoVarianceResult } from '../analysisResults';
export type { OneVarianceResult, VarianceGroupSummary, TwoVarianceResult } from '../analysisResults';

const alphaOf = (level: number): number => 1 - level / 100;

const mean = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const sampleVariance = (values: number[]): number => {
  if (values.length < 2) return Number.NaN;
  const centre = mean(values);
  return values.reduce((sum, value) => sum + Math.pow(value - centre, 2), 0) / (values.length - 1);
};

const median = (values: number[]): number => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

export const oneVariance = (
  values: number[],
  nullVariance: number,
  level = 95
): OneVarianceResult | null => {
  const n = values.length;
  if (n < 2 || !(nullVariance > 0) || values.some(value => !Number.isFinite(value))) return null;
  const variance = sampleVariance(values);
  if (!(variance > 0)) return null;
  const df = n - 1;
  const chi2 = (df * variance) / nullVariance;
  const lower = jStat.chisquare.cdf(chi2, df);
  const alpha = alphaOf(level);
  return {
    n,
    variance,
    sd: Math.sqrt(variance),
    nullVariance,
    chi2,
    df,
    p: Math.min(1, 2 * Math.min(lower, 1 - lower)),
    lo: (df * variance) / jStat.chisquare.inv(1 - alpha / 2, df),
    hi: (df * variance) / jStat.chisquare.inv(alpha / 2, df),
    level,
  };
};

export interface VarianceGroup {
  name: string;
  values: number[];
}

const oneWayF = (groups: { values: number[] }[]): { f: number; df1: number; df2: number } | null => {
  const total = groups.reduce((sum, group) => sum + group.values.length, 0);
  const k = groups.length;
  if (k < 2 || total <= k) return null;
  const grand = groups.reduce(
    (sum, group) => sum + group.values.reduce((inner, value) => inner + value, 0),
    0
  ) / total;
  let between = 0;
  let within = 0;
  for (const group of groups) {
    const centre = mean(group.values);
    between += group.values.length * Math.pow(centre - grand, 2);
    within += group.values.reduce((sum, value) => sum + Math.pow(value - centre, 2), 0);
  }
  const df1 = k - 1;
  const df2 = total - k;
  if (!(within > 0) || df2 <= 0) return null;
  return { f: between / df1 / (within / df2), df1, df2 };
};

export const severalVariances = (
  input: VarianceGroup[],
  level = 95
): TwoVarianceResult | null => {
  const groups = input
    .map(group => ({
      name: group.name,
      values: group.values.filter(value => Number.isFinite(value)),
    }))
    .filter(group => group.values.length >= 2);
  if (groups.length < 2) return null;

  const summaries: VarianceGroupSummary[] = groups.map(group => {
    const variance = sampleVariance(group.values);
    return { name: group.name, n: group.values.length, variance, sd: Math.sqrt(variance) };
  });
  if (summaries.some(summary => !(summary.variance > 0))) return null;

  const alpha = alphaOf(level);
  const first = summaries[0];
  const second = summaries[1];
  const ratio = first.variance / second.variance;
  const df1 = first.n - 1;
  const df2 = second.n - 1;
  const fLower = jStat.centralF.cdf(ratio, df1, df2);
  const fP = Math.min(1, 2 * Math.min(fLower, 1 - fLower));

  // Bartlett
  const total = groups.reduce((sum, group) => sum + group.values.length, 0);
  const k = groups.length;
  const pooled =
    groups.reduce((sum, group) => sum + (group.values.length - 1) * sampleVariance(group.values), 0) /
    (total - k);
  const numerator = (total - k) * Math.log(pooled);
  const denominatorTerms = groups.reduce(
    (sum, group) => sum + (group.values.length - 1) * Math.log(sampleVariance(group.values)),
    0
  );
  const correction =
    1 +
    (1 / (3 * (k - 1))) *
      (groups.reduce((sum, group) => sum + 1 / (group.values.length - 1), 0) - 1 / (total - k));
  const bartlettStatistic = (numerator - denominatorTerms) / correction;
  const bartlettDf = k - 1;

  // Levene / Brown–Forsythe on |x − group median|
  const deviations = groups.map(group => {
    const centre = median(group.values);
    return { values: group.values.map(value => Math.abs(value - centre)) };
  });
  const leveneFit = oneWayF(deviations);

  return {
    groups: summaries,
    ratio,
    df1,
    df2,
    fP,
    fLo: ratio / jStat.centralF.inv(1 - alpha / 2, df1, df2),
    fHi: ratio / jStat.centralF.inv(alpha / 2, df1, df2),
    bartlett: {
      statistic: bartlettStatistic,
      df: bartlettDf,
      p: chi2SF(bartlettStatistic, bartlettDf),
    },
    levene: leveneFit
      ? {
          statistic: leveneFit.f,
          df1: leveneFit.df1,
          df2: leveneFit.df2,
          p: fSF(leveneFit.f, leveneFit.df1, leveneFit.df2),
        }
      : { statistic: Number.NaN, df1: k - 1, df2: total - k, p: Number.NaN },
    level,
  };
};
