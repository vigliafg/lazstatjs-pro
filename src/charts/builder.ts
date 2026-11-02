/**
 * Limited Graph Builder.
 *
 * Compose one of the existing chart kinds from the current dataset. The
 * builder is deliberately small: it aggregates only what the renderer already
 * knows how to show and never reuses the statistical kernels. Existing charts
 * and the style gallery stay the single source of visual behaviour.
 */

import type { AnalysisChart, ChartRow } from '../stats/charts';
import type { GridData, ColType } from '../grid/types';
import { parseNum } from '../stats/core';
import { boxRows, makeChart } from './kits/common';

export type BuilderKind = 'scatter' | 'line' | 'bar' | 'box' | 'histogram';

export const BUILDER_KINDS: readonly BuilderKind[] = [
  'scatter',
  'line',
  'bar',
  'box',
  'histogram',
];

export interface BuilderSpec {
  kind: BuilderKind;
  /** Column indexes; -1 means "not assigned". */
  x: number;
  y: number;
  group: number;
  id?: string;
}

const NUMERIC: readonly ColType[] = ['num', 'int', 'dec'];

const isNumeric = (grid: GridData, index: number): boolean => {
  const type = grid.cols[index]?.type;
  return type !== undefined && NUMERIC.includes(type);
};

const nameOf = (grid: GridData, index: number): string =>
  index >= 0 ? grid.cols[index]?.name ?? `C${index + 1}` : '';

const valid = (grid: GridData, index: number): boolean =>
  Number.isInteger(index) && index >= 0 && index < grid.cols.length;

const labelOf = (grid: GridData, index: number): string => {
  if (!valid(grid, index)) return '';
  const column = grid.cols[index];
  const value = String(column.name ?? '').trim();
  return value || `C${index + 1}`;
};

const groupValue = (grid: GridData, row: string[], group: number): string | undefined =>
  valid(grid, group) ? String(row[group] ?? '') : undefined;

interface Cell {
  row: string[];
  index: number;
}

const cells = (grid: GridData): Cell[] => grid.rows.map((row, index) => ({ row, index }));

const finite = (value: number): boolean => Number.isFinite(value);

const sortedCategories = (values: string[]): string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

/**
 * Build one chart from a dataset and a small role assignment.
 * Returns `null` when the roles cannot produce a meaningful chart.
 */
export const buildGraphChart = (grid: GridData, spec: BuilderSpec): AnalysisChart | null => {
  if (!valid(grid, spec.y)) return null;
  const yName = labelOf(grid, spec.y);
  const xName = valid(grid, spec.x) ? labelOf(grid, spec.x) : '';
  const group = valid(grid, spec.group) ? spec.group : -1;
  const id = spec.id ?? `graph-${spec.kind}-${spec.x}-${spec.y}-${group}`;
  const baseTitle = xName ? `${yName} × ${xName}` : yName;

  if (spec.kind === 'histogram') {
    const values = cells(grid)
      .map(cell => ({ value: parseNum(cell.row[spec.y]), index: cell.index }))
      .filter(item => finite(item.value));
    if (values.length < 2) return null;
    return makeChart({
      id,
      kind: 'histogram',
      title: baseTitle,
      data: { values: values.map(item => ({ value: item.value, __row: String(item.index) })) },
      fields: { xLabel: yName, yLabel: yName },
    });
  }

  if (spec.kind === 'scatter' || spec.kind === 'line') {
    if (!isNumeric(grid, spec.x) || !isNumeric(grid, spec.y)) return null;
    const points = cells(grid)
      .map(cell => ({
        x: parseNum(cell.row[spec.x]),
        y: parseNum(cell.row[spec.y]),
        __row: String(cell.index),
        ...(group >= 0 ? { group: groupValue(grid, cell.row, group) ?? '' } : {}),
      }))
      .filter(point => finite(point.x) && finite(point.y));
    if (points.length < 2) return null;
    if (spec.kind === 'line') {
      const series = [...points]
        .sort((a, b) => a.x - b.x)
        .map(point => ({
          x: point.x,
          y: point.y,
          __row: point.__row,
          ...('group' in point ? { series: point.group } : {}),
        }));
      return makeChart({
        id,
        kind: 'line',
        title: baseTitle,
        data: { series },
        fields: { xLabel: xName, yLabel: yName },
        options: { showMarkers: true } as never,
      });
    }
    return makeChart({
      id,
      kind: 'scatter',
      title: baseTitle,
      data: { points },
      fields: { xLabel: xName, yLabel: yName },
      options: { fit: 'ols', band: 'none', ellipse: group < 0 } as never,
    });
  }

  if (spec.kind === 'bar') {
    if (!valid(grid, spec.x) || !isNumeric(grid, spec.y)) return null;
    const grouped = new Map<string, { sum: number; count: number; key: string }>();
    cells(grid).forEach(cell => {
      const value = parseNum(cell.row[spec.y]);
      if (!finite(value)) return;
      const category = String(cell.row[spec.x] ?? '');
      const series = group >= 0 ? String(cell.row[group] ?? '') : '';
      const key = `${category}\u0000${series}`;
      const bucket = grouped.get(key) ?? { sum: 0, count: 0, key };
      bucket.sum += value;
      bucket.count += 1;
      grouped.set(key, bucket);
    });
    const bars: ChartRow[] = [...grouped.values()].map(bucket => {
      const [category, series] = bucket.key.split('\u0000');
      return {
        category,
        value: bucket.count > 0 ? bucket.sum / bucket.count : Number.NaN,
        ...(group >= 0 ? { series } : {}),
      };
    });
    if (bars.length === 0) return null;
    return makeChart({
      id,
      kind: 'bar',
      title: baseTitle,
      data: { bars },
      fields: { xLabel: xName, yLabel: yName },
      options: { ...(group >= 0 ? { grouping: 'grouped' } : {}), valueLabels: true } as never,
    });
  }

  if (!valid(grid, spec.x) || !isNumeric(grid, spec.y)) return null;
  const byCategory = new Map<string, { values: number[]; keys: string[] }>();
  cells(grid).forEach(cell => {
    const value = parseNum(cell.row[spec.y]);
    if (!finite(value)) return;
    const category = String(cell.row[spec.x] ?? '');
    const bucket = byCategory.get(category) ?? { values: [], keys: [] };
    bucket.values.push(value);
    bucket.keys.push(String(cell.index));
    byCategory.set(category, bucket);
  });
  const categories = sortedCategories([...byCategory.keys()]);
  if (categories.length === 0) return null;
  const box = boxRows(
    categories.map(category => ({
      category,
      values: byCategory.get(category)?.values ?? [],
      keys: byCategory.get(category)?.keys ?? [],
    }))
  );
  return makeChart({
    id,
    kind: 'box',
    title: baseTitle,
    data: { summary: box.summary, points: box.points, outliers: box.outliers },
    fields: { xLabel: xName, yLabel: yName },
    options: { showPoints: true } as never,
  });
};
