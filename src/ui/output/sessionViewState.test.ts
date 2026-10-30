import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_SESSION_VIEW_DATASETS,
  parseSessionView,
  parseSessionViewStore,
  pruneSessionView,
  serializeSessionViewStore,
  sessionViewFor,
  withSessionView,
} from './sessionViewState';

const view = (overrides: Partial<ReturnType<typeof parseSessionView>> = {}) => ({
  ...parseSessionView({}),
  ...overrides,
});

test('invalid or legacy storage falls back to a clean view', () => {
  assert.deepEqual(parseSessionViewStore(null).datasets, {});
  assert.deepEqual(parseSessionViewStore('not json').datasets, {});
  assert.deepEqual(parseSessionViewStore(JSON.stringify({ version: 0, datasets: {} })).datasets, {});
  assert.deepEqual(parseSessionView('nope'), view());
});

test('validates ids, filters and the outline filter', () => {
  const parsed = parseSessionView({
    pinned: ['a', '', 3, 'x'.repeat(200)],
    collapsedFamilies: ['compare'],
    collapsedAnalyses: ['compare:anova'],
    filterId: 'anova',
    outlineFilter: 'stale',
  });
  assert.deepEqual(parsed.pinned, ['a']);
  assert.deepEqual(parsed.collapsedFamilies, ['compare']);
  assert.equal(parsed.filterId, 'anova');
  assert.equal(parsed.outlineFilter, 'stale');
  assert.equal(parseSessionView({ outlineFilter: 'unknown' }).outlineFilter, 'all');
  assert.equal(parseSessionView({ filterId: '' }).filterId, 'all');
});

test('round-trips a store and selects the state per dataset', () => {
  const store = withSessionView(
    parseSessionViewStore(null),
    'dataset-a',
    view({ pinned: ['run-1'], filterId: 'anova', outlineFilter: 'pinned' })
  );
  const restored = parseSessionViewStore(serializeSessionViewStore(store));
  const selected = sessionViewFor(restored, 'dataset-a');
  assert.deepEqual(selected.pinned, ['run-1']);
  assert.equal(selected.filterId, 'anova');
  assert.equal(selected.outlineFilter, 'pinned');
  assert.deepEqual(sessionViewFor(restored, 'dataset-b'), view());
});

test('keeps only the most recent datasets and moves a rewrite to the front', () => {
  let store = parseSessionViewStore(null);
  for (let index = 0; index < MAX_SESSION_VIEW_DATASETS + 2; index += 1) {
    store = withSessionView(store, `dataset-${index}`, view({ pinned: [`run-${index}`] }));
  }
  assert.equal(store.order.length, MAX_SESSION_VIEW_DATASETS);
  assert.equal(store.order[0], `dataset-${MAX_SESSION_VIEW_DATASETS + 1}`);
  assert.equal(sessionViewFor(store, 'dataset-0').pinned.length, 0);

  store = withSessionView(store, 'dataset-4', view({ pinned: ['again'] }));
  assert.equal(store.order[0], 'dataset-4');
  assert.equal(store.order.filter(id => id === 'dataset-4').length, 1);
  assert.deepEqual(sessionViewFor(store, 'dataset-4').pinned, ['again']);
});

test('prunes pins and filters that no longer match the stack', () => {
  const pruned = pruneSessionView(
    view({
      pinned: ['gone'],
      filterId: 'anova',
      outlineFilter: 'pinned',
    }),
    { runIds: new Set(['kept']), analysisIds: ['ttest'] }
  );
  assert.deepEqual(pruned.pinned, []);
  assert.equal(pruned.filterId, 'all');
  assert.equal(pruned.outlineFilter, 'all');

  const stillPinned = pruneSessionView(
    view({ pinned: ['kept'], filterId: 'anova', outlineFilter: 'stale' }),
    { runIds: new Set(['kept']), analysisIds: ['anova'] }
  );
  assert.equal(stillPinned.filterId, 'anova');
  assert.equal(stillPinned.outlineFilter, 'stale');
});
