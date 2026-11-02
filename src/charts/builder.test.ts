import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGraphChart, BUILDER_KINDS } from './builder';
import type { GridData } from '../grid/types';

const grid: GridData = {
  cols: [
    { name: 'X', type: 'num' },
    { name: 'Y', type: 'num' },
    { name: 'G', type: 'cat' },
    { name: 'Label', type: 'str' },
  ],
  rows: [
    ['1', '2', 'A', 'one'],
    ['2', '4', 'A', 'two'],
    ['3', '6', 'B', 'three'],
    ['4', '', 'B', 'four'],
    ['5', '10', 'B', 'five'],
  ],
};

test('every builder kind is declared', () => {
  assert.deepEqual([...BUILDER_KINDS], ['scatter', 'line', 'bar', 'box', 'histogram']);
});

test('scatter keeps row keys and uses the requested columns', () => {
  const chart = buildGraphChart(grid, { kind: 'scatter', x: 0, y: 1, group: -1 });
  assert.ok(chart);
  assert.equal(chart!.kind, 'scatter');
  assert.equal(chart!.data.points.length, 4);
  assert.deepEqual(chart!.data.points.map(row => row.__row), ['0', '1', '2', '4']);
  assert.equal(chart!.fields.xLabel, 'X');
  assert.equal(chart!.fields.yLabel, 'Y');
});

test('scatter groups by the group column and disables the default ellipse', () => {
  const chart = buildGraphChart(grid, { kind: 'scatter', x: 0, y: 1, group: 2 });
  assert.ok(chart);
  assert.deepEqual(chart!.data.points.map(row => row.group), ['A', 'A', 'B', 'B']);
  assert.equal((chart!.options as { ellipse: boolean }).ellipse, false);
});

test('line sorts by X and emits series when grouped', () => {
  const chart = buildGraphChart(grid, { kind: 'line', x: 0, y: 1, group: 2 });
  assert.ok(chart);
  const series = chart!.data.series;
  assert.deepEqual(series.map(row => row.x), [1, 2, 3, 5]);
  assert.deepEqual(series.map(row => row.series), ['A', 'A', 'B', 'B']);
  assert.deepEqual(series.map(row => row.__row), ['0', '1', '2', '4']);
});

test('bar aggregates the mean per category', () => {
  const chart = buildGraphChart(grid, { kind: 'bar', x: 2, y: 1, group: -1 });
  assert.ok(chart);
  const bars = chart!.data.bars;
  assert.deepEqual(bars, [
    { category: 'A', value: 3 },
    { category: 'B', value: 8 },
  ]);
});

test('bar groups series side by side', () => {
  const chart = buildGraphChart(grid, { kind: 'bar', x: 2, y: 1, group: 2 });
  assert.ok(chart);
  // Same category as group: one series per category.
  assert.equal((chart!.options as { grouping: string }).grouping, 'grouped');
});

test('box groups by category and keeps the observation keys', () => {
  const chart = buildGraphChart(grid, { kind: 'box', x: 2, y: 1, group: -1 });
  assert.ok(chart);
  assert.equal(chart!.kind, 'box');
  assert.equal(chart!.data.summary.length, 2);
  assert.deepEqual(chart!.data.points.map(row => row.__row), ['0', '1', '2', '4']);
});

test('histogram uses the Y column and keeps keys', () => {
  const chart = buildGraphChart(grid, { kind: 'histogram', x: -1, y: 1, group: -1 });
  assert.ok(chart);
  assert.equal(chart!.kind, 'histogram');
  assert.deepEqual(chart!.data.values.map(row => row.__row), ['0', '1', '2', '4']);
});

test('invalid role combinations return null', () => {
  assert.equal(buildGraphChart(grid, { kind: 'scatter', x: 2, y: 1, group: -1 }), null);
  assert.equal(buildGraphChart(grid, { kind: 'scatter', x: 0, y: 3, group: -1 }), null);
  assert.equal(buildGraphChart(grid, { kind: 'bar', x: -1, y: 1, group: -1 }), null);
  assert.equal(buildGraphChart(grid, { kind: 'histogram', x: -1, y: 9, group: -1 }), null);
  assert.equal(
    buildGraphChart({ cols: [{ name: 'X', type: 'num' }], rows: [] }, { kind: 'histogram', x: -1, y: 0, group: -1 }),
    null
  );
});
