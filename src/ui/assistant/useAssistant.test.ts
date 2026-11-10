import assert from 'node:assert/strict';
import test from 'node:test';
import {
  defaultAssistantOpen,
  parseAssistantState,
  truncatePath,
} from './useAssistant';

test('migrates the v1 single path to the analysis domain', () => {
  const state = parseAssistantState(
    null,
    JSON.stringify({ open: false, width: 9999, answers: ['compare', 'means'] })
  );
  assert.equal(state.width, 520);
  assert.deepEqual(state.open, { data: false });
  assert.deepEqual(state.paths, { data: [], analysis: ['compare', 'means'] });
});

test('reads independent v2 paths and open flags', () => {
  const state = parseAssistantState(
    JSON.stringify({
      open: { data: true, analysis: false },
      width: 336,
      paths: { data: ['check'], analysis: ['compare', 'means'] },
    }),
    null
  );
  assert.equal(state.width, 336);
  assert.deepEqual(state.open, { data: true, analysis: false });
  assert.deepEqual(state.paths, { data: ['check'], analysis: ['compare', 'means'] });
});

test('invalid or missing storage falls back to empty state', () => {
  assert.deepEqual(parseAssistantState('not json', 'not json'), {
    open: {},
    paths: { data: [], analysis: [] },
    chains: [],
  });
});

test('reads a stored chain and drops invalid steps', () => {
  const state = parseAssistantState(
    JSON.stringify({
      paths: { data: [], analysis: [] },
      chains: [
        { id: 's1', leafId: 'descriptive', params: {} },
        { id: 's2', leafId: 'not-a-leaf', params: {} },
      ],
    }),
    null
  );
  assert.deepEqual(state.chains.map(step => step.id), ['s1']);
});

test('analysis starts collapsed only on a narrow viewport', () => {
  assert.equal(defaultAssistantOpen('analysis', 'guided', true), false);
  assert.equal(defaultAssistantOpen('analysis', 'guided', false), true);
  assert.equal(defaultAssistantOpen('analysis', 'expert', false), false);
  assert.equal(defaultAssistantOpen('data', 'guided', true), true);
});

test('clicking an answered node truncates the path', () => {
  assert.deepEqual(truncatePath(['compare', 'means', 'independent'], 1), ['compare']);
  assert.deepEqual(truncatePath(['compare'], 0), []);
  assert.deepEqual(truncatePath(['compare'], 9), ['compare']);
});
