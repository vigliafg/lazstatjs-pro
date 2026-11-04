import type { ChartRow } from '../../stats/charts';
import { num, type Spec } from './encoding';

/** Ink colours for labels drawn on top of a coloured fill (heatmap cell, bar). */
export const DARK_INK = '#0f172a';
export const LIGHT_INK = '#ffffff';

/**
 * Text layers split by ink. A per-row `color` encoding would fight the fill
 * scale of the bars or cells underneath (Vega-Lite merges colour scales), so
 * each ink gets its own layer with a fixed mark colour.
 */
export const inkLayers = (
  rows: ChartRow[],
  inkOf: (row: ChartRow) => string,
  build: (rows: ChartRow[], ink: string) => Spec
): Spec[] =>
  Array.from(new Set(rows.map(row => inkOf(row))))
    .map(ink => ({ ink, rows: rows.filter(row => inkOf(row) === ink) }))
    .filter(group => group.rows.length > 0)
    .map(group => build(group.rows, group.ink));

/**
 * Ink for a heatmap label. The cell fill comes from the colour scheme, not from
 * the theme, so a fixed text colour disappears on the light half of the scale:
 * dark ink reads best there and white ink on the saturated end. 0.72 is where
 * the `redblue` and `blues` schemes cross over.
 */
const cellInk = (cells: ChartRow[], diverging: boolean) => {
  const values = cells.map(cell => num(cell.value)).filter(Number.isFinite);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const absMax = Math.max(Math.abs(min), Math.abs(max));
  const span = max - min;
  return (row: ChartRow): string => {
    const value = num(row.value);
    if (!Number.isFinite(value)) return DARK_INK;
    if (diverging) return absMax > 0 && Math.abs(value) > absMax * 0.72 ? LIGHT_INK : DARK_INK;
    return span > 0 && (value - min) / span > 0.72 ? LIGHT_INK : DARK_INK;
  };
};

export const heatmapLabelLayers = (
  cells: ChartRow[],
  options: { diverging: boolean; xOrder: string[] | null; yOrder: string[] | null }
): Spec[] =>
  inkLayers(cells, cellInk(cells, options.diverging), (rows, ink) => ({
    data: { values: rows },
    mark: { type: 'text', fontSize: 9, color: ink },
    encoding: {
      x: { field: 'x', type: 'nominal', sort: options.xOrder },
      y: { field: 'y', type: 'nominal', sort: options.yOrder },
      text: { field: 'label', type: 'nominal' },
    },
  }));

/**
 * Value labels for a bar chart. A stacked segment carries its label inside the
 * fill at the segment centre: on `value` every label of a stack lands on the
 * shared seam and two labels overlap. A single bar keeps the label outside the
 * bar, above for positive values and below the tip for negative ones, so it
 * never sits half on and half off the bar.
 */
export const barValueLabels = (
  bars: ChartRow[],
  options: { stacked: boolean; sort: string[] | null; textInk: string; offset: Spec }
): Spec[] => {
  const positiveStack = options.stacked && bars.every(row => num(row.value) >= 0);
  let rows: ChartRow[] = bars;
  if (positiveStack) {
    const running = new Map<string, number>();
    rows = bars.map(row => {
      const key = String(row.category ?? '');
      const base = running.get(key) ?? 0;
      const value = num(row.value);
      running.set(key, base + value);
      return { ...row, labelY: base + value / 2 };
    });
  } else {
    rows = bars.map(row => ({ ...row, labelY: num(row.value) }));
  }
  const groups = positiveStack
    ? [{ rows, dy: 0, ink: DARK_INK }]
    : [
        { rows: rows.filter(row => num(row.value) >= 0), dy: -6, ink: options.textInk },
        { rows: rows.filter(row => num(row.value) < 0), dy: 12, ink: options.textInk },
      ];
  return groups
    .filter(group => group.rows.length > 0)
    .map(group => ({
      data: { values: group.rows },
      mark: { type: 'text', dy: group.dy, fontSize: 9, color: group.ink },
      encoding: {
        x: { field: 'category', type: 'nominal', sort: options.sort },
        y: { field: 'labelY', type: 'quantitative' },
        text: { field: 'value', type: 'quantitative', format: '.2f' },
        ...options.offset,
      },
    }));
};
