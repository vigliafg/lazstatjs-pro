import assert from 'node:assert/strict';
import test from 'node:test';
import { createDefaultGrid } from '../../grid/defaults';
import { DEFAULT_PARAMS } from '../../io/project';
import { assistantLeaf } from './tree';
import { optionIsPrepared, validateLeafReadiness } from './readiness';

const LEAF_IDS = [
  'descriptive',
  'distfit',
  'variances',
  'proportions',
  'ttest-ind',
  'ttest-paired',
  'anova',
  'correlation',
  'chisquare',
  'contingency',
  'agreement',
  'regression',
  'logistic',
  'countreg',
  'ordinal',
  'timeseries',
  'survival',
  'cox',
  'samplesize',
  'mi',
];

const STATES = ['ready', 'empty', 'missing-roles', 'type-mismatch', 'rules'];

test('all twenty leaves expose one of the five readiness states', () => {
  assert.equal(LEAF_IDS.length, 20);
  const grid = createDefaultGrid();
  for (const id of LEAF_IDS) {
    const leaf = assistantLeaf(id);
    assert.ok(leaf, id);
    const readiness = validateLeafReadiness(leaf, DEFAULT_PARAMS, grid);
    assert.ok(STATES.includes(readiness.state), `${id}: ${readiness.state}`);
    assert.equal(readiness.canRun, readiness.state === 'ready');
  }
});

test('manual leaves are ready without columns, the others ask for data', () => {
  const empty = { cols: [], rows: [] };
  for (const id of LEAF_IDS) {
    const leaf = assistantLeaf(id);
    assert.ok(leaf, id);
    const readiness = validateLeafReadiness(leaf, DEFAULT_PARAMS, empty);
    if (leaf.contract.manual) {
      assert.equal(readiness.state, 'ready', id);
      assert.equal(readiness.canRun, true, id);
    } else {
      assert.equal(readiness.state, 'empty', id);
      assert.deepEqual(readiness.repairs, [{ target: 'import' }], id);
    }
  }
});

test('incomplete pairs block a paired test', () => {
  const grid = createDefaultGrid();
  const leaf = assistantLeaf('ttest-paired');
  assert.ok(leaf);
  const ready = validateLeafReadiness(leaf, DEFAULT_PARAMS, grid);
  assert.equal(ready.state, 'ready');

  const rows = grid.rows.map((row, index) =>
    index === 0 ? row : ['', row[1], ...row.slice(2)]
  );
  const blocked = validateLeafReadiness(leaf, DEFAULT_PARAMS, { cols: grid.cols, rows });
  assert.equal(blocked.state, 'rules');
  assert.deepEqual(blocked.repairs, [{ target: 'rows' }]);
});

test('option badges follow the leaves below the option', () => {
  const grid = createDefaultGrid();
  assert.equal(optionIsPrepared('compare', DEFAULT_PARAMS, grid), true);
  assert.equal(optionIsPrepared('compare', DEFAULT_PARAMS, { cols: [], rows: [] }), false);
});
