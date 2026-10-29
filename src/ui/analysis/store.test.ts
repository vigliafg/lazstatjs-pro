import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PARAMS } from '../../io/project';
import { applyAnalysisAction } from './store';

test('the reducer updates only the addressed slice', () => {
  const next = applyAnalysisAction(DEFAULT_PARAMS, {
    type: 'slice',
    key: 'anova',
    updater: previous => ({ ...(previous as typeof DEFAULT_PARAMS.anova), dep: 3 }),
  });
  assert.equal(next.anova.dep, 3);
  assert.equal(next.reg, DEFAULT_PARAMS.reg);
  assert.equal(next.corr, DEFAULT_PARAMS.corr);
});

test('a no-op updater keeps the same params object', () => {
  const next = applyAnalysisAction(DEFAULT_PARAMS, {
    type: 'slice',
    key: 'ttest',
    updater: previous => previous,
  });
  assert.equal(next, DEFAULT_PARAMS);
});

test('replace swaps the whole parameter object', () => {
  const replacement = { ...DEFAULT_PARAMS, anova: { ...DEFAULT_PARAMS.anova, grp: 1 } };
  assert.equal(
    applyAnalysisAction(DEFAULT_PARAMS, { type: 'replace', params: replacement }),
    replacement
  );
});
