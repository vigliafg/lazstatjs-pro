/**
 * Nested (hierarchical) ANOVA.
 *
 * One factor is nested inside another: each level of the inner factor belongs
 * to exactly one level of the outer factor. The outer factor is tested against
 * the inner-factor mean square, and the inner factor against the residual mean
 * square. Unbalanced cells are allowed; the sums of squares are the usual
 * weighted decompositions.
 */
import { jStat } from '../jstat';
import { parseNum } from '../core';
import { fSF } from '../distributions';

export interface NestedGroupStats {
  group: string;
  outer: string;
  n: number;
  mean: number;
  sd: number;
}

export interface NestedEffect {
  ss: number;
  df: number;
  ms: number;
  f: number;
  p: number;
}

export interface NestedAnovaResult {
  outerLevels: string[];
  innerLevels: string[];
  nTotal: number;
  outer: NestedEffect;
  inner: NestedEffect;
  error: { ss: number; df: number; ms: number };
  total: { ss: number; df: number };
  groupStats: NestedGroupStats[];
  /** Variance components (outer, inner, residual) under the random-effects view. */
  varianceComponents: { outer: number; inner: number; error: number };
}

interface Cell {
  outer: string;
  inner: string;
  values: number[];
}

/** Nested ANOVA from rows; returns `null` for unusable or wrongly nested data. */
export const nestedAnova = (
  rows: readonly (readonly string[])[],
  depIdx: number,
  outerIdx: number,
  innerIdx: number
): NestedAnovaResult | null => {
  if (depIdx < 0 || outerIdx < 0 || innerIdx < 0) return null;
  if (outerIdx === innerIdx || depIdx === outerIdx || depIdx === innerIdx) return null;

  const outerOfInner = new Map<string, string>();
  const cells = new Map<string, Cell>();

  for (const row of rows) {
    const value = parseNum(row[depIdx]);
    const outer = String(row[outerIdx] ?? '').trim();
    const inner = String(row[innerIdx] ?? '').trim();
    if (!Number.isFinite(value) || outer === '' || inner === '') continue;

    const known = outerOfInner.get(inner);
    if (known !== undefined && known !== outer) return null; // not truly nested
    outerOfInner.set(inner, outer);

    const key = `${outer}\u0000${inner}`;
    const cell = cells.get(key);
    if (cell) cell.values.push(value);
    else cells.set(key, { outer, inner, values: [value] });
  }

  const allCells = [...cells.values()];
  if (allCells.length === 0) return null;

  const outerLevels = [...new Set(allCells.map(cell => cell.outer))].sort();
  const innerLevels = allCells.map(cell => cell.inner).sort();
  const nTotal = allCells.reduce((sum, cell) => sum + cell.values.length, 0);
  const grandMean = allCells.reduce(
    (sum, cell) => sum + jStat.mean(cell.values) * cell.values.length,
    0
  ) / nTotal;

  const outerGroups = outerLevels.map(outer => {
    const groupCells = allCells.filter(cell => cell.outer === outer);
    const values = groupCells.flatMap(cell => cell.values);
    return { outer, cells: groupCells, values, mean: jStat.mean(values) };
  });

  let ssOuter = 0;
  let ssInner = 0;
  let ssError = 0;
  outerGroups.forEach(group => {
    ssOuter += group.values.length * Math.pow(group.mean - grandMean, 2);
    group.cells.forEach(cell => {
      const mean = jStat.mean(cell.values);
      ssInner += cell.values.length * Math.pow(mean - group.mean, 2);
      cell.values.forEach(value => {
        ssError += Math.pow(value - mean, 2);
      });
    });
  });
  const ssTotal = ssOuter + ssInner + ssError;

  const a = outerLevels.length;
  const b = allCells.length;
  const dfOuter = a - 1;
  const dfInner = b - a;
  const dfError = nTotal - b;
  if (dfOuter <= 0 || dfInner <= 0 || dfError <= 0) return null;

  const msOuter = ssOuter / dfOuter;
  const msInner = ssInner / dfInner;
  const msError = ssError / dfError;
  const fOuter = msInner > 0 ? msOuter / msInner : NaN;
  const fInner = msError > 0 ? msInner / msError : NaN;

  const groupStats: NestedGroupStats[] = allCells
    .map(cell => ({
      group: cell.inner,
      outer: cell.outer,
      n: cell.values.length,
      mean: jStat.mean(cell.values),
      sd: jStat.stdev(cell.values, true),
    }))
    .sort((left, right) => left.outer.localeCompare(right.outer) || left.group.localeCompare(right.group));

  // Naive variance components for the random-effects view (Satterthwaite-free,
  // documented approximation with the average cell size).
  const cellSizes = allCells.map(cell => cell.values.length);
  const n0Inner = cellSizes.reduce((sum, size) => sum + size, 0) / cellSizes.length;
  const groupSizes = outerGroups.map(group => group.values.length);
  const n0Outer = groupSizes.reduce((sum, size) => sum + size, 0) / groupSizes.length;
  const varianceComponents = {
    outer: n0Outer > 0 ? Math.max(0, (msOuter - msInner) / n0Outer) : NaN,
    inner: n0Inner > 0 ? Math.max(0, (msInner - msError) / n0Inner) : NaN,
    error: msError,
  };

  return {
    outerLevels,
    innerLevels,
    nTotal,
    outer: { ss: ssOuter, df: dfOuter, ms: msOuter, f: fOuter, p: fSF(fOuter, dfOuter, dfInner) },
    inner: { ss: ssInner, df: dfInner, ms: msInner, f: fInner, p: fSF(fInner, dfInner, dfError) },
    error: { ss: ssError, df: dfError, ms: msError },
    total: { ss: ssTotal, df: nTotal - 1 },
    groupStats,
    varianceComponents,
  };
};
