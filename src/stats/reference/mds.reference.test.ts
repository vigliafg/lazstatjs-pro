import test from 'node:test';
import assert from 'node:assert/strict';
import { multidimensionalScaling } from '../kernels/mds';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface MdsFixture {
  source: string;
  cases: {
    name: string;
    data: Record<string, number>[];
    k: number;
    dissimilarities: number[][];
    eigenvalues: number[];
    classical: number[][];
    iso: number[][];
    isoStress: number;
  }[];
}

const fixture = loadFixture<MdsFixture>('mds.json');

const distance = (a: number[], b: number[]): number =>
  Math.sqrt(a.reduce((sum, value, index) => sum + Math.pow(value - b[index], 2), 0));

test('classical MDS reproduces cmdscale eigenvalues and distances', () => {
  assert.equal(fixture.source, 'R stats::cmdscale and MASS::isoMDS');
  for (const reference of fixture.cases) {
    const fit = multidimensionalScaling({
      dissimilarities: reference.dissimilarities,
      labels: reference.data.map((_, index) => `R${index + 1}`),
      dimensions: reference.k,
      metric: 'classical',
    });
    assert.ok(fit, `${reference.name}: fit`);
    reference.eigenvalues.forEach((value, index) =>
      assertClose(fit!.eigenvalues[index] ?? 0, value, { absolute: 1e-6, relative: 1e-8 }, `${reference.name} eigen[${index}]`)
    );
    // Coordinates are defined up to rotation and reflection; the pairwise
    // distances are invariant and are the meaningful comparison.
    reference.dissimilarities.forEach((row, i) =>
      row.forEach((_, j) => {
        if (j <= i) return;
        assertClose(
          distance(fit!.coordinates[i], fit!.coordinates[j]),
          distance(reference.classical[i], reference.classical[j]),
          { absolute: 1e-6, relative: 1e-8 },
          `${reference.name} distance[${i},${j}]`
        );
      })
    );
  }
});

test('non-metric MDS stress is close to MASS::isoMDS', () => {
  for (const reference of fixture.cases) {
    const fit = multidimensionalScaling({
      dissimilarities: reference.dissimilarities,
      labels: reference.data.map((_, index) => `R${index + 1}`),
      dimensions: reference.k,
      metric: 'nonmetric',
    });
    assert.ok(fit, `${reference.name}: fit`);
    // MASS reports the stress at its own stopping point; the kernel optimises
    // the same Kruskal criterion and must not end above that value. The
    // recovered distances must also preserve the dissimilarity order.
    assert.ok(
      fit!.stress <= reference.isoStress + 0.02,
      `${reference.name}: stress ${fit!.stress} above isoMDS ${reference.isoStress}`
    );
    const pairs = fit!.pairs;
    const meanDissimilarity = pairs.reduce((sum, pair) => sum + pair.dissimilarity, 0) / pairs.length;
    const meanDistance = pairs.reduce((sum, pair) => sum + pair.distance, 0) / pairs.length;
    const covariance = pairs.reduce(
      (sum, pair) => sum + (pair.dissimilarity - meanDissimilarity) * (pair.distance - meanDistance),
      0
    );
    const varianceDissimilarity = pairs.reduce(
      (sum, pair) => sum + Math.pow(pair.dissimilarity - meanDissimilarity, 2),
      0
    );
    const varianceDistance = pairs.reduce(
      (sum, pair) => sum + Math.pow(pair.distance - meanDistance, 2),
      0
    );
    const correlation =
      varianceDissimilarity > 0 && varianceDistance > 0
        ? covariance / Math.sqrt(varianceDissimilarity * varianceDistance)
        : 0;
    assert.ok(correlation > 0.85, `${reference.name}: distance correlation ${correlation}`);
  }
});
