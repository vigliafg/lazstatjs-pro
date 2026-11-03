import test from 'node:test';
import assert from 'node:assert/strict';
import { multiControlChart } from './mcontrol';

const rows: number[][] = [];
for (let group = 0; group < 10; group += 1) {
  for (let rep = 0; rep < 4; rep += 1) {
    const shock = group === 7 ? 4 : 0;
    rows.push([10 + rep * 0.05 + shock, 5 + rep * 0.02 + shock]);
  }
}

test('the T² chart flags a shifted subgroup and keeps the limits positive', () => {
  const result = multiControlChart({
    rows,
    variableNames: ['Length', 'Width'],
    subgroup: 4,
    alpha: 0.05,
  });
  assert.ok(result);
  assert.equal(result!.variables.length, 2);
  assert.equal(result!.groups, 10);
  assert.ok(result!.ucl > 0);
  assert.equal(result!.outCount, 1);
  assert.equal(result!.points.findIndex(point => point.out), 7);
});

test('the T² chart rejects too few variables or complete rows', () => {
  assert.equal(
    multiControlChart({ rows, variableNames: ['Length'], subgroup: 4, alpha: 0.05 }),
    null
  );
  assert.equal(
    multiControlChart({ rows: rows.slice(0, 4), variableNames: ['Length', 'Width'], subgroup: 4, alpha: 0.05 }),
    null
  );
});
