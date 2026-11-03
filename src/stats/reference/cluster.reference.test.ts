import test from 'node:test';
import assert from 'node:assert/strict';
import { partitionClusters } from '../kernels/cluster';
import { assertClose, assertCloseMatrix, loadFixture, TOLERANCES } from './harness';

interface ClusterFixture {
  source: string;
  generatedBy: string;
  cases: {
    name: string;
    data: number[][];
    k: number;
    standardize: boolean;
    start: number[][];
    centers: number[][];
    sizes: number[];
    withinss: number[];
    totwithinss: number;
    assignment: number[];
  }[];
}

const fixture = loadFixture<ClusterFixture>('cluster.json');

// The kernel and R use the same deterministic farthest-first start and the
// same Lloyd iteration order, so centres and assignments should match exactly
// up to floating-point noise.
test('k-means matches the R stats::kmeans fixture', () => {
  assert.ok(fixture.cases.length >= 3);
  assert.equal(fixture.source, 'R stats::kmeans (Lloyd, deterministic starts)');
  for (const reference of fixture.cases) {
    const fit = partitionClusters({
      data: reference.data,
      k: reference.k,
      method: 'kmeans',
      standardize: reference.standardize,
      variableNames: reference.data[0].map((_, index) => `V${index + 1}`),
    });
    assert.ok(fit, `${reference.name}: fit`);
    assert.equal(fit!.k, reference.k, `${reference.name} k`);
    const width = reference.data[0].length;
    const means = Array.from({ length: width }, (_, column) =>
      reference.data.reduce((sum, row) => sum + row[column], 0) / reference.data.length
    );
    const sds = Array.from({ length: width }, (_, column) =>
      Math.sqrt(
        reference.data.reduce((sum, row) => sum + Math.pow(row[column] - means[column], 2), 0) /
          Math.max(1, reference.data.length - 1)
      )
    );
    const actualCenters = fit!.centers.map(center =>
      center.map((value, column) =>
        reference.standardize ? (value - means[column]) / sds[column] : value
      )
    );
    const matched = reference.centers.map(expected => {
      let best = 0;
      let bestDistance = Infinity;
      actualCenters.forEach((center, index) => {
        const distance = Math.sqrt(
          center.reduce((sum, value, column) => sum + Math.pow(value - expected[column], 2), 0)
        );
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      return { expected, actual: actualCenters[best], index: best };
    });
    matched.forEach(({ expected, actual }) =>
      actual.forEach((value, column) =>
        assertClose(value, expected[column], TOLERANCES.r, `${reference.name} centre[${column}]`)
      )
    );
    const sizes = matched.map(item => fit!.assignment.filter(value => value === item.index).length);
    assert.deepEqual([...sizes].sort((a, b) => a - b), [...reference.sizes].sort((a, b) => a - b), `${reference.name} sizes`);
    if (!reference.standardize) {
      assertClose(fit!.objective ?? 0, reference.totwithinss, TOLERANCES.r, `${reference.name} within SS`);
    }
  }
});
