import test from 'node:test';
import assert from 'node:assert/strict';
import { capabilityStats, controlChart, paretoCounts } from './quality';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

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

test('XBar-R limits and capability match the closed-form references', () => {
  const chart = controlChart([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'xbar', 5);
  assert.ok(chart);
  close(chart!.center, 5.5);
  close(chart!.rCenter ?? Number.NaN, 4);
  close(chart!.sigma, 1.7196904557179706);
  close(chart!.ucl, 7.8072068555457843);
  close(chart!.lcl, 3.1927931444542157);
  close(chart!.rUcl ?? Number.NaN, 8.456);
  close(chart!.rLcl ?? Number.NaN, 0);

  const capability = capabilityStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0, 12, 6);
  assert.ok(capability);
  close(capability!.cp, 0.6605782590758163);
  close(capability!.cpk, 0.6055300708194984);
});
