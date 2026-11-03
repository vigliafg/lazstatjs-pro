/**
 * Partial least squares regression, one response (PLS1).
 *
 * The kernel implements the orthogonal-scores algorithm of `pls::plsr(...,
 * method = "oscorespls", scale = FALSE)`: predictors and response are centred
 * only (no scaling), then each component is extracted with the NIPALS
 * deflation used by the R package:
 *
 *   w_a = X'u_a / ||X'u_a||,   t_a = X w_a,
 *   p_a = X't_a / (t_a't_a),   q_a = Y't_a / (t_a't_a),
 *   X <- X - t_a p_a',         Y <- Y - t_a q_a'.
 *
 * For a single response `u_a` is the current deflated response, so the inner
 * NIPALS loop is not needed. Regression coefficients use the projection
 * `R = W (P'W)^{-1}` and `B = R[, 1:a] q[1:a]'`; the reported coefficients and
 * fitted values are therefore on the original predictor scale, with the
 * intercept added back.
 *
 * `r2` is the share of the response variance explained by each component
 * alone; `cumulativeR2` is the usual R² of the fit with the first `a`
 * components. `xVariance` and `cumulativeXVariance` use the same convention
 * for X. `q2` is a deterministic K-fold cross-validated R² (fold = row index
 * modulo K), again cumulative over components.
 */

import type { Matrix } from './matrix';

export interface PlsInput {
  y: number[];
  /** Predictor matrix WITHOUT an intercept column. */
  x: Matrix;
  /** Number of latent components, 1..p. */
  components: number;
  /** Cross-validation folds; 0 disables the Q² estimate. */
  cvFolds?: number;
}

export interface PlsComponent {
  /** X weights `w_a` (length p). */
  weight: number[];
  /** X loadings `p_a` (length p). */
  loading: number[];
  /** X scores `t_a` (length n). */
  score: number[];
  /** Share of Y variance explained by this component alone. */
  r2: number;
  /** Cumulative share of Y variance explained by components 1..a. */
  cumulativeR2: number;
  /** Share of X variance explained by this component alone. */
  xVariance: number;
  /** Cumulative share of X variance explained by components 1..a. */
  cumulativeXVariance: number;
}

export interface PlsResult {
  /** Intercept in position 0, followed by the p predictor coefficients. */
  coefficients: number[];
  components: PlsComponent[];
  /** R² of the fit with all requested components. */
  r2: number;
  /** Degrees-of-freedom-adjusted R², with `components` parameters. */
  adjR2: number;
  /** Residual standard error, `sqrt(SSE / (n - components - 1))`. */
  rmse: number;
  fitted: number[];
  residuals: number[];
  n: number;
  p: number;
  /** Variable importance in projection, one value per predictor. */
  vip: number[];
  /** Cumulative K-fold Q² per component; all NaN when `cvFolds` is 0. */
  q2: number[];
}

interface CoreComponent {
  weight: number[];
  loading: number[];
  score: number[];
  q: number;
  tsq: number;
  /** `t_a't_a * p_a'p_a`, the X variance carried by the component. */
  xvar: number;
}

interface CoreFit {
  components: CoreComponent[];
  /** `B` for each component count: `coefficientsByComponents[a]` has length p. */
  coefficientsByComponents: number[][];
  /** Full projection matrix `R` (p x components). */
  projection: Matrix;
}

const dot = (a: readonly number[], b: readonly number[]): number => {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += a[i] * (b[i] ?? 0);
  return sum;
};

const mean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);

const centred = (values: readonly number[], average: number): number[] =>
  values.map(value => value - average);

/**
 * Extract the orthogonal-scores PLS1 components from already centred data.
 * Returns `null` when a component becomes degenerate (zero weight or score
 * variance), which happens with collinear or constant predictors.
 */
