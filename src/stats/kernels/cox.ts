import { chi2SF, zCrit, zTwoSidedP } from '../distributions';
import type {
  CoxBaselineRow,
  CoxCoefficient,
  CoxFit,
  CoxOptions,
  CoxPhRow,
  CoxSchoenfeldRow,
} from '../cox/types';

interface PreparedCox {
  times: number[];
  events: number[];
  x: number[][];
  n: number;
  k: number;
  eventTimes: number[];
  eventsAt: number[];
  eventIndices: number[][];
  riskAt: number[];
}

interface PartialLikelihood {
  logLik: number;
  score: number[];
  information: number[][];
}

type Design = (subject: number, atTime: number) => number[];

const zeros = (size: number): number[] => new Array<number>(size).fill(0);

const zeroMatrix = (size: number): number[][] =>
  Array.from({ length: size }, () => new Array<number>(size).fill(0));

const solveLinearSystem = (matrix: number[][], vector: number[]): number[] | null => {
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

const invertMatrix = (matrix: number[][]): number[][] | null => {
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

const evaluate = (prepared: PreparedCox, beta: number[], design: Design): PartialLikelihood => {
  const k = beta.length;
  let logLik = 0;
  const score = zeros(k);
  const information = zeroMatrix(k);

  prepared.eventTimes.forEach((atTime, position) => {
    const deaths = prepared.eventsAt[position];
    const rows: number[][] = [];
    const eta: number[] = [];
    for (let subject = 0; subject < prepared.n; subject++) {
      if (prepared.times[subject] < atTime) continue;
      const row = design(subject, atTime);
      rows.push(row);
      let value = 0;
      for (let j = 0; j < k; j++) value += row[j] * beta[j];
      eta.push(value);
    }
    if (rows.length === 0) return;

    let largest = -Infinity;
    for (const value of eta) largest = Math.max(largest, value);
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
    prepared.eventIndices[position].forEach(subject => {
      const row = design(subject, atTime);
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

  return { logLik, score, information };
};

interface PartialFit extends PartialLikelihood {
  beta: number[];
  iterations: number;
  converged: boolean;
}

const fitPartial = (
  prepared: PreparedCox,
  design: Design,
  size: number,
  initial?: number[],
  maxIterations = 30
): PartialFit => {
  let beta = initial ? initial.slice() : zeros(size);
  let current = evaluate(prepared, beta, design);
  let converged = false;
  let iterations = 0;

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    iterations = iteration;
    const delta = solveLinearSystem(current.information, current.score);
    if (!delta) break;

    let step = 1;
    let accepted = false;
    while (step > 1e-6) {
      const candidate = beta.map((value, index) => value + step * delta[index]);
      const next = evaluate(prepared, candidate, design);
      if (Number.isFinite(next.logLik) && next.logLik >= current.logLik - 1e-10) {
        beta = candidate;
        current = next;
        accepted = true;
        break;
      }
      step /= 2;
    }
    if (!accepted) break;
    const change = Math.max(...delta.map(value => Math.abs(value * step)));
    if (change < 1e-9) {
      converged = true;
      break;
    }
  }

  return { beta, ...current, iterations, converged };
};

/** Harrell's concordance index for a set of risk scores. */
export const concordanceIndex = (
  times: number[],
  events: number[],
  scores: number[]
): number => {
  let comparable = 0;
  let concordant = 0;
  for (let i = 0; i < times.length; i++) {
    if (events[i] !== 1) continue;
    for (let j = 0; j < times.length; j++) {
      if (i === j) continue;
      const usable =
        times[i] < times[j] || (times[i] === times[j] && events[j] === 0);
      if (!usable) continue;
      comparable += 1;
      if (scores[i] > scores[j]) concordant += 1;
      else if (scores[i] === scores[j]) concordant += 0.5;
    }
  }
  return comparable > 0 ? concordant / comparable : NaN;
};

export const fitCox = (options: CoxOptions): CoxFit | null => {
  const level = options.level ?? 95;
  const k = options.covariates.length;
  if (k === 0) return null;

  const total = options.time.length;
  if (options.event.length !== total) return null;
  if (options.covariates.some(covariate => covariate.values.length !== total)) return null;

  const warnings: string[] = [];
  const times: number[] = [];
  const events: number[] = [];
  const x: number[][] = [];
  for (let index = 0; index < total; index++) {
    const time = options.time[index];
    const values = options.covariates.map(covariate => covariate.values[index]);
    if (!Number.isFinite(time) || time < 0 || values.some(value => !Number.isFinite(value))) continue;
    times.push(time);
    events.push(options.event[index] === 1 ? 1 : 0);
    x.push(values);
  }

  const n = times.length;
  if (n < k + 2) return null;
  const eventCount = events.reduce((sum, value) => sum + value, 0);
  if (eventCount < k + 2) return null;

  const constant = options.covariates.filter((_, column) =>
    x.every(row => row[column] === x[0][column])
  );
  if (constant.length > 0) {
    warnings.push(`Covariate costanti ignorate: ${constant.map(item => item.name).join(', ')}`);
  }

  const order = Array.from({ length: n }, (_, index) => index).sort((left, right) => times[left] - times[right]);
  const sortedTimes = order.map(index => times[index]);
  const sortedEvents = order.map(index => events[index]);
  const sortedX = order.map(index => x[index]);

  const eventTimes = Array.from(
    new Set(sortedTimes.filter((_, index) => sortedEvents[index] === 1))
  ).sort((left, right) => left - right);
  if (eventTimes.length < 2) return null;

  const eventsAt = eventTimes.map(atTime =>
    sortedTimes.reduce((count, time, index) => count + (time === atTime && sortedEvents[index] === 1 ? 1 : 0), 0)
  );
  const eventIndices = eventTimes.map(atTime =>
    sortedTimes
      .map((time, index) => (time === atTime && sortedEvents[index] === 1 ? index : -1))
      .filter(index => index >= 0)
  );
  const riskAt = eventTimes.map(atTime => sortedTimes.filter(time => time >= atTime).length);

  const prepared: PreparedCox = {
    times: sortedTimes,
    events: sortedEvents,
    x: sortedX,
    n,
    k,
    eventTimes,
    eventsAt,
    eventIndices,
    riskAt,
  };

  const baselineDesign: Design = subject => sortedX[subject];
  const base = fitPartial(prepared, baselineDesign, k);

  const information = base.information;
  const inverse = invertMatrix(information);
  if (!inverse) return null;

  const critical = zCrit(level);
  const coefficients: CoxCoefficient[] = options.covariates.map((covariate, column) => {
    const beta = base.beta[column];
    const variance = inverse[column][column];
    const se = variance > 0 ? Math.sqrt(variance) : NaN;
    const zValue = se > 0 ? beta / se : NaN;
    const logHr = beta;
    return {
      term: covariate.name,
      beta,
      se,
      z: zValue,
      p: Number.isFinite(zValue) ? zTwoSidedP(zValue) : NaN,
      hr: Number.isFinite(beta) ? Math.exp(beta) : NaN,
      lo: Number.isFinite(se) ? Math.exp(logHr - critical * se) : NaN,
      hi: Number.isFinite(se) ? Math.exp(logHr + critical * se) : NaN,
    };
  });

  const separation = coefficients.some(
    coefficient =>
      Math.abs(coefficient.beta) > 8 ||
      !Number.isFinite(coefficient.se) ||
      coefficient.se > 8
  );
  if (separation) {
    warnings.push(
      'Stime molto grandi o errori standard enormi: possibile separazione quasi completa, con hazard ratio instabili.'
    );
  }
  if (!base.converged) {
    warnings.push('L’algoritmo non ha raggiunto la convergenza entro il numero massimo di iterazioni.');
  }

  const nullFit = evaluate(prepared, zeros(k), baselineDesign);
  const lr = Math.max(0, 2 * (base.logLik - nullFit.logLik));
  const lrP = chi2SF(lr, k);
  const wald = Math.max(0, base.beta.reduce((sum, value, row) => {
    let inner = 0;
    for (let column = 0; column < k; column++) inner += information[row][column] * base.beta[column];
    return sum + value * inner;
  }, 0));
  const waldP = chi2SF(wald, k);
  const nullScore = evaluate(prepared, zeros(k), baselineDesign).score;
  const nullInverse = invertMatrix(nullFit.information);
  let score = NaN;
  if (nullInverse) {
    score = Math.max(0, nullScore.reduce((sum, value, row) => {
      let inner = 0;
      for (let column = 0; column < k; column++) inner += nullInverse[row][column] * nullScore[column];
      return sum + value * inner;
    }, 0));
  }
  const scoreP = chi2SF(score, k);

  const riskScores = sortedX.map(row =>
    row.reduce((sum, value, column) => sum + value * base.beta[column], 0)
  );
  const concordance = concordanceIndex(sortedTimes, sortedEvents, riskScores);

  // The baseline is evaluated at the mean covariate profile: evaluating it at
  // zero overflows when covariates live far from the origin (age, scores) and
  // would report a flat hazard of zero.
  const means = Array.from({ length: k }, (_, column) =>
    sortedX.reduce((sum, row) => sum + row[column], 0) / prepared.n
  );
  const centeredEta = (subject: number): number => {
    const row = sortedX[subject];
    let value = 0;
    for (let column = 0; column < k; column++) {
      value += (row[column] - means[column]) * base.beta[column];
    }
    return value;
  };

  const baseline: CoxBaselineRow[] = [];
  let cumulative = 0;
  prepared.eventTimes.forEach((atTime, position) => {
    let s0 = 0;
    for (let subject = 0; subject < prepared.n; subject++) {
      if (prepared.times[subject] < atTime) continue;
      s0 += Math.exp(centeredEta(subject));
    }
    if (s0 > 0 && Number.isFinite(s0)) cumulative += prepared.eventsAt[position] / s0;
    baseline.push({
      time: atTime,
      risk: prepared.riskAt[position],
      events: prepared.eventsAt[position],
      hazard: cumulative,
      survival: Math.exp(-cumulative),
    });
  });

  const schoenfeld: CoxSchoenfeldRow[] = [];
  prepared.eventTimes.forEach((atTime, position) => {
    let total = 0;
    const weighted = zeros(k);
    for (let subject = 0; subject < prepared.n; subject++) {
      if (sortedTimes[subject] < atTime) continue;
      const weight = Math.exp(centeredEta(subject));
      if (!Number.isFinite(weight) || weight <= 0) continue;
      total += weight;
      for (let column = 0; column < k; column++) {
        weighted[column] += weight * sortedX[subject][column];
      }
    }
    if (!(total > 0)) return;
    const atRiskMeans = weighted.map(value => value / total);
    prepared.eventIndices[position].forEach(subject => {
      for (let column = 0; column < k; column++) {
        schoenfeld.push({
          term: options.covariates[column].name,
          time: atTime,
          residual: sortedX[subject][column] - atRiskMeans[column],
        });
      }
    });
  });

  const ph: CoxPhRow[] = [];
  let phGlobal = { chi2: NaN, df: k, p: NaN };
  if (eventTimes.every(atTime => atTime > 0) && n > 3 * k + 5) {
    const timeDesign: Design = (subject, atTime) => {
      const row = sortedX[subject];
      const logTime = Math.log(atTime);
      return [...row, ...row.map(value => value * logTime)];
    };
    const extended = fitPartial(
      prepared,
      timeDesign,
      2 * k,
      [...base.beta, ...zeros(k)],
      40
    );
    const extendedInverse = invertMatrix(extended.information);
    if (extendedInverse) {
      for (let column = 0; column < k; column++) {
        const beta = extended.beta[k + column];
        const variance = extendedInverse[k + column][k + column];
        const se = variance > 0 ? Math.sqrt(variance) : NaN;
        const zValue = se > 0 ? beta / se : NaN;
        ph.push({
          term: options.covariates[column].name,
          chi2: Number.isFinite(zValue) ? zValue * zValue : NaN,
          df: 1,
          p: Number.isFinite(zValue) ? zTwoSidedP(zValue) : NaN,
        });
      }
      const statistic = Math.max(0, 2 * (extended.logLik - base.logLik));
      phGlobal = { chi2: statistic, df: k, p: chi2SF(statistic, k) };
    }
  }

  return {
    n,
    events: eventCount,
    censored: n - eventCount,
    k,
    coefficients,
    logLik: base.logLik,
    logLikNull: nullFit.logLik,
    aic: -2 * base.logLik + 2 * k,
    lr,
    lrP,
    wald,
    waldP,
    score,
    scoreP,
    df: k,
    concordance,
    iterations: base.iterations,
    converged: base.converged,
    separation,
    baseline,
    schoenfeld,
    ph,
    phGlobal,
    warnings,
  };
};

// ---------------------------------------------------------------------------
// Tables and report
// ---------------------------------------------------------------------------

