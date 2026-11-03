/**
 * Panel data models: fixed effects (within) and random effects (Swamy–Arora).
 *
 * Notation: `i` indexes entities, `t` periods, `N` observations, `G` entities,
 * `K` regressors (the design matrix has no intercept) and `T_i` the number of
 * observations of entity `i`.
 *
 * Fixed effects (within estimator)
 * --------------------------------
 * y and every column of x are demeaned by entity; OLS without intercept runs
 * on the transformed data:
 *
 *   beta_FE = (Xw'Xw)^-1 Xw'yw,        df = N - G - K
 *
 * Standard errors are cluster-robust by entity, matching
 * `plm::vcovHC(fe, method = "arellano", type = "HC1", cluster = "group")`:
 *
 *   V = N/(N - K) (Xw'Xw)^-1 [ sum_g X_g'u_g u_g'X_g ] (Xw'Xw)^-1
 *
 * The `N/(N - K)` factor is plm's HC1 correction (`plm:::omega`); it is not the
 * `G/(G - 1)` small-cluster factor of some textbooks. The classical
 * homoskedastic covariance `sigma2_e (Xw'Xw)^-1` is reported alongside.
 *
 * Entity effects are `alpha_i = ybar_i - xbar_i' beta`, so the full prediction
 * is `alpha_i + x_it' beta` (this is `fitted(plm) + fixef(plm)` for the within
 * model, which reports only the within part).
 *
 * Random effects (Swamy–Arora)
 * ----------------------------
 * Variance components:
 *
 *   sigma2_e = SSR_within / (N - G - K)                  (idiosyncratic)
 *   sigma2_b = SSR_between / (G - K - 1)                 (entity means)
 *   sigma2_u = max(0, sigma2_b - sigma2_e / Tbar)        (entity effect)
 *
 * with `Tbar` the harmonic mean of the group sizes, `Tbar = G / sum_i 1/T_i`;
 * for a balanced panel `Tbar = T`. The quasi-demeaning weight is
 *
 *   theta_i = 1 - sqrt(sigma2_e / (T_i sigma2_u + sigma2_e))
 *
 * and the GLS estimator regresses `y - theta_i ybar_i` on
 * `[1 - theta_i, x_it - theta_i xbar_i]`.
 *
 * The classical covariance follows `plm::plm(model = "random")`: the scale is
 * the residual variance of the quasi-demeaned regression,
 * `SSR* / (N - K - 1)`, not `sigma2_e`. The two are different finite-sample
 * estimators of the same GLS dispersion (they coincide asymptotically for a
 * correctly specified RE model) and plm reports the first one in
 * `summary.plm`, so the kernel follows it to keep the reference test exact.
 * `variance.idiosyncratic` exposes `sigma2_e`, the value used for theta.
 *
 * Cluster-robust standard errors use the same quasi-demeaned design and
 * residuals as `plm::vcovHC(re, method = "arellano", type = "HC1",
 * cluster = "group")`, with the `N/(N - (K + 1))` correction: the
 * quasi-demeaned design carries the `1 - theta_i` intercept column.
 *
 * Hausman
 * -------
 *
 *   H = (b_FE - b_RE)' [V_FE - V_RE]^-1 (b_FE - b_RE),  df = K
 *
 * using the classical covariances. When the difference is not positive
 * definite the inverse is replaced by the Moore–Penrose pseudo-inverse and
 * `valid` is set to `false`: in that case the statistic is not guaranteed to be
 * a quadratic form of a non-negative matrix, and its absolute value is
 * reported (plm's `phtest` takes the absolute value as well).
 *
 * R² definitions (documented because software differs)
 * ---------------------------------------------------
 * - within:  1 - SSR_w / SST_w with SST_w = sum_it (y_it - ybar_i)²
 * - between: 1 - sum_i (ybar_i - a - xbar_i'b)² / sum_i (ybar_i - ybar)²,
 *            where `a` is the intercept implied by the model (the RE intercept
 *            for RE, the mean of `ybar_i - xbar_i'b_FE` for FE)
 * - overall: 1 - sum_it (y_it - yhat_it)² / sum_it (y_it - ybar)²
 *
 * plm's `summary.plm` reports the within R² for the within model (identical to
 * the first definition) and the R² of the quasi-demeaned regression for random
 * effects (a different quantity), so the fixture computes these three
 * definitions explicitly.
 */

