import test from 'node:test';
import assert from 'node:assert/strict';
import { ANALYSIS_RUNNERS } from './runners';
import { ANALYSIS_IDS } from './registry';

test('the pure-builder registry covers the six legacy analyses and the converted panels', () => {
  assert.deepEqual(Object.keys(ANALYSIS_RUNNERS).sort(), [
    'anova',
    'chisquare',
    'correlation',
    'cox',
    'descriptive',
    'distfit',
    'logistic',
    'regression',
    'samplesize',
    'ttest',
  ]);
});

test('every registered runner is a real analysis tab', () => {
  for (const id of Object.keys(ANALYSIS_RUNNERS)) {
    assert.ok(ANALYSIS_IDS.includes(id), `${id} is not in ANALYSIS_TABS`);
  }
});
