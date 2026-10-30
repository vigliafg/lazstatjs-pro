import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMultivariateOutput } from './run';

const grid = {
  cols: [
    { name: 'X1', type: 'num' as const },
    { name: 'X2', type: 'num' as const },
    { name: 'X3', type: 'num' as const },
  ],
  rows: [
    ['1', '2', '3'],
    ['2', '3', '5'],
    ['3', '5', '8'],
    ['4', '6', '9'],
    ['5', '7', '11'],
    ['6', '8', '13'],
  ],
};

const base = {
  grid,
  params: { mode: 'pca' as const, standardize: true, selected: [0, 1, 2], factors: 0, rotation: 'varimax' as const },
  ciLevel: 95,
};

test('multivariate builder returns PCA tables, report and a scree plot', () => {
  const result = buildMultivariateOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(ids, ['pca-scree', 'pca-score', 'pca-loadings', 'pca-biplot']);
  const biplot = (result.charts ?? []).find(chart => chart.id === 'pca-biplot');
  assert.equal((biplot?.data.vectors ?? []).length, 3);
  const loadings = (result.charts ?? []).find(chart => chart.id === 'pca-loadings');
  assert.ok((loadings?.data.cells ?? []).length >= 3);
});

test('multivariate builder supports Cronbach alpha', () => {
  const result = buildMultivariateOutput({
    ...base,
    params: { ...base.params, mode: 'alpha' },
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(ids, ['alpha-items', 'alpha-if-deleted', 'alpha-correlations']);
});

test('multivariate builder draws loadings and parallel analysis for EFA', () => {
  const result = buildMultivariateOutput({
    ...base,
    params: { ...base.params, mode: 'efa', factors: 1 },
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(ids, ['efa-loadings', 'efa-parallel', 'efa-variance', 'efa-communalities']);
  const parallel = (result.charts ?? []).find(chart => chart.id === 'efa-parallel');
  const series = (parallel?.data.series ?? []).map(row => row.series);
  assert.ok(series.includes('Autovalori osservati'));
  assert.ok(series.includes('Soglia casuale'));
});

test('multivariate builder omits alpha-if-deleted for a two-item scale', () => {
  const twoItems = {
    cols: [
      { name: 'X1', type: 'num' as const },
      { name: 'X2', type: 'num' as const },
    ],
    rows: Array.from({ length: 8 }, (_, i) => [String(i + 1), String(i + 2)]),
  };
  const result = buildMultivariateOutput({
    grid: twoItems,
    params: { ...base.params, mode: 'alpha', selected: [0, 1] },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(ids, ['alpha-items', 'alpha-correlations']);
  const items = (result.charts ?? []).find(chart => chart.id === 'alpha-items');
  assert.ok((items?.data.bars ?? []).every(row => Number.isFinite(Number(row.value))));
});

test('multivariate builder asks for two variables and complete rows', () => {
  const tooFew = buildMultivariateOutput({ ...base, params: { ...base.params, selected: [0] } });
  assert.ok('reason' in tooFew);
  if ('reason' in tooFew) assert.match(tooFew.reason, /at least two numeric/);

  const short = buildMultivariateOutput({ ...base, grid: { ...grid, rows: grid.rows.slice(0, 2) } });
  assert.ok('reason' in short);
  if ('reason' in short) assert.match(short.reason, /Not enough complete rows/);
});
