import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMiOutput } from './run';
import { chartOptions } from '../../charts/defaults';

const grid = {
  cols: [
    { name: 'X', type: 'num' as const },
    { name: 'Y', type: 'num' as const },
  ],
  rows: [
    ['1', '2'],
    ['', '3'],
    ['3', ''],
    ['4', '5'],
    ['', '6'],
    ['6', '7'],
  ],
};

const base = {
  grid,
  params: {
    variables: [0, 1],
    imputations: 3,
    iterations: 2,
    model: 'descriptives' as const,
    outcome: 0,
    predictors: [1],
  },
  ciLevel: 95,
};

test('multiple imputation rejects non-finite imputations and iterations', () => {
  const badImputations = buildMiOutput({
    ...base,
    params: { ...base.params, imputations: Number.NaN },
  });
  assert.ok('reason' in badImputations);
  if ('reason' in badImputations) assert.match(badImputations.reason, /Imputations/);

  const badIterations = buildMiOutput({
    ...base,
    params: { ...base.params, iterations: Number.NaN },
  });
  assert.ok('reason' in badIterations);
  if ('reason' in badIterations) assert.match(badIterations.reason, /Iterations/);
});

test('multiple imputation still runs with finite settings', () => {
  const result = buildMiOutput(base);
  assert.ok('ok' in result && result.ok);
  if ('ok' in result && result.ok) assert.ok(result.tables.length > 0);
});

test('multiple imputation adds the missingness matrix, chain trace and ECDF overlay', () => {
  const result = buildMiOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const charts = result.charts ?? [];
  const ids = charts.map(chart => chart.id);
  assert.ok(ids.includes('mi-missingness-matrix'));
  assert.ok(ids.includes('mi-patterns'));
  assert.ok(ids.includes('mi-strip'));
  assert.ok(ids.includes('mi-trace'));
  assert.ok(ids.includes('mi-observed-completed'));
  const matrix = charts.find(chart => chart.id === 'mi-missingness-matrix');
  assert.equal(matrix?.kind, 'missingness');
  assert.equal(matrix?.data.cells?.length, grid.rows.length * grid.cols.length);
  const matrixOptions = matrix ? chartOptions(matrix) : undefined;
  assert.equal(matrixOptions?.kind === 'missingness' ? matrixOptions.display : '', 'matrix');
  const trace = charts.find(chart => chart.id === 'mi-trace');
  assert.ok((trace?.data.series ?? []).length > 0);
  assert.ok((trace?.data.series ?? []).every(row => Number.isFinite(Number(row.y))));
});

test('multiple imputation draws a pooled forest when the linear model is requested', () => {
  const result = buildMiOutput({
    ...base,
    params: { ...base.params, model: 'linear', outcome: 0, predictors: [1] },
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const forest = (result.charts ?? []).find(chart => chart.id === 'mi-pooled-forest');
  assert.ok(forest);
  assert.equal(forest?.kind, 'forest');
  assert.ok((forest?.data.points ?? []).length >= 2);
});

const categoricalGrid = {
  cols: [
    { name: 'A', type: 'cat' as const },
    { name: 'B', type: 'cat' as const },
    { name: 'C', type: 'num' as const },
  ],
  rows: [
    ['1', '1', '10'],
    ['0', '1', '12'],
    ['1', '', '11'],
    ['0', '0', '9'],
    ['', '1', '10'],
    ['1', '0', '12'],
    ['0', '', '9'],
    ['1', '1', '11'],
    ['0', '0', '10'],
    ['1', '', '12'],
  ],
};

const categoricalBase = {
  grid: categoricalGrid,
  params: {
    variables: [0, 1],
    imputations: 3,
    iterations: 3,
    model: 'categorical' as const,
    outcome: 0,
    predictors: [2],
  },
  ciLevel: 95,
};

test('categorical MI produces pooled tables and categorical charts', () => {
  const result = buildMiOutput(categoricalBase);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const tableIds = result.tables.map(table => table.id);
  assert.ok(tableIds.includes('mi-categorical-summary'));
  assert.ok(tableIds.includes('mi-categorical-counts'));
  assert.ok(tableIds.includes('mi-categorical-pooled'));
  assert.equal(result.report.id, 'mi-categorical');
  const chartIds = (result.charts ?? []).map(chart => chart.id);
  assert.ok(chartIds.includes('mi-categorical-bars'));
  assert.ok(chartIds.includes('mi-categorical-missing'));
  assert.ok(chartIds.includes('mi-categorical-missingness-matrix'));
  assert.ok(!chartIds.includes('mi-observed-density'));
  assert.ok(!chartIds.includes('mi-observed-completed'));
});

test('categorical MI rejects a constant variable with a clear reason', () => {
  const result = buildMiOutput({
    ...categoricalBase,
    grid: {
      ...categoricalGrid,
      rows: categoricalGrid.rows.map((row, index) => [index < 8 ? '1' : '', ...row.slice(1)]),
    },
  });
  assert.ok('reason' in result);
  if ('reason' in result) assert.match(result.reason, /two observed categories/);
});