import { chi2SF, tCrit, twoSidedTP, zCrit, zTwoSidedP } from './distributions';
import {
  cholesky,
  invert,
  multiply,
  multiplyVector,
  pseudoInverse,
  quadratic,
  rank,
  transpose,
  zeros,
  type Matrix,
} from './matrix';

export type PanelModel = 'fe' | 're' | 'both';

export interface PanelInput {
  /** Response, one value per row. */
  y: number[];
  /** Regressors, one column per variable; the intercept is not included. */
  x: Matrix;
  /** Entity label of each row (grouping key). */
  entity: string[];
  /** Period of each row; numeric and finite, not necessarily contiguous. */
  time: number[];
  model: PanelModel;
  /** Confidence level in percent (default 95). */
  level?: number;
}

export interface PanelCoefficient {
  /** Positional label (`x1`, `x2`, …) or `(Intercept)` for the RE fit. */
  term: string;
  beta: number;
  /**
   * Primary standard error: cluster-robust by entity for FE, classical GLS for
   * RE. `seClassic` and `seCluster` always carry both estimates.
   */
  se: number;
  /** Classical homoskedastic (FE) / GLS (RE) standard error. */
  seClassic: number;
  /** Cluster-robust by entity (Arellano HC1) standard error. */
  seCluster: number;
  t: number;
  p: number;
  ciLo: number;
  ciHi: number;
}

export interface PanelEntityEffect {
  entity: string;
  effect: number;
}

export interface PanelFit {
  model: 'fe' | 're';
  terms: string[];
  coefficients: PanelCoefficient[];
  /**
   * Fitted values on the model's own scale: FE is the full prediction
   * (`alpha_i + x'b`, matching plm's within fitted plus the fixed effect);
   * RE is the quasi-demeaned prediction `X* b` (matching `fitted(plm)`).
   */
  fitted: number[];
  /** Prediction on the original scale (`alpha_i + x'b` or `a + x'b`). */
  fittedLevel: number[];
  residuals: number[];
  dfResidual: number;
  r2Within: number;
  r2Between: number;
  r2Overall: number;
  /** Idiosyncratic variance used for theta (the within estimate). */
  sigma2: number;
  /** Scale applied to `(X*'X*)^-1` for the classical covariance. */
  dispersion: number;
  entityEffects?: PanelEntityEffect[];
  /** Quasi-demeaning weights, one per entity (RE only). */
  theta?: number[];
}

export interface PanelVarianceComponents {
  /** `sigma2_e`: variance of the idiosyncratic error. */
  idiosyncratic: number;
  /** `sigma2_u`: variance of the entity effect. */
  entity: number;
}

export interface PanelHausman {
  statistic: number;
  df: number;
  p: number;
  /** `false` when `V_FE - V_RE` is not positive definite. */
  valid: boolean;
}

export interface PanelResult {
  fe: PanelFit | null;
  re: PanelFit | null;
  hausman: PanelHausman | null;
  n: number;
  entities: number;
  /** Number of distinct periods in the data. */
  periods: number;
  balanced: boolean;
  variance: PanelVarianceComponents;
  /** Quasi-demeaning weight per entity (balanced panels: one common value). */
  theta: number[];
}

/** `[1, ...row]` prepended to every row. */
const withIntercept = (rows: Matrix): Matrix => rows.map(row => [1, ...row]);

const meanOf = (values: readonly number[]): number =>
  values.length === 0 ? Number.NaN : values.reduce((sum, value) => sum + value, 0) / values.length;

const sumOfSquares = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value * value, 0);

const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);

/** OLS on a full-rank design; `null` when the cross-product is singular. */
const ols = (x: Matrix, y: number[]): { beta: number[]; inverse: Matrix; fitted: number[] } | null => {
  const inverse = invert(multiply(transpose(x), x));
  if (!inverse) return null;
  const beta = multiplyVector(inverse, multiplyVector(transpose(x), y));
  if (beta.some(value => !Number.isFinite(value))) return null;
  return { beta, inverse, fitted: multiplyVector(x, beta) };
};