const fitCore = (y: number[], x: Matrix, components: number): CoreFit | null => {
  const n = y.length;
  const p = x[0]?.length ?? 0;
  const xResidual = x.map(row => row.slice());
  const yResidual = y.slice();

  const extracted: CoreComponent[] = [];

  for (let a = 0; a < components; a += 1) {
    // Single-response oscorespls: u is the current deflated response.
    const weightRaw = new Array<number>(p).fill(0);
    for (let i = 0; i < n; i += 1) {
      const u = yResidual[i];
      if (u === 0) continue;
      const row = xResidual[i];
      for (let j = 0; j < p; j += 1) weightRaw[j] += row[j] * u;
    }
    const weightNorm = Math.sqrt(dot(weightRaw, weightRaw));
    if (!Number.isFinite(weightNorm) || !(weightNorm > 0)) return null;
    const weight = weightRaw.map(value => value / weightNorm);

    const score = xResidual.map(row => dot(row, weight));
    const tsq = dot(score, score);
    if (!Number.isFinite(tsq) || !(tsq > 0)) return null;
    const scoreScaled = score.map(value => value / tsq);

    const q = dot(yResidual, scoreScaled);
    const loading = new Array<number>(p).fill(0);
    for (let i = 0; i < n; i += 1) {
      const scaled = scoreScaled[i];
      if (scaled === 0) continue;
      const row = xResidual[i];
      for (let j = 0; j < p; j += 1) loading[j] += row[j] * scaled;
    }

    for (let i = 0; i < n; i += 1) {
      const t = score[i];
      const row = xResidual[i];
      for (let j = 0; j < p; j += 1) row[j] -= t * loading[j];
      yResidual[i] -= t * q;
    }

    if (![q, tsq, ...loading].every(Number.isFinite)) return null;
    extracted.push({
      weight,
      loading,
      score,
      q,
      tsq,
      xvar: tsq * dot(loading, loading),
    });
  }

  // R = W (P'W)^{-1}. As in pls:::oscorespls.fit, P'W is upper bidiagonal
  // with a unit diagonal, so the inverse is the cumulative product of the
  // negated superdiagonal. Reproducing that recursion keeps the coefficients
  // aligned with the R reference instead of relying on a general inverse.
  const k = extracted.length;
  const inverse: Matrix = Array.from({ length: k }, (_, row) =>
    Array.from({ length: k }, (_, column): number => (row === column ? 1 : 0))
  );
  if (k > 1) {
    const bidiagonal: number[] = [];
    for (let a = 0; a < k - 1; a += 1) {
      let cross = 0;
      for (let j = 0; j < p; j += 1) {
        cross += extracted[a].loading[j] * extracted[a + 1].weight[j];
      }
      bidiagonal.push(-cross);
    }
    for (let a = 0; a < k - 1; a += 1) {
      let product = 1;
      for (let b = a + 1; b < k; b += 1) {
        product *= bidiagonal[b - 1];
        inverse[a][b] = product;
      }
    }
  }

  const projection: Matrix = Array.from({ length: p }, () => new Array<number>(k).fill(0));
  for (let j = 0; j < p; j += 1) {
    for (let a = 0; a < k; a += 1) {
      let value = 0;
      for (let l = 0; l < k; l += 1) {
        value += extracted[l].weight[j] * inverse[l][a];
      }
      projection[j][a] = value;
    }
  }
  if (projection.some(row => row.some(value => !Number.isFinite(value)))) return null;

  const coefficientsByComponents: number[][] = [];
  for (let a = 0; a < k; a += 1) {
    const beta = new Array<number>(p).fill(0);
    for (let j = 0; j < p; j += 1) {
      let value = 0;
      for (let l = 0; l <= a; l += 1) value += projection[j][l] * extracted[l].q;
      beta[j] = value;
    }
    coefficientsByComponents.push(beta);
  }

  return { components: extracted, coefficientsByComponents, projection };
};

/**
 * Deterministic K-fold Q²: rows are assigned to fold `i % K`, each fold is
 * predicted from a model fitted on the other rows (with fold-specific
 * centring), and PRESS is accumulated per component. Q² at `a` components is
 * `1 - PRESS_a / SST`, with SST computed on the full response.
 */
const crossValidatedQ2 = (
  y: number[],
  x: Matrix,
  components: number,
  folds: number
): number[] => {
  const unavailable = new Array<number>(components).fill(Number.NaN);
  if (folds <= 0) return unavailable;

  const n = y.length;
  const p = x[0]?.length ?? 0;
  const k = Math.max(2, Math.min(folds, n));
  const yMean = mean(y);
  const sst = y.reduce((sum, value) => sum + (value - yMean) * (value - yMean), 0);
  if (!(sst > 0)) return unavailable;

  const press = new Array<number>(components).fill(0);

  for (let fold = 0; fold < k; fold += 1) {
    const training: number[] = [];
    const testing: number[] = [];
    for (let i = 0; i < n; i += 1) {
      if (i % k === fold) testing.push(i);
      else training.push(i);
    }
    if (testing.length === 0) continue;
    // A component needs at least one residual degree of freedom; with fewer
    // training rows the full requested model is not estimable.
    if (training.length < 2 || training.length - 1 < components) return unavailable;

    const xMean = new Array<number>(p).fill(0);
    for (const i of training) {
      for (let j = 0; j < p; j += 1) xMean[j] += x[i][j];
    }
    for (let j = 0; j < p; j += 1) xMean[j] /= training.length;
    const yMeanTrain = mean(training.map(i => y[i]));

    const trainX = training.map(i => x[i].map((value, j) => value - xMean[j]));
    const trainY = training.map(i => y[i] - yMeanTrain);
    const core = fitCore(trainY, trainX, components);
    if (!core) return unavailable;

    for (let a = 0; a < components; a += 1) {
      const beta = core.coefficientsByComponents[a];
      for (const i of testing) {
        let prediction = yMeanTrain;
        for (let j = 0; j < p; j += 1) prediction += (x[i][j] - xMean[j]) * beta[j];
        const residual = y[i] - prediction;
        press[a] += residual * residual;
      }
    }
  }

  return press.map(value => 1 - value / sst);
};

