import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChiSquareOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [{ name: 'Category', type: 'cat' }];

const rows: string[][] = [
  ...Array.from({ length: 30 }, () => ['A']),
  ...Array.from({ length: 20 }, () => ['B']),
  ...Array.from({ length: 25 }, () => ['C']),
  ...Array.from({ length: 15 }, () => ['D']),
  ...Array.from({ length: 10 }, () => ['E']),
];

const grid: GridData = { cols, rows };

test('the GOF mode counts a categorical column and matches chisq.test', () => {
  const result = buildChiSquareOutput({
    grid,
    chisqParams: { ...DEFAULT_PARAMS.chisq, mode: 'gof', gofVariable: 0, gofExpected: '' },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.tables?.map(table => table.id), ['gof', 'gof-test']);
  const testRow = result.tables![1].rows[0];
  assert.ok(Math.abs(Number(testRow.chi2) - 12.5) < 1e-9);
  assert.equal(result.charts?.[0].kind, 'bar');
  const contributions = result.charts?.find(chart => chart.id === 'gof-contribution');
  assert.ok(contributions);
  assert.equal(contributions.kind, 'pareto');
  const bars = contributions.data.bars ?? [];
  assert.equal(bars.length, 5);
  assert.ok(Math.abs(bars.reduce((sum, row) => sum + Number(row.value), 0) - 12.5) < 1e-9);
  assert.ok(Number(bars[0].value) >= Number(bars[1].value));
});

test('the GOF mode accepts custom expected proportions', () => {
  const result = buildChiSquareOutput({
    grid,
    chisqParams: {
      ...DEFAULT_PARAMS.chisq,
      mode: 'gof',
      gofVariable: 0,
      gofExpected: '0.2, 0.2, 0.3, 0.2, 0.1',
    },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const testRow = result.tables![1].rows[0];
  assert.ok(Math.abs(Number(testRow.chi2) - 7.083333333333333) < 1e-9);
});

test('the GOF mode rejects a single category', () => {
  const result = buildChiSquareOutput({
    grid: { cols, rows: [['A'], ['A'], ['A']] },
    chisqParams: { ...DEFAULT_PARAMS.chisq, mode: 'gof', gofVariable: 0 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && !result.ok);
});
