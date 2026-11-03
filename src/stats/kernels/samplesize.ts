import { jStat } from '../jstat';
import { fSF } from '../distributions';
import { alphaOf } from './alpha';
import { logFactorial } from './exact';
import type { SampleSizeOptions, SampleSizeResult } from '../samplesize/types';

const zAlpha = (alpha: number, tails: 1 | 2): number =>
  jStat.normal.inv(1 - alpha / (tails === 2 ? 2 : 1), 0, 1);

const zPower = (power: number): number => jStat.normal.inv(power, 0, 1);

const normalPower = (ncp: number, critical: number): number =>
  1 - jStat.normal.cdf(critical - ncp, 0, 1);

/** Two independent means (or two groups), iterative t correction. */
export const sampleSizeTwoMeans = (
  delta: number,
  sd: number,
  alpha = 0.05,
  power = 0.8,
  tails: 1 | 2 = 2
): SampleSizeResult => {
  const effectSize = sd > 0 ? Math.abs(delta) / sd : NaN;
  const zA = zAlpha(alpha, tails);
  const zB = zPower(power);
  if (!isFinite(effectSize) || effectSize <= 0) {
    return { design: 'twoMeans', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize, method: '' };
  }

  let n = Math.max(2, Math.ceil(2 * Math.pow((zA + zB) / effectSize, 2)));
  for (let iteration = 0; iteration < 50; iteration++) {
    const df = 2 * n - 2;
    const tA = jStat.studentt.inv(1 - alpha / (tails === 2 ? 2 : 1), df);
    const next = Math.max(2, Math.ceil(2 * Math.pow((tA + zB) / effectSize, 2)));
    if (next === n) break;
    n = next;
  }

  const critical = jStat.studentt.inv(1 - alpha / (tails === 2 ? 2 : 1), 2 * n - 2);
  const achievedPower = normalPower(effectSize * Math.sqrt(n / 2), critical);

  return {
    design: 'twoMeans',
    nPerGroup: n,
    total: 2 * n,
    achievedPower,
    critical,
    effectSize,
    method: 't a due campioni, correzione iterativa dei df',
  };
};

/** One-sample mean (or paired differences). */
export const sampleSizeOneMean = (
  delta: number,
  sd: number,
  alpha = 0.05,
  power = 0.8,
  tails: 1 | 2 = 2,
  design: 'oneMean' | 'paired' = 'oneMean'
): SampleSizeResult => {
  const effectSize = sd > 0 ? Math.abs(delta) / sd : NaN;
  const zA = zAlpha(alpha, tails);
  const zB = zPower(power);
  if (!isFinite(effectSize) || effectSize <= 0) {
    return { design, nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize, method: '' };
  }

  let n = Math.max(2, Math.ceil(Math.pow((zA + zB) / effectSize, 2)));
  for (let iteration = 0; iteration < 50; iteration++) {
    const tA = jStat.studentt.inv(1 - alpha / (tails === 2 ? 2 : 1), n - 1);
    const next = Math.max(2, Math.ceil(Math.pow((tA + zB) / effectSize, 2)));
    if (next === n) break;
    n = next;
  }

  const critical = jStat.studentt.inv(1 - alpha / (tails === 2 ? 2 : 1), n - 1);
  const achievedPower = normalPower(effectSize * Math.sqrt(n), critical);

  return {
    design,
    nPerGroup: n,
    total: n,
    achievedPower,
    critical,
    effectSize,
    method: 't a un campione, correzione iterativa dei df',
  };
};

/** Two independent proportions, pooled variance (normal approximation). */
export const sampleSizeTwoProportions = (
  p1: number,
  p2: number,
  alpha = 0.05,
  power = 0.8,
  tails: 1 | 2 = 2
): SampleSizeResult => {
  const zA = zAlpha(alpha, tails);
  const zB = zPower(power);
  const delta = Math.abs(p1 - p2);
  const pooled = (p1 + p2) / 2;
  const effectSize = delta;
  if (delta <= 0 || pooled <= 0 || pooled >= 1) {
    return { design: 'twoProportions', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize, method: '' };
  }

  const n = Math.ceil(
    Math.pow(
      zA * Math.sqrt(2 * pooled * (1 - pooled)) + zB * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)),
      2
    ) / (delta * delta)
  );

  const seNull = Math.sqrt(2 * pooled * (1 - pooled) / n);
  const seAlt = Math.sqrt((p1 * (1 - p1) + p2 * (1 - p2)) / n);
  const achievedPower = normalPower(delta / seAlt, (zA * seNull) / seAlt);

  return {
    design: 'twoProportions',
    nPerGroup: n,
    total: 2 * n,
    achievedPower,
    critical: zA,
    effectSize,
    method: 'proporzioni, varianza pooled (approssimazione normale)',
  };
};

