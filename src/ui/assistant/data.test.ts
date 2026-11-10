import assert from 'node:assert/strict';
import test from 'node:test';
import type { Column, GridData } from '../../grid/types';
import {
  DATA_ACTION_IDS,
  DATA_TREE,
  dataActionBlocked,
  inspectData,
  isEmptyGrid,
} from './data';
import { dataLeaf } from './tree';

const make = (cols: Column[], rows: string[][]): GridData => ({ cols, rows });

const demo = () =>
  make(
    [
      { name: 'Score', type: 'num' },
      { name: 'Group', type: 'cat' },
    ],
    [
      ['10', 'A'],
      ['x', 'A'],
      ['', 'A'],
    ]
  );

test('inspectData reports invalid cells before missing values', () => {
  const issues = inspectData(demo());
  const score = issues.filter(issue => issue.name === 'Score');
  assert.deepEqual(
    score.map(issue => issue.kind),
    ['invalid', 'missing']
  );
  assert.equal(score[0].count, 1);
  assert.equal(score[1].count, 1);
  assert.equal(issues[0].kind, 'invalid');
});

test('inspectData flags empty and constant columns and identifiers', () => {
  const issues = inspectData(
    make(
      [
        { name: 'Blank', type: 'num' },
        { name: 'Fixed', type: 'str' },
        { name: 'Key', type: 'id' },
      ],
      [
        ['', 'same', 'p1'],
        ['', 'same', 'p2'],
      ]
    )
  );
  const byName = (name: string) => issues.filter(issue => issue.name === name).map(issue => issue.kind);
  assert.deepEqual(byName('Blank'), ['missing', 'empty']);
  assert.deepEqual(byName('Fixed'), ['constant']);
  assert.deepEqual(byName('Key'), ['id']);
});

test('a synthetic grid with declared missing codes counts them as missing', () => {
  const issues = inspectData(
    make([{ name: 'Age', type: 'int', missing: ['-9'] }], [['-9'], ['40']])
  );
  assert.ok(issues.some(issue => issue.kind === 'missing' && issue.count === 1));
});

test('isEmptyGrid recognises blank and row-less grids', () => {
  assert.equal(isEmptyGrid(make([{ name: 'A', type: 'num' }], [['']])), true);
  assert.equal(isEmptyGrid(make([{ name: 'A', type: 'num' }], [])), true);
  assert.equal(isEmptyGrid(make([], [['1']])), true);
  assert.equal(isEmptyGrid(demo()), false);
});

test('an empty grid allows only import and add column', () => {
  const ctx = { grid: make([{ name: 'A', type: 'num' }], [['']]), selection: null };
  assert.equal(dataActionBlocked('openImport', {}, ctx), null);
  assert.equal(dataActionBlocked('addColumn', {}, ctx), null);
  assert.equal(dataActionBlocked('openExport', {}, ctx), 'assistant.d.emptyGrid');
  assert.equal(dataActionBlocked('handoffAnalysis', {}, ctx), 'assistant.d.handoffEmpty');
});

test('column actions ask for a column, including out-of-range picks', () => {
  const ctx = { grid: demo(), selection: null };
  assert.equal(dataActionBlocked('sortRows', {}, ctx), 'assistant.d.pickColumn');
  assert.equal(dataActionBlocked('sortRows', { column: 9 }, ctx), 'assistant.d.pickColumn');
  assert.equal(dataActionBlocked('sortRows', { column: 0 }, ctx), null);
  assert.equal(dataActionBlocked('deleteColumn', { column: 1 }, ctx), null);
});

test('selection actions ask for a selection and the pickers ask for their value', () => {
  const ctx = { grid: demo(), selection: null };
  assert.equal(dataActionBlocked('fillDown', {}, ctx), 'assistant.d.noSelection');
  assert.equal(
    dataActionBlocked('fillDown', {}, { ...ctx, selection: { r0: 0, c0: 0, r1: 2, c1: 0 } }),
    null
  );
  assert.equal(dataActionBlocked('setColumnType', { column: 0 }, ctx), 'assistant.d.pickType');
  assert.equal(
    dataActionBlocked('setColumnType', { column: 0, type: 'num' }, ctx),
    null
  );
  assert.equal(
    dataActionBlocked('declareMissingCodes', { column: 0 }, ctx),
    'assistant.d.pickCodes'
  );
  assert.equal(
    dataActionBlocked('declareMissingCodes', { column: 0, codes: ['-9'] }, ctx),
    null
  );
  assert.equal(
    dataActionBlocked('recodeLevels', { column: 1 }, ctx),
    'assistant.d.pickMapping'
  );
  assert.equal(
    dataActionBlocked('recodeLevels', { column: 1, mapping: { A: 'B' } }, ctx),
    null
  );
});

test('the domain exposes twenty wired actions and three unaffected leaves', () => {
  assert.equal(DATA_ACTION_IDS.length, 20);
  assert.equal(Object.keys(DATA_TREE).length, 28);
  assert.equal(dataLeaf('data-sort')?.action, 'sortRows');
  assert.equal(dataLeaf('d1'), null);
});
