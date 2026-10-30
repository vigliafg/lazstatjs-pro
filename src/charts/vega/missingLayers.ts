import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { colorAt, themeFor } from './theme';
import { axis, field, rowsOf, type Spec } from './encoding';

/**
 * Missingness matrix: one cell per row × variable, coloured by state.
 * The row axis has no labels because a real dataset easily has hundreds of
 * rows; the y title still tells the reader what the rows are.
 */
export const matrixLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'missingness' }>
): Spec[] => {
  const theme = themeFor(options);
  const rows = rowsOf(chart, 'cells');
  const states = Array.from(new Set(rows.map(row => String(row.state ?? '')))).filter(Boolean);
  return [
    {
      data: { values: rows },
      mark: { type: 'rect', stroke: theme.grid, strokeWidth: 0.5 },
      encoding: {
        x: {
          field: 'x',
          type: 'nominal',
          sort: null,
          axis: axis(options, theme, options.showXTitle ? field(chart, 'xLabel', '') : null, false),
        },
        y: {
          field: 'y',
          type: 'nominal',
          sort: null,
          axis: {
            ...axis(options, theme, options.showYTitle ? field(chart, 'yLabel', '') : null, false),
            labels: false,
          },
        },
        color: {
          field: 'state',
          type: 'nominal',
          title: chart.fields.series ?? null,
          scale: {
            domain: states,
            range: states.map((_, index) => colorAt(options, index === 0 ? 3 : 2)),
          },
          legend: options.showLegend
            ? {
                orient: options.legendPosition === 'right' ? 'right' : 'bottom',
                labelColor: theme.muted,
                titleColor: theme.muted,
                labelFontSize: 9,
                titleFontSize: 9,
              }
            : null,
        },
      },
    },
  ];
};
