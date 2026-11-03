import { jStat } from '../jstat';
import { chi2SF, zTwoSidedP } from './distributions';
import { mulberry32 } from './distributions';

export interface SpatialPoint {
  x: number;
  y: number;
  value: number;
  predictors?: number[];
}

export interface SpatialMoran {
  i: number;
  expected: number;
  se: number;
  z: number;
  p: number;
  permutationP: number;
}

export interface SpatialGeary {
  c: number;
  expected: number;
  permutationP: number;
}

export interface SpatialLisa {
  index: number;
  x: number;
  y: number;
  value: number;
  local: number;
  p: number;
  cluster: 'HH' | 'LL' | 'HL' | 'LH' | 'none';
}

export interface SpatialCoefficient {
  term: string;
  estimate: number;
  se: number;
  z: number;
  p: number;
}

export interface SpatialSar {
  rho: number;
  rhoSe: number;
  logLik: number;
  lr: number;
  lrP: number;
  coefficients: SpatialCoefficient[];
}

export interface SpatialResult {
  mode: 'moran' | 'geary' | 'lisa' | 'sar';
  n: number;
  k: number;
  moran: SpatialMoran | null;
  geary: SpatialGeary | null;
  lisa: SpatialLisa[];
  sar: SpatialSar | null;
}

const distance = (a: SpatialPoint, b: SpatialPoint): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

/** Row-standardised k-nearest-neighbour weights. */
export const knnWeights = (points: readonly SpatialPoint[], k: number): number[][] => {
  const n = points.length;
  const weights = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i += 1) {
    const distances = points
      .map((point, j) => ({ j, d: j === i ? Infinity : distance(points[i], point) }))
      .filter(entry => Number.isFinite(entry.d))
      .sort((a, b) => a.d - b.d || a.j - b.j)
      .slice(0, Math.max(1, Math.min(k, n - 1)));
    const usable = distances.filter(entry => entry.d > 0).slice(0, k);
    const chosen = usable.length > 0 ? usable : distances;
    chosen.forEach(entry => {
      weights[i][entry.j] = 1 / chosen.length;
    });
  }
  return weights;
};

const spatialLag = (weights: readonly number[][], values: readonly number[]): number[] =>
  weights.map(row => row.reduce((sum, weight, index) => sum + weight * values[index], 0));

export const moranStatistic = (
  values: readonly number[],
  weights: readonly number[][]
): { i: number; expected: number; se: number } => {
  const n = values.length;
  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  const z = values.map(value => value - mean);
  const denom = z.reduce((sum, value) => sum + value ** 2, 0);
  const lag = spatialLag(weights, z);
  const numerator = z.reduce((sum, value, index) => sum + value * lag[index], 0);
  const s0 = weights.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0);
  const i = denom > 0 ? (n / s0) * (numerator / denom) : NaN;
  let s1 = 0;
  let s2 = 0;
  for (let a = 0; a < n; a += 1) {
    const rowSum = weights[a].reduce((sum, value) => sum + value, 0);
    let columnSum = 0;
    for (let b = 0; b < n; b += 1) {
      columnSum += weights[b][a];
      s1 += (weights[a][b] + weights[b][a]) ** 2;
    }
    s2 += (rowSum + columnSum) ** 2;
  }
  s1 /= 2;
  const expected = -1 / Math.max(1, n - 1);
  const variance =
    (n * n * s1 - n * s2 + 3 * s0 * s0) / (Math.max(1, n * n - 1) * s0 * s0) -
    expected ** 2;
  return { i, expected, se: Math.sqrt(Math.max(0, variance)) };
};

export const gearyStatistic = (
  values: readonly number[],
  weights: readonly number[][]
): number => {
  const n = values.length;
  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  let numerator = 0;
  for (let a = 0; a < n; a += 1) {
    for (let b = 0; b < n; b += 1) {
      numerator += weights[a][b] * (values[a] - values[b]) ** 2;
    }
  }
  const denominator = values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  const s0 = weights.reduce((sum, row) => sum + row.reduce((acc, value) => acc + value, 0), 0);
  return denominator > 0 ? ((n - 1) * numerator) / (2 * s0 * denominator) : NaN;
};

export const localMoran = (
  values: readonly number[],
  weights: readonly number[][]
): number[] => {
  const n = values.length;
  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  const z = values.map(value => value - mean);
  const m2 = z.reduce((sum, value) => sum + value ** 2, 0) / n;
  if (m2 === 0) return values.map(() => NaN);
  return z.map((value, index) => {
    const lag = weights[index].reduce((sum, weight, j) => sum + weight * z[j], 0);
    return (value / m2) * lag;
  });
};

