import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWizardOutput } from './run';
import { defaultWizardParams } from './defaults';

const grid = {
  cols: [
    { name: 'Score', type: 'num' as const },
    { name: 'Group', type: 'cat' as const },
    { name: 'Age', type: 'num' as const },
  ],
  rows: [
    ['10', 'A', '20'],
    ['12', 'A', '21'],
    ['11', 'A', '22'],
    ['20', 'B', '23'],
    ['22', 'B', '24'],
    ['21', 'B', '25'],
  ],
};

test('wizard defaults pick a numeric outcome and a group', () => {
  const params = defaultWizardParams(grid);
  assert.equal(params.goal, 'compare');
  assert.equal(params.outcome, 0);
  assert.equal(params.group, 1);
  assert.equal(params.second, 2);
});

test('wizard builder returns the recommendation, tables and report', () => {
  const result = buildWizardOutput({
    grid,
    params: defaultWizardParams(grid),
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
});

test('wizard builder honours the selected goal', () => {
  const params = { ...defaultWizardParams(grid), goal: 'describe' as const, outcome: 0 };
  const result = buildWizardOutput({ grid, params, ciLevel: 95 });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
});
