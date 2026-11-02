/**
 * One- and two-sample tests for proportions.
 *
 * The exact binomial test is the reference for small counts; the Wilson score
 * interval is reported for each proportion because it keeps the nominal
 * coverage near the boundary and matches `prop.test(correct = FALSE)`. The
 * two-sample test compares the difference with the pooled normal approximation
 * and its Wald interval, again matching `prop.test(correct = FALSE)`.
 */
import { jStat } from '../jstat';
import { chi2SF } from './distributions';
import { logFactorial } from './exact';

const alphaOf = (level: number): number => 1 - level / 100;

const logChoose = (n: number, k: number): number =>
  logFactorial(n) - logFactorial(k) - logFactorial(n - k);

/** Two-sided exact binomial p-value, summing outcomes no more likely than x. */
export const exactBinomialP = (successes: number, trials: number, p0: number): number => {
  if (!(trials > 0) || successes < 0 || successes > trials) return Number.NaN;
  if (!(p0 >= 0 && p0 <= 1)) return Number.NaN;
  if (p0 === 0) return successes === 0 ? 1 : 0;
  if (p0 === 1) return successes === trials ? 1 : 0;

  const logPmf = (k: number): number =>
    logChoose(trials, k) + k * Math.log(p0) + (trials - k) * Math.log(1 - p0);
  const observed = logPmf(successes);
  const tolerance = 1e-7;
  let total = 0;
  for (let k = 0; k <= trials; k += 1) {
    const value = logPmf(k);
    if (value <= observed + tolerance) total += Math.exp(value);
  }
  return Math.min(1, total);
};

export interface ProportionInterval {
  estimate: number;
  wilsonLo: number;
  wilsonHi: number;
  clopperLo: number;
  clopperHi: number;
}

/** Wilson score interval and Clopper–Pearson exact interval for x / n. */
export const proportionInterval = (
  successes: number,
  trials: number,
  level = 95
): ProportionInterval => {
  const alpha = alphaOf(level);
  const p = successes / trials;
  const z = jStat.normal.inv(1 - alpha / 2, 0, 1);
  const denominator = 1 + (z * z) / trials;
  const centre = (p + (z * z) / (2 * trials)) / denominator;
  const half =
    (z * Math.sqrt((p * (1 - p)) / trials + (z * z) / (4 * trials * trials))) / denominator;
  return {
    estimate: p,
    wilsonLo: Math.max(0, centre - half),
    wilsonHi: Math.min(1, centre + half),
    clopperLo:
      successes === 0 ? 0 : jStat.beta.inv(alpha / 2, successes, trials - successes + 1),
    clopperHi:
      successes === trials ? 1 : jStat.beta.inv(1 - alpha / 2, successes + 1, trials - successes),
  };
};

export interface OneProportionResult {
  successes: number;
  trials: number;
  estimate: number;
  nullValue: number;
  exactP: number;
  /** Pearson chi-square statistic against the null proportion. */
  chi2: number;
  /** Normal-approximation p-value (same as the chi-square with 1 df). */
  asymptoticP: number;
  level: number;
  interval: ProportionInterval;
}

export const oneProportion = (
  successes: number,
  trials: number,
  nullValue = 0.5,
  level = 95
): OneProportionResult | null => {
  if (!(trials > 0) || successes < 0 || successes > trials) return null;
  if (!(nullValue > 0 && nullValue < 1)) return null;
  const estimate = successes / trials;
  const se = Math.sqrt((nullValue * (1 - nullValue)) / trials);
  const z = (estimate - nullValue) / se;
  const chi2 = z * z;
  return {
    successes,
    trials,
    estimate,
    nullValue,
    exactP: exactBinomialP(successes, trials, nullValue),
    chi2,
    asymptoticP: chi2SF(chi2, 1),
    level,
    interval: proportionInterval(successes, trials, level),
  };
};

export interface TwoProportionsResult {
  first: { successes: number; trials: number; estimate: number };
  second: { successes: number; trials: number; estimate: number };
  difference: number;
  standardError: number;
  lo: number;
  hi: number;
  /** Pooled z / Pearson chi-square statistic with 1 df. */
  chi2: number;
  pValue: number;
  riskRatio: number;
  oddsRatio: number;
  level: number;
}

export const twoProportions = (
  successes1: number,
  trials1: number,
  successes2: number,
  trials2: number,
  level = 95
): TwoProportionsResult | null => {
  if (trials1 <= 0 || trials2 <= 0) return null;
  if (successes1 < 0 || successes1 > trials1 || successes2 < 0 || successes2 > trials2) return null;
  const p1 = successes1 / trials1;
  const p2 = successes2 / trials2;
  const difference = p1 - p2;
  const se = Math.sqrt((p1 * (1 - p1)) / trials1 + (p2 * (1 - p2)) / trials2);
  const pooled = (successes1 + successes2) / (trials1 + trials2);
  const pooledSe = Math.sqrt(pooled * (1 - pooled) * (1 / trials1 + 1 / trials2));
  const z = pooledSe > 0 ? difference / pooledSe : Number.NaN;
  const chi2 = z * z;
  const critical = jStat.normal.inv(1 - alphaOf(level) / 2, 0, 1);
  const oddsRatio =
    successes1 > 0 && successes2 > 0 && successes1 < trials1 && successes2 < trials2
      ? (successes1 / (trials1 - successes1)) / (successes2 / (trials2 - successes2))
      : Number.NaN;

  return {
    first: { successes: successes1, trials: trials1, estimate: p1 },
    second: { successes: successes2, trials: trials2, estimate: p2 },
    difference,
    standardError: se,
    lo: difference - critical * se,
    hi: difference + critical * se,
    chi2,
    pValue: chi2SF(chi2, 1),
    riskRatio: p2 > 0 ? p1 / p2 : Number.NaN,
    oddsRatio,
    level,
  };
};