const invert = (matrix: number[][]): number[][] | null => {
  const inverse = jStat.inv(matrix) as number[][];
  if (!inverse || inverse.some(row => row.some(value => !Number.isFinite(value)))) return null;
  return inverse;
};

const transform = (matrix: number[][], values: readonly number[]): number[] =>
  matrix.map(row => row.reduce((sum, value, index) => sum + value * values[index], 0));

/** LU determinant with partial pivoting: `jStat.det` is too slow at n > 20. */
const determinant = (input: readonly (readonly number[])[]): number => {
  const n = input.length;
  const matrix = input.map(row => [...row]);
  let det = 1;
  for (let column = 0; column < n; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < n; row += 1) {
      if (Math.abs(matrix[row][column]) > Math.abs(matrix[pivot][column])) pivot = row;
    }
    const value = matrix[pivot][column];
    if (Math.abs(value) < 1e-12) return 0;
    if (pivot !== column) {
      [matrix[column], matrix[pivot]] = [matrix[pivot], matrix[column]];
      det = -det;
    }
    det *= value;
    for (let row = column + 1; row < n; row += 1) {
      const factor = matrix[row][column] / value;
      if (factor === 0) continue;
      for (let index = column; index < n; index += 1) {
        matrix[row][index] -= factor * matrix[column][index];
      }
    }
  }
  return det;
};

const logDeterminant = (matrix: number[][]): number => {
  const value = determinant(matrix);
  return value > 0 ? Math.log(value) : NaN;
};

const concentrated = (
  y: readonly number[],
  x: readonly number[][],
  w: readonly number[][],
  rho: number
): { logLik: number; beta: number[]; sigma2: number } | null => {
  const n = y.length;
  const identity = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0) - rho * w[i][j])
  );
  if (!Number.isFinite(logDeterminant(identity))) return null;
  const transformedY = transform(identity, y);
  // (I - ρW)y = Xβ + ε: only the outcome is filtered, not the design matrix.
  const transformedX = x;
  const xtx: number[][] = Array.from({ length: transformedX[0].length }, () =>
    Array(transformedX[0].length).fill(0)
  );
  const xty = Array(transformedX[0].length).fill(0);
  transformedX.forEach((row, index) => {
    for (let a = 0; a < row.length; a += 1) {
      xty[a] += row[a] * transformedY[index];
      for (let b = 0; b < row.length; b += 1) xtx[a][b] += row[a] * row[b];
    }
  });
  const inverse = invert(xtx);
  if (!inverse) return null;
  const beta = inverse.map(row => row.reduce((sum, value, index) => sum + value * xty[index], 0));
  const residuals = transformedY.map(
    (value, index) => value - transformedX[index].reduce((sum, xv, j) => sum + xv * beta[j], 0)
  );
  const rss = residuals.reduce((sum, value) => sum + value ** 2, 0);
  const sigma2 = rss / n;
  if (sigma2 <= 0) return null;
  const logLik =
    -0.5 * n * Math.log(2 * Math.PI * sigma2) +
    logDeterminant(identity) -
    rss / (2 * sigma2);
  return { logLik, beta, sigma2 };
};

