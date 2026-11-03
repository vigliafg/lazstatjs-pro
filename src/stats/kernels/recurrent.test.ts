import test from 'node:test';
import assert from 'node:assert/strict';
import { meanCumulativeFunction } from './recurrent';

test('mean cumulative function divides events by the subjects at risk', () => {
  const rows = [
    { id: 1, start: 0, stop: 2, event: 1 },
    { id: 1, start: 2, stop: 5, event: 1 },
    { id: 2, start: 0, stop: 3, event: 1 },
    { id: 2, start: 3, stop: 6, event: 1 },
    { id: 3, start: 0, stop: 4, event: 0 },
  ];
  const mcf = meanCumulativeFunction(rows);
  assert.deepEqual(mcf.map(point => point.time), [2, 3, 5, 6]);
  assert.deepEqual(mcf.map(point => point.atRisk), [3, 3, 2, 1]);
  assert.deepEqual(mcf.map(point => point.events), [1, 1, 1, 1]);
  assert.ok(Math.abs(mcf[0].mcf - 1 / 3) < 1e-12, 'first increment 1/3');
  assert.ok(Math.abs(mcf[1].mcf - 2 / 3) < 1e-12, 'second increment 1/3');
  assert.ok(Math.abs(mcf[2].mcf - 7 / 6) < 1e-12, 'third increment 1/2');
  assert.ok(Math.abs(mcf[3].mcf - 13 / 6) < 1e-12, 'fourth increment 1');
});

test('mean cumulative function ignores invalid intervals and censoring only', () => {
  assert.deepEqual(meanCumulativeFunction([]), []);
  assert.deepEqual(meanCumulativeFunction([{ id: 1, start: 2, stop: 2, event: 1 }]), []);
  assert.deepEqual(meanCumulativeFunction([{ id: 1, start: 0, stop: 4, event: 0 }]), []);
});
