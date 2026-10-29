import test from 'node:test';
import assert from 'node:assert/strict';
import { ANALYSIS_TABS } from '../registry';
import { HEAVY_ANALYSIS_IDS, isHeavyAnalysis } from './heavyIds';
import { HEAVY_RUNNERS } from './heavyRunners';

test('worker coverage matches the registry heavy procedures', () => {
  const heavy = ANALYSIS_TABS.filter(tab => tab.cost === 'heavy')
    .map(tab => tab.id)
    .sort();
  assert.deepEqual([...HEAVY_ANALYSIS_IDS].sort(), heavy);
  assert.deepEqual(Object.keys(HEAVY_RUNNERS).sort(), heavy);
});

test('only registry heavy ids take the worker path', () => {
  assert.equal(isHeavyAnalysis('lmm'), true);
  assert.equal(isHeavyAnalysis('ttest'), false);
  assert.equal(isHeavyAnalysis('unknown'), false);
});
