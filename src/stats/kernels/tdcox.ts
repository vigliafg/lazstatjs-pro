import { chi2SF, zCrit, zTwoSidedP } from '../distributions';
import type { CoxCoefficient } from '../cox/types';
import type { TimeDependentCoxOptions } from '../tdcox/types';

type Matrix = number[][];

const zeros = (size: number): number[] => new Array<number>(size).fill(0);
const zeroMatrix = (size: number): Matrix =>
  Array.from({ length: size }, () => new Array<number>(size).fill(0));

const invert = (matrix: Matrix): Matrix | null => {
  const n = matrix.length;
  const work = matrix.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let column = 0; column < n; column++) {
    let pivot = column;
    for (let row = column + 1; row < n; row++) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
    }
    if (Math.abs(work[pivot][column]) < 1e-12) return null;
    [work[column], work[pivot]] = [work[pivot], work[column]];
    const divisor = work[column][column];
    for (let j = 0; j < 2 * n; j++) work[column][j] /= divisor;
    for (let row = 0; row < n; row++) {
      if (row === column) continue;
      const factor = work[row][column];
      for (let j = 0; j < 2 * n; j++) work[row][j] -= factor * work[column][j];
    }
  }
  return work.map(row => row.slice(n));
};

const solve = (matrix: Matrix, vector: number[]): number[] | null => {
  const inverse = invert(matrix);
  return inverse ? inverse.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0)) : null;
};

interface Interval {
  start: number;
  stop: number;
  event: number;
  x: number[];
}

const prepare = (options: TimeDependentCoxOptions): Interval[] => {
  const intervals: Interval[] = [];
  options.start.forEach((start, index) => {
    const stop = options.stop[index];
    const event = options.event[index];
    const x = options.covariates.map(covariate => covariate.values[index]);
    if (!Number.isFinite(start) || !Number.isFinite(stop) || !(stop > start)) return;
    if (event !== 0 && event !== 1) return;
    if (x.some(value => !Number.isFinite(value))) return;
    intervals.push({ start, stop, event, x });
  });
  return intervals;
};

const evaluate = (intervals: Interval[], beta: number[]) => {
  const k = beta.length;
  let logLik = 0;
  const score = zeros(k);
  const info = zeroMatrix(k);
  const eventTimes = Array.from(
    new Set(intervals.filter(interval => interval.event === 1).map(interval => interval.stop))
  ).sort((a, b) => a - b);

  eventTimes.forEach(atTime => {
    const atRisk = intervals.filter(interval => interval.start < atTime && interval.stop >= atTime);
    if (atRisk.length === 0) return;
    const eta = atRisk.map(interval => interval.x.reduce((sum, value, j) => sum + value * beta[j], 0));
    const largest = Math.max(...eta);
    const weights = eta.map(value => Math.exp(value - largest));
    const s0 = weights.reduce((sum, value) => sum + value, 0);
    if (!(s0 > 0) || !Number.isFinite(s0)) return;
    const s1 = zeros(k);
    const s2 = zeroMatrix(k);
    atRisk.forEach((interval, index) => {
      const weight = weights[index];
      for (let a = 0; a < k; a++) {
        s1[a] += weight * interval.x[a];
        for (let b = 0; b < k; b++) s2[a][b] += weight * interval.x[a] * interval.x[b];
      }
    });
    const mean = s1.map(value => value / s0);
    const deaths = intervals.filter(
      interval => interval.event === 1 && interval.stop === atTime && interval.start < atTime
    );
    deaths.forEach(interval => {
      for (let j = 0; j < k; j++) {
        logLik += interval.x[j] * beta[j];
        score[j] += interval.x[j];
      }
    });
    logLik -= deaths.length * (largest + Math.log(s0));
    for (let a = 0; a < k; a++) {
      score[a] -= deaths.length * mean[a];
      for (let b = 0; b < k; b++) {
        info[a][b] += deaths.length * (s2[a][b] / s0 - mean[a] * mean[b]);
      }
    }
  });

  return { logLik, score, information: info };
};

/** Cox con covariate tempo-dipendenti su dati start-stop. */
export const timeDependentCoxStats = (options: TimeDependentCoxOptions): {
  n: number;
  events: number;
  intervals: number;
  coefficients: CoxCoefficient[];
  logLik: number;
  logLikNull: number;
  lr: number;
  lrP: number;
  wald: number;
  waldP: number;
  score: number;
  scoreP: number;
  iterations: number;
  converged: boolean;
  warnings: string[];
} | null => {
  const k = options.covariates.length;
  if (k === 0) return null;
  const intervals = prepare(options);
  const events = intervals.filter(interval => interval.event === 1).length;
  if (intervals.length < k + 2 || events < k + 2) return null;

  let beta = zeros(k);
  let current = evaluate(intervals, beta);
  let iterations = 0;
  let converged = false;
  for (let iteration = 1; iteration <= 30; iteration++) {
    iterations = iteration;
    const delta = solve(current.information, current.score);
    if (!delta) break;
    let step = 1;
    let accepted = false;
    while (step > 1e-6) {
      const candidate = beta.map((value, index) => value + step * delta[index]);
      const next = evaluate(intervals, candidate);
      if (Number.isFinite(next.logLik) && next.logLik >= current.logLik - 1e-10) {
        beta = candidate;
        current = next;
        accepted = true;
        break;
      }
      step /= 2;
    }
    if (!accepted) break;
    if (Math.max(...delta.map(value => Math.abs(value * step))) < 1e-9) {
      converged = true;
      break;
    }
  }

  const inverse = invert(current.information);
  if (!inverse) return null;
  const level = options.level ?? 95;
  const critical = zCrit(level);
  const coefficients: CoxCoefficient[] = options.covariates.map((covariate, column) => {
    const value = beta[column];
    const se = Math.sqrt(Math.max(0, inverse[column][column]));
    const z = se > 0 ? value / se : NaN;
    return {
      term: covariate.name,
      beta: value,
      se,
      z,
      p: Number.isFinite(z) ? zTwoSidedP(z) : NaN,
      hr: Math.exp(value),
      lo: Math.exp(value - critical * se),
      hi: Math.exp(value + critical * se),
    };
  });

  const nullFit = evaluate(intervals, zeros(k));
  const lr = Math.max(0, 2 * (current.logLik - nullFit.logLik));
  const lrP = chi2SF(lr, k);
  const wald = Math.max(0, beta.reduce((sum, value, row) => {
    let inner = 0;
    for (let column = 0; column < k; column++) inner += current.information[row][column] * beta[column];
    return sum + value * inner;
  }, 0));
  const waldP = chi2SF(wald, k);
  const nullInverse = invert(nullFit.information);
  let score = NaN;
  if (nullInverse) {
    score = Math.max(0, nullFit.score.reduce((sum, value, row) => {
      let inner = 0;
      for (let column = 0; column < k; column++) inner += nullInverse[row][column] * nullFit.score[column];
      return sum + value * inner;
    }, 0));
  }
  const scoreP = chi2SF(score, k);

  return {
    n: intervals.length,
    events,
    intervals: intervals.length,
    coefficients,
    logLik: current.logLik,
    logLikNull: nullFit.logLik,
    lr,
    lrP,
    wald,
    waldP,
    score,
    scoreP,
    iterations,
    converged,
    warnings: converged ? [] : ['L’algoritmo non ha raggiunto la convergenza.'],
  };
};
