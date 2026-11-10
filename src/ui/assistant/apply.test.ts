import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_PARAMS } from '../../io/project';
import type { GridData } from '../../grid/types';
import { applyAssistantLeaf } from './apply';
import { assistantLeaf } from './tree';

const grid = (): GridData => ({
  cols: [
    { id: 'c1', name: 'Score_Pre', type: 'num' },
    { id: 'c2', name: 'Score_Post', type: 'num' },
    { id: 'c3', name: 'Group', type: 'cat' },
    { id: 'c4', name: 'Age', type: 'num' },
  ],
  rows: [],
});

const emptyParams = () => ({
  ...DEFAULT_PARAMS,
  descVars: [],
  ttest: { ...DEFAULT_PARAMS.ttest, var1: -1, var2: -1 },
  anova: { ...DEFAULT_PARAMS.anova, dep: -1, grp: -1 },
});

test('the independent t-test leaf fills both variables and presets the design', () => {
  const leaf = assistantLeaf('ttest-ind');
  assert.ok(leaf);
  const result = applyAssistantLeaf(leaf, emptyParams(), grid());
  assert.equal(result.params.ttest.type, 'ind');
  assert.equal(result.params.ttest.var1, 0);
  assert.equal(result.params.ttest.var2, 1);
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.problems, []);
});

test('the paired leaf keeps the same columns but changes the design', () => {
  const leaf = assistantLeaf('ttest-paired');
  assert.ok(leaf);
  const result = applyAssistantLeaf(leaf, emptyParams(), grid());
  assert.equal(result.params.ttest.type, 'dep');
  assert.equal(result.params.ttest.var2, 1);
});

test('ANOVA takes the outcome before the grouping column', () => {
  const leaf = assistantLeaf('anova');
  assert.ok(leaf);
  const result = applyAssistantLeaf(leaf, emptyParams(), grid());
  assert.equal(result.params.anova.dep, 0);
  assert.equal(result.params.anova.grp, 2);
  assert.equal(result.params.anova.mode, 'oneway');
});

test('descriptive prefills every role it knows without resetting other options', () => {
  const leaf = assistantLeaf('descriptive');
  assert.ok(leaf);
  const base = { ...emptyParams(), descVars: [3] };
  const result = applyAssistantLeaf(leaf, base, grid());
  assert.deepEqual(result.params.descVars, [3, 0]);
  assert.equal(result.assignments[0]?.column, 3);
});

test('a grid without usable columns leaves the roles empty and reports them', () => {
  const leaf = assistantLeaf('ttest-ind');
  assert.ok(leaf);
  const noData: GridData = { cols: [{ id: 'id', name: 'ID', type: 'id' }], rows: [] };
  const result = applyAssistantLeaf(leaf, emptyParams(), noData);
  assert.equal(result.missing.length, 2);
  assert.deepEqual(result.problems, []);
});

test('an optional role stays empty without being reported as missing', () => {
  const leaf = assistantLeaf('distfit');
  assert.ok(leaf);
  const numericOnly: GridData = {
    cols: [
      { id: 'c1', name: 'Score', type: 'num' },
      { id: 'c4', name: 'Age', type: 'num' },
    ],
    rows: [],
  };
  const result = applyAssistantLeaf(leaf, emptyParams(), numericOnly);
  assert.equal(result.assignments.find(item => item.roleKey === 'group')?.column, null);
  assert.deepEqual(result.missing, []);
});
