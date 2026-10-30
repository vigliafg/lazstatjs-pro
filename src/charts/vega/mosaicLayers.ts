import type { AnalysisChart, ChartOptions, ChartRow } from '../../stats/charts';
import { axis, num, rowsOf, tooltip, type Spec } from './encoding';
import { colorAt, themeFor } from './theme';

const hiddenAxis = (options: ChartOptions, theme: ReturnType<typeof themeFor>): Spec => ({
  ...axis(options, theme, null, false),
  labels: false,
  ticks: false,
  domain: false,
});

/**
 * Mosaic of a contingency table: row heights are row totals, cell widths are
 * the conditional column distribution. Category labels sit outside the tiles
 * because the numeric axes themselves carry no meaning.
 */
export const mosaicLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'mosaic' }>
): Spec[] => {
  const theme = themeFor(options);
  const cells = rowsOf(chart, 'cells');
  if (cells.length === 0) return [];
  const color = options.residualColor
    ? {
        field: 'residual',
        type: 'quantitative',
        scale: { scheme: 'redblue', domainMid: 0 },
        legend: options.showLegend
          ? { title: null, labelColor: theme.muted, titleColor: theme.muted }
          : null,
      }
    : {
        field: 'row',
        type: 'nominal',
        title: null,
        legend: options.showLegend
          ? { labelColor: theme.muted, titleColor: theme.muted }
          : null,
      };
  const layers: Spec[] = [
    {
      data: { values: cells },
      mark: { type: 'rect', stroke: theme.background, strokeWidth: 1, ...tooltip(options) },
      encoding: {
        x: {
          field: 'x0',
          type: 'quantitative',
          scale: { domain: [-0.34, 1.02], nice: false },
          axis: hiddenAxis(options, theme),
        },
        x2: { field: 'x1' },
        y: {
          field: 'y0',
          type: 'quantitative',
          scale: { domain: [-0.03, 1.16], nice: false },
          axis: hiddenAxis(options, theme),
        },
        y2: { field: 'y1' },
        color,
      },
    },
  ];
  if (options.showValues) {
    layers.push({
      data: {
        values: cells.map(row => ({
          x: (num(row.x0) + num(row.x1)) / 2,
          y: (num(row.y0) + num(row.y1)) / 2,
          text: row.label,
        })),
      },
      mark: { type: 'text', fontSize: 9, color: theme.text },
      encoding: {
        x: { field: 'x', type: 'quantitative' },
        y: { field: 'y', type: 'quantitative' },
        text: { field: 'text', type: 'nominal' },
      },
    });
  }
  const rowLabels = new Map<string, ChartRow>();
  cells.forEach(cell => {
    const row = String(cell.row ?? '');
    if (rowLabels.has(row)) return;
    rowLabels.set(row, {
      x: -0.02,
      y: (num(cell.y0) + num(cell.y1)) / 2,
      text: row,
    });
  });
  layers.push({
    data: { values: [...rowLabels.values()] },
    mark: { type: 'text', align: 'right', dx: -4, fontSize: 9, color: theme.muted },
    encoding: {
      x: { field: 'x', type: 'quantitative' },
      y: { field: 'y', type: 'quantitative' },
      text: { field: 'text', type: 'nominal' },
    },
  });
  const firstRow = String(cells[0].row ?? '');
  const columnLabels = cells
    .filter(cell => String(cell.row ?? '') === firstRow)
    .map(cell => ({
      x: (num(cell.x0) + num(cell.x1)) / 2,
      y: 1.03,
      text: String(cell.col ?? ''),
    }));
  if (columnLabels.length > 0) {
    layers.push({
      data: { values: columnLabels },
      mark: { type: 'text', baseline: 'bottom', fontSize: 9, color: theme.muted },
      encoding: {
        x: { field: 'x', type: 'quantitative' },
        y: { field: 'y', type: 'quantitative' },
        text: { field: 'text', type: 'nominal' },
      },
    });
  }
  return layers;
};
