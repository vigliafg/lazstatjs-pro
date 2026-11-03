import { jStat } from '../jstat';
import { tCrit, tSF } from './distributions';

export interface SurveyObservation {
  value: number;
  weight?: number;
  stratum?: string;
  psu?: string;
  /** Categorical value read by the proportion mode. */
  category?: string;
  /** Predictors for the weighted regression mode. */
  predictors?: number[];
}

export interface SurveyEstimate {
  label: string;
  estimate: number;
  se: number;
  lo: number;
  hi: number;
  df: number;
  deff: number;
  n: number;
  psus: number;
  weightedN: number;
}

export interface SurveyCoefficient {
  term: string;
  estimate: number;
  se: number;
  t: number;
  p: number;
}

export interface SurveyDesignInfo {
  strata: number;
  psus: number;
  clusters: number;
  weightedN: number;
  n: number;
}

export interface SurveyResult {
  mode: 'mean' | 'total' | 'proportion' | 'regression';
  design: SurveyDesignInfo;
  estimates: SurveyEstimate[];
  coefficients: SurveyCoefficient[];
  r2: number | null;
}

interface LinearizedInput {
  residuals: number[];
  weights: number[];
  strata: string[];
  psus: string[];
}

/** Design-based variance of a weighted total of linearized contributions. */
export const linearizedVariance = ({
  residuals,
  weights,
  strata,
  psus,
}: LinearizedInput): { variance: number; df: number; srsVariance: number } => {
  const n = residuals.length;
  if (n < 2) return { variance: NaN, df: 0, srsVariance: NaN };
  const z = residuals.map((value, index) => value * weights[index]);
  const grandMean = z.reduce((sum, value) => sum + value, 0) / n;
  const srsVariance = (n / (n - 1)) * z.reduce((sum, value) => sum + (value - grandMean) ** 2, 0);

  const groups = new Map<string, { sum: number; count: number; psus: Map<string, number> }>();
  strata.forEach((stratum, index) => {
    const group = groups.get(stratum) ?? { sum: 0, count: 0, psus: new Map<string, number>() };
    group.sum += z[index];
    group.count += 1;
    const psu = psus[index];
    group.psus.set(psu, (group.psus.get(psu) ?? 0) + z[index]);
    groups.set(stratum, group);
  });

  let variance = 0;
  let df = 0;
  for (const group of groups.values()) {
    const totals = [...group.psus.values()];
    const h = totals.length;
    if (h < 2) continue;
    const mean = totals.reduce((sum, value) => sum + value, 0) / h;
    variance += (h / (h - 1)) * totals.reduce((sum, value) => sum + (value - mean) ** 2, 0);
    df += h - 1;
  }
  return { variance, df, srsVariance };
};

const estimateFrom = (
  label: string,
  estimate: number,
  variance: number,
  srsVariance: number,
  df: number,
  level: number,
  n: number,
  psus: number,
  weightedN: number
): SurveyEstimate => {
  const se = Math.sqrt(Math.max(0, variance));
  const crit = df > 0 ? tCrit(level, df) : NaN;
  return {
    label,
    estimate,
    se,
    lo: Number.isFinite(crit) ? estimate - crit * se : NaN,
    hi: Number.isFinite(crit) ? estimate + crit * se : NaN,
    df,
    deff: srsVariance > 0 ? variance / srsVariance : NaN,
    n,
    psus,
    weightedN,
  };
};

const designOf = (
  observations: readonly SurveyObservation[],
  mode: SurveyResult['mode'],
  estimates: SurveyEstimate[],
  coefficients: SurveyCoefficient[],
  r2: number | null
): SurveyResult => {
  const strata = new Set<string>();
  const psus = new Set<string>();
  const clusters = new Set<string>();
  let weightedN = 0;
  observations.forEach(observation => {
    strata.add(observation.stratum ?? '1');
    const psu = observation.psu ?? `row-${psus.size}-${strata.size}`;
    psus.add(`${observation.stratum ?? '1'}|${psu}`);
    clusters.add(psu);
    weightedN += observation.weight ?? 1;
  });
  return {
    mode,
    design: {
      strata: strata.size,
      psus: psus.size,
      clusters: clusters.size,
      weightedN,
      n: observations.length,
    },
    estimates,
    coefficients,
    r2,
  };
};

