/**
 * One- and two-sample tests for Poisson rates.
 *
 * A rate is events per unit of exposure. The one-sample test compares the
 * observed count with λ₀·T and uses the exact Poisson tails; the interval is
 * the chi-square (Garwood) exact interval, which is what `poisson.test()`
 * reports. The two-sample test conditions on the total count: under equal
 * rates the first count is binomial with p = T₁ / (T₁ + T₂), so the exact
 * conditional p and the Clopper–Pearson transform give the same numbers as
 * `poisson.test(c(x1, x2), c(T1, T2))`.
 */
import { jStat } from '../jstat';
import { exactBinomialP } from './proportions';
import type { PoissonRateResult, TwoPoissonResult } from '../analysisResults';
export type { PoissonRateResult, TwoPoissonResult } from '../analysisResults';

const alphaOf = (level: number): number => 1 - level / 100;

const poissonCdf = (k: number, mean: number): number => {
  if (k < 0) return 0;
  return jStat.poisson.cdf(k, mean);
};

/**
 * Two-sided exact Poisson p-value using the same definition as R's
 * `poisson.test`: sum every outcome whose probability is no larger than the
 * observed one, not twice the smaller tail.
 */
export const exactPoissonP = (events: number, expected: number): number => {
  if (expected === 0) return events === 0 ? 1 : 0;
  if (events === expected) return 1;
  const observed = jStat.poisson.pdf(events, expected);
  const relative = 1 + 1e-7;
  if (events < expected) {
    let upper = Math.ceil(2 * expected - events);
    while (jStat.poisson.pdf(upper, expected) > observed && upper < 1e7) upper *= 2;
    let count = 0;
    for (let k = Math.ceil(expected); k <= upper; k += 1) {
      if (jStat.poisson.pdf(k, expected) <= observed * relative) count += 1;
    }
    return poissonCdf(events, expected) + (1 - poissonCdf(upper - count, expected));
  }
  let count = 0;
  for (let k = 0; k <= Math.floor(expected); k += 1) {
    if (jStat.poisson.pdf(k, expected) <= observed * relative) count += 1;
  }
  return poissonCdf(count - 1, expected) + (1 - poissonCdf(events - 1, expected));
};

export const onePoissonRate = (
  events: number,
  exposure: number,
  nullRate = 1,
  level = 95
): PoissonRateResult | null => {
  if (!(exposure > 0) || events < 0 || !(nullRate > 0)) return null;
  const alpha = alphaOf(level);
  const expected = nullRate * exposure;
  return {
    events,
    exposure,
    rate: events / exposure,
    nullRate,
    exactP: exactPoissonP(events, expected),
    lo: events === 0 ? 0 : jStat.chisquare.inv(alpha / 2, 2 * events) / (2 * exposure),
    hi: jStat.chisquare.inv(1 - alpha / 2, 2 * (events + 1)) / (2 * exposure),
    level,
  };
};

export const twoPoissonRates = (
  events1: number,
  exposure1: number,
  events2: number,
  exposure2: number,
  level = 95
): TwoPoissonResult | null => {
  if (!(exposure1 > 0) || !(exposure2 > 0) || events1 < 0 || events2 < 0) return null;
  const total = events1 + events2;
  if (total === 0) return null;
  const alpha = alphaOf(level);
  const conditional = exposure1 / (exposure1 + exposure2);
  const exactP = exactBinomialP(events1, total, conditional);

  // Clopper–Pearson for the conditional proportion, transformed to a ratio.
  const pLo = events1 === 0 ? 0 : jStat.beta.inv(alpha / 2, events1, total - events1 + 1);
  const pHi =
    events1 === total ? 1 : jStat.beta.inv(1 - alpha / 2, events1 + 1, total - events1);
  const scale = exposure2 / exposure1;

  return {
    first: { events: events1, exposure: exposure1, rate: events1 / exposure1 },
    second: { events: events2, exposure: exposure2, rate: events2 / exposure2 },
    ratio: (events1 / exposure1) / (events2 / exposure2),
    exactP,
    lo: (pLo / (1 - pLo)) * scale,
    hi: pHi >= 1 ? Number.POSITIVE_INFINITY : (pHi / (1 - pHi)) * scale,
    level,
  };
};
