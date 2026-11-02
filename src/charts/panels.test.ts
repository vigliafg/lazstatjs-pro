import test from 'node:test';
import assert from 'node:assert/strict';
import { makeChart } from './kits/common';
import {
  distributionPanel,
  fitModelPanel,
  makePanel,
  onewayPanel,
  pcaPanel,
  qualityPanel,
  regressionDiagnosticPanel,
  timeSeriesPanel,
} from './panels';
import { MAX_PANEL_CHILDREN } from '../stats/charts';
import type { AnalysisChart } from '../stats/charts';

const chart = (id: string, kind: AnalysisChart['kind'], data: AnalysisChart['data']): AnalysisChart =>
  makeChart({ id, kind, title: id, data });

const charts = (): AnalysisChart[] => [
  chart('desc-hist-X', 'histogram', { values: [{ value: 1 }, { value: 2 }] }),
  chart('desc-box', 'box', {
    summary: [{ category: 'X', min: 1, q1: 1, median: 1, q3: 2, max: 2 }],
  }),
  chart('desc-qq-X', 'qq', { points: [{ x: 0, y: 1 }] }),
  chart('desc-shadow-X', 'shadowgram', { values: [{ value: 1 }] }),
  chart('anova-diamond', 'diamond', {
    intervals: [{ category: 'A', estimate: 1, lo: 0.5, hi: 1.5 }],
  }),
  chart('anova-circles', 'circles', {
    intervals: [{ category: 'A', estimate: 1, lo: 0.5, hi: 1.5 }],
  }),
  chart('anova-box', 'box', {
    summary: [{ category: 'A', min: 1, q1: 1, median: 1, q3: 2, max: 2 }],
  }),
  chart('anova-posthoc-forest', 'forest', {
    points: [{ label: 'A-B', estimate: 1, lo: 0.5, hi: 1.5 }],
  }),
  chart('reg-observed-fitted', 'scatter', { points: [{ x: 1, y: 1 }] }),
  chart('reg-scatter', 'scatter', { points: [{ x: 1, y: 1 }] }),
  chart('reg-residual-fitted', 'residual', { points: [{ x: 1, y: 0 }] }),
  chart('reg-scale-location', 'scatter', { points: [{ x: 1, y: 1 }] }),
  chart('reg-residual-leverage', 'scatter', { points: [{ x: 0.1, y: 1 }] }),
  chart('reg-cooks', 'scatter', { points: [{ x: 1, y: 0.1 }] }),
  chart('reg-residual-qq', 'qq', { points: [{ x: 0, y: 0 }] }),
  chart('pca-scree', 'scree', { bars: [{ category: 'PC1', value: 50 }] }),
  chart('pca-score', 'score', { points: [{ x: 0, y: 0 }] }),
  chart('pca-loadings', 'heatmap', { cells: [{ x: 'PC1', y: 'X', value: 0.5 }] }),
  chart('pca-biplot', 'score', { points: [{ x: 0, y: 0 }] }),
  chart('ts-arima-chart', 'line', { series: [{ x: 1, y: 1 }] }),
  chart('ts-simple-chart', 'line', { series: [{ x: 1, y: 1 }] }),
  chart('ts-acf-chart', 'acf', { bars: [{ lag: 1, value: 0.2 }] }),
  chart('ts-pacf-chart', 'acf', { bars: [{ lag: 1, value: 0.1 }] }),
  chart('ts-decomposition-trend', 'line', { series: [{ x: 1, y: 1 }] }),
  chart('control-xbar', 'line', { series: [{ x: 1, y: 1 }] }),
  chart('capability-plot', 'histogram', { values: [{ value: 1 }] }),
  chart('pareto-defects', 'bar', { bars: [{ category: 'A', value: 3 }] }),
];

const ids = (panel: { children: AnalysisChart[] } | null): string[] =>
  panel?.children.map(child => child.id) ?? [];

test('makePanel dedupes children, caps them and rejects an empty panel', () => {
  const base = chart('a', 'histogram', { values: [{ value: 1 }] });
  const many = Array.from({ length: MAX_PANEL_CHILDREN + 4 }, (_, index) => ({
    ...base,
    id: `c${index}`,
  }));
  const panel = makePanel({ id: 'p', title: 'Panel', children: [...many, many[0]] });
  assert.equal(panel?.children.length, MAX_PANEL_CHILDREN);
  assert.equal(new Set(panel?.children.map(child => child.id)).size, MAX_PANEL_CHILDREN);
  assert.equal(makePanel({ id: 'p', title: 'Panel', children: [] }), null);
});

test('distributionPanel reuses histogram, box, Q-Q and shadowgram', () => {
  const panel = distributionPanel({
    title: 'Distribution',
    charts: charts(),
    tables: [
      {
        id: 'desc-location',
        title: 'Location',
        columns: [{ key: 'mean', label: 'Mean' }],
        rows: [{ mean: 1 }],
      },
    ],
  });
  assert.deepEqual(ids(panel), [
    'desc-hist-X',
    'desc-box',
    'desc-qq-X',
    'desc-shadow-X',
  ]);
  assert.equal(panel?.tables?.[0].id, 'desc-location');
  assert.equal(panel?.layout, 'grid');
});

test('onewayPanel, fitModelPanel and regressionDiagnosticPanel pick the right charts', () => {
  const all = charts();
  assert.deepEqual(ids(onewayPanel({ title: 'Oneway', charts: all })), [
    'anova-diamond',
    'anova-circles',
    'anova-box',
    'anova-posthoc-forest',
  ]);
  assert.deepEqual(ids(fitModelPanel({ title: 'Fit', charts: all })), [
    'reg-observed-fitted',
    'reg-scatter',
    'reg-residual-fitted',
    'reg-scale-location',
    'reg-residual-leverage',
    'reg-residual-qq',
  ]);
  assert.deepEqual(ids(regressionDiagnosticPanel({ title: 'Diagnostics', charts: all })), [
    'reg-residual-fitted',
    'reg-scale-location',
    'reg-residual-leverage',
    'reg-cooks',
    'reg-residual-qq',
  ]);
});

test('pcaPanel and timeSeriesPanel compose the multivariate and series reports', () => {
  const all = charts();
  assert.deepEqual(ids(pcaPanel({ title: 'PCA', charts: all })), [
    'pca-scree',
    'pca-score',
    'pca-loadings',
    'pca-biplot',
  ]);
  const series = timeSeriesPanel({ title: 'Series', charts: all });
  assert.equal(series?.layout, 'stack');
  assert.deepEqual(ids(series), [
    'ts-arima-chart',
    'ts-acf-chart',
    'ts-pacf-chart',
    'ts-decomposition-trend',
  ]);
});

test('modern panels degrade when the expected charts are missing', () => {
  assert.equal(distributionPanel({ title: 'D', charts: [] }), null);
  assert.equal(onewayPanel({ title: 'O', charts: [] }), null);
  assert.deepEqual(ids(distributionPanel({ title: 'D', charts: charts().slice(0, 1) })), [
    'desc-hist-X',
  ]);
});

test('qualityPanel is ready for the L4 quality charts and stays empty without them', () => {
  const all = charts();
  const panel = qualityPanel({ title: 'Quality', charts: all });
  assert.deepEqual(ids(panel), ['control-xbar', 'capability-plot', 'pareto-defects']);
  assert.equal(qualityPanel({ title: 'Quality', charts: all.slice(0, 4) }), null);
});
