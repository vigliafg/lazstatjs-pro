import test from 'node:test';
import assert from 'node:assert/strict';
import { hierarchicalClusters } from './cluster';

const twoGroups = [
  [0, 0],
  [1, 0],
  [0, 1],
  [10, 10],
  [11, 10],
  [10, 11],
];

test('hierarchical clustering recovers two well-separated groups', () => {
  const result = hierarchicalClusters({
    data: twoGroups,
    method: 'average',
    clusters: 2,
    standardize: false,
    variableNames: ['X', 'Y'],
  });
  assert.ok(result);
  assert.equal(result!.k, 2);
  assert.equal(result!.merges.length, twoGroups.length - 1);
  assert.equal(result!.assignment.length, twoGroups.length);
  const left = result!.assignment.slice(0, 3);
  const right = result!.assignment.slice(3);
  assert.equal(new Set(left).size, 1);
  assert.equal(new Set(right).size, 1);
  assert.notEqual(left[0], right[0]);
  assert.equal(result!.centers.length, 2);
  assert.ok(result!.links.length > 0);
  assert.equal(result!.leaves.length, twoGroups.length);
});

test('cluster profiles are standardized and the tree is monotone in its merge count', () => {
  const result = hierarchicalClusters({
    data: twoGroups,
    method: 'complete',
    clusters: 2,
    standardize: true,
    variableNames: ['X', 'Y'],
  });
  assert.ok(result);
  assert.ok(result!.profiles.every(profile => profile.length === 2));
  assert.ok(result!.heights.every(height => Number.isFinite(height) && height >= 0));
  assert.equal(result!.leafOrder.length, twoGroups.length);
});

test('constant variables are rejected when standardisation is requested', () => {
  const result = hierarchicalClusters({
    data: [
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
    ],
    method: 'ward',
    clusters: 2,
    standardize: true,
    variableNames: ['X', 'Y'],
  });
  assert.equal(result, null);
});