/** Design covariance between two linearized totals, aggregating PSUs. */
export const linearizedCovariance = (
  first: readonly number[],
  second: readonly number[],
  strata: readonly string[],
  psus: readonly string[]
): number => {
  const groups = new Map<
    string,
    { first: number; second: number; psus: Map<string, { a: number; b: number }> }
  >();
  strata.forEach((stratum, index) => {
    const group =
      groups.get(stratum) ??
      { first: 0, second: 0, psus: new Map<string, { a: number; b: number }>() };
    group.first += first[index];
    group.second += second[index];
    const psu = psus[index];
    const totals = group.psus.get(psu) ?? { a: 0, b: 0 };
    totals.a += first[index];
    totals.b += second[index];
    group.psus.set(psu, totals);
    groups.set(stratum, group);
  });
  let covariance = 0;
  for (const group of groups.values()) {
    const totals = [...group.psus.values()];
    const h = totals.length;
    if (h < 2) continue;
    const meanA = totals.reduce((sum, value) => sum + value.a, 0) / h;
    const meanB = totals.reduce((sum, value) => sum + value.b, 0) / h;
    covariance +=
      (h / (h - 1)) *
      totals.reduce((sum, value) => sum + (value.a - meanA) * (value.b - meanB), 0);
  }
  return covariance;
};

const solve = (matrix: number[][]): number[][] | null => {
  const inverse = jStat.inv(matrix) as number[][];
  if (!inverse || inverse.some(row => row.some(value => !Number.isFinite(value)))) return null;
  return inverse;
};

const multiply = (a: number[][], b: number[][]): number[][] => {
  const rows = a.length;
  const cols = b[0]?.length ?? 0;
  const inner = b.length;
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => {
      let sum = 0;
      for (let k = 0; k < inner; k += 1) sum += a[i][k] * b[k][j];
      return sum;
    })
  );
};

const transpose = (a: number[][]): number[][] =>
  (a[0] ?? []).map((_, j) => a.map(row => row[j]));

const weightedRegression = (
  rows: readonly SurveyObservation[],
  variableName: string,
  predictorNames: string[],
  level: number
): { coefficients: SurveyCoefficient[]; r2: number } | null => {
  const p = predictorNames.length + 1;
  if (rows.length <= p + 1) return null;
  const x = rows.map(row => [1, ...(row.predictors ?? [])]);
  const y = rows.map(row => row.value);
  const w = rows.map(row => row.weight ?? 1);
  const xtwx: number[][] = Array.from({ length: p }, () => Array(p).fill(0));
  const xtwy: number[] = Array(p).fill(0);
  rows.forEach((_, i) => {
    for (let a = 0; a < p; a += 1) {
      xtwy[a] += w[i] * x[i][a] * y[i];
      for (let b = 0; b < p; b += 1) xtwx[a][b] += w[i] * x[i][a] * x[i][b];
    }
  });
  const inverse = solve(xtwx);
  if (!inverse) return null;
  const beta = inverse.map(row => row.reduce((sum, value, j) => sum + value * xtwy[j], 0));
  const residuals = y.map((value, i) => value - x[i].reduce((sum, xv, j) => sum + xv * beta[j], 0));

  const strata = rows.map(row => row.stratum ?? '1');
  const psus = rows.map((row, index) => row.psu ?? `row-${index}`);
  const scoreVariance: number[][] = Array.from({ length: p }, () => Array(p).fill(0));
  const score = Array.from({ length: p }, (_, a) =>
    rows.map((row, i) => (row.weight ?? 1) * x[i][a] * residuals[i])
  );
  for (let a = 0; a < p; a += 1) {
    for (let b = a; b < p; b += 1) {
      const covariance = linearizedCovariance(score[a], score[b], strata, psus);
      scoreVariance[a][b] = covariance;
      scoreVariance[b][a] = covariance;
    }
  }
  const covariance = multiply(multiply(inverse, scoreVariance), inverse);
  const df = Math.max(1, rows.length - p);
  const totalMean = y.reduce((sum, value) => sum + value, 0) / y.length;
  const sst = y.reduce((sum, value) => sum + (value - totalMean) ** 2, 0);
  const sse = residuals.reduce((sum, value) => sum + value ** 2, 0);
  const names = ['(Intercept)', ...predictorNames];
  const coefficients = beta.map((estimate, index) => {
    const se = Math.sqrt(Math.max(0, covariance[index][index]));
    const t = se > 0 ? estimate / se : NaN;
    return { term: names[index], estimate, se, t, p: tSF(t, df) * 2 };
  });
  void variableName;
  void level;
  return { coefficients, r2: sst > 0 ? 1 - sse / sst : NaN };
};

