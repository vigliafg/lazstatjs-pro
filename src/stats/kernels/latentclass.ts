/**
 * Latent class analysis for categorical indicators.
 *
 * The kernel runs the standard finite-mixture EM: the E-step computes the
 * posterior probability of each class for every row, the M-step updates class
 * proportions and conditional response probabilities. Several deterministic
 * starts are tried and the best log-likelihood is kept, which avoids the
 * order-dependence of a single random start while remaining reproducible.
 */

import { mulberry32 } from '../distributions';
import { classificationEntropy, informationCriteria, normalizeRows } from './latent';
import type { LatentClassResult } from '../latentclass/types';

export interface LatentClassInput {
  data: number[][];
  levels: string[][];
  variableNames: string[];
  classes: number;
  maxIterations?: number;
  tolerance?: number;
  starts?: number;
}

interface State {
  proportions: number[];
  probabilities: number[][][];
  posterior: number[][];
  logLik: number;
  iterations: number;
  converged: boolean;
}

const logSumExp = (values: number[]): number => {
  const max = Math.max(...values);
  if (!Number.isFinite(max)) return -Infinity;
  return max + Math.log(values.reduce((sum, value) => sum + Math.exp(value - max), 0));
};

const eStep = (
  data: number[][],
  proportions: number[],
  probabilities: number[][][],
  classes: number
): { posterior: number[][]; logLik: number } => {
  let logLik = 0;
  const posterior = data.map(row => {
    const logs = Array.from({ length: classes }, (_, cluster) => {
      let value = Math.log(Math.max(1e-300, proportions[cluster]));
      row.forEach((level, item) => {
        value += Math.log(Math.max(1e-12, probabilities[cluster][item]?.[level] ?? 1e-12));
      });
      return value;
    });
    const normaliser = logSumExp(logs);
    logLik += normaliser;
    return logs.map(value => Math.exp(value - normaliser));
  });
  return { posterior, logLik };
};

const mStep = (
  data: number[][],
  posterior: number[][],
  classes: number,
  levelCounts: number[]
): { proportions: number[]; probabilities: number[][][] } => {
  const totals = new Array<number>(classes).fill(0);
  posterior.forEach(row => row.forEach((value, cluster) => (totals[cluster] += value)));
  const proportions = totals.map(value => Math.max(1e-12, value / Math.max(1, data.length)));
  const probabilities = Array.from({ length: classes }, (_, cluster) =>
    levelCounts.map((levels, item) => {
      const counts = new Array<number>(levels).fill(0);
      data.forEach((row, index) => {
        const level = row[item];
        if (level >= 0 && level < levels) counts[level] += posterior[index][cluster];
      });
      const total = counts.reduce((sum, value) => sum + value, 0);
      return counts.map(value => Math.max(1e-9, value / Math.max(1e-12, total)));
    })
  );
  return { proportions, probabilities };
};

const initialPosterior = (
  data: number[][],
  classes: number,
  levelCounts: number[],
  start: number
): number[][] => {
  const rng = mulberry32(7919 + start * 104729);
  if (start >= 6) {
    // Random hard assignments for the later starts: they escape the local
    // optima that a single deterministic seeding can fall into.
    return data.map(() => {
      const selected = Math.min(classes - 1, Math.floor(rng() * classes));
      return Array.from({ length: classes }, (_, cluster) =>
        cluster === selected ? 0.8 : 0.2 / Math.max(1, classes - 1)
      );
    });
  }
  // Hard assignment from a deterministic farthest-first seed on the dummy
  // indicator vector, then a little jitter to break symmetric ties.
  const dummies = data.map(row => {
    const vector: number[] = [];
    row.forEach((level, item) => {
      for (let value = 0; value < levelCounts[item]; value += 1) {
        vector.push(value === level ? 1 : 0);
      }
    });
    return vector;
  });
  const width = dummies[0]?.length ?? 0;
  const centres = [dummies[start % Math.max(1, data.length)] ?? new Array<number>(width).fill(0)];
  while (centres.length < classes) {
    let best = 0;
    let bestDistance = -1;
    dummies.forEach((row, index) => {
      const nearest = Math.min(
        ...centres.map(centre =>
          centre.reduce((sum, value, column) => sum + Math.pow(value - row[column], 2), 0)
        )
      );
      if (nearest > bestDistance) {
        bestDistance = nearest;
        best = index;
      }
    });
    centres.push(dummies[best] ?? new Array<number>(width).fill(0));
  }
  return data.map((_, rowIndex) => {
    const vector = dummies[rowIndex];
    const distances = centres.map(centre =>
      centre.reduce((sum, value, column) => sum + Math.pow(value - (vector[column] ?? 0), 2), 0)
    );
    const nearest = distances.indexOf(Math.min(...distances));
    const row_ = Array.from({ length: classes }, (_, cluster) =>
      cluster === nearest ? 0.9 : 0.1 / Math.max(1, classes - 1)
    );
    const jitter = row_.map(value => value + (rng() - 0.5) * 0.02);
    return normalizeRows([jitter], Array.from({ length: classes }, () => 1 / classes))[0];
  });
};

