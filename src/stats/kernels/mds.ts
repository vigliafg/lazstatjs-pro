/**
 * Multidimensional scaling.
 *
 * `classical` is Torgerson's metric solution: double-centre the squared
 * dissimilarities and keep the positive eigenvectors of the resulting inner
 * product matrix. `nonmetric` starts from that solution and minimises Kruskal
 * stress with monotone regression (pool-adjacent-violators) and the Guttman
 * transform. Both are deterministic and match R's `cmdscale` / `MASS::isoMDS`
 * up to a rotation and a sign, which the reference test resolves by comparing
 * distances rather than raw coordinates.
 */

import { eigenSymmetric } from '../linalg';
import type { MdsMetric, MdsPair, MdsResult } from '../mds/types';

export interface MdsInput {
  dissimilarities: number[][];
  labels: string[];
  dimensions: number;
  metric: MdsMetric;
  maxIterations?: number;
  tolerance?: number;
}

const distance = (a: number[], b: number[]): number =>
  Math.sqrt(a.reduce((sum, value, index) => sum + Math.pow(value - (b[index] ?? 0), 2), 0));

const centre = (coordinates: number[][]): number[][] => {
  if (coordinates.length === 0) return coordinates;
  const dimensions = coordinates[0].length;
  const means = Array.from({ length: dimensions }, (_, column) =>
    coordinates.reduce((sum, row) => sum + row[column], 0) / coordinates.length
  );
  return coordinates.map(row => row.map((value, column) => value - means[column]));
};

const classical = (
  dissimilarities: number[][],
  dimensions: number
): { coordinates: number[][]; eigenvalues: number[] } => {
  const n = dissimilarities.length;
  const squared = dissimilarities.map(row => row.map(value => value * value));
  const rowMeans = squared.map(row => row.reduce((sum, value) => sum + value, 0) / n);
  const grand = rowMeans.reduce((sum, value) => sum + value, 0) / n;
  const inner = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => -0.5 * (squared[i][j] - rowMeans[i] - rowMeans[j] + grand))
  );
  const eigen = eigenSymmetric(inner);
  const positive = eigen.values.filter(value => value > 1e-10).length;
  const keep = Math.max(1, Math.min(dimensions, positive || 1));
  const coordinates = Array.from({ length: n }, (_, row) =>
    Array.from({ length: keep }, (_, column) => {
      const value = eigen.values[column] ?? 0;
      return value > 0 ? eigen.vectors[row][column] * Math.sqrt(value) : 0;
    })
  );
  return { coordinates: centre(coordinates), eigenvalues: eigen.values };
};

/** Pool-adjacent-violators: monotone non-decreasing fit to y ordered by x. */
const isotonic = (x: number[], y: number[]): number[] => {
  const order = x.map((_, index) => index).sort((a, b) => x[a] - x[b] || a - b);
  const blocks: { members: number[]; sum: number; count: number }[] = [];
  for (const index of order) {
    blocks.push({ members: [index], sum: y[index], count: 1 });
    while (blocks.length > 1) {
      const last = blocks[blocks.length - 1];
      const previous = blocks[blocks.length - 2];
      if (previous.sum / previous.count <= last.sum / last.count) break;
      blocks.splice(blocks.length - 2, 2, {
        members: [...previous.members, ...last.members],
        sum: previous.sum + last.sum,
        count: previous.count + last.count,
      });
    }
  }
  const fitted = new Array<number>(y.length).fill(0);
  for (const block of blocks) {
    const value = block.sum / block.count;
    for (const index of block.members) fitted[index] = value;
  }
  return fitted;
};

const stressOf = (pairs: { distance: number; disparity: number }[]): number => {
  const numerator = pairs.reduce((sum, pair) => sum + Math.pow(pair.distance - pair.disparity, 2), 0);
  const denominator = pairs.reduce((sum, pair) => sum + pair.distance * pair.distance, 0);
  return denominator > 0 ? Math.sqrt(numerator / denominator) : 0;
};

