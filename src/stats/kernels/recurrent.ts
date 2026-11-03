import { chi2SF, zCrit, zTwoSidedP } from '../distributions';
import type {
  RecurrentCoefficient,
  RecurrentFit,
  RecurrentOptions,
} from '../recurrent/types';

const zeros = (size: number): number[] => new Array<number>(size).fill(0);
const zeroMatrix = (size: number): number[][] =>
  Array.from({ length: size }, () => new Array<number>(size).fill(0));

const solve = (matrix: number[][], vector: number[]): number[] | null => {
  const size = vector.length;
  if (size === 0) return [];
  const work = matrix.map((row, index) => [...row, vector[index]]);
  for (let column = 0; column < size; column++) {
    let pivot = column;
    for (let row = column + 1; row < size; row++) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
    }
    if (!(Math.abs(work[pivot][column]) > 1e-12)) return null;
    [work[column], work[pivot]] = [work[pivot], work[column]];
    const scale = work[column][column];
    for (let index = column; index <= size; index++) work[column][index] /= scale;
    for (let row = 0; row < size; row++) {
      if (row === column) continue;
      const factor = work[row][column];
      if (factor === 0) continue;
      for (let index = column; index <= size; index++) work[row][index] -= factor * work[column][index];
    }
  }
  return work.map((row, index) => row[size]);
};

const invert = (matrix: number[][]): number[][] | null => {
  const size = matrix.length;
  if (size === 0) return [];
  const work = matrix.map((row, index) => [
    ...row,
    ...Array.from({ length: size }, (_, column) => (column === index ? 1 : 0)),
  ]);
  for (let column = 0; column < size; column++) {
    let pivot = column;
    for (let row = column + 1; row < size; row++) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
    }
    if (!(Math.abs(work[pivot][column]) > 1e-12)) return null;
    [work[column], work[pivot]] = [work[pivot], work[column]];
    const scale = work[column][column];
    for (let index = 0; index < 2 * size; index++) work[column][index] /= scale;
    for (let row = 0; row < size; row++) {
      if (row === column) continue;
      const factor = work[row][column];
      if (factor === 0) continue;
      for (let index = 0; index < 2 * size; index++) work[row][index] -= factor * work[column][index];
    }
  }
  return work.map(row => row.slice(size));
};

interface Row {
  cluster: number;
  stratum: number;
  time: number;
  event: number;
  x: number[];
  /** AG only: the row is at risk for event times in (start, stop]. */
  start?: number;
}

interface Evaluation {
  logLik: number;
  score: number[];
  information: number[][];
  /** Per-cluster score contributions at the event times. */
  contributions: Map<number, number[]>;
}

const evaluate = (rows: Row[], strata: number[], beta: number[]): Evaluation => {
  const k = beta.length;
  let logLik = 0;
  const score = zeros(k);
  const information = zeroMatrix(k);
  const contributions = new Map<number, number[]>();

  strata.forEach(stratum => {
    const subset = rows.filter(row => row.stratum === stratum);
    const eventTimes = Array.from(
      new Set(subset.filter(row => row.event === 1).map(row => row.time))
    ).sort((left, right) => left - right);

    eventTimes.forEach(atTime => {
      const risk = subset.filter(row =>
        row.start === undefined ? row.time >= atTime : row.start < atTime && row.time >= atTime
      );
      const deaths = subset.filter(row => row.event === 1 && row.time === atTime);
      if (risk.length === 0 || deaths.length === 0) return;

      const eta = risk.map(row =>
        row.x.reduce((sum, value, column) => sum + value * beta[column], 0)
      );
      let largest = -Infinity;
      eta.forEach(value => {
        largest = Math.max(largest, value);
      });
      const weights = eta.map(value => Math.exp(value - largest));
      const s0 = weights.reduce((sum, value) => sum + value, 0);
      if (!(s0 > 0) || !Number.isFinite(s0)) return;
      const s1 = zeros(k);
      const s2 = zeroMatrix(k);
      risk.forEach((row, index) => {
        const weight = weights[index];
        for (let a = 0; a < k; a++) {
          s1[a] += weight * row.x[a];
          for (let b = 0; b < k; b++) s2[a][b] += weight * row.x[a] * row.x[b];
        }
      });
      const mean = s1.map(value => value / s0);
      deaths.forEach(row => {
        for (let column = 0; column < k; column++) {
          logLik += row.x[column] * beta[column];
          score[column] += row.x[column];
        }
        const contribution = contributions.get(row.cluster) ?? zeros(k);
        for (let column = 0; column < k; column++) contribution[column] += row.x[column] - mean[column];
        contributions.set(row.cluster, contribution);
      });
      // Subject-level score residuals: every at-risk subject contributes the
      // expected part of the martingale integral, not only the cluster that
      // owns the event. Without this term the sandwich variance is far too
      // large because each cluster's risk-set exposure is omitted.
      const expectedScale = deaths.length / s0;
      risk.forEach((row, index) => {
        const factor = Math.exp(eta[index] - largest) * expectedScale;
        const contribution = contributions.get(row.cluster) ?? zeros(k);
        for (let column = 0; column < k; column++) {
          contribution[column] -= factor * (row.x[column] - mean[column]);
        }
        contributions.set(row.cluster, contribution);
      });
      logLik -= deaths.length * (largest + Math.log(s0));
      for (let a = 0; a < k; a++) {
        score[a] -= deaths.length * mean[a];
        for (let b = 0; b < k; b++) {
          information[a][b] += deaths.length * (s2[a][b] / s0 - mean[a] * mean[b]);
        }
      }
    });
  });

  return { logLik, score, information, contributions };
};

