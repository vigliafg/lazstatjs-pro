import { jStat } from '../jstat';
import type { FactorialCell, FactorialTablesOptions } from '../factorial/types';

const NUMERIC_TOLERANCE = 1e-10;

export const compareLevels = (left: string, right: string): number => {
  const a = Number(left);
  const b = Number(right);
  if (Number.isFinite(a) && Number.isFinite(b)) return a - b;
  return left.localeCompare(right);
};

export const uniqueLevels = (labels: string[]): string[] =>
  Array.from(new Set(labels)).sort(compareLevels);

const zeros = (rows: number, cols: number): number[][] =>
  Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

const invert = (matrix: number[][]): number[][] | null => {
  const size = matrix.length;
  const work = matrix.map((row, index) => [
    ...row,
    ...Array.from({ length: size }, (_, j) => (i => (i === index ? 1 : 0))(j)),
  ]);

  for (let column = 0; column < size; column++) {
    let pivotRow = column;
    for (let row = column + 1; row < size; row++) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivotRow][column])) pivotRow = row;
    }
    if (Math.abs(work[pivotRow][column]) < NUMERIC_TOLERANCE) return null;
    [work[column], work[pivotRow]] = [work[pivotRow], work[column]];

    const pivot = work[column][column];
    for (let j = 0; j < 2 * size; j++) work[column][j] /= pivot;

    for (let row = 0; row < size; row++) {
      if (row === column) continue;
      const factor = work[row][column];
      if (factor === 0) continue;
      for (let j = 0; j < 2 * size; j++) work[row][j] -= factor * work[column][j];
    }
  }

  return work.map(row => row.slice(size));
};

interface ModelFit {
  sse: number;
  rank: number;
}

export const fitModel = (columns: number[][], y: number[]): ModelFit | null => {
  if (columns.length === 0) return { sse: 0, rank: 0 };
  const n = y.length;
  const p = columns[0].length;
  const xtx = zeros(p, p);
  const xty = new Array<number>(p).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      xty[j] += columns[i][j] * y[i];
      for (let k = 0; k <= j; k++) xtx[j][k] += columns[i][j] * columns[i][k];
    }
  }
  for (let j = 0; j < p; j++) {
    for (let k = 0; k < j; k++) xtx[k][j] = xtx[j][k];
  }

  const inverse = invert(xtx);
  if (!inverse) return null;

  let sse = 0;
  for (let i = 0; i < n; i++) {
    let fitted = 0;
    for (let j = 0; j < p; j++) {
      let beta = 0;
      for (let k = 0; k < p; k++) beta += inverse[j][k] * xty[k];
      fitted += columns[i][j] * beta;
    }
    sse += Math.pow(y[i] - fitted, 2);
  }

  return { sse, rank: p };
};

export const dummy = (value: string, levels: string[]): number[] =>
  levels.slice(1).map(level => (value === level ? 1 : 0));

export const factorialCells = (options: FactorialTablesOptions): FactorialCell[] => {
  const groups = new Map<string, number[]>();
  options.response.forEach((value, index) => {
    const key = `${options.factorA[index]}\u0000${options.factorB[index]}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(value);
    groups.set(key, bucket);
  });

  return Array.from(groups.entries()).map(([key, values]) => {
    const [a, b] = key.split('\u0000');
    return {
      a,
      b,
      n: values.length,
      mean: jStat.mean(values),
      sd: values.length > 1 ? jStat.stdev(values, true) : NaN,
    };
  }).sort((left, right) => compareLevels(left.a, right.a) || compareLevels(left.b, right.b));
};
