import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAncovaOutput } from './run';

const grid = {
  cols: [
    { name: 'Y', type: 'num' as const },
    { name: 'G', type: 'cat' as const },
    { name: 'X', type: 'num' as const },
  ],
  rows: [
    ['10', 'A', '1'],
    ['12', 'A', '2'],
    ['11', 'A', '3'],
    ['14', 'A', '4'],
    ['13', 'A', '5'],
    ['20', 'B', '2'],
    ['22', 'B', '3'],
    ['21', 'B', '4'],
    ['24', 'B', '5'],
    ['23', 'B', '6'],
  ],
};

const base = {
  grid,
  params: { response: 0, factor: 1, covariates: [2] },
  ciLevel: 95,
};

test('ANCOVA builder returns tables, report and adjusted means', () => {
  const result = buildAncovaOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.some(spec => spec.id === 'ancova-means'));
  assert.ok(result.report);
});

test('ANCOVA builder validates response, factor and covariates', () => {
  const sameColumn = buildAncovaOutput({ ...base, params: { ...base.params, factor: 0 } });
  assert.ok('reason' in sameColumn);
  if ('reason' in sameColumn) assert.match(sameColumn.reason, /different from the factor/);

  const noCovariates = buildAncovaOutput({ ...base, params: { ...base.params, covariates: [] } });
  assert.ok('reason' in noCovariates);
  if ('reason' in noCovariates) assert.match(noCovariates.reason, /at least one numeric covariate/);

  const short = buildAncovaOutput({ ...base, grid: { ...grid, rows: grid.rows.slice(0, 2) } });
  assert.ok('reason' in short);
  if ('reason' in short) assert.match(short.reason, /Not enough complete rows/);
});
