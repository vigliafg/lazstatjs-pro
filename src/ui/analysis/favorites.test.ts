import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFavorites } from './favorites';

test('favorites keep known ids once and in order', () => {
  assert.deepEqual(parseFavorites('["anova","ttest","anova","nope",3]', ['anova', 'ttest']), [
    'anova',
    'ttest',
  ]);
});

test('favorites tolerate missing or invalid storage', () => {
  assert.deepEqual(parseFavorites(null, ['anova']), []);
  assert.deepEqual(parseFavorites('not-json', ['anova']), []);
  assert.deepEqual(parseFavorites('{"a":1}', ['anova']), []);
});