export const spatialAnalysis = (
  points: readonly SpatialPoint[],
  options: {
    mode: SpatialResult['mode'];
    k: number;
    permutations: number;
    seed: number;
    variableName?: string;
    predictorNames?: readonly string[];
  }
): SpatialResult | null => {
  const rows = points.filter(
    point =>
      Number.isFinite(point.x) &&
      Number.isFinite(point.y) &&
      Number.isFinite(point.value) &&
      (options.mode !== 'sar' ||
        (point.predictors ?? []).every(value => Number.isFinite(value)))
  );
  const n = rows.length;
  if (n < 4) return null;
  const k = Math.max(1, Math.min(options.k, n - 1));
  const w = knnWeights(rows, k);
  const values = rows.map(row => row.value);
  const rng = mulberry32(options.seed);

  if (options.mode === 'moran' || options.mode === 'lisa') {
    const moran = moranStatistic(values, w);
    let exceed = 0;
    for (let permutation = 0; permutation < options.permutations; permutation += 1) {
      const shuffled = [...values];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      if (moranStatistic(shuffled, w).i >= moran.i) exceed += 1;
    }
    const permutationP = (exceed + 1) / (options.permutations + 1);
    const z = moran.se > 0 ? (moran.i - moran.expected) / moran.se : NaN;
    const base: SpatialResult = {
      mode: options.mode,
      n,
      k,
      moran: {
        ...moran,
        z,
        p: zTwoSidedP(z),
        permutationP,
      },
      geary: null,
      lisa: [],
      sar: null,
    };
    if (options.mode === 'moran') return base;

    const local = localMoran(values, w);
    const mean = values.reduce((sum, value) => sum + value, 0) / n;
    const lisa: SpatialLisa[] = local.map((value, index) => {
      let greater = 0;
      for (let permutation = 0; permutation < options.permutations; permutation += 1) {
        const shuffled = [...values];
        const fixed = shuffled[index];
        const others = shuffled.filter((_, j) => j !== index);
        for (let i = others.length - 1; i > 0; i -= 1) {
          const j = Math.floor(rng() * (i + 1));
          [others[i], others[j]] = [others[j], others[i]];
        }
        const sample = [...others];
        sample.splice(index, 0, fixed);
        const simulated = localMoran(sample, w)[index];
        if (Math.abs(simulated) >= Math.abs(value)) greater += 1;
      }
      const lag = w[index].reduce((sum, weight, j) => sum + weight * (values[j] - mean), 0);
      const self = values[index] - mean;
      const cluster =
        self > 0 && lag > 0
          ? 'HH'
          : self < 0 && lag < 0
            ? 'LL'
            : self > 0 && lag < 0
              ? 'HL'
              : self < 0 && lag > 0
                ? 'LH'
                : 'none';
      return {
        index,
        x: rows[index].x,
        y: rows[index].y,
        value: values[index],
        local: value,
        p: (greater + 1) / (options.permutations + 1),
        cluster,
      };
    });
    return { ...base, lisa };
  }

  if (options.mode === 'geary') {
    const c = gearyStatistic(values, w);
    let exceed = 0;
    for (let permutation = 0; permutation < options.permutations; permutation += 1) {
      const shuffled = [...values];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      if (Math.abs(gearyStatistic(shuffled, w) - 1) >= Math.abs(c - 1)) exceed += 1;
    }
    return {
      mode: 'geary',
      n,
      k,
      moran: null,
      geary: { c, expected: 1, permutationP: (exceed + 1) / (options.permutations + 1) },
      lisa: [],
      sar: null,
    };
  }

  const predictors = options.predictorNames ?? [];
  const x = rows.map(row => [1, ...(row.predictors ?? [])]);
  const evaluate = (rho: number) => concentrated(values, x, w, rho);
  let bestRho = 0;
  let best = evaluate(0);
  for (let step = 0; step <= 180; step += 1) {
    const rho = -0.9 + (1.8 * step) / 180;
    const candidate = evaluate(rho);
    if (candidate && (!best || candidate.logLik > best.logLik)) {
      best = candidate;
      bestRho = rho;
    }
  }
  if (!best) return null;
  let low = Math.max(-0.95, bestRho - 0.02);
  let high = Math.min(0.95, bestRho + 0.02);
  const phi = (Math.sqrt(5) - 1) / 2;
  for (let iteration = 0; iteration < 60; iteration += 1) {
    const a = high - phi * (high - low);
    const b = low + phi * (high - low);
    const left = evaluate(a);
    const right = evaluate(b);
    if (left && right && left.logLik > right.logLik) high = b;
    else low = a;
  }
  const rho = (low + high) / 2;
  const fit = evaluate(rho) ?? best;
  const nullFit = evaluate(0);
  const lr = nullFit ? Math.max(0, 2 * (fit.logLik - nullFit.logLik)) : NaN;
  const h = 1e-4;
  const plus = evaluate(rho + h);
  const minus = evaluate(rho - h);
  const second =
    plus && minus ? (plus.logLik - 2 * fit.logLik + minus.logLik) / (h * h) : NaN;
  const rhoSe = second < 0 ? Math.sqrt(-1 / second) : NaN;
  const identity = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0) - rho * w[i][j])
  );
  const transformedX = x;
  const xtx: number[][] = Array.from({ length: transformedX[0].length }, () =>
    Array(transformedX[0].length).fill(0)
  );
  transformedX.forEach(row => {
    for (let a = 0; a < row.length; a += 1) {
      for (let b = 0; b < row.length; b += 1) xtx[a][b] += row[a] * row[b];
    }
  });
  const inverse = invert(xtx);
  const names = ['(Intercept)', ...predictors];
  const coefficients: SpatialCoefficient[] = fit.beta.map((estimate, index) => {
    const se = inverse ? Math.sqrt(Math.max(0, fit.sigma2 * inverse[index][index])) : NaN;
    const z = se > 0 ? estimate / se : NaN;
    return {
      term: names[index] ?? `β${index}`,
      estimate,
      se,
      z,
      p: zTwoSidedP(z),
    };
  });
  return {
    mode: 'sar',
    n,
    k,
    moran: null,
    geary: null,
    lisa: [],
    sar: {
      rho,
      rhoSe,
      logLik: fit.logLik,
      lr,
      lrP: chi2SF(lr, 1),
      coefficients,
    },
  };
};