interface Grouping {
  labels: string[];
  rows: number[][];
  counts: number[];
  index: Map<string, number>;
}

/**
 * Map entity labels to contiguous group indexes (first-appearance order) and
 * reject duplicate entity–time cells.
 */
const groupBy = (entity: string[], time: number[]): Grouping | null => {
  const labels: string[] = [];
  const rows: number[][] = [];
  const index = new Map<string, number>();
  const seen = new Set<string>();

  for (let i = 0; i < entity.length; i += 1) {
    const label = entity[i];
    if (typeof label !== 'string' || label.trim() === '') return null;
    const key = `${label}\u0000${time[i]}`;
    if (seen.has(key)) return null;
    seen.add(key);
    let group = index.get(label);
    if (group === undefined) {
      group = labels.length;
      index.set(label, group);
      labels.push(label);
      rows.push([]);
    }
    rows[group].push(i);
  }

  return { labels, rows, counts: rows.map(list => list.length), index };
};

const coefficientOf = (
  term: string,
  beta: number,
  se: number,
  seClassic: number,
  seCluster: number,
  df: number,
  normal: boolean,
  level: number
): PanelCoefficient => {
  const statistic = se > 0 ? beta / se : Number.NaN;
  const pValue = normal ? zTwoSidedP(statistic) : twoSidedTP(statistic, df);
  const critical = normal ? zCrit(level) : tCrit(level, df);
  return {
    term,
    beta,
    se,
    seClassic,
    seCluster,
    t: statistic,
    p: pValue,
    ciLo: beta - critical * se,
    ciHi: beta + critical * se,
  };
};

/**
 * Cluster-robust (HC1, Arellano) covariance of a regression on `design` with
 * entity-clustered scores. `plm::vcovHC(..., method = "arellano", type = "HC1",
 * cluster = "group")` applies the same `N/(N - k)` correction, with `k` the
 * number of columns of the design it receives (the within design for FE, the
 * quasi-demeaned design including `1 - theta_i` for RE).
 */
const clusterCovariance = (
  xw: Matrix,
  residuals: number[],
  groups: number[][],
  inverse: Matrix,
  n: number
): Matrix => {
  const p = xw[0].length;
  const meat = zeros(p, p);
  for (const rows of groups) {
    const score = new Array<number>(p).fill(0);
    for (const i of rows) {
      for (let j = 0; j < p; j += 1) score[j] += xw[i][j] * residuals[i];
    }
    for (let a = 0; a < p; a += 1) {
      for (let b = 0; b < p; b += 1) meat[a][b] += score[a] * score[b];
    }
  }
  const sandwich = multiply(multiply(inverse, meat), inverse);
  const correction = n / (n - p);
  return sandwich.map(row => row.map(value => value * correction));
};

