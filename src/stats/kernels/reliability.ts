import type {
  ReliabilityBlockDiagram,
  ReliabilityGrowth,
  ReliabilityResult,
  ReliabilityStage,
} from '../reliability/types';

interface GrowthRow {
  time: number;
  cumulative: number;
}

const logLikelihood = (rows: GrowthRow[], beta: number): number => {
  const total = rows[rows.length - 1]?.cumulative ?? 0;
  const lastTime = rows[rows.length - 1]?.time ?? 1;
  if (!(total > 0) || !(lastTime > 0) || !(beta > 0)) return -Infinity;
  let value = 0;
  let previousTime = 0;
  let previousCumulative = 0;
  rows.forEach(row => {
    const count = row.cumulative - previousCumulative;
    if (count > 0) {
      const increment = Math.pow(row.time, beta) - Math.pow(previousTime, beta);
      if (!(increment > 0)) return;
      value += count * Math.log(total / Math.pow(lastTime, beta) * increment);
    }
    previousTime = row.time;
    previousCumulative = row.cumulative;
  });
  return value - total;
};

/** Crow–AMSAA / Duane power-law growth from cumulative failures over time. */
export const fitReliabilityGrowth = (
  time: readonly number[],
  failures: readonly number[]
): ReliabilityGrowth | null => {
  const rows: GrowthRow[] = [];
  time.forEach((value, index) => {
    const cumulative = failures[index];
    if (!Number.isFinite(value) || value <= 0) return;
    if (!Number.isFinite(cumulative) || cumulative < 0) return;
    rows.push({ time: value, cumulative });
  });
  rows.sort((left, right) => left.time - right.time);
  // Keep a strictly increasing cumulative count.
  const cleaned: GrowthRow[] = [];
  rows.forEach(row => {
    const previous = cleaned[cleaned.length - 1];
    if (!previous || row.cumulative > previous.cumulative) cleaned.push(row);
  });
  if (cleaned.length < 2) return null;
  const n = cleaned[cleaned.length - 1].cumulative;
  const lastTime = cleaned[cleaned.length - 1].time;
  if (!(n > 0) || !(lastTime > 0)) return null;

  // Golden-section search for beta on a log scale.
  let low = 1e-3;
  let high = 5;
  const ratio = (Math.sqrt(5) - 1) / 2;
  let left = low + (1 - ratio) * (high - low);
  let right = low + ratio * (high - low);
  let leftValue = logLikelihood(cleaned, left);
  let rightValue = logLikelihood(cleaned, right);
  for (let iteration = 0; iteration < 120; iteration++) {
    if (leftValue < rightValue) {
      low = left;
      left = right;
      leftValue = rightValue;
      right = low + ratio * (high - low);
      rightValue = logLikelihood(cleaned, right);
    } else {
      high = right;
      right = left;
      rightValue = leftValue;
      left = low + (1 - ratio) * (high - low);
      leftValue = logLikelihood(cleaned, left);
    }
  }
  const beta = (low + high) / 2;
  const lambda = n / Math.pow(lastTime, beta);
  const logLik = logLikelihood(cleaned, beta);
  const mtbfCumulative = lastTime / n;
  const mtbfInstantaneous = 1 / Math.max(1e-12, lambda * beta * Math.pow(lastTime, beta - 1));
  const points = cleaned.map(row => ({
    time: row.time,
    observed: row.cumulative,
    fitted: lambda * Math.pow(row.time, beta),
  }));

  return {
    beta,
    lambda,
    n,
    lastTime,
    mtbfCumulative,
    mtbfInstantaneous,
    growthRate: 1 - beta,
    logLik,
    aic: -2 * logLik + 4,
    points,
  };
};

/** Series of parallel stages: R_stage = 1 - Π(1 - r_i); R_system = Π R_stage. */
export const reliabilityBlockDiagram = (stages: readonly (readonly number[])[]): ReliabilityBlockDiagram | null => {
  if (stages.length === 0) return null;
  const parsed: ReliabilityStage[] = [];
  for (let index = 0; index < stages.length; index++) {
    const reliabilities = stages[index]
      .filter(value => Number.isFinite(value))
      .map(value => Math.min(1, Math.max(0, value)));
    if (reliabilities.length === 0) return null;
    const unreliability = reliabilities.reduce((product, value) => product * (1 - value), 1);
    parsed.push({
      index: index + 1,
      reliabilities,
      reliability: 1 - unreliability,
      unreliability,
    });
  }
  const system = parsed.reduce((product, stage) => product * stage.reliability, 1);
  return { stages: parsed, system, systemUnreliability: 1 - system };
};

/** Build the result object consumed by tables and the report. */
export const reliabilityAnalysis = (
  mode: 'growth' | 'rbd',
  options: { time?: number[]; failures?: number[]; stages?: number[][] }
): ReliabilityResult | null => {
  if (mode === 'growth') {
    const growth = fitReliabilityGrowth(options.time ?? [], options.failures ?? []);
    if (!growth) return null;
    return {
      mode,
      growth,
      warnings:
        growth.beta >= 1
          ? ['β ≥ 1: il tasso di guasto non diminuisce; non c’è evidenza di crescita dell’affidabilità.']
          : [],
    };
  }
  const rbd = reliabilityBlockDiagram(options.stages ?? []);
  if (!rbd) return null;
  return { mode, rbd, warnings: [] };
};