/** Andersen–Gill or Wei–Lin–Weissfeld recurrent-event model. */
export const fitRecurrent = (options: RecurrentOptions): RecurrentFit | null => {
  const level = options.level ?? 95;
  const k = options.covariates.length;
  const total = options.stop.length;
  if (total < k + 3) return null;

  const clusterMap = new Map<number, number>();
  let nextCluster = 0;
  const rows: Row[] = [];
  for (let index = 0; index < total; index++) {
    const stop = options.stop[index];
    const start = options.start[index];
    const event = options.event[index] === 1 ? 1 : 0;
    const values = options.covariates.map(covariate => covariate.values[index]);
    if (
      !Number.isFinite(stop) ||
      !Number.isFinite(start) ||
      stop <= start ||
      values.some(value => !Number.isFinite(value))
    ) {
      continue;
    }
    const id = options.id[index];
    if (!clusterMap.has(id)) clusterMap.set(id, nextCluster++);
    rows.push({
      cluster: clusterMap.get(id)!,
      stratum: 0,
      time: stop,
      event,
      x: values,
      ...(options.model === 'ag' ? { start } : {}),
    });
  }
  if (rows.length < k + 3) return null;

  let analyzed = rows;
  if (options.model === 'wlw') {
    // One stratum per event number; the time is the gap since the previous event.
    const byCluster = new Map<number, Row[]>();
    rows.forEach(row => {
      const list = byCluster.get(row.cluster) ?? [];
      list.push(row);
      byCluster.set(row.cluster, list);
    });
    const expanded: Row[] = [];
    byCluster.forEach(list => {
      const ordered = list.slice().sort((left, right) => left.time - right.time);
      let eventNumber = 1;
      let previousStop = 0;
      ordered.forEach(row => {
        const gap = row.time - previousStop;
        if (gap > 0) {
          expanded.push({ ...row, stratum: eventNumber, time: gap, start: undefined });
        }
        previousStop = row.time;
        if (row.event === 1) eventNumber += 1;
      });
    });
    analyzed = expanded;
  }

  const subjects = new Set(analyzed.map(row => row.cluster)).size;
  const events = analyzed.filter(row => row.event === 1).length;
  if (events < k + 2) return null;
  const strata = Array.from(new Set(analyzed.map(row => row.stratum))).sort((a, b) => a - b);

  let beta = zeros(k);
  let current = evaluate(analyzed, strata, beta);
  let converged = false;
  let iterations = 0;

  for (let iteration = 1; iteration <= 60; iteration++) {
    iterations = iteration;
    const delta = solve(current.information, current.score);
    if (!delta) break;
    let step = 1;
    let accepted = false;
    while (step > 1e-7) {
      const candidate = beta.map((value, index) => value + step * delta[index]);
      const next = evaluate(analyzed, strata, candidate);
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

  const naive = invert(current.information);
  if (!naive) return null;

  // Cluster-robust sandwich: I^-1 (sum U_g U_g') I^-1.
  const meat = zeroMatrix(k);
  current.contributions.forEach(contribution => {
    for (let a = 0; a < k; a++) {
      for (let b = 0; b < k; b++) meat[a][b] += contribution[a] * contribution[b];
    }
  });
  const clusters = current.contributions.size;
  const correction = clusters > 1 ? clusters / (clusters - 1) : 1;
  const sandwich = zeroMatrix(k);
  for (let a = 0; a < k; a++) {
    for (let b = 0; b < k; b++) {
      let value = 0;
      for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) {
          value += naive[a][i] * meat[i][j] * naive[j][b];
        }
      }
      sandwich[a][b] = value * correction;
    }
  }

  const critical = zCrit(level);
  const coefficients: RecurrentCoefficient[] = options.covariates.map((covariate, column) => {
    const value = beta[column];
    const variance = sandwich[column][column];
    const se = variance > 0 ? Math.sqrt(variance) : NaN;
    const zValue = se > 0 ? value / se : NaN;
    return {
      term: covariate.name,
      beta: value,
      se,
      z: zValue,
      p: Number.isFinite(zValue) ? zTwoSidedP(zValue) : NaN,
      hr: Math.exp(value),
      lo: Math.exp(value - critical * se),
      hi: Math.exp(value + critical * se),
    };
  });

  const nullFit = evaluate(analyzed, strata, zeros(k));
  const lr = Math.max(0, 2 * (current.logLik - nullFit.logLik));
  const wald = Math.max(
    0,
    beta.reduce((sum, value, row) => {
      let inner = 0;
      for (let column = 0; column < k; column++) inner += current.information[row][column] * beta[column];
      return sum + value * inner;
    }, 0)
  );

  return {
    n: analyzed.length,
    subjects,
    episodes: analyzed.length,
    events,
    k,
    model: options.model,
    coefficients,
    logLik: current.logLik,
    aic: -2 * current.logLik + 2 * k,
    lr,
    lrP: chi2SF(lr, k),
    wald,
    waldP: chi2SF(wald, k),
    iterations,
    converged,
    warnings: converged
      ? []
      : ['L’algoritmo non ha raggiunto la convergenza: le stime sono instabili.'],
  };
};