/**
 * Design-based estimation with Taylor linearization.
 *
 * Weights are sampling weights (not frequency weights). PSUs are aggregated
 * inside each stratum before computing the variance, so clustering widens the
 * interval while stratification narrows it; the design effect compares the
 * result with simple random sampling of the same weighted observations.
 */
export const surveyAnalysis = (
  observations: readonly SurveyObservation[],
  options: {
    mode: SurveyResult['mode'];
    level: number;
    successLevel?: string;
    variableName?: string;
    categoryName?: string;
    predictorNames?: string[];
  }
): SurveyResult | null => {
  const rows = observations.filter(
    observation =>
      Number.isFinite(observation.value) &&
      (observation.weight ?? 1) > 0 &&
      (options.mode !== 'regression' ||
        (observation.predictors ?? []).every(value => Number.isFinite(value)))
  );
  if (rows.length < 2) return null;
  const weights = rows.map(row => row.weight ?? 1);
  const strata = rows.map(row => row.stratum ?? '1');
  const psus = rows.map((row, index) => row.psu ?? `row-${index}`);
  const weightedN = weights.reduce((sum, value) => sum + value, 0);
  const n = rows.length;
  const psusCount = new Set(psus.map((psu, index) => `${strata[index]}|${psu}`)).size;

  if (options.mode === 'regression') {
    const names = options.predictorNames ?? [];
    const fit = weightedRegression(rows, options.variableName ?? 'Y', names, options.level);
    if (!fit) return null;
    return designOf(rows, 'regression', [], fit.coefficients, fit.r2);
  }

  let residual: number[];
  let estimate: number;
  if (options.mode === 'total') {
    estimate = rows.reduce((sum, row, i) => sum + weights[i] * row.value, 0);
    residual = rows.map(row => row.value);
  } else if (options.mode === 'proportion') {
    const success = options.successLevel ?? '';
    const indicator = rows.map(row => (String(row.category ?? '').trim() === success ? 1 : 0));
    estimate = indicator.reduce((sum, value, i) => sum + weights[i] * value, 0) / weightedN;
    // Ratio estimator: the linearized contribution is w_i (y_i - mean) / sum(w).
    residual = indicator.map(value => (value - estimate) / weightedN);
  } else {
    estimate = rows.reduce((sum, row, i) => sum + weights[i] * row.value, 0) / weightedN;
    residual = rows.map(row => (row.value - estimate) / weightedN);
  }

  // The weighted total is sum(w * residual); residual already subtracts the
  // estimated mean for ratio-type estimators.
  const { variance, df, srsVariance } = linearizedVariance({
    residuals: residual,
    weights,
    strata,
    psus,
  });
  const label =
    options.mode === 'proportion'
      ? `${options.categoryName ?? 'Category'} = ${options.successLevel ?? ''}`
      : options.variableName ?? 'Estimate';
  const result = estimateFrom(
    label,
    estimate,
    variance,
    srsVariance,
    df,
    options.level,
    n,
    psusCount,
    weightedN
  );
  return designOf(rows, options.mode, [result], [], null);
};
