import test from 'node:test';
import assert from 'node:assert/strict';
import { makeChart } from './kits/common';
import {
  filterChartsByGroups,
  outputGroupOf,
  outputGroupsFor,
} from './outputs';

const chart = (id: string) =>
  makeChart({ id, kind: 'line', title: id, data: { series: [{ x: 1, y: 1 }] } });

test('mandatory charts match no group and are always kept', () => {
  const charts = [chart('desc-means'), chart('desc-interval'), chart('desc-qq-X')];
  assert.equal(outputGroupOf('descriptive', 'desc-means'), null);
  assert.equal(outputGroupOf('descriptive', 'desc-interval'), 'recommended');
  assert.equal(outputGroupOf('descriptive', 'desc-qq-X'), 'diagnostic');
  assert.deepEqual(
    filterChartsByGroups('descriptive', charts, ['recommended', 'diagnostic'])?.map(item => item.id),
    ['desc-means']
  );
});

test('group choices hide only their own optional charts', () => {
  const charts = [
    chart('reg-scatter'),
    chart('reg-observed-fitted'),
    chart('reg-cooks'),
    chart('reg-partial-1'),
  ];
  assert.deepEqual(
    filterChartsByGroups('regression', charts, ['diagnostic'])?.map(item => item.id),
    ['reg-scatter', 'reg-observed-fitted']
  );
  assert.deepEqual(
    filterChartsByGroups('regression', charts, ['recommended'])?.map(item => item.id),
    ['reg-scatter', 'reg-cooks', 'reg-partial-1']
  );
  assert.equal(filterChartsByGroups('regression', charts, [])?.length, 4);
});

test('unknown procedures and empty choices keep every chart', () => {
  const charts = [chart('anything'), chart('other')];
  assert.equal(outputGroupOf('unknown', 'anything'), null);
  assert.deepEqual(filterChartsByGroups('unknown', charts, ['diagnostic']), charts);
  assert.deepEqual(filterChartsByGroups('descriptive', charts, undefined), charts);
});

test('only groups with charts are offered in the setup panel', () => {
  assert.deepEqual(outputGroupsFor('descriptive'), ['recommended', 'diagnostic']);
  assert.deepEqual(outputGroupsFor('factorial'), []);
  assert.deepEqual(outputGroupsFor('unknown'), []);
});
