import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PARAMS } from '../../io/project';
import { presetsFor } from './presets';

test('applies the Welch and pooled t-test presets without touching other slices', () => {
  const welch = presetsFor('ttest').find(preset => preset.id === 'welch');
  assert.ok(welch);
  const next = welch.apply(DEFAULT_PARAMS);
  assert.equal(next.ttest.type, 'ind');
  assert.equal(next.ttest.equalVar, false);
  assert.equal(next.anova, DEFAULT_PARAMS.anova);
});

test('offers presets only where a meaningful shortcut exists', () => {
  assert.ok(presetsFor('regression').length > 0);
  assert.deepEqual(presetsFor('cox'), []);
});
