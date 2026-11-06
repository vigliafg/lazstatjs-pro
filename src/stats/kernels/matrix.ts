/**
 * Small dense-matrix helpers shared by the L4 kernels.
 *
 * The existing kernels each carried their own private inverse; new procedures
 * (discriminant, DOE, cluster) need the same primitives, so they live here
 * instead of being copied again. Matrices are arrays of rows.
 */

import { eigenSymmetric } from '../linalg';

export type Matrix = number[][];

export const zeros = (rows: number, cols: number): Matrix =>
  Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

export const identity = (size: number): Matrix => {
  const result = zeros(size, size);
  for (let i = 0; i < size; i += 1) result[i][i] = 1;
  return result;
};

export const transpose = (matrix: Matrix): Matrix =>
  (matrix[0] ?? []).map((_, column) => matrix.map(row => row[column] ?? 0));

export const multiply = (a: Matrix, b: Matrix): Matrix => {
  const result = zeros(a.length, b[0]?.length ?? 0);
  for (let i = 0; i < a.length; i += 1) {
    for (let k = 0; k < b.length; k += 1) {
      const value = a[i][k] ?? 0;
      if (value === 0) continue;
      for (let j = 0; j < (b[0]?.length ?? 0); j += 1) {
        result[i][j] += value * (b[k][j] ?? 0);
      }
    }
  }
  return result;
};

export const multiplyVector = (matrix: Matrix, vector: number[]): number[] =>
  matrix.map(row => row.reduce((sum, value, index) => sum + value * (vector[index] ?? 0), 0));

export const quadratic = (matrix: Matrix, vector: number[]): number =>
  vector.reduce(
    (sum, value, index) =>
      sum + value * (matrix[index]?.reduce((inner, cell, j) => inner + cell * (vector[j] ?? 0), 0) ?? 0),
    0
  );

/** Gauss-Jordan inverse with partial pivoting. `null` for singular matrices. */
export const invert = (matrix: Matrix): Matrix | null => {
  const size = matrix.length;
  if (size === 0 || matrix.some(row => row.length !== size)) return null;
  const work = matrix.map((row, index) => [
    ...row,
    ...Array.from({ length: size }, (_, column) => (column === index ? 1 : 0)),
  ]);

  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
    }
    if (Math.abs(work[pivot][column]) < 1e-12) return null;
    [work[column], work[pivot]] = [work[pivot], work[column]];
    const divisor = work[column][column];
    for (let j = 0; j < 2 * size; j += 1) work[column][j] /= divisor;
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = work[row][column];
      if (factor === 0) continue;
      for (let j = 0; j < 2 * size; j += 1) work[row][j] -= factor * work[column][j];
    }
  }

  return work.map(row => row.slice(size));
};

/**
 * Symmetric matrix power: `V diag(value^power) V'`.
 *
 * Discriminant analysis needs the inverse square root of the pooled within
 * covariance; cluster and DOE keep the helper for future metric variants.
 */
export const symmetricPower = (
  matrix: Matrix,
  values: number[],
  vectors: Matrix,
  power: number
): Matrix => {
  const size = matrix.length;
  const result = zeros(size, size);
  for (let i = 0; i < size; i += 1) {
    for (let j = 0; j < size; j += 1) {
      let sum = 0;
      for (let k = 0; k < size; k += 1) {
        const value = values[k] ?? 0;
        if (!(value > 0)) continue;
        sum += (vectors[i][k] ?? 0) * Math.pow(value, power) * (vectors[j][k] ?? 0);
      }
      result[i][j] = sum;
    }
  }
  return result;
};

/** Row-wise mean vector. */
export const columnMeans = (rows: Matrix): number[] => {
  if (rows.length === 0) return [];
  const width = rows[0].length;
  return Array.from({ length: width }, (_, column) =>
    rows.reduce((sum, row) => sum + (row[column] ?? 0), 0) / rows.length
  );
};

/** Solve `A x = b` with Gauss-Jordan and partial pivoting. `null` if singular. */
export const solveLinear = (matrix: Matrix, vector: number[]): number[] | null => {
  const size = matrix.length;
  if (size === 0 || vector.length !== size || matrix.some(row => row.length !== size)) return null;
  const work = matrix.map((row, index) => [...row, vector[index] ?? 0]);

  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
    }
    if (Math.abs(work[pivot][column]) < 1e-12) return null;
    [work[column], work[pivot]] = [work[pivot], work[column]];
    const divisor = work[column][column];
    for (let j = column; j <= size; j += 1) work[column][j] /= divisor;
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = work[row][column];
      if (factor === 0) continue;
      for (let j = column; j <= size; j += 1) work[row][j] -= factor * work[column][j];
    }
  }

  return work.map(row => row[size]);
};

/** Cholesky factor `L` with `A = L L'`. `null` if not positive definite. */
export const cholesky = (matrix: Matrix): Matrix | null => {
  const size = matrix.length;
  if (size === 0 || matrix.some(row => row.length !== size)) return null;
  const lower = zeros(size, size);
  for (let i = 0; i < size; i += 1) {
    for (let j = 0; j <= i; j += 1) {
      let sum = matrix[i][j];
      for (let k = 0; k < j; k += 1) sum -= lower[i][k] * lower[j][k];
      if (i === j) {
        if (sum <= 1e-12) return null;
        lower[i][j] = Math.sqrt(sum);
      } else {
        lower[i][j] = sum / lower[j][j];
      }
    }
  }
  return lower;
};

