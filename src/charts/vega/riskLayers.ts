import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { axis, field, num, rowsOf, tooltip, type Spec } from './encoding';
import { themeFor } from './theme';

/**
 * Number-at-risk table plotted under a Kaplan–Meier curve. The time axis is
 * shared with the curve, so the same limits are used for the text columns.
 */
export const riskLayers = (
  chart: AnalysisChart,
  options: Extract<ChartOptions, { kind: 'risk' }>
): Spec[] => {
  const theme = themeFor(options);
  const rows = rowsOf(chart, 'rows');
  const values = rows.map(row => ({
    ...row,
    text: options.showEvents
      ? `${row.atRisk ?? 0} (${row.events ?? 0})`
      : String(row.atRisk ?? ''),
  }));
  const times = rows.map(row => num(row.time)).filter(Number.isFinite);
  const min = times.length > 0 ? Math.min(...times) : 0;
  const max = times.length > 0 ? Math.max(...times) : 1;
  const padding = Math.max((max - min) * 0.02, 0.5);
  const groups = Array.from(new Set(rows.map(row => String(row.group ?? ''))));
  return [
    {
      data: { values },
      mark: { type: 'text', fontSize: 10, color: theme.text, ...tooltip(options) },
      encoding: {
        x: {
          field: 'time',
          type: 'quantitative',
          scale: { domain: [min - padding, max + padding], nice: false },
          axis: axis(
            options,
            theme,
            options.showXTitle ? field(chart, 'xLabel', '') : null,
            false
          ),
        },
        y: {
          field: 'group',
          type: 'nominal',
          sort: [...groups].reverse(),
          axis: axis(
            options,
            theme,
            options.showYTitle ? field(chart, 'yLabel', '') : null,
            false
          ),
        },
        text: { field: 'text', type: 'nominal' },
      },
    },
  ];
};
