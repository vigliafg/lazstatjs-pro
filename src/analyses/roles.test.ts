import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PARAMS } from '../io/project';
import type { GridData } from '../grid/types';
import { analysisRoles, assignRole, roleStates, validateRoleTypes } from './roles';

const grid = (): GridData => ({
  cols: [
    { id: 'a', name: 'Score', type: 'dec' },
    { id: 'b', name: 'Group', type: 'cat' },
    { id: 'c', name: 'Age', type: 'int' },
  ],
  rows: [
    ['1', 'A', '20'],
    ['2', 'B', '30'],
    ['3', 'A', '40'],
  ],
});

test('roles are listed per analysis, primary first', () => {
  assert.equal(analysisRoles('samplesize').length, 0);
  assert.equal(analysisRoles('chisquare').length, 0);
  assert.equal(analysisRoles('contingency').length, 0);
  assert.equal(analysisRoles('anova')[0].key, 'dep');
  assert.equal(analysisRoles('ttest')[1].key, 'var2');
});

test('every role can be assigned from the focused column', () => {
  const anova = assignRole('anova', DEFAULT_PARAMS, 'grp', 1);
  assert.equal(anova?.anova.grp, 1);

  const ttest = assignRole('ttest', DEFAULT_PARAMS, 'var2', 2);
  assert.equal(ttest?.ttest.var2, 2);

  const reg = assignRole('regression', DEFAULT_PARAMS, 'indeps', 2);
  assert.ok(reg?.reg.indeps.includes(2));

  assert.equal(assignRole('anova', DEFAULT_PARAMS, 'missing', 1), null);
  assert.equal(assignRole('samplesize', DEFAULT_PARAMS, 'dep', 1), null);
});

test('role states expose the current columns', () => {
  const params = { ...DEFAULT_PARAMS, anova: { ...DEFAULT_PARAMS.anova, dep: 0, grp: 1 } };
  const states = roleStates('anova', params);
  assert.deepEqual(states.map(state => state.key), ['dep', 'grp']);
  assert.deepEqual(states[0].columns, [0]);
  assert.deepEqual(states[1].columns, [1]);
});

test('type/role validation blocks categorical continua and continuous groups', () => {
  const params = {
    ...DEFAULT_PARAMS,
    anova: { ...DEFAULT_PARAMS.anova, dep: 1, grp: 0 },
  };
  const errors = validateRoleTypes('anova', params, grid());
  assert.ok(errors.some(error => error.startsWith('ANOVA: dependent variable')));
  assert.ok(errors.some(error => error.startsWith('ANOVA: group variable')));

  const valid = {
    ...DEFAULT_PARAMS,
    anova: { ...DEFAULT_PARAMS.anova, dep: 0, grp: 1 },
  };
  assert.deepEqual(validateRoleTypes('anova', valid, grid()), []);
});

test('a categorical column stays invalid even when its codes are numeric', () => {
  const numericCat: GridData = {
    cols: [{ id: 'c', name: 'Code', type: 'cat' }],
    rows: [['1'], ['2'], ['1']],
  };
  const params = { ...DEFAULT_PARAMS, anova: { ...DEFAULT_PARAMS.anova, dep: 0 } };
  const errors = validateRoleTypes('anova', params, numericCat);
  assert.ok(errors.some(error => error.startsWith('ANOVA: dependent variable')));
});

test('type/role validation ignores roles outside the grid', () => {
  const params = { ...DEFAULT_PARAMS, anova: { ...DEFAULT_PARAMS.anova, dep: -1, grp: 99 } };
  assert.deepEqual(validateRoleTypes('anova', params, grid()), []);
});
