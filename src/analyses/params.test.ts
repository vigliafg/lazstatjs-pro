import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PARAMS } from '../io/project';
import {
  defaultParamsForGrid,
  remapParams,
  remapParamsByColumns,
  setPrimaryColumn,
  validateColumnRefs,
} from './params';

test('remap keeps shifts silent and reports only invalidated roles', () => {
  const inserted = remapParams(DEFAULT_PARAMS, { kind: 'insert', at: 0, count: 1 });
  assert.equal(inserted.params.anova.dep, DEFAULT_PARAMS.anova.dep + 1);
  assert.equal(inserted.params.anova.grp, DEFAULT_PARAMS.anova.grp + 1);
  assert.deepEqual(inserted.invalidated, []);

  const deleted = remapParams(DEFAULT_PARAMS, { kind: 'delete', at: 0, count: 1 });
  assert.equal(deleted.params.anova.dep, -1);
  assert.ok(deleted.invalidated.includes('ANOVA: dependent variable'));
});

test('split and merge invalidate the transformed variables', () => {
  const split = remapParams(DEFAULT_PARAMS, { kind: 'split', at: 0 });
  assert.equal(split.params.anova.dep, -1);
  assert.ok(split.invalidated.some(label => label.startsWith('ANOVA')));

  const merge = remapParams(DEFAULT_PARAMS, { kind: 'merge', a: 0, b: 1 });
  assert.equal(merge.params.anova.dep, -1);
  assert.equal(merge.params.anova.grp, 1);
  assert.ok(merge.invalidated.length > 0);
});

test('split all shifts downstream roles by the number of inserted columns', () => {
  const splitAll = remapParams(DEFAULT_PARAMS, { kind: 'split', at: 0, count: 3 });
  // The source column is invalidated; roles on later columns move by 3.
  assert.equal(splitAll.params.anova.dep, -1);
  assert.equal(splitAll.params.anova.grp, DEFAULT_PARAMS.anova.grp + 3);
});

test('optional roles become -1 without being reported as errors', () => {
  const params = {
    ...DEFAULT_PARAMS,
    survival: { ...DEFAULT_PARAMS.survival, groupVariable: 3 },
  };
  const result = remapParams(params, { kind: 'delete', at: 3, count: 1 });
  assert.equal(result.params.survival.groupVariable, -1);
  assert.ok(!result.invalidated.some(label => label === 'Survival: group'));
});

test('reset produces a fresh parameter set for the new width', () => {
  const reset = remapParams(DEFAULT_PARAMS, { kind: 'reset' });
  assert.equal(reset.params.anova.dep, -1);
  assert.equal(reset.params.descVars.length, 0);

  const fresh = defaultParamsForGrid(2);
  assert.ok(fresh.anova.dep < 2);
  assert.ok(fresh.anova.grp < 2);
  assert.deepEqual(validateColumnRefs(fresh, 2), []);
});

test('validateColumnRefs catches missing and out-of-range roles', () => {
  const broken = {
    ...DEFAULT_PARAMS,
    anova: { ...DEFAULT_PARAMS.anova, dep: -1, grp: 99 },
  };
  const errors = validateColumnRefs(broken, 4);
  assert.ok(errors.includes('ANOVA: dependent variable'));
  assert.ok(errors.includes('ANOVA: group variable'));
  assert.deepEqual(validateColumnRefs(DEFAULT_PARAMS, 4), []);
});


test('undo/redo can remap by stable column ids', () => {
  const a = { id: 'a', name: 'A', type: 'num' as const };
  const b = { id: 'b', name: 'B', type: 'int' as const };
  const c = { id: 'c', name: 'C', type: 'int' as const };
  const d = { id: 'd', name: 'D', type: 'int' as const };
  const params = {
    ...DEFAULT_PARAMS,
    anova: { ...DEFAULT_PARAMS.anova, dep: 0, grp: 1 },
  };
  const reordered = remapParamsByColumns(params, [a, b, c, d], [b, a, c, d]);
  assert.equal(reordered.params.anova.dep, 1);
  assert.equal(reordered.params.anova.grp, 0);
  assert.deepEqual(reordered.invalidated, []);

  const removed = remapParamsByColumns(params, [a, b, c, d], [b, c, d]);
  assert.equal(removed.params.anova.dep, -1);
  assert.ok(removed.invalidated.includes('ANOVA: dependent variable'));
});


test('setPrimaryColumn targets the main role of each procedure', () => {
  const anova = setPrimaryColumn('anova', DEFAULT_PARAMS, 1);
  assert.equal(anova?.params.anova.dep, 1);
  assert.match(anova?.role ?? '', /ANOVA/);

  const repeated = setPrimaryColumn('repeatedanova', DEFAULT_PARAMS, 2);
  assert.ok(repeated?.params.repeatedanova.selected.includes(2));

  assert.equal(setPrimaryColumn('samplesize', DEFAULT_PARAMS, 0), null);
});
