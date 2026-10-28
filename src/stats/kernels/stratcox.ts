import { chi2SF, zCrit, zTwoSidedP } from '../distributions';
import { concordanceIndex } from './cox';
import type { CoxCoefficient } from '../cox/types';
import type { StratifiedCoxOptions } from '../stratcox/types';

type Matrix = number[][];

interface Stratum {
  times: number[];
  events: number[];
  x: number[][];
  n: number;
  eventTimes: number[];
  eventsAt: number[];
  eventIndices: number[][];
}

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

const evaluate = (strata: Stratum[], beta: number[]) => {
  const k = beta.length;
  let logLik = 0;
  const score = zeros(k);
  const information = zeroMatrix(k);

  strata.forEach(stratum => {
    stratum.eventTimes.forEach((atTime, position) => {
      const rows: number[][] = [];
      const eta: number[] = [];
      for (let subject = 0; subject < stratum.n; subject++) {
        if (stratum.times[subject] < atTime) continue;
        const row = stratum.x[subject];
        rows.push(row);
        eta.push(row.reduce((sum, value, j) => sum + value * beta[j], 0));
      }
      if (rows.length === 0) return;
      const largest = Math.max(...eta);
      const weights = eta.map(value => Math.exp(value - largest));
      const s0 = weights.reduce((sum, value) => sum + value, 0);
      if (!(s0 > 0) || !Number.isFinite(s0)) return;
      const s1 = zeros(k);
      const s2 = zeroMatrix(k);
      rows.forEach((row, index) => {
        const weight = weights[index];
        for (let a = 0; a < k; a++) {
          s1[a] += weight * row[a];
          for (let b = 0; b < k; b++) s2[a][b] += weight * row[a] * row[b];
        }
      });
      const mean = s1.map(value => value / s0);
      const deaths = stratum.eventsAt[position];
      stratum.eventIndices[position].forEach(subject => {
        const row = stratum.x[subject];
        for (let j = 0; j < k; j++) {
          logLik += row[j] * beta[j];
          score[j] += row[j];
        }
      });
      logLik -= deaths * (largest + Math.log(s0));
      for (let a = 0; a < k; a++) {
        score[a] -= deaths * mean[a];
        for (let b = 0; b < k; b++) {
          information[a][b] += deaths * (s2[a][b] / s0 - mean[a] * mean[b]);
        }
      }
    });
  });

  return { logLik, score, information };
};

const prepare = (options: StratifiedCoxOptions): Stratum[] => {
  const labels = Array.from(new Set(options.strata));
  const strata: Stratum[] = [];
  labels.forEach(label => {
    const times: number[] = [];
    const events: number[] = [];
    const x: number[][] = [];
    options.strata.forEach((value, index) => {
      if (value !== label) return;
      const time = options.time[index];
      const values = options.covariates.map(covariate => covariate.values[index]);
      if (!Number.isFinite(time) || time < 0 || values.some(cell => !Number.isFinite(cell))) return;
      times.push(time);
      events.push(options.event[index] === 1 ? 1 : 0);
      x.push(values);
    });
    if (times.length === 0) return;
    const order = Array.from({ length: times.length }, (_, index) => index).sort((a, b) => times[a] - times[b]);
    const sortedTimes = order.map(index => times[index]);
    const sortedEvents = order.map(index => events[index]);
    const sortedX = order.map(index => x[index]);
    const eventTimes = Array.from(new Set(sortedTimes.filter((_, index) => sortedEvents[index] === 1))).sort((a, b) => a - b);
    if (eventTimes.length === 0) return;
    strata.push({
      times: sortedTimes,
      events: sortedEvents,
      x: sortedX,
      n: sortedTimes.length,
      eventTimes,
      eventsAt: eventTimes.map(atTime =>
        sortedTimes.reduce((count, time, index) => count + (time === atTime && sortedEvents[index] === 1 ? 1 : 0), 0)
      ),
      eventIndices: eventTimes.map(atTime =>
        sortedTimes
          .map((time, index) => (time === atTime && sortedEvents[index] === 1 ? index : -1))
          .filter(index => index >= 0)
      ),
    });
  });
  return strata;
};

/** Cox stratificato: coefficienti condivisi, baseline separata per strato. */
export const stratifiedCoxStats = (options: StratifiedCoxOptions): {
  n: number;
  events: number;
  strata: number;
  coefficients: CoxCoefficient[];
  logLik: number;
  logLikNull: number;
  lr: number;
  lrP: number;
  wald: number;
  waldP: number;
  score: number;
  scoreP: number;
  df: number;
  concordance: number;
  iterations: number;
  converged: boolean;
  warnings: string[];
} | null => {
  const k = options.covariates.length;
  if (k === 0) return null;
  const strata = prepare(options);
  if (strata.length < 2) return null;
  const total = strata.reduce((sum, stratum) => sum + stratum.n, 0);
  const events = strata.reduce(
    (sum, stratum) => sum + stratum.events.filter(value => value === 1).length,
    0
  );
  if (total < k + 2 || events < k + 2) return null;

  let beta = zeros(k);
  let current = evaluate(strata, beta);
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
      const next = evaluate(strata, candidate);
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

  const nullFit = evaluate(strata, zeros(k));
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

  const allTimes = strata.flatMap(stratum => stratum.times);
  const allEvents = strata.flatMap(stratum => stratum.events);
  const allX = strata.flatMap(stratum => stratum.x);
  const riskScores = allX.map(row => row.reduce((sum, value, column) => sum + value * beta[column], 0));
  const concordance = concordanceIndex(allTimes, allEvents, riskScores);

  return {
    n: total,
    events,
    strata: strata.length,
    coefficients,
    logLik: current.logLik,
    logLikNull: nullFit.logLik,
    lr,
    lrP,
    wald,
    waldP,
    score,
    scoreP,
    df: k,
    concordance,
    iterations,
    converged,
    warnings: converged ? [] : ['L’algoritmo non ha raggiunto la convergenza.'],
  };
};
