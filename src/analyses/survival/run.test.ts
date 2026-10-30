import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSurvivalOutput } from './run';

const grid = {
  cols: [
    { name: 'T', type: 'num' as const },
    { name: 'E', type: 'int' as const },
  ],
  rows: [
    ['1', '1'],
    ['2', '0'],
    ['3', '1'],
    ['4', '0'],
    ['5', '1'],
    ['6', '0'],
  ],
};

const base = {
  grid,
  params: { timeVariable: 0, eventVariable: 1, groupVariable: -1 },
  ciLevel: 95,
};

test('survival builder returns tables, report and Kaplan–Meier curves', () => {
  const result = buildSurvivalOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
  assert.ok(result.tables.some(spec => spec.id === 'surv-km'));
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(ids, ['survival-km', 'survival-rmst', 'survival-risk']);
  const risk = (result.charts ?? []).find(chart => chart.id === 'survival-risk');
  assert.equal(risk?.kind, 'risk');
  assert.ok((risk?.data.rows ?? []).length >= 5);
  assert.ok((risk?.data.rows ?? []).every(row => Number(row.atRisk) >= 0));
});

test('survival builder validates the column choice and the event column', () => {
  const sameColumn = buildSurvivalOutput({ ...base, params: { ...base.params, eventVariable: 0 } });
  assert.ok('reason' in sameColumn);
  if ('reason' in sameColumn) assert.match(sameColumn.reason, /different columns/);

  const nonBinary = buildSurvivalOutput({
    ...base,
    grid: {
      ...grid,
      rows: [['1', '0'], ['2', '1'], ['3', '2'], ['4', '3']],
    },
  });
  assert.ok('reason' in nonBinary);
  if ('reason' in nonBinary) assert.match(nonBinary.reason, /exactly two values/);

  const negativeTime = buildSurvivalOutput({
    ...base,
    grid: {
      ...grid,
      rows: [['-1', '1'], ['-2', '0'], ['-3', '1']],
    },
  });
  assert.ok('reason' in negativeTime);
  if ('reason' in negativeTime) assert.match(negativeTime.reason, /non-negative/);
});