/** Correlation via Fisher z. */
export const sampleSizeCorrelation = (
  r: number,
  alpha = 0.05,
  power = 0.8,
  tails: 1 | 2 = 2
): SampleSizeResult => {
  const zA = zAlpha(alpha, tails);
  const zB = zPower(power);
  const effectSize = Math.abs(r);
  if (effectSize <= 0 || effectSize >= 1) {
    return { design: 'correlation', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize, method: '' };
  }

  const zr = Math.atanh(effectSize);
  const n = Math.ceil(Math.pow((zA + zB) / zr, 2) + 3);
  const ncp = zr * Math.sqrt(n - 3);
  const achievedPower = normalPower(ncp, zA);

  return {
    design: 'correlation',
    nPerGroup: n,
    total: n,
    achievedPower,
    critical: zA,
    effectSize,
    method: 'correlazione, trasformazione z di Fisher',
  };
};

/**
 * Poisson-weighted sum over the mixture index, starting at the mode so the
 * weights do not underflow for large noncentrality parameters.
 */
const poissonMixture = (lambda: number, term: (j: number) => number): number => {
  if (lambda === 0) return term(0);
  const half = lambda / 2;
  const mode = Math.floor(half);
  const maxJ = Math.max(mode + Math.ceil(10 * Math.sqrt(half + 1)) + 60, 100);
  const weight = Math.exp(-half + mode * Math.log(half) - logFactorial(mode));
  let total = 0;

  let current = weight;
  for (let j = mode; j >= 0; j--) {
    total += current * term(j);
    if (j === 0) break;
    current = current * (j / half);
  }

  current = (weight * half) / (mode + 1);
  for (let j = mode + 1; j <= maxJ && current > 0; j++) {
    total += current * term(j);
    current = (current * half) / (j + 1);
  }

  return Math.max(0, Math.min(1, total));
};

/**
 * Survival function of the noncentral F.
 *
 * The noncentral chi-square is χ²(df1 + 2J) with J ~ Poisson(lambda / 2); the
 * numerator keeps df1 in its scaling, so each term is a central F tail with
 * df1 + 2J and the critical value rescaled by df1 / (df1 + 2J).
 */
export const noncentralFSF = (x: number, df1: number, df2: number, lambda: number): number => {
  if (!isFinite(x) || df1 <= 0 || df2 <= 0 || lambda < 0) return NaN;
  return poissonMixture(lambda, j => {
    const numeratorDf = df1 + 2 * j;
    return fSF((x * df1) / numeratorDf, numeratorDf, df2);
  });
};

/** One-way ANOVA, k groups, Cohen's f. N is solved by increasing total N. */
export const sampleSizeAnova = (
  groups: number,
  f: number,
  alpha = 0.05,
  power = 0.8
): SampleSizeResult => {
  const k = Math.max(2, Math.round(groups));
  const df1 = k - 1;
  const effectSize = Math.abs(f);
  if (!isFinite(effectSize) || effectSize <= 0) {
    return { design: 'anova', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize, method: '' };
  }

  let total = k * 2;
  let achieved = 0;
  const maxTotal = 200000;

  while (total < maxTotal) {
    const df2 = total - k;
    const critical = jStat.centralF.inv(1 - alpha, df1, df2);
    achieved = noncentralFSF(critical, df1, df2, total * effectSize * effectSize);
    if (achieved >= power) break;
    total += 1;
  }

  const nPerGroup = Math.ceil(total / k);
  const finalTotal = nPerGroup * k;
  const finalDf2 = finalTotal - k;
  const finalCritical = jStat.centralF.inv(1 - alpha, df1, finalDf2);
  return {
    design: 'anova',
    nPerGroup,
    total: finalTotal,
    achievedPower: noncentralFSF(finalCritical, df1, finalDf2, finalTotal * effectSize * effectSize),
    critical: finalCritical,
    effectSize,
    method: 'ANOVA a una via, F non centrale esatta',
  };
};

