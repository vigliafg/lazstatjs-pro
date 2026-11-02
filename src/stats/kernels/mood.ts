/**
 * Mood / Brown–Mood median test for k independent groups.
 *
 * Every observation is classified above or below the grand median and a
 * chi-square statistic is computed on the resulting 2 × k table. The statistic
 * carries the finite-sample correction `(N − 1) / N` used by `coin`'s
 * `median_test`, so the numbers match the reference implementation instead of
 * the uncorrected Pearson statistic.
 */
import { chi2SF } from './distributions';
import type { MoodGroupCount, MoodResult } from '../analysisResults';
export type { MoodGroupCount, MoodResult } from '../analysisResults';

export interface MoodGroup {
  name: string;
  values: number[];
}

const median = (values: number[]): number => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

export const moodMedianTest = (input: MoodGroup[]): MoodResult | null => {
  const groups = input
    .map(group => ({
      name: group.name,
      values: group.values.filter(value => Number.isFinite(value)),
    }))
    .filter(group => group.values.length > 0);
  if (groups.length < 2) return null;

  const pooled = groups.flatMap(group => group.values);
  const centre = median(pooled);
  const counts: MoodGroupCount[] = groups.map(group => ({
    name: group.name,
    n: group.values.length,
    above: group.values.filter(value => value > centre).length,
    below: group.values.filter(value => value <= centre).length,
  }));
  const above = counts.reduce((sum, group) => sum + group.above, 0);
  const below = counts.reduce((sum, group) => sum + group.below, 0);
  const total = above + below;
  if (above === 0 || below === 0) return null;

  let pearson = 0;
  for (const group of counts) {
    const expectedAbove = (group.n * above) / total;
    const expectedBelow = (group.n * below) / total;
    pearson += Math.pow(group.above - expectedAbove, 2) / expectedAbove;
    pearson += Math.pow(group.below - expectedBelow, 2) / expectedBelow;
  }
  const chi2 = pearson * ((total - 1) / total);
  const df = groups.length - 1;

  return { median: centre, above, below, groups: counts, chi2, df, p: chi2SF(chi2, df) };
};
