import { chi2SF, zCrit, zTwoSidedP } from '../distributions';
import type {
  CompetingCoefficient,
  CompetingFit,
  CompetingOptions,
} from '../competing/types';

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

/**
 * Kaplan–Meier of the censoring distribution. Only actual censoring counts as
 * censored: both the event of interest and competing events reduce G, as in
 * `cmprsk::crr`.
 */
const censoringSurvival = (
  times: number[],
  event: number[],
  _cause: number
): (time: number) => number => {
  const ordered = times
    .map((time, index) => ({ time, censored: event[index] === 0 ? 1 : 0 }))
    .sort((left, right) => left.time - right.time);
  const censorTimes = Array.from(
    new Set(ordered.filter(item => item.censored === 1).map(item => item.time))
  ).sort((left, right) => left - right);
  const steps: { time: number; survival: number }[] = [];
  let survival = 1;
  censorTimes.forEach(atTime => {
    const atRisk = ordered.filter(item => item.time >= atTime).length;
    const censored = ordered.filter(item => item.time === atTime && item.censored === 1).length;
    if (atRisk > 0) survival *= 1 - censored / atRisk;
    steps.push({ time: atTime, survival });
  });
  return (time: number): number => {
    let value = 1;
    steps.forEach(step => {
      if (step.time <= time) value = step.survival;
    });
    return Math.max(1e-12, value);
  };
};

interface FineGrayData {
  times: number[];
  event: number[];
  x: number[][];
  n: number;
  k: number;
  eventTimes: number[];
  eventIndices: number[][];
}

const evaluate = (
  data: FineGrayData,
  beta: number[],
  cause: number,
  censoring: (time: number) => number
): { logLik: number; score: number[]; information: number[][] } => {
  const k = beta.length;
  let logLik = 0;
  const score = zeros(k);
  const information = zeroMatrix(k);

  data.eventTimes.forEach((atTime, position) => {
    const weights: number[] = [];
    const rows: number[][] = [];
    const eta: number[] = [];
    data.times.forEach((time, subject) => {
      if (time >= atTime) {
        weights.push(1);
      } else if (data.event[subject] !== 0 && data.event[subject] !== cause) {
        weights.push(censoring(atTime) / censoring(time));
      } else {
        return;
      }
      rows.push(data.x[subject]);
      let value = 0;
      for (let j = 0; j < k; j++) value += data.x[subject][j] * beta[j];
      eta.push(value);
    });
    if (rows.length === 0) return;

    let largest = -Infinity;
    for (const value of eta) largest = Math.max(largest, value);
    const scaled = eta.map((value, index) => weights[index] * Math.exp(value - largest));
    const s0 = scaled.reduce((sum, value) => sum + value, 0);
    if (!(s0 > 0) || !Number.isFinite(s0)) return;
    const s1 = zeros(k);
    const s2 = zeroMatrix(k);
    rows.forEach((row, index) => {
      const weight = scaled[index];
      for (let a = 0; a < k; a++) {
        s1[a] += weight * row[a];
        for (let b = 0; b < k; b++) s2[a][b] += weight * row[a] * row[b];
      }
    });

    const deaths = data.eventIndices[position].length;
    const mean = s1.map(value => value / s0);
    data.eventIndices[position].forEach(subject => {
      for (let j = 0; j < k; j++) {
        logLik += data.x[subject][j] * beta[j];
        score[j] += data.x[subject][j];
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

  return { logLik, score, information };
};

/** Fine–Gray subdistribution hazard model for competing risks. */
export const fitCompetingRisks = (options: CompetingOptions): CompetingFit | null => {
  const level = options.level ?? 95;
  const cause = Math.max(1, Math.trunc(options.cause));
  const k = options.covariates.length;
  const total = options.time.length;
  if (total < k + 3) return null;

  const times: number[] = [];
  const event: number[] = [];
  const x: number[][] = [];
  for (let index = 0; index < total; index++) {
    const time = options.time[index];
    const code = Math.trunc(options.event[index]);
    const values = options.covariates.map(covariate => covariate.values[index]);
    if (!Number.isFinite(time) || time < 0 || values.some(value => !Number.isFinite(value))) continue;
    times.push(time);
    event.push(Number.isFinite(code) && code > 0 ? code : 0);
    x.push(values);
  }
  const n = times.length;
  if (n < k + 3) return null;

  const causes = Array.from(new Set(event.filter(code => code > 0))).sort((a, b) => a - b);
  const ofInterest = causes.includes(cause) ? cause : causes[0];
  if (!ofInterest) return null;

  const eventTimes = Array.from(
    new Set(times.filter((_, index) => event[index] === ofInterest))
  ).sort((left, right) => left - right);
  if (eventTimes.length < 2) return null;
  const eventIndices = eventTimes.map(atTime =>
    times
      .map((time, index) => (time === atTime && event[index] === ofInterest ? index : -1))
      .filter(index => index >= 0)
  );
  const data: FineGrayData = { times, event, x, n, k, eventTimes, eventIndices };

  const censoring = censoringSurvival(times, event, ofInterest);
  let beta = zeros(k);
  let current = evaluate(data, beta, ofInterest, censoring);
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
      const next = evaluate(data, candidate, ofInterest, censoring);
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

  const covariance = invert(current.information);
  if (!covariance) return null;
  const critical = zCrit(level);
  const coefficients: CompetingCoefficient[] = options.covariates.map((covariate, column) => {
    const value = beta[column];
    const variance = covariance[column][column];
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

  const means = x[0].map((_, column) =>
    x.reduce((sum, row) => sum + row[column], 0) / Math.max(1, x.length)
  );
  const meanEta = means.reduce((sum, value, column) => sum + value * beta[column], 0);
  const cif: { time: number; cif: number }[] = [];
  let cumulative = 0;
  eventTimes.forEach((atTime, position) => {
    const eta: number[] = [];
    const weights: number[] = [];
    times.forEach((time, subject) => {
      if (time >= atTime) weights.push(1);
      else if (event[subject] !== 0 && event[subject] !== ofInterest) {
        weights.push(censoring(atTime) / censoring(time));
      } else return;
      eta.push(x[subject].reduce((sum, value, column) => sum + value * beta[column], 0));
    });
    let s0 = 0;
    eta.forEach((value, index) => {
      s0 += weights[index] * Math.exp(value);
    });
    if (s0 > 0) cumulative += eventIndices[position].length / s0;
    cif.push({
      time: atTime,
      cif: Math.min(1, 1 - Math.exp(-cumulative * Math.exp(meanEta))),
    });
  });

  const nullFit = evaluate(data, zeros(k), ofInterest, censoring);
  const lr = Math.max(0, 2 * (current.logLik - nullFit.logLik));

  return {
    n,
    events: event.filter(code => code === ofInterest).length,
    censored: event.filter(code => code === 0).length,
    competing: event.filter(code => code > 0 && code !== ofInterest).length,
    causes: causes.length,
    cause: ofInterest,
    k,
    coefficients,
    logLik: current.logLik,
    aic: -2 * current.logLik + 2 * k,
    lr,
    lrP: chi2SF(lr, k),
    iterations,
    converged,
    cif,
    cifFinal: cif[cif.length - 1]?.cif ?? NaN,
    warnings: converged
      ? []
      : ['L’algoritmo non ha raggiunto la convergenza: le stime di Fine–Gray sono instabili.'],
  };
};