export const multidimensionalScaling = (input: MdsInput): MdsResult | null => {
  const n = input.dissimilarities.length;
  const width = input.dissimilarities[0]?.length ?? 0;
  if (n < 3 || width !== n) return null;
  if (input.dissimilarities.some(row => row.length !== n)) return null;
  if (input.dissimilarities.some((row, i) => row.some((value, j) => i !== j && (!Number.isFinite(value) || value < 0)))) {
    return null;
  }
  const dimensions = Math.max(1, Math.min(n - 1, Math.round(input.dimensions)));
  const initial = classical(input.dissimilarities, dimensions);
  const pairsIndex: { i: number; j: number; dissimilarity: number }[] = [];
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      pairsIndex.push({ i, j, dissimilarity: input.dissimilarities[i][j] });
    }
  }

  let coordinates = initial.coordinates;
  let iterations = 0;
  let stress = 0;
  if (input.metric === 'nonmetric') {
    const maxIterations = Math.max(10, Math.min(1000, input.maxIterations ?? 300));
    const tolerance = input.tolerance ?? 1e-8;
    stress = Infinity;
    for (; iterations < maxIterations; iterations += 1) {
      const distances = pairsIndex.map(pair => distance(coordinates[pair.i], coordinates[pair.j]));
      const rawDisparities = isotonic(distances, pairsIndex.map(pair => pair.dissimilarity));
      // Kruskal's stress is scale-free only when the disparities are put on the
      // same scale as the current distances; the least-squares factor does that.
      const numerator = distances.reduce((sum, value, index) => sum + value * rawDisparities[index], 0);
      const denominator = rawDisparities.reduce((sum, value) => sum + value * value, 0);
      const disparityScale = denominator > 0 ? numerator / denominator : 1;
      const disparities = rawDisparities.map(value => value * disparityScale);
      const nextStress = stressOf(
        distances.map((value, index) => ({ distance: value, disparity: disparities[index] }))
      );
      if (Math.abs(stress - nextStress) < tolerance && iterations > 1) {
        stress = nextStress;
        break;
      }
      stress = nextStress;

      const b = Array.from({ length: n }, () => new Array<number>(n).fill(0));
      pairsIndex.forEach((pair, index) => {
        const current = distances[index];
        const value = current > 1e-12 ? -disparities[index] / current : 0;
        b[pair.i][pair.j] = value;
        b[pair.j][pair.i] = value;
      });
      for (let i = 0; i < n; i += 1) {
        b[i][i] = -b[i].reduce((sum, value) => sum + value, 0);
      }
      coordinates = centre(
        coordinates.map((row, i) => {
          const next = new Array<number>(dimensions).fill(0);
          for (let j = 0; j < n; j += 1) {
            const weight = b[i][j];
            if (weight === 0) continue;
            for (let column = 0; column < dimensions; column += 1) {
              next[column] += weight * (coordinates[j][column] ?? 0);
            }
          }
          return next.map(value => value / n);
        })
      );
      // Fix the arbitrary scale: the mean squared coordinate is one.
      const scale = Math.sqrt(
        coordinates.reduce(
          (sum, row) => sum + row.reduce((inner, value) => inner + value * value, 0),
          0
        ) / Math.max(1, n * dimensions)
      );
      if (scale > 0) coordinates = coordinates.map(row => row.map(value => value / scale));
    }
  }

  const distances = pairsIndex.map(pair => distance(coordinates[pair.i], coordinates[pair.j]));
  const rawDisparities =
    input.metric === 'nonmetric'
      ? isotonic(distances, pairsIndex.map(pair => pair.dissimilarity))
      : distances;
  const disparityScale =
    input.metric === 'nonmetric'
      ? (() => {
          const numerator = distances.reduce((sum, value, index) => sum + value * rawDisparities[index], 0);
          const denominator = rawDisparities.reduce((sum, value) => sum + value * value, 0);
          return denominator > 0 ? numerator / denominator : 1;
        })()
      : 1;
  const disparities = rawDisparities.map(value => value * disparityScale);
  const pairs: MdsPair[] = pairsIndex.map((pair, index) => ({
    ...pair,
    distance: distances[index],
    disparity: disparities[index],
  }));
  if (input.metric === 'nonmetric') {
    stress = stressOf(pairs);
  } else {
    // Kruskal stress formula 1 on the raw dissimilarities: a descriptive fit
    // index for the classical solution, not an objective it optimises.
    stress = stressOf(
      pairs.map(pair => ({ distance: pair.distance, disparity: pair.dissimilarity }))
    );
  }

  return {
    metric: input.metric,
    dimensions,
    labels: input.labels,
    coordinates,
    points: coordinates.map((row, index) => ({
      row: index + 1,
      label: input.labels[index] ?? `Riga ${index + 1}`,
      coordinates: row,
    })),
    eigenvalues: initial.eigenvalues,
    stress,
    pairs,
    iterations: iterations + 1,
  };
};
