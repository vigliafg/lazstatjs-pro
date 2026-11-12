import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analysisSchema,
  buildParams,
  catalogEntries,
  CHART_KIND_COUNT,
  loadDataset,
  paramsForAnalysis,
  runAnalysis,
  RUNNER_COUNT,
} from './index';

test('engine exposes 72 runners and 32 chart kinds', () => {
  assert.equal(RUNNER_COUNT, 72);
  assert.equal(CHART_KIND_COUNT, 32);
  assert.equal(catalogEntries().length, 71);
  assert.equal(catalogEntries(true).length, 72);
  assert.equal(catalogEntries().some(entry => entry.id === 'assistant'), false);
  assert.equal(catalogEntries(true).some(entry => entry.id === 'wizard'), true);
});

test('regression schema points at the reg parameter slice', () => {
  const schema = analysisSchema('regression');
  assert.ok(schema);
  assert.equal(schema.id, 'regression');
  assert.equal(schema.paramsKey, 'reg');
  assert.ok(schema.roles.length > 0);
  assert.equal(schema.defaultParams !== undefined, true);
});

test('--set resolves dotted and underscored column names', async () => {
  const loaded = await loadDataset('samples/descriptive/iris/data.csv');
  assert.equal(loaded.grid.rows.length, 150);
  assert.equal(loaded.grid.cols.length, 5);
  const params = buildParams({
    analysisId: 'descriptive',
    set: ['descVars=Sepal.Length,Sepal.Width'],
    width: loaded.grid.cols.length,
    grid: loaded.grid,
  });
  assert.deepEqual(params.descVars, [0, 1]);
  assert.deepEqual(paramsForAnalysis('descriptive', params), {
    descVars: [0, 1],
    descMode: 'summary',
  });
});

test('descriptive runs through the shared engine', async () => {
  const loaded = await loadDataset('samples/descriptive/iris/data.csv');
  const params = buildParams({
    analysisId: 'descriptive',
    set: ['descVars=Sepal.Length,Sepal.Width'],
    width: loaded.grid.cols.length,
    grid: loaded.grid,
  });
  const result = runAnalysis({
    analysisId: 'descriptive',
    grid: loaded.grid,
    params,
    ciLevel: 95,
  });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.tables.length, 4);
});
