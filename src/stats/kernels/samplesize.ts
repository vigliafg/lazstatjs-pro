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

export const powerAt = (options: SampleSizeOptions, nPerGroup: number): number => {
  const alpha = options.alpha;
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
    default:
      return NaN;
  }
};
