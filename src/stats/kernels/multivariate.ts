import { jStat } from '../jstat';
import { chi2SF, mulberry32 } from '../distributions';
import { eigenSymmetric } from '../linalg';
import { mean } from '../multivariate/math';
import type { AlphaItemStat, AlphaResult, EfaResult, PcaResult } from '../multivariate/types';

const variance = (values: number[], center: number): number =>
  values.reduce((sum, value) => sum + (value - center) ** 2, 0) / (values.length - 1);

const correlation = (a: number[], b: number[]): number => {
  const ma = mean(a);
  const mb = mean(b);
  const va = variance(a, ma);
  const vb = variance(b, mb);
  if (!(va > 0) || !(vb > 0)) return NaN;
  const cov = a.reduce((sum, value, index) => sum + (value - ma) * (b[index] - mb), 0) / (a.length - 1);
  return cov / Math.sqrt(va * vb);
};

const completeRows = (data: number[][]): number[][] =>
  data.filter((row) => row.every((value) => Number.isFinite(value)));

export const principalComponents = (
  data: number[][],
  variables: string[],
  standardize: boolean
): PcaResult | null => {
  const rows = completeRows(data);
  const p = variables.length;
  if (p < 2 || rows.length < 3 || rows.some((row) => row.length !== p)) return null;

  const n = rows.length;
  const means = variables.map((_, column) => mean(rows.map((row) => row[column])));
  const sds = variables.map((_, column) => jStat.stdev(rows.map((row) => row[column]), true));
  if (standardize && sds.some((sd) => !(sd > 0))) return null;

  // Work on the centered (and optionally standardized) data; the matrix that
  // is decomposed is the correlation matrix when standardize is true.
  const working = rows.map((row) => row.map((value, column) => (value - means[column]) / (standardize ? sds[column] : 1)));
  const matrix = Array.from({ length: p }, () => new Array<number>(p).fill(0));
  for (let i = 0; i < p; i += 1) {
    for (let j = i; j < p; j += 1) {
      let sum = 0;
      for (let r = 0; r < n; r += 1) sum += working[r][i] * working[r][j];
      const value = sum / (n - 1);
      matrix[i][j] = value;
      matrix[j][i] = value;
    }
  }

  const eigen = eigenSymmetric(matrix);
  const total = eigen.values.reduce((sum, value) => sum + Math.max(0, value), 0);
  if (!(total > 0)) return null;
  const eigenvalues = eigen.values.map((value) => (value > 0 ? value : 0));
  const variancePct = eigenvalues.map((value) => (value / total) * 100);
  const cumulativePct: number[] = [];
  variancePct.reduce((sum, value) => {
    const next = sum + value;
    cumulativePct.push(next);
    return next;
  }, 0);

  const average = total / p;
  const retained = Math.max(
    1,
    Math.min(p, eigenvalues.filter((value) => (standardize ? value > 1 : value > average)).length)
  );
  const loadings = variables.map((_, column) =>
    eigenvalues.map((value, component) => eigen.vectors[column][component] * Math.sqrt(value))
  );
  const communalities = loadings.map((row) =>
    row.slice(0, retained).reduce((sum, value) => sum + value * value, 0)
  );
  const scores = working.map((row) =>
    eigenvalues.map((_, component) => row.reduce((sum, value, column) => sum + value * eigen.vectors[column][component], 0))
  );

  // Bartlett's test of sphericity: -[n−1−(2p+5)/6]·ln|R|.
  let determinant = 1;
  eigenvalues.forEach((value) => {
    determinant *= value;
  });
  const df = (p * (p - 1)) / 2;
  const bartlettChi2 =
    standardize && determinant > 0
      ? -(n - 1 - (2 * p + 5) / 6) * Math.log(determinant)
      : NaN;
  const bartlettP = Number.isFinite(bartlettChi2) ? chi2SF(bartlettChi2, df) : NaN;

  // KMO from the inverse correlation matrix. A singular R (or a failed
  // inversion) leaves the index undefined instead of returning garbage.
  let kmo = NaN;
  const kmoItems = variables.map(() => NaN);
  if (standardize) {
    try {
      const inverse = jStat.inv(matrix) as number[][];
      const partial = (i: number, j: number): number =>
        -inverse[i][j] / Math.sqrt(inverse[i][i] * inverse[j][j]);
      let sumR = 0;
      let sumP = 0;
      const itemR = variables.map((_, i) =>
        variables.reduce((sum, __, j) => (i === j ? sum : sum + matrix[i][j] ** 2), 0)
      );
      const itemP = variables.map((_, i) =>
        variables.reduce((sum, __, j) => (i === j ? sum : sum + partial(i, j) ** 2), 0)
      );
      for (let i = 0; i < p; i += 1) {
        for (let j = i + 1; j < p; j += 1) {
          sumR += matrix[i][j] ** 2;
          sumP += partial(i, j) ** 2;
        }
      }
      if (sumR + sumP > 0) kmo = sumR / (sumR + sumP);
      itemR.forEach((r, index) => {
        const denominator = r + itemP[index];
        if (denominator > 0) kmoItems[index] = r / denominator;
      });
    } catch {
      // leave NaN: the report states that KMO is not computable.
    }
  }

  return {
    n,
    variables,
    standardize,
    eigenvalues,
    variancePct,
    cumulativePct,
    loadings,
    communalities,
    retained,
    scores,
    bartlettChi2,
    bartlettDf: df,
    bartlettP,
    kmo,
    kmoItems,
    determinant,
  };
};

