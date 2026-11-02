import test from 'node:test';
import assert from 'node:assert/strict';
import { capabilityStats, controlChart, paretoCounts } from './quality';

test('XBar-R chart estimates limits from subgroup means and ranges', () => {
  const values = [10, 11, 9, 10, 12, 10, 11, 9, 10, 11];
  const result = controlChart(values, 'xbar', 5);
  assert.ok(result);
  assert.equal(result!.chart, 'xbar');
  assert.equal(result!.points.length, 2);
  assert.ok(result!.center > 9 && result!.center < 12);
  assert.ok(result!.ucl > result!.center);
  assert.ok(result!.lcl < result!.center);
  assert.ok((result!.rUcl ?? 0) >= (result!.rCenter ?? 0));
  assert.equal(result!.subgroup, 5);
});

test('individuals chart flags a large shift', () => {
  const result = controlChart([1, 1, 1, 1, 1, 1, 1, 1, 1, 12], 'individuals', 1);
  assert.ok(result);
  assert.ok(result!.outCount >= 1);
  assert.ok(result!.points.at(-1)!.out);
});

test('EWMA chart returns per-point limits', () => {
  const result = controlChart([10, 11, 9, 10, 11, 10, 9, 10, 11, 10], 'ewma', 1);
  assert.ok(result);
  assert.equal(result!.limits.length, result!.points.length);
  assert.ok(result!.limits.every(limit => limit.ucl > limit.lcl));
});

test('capability returns Cp, Cpk and an out-of-specification share', () => {
  const values = [4.8, 5.1, 4.9, 5.2, 5, 4.7, 5.3, 5.1, 4.9, 5];
  const result = capabilityStats(values, 0, 10, 5);
  assert.ok(result);
  assert.ok(result!.cp > 1);
  assert.ok(result!.cpk <= result!.cp);
  assert.ok(result!.pctOut < 1);
  assert.equal(result!.n, values.length);
  assert.equal(capabilityStats(values, 10, 0, 5), null);
  assert.equal(capabilityStats([5, 5, 5, 5], 0, 10, 5), null);
});

test('Pareto counts are sorted and cumulative reaches 100', () => {
  const result = paretoCounts(['A', 'B', 'A', 'C', 'A', 'B', '']);
  assert.ok(result);
  assert.equal(result!.total, 6);
  assert.equal(result!.rows[0].category, 'A');
  assert.equal(result!.rows[0].count, 3);
  assert.equal(result!.rows.at(-1)!.cumulative, 100);
  assert.equal(paretoCounts(['', ' ']), null);
});
