import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRepeatedAnovaOutput } from './run';

const grid = {
  cols: [
    { name: 'C1', type: 'num' as const },
    { name: 'C2', type: 'num' as const },
    { name: 'C3', type: 'num' as const },
  ],
  rows: [
    ['10', '12', '14'],
    ['11', '13', '15'],
    ['9', '11', '13'],
    ['10', '12', '14'],
    ['11', '13', '15'],
    ['8', '10', '12'],
  ],
};

const base = {
  grid,
  params: { selected: [0, 1, 2] },
  ciLevel: 95,
};

test('repeated-ANOVA builder returns tables, report and condition means', () => {
  const result = buildRepeatedAnovaOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
});

test('repeated-ANOVA builder asks for three conditions and complete rows', () => {
  const tooFew = buildRepeatedAnovaOutput({ ...base, params: { selected: [0, 1] } });
  assert.ok('reason' in tooFew);
  if ('reason' in tooFew) assert.match(tooFew.reason, /at least three numeric columns/);

  const short = buildRepeatedAnovaOutput({ ...base, grid: { ...grid, rows: grid.rows.slice(0, 2) } });
  assert.ok('reason' in short);
  if ('reason' in short) assert.match(short.reason, /Not enough complete rows/);
});
