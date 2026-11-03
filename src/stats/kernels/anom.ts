/**
 * ANOM — analysis of means.
 *
 * Plots each group mean against the grand mean with decision lines derived
 * from the within-group mean square. The critical value is the studentized
 * maximum modulus; this implementation uses the Bonferroni-t upper bound
 * `t(1 - α/(2k), df)` because it is exact for a single comparison and
 * conservative for the joint one (documented in the report).
 */
import { jStat } from '../jstat';
import { parseNum } from '../core';
import { tCrit } from '../distributions';

export interface AnomGroup {
  group: string;
  n: number;
  mean: number;
  sd: number;
  /** Group-specific decision limits. */
  lower: number;
  upper: number;
  outside: boolean;
}

export interface AnomResult {
  grandMean: number;
  msWithin: number;
  dfWithin: number;
  k: number;
  nTotal: number;
  alpha: number;
  /** Critical value `h` for the decision lines. */
  h: number;
  /** Decision limits used for a balanced group of size `nTotal / k`. */
  lower: number;
  upper: number;
  groups: AnomGroup[];
  outOfLimits: string[];
  /** `true` when the Bonferroni-t approximation was used (always, for now). */
  approximate: boolean;
}

/** ANOM from rows; `null` when fewer than two usable groups or no df. */
export const anom = (
  rows: readonly (readonly string[])[],
  depIdx: number,
  grpIdx: number,
  alpha = 0.05
): AnomResult | null => {
  if (depIdx < 0 || grpIdx < 0 || depIdx === grpIdx) return null;
  if (!(alpha > 0 && alpha < 1)) return null;

  const groups = new Map<string, number[]>();
  for (const row of rows) {
    const value = parseNum(row[depIdx]);
    const label = String(row[grpIdx] ?? '').trim();
    if (!Number.isFinite(value) || label === '') continue;
    const values = groups.get(label);
    if (values) values.push(value);
    else groups.set(label, [value]);
  }

  const keys = [...groups.keys()].sort();
  const k = keys.length;
  const nTotal = [...groups.values()].reduce((sum, values) => sum + values.length, 0);
  const dfWithin = nTotal - k;
  if (k < 2 || dfWithin <= 0) return null;

  const grandMean = [...groups.values()].reduce(
    (sum, values) => sum + jStat.mean(values) * values.length,
    0
  ) / nTotal;

  const ssWithin = [...groups.values()].reduce((sum, values) => {
    const mean = jStat.mean(values);
    return sum + values.reduce((inner, value) => inner + Math.pow(value - mean, 2), 0);
  }, 0);
  const msWithin = ssWithin / dfWithin;

  // Bonferroni-t: tCrit takes a confidence level, so pass 1 - α/k to obtain
  // the upper α/(2k) tail critical value.
  const h = tCrit((1 - alpha / k) * 100, dfWithin);

  const entry = (key: string): AnomGroup => {
    const values = groups.get(key) ?? [];
    const n = values.length;
    const mean = n > 0 ? jStat.mean(values) : NaN;
    const halfWidth = n > 0 ? h * Math.sqrt(msWithin * Math.max(0, 1 / n - 1 / nTotal)) : NaN;
    const lower = grandMean - halfWidth;
    const upper = grandMean + halfWidth;
    return {
      group: key,
      n,
      mean,
      sd: n > 1 ? jStat.stdev(values, true) : NaN,
      lower,
      upper,
      outside: Number.isFinite(mean) && (mean < lower || mean > upper),
    };
  };

  const groupStats = keys.map(entry);
  const balancedN = nTotal / k;
  const halfWidth = h * Math.sqrt(msWithin * Math.max(0, 1 / balancedN - 1 / nTotal));

  return {
    grandMean,
    msWithin,
    dfWithin,
    k,
    nTotal,
    alpha,
    h,
    lower: grandMean - halfWidth,
    upper: grandMean + halfWidth,
    groups: groupStats,
    outOfLimits: groupStats.filter(group => group.outside).map(group => group.group),
    approximate: true,
  };
};
