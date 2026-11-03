import { zTwoSidedP, fSF } from '../distributions';
import { adfTest, polynomialRootModuli } from './arima';

/**
 * Vector autoregressions and Engle–Granger error-correction models.
 *
 * VAR(p) is estimated equation by equation with OLS; the companion matrix
 * gives stability and the orthogonalised impulse responses and forecast error
 * variance decomposition. VECM follows the two-step Engle–Granger approach:
 * cointegrating regression in levels, ADF on its residuals, then an ECM whose
 * error-correction term is the lagged cointegrating residual.
 */

export interface VarOptions {
  /** One row per observation, one column per variable. */
  data: number[][];
  names?: string[];
  /** Lag order; 'auto' searches 1..maxLags by AIC. */
  lags?: number | 'auto';
  maxLags?: number;
  horizon?: number;
}

export interface VarCoefficient {
  term: string;
  estimate: number;
  se: number;
  t: number;
  p: number;
}

export interface VarEquation {
  name: string;
  coefficients: VarCoefficient[];
  r2: number;
  adjR2: number;
  sigma2: number;
  sse: number;
}

export interface VarGranger {
  cause: string;
  effect: string;
  f: number;
  df1: number;
  df2: number;
  p: number;
}

export interface VarSelectionRow {
  lags: number;
  aic: number;
  bic: number;
  logLik: number;
}

export interface VarImpulse {
  horizon: number;
  /** responses[shock][variable] for this horizon. */
  responses: number[][];
}

export interface VarFevd {
  variable: string;
  shock: string;
  horizon: number;
  share: number;
}

export interface VarFit {
  mode: 'var';
  names: string[];
  k: number;
  n: number;
  lags: number;
  coefficients: number[][][];
  intercepts: number[];
  equations: VarEquation[];
  sigma: number[][];
  residuals: number[][];
  fitted: number[][];
  logLik: number;
  aic: number;
  bic: number;
  stability: number;
  stable: boolean;
  granger: VarGranger[];
  selection: VarSelectionRow[];
  irf: VarImpulse[];
  fevd: VarFevd[];
  /** Cholesky factor of the residual covariance. */
  cholesky: number[][];
}

export interface VecmBeta {
  term: string;
  estimate: number;
}

export interface VecmAlpha {
  equation: string;
  estimate: number;
  se: number;
  t: number;
  p: number;
}

export interface VecmFit {
  mode: 'vecm';
  names: string[];
  k: number;
  n: number;
  lags: number;
  beta: VecmBeta[];
  betaVector: number[];
  cointegration: { adf: number; p: number; lags: number; cv5: number };
  alpha: VecmAlpha[];
  equations: VarEquation[];
  residuals: number[][];
  logLik: number;
  aic: number;
  bic: number;
}

export type VarResult = VarFit | VecmFit;

// ---------------------------------------------------------------------------
// Small linear algebra
// ---------------------------------------------------------------------------

const invert = (matrix: number[][]): number[][] | null => {
  const size = matrix.length;
  const augmented = matrix.map((row, index) => [
    ...row,
    ...Array.from({ length: size }, (_, column) => (column === index ? 1 : 0)),
  ]);
  for (let pivot = 0; pivot < size; pivot++) {
    let best = pivot;
    for (let row = pivot + 1; row < size; row++) {
      if (Math.abs(augmented[row][pivot]) > Math.abs(augmented[best][pivot])) best = row;
    }
    if (Math.abs(augmented[best][pivot]) < 1e-12) return null;
    [augmented[pivot], augmented[best]] = [augmented[best], augmented[pivot]];
    const divisor = augmented[pivot][pivot];
    for (let column = 0; column < 2 * size; column++) augmented[pivot][column] /= divisor;
    for (let row = 0; row < size; row++) {
      if (row === pivot) continue;
      const factor = augmented[row][pivot];
      if (factor === 0) continue;
      for (let column = 0; column < 2 * size; column++) augmented[row][column] -= factor * augmented[pivot][column];
    }
  }
  return augmented.map(row => row.slice(size));
};

interface OlsResult {
  beta: number[];
  se: number[];
  residuals: number[];
  sse: number;
  tss: number;
  r2: number;
  adjR2: number;
  sigma2: number;
}