/** Sample size for a target confidence-interval half-width. */
export const sampleSizePrecision = (
  sd: number,
  margin: number,
  level = 95,
  groups = 1
): number => {
  if (!(sd > 0) || !(margin > 0)) return NaN;
  const z = zAlpha(alphaOf(level), 2);
  return Math.max(2, Math.ceil(groups * Math.pow((z * sd) / margin, 2)));
};

/**
 * Half-width of the confidence interval at a given n per group: the precision
 * curve is the inverse view of the sample-size calculation.
 */
export const precisionAt = (options: SampleSizeOptions, nPerGroup: number): number => {
  if (!(nPerGroup >= 2)) return NaN;
  const z = zAlpha(options.alpha, 2);
  switch (options.design) {
    case 'twoMeans': {
      const sd = options.sd ?? 0;
      return sd > 0 ? (z * sd * Math.sqrt(2 / nPerGroup)) : NaN;
    }
    case 'oneMean':
    case 'paired': {
      const sd = options.sd ?? 0;
      return sd > 0 ? (z * sd) / Math.sqrt(nPerGroup) : NaN;
    }
    case 'twoProportions': {
      const p1 = options.p1 ?? 0;
      const p2 = options.p2 ?? 0;
      const variance = p1 * (1 - p1) + p2 * (1 - p2);
      return variance > 0 ? (z * Math.sqrt(variance)) / Math.sqrt(nPerGroup) : NaN;
    }
    default:
      return NaN;
  }
};

export const powerAt = (options: SampleSizeOptions, nPerGroup: number): number => {  const alpha = options.alpha;
  switch (options.design) {
    case 'twoMeans': {
      const es = Math.abs(options.delta ?? 0) / (options.sd ?? 0);
      const df = 2 * nPerGroup - 2;
      return normalPower(es * Math.sqrt(nPerGroup / 2), jStat.studentt.inv(1 - alpha / 2, df));
    }
    case 'oneMean':
    case 'paired': {
      const es = Math.abs(options.delta ?? 0) / (options.sd ?? 0);
      return normalPower(es * Math.sqrt(nPerGroup), jStat.studentt.inv(1 - alpha / 2, nPerGroup - 1));
    }
    case 'twoProportions': {
      const p1 = options.p1 ?? 0;
      const p2 = options.p2 ?? 0;
      const delta = Math.abs(p1 - p2);
      const pooled = (p1 + p2) / 2;
      const seNull = Math.sqrt((2 * pooled * (1 - pooled)) / nPerGroup);
      const seAlt = Math.sqrt((p1 * (1 - p1) + p2 * (1 - p2)) / nPerGroup);
      return normalPower(delta / seAlt, (zAlpha(alpha, 2) * seNull) / seAlt);
    }
    case 'correlation': {
      const zr = Math.atanh(Math.abs(options.r ?? 0));
      return normalPower(zr * Math.sqrt(Math.max(1, nPerGroup - 3)), zAlpha(alpha, 2));
    }
    case 'anova': {
      const k = Math.max(2, Math.round(options.groups ?? 3));
      const df1 = k - 1;
      const total = nPerGroup * k;
      const df2 = total - k;
      const critical = jStat.centralF.inv(1 - alpha, df1, df2);
      return noncentralFSF(critical, df1, df2, total * Math.pow(options.f ?? 0, 2));
    }
    case 'tost': {
      const sd = options.sd ?? 0;
      const margin = options.margin ?? 0;
      const effect = margin - Math.abs(options.delta ?? 0);
      if (!(sd > 0) || !(effect > 0)) return NaN;
      const se = sd / Math.sqrt(nPerGroup);
      const z = zAlpha(alpha, 1);
      const delta = options.delta ?? 0;
      return Math.min(1, Math.max(0, normalPower((margin - delta) / se, z) + normalPower((margin + delta) / se, z) - 1));
    }
    case 'survival': {
      const logHr = Math.log(Math.max(1e-12, options.hazardRatio ?? 1));
      return normalPower(Math.sqrt(nPerGroup) * Math.abs(logHr), zAlpha(alpha, 2));
    }
    case 'oneProportion': {
      const effect = Math.abs(
        2 * Math.asin(Math.sqrt(options.p1 ?? 0)) - 2 * Math.asin(Math.sqrt(options.p2 ?? 0))
      );
      return normalPower(effect * Math.sqrt(nPerGroup), zAlpha(alpha, 2));
    }
    case 'variance':
      return variancePower(nPerGroup, options.ratio ?? 1, alpha, options.tails);
    case 'oneRate':
      return ratePower(nPerGroup, options.p1 ?? 1, options.p2 ?? 1, alpha, options.tails);
    case 'regression':
      return regressionPower(
        nPerGroup,
        Math.max(1, Math.round(options.predictors ?? 1)),
        options.f2 ?? 0.15,
        alpha,
        options.tails
      );
    case 'logistic':
      return logisticPower(
        nPerGroup,
        options.p1 ?? 0.3,
        options.oddsRatio ?? 2,
        alpha,
        options.tails
      );
    default:
      return NaN;
  }
};

