import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDistributionFitOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';

const grid = {
  cols: [{ name: 'X', type: 'num' as const }],
  rows: [['1'], ['2'], ['3'], ['4'], ['5']],
};

test('distribution-fit builder returns tables, a report and a probability plot', () => {
  const result = buildDistributionFitOutput({
    grid,
    params: DEFAULT_PARAMS.distfit,
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(ids, ['distfit-probability', 'distfit-pp', 'distfit-density', 'distfit-criteria']);
  const density = (result.charts ?? []).find(chart => chart.id === 'distfit-density');
  assert.ok((density?.data.series ?? []).length > 0);
  const criteria = (result.charts ?? []).find(chart => chart.id === 'distfit-criteria');
  assert.ok((criteria?.data.bars ?? []).length >= 2);
});

test('distribution-fit builder explains why a short variable cannot be fitted', () => {
  const result = buildDistributionFitOutput({
    grid: { cols: [{ name: 'X', type: 'num' }], rows: [['1'], ['2'], ['x']] },
    params: DEFAULT_PARAMS.distfit,
    ciLevel: 95,
  });
  assert.ok('reason' in result);
  if (!('reason' in result)) return;
  assert.match(result.reason, /at least three valid values/);
});

test('distribution-fit builder rejects an empty distribution selection', () => {
  const result = buildDistributionFitOutput({
    grid,
    params: { ...DEFAULT_PARAMS.distfit, selected: [] },
    ciLevel: 95,
  });
  assert.ok('reason' in result);
  if (!('reason' in result)) return;
  assert.match(result.reason, /at least one distribution/);
});