const ols = (y: number[], rows: number[][]): OlsResult | null => {
  const n = y.length;
  const p = rows[0]?.length ?? 0;
  if (n <= p || p === 0) return null;
  const xtx = Array.from({ length: p }, () => new Array<number>(p).fill(0));
  const xty = new Array<number>(p).fill(0);
  for (let index = 0; index < n; index++) {
    for (let left = 0; left < p; left++) {
      xty[left] += rows[index][left] * y[index];
      for (let right = 0; right < p; right++) xtx[left][right] += rows[index][left] * rows[index][right];
    }
  }
  const inverse = invert(xtx);
  if (!inverse) return null;
  const beta = inverse.map(row => row.reduce((sum, value, column) => sum + value * xty[column], 0));
  const residuals = y.map((value, index) => value - rows[index].reduce((sum, x, column) => sum + x * beta[column], 0));
  const sse = residuals.reduce((sum, value) => sum + value * value, 0);
  const meanY = y.reduce((sum, value) => sum + value, 0) / n;
  const tss = y.reduce((sum, value) => sum + Math.pow(value - meanY, 2), 0);
  const sigma2 = sse / (n - p);
  const se = inverse.map((row, index) => {
    const value = sigma2 * row[index];
    return value >= 0 ? Math.sqrt(value) : NaN;
  });
  return {
    beta,
    se,
    residuals,
    sse,
    tss,
    r2: tss > 0 ? 1 - sse / tss : NaN,
    adjR2: tss > 0 ? 1 - (sse / (n - p)) / (tss / (n - 1)) : NaN,
    sigma2,
  };
};

const logDet = (matrix: number[][]): number => {
  // Cholesky decomposition; returns log of the determinant.
  const size = matrix.length;
  const lower = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  let determinant = 0;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = matrix[i][j];
      for (let k = 0; k < j; k++) sum -= lower[i][k] * lower[j][k];
      if (i === j) {
        if (!(sum > 0)) return NaN;
        lower[i][j] = Math.sqrt(sum);
        determinant += 2 * Math.log(lower[i][j]);
      } else {
        lower[i][j] = sum / lower[j][j];
      }
    }
  }
  return determinant;
};

const cholesky = (matrix: number[][]): number[][] => {
  const size = matrix.length;
  const lower = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  for (let i = 0; i < size; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = matrix[i][j];
      for (let k = 0; k < j; k++) sum -= lower[i][k] * lower[j][k];
      lower[i][j] = i === j ? Math.sqrt(Math.max(sum, 0)) : sum / Math.max(lower[j][j], 1e-12);
    }
  }
  return lower;
};

const matrixMultiply = (left: number[][], right: number[][]): number[][] => {
  const rows = left.length;
  const columns = right[0]?.length ?? 0;
  const inner = right.length;
  const out = Array.from({ length: rows }, () => new Array<number>(columns).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      let sum = 0;
      for (let k = 0; k < inner; k++) sum += left[i][k] * right[k][j];
      out[i][j] = sum;
    }
  }
  return out;
};

const convolvePolynomial = (left: number[], right: number[]): number[] => {
  const out = new Array<number>(left.length + right.length - 1).fill(0);
  left.forEach((leftValue, i) => {
    right.forEach((rightValue, j) => {
      out[i + j] += leftValue * rightValue;
    });
  });
  return out;
};

const permutationSign = (order: number[]): number => {
  let sign = 1;
  for (let i = 0; i < order.length; i++) {
    for (let j = i + 1; j < order.length; j++) {
      if (order[i] > order[j]) sign = -sign;
    }
  }
  return sign;
};

const permutations = (size: number): number[][] => {
  if (size === 1) return [[0]];
  const out: number[][] = [];
  for (const rest of permutations(size - 1)) {
    for (let position = 0; position <= rest.length; position++) {
      out.push([...rest.slice(0, position), size - 1, ...rest.slice(position)]);
    }
  }
  return out;
};

// ---------------------------------------------------------------------------
// VAR
// ---------------------------------------------------------------------------

const designMatrix = (data: number[][], lags: number): number[][] => {
  const rows: number[][] = [];
  for (let t = lags; t < data.length; t++) {
    const row: number[] = [1];
    for (let lag = 1; lag <= lags; lag++) row.push(...data[t - lag]);
    rows.push(row);
  }
  return rows;
};

interface CoreFit {
  coefficients: number[][][]; // lags × k × k
  intercepts: number[];
  equations: VarEquation[];
  sigma: number[][];
  residuals: number[][];
  fitted: number[][];
  logLik: number;
  aic: number;
  bic: number;
  t: number;
}

