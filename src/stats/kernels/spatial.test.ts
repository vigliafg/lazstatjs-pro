import test from 'node:test';
import assert from 'node:assert/strict';
import { variogram } from './spatial';

const line = [0, 1, 2, 3].map(x => ({ x, y: 0, value: x }));

test('the variogram returns the Matheron semivariance per distance class', () => {
  const bins = variogram(line, { bins: 3, maxDistance: 3.01 });
  assert.equal(bins.length, 3);
  assert.deepEqual(bins.map(bin => bin.pairs), [3, 2, 1]);
  assert.ok(Math.abs(bins[0].semivariance - 0.5) < 1e-12);
  assert.ok(Math.abs(bins[1].semivariance - 2) < 1e-12);
  assert.ok(Math.abs(bins[2].semivariance - 4.5) < 1e-12);
  assert.deepEqual(bins.map(bin => Number(bin.distance.toFixed(6))), [1, 2, 3]);
});

test('the variogram stops at half the maximum distance and drops empty classes', () => {
  const bins = variogram(line);
  assert.equal(bins.length, 1);
  assert.equal(bins[0].pairs, 3);
  assert.equal(bins[0].distance, 1);
  assert.deepEqual(variogram(line.slice(0, 1)), []);
  assert.deepEqual(variogram(line, { bins: 40 }), bins);
});