/** TOST: numerosità per dimostrare equivalenza entro un margine. */
export const sampleSizeTost = (
  delta: number,
  sd: number,
  margin: number,
  alpha = 0.05,
  power = 0.8,
  tails: 1 | 2 = 2
): SampleSizeResult => {
  const effect = margin - Math.abs(delta);
  if (!(sd > 0) || !(effect > 0)) {
    return { design: 'tost', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize: NaN, method: '' };
  }
  const zA = zAlpha(alpha, 1);
  const zB = zPower(1 - (1 - power) / 2);
  const n = Math.max(2, Math.ceil(Math.pow(((zA + zB) * sd) / effect, 2)));
  const se = sd / Math.sqrt(n);
  const achievedPower = Math.min(
    1,
    Math.max(
      0,
      normalPower((margin - delta) / se, zA) +
        normalPower((margin + delta) / se, zA) -
        1
    )
  );
  return {
    design: 'tost',
    nPerGroup: n,
    total: n,
    achievedPower,
    critical: zA,
    effectSize: effect / sd,
    method: 'TOST (approssimazione normale)',
  };
};

/** Log-rank: eventi richiesti e numerosità dato il tasso di eventi. */
export const sampleSizeSurvival = (
  hazardRatio: number,
  eventRate: number,
  alpha = 0.05,
  power = 0.8,
  tails: 1 | 2 = 2
): SampleSizeResult => {
  if (!(hazardRatio > 0) || hazardRatio === 1 || !(eventRate > 0 && eventRate <= 1)) {
    return { design: 'survival', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize: NaN, method: '' };
  }
  const zA = zAlpha(alpha, tails);
  const zB = zPower(power);
  const logHr = Math.log(hazardRatio);
  const events = Math.ceil(Math.pow((zA + zB) / logHr, 2));
  const total = Math.ceil(events / eventRate);
  return {
    design: 'survival',
    nPerGroup: events,
    total,
    achievedPower: normalPower(Math.sqrt(events) * Math.abs(logHr), zA),
    critical: zA,
    effectSize: Math.abs(logHr),
    method: 'Log-rank (Freedman)',
  };
};

/** One proportion against a null value, via the arcsine transformation. */
export const sampleSizeOneProportion = (
  p1: number,
  p0: number,
  alpha = 0.05,
  power = 0.8,
  tails: 1 | 2 = 2
): SampleSizeResult => {
  const effectSize = Math.abs(2 * Math.asin(Math.sqrt(p1)) - 2 * Math.asin(Math.sqrt(p0)));
  if (!(p1 > 0 && p1 < 1) || !(p0 > 0 && p0 < 1) || !(effectSize > 0)) {
    return { design: 'oneProportion', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize, method: '' };
  }
  const zA = zAlpha(alpha, tails);
  const zB = zPower(power);
  const n = Math.max(2, Math.ceil(Math.pow((zA + zB) / effectSize, 2)));
  return {
    design: 'oneProportion',
    nPerGroup: n,
    total: n,
    achievedPower: normalPower(effectSize * Math.sqrt(n), zA),
    critical: zA,
    effectSize,
    method: 'proporzione singola, trasformazione arcoseno (pwr.p.test)',
  };
};