const fitCore = (data: number[][], lags: number, names: string[]): CoreFit | null => {
  const n = data.length;
  const k = data[0]?.length ?? 0;
  if (k < 2 || n < lags + k + 3) return null;
  const rows = designMatrix(data, lags);
  const t = rows.length;
  if (t <= 1 + k * lags) return null;

  const coefficients: number[][][] = Array.from({ length: lags }, () =>
    Array.from({ length: k }, () => new Array<number>(k).fill(0))
  );
  const intercepts = new Array<number>(k).fill(0);
  const residuals: number[][] = Array.from({ length: t }, () => new Array<number>(k).fill(0));
  const fitted: number[][] = Array.from({ length: t }, () => new Array<number>(k).fill(0));
  const equations: VarEquation[] = [];
  const sigma = Array.from({ length: k }, () => new Array<number>(k).fill(0));

  for (let equation = 0; equation < k; equation++) {
    const y = data.slice(lags).map(row => row[equation]);
    const fit = ols(y, rows);
    if (!fit) return null;
    intercepts[equation] = fit.beta[0];
    for (let lag = 1; lag <= lags; lag++) {
      for (let variable = 0; variable < k; variable++) {
        coefficients[lag - 1][equation][variable] = fit.beta[1 + (lag - 1) * k + variable];
      }
    }
    const terms: VarCoefficient[] = [
      { term: 'Costante', estimate: fit.beta[0], se: fit.se[0], t: fit.beta[0] / fit.se[0], p: zTwoSidedP(fit.beta[0] / fit.se[0]) },
    ];
    for (let lag = 1; lag <= lags; lag++) {
      for (let variable = 0; variable < k; variable++) {
        const index = 1 + (lag - 1) * k + variable;
        const estimate = fit.beta[index];
        const se = fit.se[index];
        const tValue = estimate / se;
        terms.push({
          term: `${names[variable] ?? `y${variable + 1}`}.l${lag}`,
          estimate,
          se,
          t: tValue,
          p: zTwoSidedP(tValue),
        });
      }
    }
    equations.push({
      name: names[equation] ?? `y${equation + 1}`,
      coefficients: terms,
      r2: fit.r2,
      adjR2: fit.adjR2,
      sigma2: fit.sigma2,
      sse: fit.sse,
    });
    fit.residuals.forEach((value, index) => {
      residuals[index][equation] = value;
      fitted[index][equation] = y[index] - value;
    });
  }

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      let sum = 0;
      residuals.forEach(row => {
        sum += row[i] * row[j];
      });
      sigma[i][j] = sum / t;
    }
  }
  const determinant = logDet(sigma);
  if (!Number.isFinite(determinant)) return null;
  const logLik = -0.5 * t * (k * Math.log(2 * Math.PI) + determinant + k);
  const parameters = k * (1 + k * lags);
  const aic = -2 * logLik + 2 * parameters;
  const bic = -2 * logLik + Math.log(t) * parameters;
  return { coefficients, intercepts, equations, sigma, residuals, fitted, logLik, aic, bic, t };
};

const stabilityRoot = (coefficients: number[][][], k: number, lags: number): number => {
  const entry: number[][][] = Array.from({ length: k }, () =>
    Array.from({ length: k }, () => new Array<number>(lags + 1).fill(0))
  );
  for (let i = 0; i < k; i++) entry[i][i][0] = 1;
  for (let lag = 1; lag <= lags; lag++) {
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) entry[i][j][lag] = -coefficients[lag - 1][i][j];
    }
  }
  let determinant = [1];
  permutations(k).forEach(order => {
    let product = [1];
    for (let i = 0; i < k; i++) product = convolvePolynomial(product, entry[i][order[i]]);
    const sign = permutationSign(order);
    if (determinant.length < product.length) determinant = determinant.concat(new Array(product.length - determinant.length).fill(0));
    product.forEach((value, index) => {
      determinant[index] += sign * value;
    });
  });
  const roots = polynomialRootModuli(determinant);
  return roots.length > 0 ? Math.min(...roots) : Infinity;
};

