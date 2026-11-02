/**
 * Small dense-matrix helpers shared by the L4 kernels.
 *
 * The existing kernels each carried their own private inverse; new procedures
 * (discriminant, DOE, cluster) need the same primitives, so they live here
 * instead of being copied again. Matrices are arrays of rows.
 */

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
