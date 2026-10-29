import test from 'node:test';
import assert from 'node:assert/strict';
import { fitChartBudget, parseChartModel, parseChartModels, downsampleRows } from './schema';
import { factoryOptions } from './defaults';
import { MAX_CHARTS_PER_OUTPUT, MAX_CHART_POINTS } from '../stats/charts';
import { makeChart } from './kits/common';

const base = () =>
  makeChart({
    id: 'c1',
    kind: 'scatter',
    title: 'Chart',
    data: { points: [{ x: 1, y: 2 }] },
    fields: { xLabel: 'X', yLabel: 'Y' },
  });

test('parseChartModel accepts a valid model and restores factory options', () => {
  const parsed = parseChartModel({ ...base(), options: { kind: 'scatter' } });
  assert.ok(parsed);
  assert.equal(parsed?.options.kind, 'scatter');
  assert.equal(parsed?.options.theme, 'dark');
});

test('parseChartModel rejects unknown kinds, missing data and non-finite cells', () => {
  assert.equal(parseChartModel({ ...base(), kind: 'nope' }), null);
  assert.equal(parseChartModel({ ...base(), data: {} }), null);
  const parsed = parseChartModel({
    ...base(),
    data: { points: [{ x: Number.NaN, y: 2 }] },
  });
  assert.ok(parsed);
  assert.deepEqual(parsed?.data.points, [{ x: null, y: 2 }]);
});

test('downsampleRows keeps the endpoints and caps the layer', () => {
  const rows = Array.from({ length: MAX_CHART_POINTS + 500 }, (_, i) => ({ x: i, y: i }));
  const result = downsampleRows(rows);
  assert.equal(result.rows.length, MAX_CHART_POINTS);
  assert.equal(result.sampled, true);
  assert.equal(result.rows[0].x, 0);
  assert.equal(result.rows[result.rows.length - 1].x, rows.length - 1);
});

test('parseChartModels caps the number of charts and fitChartBudget reports overflow', () => {
  const charts = Array.from({ length: MAX_CHARTS_PER_OUTPUT + 3 }, (_, i) =>
    makeChart({
      id: `c${i}`,
      kind: 'bar',
      title: `Chart ${i}`,
      data: { bars: [{ category: 'A', value: i }] },
    })
  );
  assert.equal(parseChartModels(charts).length, MAX_CHARTS_PER_OUTPUT);
  const budget = fitChartBudget(charts, 0);
  assert.equal(budget.overflow, 3);
  assert.equal(budget.charts.length, MAX_CHARTS_PER_OUTPUT);
});

test('fitChartBudget drops charts that do not fit the card budget', () => {
  const chart = makeChart({
    id: 'big',
    kind: 'bar',
    title: 'Big',
    data: { bars: [{ category: 'A', value: 1 }] },
  });
  const budget = fitChartBudget([chart], 599_990, 600_000);
  assert.equal(budget.charts.length, 0);
  assert.equal(budget.omitted, 1);
});

test('a chart model crosses a structuredClone boundary unchanged', () => {
  const model = base();
  assert.deepEqual(structuredClone(model), model);
});

test('factory options are valid for every kind', () => {
  for (const kind of ['scatter', 'line', 'bar', 'box', 'histogram', 'qq', 'forest', 'survival', 'acf', 'heatmap', 'mosaic', 'residual', 'scree', 'score', 'bland', 'power', 'bootstrap', 'missingness'] as const) {
    assert.equal(factoryOptions(kind).kind, kind);
  }
});