const grangerTests = (
  data: number[][],
  lags: number,
  names: string[]
): VarGranger[] => {
  const k = data[0].length;
  const rows = designMatrix(data, lags);
  const t = rows.length;
  const tests: VarGranger[] = [];
  for (let cause = 0; cause < k; cause++) {
    for (let effect = 0; effect < k; effect++) {
      if (cause === effect) continue;
      const y = data.slice(lags).map(row => row[effect]);
      const restricted = rows.map(row => [row[0], ...row.slice(1).filter((_, index) => index % k !== cause)]);
      const unrestricted = ols(y, rows);
      const reduced = ols(y, restricted);
      if (!unrestricted || !reduced) continue;
      const df1 = lags;
      const df2 = t - (1 + k * lags);
      if (df2 <= 0) continue;
      const f = ((reduced.sse - unrestricted.sse) / df1) / (unrestricted.sse / df2);
      tests.push({
        cause: names[cause] ?? `y${cause + 1}`,
        effect: names[effect] ?? `y${effect + 1}`,
        f,
        df1,
        df2,
        p: fSF(f, df1, df2),
      });
    }
  }
  return tests;
};
const impulseResponses = (
  coefficients: number[][][],
  sigma: number[][],
  k: number,
  lags: number,
  horizon: number,
  names: string[]
): { irf: VarImpulse[]; fevd: VarFevd[]; cholesky: number[][] } => {
  const lower = cholesky(sigma);
  const phi: number[][][] = [];
  phi[0] = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => (i === j ? 1 : 0)));
  for (let step = 1; step <= horizon; step++) {
    const current = Array.from({ length: k }, () => new Array<number>(k).fill(0));
    for (let lag = 1; lag <= Math.min(step, lags); lag++) {
      const product = matrixMultiply(coefficients[lag - 1], phi[step - lag]);
      for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) current[i][j] += product[i][j];
      }
    }
    phi[step] = current;
  }

  const irf: VarImpulse[] = [];
  for (let step = 0; step <= horizon; step++) {
    const response = matrixMultiply(phi[step], lower);
    irf.push({ horizon: step, responses: response });
  }

  const fevd: VarFevd[] = [];
  for (let variable = 0; variable < k; variable++) {
    const cumulative = Array.from({ length: k }, () => new Array<number>(horizon + 1).fill(0));
    for (let shock = 0; shock < k; shock++) {
      let running = 0;
      for (let step = 0; step <= horizon; step++) {
        running += Math.pow(irf[step].responses[variable][shock], 2);
        cumulative[shock][step] = running;
      }
    }
    for (let shock = 0; shock < k; shock++) {
      for (let step = 0; step <= horizon; step++) {
        let total = 0;
        for (let other = 0; other < k; other++) total += cumulative[other][step];
        fevd.push({
          variable: names[variable] ?? `y${variable + 1}`,
          shock: names[shock] ?? `y${shock + 1}`,
          horizon: step,
          share: total > 0 ? cumulative[shock][step] / total : NaN,
        });
      }
    }
  }
  return { irf, fevd, cholesky: lower };
};

export const fitVar = (options: VarOptions): VarFit | null => {
  const data = options.data;
  if (data.length < 12 || data.some(row => row.some(value => !Number.isFinite(value)))) return null;
  const k = data[0]?.length ?? 0;
  if (k < 2 || k > 4) return null;
  if (data.some(row => row.length !== k)) return null;
  const names = options.names ?? Array.from({ length: k }, (_, index) => `y${index + 1}`);
  const maxLags = Math.max(
    1,
    Math.min(options.maxLags ?? 4, Math.floor(data.length / (k + 2)) - 1, 12)
  );
  const requested = options.lags ?? 'auto';
  const horizon = Math.max(1, Math.min(40, Math.floor(options.horizon ?? 12)));

  const selection: VarSelectionRow[] = [];
  const fits = new Map<number, CoreFit>();
  for (let lags = 1; lags <= maxLags; lags++) {
    const fit = fitCore(data, lags, names);
    if (!fit) continue;
    fits.set(lags, fit);
    selection.push({ lags, aic: fit.aic, bic: fit.bic, logLik: fit.logLik });
  }
  if (fits.size === 0) return null;
  const chosenLags =
    requested === 'auto'
      ? selection.reduce((best, row) => (row.aic < best.aic ? row : best), selection[0]).lags
      : Math.max(1, Math.min(maxLags, Math.floor(requested)));
  const core = fits.get(chosenLags) ?? [...fits.values()][0];
  const effectiveLags = fits.has(chosenLags) ? chosenLags : [...fits.keys()][0];
  const stability = stabilityRoot(core.coefficients, k, effectiveLags);
  const { irf, fevd, cholesky: lower } = impulseResponses(
    core.coefficients,
    core.sigma,
    k,
    effectiveLags,
    horizon,
    names
  );

  return {
    mode: 'var',
    names,
    k,
    n: data.length,
    lags: effectiveLags,
    coefficients: core.coefficients.map(matrix => matrix.map(row => row.slice())),
    intercepts: core.intercepts,
    equations: core.equations,
    sigma: core.sigma,
    residuals: core.residuals,
    fitted: core.fitted,
    logLik: core.logLik,
    aic: core.aic,
    bic: core.bic,
    stability,
    stable: stability > 1 + 1e-8,
    granger: grangerTests(data, effectiveLags, names),
    selection,
    irf,
    fevd,
    cholesky: lower,
  };
};

// ---------------------------------------------------------------------------
// VECM (Engle–Granger)
// ---------------------------------------------------------------------------

