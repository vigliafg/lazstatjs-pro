import { jStat } from '../jstat';
import { parseNum } from '../core';
import { mulberry32 } from './distributions';
import type { ResamplingOptions, ResamplingStats } from '../resampling/types';

const statisticOf = (values: number[], kind: 'mean' | 'median'): number =>
  kind === 'mean' ? jStat.mean(values) : jStat.median(values);

const percentile = (sorted: number[], p: number): number => {
  if (sorted.length === 0) return NaN;
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
};

/** Permutazione a due gruppi e bootstrap percentile per una differenza. */
export const resamplingStats = (options: ResamplingOptions): ResamplingStats | null => {
  const { rows, outcomeIdx, groupIdx, statistic, level } = options;
  const entries = rows
    .map(row => ({
      value: parseNum(row[outcomeIdx]),
      group: String(row[groupIdx] ?? '').trim(),
    }))
    .filter(entry => Number.isFinite(entry.value) && entry.group !== '');
  const groups = Array.from(new Set(entries.map(entry => entry.group))).sort();
  if (groups.length !== 2) return null;

  const a = entries.filter(entry => entry.group === groups[0]).map(entry => entry.value);
  const b = entries.filter(entry => entry.group === groups[1]).map(entry => entry.value);
  if (a.length < 2 || b.length < 2) return null;

  const stat1 = statisticOf(a, statistic);
  const stat2 = statisticOf(b, statistic);
  const difference = stat2 - stat1;
  const permutations = Math.max(99, Math.min(50000, Math.round(options.permutations)));
  const bootstrap = Math.max(99, Math.min(50000, Math.round(options.bootstrap)));
  const rng = mulberry32(20261028);

  const pooled = [...a, ...b];
  const permutationStatistics: number[] = [];
  let extreme = 0;
  for (let iteration = 0; iteration < permutations; iteration++) {
    for (let index = pooled.length - 1; index > 0; index--) {
      const swap = Math.floor(rng() * (index + 1));
      [pooled[index], pooled[swap]] = [pooled[swap], pooled[index]];
    }
    const first = pooled.slice(0, a.length);
    const second = pooled.slice(a.length);
    const permuted = statisticOf(second, statistic) - statisticOf(first, statistic);
    permutationStatistics.push(permuted);
    if (Math.abs(permuted) >= Math.abs(difference) - 1e-12) extreme += 1;
  }
  const pPermutation = (extreme + 1) / (permutations + 1);

  const bootstrapDifferences: number[] = [];
  for (let iteration = 0; iteration < bootstrap; iteration++) {
    const sampleA = Array.from({ length: a.length }, () => a[Math.floor(rng() * a.length)]);
    const sampleB = Array.from({ length: b.length }, () => b[Math.floor(rng() * b.length)]);
    bootstrapDifferences.push(statisticOf(sampleB, statistic) - statisticOf(sampleA, statistic));
  }
  bootstrapDifferences.sort((left, right) => left - right);
  const alpha = (1 - level / 100) / 2;
  const ciLo = percentile(bootstrapDifferences, alpha);
  const ciHi = percentile(bootstrapDifferences, 1 - alpha);

  const jackknife: number[] = [];
  a.forEach((_, index) => {
    const reduced = a.filter((__, position) => position !== index);
    jackknife.push(statisticOf(b, statistic) - statisticOf(reduced, statistic));
  });
  b.forEach((_, index) => {
    const reduced = b.filter((__, position) => position !== index);
    jackknife.push(statisticOf(reduced, statistic) - statisticOf(a, statistic));
  });
  const jackknifeMean = jackknife.reduce((sum, value) => sum + value, 0) / Math.max(1, jackknife.length);
  const sumSquares = jackknife.reduce((sum, value) => sum + Math.pow(jackknifeMean - value, 2), 0);
  const sumCubes = jackknife.reduce((sum, value) => sum + Math.pow(jackknifeMean - value, 3), 0);
  const acceleration = sumSquares > 0 ? sumCubes / (6 * Math.pow(sumSquares, 1.5)) : 0;
  const below = bootstrapDifferences.filter(value => value < difference).length;
  const proportion = Math.min(1 - 1 / (2 * bootstrap), Math.max(1 / (2 * bootstrap), below / bootstrap));
  const z0 = jStat.normal.inv(proportion, 0, 1);
  const zLow = jStat.normal.inv(alpha, 0, 1);
  const zHigh = jStat.normal.inv(1 - alpha, 0, 1);
  const adjusted = (z: number): number => {
    const denominator = 1 - acceleration * (z0 + z);
    return denominator === 0
      ? alpha
      : jStat.normal.cdf(z0 + (z0 + z) / denominator, 0, 1);
  };
  const bcaAlphaLow = Number.isFinite(acceleration) ? adjusted(zLow) : alpha;
  const bcaAlphaHigh = Number.isFinite(acceleration) ? adjusted(zHigh) : 1 - alpha;
  const bcaLo = percentile(bootstrapDifferences, Math.min(1, Math.max(0, bcaAlphaLow)));
  const bcaHi = percentile(bootstrapDifferences, Math.min(1, Math.max(0, bcaAlphaHigh)));

  return {
    groups: [groups[0], groups[1]],
    n1: a.length,
    n2: b.length,
    stat1,
    stat2,
    difference,
    pPermutation,
    ciLo,
    ciHi,
    bcaLo,
    bcaHi,
    permutations,
    bootstrap,
    statistic,
    permutationStatistics,
    bootstrapDifferences,
  };
};
