import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDescriptiveOutput } from './run';

const frequencyRows: string[][] = [
  ['A', '10'],
  ['B', '11'],
  ['A', '12'],
  ['C', '13'],
  ['B', '14'],
  ['A', '15'],
  ['', '16'],
];

const numericRows: string[][] = Array.from({ length: 12 }, (_, index) => [
  String(index < 11 ? 10 + (index % 4) * 0.2 : 40),
  String(5 + (index % 3)),
]);

test('frequency mode tallies a categorical column and emits the Wilson table', () => {
  const result = buildDescriptiveOutput({
    rows: frequencyRows,
    columnNames: ['Group', 'Value'],
    indices: [0],
    level: 95,
    mode: 'frequency',
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.tables?.map(table => table.id), ['freq-1', 'freq-gof-1']);
  const tally = result.tables![0];
  assert.deepEqual(
    tally.rows.map(row => [row.value, row.count]),
    [
      ['A', 3],
      ['B', 2],
      ['C', 1],
    ]
  );
  assert.equal(tally.rows[0].cumCount, 3);
  assert.equal(result.charts?.[0].kind, 'bar');
  assert.ok(result.report?.headline.includes('Group'));
});

test('frequency mode rejects a column with too many levels', () => {
  const rows = Array.from({ length: 120 }, (_, index) => [String(index)]);
  const result = buildDescriptiveOutput({
    rows,
    columnNames: ['Id'],
    indices: [0],
    level: 95,
    mode: 'frequency',
  });
  assert.ok('ok' in result && !result.ok);
});

test('outliers mode emits Grubbs and Dixon rows and a box plot', () => {
  const result = buildDescriptiveOutput({
    rows: numericRows,
    columnNames: ['Measure', 'Group'],
    indices: [0],
    level: 95,
    mode: 'outliers',
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.tables?.map(table => table.id), ['outliers-1']);
  const rows = result.tables![0].rows;
  assert.deepEqual(rows.map(row => row.test), ['Grubbs', 'Dixon r21']);
  assert.equal(rows[0].outlier, 40);
  assert.equal(result.charts?.[0].kind, 'box');
});

test('outliers mode refuses columns without a positive spread', () => {
  const result = buildDescriptiveOutput({
    rows: [['5'], ['5'], ['5'], ['5']],
    columnNames: ['Constant'],
    indices: [0],
    level: 95,
    mode: 'outliers',
  });
  assert.ok('ok' in result && !result.ok);
});

const sequence = [
  12, 15, 11, 18, 14, 13, 19, 10, 16, 17, 12, 20, 11, 14, 18, 13, 15, 16, 9, 21, 12, 17, 14, 19,
];

test('runs mode reports the runs, the exact p and two charts', () => {
  const result = buildDescriptiveOutput({
    rows: sequence.map(value => [String(value)]),
    columnNames: ['Ozone'],
    indices: [0],
    level: 95,
    mode: 'runs',
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.tables?.map(table => table.id), ['runs-1']);
  const row = result.tables![0].rows[0];
  assert.equal(row.runs, 20);
  assert.equal(row.cut, 14.5);
  assert.ok(Number(row.p) < 0.01);
  assert.ok(Number(row.exactP) < 0.01);
  assert.deepEqual(result.charts?.map(chart => chart.kind), ['line', 'bar']);
});

test('runs mode rejects a sequence with a single side', () => {
  const result = buildDescriptiveOutput({
    rows: [['5'], ['5'], ['5'], ['5'], ['5']],
    columnNames: ['Constant'],
    indices: [0],
    level: 95,
    mode: 'runs',
  });
  assert.ok('ok' in result && !result.ok);
});

test('the default mode still builds the classic summary', () => {
  const result = buildDescriptiveOutput({
    rows: numericRows,
    columnNames: ['Measure'],
    indices: [0],
    level: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables?.some(table => table.id === 'desc-location'));
});
