import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRegressionOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'X', type: 'num' },
  { name: 'Y', type: 'num' },
  { name: 'Z', type: 'num' },
];

const quadRows: string[][] = Array.from({ length: 14 }, (_, index) => {
  const x = index - 6;
  const y = 1 + 2 * x + 3 * x * x + 0.1 * Math.sin(index);
  return [String(x), String(y), String((index * 7) % 5)];
});

test('polynomial mode recovers the raw quadratic coefficients', () => {
  const result = buildRegressionOutput({
    grid: { cols, rows: quadRows },
    regParams: {
      ...DEFAULT_PARAMS.reg,
      mode: 'polynomial',
      dep: 1,
      indeps: [0],
      degree: 2,
    },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;

  const coefficients = result.tables?.find(table => table.id === 'polynomial-coefficients')?.rows ?? [];
  assert.equal(coefficients.length, 3);
  assert.ok(Math.abs(Number(coefficients[0].b) - 1) < 0.05);
  assert.ok(Math.abs(Number(coefficients[1].b) - 2) < 0.05);
  assert.ok(Math.abs(Number(coefficients[2].b) - 3) < 0.01);
  assert.deepEqual(result.charts?.map(chart => chart.id), ['polynomial-curve', 'polynomial-residuals']);
  assert.equal(result.report?.id, 'report-polynomial');
});

test('polynomial mode validates degree and sample size', () => {
  const invalid = buildRegressionOutput({
    grid: { cols, rows: quadRows.slice(0, 4) },
    regParams: { ...DEFAULT_PARAMS.reg, mode: 'polynomial', dep: 1, indeps: [0], degree: 3 },
    ciLevel: 95,
  });
  assert.ok('reason' in invalid);

  const sameVariable = buildRegressionOutput({
    grid: { cols, rows: quadRows },
    regParams: { ...DEFAULT_PARAMS.reg, mode: 'polynomial', dep: 1, indeps: [1], degree: 2 },
    ciLevel: 95,
  });
  assert.ok('reason' in sameVariable);
});

const selectionRows: string[][] = Array.from({ length: 30 }, (_, index) => {
  const x = index;
  const y = 4 + 1.5 * x + 0.3 * Math.sin(index * 1.7);
  return [String(x), String(y), String((index * 13) % 17), String((index * 7) % 11)];
});

test('selection mode reports subsets, path and final model', () => {
  const result = buildRegressionOutput({
    grid: { cols: [...cols, { name: 'W', type: 'num' }], rows: selectionRows },
    regParams: {
      ...DEFAULT_PARAMS.reg,
      mode: 'selection',
      dep: 1,
      indeps: [0, 2, 3],
      selectionDirection: 'both',
      selectionCriterion: 'bic',
    },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;

  const ids = (result.tables ?? []).map(table => table.id);
  assert.deepEqual(ids, ['selection-subsets', 'selection-steps', 'selection-model']);
  const final = result.tables!.find(table => table.id === 'selection-model')!;
  assert.ok(final.rows.some(row => String(row.predictor) === 'X'));
  assert.equal(result.charts?.[0].id, 'selection-criterion');
  assert.equal(result.report?.id, 'report-selection');
});

test('penalized mode emits coefficients, fit and the path', () => {
  const result = buildRegressionOutput({
    grid: { cols: [...cols, { name: 'W', type: 'num' }], rows: selectionRows },
    regParams: {
      ...DEFAULT_PARAMS.reg,
      mode: 'penalized',
      dep: 1,
      indeps: [0, 2, 3],
      penalty: 'lasso',
      lambda: 0.5,
    },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const ids = (result.tables ?? []).map(table => table.id);
  assert.deepEqual(ids, ['penalized-coefficients', 'penalized-fit']);
  assert.deepEqual(result.charts?.map(chart => chart.id), ['penalized-path', 'penalized-coefficients-chart']);
  assert.equal(result.report?.id, 'report-penalized');
});

test('selection mode rejects a dependent variable used as a predictor', () => {
  const result = buildRegressionOutput({
    grid: { cols: [...cols, { name: 'W', type: 'num' }], rows: selectionRows },
    regParams: { ...DEFAULT_PARAMS.reg, mode: 'selection', dep: 1, indeps: [1, 0] },
    ciLevel: 95,
  });
  assert.ok('reason' in result);
});