const fitStart = (
  data: number[][],
  levelCounts: number[],
  classes: number,
  start: number,
  maxIterations: number,
  tolerance: number
): State => {
  let posterior = initialPosterior(data, classes, levelCounts, start);
  let proportions = Array.from({ length: classes }, () => 1 / classes);
  let probabilities = Array.from({ length: classes }, () =>
    levelCounts.map(levels => new Array<number>(levels).fill(1 / levels))
  );
  let logLik = -Infinity;
  let converged = false;
  let iteration = 0;
  for (; iteration < maxIterations; iteration += 1) {
    const m = mStep(data, posterior, classes, levelCounts);
    proportions = m.proportions;
    probabilities = m.probabilities;
    const e = eStep(data, proportions, probabilities, classes);
    posterior = e.posterior;
    if (Number.isFinite(logLik) && Math.abs(e.logLik - logLik) < tolerance) {
      logLik = e.logLik;
      converged = true;
      iteration += 1;
      break;
    }
    logLik = e.logLik;
  }
  return { proportions, probabilities, posterior, logLik, iterations: iteration, converged };
};

/** Order classes by size so labels and reference fixtures line up. */
const reorder = (state: State, levelCounts: number[]): State => {
  const order = state.proportions
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value || a.index - b.index)
    .map(item => item.index);
  return {
    proportions: order.map(index => state.proportions[index]),
    probabilities: order.map(index => state.probabilities[index]),
    posterior: state.posterior.map(row => order.map(index => row[index])),
    logLik: state.logLik,
    iterations: state.iterations,
    converged: state.converged,
  };
};

export const latentClassAnalysis = (input: LatentClassInput): LatentClassResult | null => {
  const n = input.data.length;
  const items = input.variableNames.length;
  const classes = Math.max(1, Math.min(10, Math.round(input.classes)));
  if (n < 3 || items < 2) return null;
  if (input.data.some(row => row.length !== items)) return null;
  if (input.data.some(row => row.some((level, item) => level < 0 || level >= (input.levels[item]?.length ?? 0)))) {
    return null;
  }
  if (classes < 2) return null;
  const levelCounts = input.levels.map(levels => levels.length);
  const starts = Math.max(1, Math.min(100, input.starts ?? 10));
  const maxIterations = Math.max(20, Math.min(2000, input.maxIterations ?? 500));
  const tolerance = input.tolerance ?? 1e-7;

  let best: State | null = null;
  for (let start = 0; start < starts; start += 1) {
    const state = fitStart(input.data, levelCounts, classes, start, maxIterations, tolerance);
    if (Number.isFinite(state.logLik) && (!best || state.logLik > best.logLik)) best = state;
  }
  if (!best) return null;
  const ordered = reorder(best, levelCounts);
  const parameters = classes - 1 + classes * levelCounts.reduce((sum, value) => sum + value - 1, 0);
  const criteria = informationCriteria(ordered.logLik, parameters, n);
  const predicted = ordered.posterior.map(row => {
    const maximum = Math.max(...row);
    return row.indexOf(maximum);
  });
  const counts = Array.from({ length: classes }, (_, cluster) =>
    predicted.filter(value => value === cluster).length
  );

  return {
    classes,
    n,
    items: input.variableNames.map((variable, item) => ({
      variable,
      levels: input.levels[item] ?? [],
      probabilities: ordered.probabilities.map(cluster => cluster[item] ?? []),
    })),
    proportions: ordered.proportions,
    posterior: ordered.posterior,
    predicted,
    logLik: ordered.logLik,
    parameters,
    aic: criteria.aic,
    bic: criteria.bic,
    entropy: classificationEntropy(ordered.posterior),
    iterations: ordered.iterations,
    converged: ordered.converged,
    counts,
  };
};