export const fitVecm = (options: VarOptions): VecmFit | null => {
  const data = options.data;
  if (data.length < 16 || data.some(row => row.some(value => !Number.isFinite(value)))) return null;
  const k = data[0]?.length ?? 0;
  if (k < 2 || k > 4 || data.some(row => row.length !== k)) return null;
  const names = options.names ?? Array.from({ length: k }, (_, index) => `y${index + 1}`);

  // Cointegrating regression: first variable on the others plus a constant.
  const rows = data.map(row => [1, ...row.slice(1)]);
  const fit = ols(data.map(row => row[0]), rows);
  if (!fit) return null;
  const betaVector = [1, ...fit.beta.slice(1)];
  const error = fit.residuals;
  const adf = adfTest(error);
  const maxLags = Math.max(1, Math.min(options.maxLags ?? 4, Math.floor(data.length / (k + 2)) - 1, 12));
  const requested = options.lags ?? 'auto';
  const horizon = Math.max(1, Math.min(40, Math.floor(options.horizon ?? 12)));
  void horizon;

  const differences = data.map((row, index) =>
    index === 0 ? new Array<number>(k).fill(NaN) : row.map((value, column) => value - data[index - 1][column])
  );

  let best: { lags: number; logLik: number; aic: number; bic: number; equations: VarEquation[]; residuals: number[][]; t: number; alpha: VecmAlpha[] } | null = null;
  const lagList =
    requested === 'auto'
      ? Array.from({ length: maxLags }, (_, index) => index + 1)
      : [Math.max(1, Math.min(maxLags, Math.floor(requested)))];
  for (const lags of lagList) {
    const t0 = lags;
    if (data.length - t0 <= k + 2) continue;
    const target: number[][] = [];
    const design: number[][] = [];
    for (let t = t0; t < data.length; t++) {
      target.push(differences[t]);
      const row = [1, error[t - 1]];
      for (let lag = 1; lag < lags; lag++) row.push(...differences[t - lag]);
      design.push(row);
    }
    if (design.length <= design[0].length) continue;
    const equationFits = target[0].map((_, equation) =>
      ols(target.map(row => row[equation]), design)
    );
    if (equationFits.some(value => !value)) continue;
    const residuals = target.map((_, index) =>
      equationFits.map(value => value!.residuals[index])
    );
    const sigma = Array.from({ length: k }, () => new Array<number>(k).fill(0));
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) {
        let sum = 0;
        residuals.forEach(row => {
          sum += row[i] * row[j];
        });
        sigma[i][j] = sum / residuals.length;
      }
    }
    const determinant = logDet(sigma);
    if (!Number.isFinite(determinant)) continue;
    const t = residuals.length;
    const logLik = -0.5 * t * (k * Math.log(2 * Math.PI) + determinant + k);
    const parameters = k * design[0].length;
    const aic = -2 * logLik + 2 * parameters;
    const bic = -2 * logLik + Math.log(t) * parameters;
    const equations: VarEquation[] = equationFits.map((value, equation) => ({
      name: names[equation] ?? `y${equation + 1}`,
      coefficients: value!.beta.map((estimate, index) => ({
        term: index === 0 ? 'Costante' : index === 1 ? 'ECT' : `Δ${names[equation] ?? `y${equation + 1}`}.l${index - 1}`,
        estimate,
        se: value!.se[index],
        t: estimate / value!.se[index],
        p: zTwoSidedP(estimate / value!.se[index]),
      })),
      r2: value!.r2,
      adjR2: value!.adjR2,
      sigma2: value!.sigma2,
      sse: value!.sse,
    }));
    const alpha: VecmAlpha[] = equationFits.map((value, equation) => ({
      equation: names[equation] ?? `y${equation + 1}`,
      estimate: value!.beta[1],
      se: value!.se[1],
      t: value!.beta[1] / value!.se[1],
      p: zTwoSidedP(value!.beta[1] / value!.se[1]),
    }));
    if (!best || aic < best.aic) best = { lags, logLik, aic, bic, equations, residuals, t, alpha };
  }
  if (!best) return null;

  return {
    mode: 'vecm',
    names,
    k,
    n: data.length,
    lags: best.lags,
    beta: betaVector.map((estimate, index) => ({
      term: index === 0 ? names[0] ?? 'y1' : names[index] ?? `y${index + 1}`,
      estimate,
    })),
    betaVector,
    cointegration: { adf: adf.stat, p: adf.p, lags: adf.lags, cv5: adf.cv5 },
    alpha: best.alpha,
    equations: best.equations,
    residuals: best.residuals,
    logLik: best.logLik,
    aic: best.aic,
    bic: best.bic,
  };
};
