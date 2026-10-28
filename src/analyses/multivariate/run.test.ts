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
  params: { mode: 'pca' as const, standardize: true, selected: [0, 1, 2] },
  ciLevel: 95,
};

test('multivariate builder returns PCA tables, report and a scree plot', () => {
  const result = buildMultivariateOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
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
});

test('multivariate builder asks for two variables and complete rows', () => {
  const tooFew = buildMultivariateOutput({ ...base, params: { ...base.params, selected: [0] } });
  assert.ok('reason' in tooFew);
  if ('reason' in tooFew) assert.match(tooFew.reason, /at least two numeric/);

  const short = buildMultivariateOutput({ ...base, grid: { ...grid, rows: grid.rows.slice(0, 2) } });
  assert.ok('reason' in short);
  if ('reason' in short) assert.match(short.reason, /Not enough complete rows/);
});