export const cronbachAlpha = (data: number[][], items: string[]): AlphaResult | null => {
  const rows = completeRows(data);
  const k = items.length;
  if (k < 2 || rows.length < 2 || rows.some((row) => row.length !== k)) return null;

  const n = rows.length;
  const columns = items.map((_, index) => rows.map((row) => row[index]));
  const means = columns.map((values) => mean(values));
  const sds = columns.map((values, index) => jStat.stdev(values, true));
  const itemVariances = columns.map((values, index) => variance(values, means[index]));
  const totals = rows.map((row) => row.reduce((sum, value) => sum + value, 0));
  const totalMean = mean(totals);
  const totalVariance = variance(totals, totalMean);
  if (!(totalVariance > 0)) return null;

  const alpha = (k / (k - 1)) * (1 - itemVariances.reduce((sum, value) => sum + value, 0) / totalVariance);

  const correlations = items.map((_, i) => items.map((__, j) => (i === j ? 1 : correlation(columns[i], columns[j]))));
  let pairSum = 0;
  let pairs = 0;
  for (let i = 0; i < k; i += 1) {
    for (let j = i + 1; j < k; j += 1) {
      if (Number.isFinite(correlations[i][j])) {
        pairSum += correlations[i][j];
        pairs += 1;
      }
    }
  }
  const meanInterItem = pairs > 0 ? pairSum / pairs : NaN;
  const standardizedAlpha = Number.isFinite(meanInterItem)
    ? (k * meanInterItem) / (1 + (k - 1) * meanInterItem)
    : NaN;

  const stats: AlphaItemStat[] = items.map((item, index) => {
    const rest = rows.map((row) => row.reduce((sum, value, column) => (column === index ? sum : sum + value), 0));
    const restVariance = variance(rest, mean(rest));
    const restItemVariances = itemVariances.filter((__, column) => column !== index);
    const alphaIfDeleted =
      k > 2 && restVariance > 0
        ? ((k - 1) / (k - 2)) * (1 - restItemVariances.reduce((sum, value) => sum + value, 0) / restVariance)
        : NaN;
    return {
      item,
      mean: means[index],
      sd: sds[index],
      itemTotal: correlation(columns[index], rest),
      alphaIfDeleted,
    };
  });

  return {
    n,
    k,
    alpha,
    standardizedAlpha,
    meanInterItem,
    items: stats,
    correlations,
    totalMean,
    totalSd: Math.sqrt(totalVariance),
  };
};

/* ------------------------------------------------------------------------- */
/* Exploratory factor analysis                                               */
/* ------------------------------------------------------------------------- */

type Matrix = number[][];

const matMul = (a: Matrix, b: Matrix): Matrix =>
  a.map(row => b[0].map((_, column) => row.reduce((sum, value, i) => sum + value * b[i][column], 0)));

const matTranspose = (matrix: Matrix): Matrix =>
  matrix[0].map((_, column) => matrix.map(row => row[column]));

const correlationMatrix = (data: number[][], standardize: boolean): Matrix => {
  const p = data[0].length;
  const columns = Array.from({ length: p }, (_, j) => data.map(row => row[j]));
  const matrix: Matrix = Array.from({ length: p }, () => new Array<number>(p).fill(0));
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      if (standardize) {
        matrix[i][j] = correlation(columns[i], columns[j]);
      } else {
        const mi = mean(columns[i]);
        const mj = mean(columns[j]);
        matrix[i][j] = columns[i].reduce(
          (sum, value, index) => sum + (value - mi) * (columns[j][index] - mj),
          0
        ) / (columns[i].length - 1);
      }
    }
  }
  return matrix;
};

const svdSmall = (matrix: Matrix): { u: Matrix; v: Matrix } => {
  const k = matrix.length;
  const bt = matTranspose(matrix);
  const btb = matMul(bt, matrix);
  const eig = eigenSymmetric(btb);
  const singular = eig.values.map(value => Math.sqrt(Math.max(0, value)));
  const v = eig.vectors;
  const u = Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (_, j) => {
      const denominator = singular[j];
      if (!(denominator > 1e-12)) return i === j ? 1 : 0;
      return bt[i][j] === undefined ? 0 : matrix[i].reduce((sum, value, r) => sum + value * v[r][j], 0) / denominator;
    })
  );
  return { u, v };
};