/**
 * Fit a PLS1 regression. Returns `null` for non-finite input, fewer than three
 * observations, an invalid component count (outside `1..p` or too large for
 * the sample), or a constant/zero-variance response or predictor.
 */
export const fitPls = (input: PlsInput): PlsResult | null => {
  const { y, x } = input;
  const n = y.length;
  const p = x[0]?.length ?? 0;
  const components = input.components;
  const cvFolds = input.cvFolds ?? 0;

  if (n < 3 || p < 1 || x.length !== n) return null;
  if (x.some(row => row.length !== p)) return null;
  if (y.some(value => !Number.isFinite(value))) return null;
  if (x.some(row => row.some(value => !Number.isFinite(value)))) return null;
  if (!Number.isFinite(components) || !Number.isInteger(components)) return null;
  if (components < 1 || components > p) return null;
  // oscorespls needs n - 1 >= ncomp: each component consumes a score degree of
  // freedom (pls::plsr enforces the same bound).
  if (components > n - 1) return null;
  if (!Number.isFinite(cvFolds) || !Number.isInteger(cvFolds) || cvFolds < 0) return null;

  const yMean = mean(y);
  const yCentred = centred(y, yMean);
  const sst = dot(yCentred, yCentred);
  if (!Number.isFinite(sst) || !(sst > 0)) return null;

  const xMean = new Array<number>(p).fill(0);
  for (const row of x) {
    for (let j = 0; j < p; j += 1) xMean[j] += row[j];
  }
  for (let j = 0; j < p; j += 1) xMean[j] /= n;

  const xCentred = x.map(row => row.map((value, j) => value - xMean[j]));
  let xTotal = 0;
  for (let j = 0; j < p; j += 1) {
    let column = 0;
    for (let i = 0; i < n; i += 1) column += xCentred[i][j] * xCentred[i][j];
    if (!Number.isFinite(column) || !(column > 0)) return null;
    xTotal += column;
  }

  const core = fitCore(yCentred, xCentred, components);
  if (!core) return null;

  const fittedByComponents: number[][] = [];
  const residualsByComponents: number[][] = [];
  for (let a = 0; a < components; a += 1) {
    const beta = core.coefficientsByComponents[a];
    const fitted = xCentred.map(row => yMean + dot(row, beta));
    const residuals = y.map((value, i) => value - fitted[i]);
    fittedByComponents.push(fitted);
    residualsByComponents.push(residuals);
  }

  const cumulativeR2: number[] = [];
  for (const residuals of residualsByComponents) {
    const sse = dot(residuals, residuals);
    cumulativeR2.push(1 - sse / sst);
  }

  let cumulativeXVariance = 0;
  const plsComponents: PlsComponent[] = core.components.map((component, a) => {
    const cumulative = cumulativeR2[a];
    const previous = a === 0 ? 0 : cumulativeR2[a - 1];
    const xVariance = component.xvar / xTotal;
    cumulativeXVariance += xVariance;
    return {
      weight: component.weight,
      loading: component.loading,
      score: component.score,
      r2: cumulative - previous,
      cumulativeR2: cumulative,
      xVariance,
      cumulativeXVariance,
    };
  });

  const finalFitted = fittedByComponents[components - 1];
  const finalResiduals = residualsByComponents[components - 1];
  const sse = dot(finalResiduals, finalResiduals);
  const r2 = cumulativeR2[components - 1];
  const df = n - components - 1;
  const adjR2 = df > 0 ? 1 - (1 - r2) * ((n - 1) / df) : Number.NaN;
  const rmse = df > 0 ? Math.sqrt(sse / df) : Number.NaN;

  // VIP_j² = p * sum_a [SS_a (w_ja / ||w_a||)²] / sum_a SS_a, with weights
  // already normalised and SS_a = q_a² t_a't_a.
  const componentSs = core.components.map(component => component.q * component.q * component.tsq);
  const totalSs = componentSs.reduce((sum, value) => sum + value, 0);
  const vip = new Array<number>(p).fill(Number.NaN);
  if (totalSs > 0) {
    for (let j = 0; j < p; j += 1) {
      let weighted = 0;
      for (let a = 0; a < components; a += 1) {
        const w = core.components[a].weight[j];
        weighted += componentSs[a] * w * w;
      }
      vip[j] = Math.sqrt((p * weighted) / totalSs);
    }
  }

  const coefficients = [yMean - dot(xMean, core.coefficientsByComponents[components - 1])];
  coefficients.push(...core.coefficientsByComponents[components - 1]);

  return {
    coefficients,
    components: plsComponents,
    r2,
    adjR2,
    rmse,
    fitted: finalFitted,
    residuals: finalResiduals,
    n,
    p,
    vip,
    q2: crossValidatedQ2(y, x, components, cvFolds),
  };
};
