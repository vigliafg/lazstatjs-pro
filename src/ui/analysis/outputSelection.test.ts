import test from 'node:test';
import assert from 'node:assert/strict';
import { analysisIdsOf, isValidFilter, selectOutputs } from './outputSelection';

const outputs = [
  { id: 'a1', analysisId: 'anova' },
  { id: 't1', analysisId: 'ttest' },
  { id: 'a2', analysisId: 'anova' },
  { id: 'legacy' },
];

test('lists analyses in first-seen order without duplicates', () => {
  assert.deepEqual(analysisIdsOf(outputs), ['anova', 'ttest']);
});

test('accepts all and present analyses only', () => {
  assert.equal(isValidFilter('all', ['anova']), true);
  assert.equal(isValidFilter('anova', ['anova']), true);
  assert.equal(isValidFilter('logistic', ['anova']), false);
});

test('keeps the original index of each visible card', () => {
  assert.deepEqual(
    selectOutputs(outputs, 'anova').map(item => item.index),
    [0, 2]
  );
  assert.deepEqual(
    selectOutputs(outputs, 'all').map(item => item.output.id),
    ['a1', 't1', 'a2', 'legacy']
  );
});
