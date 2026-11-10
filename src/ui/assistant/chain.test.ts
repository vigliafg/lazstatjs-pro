import assert from 'node:assert/strict';
import test from 'node:test';
import { createDefaultGrid } from '../../grid/defaults';
import { DEFAULT_PARAMS } from '../../io/project';
import {
  CHAIN_LIMIT,
  addChainStep,
  chainPreflight,
  chainSignature,
  moveChainStep,
  parseChain,
  removeChainStep,
  type AssistantChainStep,
} from './chain';

const step = (id: string, leafId: string): AssistantChainStep => ({
  id,
  leafId,
  params: DEFAULT_PARAMS,
});

test('adds steps and rejects the same leaf with the same snapshot', () => {
  const first = addChainStep([], step('s1', 'descriptive'));
  assert.equal(first.outcome, 'added');
  assert.equal(first.chain.length, 1);

  const duplicate = addChainStep(first.chain, step('s2', 'descriptive'));
  assert.equal(duplicate.outcome, 'duplicate');
  assert.equal(duplicate.chain.length, 1);
});

test('the same procedure with a different snapshot is a different step', () => {
  const base = step('s1', 'ttest-ind');
  const other: AssistantChainStep = {
    ...base,
    id: 's2',
    params: { ...DEFAULT_PARAMS, ttest: { ...DEFAULT_PARAMS.ttest, type: 'dep' } },
  };
  assert.notEqual(chainSignature(base), chainSignature(other));

  const result = addChainStep([base], other);
  assert.equal(result.outcome, 'added');
  assert.equal(result.chain.length, 2);
});

test('caps the chain and keeps the order stable', () => {
  const leaves = [
    'descriptive',
    'distfit',
    'variances',
    'proportions',
    'ttest-ind',
    'ttest-paired',
    'anova',
    'correlation',
  ];
  let chain: AssistantChainStep[] = [];
  leaves.forEach((leafId, index) => {
    const result = addChainStep(chain, step(`s${index}`, leafId));
    chain = result.chain;
  });
  assert.equal(chain.length, CHAIN_LIMIT);
  const full = addChainStep(chain, step('extra', 'descriptive'));
  assert.equal(full.outcome, 'full');
  assert.equal(full.chain.length, CHAIN_LIMIT);
});

test('moves, removes and ignores edge moves', () => {
  const chain = [step('a', 'descriptive'), step('b', 'ttest-ind')];
  assert.deepEqual(
    moveChainStep(chain, 'b', -1).map(item => item.id),
    ['b', 'a']
  );
  assert.deepEqual(
    moveChainStep(chain, 'a', -1).map(item => item.id),
    ['a', 'b']
  );
  assert.deepEqual(
    moveChainStep(chain, 'b', 1).map(item => item.id),
    ['a', 'b']
  );
  assert.deepEqual(
    removeChainStep(chain, 'a').map(item => item.id),
    ['b']
  );
});

test('parses stored chains, dropping unknown leaves and duplicates', () => {
  const parsed = parseChain([
    { id: 's1', leafId: 'descriptive', params: DEFAULT_PARAMS },
    { id: 's2', leafId: 'descriptive', params: DEFAULT_PARAMS },
    { id: 's3', leafId: 'missing-leaf', params: DEFAULT_PARAMS },
    { id: 's4', leafId: 'anova', params: 'not-a-params-object' },
    null,
  ]);
  assert.deepEqual(parsed.map(item => item.id), ['s1']);
  assert.deepEqual(parseChain('nope'), []);
});

test('preflight accepts a ready leaf and blocks a missing-role step', () => {
  const grid = createDefaultGrid();
  const ready = chainPreflight([step('s1', 'descriptive')], grid);
  assert.equal(ready.ok, true);

  const empty = chainPreflight([step('s1', 'descriptive')], { cols: [], rows: [] });
  assert.deepEqual(empty, { ok: false, index: 0 });
});

test('preflight stops at the first step whose roles do not fit the grid', () => {
  const grid = createDefaultGrid();
  // Two continuous columns fit the descriptive step; the proportions leaf
  // needs a binary variable and a group, so the second step is not ready.
  const columns = grid.cols.slice(0, 2);
  const result = chainPreflight(
    [step('s1', 'descriptive'), step('s2', 'proportions')],
    { cols: columns, rows: grid.rows.map(row => row.slice(0, 2)) }
  );
  assert.deepEqual(result, { ok: false, index: 1 });

  const empty = chainPreflight([step('s1', 'descriptive')], { cols: [], rows: [] });
  assert.deepEqual(empty, { ok: false, index: 0 });
});