export interface SvdResult {
  /** Left singular vectors, one row per observation, one column per component. */
  u: Matrix;
  /** Singular values, descending. */
  s: number[];
  /** Right singular vectors, one row per variable, one column per component. */
  v: Matrix;
}

/**
 * Thin SVD for small dense matrices, via the symmetric eigendecomposition of
 * `A' A`. Numerically adequate for the handful of variables used by SEM, IRT
 * and PLS; large problems should move to a dedicated worker/kernel.
 */
export const svd = (matrix: Matrix): SvdResult => {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return { u: [], s: [], v: [] };

  const gram = zeros(cols, cols);
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      const value = matrix[i][j] ?? 0;
      if (value === 0) continue;
      for (let k = 0; k < cols; k += 1) gram[j][k] += value * (matrix[i][k] ?? 0);
    }
  }

  const eigen = eigenSymmetric(gram);
  const s = eigen.values.map(value => Math.sqrt(Math.max(0, value)));
  const v = eigen.vectors;
  const u = zeros(rows, cols);
  for (let component = 0; component < cols; component += 1) {
    if (!(s[component] > 1e-12)) continue;
    for (let i = 0; i < rows; i += 1) {
      let sum = 0;
      for (let k = 0; k < cols; k += 1) sum += (matrix[i][k] ?? 0) * (v[k][component] ?? 0);
      u[i][component] = sum / s[component];
    }
  }
  return { u, s, v };
};

/** Moore–Penrose pseudo-inverse through the SVD. */
export const pseudoInverse = (matrix: Matrix): Matrix => {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return [];
  const { u, s, v } = svd(matrix);
  const result = zeros(cols, rows);
  for (let component = 0; component < s.length; component += 1) {
    if (!(s[component] > 1e-12)) continue;
    const inverse = 1 / s[component];
    for (let row = 0; row < cols; row += 1) {
      for (let column = 0; column < rows; column += 1) {
        result[row][column] += (v[row][component] ?? 0) * inverse * (u[column][component] ?? 0);
      }
    }
  }
  return result;
};

export interface QrResult {
  /** Orthogonal factor (`m x m`). */
  q: Matrix;
  /** Upper-triangular factor (`m x n`). */
  r: Matrix;
}

/**
 * Householder QR decomposition. Returns the full `Q` (`m x m`) and `R`
 * (`m x n`) so `A = Q R` holds exactly; the diagonal of `R` uses the same
 * sign convention as NumPy/LAPACK (`R[k][k] < 0` when the column is non-zero).
 */
export const qr = (matrix: Matrix): QrResult | null => {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return null;
  if (matrix.some(row => row.length !== cols)) return null;

  const a = matrix.map(row => [...row]);
  const q = identity(rows);
  const reflectors = Math.min(rows, cols);

  for (let k = 0; k < reflectors; k += 1) {
    let norm = 0;
    for (let i = k; i < rows; i += 1) norm += a[i][k] * a[i][k];
    norm = Math.sqrt(norm);
    if (!(norm > 1e-14)) continue;

    const alpha = a[k][k] > 0 ? -norm : norm;
    const v = new Array<number>(rows).fill(0);
    for (let i = k; i < rows; i += 1) v[i] = a[i][k];
    v[k] -= alpha;
    let squared = 0;
    for (let i = k; i < rows; i += 1) squared += v[i] * v[i];
    if (!(squared > 1e-28)) continue;

    for (let j = k; j < cols; j += 1) {
      let dot = 0;
      for (let i = k; i < rows; i += 1) dot += v[i] * a[i][j];
      const factor = (2 * dot) / squared;
      for (let i = k; i < rows; i += 1) a[i][j] -= factor * v[i];
    }

    for (let i = 0; i < rows; i += 1) {
      let dot = 0;
      for (let j = k; j < rows; j += 1) dot += q[i][j] * v[j];
      const factor = (2 * dot) / squared;
      for (let j = k; j < rows; j += 1) q[i][j] -= factor * v[j];
    }
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 0; j < Math.min(i, cols); j += 1) a[i][j] = 0;
  }
  return { q, r: a };
};

/** Numerical rank from the singular values (default tolerance `1e-10`). */
export const rank = (matrix: Matrix, tolerance = 1e-10): number => {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return 0;
  const { s } = svd(matrix);
  if (s.length === 0) return 0;
  const threshold = tolerance * Math.max(rows, cols) * s[0];
  return s.filter(value => value > threshold).length;
};

export const numericalHessian = (objective: (values: number[]) => number, x: number[]): Matrix => {
  const size = x.length;
  const hessian: Matrix = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  const steps = x.map(value => 1e-4 * Math.max(1, Math.abs(value)));
  const shifted = (i: number, si: number, j: number, sj: number): number[] => {
    const values = [...x];
    values[i] += si * steps[i];
    values[j] += sj * steps[j];
    return values;
  };
  for (let i = 0; i < size; i += 1) {
    for (let j = i; j < size; j += 1) {
      const value =
        (objective(shifted(i, 1, j, 1)) - objective(shifted(i, 1, j, -1)) -
          objective(shifted(i, -1, j, 1)) + objective(shifted(i, -1, j, -1))) /
        (4 * steps[i] * steps[j]);
      hessian[i][j] = value;
      hessian[j][i] = value;
    }
  }
  return hessian;
}
