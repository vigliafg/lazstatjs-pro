import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFactorialOutput } from './run';

const grid = {
  cols: [
    { name: 'Y', type: 'num' as const },
    { name: 'A', type: 'cat' as const },
    { name: 'B', type: 'cat' as const },
  ],
  rows: [
    ['10', 'A1', 'B1'],
    ['11', 'A1', 'B1'],
    ['12', 'A1', 'B2'],
    ['13', 'A1', 'B2'],
    ['20', 'A2', 'B1'],
    ['21', 'A2', 'B1'],
    ['22', 'A2', 'B2'],
    ['23', 'A2', 'B2'],
  ],
};

const base = {
  grid,
  params: { response: 0, factorA: 1, factorB: 2, interaction: true },
  ciLevel: 95,
};

test('factorial builder returns tables, report and the interaction plot', () => {
  const result = buildFactorialOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
});

test('factorial builder validates factors, response and rows', () => {
  const sameFactor = buildFactorialOutput({ ...base, params: { ...base.params, factorB: 1 } });
  assert.ok('reason' in sameFactor);
  if ('reason' in sameFactor) assert.match(sameFactor.reason, /two different factors/);

  const responseAsFactor = buildFactorialOutput({ ...base, params: { ...base.params, factorA: 0 } });
  assert.ok('reason' in responseAsFactor);
  if ('reason' in responseAsFactor) assert.match(responseAsFactor.reason, /different from the two factors/);

  const short = buildFactorialOutput({ ...base, grid: { ...grid, rows: grid.rows.slice(0, 2) } });
  assert.ok('reason' in short);
  if ('reason' in short) assert.match(short.reason, /Not enough valid rows/);
});
