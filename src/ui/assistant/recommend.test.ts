import assert from 'node:assert/strict';
import test from 'node:test';
import { createDefaultGrid } from '../../grid/defaults';
import type { WizardGoal } from '../../stats/wizard/types';
import { goalForAnswers, recommendLeafForGrid } from './recommend';
import { assistantLeaf } from './tree';

const GOALS: WizardGoal[] = [
  'describe',
  'compare',
  'associate',
  'predict',
  'survive',
  'forecast',
  'plan',
];

test('every kernel goal maps to a real leaf or an explicit message', () => {
  const grid = createDefaultGrid();
  for (const goal of GOALS) {
    const recommendation = recommendLeafForGrid(grid, goal);
    if (recommendation.leafId) {
      assert.ok(assistantLeaf(recommendation.leafId), goal);
      assert.equal(recommendation.message, null, goal);
    } else {
      assert.equal(recommendation.message, 'assistant.recommend.none', goal);
    }
  }
});

test('the goal comes from the root answer of the path', () => {
  assert.equal(goalForAnswers([]), 'compare');
  assert.equal(goalForAnswers(['compare', 'means']), 'compare');
  assert.equal(goalForAnswers(['describe', 'summary']), 'describe');
  assert.equal(goalForAnswers(['associate', 'numeric']), 'associate');
  assert.equal(goalForAnswers(['predict', 'binary']), 'predict');
  assert.equal(goalForAnswers(['time', 'survival']), 'survive');
  assert.equal(goalForAnswers(['time', 'series']), 'forecast');
  assert.equal(goalForAnswers(['plan']), 'plan');
  assert.equal(goalForAnswers(['missing']), 'describe');
});

test('an empty grid returns the explicit empty-data message', () => {
  assert.deepEqual(recommendLeafForGrid({ cols: [], rows: [] }, 'compare'), {
    leafId: null,
    message: 'assistant.recommend.empty',
  });
});
