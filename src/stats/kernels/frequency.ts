/**
 * Frequency (tally) table for one variable.
 *
 * Categorical, boolean and low-cardinality numeric columns are all tallied as
 * text: the grid stores everything as strings, so no type sniffing is needed.
 * The proportion interval is the Wilson score interval without continuity
 * correction, which is exactly what R's `prop.test(x, n, correct = FALSE)`
 * reports and stays well behaved for small counts.
 */
import { jStat } from '../jstat';
import { zCrit } from './distributions';

export interface FrequencyRow {
  value: string;
  count: number;
  /** Percentage of the non-missing observations. */
  percent: number;
  cumCount: number;
  cumPercent: number;
  /** Wilson score interval on the proportion, in percent. */
  ciLo: number;
  ciHi: number;
}

export interface FrequencyResult {
  total: number;
  missing: number;
  distinct: number;
  mode: string | null;
  rows: FrequencyRow[];
}

/** More levels than this is a continuous variable, not a tally. */
export const FREQUENCY_MAX_LEVELS = 100;

const isMissing = (value: string | undefined | null): boolean =>
  value === undefined || value === null || value.trim().length === 0;

const numeric = (value: string): number => Number.parseFloat(value.trim().replace(',', '.'));

const compareValues = (left: string, right: string): number => {
  const a = numeric(left);
  const b = numeric(right);
  if (Number.isFinite(a) && Number.isFinite(b) && a !== b) return a - b;
  return left < right ? -1 : left > right ? 1 : 0;
};

/** Wilson score interval for `successes / total`, returned as a percentage. */
export const wilsonInterval = (
  successes: number,
  total: number,
  level = 95
): { lo: number; hi: number } => {
  if (!(total > 0)) return { lo: Number.NaN, hi: Number.NaN };
  const z = zCrit(level);
  const p = successes / total;
  const denominator = 1 + (z * z) / total;
  const centre = (p + (z * z) / (2 * total)) / denominator;
  const half = (z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total))) / denominator;
  return {
    lo: Math.max(0, centre - half) * 100,
    hi: Math.min(1, centre + half) * 100,
  };
};

/**
 * Tally the non-missing values, sorted numerically when every level parses as
 * a number and lexicographically otherwise. Returns `null` when there is
 * nothing to count or when the column has more than `FREQUENCY_MAX_LEVELS`
 * distinct values (a continuous variable belongs to the summary mode).
 */
export const frequencyTable = (
  values: readonly (string | null | undefined)[],
  level = 95
): FrequencyResult | null => {
  const counts = new Map<string, number>();
  let total = 0;
  let missing = 0;
  for (const raw of values) {
    if (isMissing(raw)) {
      missing += 1;
      continue;
    }
    const value = String(raw).trim();
    counts.set(value, (counts.get(value) ?? 0) + 1);
    total += 1;
  }
  if (total === 0 || counts.size === 0 || counts.size > FREQUENCY_MAX_LEVELS) return null;

  const ordered = [...counts.entries()].sort((left, right) => compareValues(left[0], right[0]));
  let cumCount = 0;
  let mode: string | null = null;
  let modeCount = -1;
  const rows: FrequencyRow[] = ordered.map(([value, count]) => {
    cumCount += count;
    if (count > modeCount) {
      modeCount = count;
      mode = value;
    }
    const ci = wilsonInterval(count, total, level);
    return {
      value,
      count,
      percent: (count / total) * 100,
      cumCount,
      cumPercent: (cumCount / total) * 100,
      ciLo: ci.lo,
      ciHi: ci.hi,
    };
  });

  return { total, missing, distinct: rows.length, mode, rows };
};

/** Chi-square goodness-of-fit of the observed tally against equal shares. */
export const equalShareChiSquare = (
  result: FrequencyResult
): { chi2: number; df: number; p: number } | null => {
  if (result.rows.length < 2) return null;
  const expected = result.total / result.rows.length;
  const chi2 = result.rows.reduce(
    (sum, row) => sum + Math.pow(row.count - expected, 2) / expected,
    0
  );
  const df = result.rows.length - 1;
  return { chi2, df, p: 1 - jStat.chisquare.cdf(chi2, df) };
};