export const fitPanel = (input: PanelInput): PanelResult | null => {
  const { y, x, entity, time, model } = input;
  const level = input.level ?? 95;
  const n = y.length;
  const p = x[0]?.length ?? 0;

  if (n === 0 || p === 0) return null;
  if (x.length !== n || entity.length !== n || time.length !== n) return null;
  if (x.some(row => row.length !== p)) return null;
  if (y.some(value => !Number.isFinite(value))) return null;
  if (time.some(value => !Number.isFinite(value))) return null;
  if (x.some(row => row.some(value => !Number.isFinite(value)))) return null;
  if (!Number.isFinite(level) || level <= 0 || level >= 100) return null;

  const grouping = groupBy(entity, time);
  if (!grouping) return null;
  const { labels, rows: groupRows, counts } = grouping;
  const entities = labels.length;
  if (entities < 2) return null;
  if (counts.some(count => count < 2)) return null;

  const periods = new Set(time.map(value => String(value))).size;
  const balanced = counts.every(count => count === counts[0]);
  const tBar = entities / counts.reduce((sum, count) => sum + 1 / count, 0);

  // Entity means, used by the within transformation and the between model.
  const yBar = new Array<number>(entities).fill(0);
  const xBar: Matrix = Array.from({ length: entities }, () => new Array<number>(p).fill(0));
  groupRows.forEach((rows, group) => {
    for (const i of rows) {
      yBar[group] += y[i];
      for (let j = 0; j < p; j += 1) xBar[group][j] += x[i][j];
    }
    yBar[group] /= rows.length;
    for (let j = 0; j < p; j += 1) xBar[group][j] /= rows.length;
  });

  const yw = y.map((value, i) => value - yBar[grouping.index.get(entity[i])!]);
  const xw: Matrix = x.map((row, i) => {
    const group = grouping.index.get(entity[i])!;
    return row.map((value, j) => value - xBar[group][j]);
  });

  // Collinearity inside the within transformation would make the FE model
  // unidentified (a column constant within entities is the common case).
  if (rank(xw) < p) return null;

  const within = ols(xw, yw);
  if (!within) return null;
  const residualWithin = yw.map((value, i) => value - within.fitted[i]);
  const ssrWithin = sumOfSquares(residualWithin);
  const sstWithin = sumOfSquares(yw);
  const dfFe = n - entities - p;
  if (dfFe <= 0) return null;
  const sigma2e = ssrWithin / dfFe;
  if (!(sigma2e > 0)) return null;

  // Between regression on entity means: intercept plus the mean regressors.
  const betweenX = withIntercept(xBar);
  if (rank(betweenX) < p + 1) return null;
  const between = ols(betweenX, yBar);
  if (!between) return null;
  const dfBetween = entities - p - 1;
  if (dfBetween <= 0) return null;
  const ssrBetween = sumOfSquares(yBar.map((value, i) => value - between.fitted[i]));
  const sigma2b = ssrBetween / dfBetween;
  const sigma2u = Math.max(0, sigma2b - sigma2e / tBar);

  const theta = counts.map(count => 1 - Math.sqrt(sigma2e / (count * sigma2u + sigma2e)));

  const variance: PanelVarianceComponents = { idiosyncratic: sigma2e, entity: sigma2u };
  const meanY = meanOf(y);
  const sstTotal = y.reduce((sum, value) => sum + (value - meanY) ** 2, 0);
  const meanYBar = meanOf(yBar);
  const sstBetween = yBar.reduce((sum, value) => sum + (value - meanYBar) ** 2, 0);
  const centeredSumOfSquares = (values: number[], center: number): number =>
    values.reduce((sum, value) => sum + (value - center) ** 2, 0);

  // -------------------------------------------------------------------------
  // Fixed effects
  // -------------------------------------------------------------------------
  const classicFe = within.inverse.map(row => row.map(value => value * sigma2e));
  const robustFe = clusterCovariance(xw, residualWithin, groupRows, within.inverse, n);
  const entityEffects = labels.map((label, group) => ({
    entity: label,
    effect: yBar[group] - dot(xBar[group], within.beta),
  }));
  const feFitted = x.map(row => dot(row, within.beta)).map((value, i) => {
    const group = grouping.index.get(entity[i])!;
    return value + entityEffects[group].effect;
  });
  const feTerms = within.beta.map((_, j) => `x${j + 1}`);
  const feFit: PanelFit = {
    model: 'fe',
    terms: feTerms,
    coefficients: within.beta.map((beta, j) =>
      coefficientOf(
        feTerms[j],
        beta,
        Math.sqrt(Math.max(0, robustFe[j][j])),
        Math.sqrt(Math.max(0, classicFe[j][j])),
        Math.sqrt(Math.max(0, robustFe[j][j])),
        dfFe,
        false,
        level
      )
    ),
    fitted: feFitted,
    fittedLevel: feFitted,
    residuals: y.map((value, i) => value - feFitted[i]),
    dfResidual: dfFe,
    r2Within: sstWithin > 0 ? 1 - ssrWithin / sstWithin : Number.NaN,
    r2Between: (() => {
      if (!(sstBetween > 0)) return Number.NaN;
      const intercept = meanOf(yBar.map((value, group) => value - dot(xBar[group], within.beta)));
      const residuals = yBar.map(
        (value, group) => value - intercept - dot(xBar[group], within.beta)
      );
      return 1 - centeredSumOfSquares(residuals, 0) / sstBetween;
    })(),
    r2Overall: sstTotal > 0 ? 1 - ssrWithin / sstTotal : Number.NaN,
    sigma2: sigma2e,
    dispersion: sigma2e,
    entityEffects,
  };

  // -------------------------------------------------------------------------
  // Random effects (Swamy–Arora)
  // -------------------------------------------------------------------------
  const quasiY = y.map((value, i) => {
    const group = grouping.index.get(entity[i])!;
    return value - theta[group] * yBar[group];
  });
  const quasiX: Matrix = x.map((row, i) => {
    const group = grouping.index.get(entity[i])!;
    return [1 - theta[group], ...row.map((value, j) => value - theta[group] * xBar[group][j])];
  });
  const random = ols(quasiX, quasiY);
  if (!random) return null;
  const dfRe = n - p - 1;
  if (dfRe <= 0) return null;
  const residualQuasi = quasiY.map((value, i) => value - random.fitted[i]);
  const ssrQuasi = sumOfSquares(residualQuasi);
  const dispersion = ssrQuasi / dfRe;
  if (!(dispersion > 0)) return null;
  const classicRe = random.inverse.map(row => row.map(value => value * dispersion));
  // plm::vcovHC(re, method = "arellano", type = "HC1", cluster = "group") uses
  // the quasi-demeaned design and residuals, with the N/(N - (K + 1)) HC1
  // correction because the RE design carries the intercept column 1 - theta.
  const robustRe = clusterCovariance(quasiX, residualQuasi, groupRows, random.inverse, n);
  const slopes = random.beta.slice(1);

  const reTerms = ['(Intercept)', ...slopes.map((_, j) => `x${j + 1}`)];
  const reFit: PanelFit = {
    model: 're',
    terms: reTerms,
    coefficients: random.beta.map((beta, j) =>
      coefficientOf(
        reTerms[j],
        beta,
        Math.sqrt(Math.max(0, classicRe[j][j])),
        Math.sqrt(Math.max(0, classicRe[j][j])),
        Math.sqrt(Math.max(0, robustRe[j][j])),
        dfRe,
        true,
        level
      )
    ),
    fitted: random.fitted,
    fittedLevel: x.map(row => dot([1, ...row], random.beta)),
    residuals: residualQuasi,
    dfResidual: dfRe,
    r2Within: (() => {
      if (!(sstWithin > 0)) return Number.NaN;
      const residuals = yw.map((value, i) => value - dot(xw[i], slopes));
      return 1 - sumOfSquares(residuals) / sstWithin;
    })(),
    r2Between: (() => {
      if (!(sstBetween > 0)) return Number.NaN;
      const residuals = yBar.map((value, group) => value - dot(xBar[group], slopes));
      return 1 - centeredSumOfSquares(residuals, random.beta[0]) / sstBetween;
    })(),
    r2Overall: (() => {
      if (!(sstTotal > 0)) return Number.NaN;
      const residuals = y.map((value, i) => value - dot([1, ...x[i]], random.beta));
      return 1 - sumOfSquares(residuals) / sstTotal;
    })(),
    sigma2: sigma2e,
    dispersion,
    theta,
  };

  // -------------------------------------------------------------------------
  // Hausman
  // -------------------------------------------------------------------------
  let hausman: PanelHausman | null = null;
  if (model === 'both') {
    const difference = within.beta.map((value, j) => value - slopes[j]);
    const differenceCovariance: Matrix = Array.from({ length: p }, (_, a) =>
      Array.from({ length: p }, (_, b) => classicFe[a][b] - classicRe[a + 1][b + 1])
    );
    const positive = cholesky(differenceCovariance) !== null;
    const inverse = positive ? invert(differenceCovariance) : pseudoInverse(differenceCovariance);
    const raw = inverse ? quadratic(inverse, difference) : Number.NaN;
    const statistic = positive ? raw : Math.abs(raw);
    hausman = {
      statistic,
      df: p,
      p: chi2SF(statistic, p),
      valid: positive,
    };
  }

  return {
    fe: model === 're' ? null : feFit,
    re: model === 'fe' ? null : reFit,
    hausman,
    n,
    entities,
    periods,
    balanced,
    variance,
    theta,
  };
};
