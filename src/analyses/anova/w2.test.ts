import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAnovaOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'Score', type: 'num' },
  { name: 'Outer', type: 'cat' },
  { name: 'Inner', type: 'cat' },
];

const nestedRows: string[][] = [
  ['10', 'A', 'A1'], ['12', 'A', 'A1'], ['14', 'A', 'A2'], ['16', 'A', 'A2'],
  ['11', 'B', 'B1'], ['13', 'B', 'B1'], ['15', 'B', 'B2'], ['17', 'B', 'B2'],
  ['12', 'C', 'C1'], ['14', 'C', 'C1'], ['16', 'C', 'C2'], ['18', 'C', 'C2'],
];

const nestedGrid: GridData = { cols, rows: nestedRows };

test('nested mode emits the hierarchical table, report and interval chart', () => {
  const result = buildAnovaOutput({
    grid: nestedGrid,
    anovaParams: { ...DEFAULT_PARAMS.anova, mode: 'nested', dep: 0, grp: 1, inner: 2 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const ids = (result.tables ?? []).map(table => table.id);
  assert.deepEqual(ids, ['nested-anova-table', 'nested-anova-groups', 'nested-anova-components']);
  const table = result.tables![0].rows;
  assert.equal(Number(table[0].df), 2);
  assert.equal(Number(table[1].df), 3);
  assert.ok(Math.abs(Number(table[0].f) - 0.25) < 1e-9);
  assert.equal(result.charts?.[0].kind, 'interval');
  assert.equal(result.report?.id, 'report-nested-anova');
});

test('nested mode requires an inner factor and a real nesting', () => {
  const missing = buildAnovaOutput({
    grid: nestedGrid,
    anovaParams: { ...DEFAULT_PARAMS.anova, mode: 'nested', dep: 0, grp: 1, inner: -1 },
    ciLevel: 95,
  });
  assert.ok('reason' in missing);

  const same = buildAnovaOutput({
    grid: nestedGrid,
    anovaParams: { ...DEFAULT_PARAMS.anova, mode: 'nested', dep: 0, grp: 1, inner: 1 },
    ciLevel: 95,
  });
  assert.ok('reason' in same);

  const notNested: GridData = {
    cols,
    rows: [
      ['10', 'A', 'X'], ['12', 'A', 'X'], ['14', 'A', 'Y'], ['16', 'A', 'Y'],
      ['11', 'B', 'X'], ['13', 'B', 'X'], ['15', 'B', 'Z'], ['17', 'B', 'Z'],
    ],
  };
  const invalid = buildAnovaOutput({
    grid: notNested,
    anovaParams: { ...DEFAULT_PARAMS.anova, mode: 'nested', dep: 0, grp: 1, inner: 2 },
    ciLevel: 95,
  });
  assert.ok('reason' in invalid);
});

const anomRows: string[][] = [
  ...[6, 8, 10, 12, 14].map(value => [String(value), 'A']),
  ...[7, 9, 11, 13, 15].map(value => [String(value), 'B']),
  ...[13, 15, 17, 19, 21].map(value => [String(value), 'C']),
];

test('ANOM mode emits decision lines and flags the outlying group', () => {
  const result = buildAnovaOutput({
    grid: { cols, rows: anomRows },
    anovaParams: { ...DEFAULT_PARAMS.anova, mode: 'anom', dep: 0, grp: 1, alpha: 0.05 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const rowC = result.tables![0].rows.find(row => String(row.group) === 'C');
  assert.ok(rowC);
  assert.equal(String(rowC!.outside), 'Sì');
  assert.equal(result.charts?.[0].kind, 'interval');
  assert.equal(result.report?.id, 'report-anom');
});

test('ANOM mode handles a single group and a degenerate alpha', () => {
  const single = buildAnovaOutput({
    grid: { cols, rows: [['1', 'A'], ['2', 'A'], ['3', 'A']] },
    anovaParams: { ...DEFAULT_PARAMS.anova, mode: 'anom', dep: 0, grp: 1 },
    ciLevel: 95,
  });
  assert.ok('reason' in single);

  const fallback = buildAnovaOutput({
    grid: { cols, rows: anomRows },
    anovaParams: { ...DEFAULT_PARAMS.anova, mode: 'anom', dep: 0, grp: 1, alpha: 0 },
    ciLevel: 95,
  });
  assert.ok('ok' in fallback && fallback.ok);
});