/** Power of the chi-square test for one variance at n observations. */
export const variancePower = (n: number, ratio: number, alpha: number, tails: 1 | 2 = 2): number => {
  const df = n - 1;
  if (df < 1 || !(ratio > 0)) return Number.NaN;
  const lower = jStat.chisquare.inv(alpha / (tails === 2 ? 2 : 1), df);
  const upper = jStat.chisquare.inv(1 - alpha / (tails === 2 ? 2 : 1), df);
  const below = jStat.chisquare.cdf(lower / ratio, df);
  const above = 1 - jStat.chisquare.cdf(upper / ratio, df);
  return Math.min(1, Math.max(0, (tails === 2 ? below : 0) + above));
};

/** Sample size for detecting a variance ratio with the exact chi-square test. */
export const sampleSizeVariance = (
  ratio: number,
  alpha = 0.05,
  power = 0.8,
  tails: 1 | 2 = 2
): SampleSizeResult => {
  if (!(ratio > 0) || ratio === 1) {
    return { design: 'variance', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize: ratio, method: '' };
  }
  const target = Math.min(0.999, Math.max(0.001, power));
  const maxN = 200000;
  let n = 2;
  while (n < maxN && variancePower(n, ratio, alpha, tails) < target) n += 1;
  if (n >= maxN) {
    return { design: 'variance', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize: ratio, method: '' };
  }
  return {
    design: 'variance',
    nPerGroup: n,
    total: n,
    achievedPower: variancePower(n, ratio, alpha, tails),
    critical: jStat.chisquare.inv(1 - alpha / (tails === 2 ? 2 : 1), n - 1),
    effectSize: ratio,
    method: 'varianza singola, potenza esatta della χ²',
  };
};

const poissonCritical = (lambda: number, alpha: number, tails: 1 | 2): { lo: number; hi: number } => {
  const limit = Math.ceil(lambda + 12 * Math.sqrt(lambda + 1) + 20);
  let lo = limit;
  let hi = limit;
  for (let k = 0; k <= limit; k += 1) {
    const cdf = jStat.poisson.cdf(k, lambda);
    if (cdf >= alpha / (tails === 2 ? 2 : 1)) {
      lo = k;
      break;
    }
  }
  for (let k = 0; k <= limit; k += 1) {
    if (jStat.poisson.cdf(k, lambda) >= 1 - alpha / (tails === 2 ? 2 : 1)) {
      hi = k;
      break;
    }
  }
  return { lo, hi };
};

/** Power of the exact Poisson test for one rate at n units of exposure. */
export const ratePower = (
  n: number,
  lambda1: number,
  lambda0: number,
  alpha = 0.05,
  tails: 1 | 2 = 2
): number => {
  if (!(lambda0 > 0) || !(lambda1 > 0) || n <= 0) return Number.NaN;
  const { lo, hi } = poissonCritical(lambda0 * n, alpha, tails);
  const expected = lambda1 * n;
  const limit = Math.ceil(expected + 12 * Math.sqrt(expected + 1) + 20);
  let power = 0;
  for (let k = 0; k <= limit; k += 1) {
    if (k <= lo - 1 || k >= hi + 1) power += jStat.poisson.pdf(k, expected);
  }
  return Math.min(1, Math.max(0, power));
};

/** Sample size for detecting a Poisson rate against a null rate. */
export const sampleSizeOneRate = (
  lambda1: number,
  lambda0: number,
  alpha = 0.05,
  power = 0.8,
  tails: 1 | 2 = 2
): SampleSizeResult => {
  if (!(lambda0 > 0) || !(lambda1 > 0) || lambda1 === lambda0) {
    return { design: 'oneRate', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize: lambda1 / lambda0, method: '' };
  }
  const target = Math.min(0.999, Math.max(0.001, power));
  const zA = zAlpha(alpha, tails);
  const zB = zPower(power);
  const start = Math.max(
    1,
    Math.floor(Math.pow((zA * Math.sqrt(lambda0) + zB * Math.sqrt(lambda1)) / Math.abs(lambda1 - lambda0), 2) * 0.5)
  );
  const maxN = 200000;
  let n = start;
  while (n < maxN && ratePower(n, lambda1, lambda0, alpha, tails) < target) n += 1;
  if (n >= maxN) {
    return { design: 'oneRate', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize: lambda1 / lambda0, method: '' };
  }
  const critical = poissonCritical(lambda0 * n, alpha, tails);
  return {
    design: 'oneRate',
    nPerGroup: n,
    total: n,
    achievedPower: ratePower(n, lambda1, lambda0, alpha, tails),
    critical: critical.hi,
    effectSize: lambda1 / lambda0,
    method: 'tasso di Poisson singolo, potenza esatta',
  };
};

