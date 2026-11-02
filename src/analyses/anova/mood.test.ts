import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAnovaOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'Score', type: 'num' },
  { name: 'Group', type: 'cat' },
];

const rows: string[][] = [
  ...[5.1, 4.8, 5.5, 4.9, 5.2, 5.0].map(value => [String(value), 'A']),
  ...[5.4, 5.9, 5.1, 5.6, 5.3, 5.7].map(value => [String(value), 'B']),
  ...[4.2, 4.5, 3.9, 4.4, 4.1, 4.3].map(value => [String(value), 'C']),
];

const grid: GridData = { cols, rows };

test('the median mode runs the Mood test and emits the box plot', () => {
  const result = buildAnovaOutput({
    grid,
    anovaParams: { ...DEFAULT_PARAMS.anova, mode: 'median', dep: 0, grp: 1 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.tables?.map(table => table.id), ['mood-counts', 'mood-test']);
  const testRow = result.tables![1].rows[0];
  assert.ok(Math.abs(Number(testRow.chi2) - 11.333333333333334) < 1e-9);
  assert.equal(result.charts?.[0].kind, 'box');
});

test('the median mode rejects a degenerate split', () => {
  const result = buildAnovaOutput({
    grid: { cols, rows: [['1', 'A'], ['1', 'B'], ['1', 'A'], ['1', 'B']] },
    anovaParams: { ...DEFAULT_PARAMS.anova, mode: 'median', dep: 0, grp: 1 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && !result.ok);
});
