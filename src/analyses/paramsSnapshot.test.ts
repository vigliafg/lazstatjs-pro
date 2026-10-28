import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PARAMS } from '../io/project';
import {
  analysisParamsKey,
  analysisParamsOf,
  analysisParamsSignature,
  withAnalysisParams,
} from './paramsSnapshot';

test('each analysis maps to its own parameter slot', () => {
  assert.equal(analysisParamsKey('anova'), 'anova');
  assert.equal(analysisParamsKey('regression'), 'reg');
  assert.equal(analysisParamsKey('chisquare'), 'chisq');
  assert.equal(analysisParamsKey('descriptive'), 'descVars');
  assert.equal(analysisParamsKey('unknown'), undefined);
  assert.equal(analysisParamsOf('unknown', DEFAULT_PARAMS), undefined);
});

test('applying a saved snapshot leaves other analyses untouched', () => {
  const saved = { ...DEFAULT_PARAMS.anova, dep: 3, grp: 2 };
  const next = withAnalysisParams(DEFAULT_PARAMS, 'anova', saved);
  assert.deepEqual(next.anova, saved);
  assert.equal(next.reg, DEFAULT_PARAMS.reg);
  assert.equal(next.ttest, DEFAULT_PARAMS.ttest);
});

test('the signature changes only when that analysis changes', () => {
  const base = analysisParamsSignature('anova', DEFAULT_PARAMS);

  const other = { ...DEFAULT_PARAMS, reg: { ...DEFAULT_PARAMS.reg, dep: 3 } };
  assert.equal(analysisParamsSignature('anova', other), base);

  const changed = {
    ...DEFAULT_PARAMS,
    anova: { ...DEFAULT_PARAMS.anova, dep: 3 },
  };
  assert.notEqual(analysisParamsSignature('anova', changed), base);
});