/**
 * Power of the overall F test in a multiple regression with `u` predictors,
 * Cohen's f² and n observations: the noncentrality is f² · n, as in
 * `pwr::pwr.f2.test`.
 */
export const regressionPower = (
  n: number,
  u: number,
  f2: number,
  alpha = 0.05,
  tails: 1 | 2 = 2
): number => {
  const predictors = Math.max(1, Math.round(u));
  const v = n - predictors - 1;
  if (v < 1 || !(f2 > 0)) return Number.NaN;
  // The overall F test is one-sided by construction; `tails` is ignored.
  void tails;
  const critical = jStat.centralF.inv(1 - alpha, predictors, v);
  return noncentralFSF(critical, predictors, v, f2 * n);
};

/** Sample size for a multiple regression with `u` predictors and Cohen's f². */
export const sampleSizeRegression = (
  predictors: number,
  f2: number,
  alpha = 0.05,
  power = 0.8,
  tails: 1 | 2 = 2
): SampleSizeResult => {
  const u = Math.max(1, Math.round(predictors));
  const effectSize = Math.abs(f2);
  if (!(effectSize > 0)) {
    return { design: 'regression', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize, method: '' };
  }
  const target = Math.min(0.9999, Math.max(0.0001, power));
  let n = u + 2;
  const maxN = 1_000_000;
  while (n < maxN && regressionPower(n, u, effectSize, alpha, tails) < target) n += 1;
  if (n >= maxN) {
    return { design: 'regression', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize, method: '' };
  }
  const v = n - u - 1;
  return {
    design: 'regression',
    nPerGroup: n,
    total: n,
    achievedPower: regressionPower(n, u, effectSize, alpha, tails),
    critical: jStat.centralF.inv(1 - alpha, u, v),
    effectSize,
    method: 'regressione multipla, F non centrale (pwr.f2.test)',
  };
};

/**
 * Power of the logistic model with one binary covariate using the Hsieh
 * approximation: n = (z + z)² / (p (1 − p) log(OR)²), where p is the event
 * rate at the mean of the covariates.
 */
export const logisticPower = (
  n: number,
  p: number,
  oddsRatio: number,
  alpha = 0.05,
  tails: 1 | 2 = 2
): number => {
  if (!(p > 0 && p < 1) || !(oddsRatio > 0) || oddsRatio === 1 || n < 2) return Number.NaN;
  const effect = Math.abs(Math.log(oddsRatio));
  return normalPower(Math.sqrt(n * p * (1 - p)) * effect, zAlpha(alpha, tails));
};

/** Sample size for a logistic model with one binary covariate (Hsieh et al.). */
export const sampleSizeLogistic = (
  p: number,
  oddsRatio: number,
  alpha = 0.05,
  power = 0.8,
  tails: 1 | 2 = 2
): SampleSizeResult => {
  const effect = Math.abs(Math.log(Math.max(1e-12, oddsRatio)));
  const effectSize = effect;
  if (!(p > 0 && p < 1) || !(oddsRatio > 0) || oddsRatio === 1) {
    return { design: 'logistic', nPerGroup: NaN, total: NaN, achievedPower: NaN, critical: NaN, effectSize, method: '' };
  }
  const zA = zAlpha(alpha, tails);
  const zB = zPower(power);
  const n = Math.max(2, Math.ceil(Math.pow(zA + zB, 2) / (p * (1 - p) * effect * effect)));
  return {
    design: 'logistic',
    nPerGroup: n,
    total: n,
    achievedPower: logisticPower(n, p, oddsRatio, alpha, tails),
    critical: zA,
    effectSize,
    method: 'regressione logistica, approssimazione di Hsieh',
  };
};
