import test from 'node:test';
import assert from 'node:assert/strict';
import { hierarchicalClusters } from './cluster';

// Eight points in two dimensions; R 4.5.2 builds the same ward.D2 tree and
// reports fpc::cluster.stats$ch and NbClust::Indices.WBT ccc for cutree(k).
const DATA = [
  [1, 1],
  [1.2, 2],
  [2.1, 2.2],
  [8, 8.1],
  [8.2, 9],
  [9.1, 9.2],
  [5, 5.1],
  [5.2, 5.3],
];
const EXPECTED: Record<number, { pseudoF: number; ccc: number }> = {
  2: { pseudoF: 22.6766991626, ccc: 2.7826608647 },
  3: { pseudoF: 126.2076452164, ccc: 4.7176426389 },
  4: { pseudoF: 107.9495315805, ccc: 3.2424516876 },
  5: { pseudoF: 126.222261236, ccc: 2.4698005037 },
  6: { pseudoF: 129.211827957, ccc: 1.2897374635 },
  7: { pseudoF: 627.640625, ccc: 2.707199318 },
};

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('pseudo-F and CCC of every merge match R', () => {
  const result = hierarchicalClusters({
    data: DATA,
    method: 'ward',
    clusters: 0,
    standardize: false,
    variableNames: ['x', 'y'],
  });
  assert.ok(result);
  assert.equal(result!.merges.length, 7);
  result!.merges.slice(0, 6).forEach((merge, index) => {
    const k = DATA.length - (index + 1);
    const expected = EXPECTED[k];
    assert.equal(merge.clusters, k);
    close(merge.pseudoF ?? Number.NaN, expected.pseudoF, 1e-6);
    close(merge.ccc ?? Number.NaN, expected.ccc, 1e-6);
  });
});