const varimax = (loadings: Matrix, maxIterations = 60): Matrix => {
  const p = loadings.length;
  const k = loadings[0].length;
  if (k < 2) return loadings.map(row => [...row]);
  const h = loadings.map(row => {
    const value = Math.sqrt(row.reduce((sum, entry) => sum + entry * entry, 0));
    return value > 1e-12 ? value : 1;
  });
  let x = loadings.map((row, i) => row.map(value => value / h[i]));

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const xt = matTranspose(x);
    const s = matMul(xt, x);
    const x3 = x.map(row => row.map(value => value ** 3));
    const adjusted = x.map((row, i) =>
      row.map((value, j) => x3[i][j] - (value * s[j][j]) / p)
    );
    const b = matMul(xt, adjusted);
    const { u, v } = svdSmall(b);
    const t = matMul(u, matTranspose(v));
    x = matMul(x, t);
  }

  return x.map((row, i) => row.map(value => value * h[i]));
};

const parallelThresholds = (n: number, p: number, reps = 100): number[] => {
  const rng = mulberry32(12345);
  const normal = () => {
    const u = Math.max(1e-12, rng());
    const v = Math.max(1e-12, rng());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const values: number[][] = [];
  for (let rep = 0; rep < reps; rep++) {
    const data = Array.from({ length: n }, () => Array.from({ length: p }, () => normal()));
    const r = correlationMatrix(data, true);
    values.push(eigenSymmetric(r).values);
  }
  return Array.from({ length: p }, (_, component) => {
    const sorted = values.map(row => row[component]).sort((a, b) => a - b);
    return sorted[Math.floor(0.95 * (sorted.length - 1))];
  });
};

export interface EfaInput {
  data: number[][];
  variables: string[];
  standardize: boolean;
  factors: number;
  rotation: 'none' | 'varimax';
}

/** Analisi fattoriale esplorativa con estrazione principal-axis. */
export const exploratoryFactorAnalysis = (input: EfaInput): EfaResult | null => {
  const { data, variables, standardize, rotation } = input;
  const p = variables.length;
  if (p < 3 || data.length < p + 2) return null;
  const R = correlationMatrix(data, standardize);
  const eigen = eigenSymmetric(R);
  const thresholds = parallelThresholds(data.length, p);
  let factors = input.factors > 0 ? Math.min(input.factors, p - 1) : 0;
  if (factors === 0) {
    factors = eigen.values.filter((value, index) => value > thresholds[index]).length;
    factors = Math.max(1, Math.min(p - 1, factors));
  }

  let communalities = new Array<number>(p).fill(1);
  let loadings: Matrix = Array.from({ length: p }, () => new Array<number>(factors).fill(0));
  for (let iteration = 0; iteration < 200; iteration++) {
    const reduced = R.map((row, i) => row.map((value, j) => (i === j ? communalities[i] : value)));
    const eig = eigenSymmetric(reduced);
    loadings = Array.from({ length: p }, (_, i) =>
      Array.from({ length: factors }, (_, j) => {
        const value = eig.values[j] ?? 0;
        return value > 0 ? eig.vectors[i][j] * Math.sqrt(value) : 0;
      })
    );
    const next = loadings.map(row => Math.min(1, row.reduce((sum, value) => sum + value * value, 0)));
    const change = Math.max(...next.map((value, i) => Math.abs(value - communalities[i])));
    communalities = next;
    if (change < 1e-7) break;
  }

  const rotated = rotation === 'varimax' ? varimax(loadings) : loadings;
  const h2 = rotated.map(row => Math.min(1, row.reduce((sum, value) => sum + value * value, 0)));
  const uniqueness = h2.map(value => 1 - value);
  const variance = Array.from({ length: factors }, (_, j) =>
    rotated.reduce((sum, row) => sum + row[j] * row[j], 0)
  );
  const variancePct = variance.map(value => (value / p) * 100);
  const cumulativePct = variancePct.reduce<number[]>((accumulator, value, index) => {
    accumulator.push(value + (index > 0 ? accumulator[index - 1] : 0));
    return accumulator;
  }, []);
  const factorSums = Array.from({ length: factors }, (_, j) =>
    rotated.reduce((sum, row) => sum + row[j], 0)
  );
  const explained = factorSums.reduce((sum, value) => sum + value * value, 0);
  const omega = Math.min(
    1,
    Math.max(0, explained / (explained + uniqueness.reduce((sum, value) => sum + value, 0)))
  );

  const determinant = eigen.values.reduce((product, value) => product * Math.max(1e-12, value), 1);
  const bartlettChi2 = -(data.length - 1 - (2 * p + 5) / 6) * Math.log(determinant);
  const bartlettDf = (p * (p - 1)) / 2;

  return {
    n: data.length,
    p,
    factors,
    rotation,
    eigenvalues: eigen.values,
    parallelThreshold: thresholds,
    loadings: rotated,
    communalities: h2,
    uniqueness,
    variancePct,
    cumulativePct,
    omega,
    bartlettChi2,
    bartlettDf,
    bartlettP: chi2SF(bartlettChi2, bartlettDf),
    determinant,
  };
};
