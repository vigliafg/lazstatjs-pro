import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PARAMS } from './project';
import { buildAnalysisCode } from './codeExport';
import type { GridData } from '../grid/types';

const grid: GridData = {
  cols: [
    { name: 'Score', type: 'num' },
    { name: 'Group', type: 'cat' },
    { name: 'Age', type: 'num' },
  ],
  rows: [],
};

test('builds R and Python code for a t-test', () => {
  const params = {
    ...DEFAULT_PARAMS,
    ttest: { ...DEFAULT_PARAMS.ttest, type: 'ind' as const, var1: 0, var2: 2 },
  };
  const r = buildAnalysisCode('ttest', grid, params, 95, 'r');
  assert.match(r ?? '', /t\.test/);
  assert.match(r ?? '', /Score/);
  const py = buildAnalysisCode('ttest', grid, params, 95, 'python');
  assert.match(py ?? '', /ttest_ind/);
});

test('returns null for analyses without a supported snippet', () => {
  assert.equal(buildAnalysisCode('cox', grid, DEFAULT_PARAMS, 95, 'r'), null);
});
