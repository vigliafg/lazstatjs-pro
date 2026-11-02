/**
 * Quadratic response surface for two numeric factors.
 *
 * The kernel fits the model, evaluates it on a regular grid, projects the grid
 * for the 3D-looking mesh (the scatter3d convention: a projected 2D drawing,
 * not a WebGL scene) and extracts contour segments with marching squares.
 */
import { tSF, fSF } from './distributions';
import { invert, zeros } from './matrix';

export interface DoeInput {
  response: number[];
  factorA: number[];
  factorB: number[];
  model: 'linear' | 'quadratic';
}

import type { DoeGridPoint, DoeResult, DoeTerm } from '../analysisResults';

export type { DoeGridPoint, DoeResult, DoeTerm } from '../analysisResults';

const columnsFor = (a: number[], b: number[], model: 'linear' | 'quadratic'): number[][] =>
  a.map((value, index) => {
    const base = [1, value, b[index]];
    if (model === 'linear') return base;
    return [...base, value * value, value * b[index], b[index] * b[index]];
  });

const termNames = (model: 'linear' | 'quadratic'): string[] =>
  model === 'linear'
    ? ['Intercetta', 'A', 'B']
    : ['Intercetta', 'A', 'B', 'A²', 'A·B', 'B²'];

export const responseSurface = (input: DoeInput): DoeResult | null => {
  const { response, factorA, factorB, model } = input;
  const n = response.length;
  if (n < 6 || factorA.length !== n || factorB.length !== n) return null;
  const x = columnsFor(factorA, factorB, model);
  const p = x[0].length;
  if (n <= p) return null;

  const xtx = zeros(p, p);
  const xty = new Array<number>(p).fill(0);
  for (let row = 0; row < n; row += 1) {
    for (let i = 0; i < p; i += 1) {
      xty[i] += x[row][i] * response[row];
      for (let j = 0; j < p; j += 1) xtx[i][j] += x[row][i] * x[row][j];
    }
  }
  const inverse = invert(xtx);
  if (!inverse) return null;
  const beta = inverse.map(row => row.reduce((sum, value, index) => sum + value * xty[index], 0));
  const fitted = x.map(row => row.reduce((sum, value, index) => sum + value * beta[index], 0));
  const sse = response.reduce((sum, value, index) => sum + Math.pow(value - fitted[index], 2), 0);
  const mean = response.reduce((sum, value) => sum + value, 0) / n;
  const sst = response.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0);
  const df = n - p;
  const sigma2 = df > 0 ? sse / df : NaN;
  const terms: DoeTerm[] = termNames(model).map((name, index) => {
    const se = Math.sqrt(Math.max(0, sigma2 * inverse[index][index]));
    const t = se > 0 ? beta[index] / se : NaN;
    return { name, estimate: beta[index], se, t, p: tSF(t, df) };
  });
  const r2 = sst > 0 ? 1 - sse / sst : 0;
  const adjR2 = sst > 0 && df > 0 ? 1 - (sse / df) / (sst / (n - 1)) : r2;
  const modelDf = p - 1;
  const f = modelDf > 0 && sigma2 > 0 ? (sst - sse) / modelDf / sigma2 : NaN;
  const fP = fSF(f, modelDf, df);

  const aMin = Math.min(...factorA);
  const aMax = Math.max(...factorA);
  const bMin = Math.min(...factorB);
  const bMax = Math.max(...factorB);
  const steps = 13;
  const stepA = (aMax - aMin) / (steps - 1);
  const stepB = (bMax - bMin) / (steps - 1);
  const gridValues: { a: number; b: number; z: number }[] = [];
  for (let i = 0; i < steps; i += 1) {
    for (let j = 0; j < steps; j += 1) {
      const a = aMin + stepA * i;
      const b = bMin + stepB * j;
      const z = predict(beta, a, b, model);
      gridValues.push({ a, b, z });
    }
  }
  const zMin = Math.min(...gridValues.map(point => point.z));
  const zMax = Math.max(...gridValues.map(point => point.z));
  const spanA = Math.max(1e-9, aMax - aMin);
  const spanB = Math.max(1e-9, bMax - bMin);
  const spanZ = Math.max(1e-9, zMax - zMin);
  const project = (a: number, b: number, z: number): { x: number; y: number } => {
    const an = (a - aMin) / spanA;
    const bn = (b - bMin) / spanB;
    const zn = (z - zMin) / spanZ;
    const x = 0.5 + 0.42 * (an - bn);
    const y = 0.12 + 0.5 * zn + 0.28 * (1 - (an + bn) / 2);
    return { x: Math.max(0.02, Math.min(0.98, x)), y: Math.max(0.02, Math.min(0.98, y)) };
  };
  const grid: DoeGridPoint[][] = Array.from({ length: steps }, (_, i) =>
    Array.from({ length: steps }, (_, j) => {
      const a = aMin + stepA * i;
      const b = bMin + stepB * j;
      const z = predict(beta, a, b, model);
      const { x, y } = project(a, b, z);
      return { a, b, z, x, y };
    })
  );
  const mesh: DoeResult['mesh'] = [];
  grid.forEach(row => {
    for (let j = 0; j < row.length - 1; j += 1) {
      mesh.push({
        x1: row[j].x,
        y1: row[j].y,
        x2: row[j + 1].x,
        y2: row[j + 1].y,
        z: (row[j].z + row[j + 1].z) / 2,
      });
    }
  });
  for (let j = 0; j < steps; j += 1) {
    for (let i = 0; i < steps - 1; i += 1) {
      mesh.push({
        x1: grid[i][j].x,
        y1: grid[i][j].y,
        x2: grid[i + 1][j].x,
        y2: grid[i + 1][j].y,
        z: (grid[i][j].z + grid[i + 1][j].z) / 2,
      });
    }
  }
  const points = response.map((_, index) => {
    const z = predict(beta, factorA[index], factorB[index], model);
    const { x, y } = project(factorA[index], factorB[index], z);
    return { x, y, z };
  });
  const levels = Array.from({ length: 7 }, (_, index) => zMin + ((zMax - zMin) * (index + 1)) / 8);
  const contours: DoeResult['contours'] = [];
  levels.forEach(level => {
    for (let i = 0; i < steps - 1; i += 1) {
      for (let j = 0; j < steps - 1; j += 1) {
        const corners = [
          { a: grid[i][j].a, b: grid[i][j].b, z: grid[i][j].z },
          { a: grid[i + 1][j].a, b: grid[i + 1][j].b, z: grid[i + 1][j].z },
          { a: grid[i + 1][j + 1].a, b: grid[i + 1][j + 1].b, z: grid[i + 1][j + 1].z },
          { a: grid[i][j + 1].a, b: grid[i][j + 1].b, z: grid[i][j + 1].z },
        ];
        const intersections: { a: number; b: number }[] = [];
        for (let edge = 0; edge < 4; edge += 1) {
          const first = corners[edge];
          const second = corners[(edge + 1) % 4];
          const low = Math.min(first.z, second.z);
          const high = Math.max(first.z, second.z);
          if (level < low || level > high || first.z === second.z) continue;
          const ratio = (level - first.z) / (second.z - first.z);
          intersections.push({
            a: first.a + ratio * (second.a - first.a),
            b: first.b + ratio * (second.b - first.b),
          });
        }
        if (intersections.length >= 2) {
          contours.push({
            x1: intersections[0].a,
            y1: intersections[0].b,
            x2: intersections[1].a,
            y2: intersections[1].b,
            level,
          });
        }
      }
    }
  });

  const stationary = model === 'quadratic' ? stationaryPoint(beta) : null;

  return {
    terms,
    n,
    rank: p,
    r2,
    adjR2,
    rmse: Math.sqrt(Math.max(0, sigma2)),
    f,
    fP,
    aMin,
    aMax,
    bMin,
    bMax,
    grid,
    mesh,
    points,
    contours,
    levels,
    stationary,
  };
};

const predict = (
  beta: number[],
  a: number,
  b: number,
  model: 'linear' | 'quadratic'
): number =>
  model === 'linear'
    ? beta[0] + beta[1] * a + beta[2] * b
    : beta[0] + beta[1] * a + beta[2] * b + beta[3] * a * a + beta[4] * a * b + beta[5] * b * b;

/** Stationary point of the quadratic surface and its Hessian classification. */
const stationaryPoint = (
  beta: number[]
): { a: number; b: number; z: number; kind: 'minimum' | 'maximum' | 'saddle' } | null => {
  const b11 = beta[3] ?? 0;
  const b12 = beta[4] ?? 0;
  const b22 = beta[5] ?? 0;
  const det = 4 * b11 * b22 - b12 * b12;
  if (Math.abs(det) < 1e-12) return null;
  const a = (-2 * beta[1] * b22 + beta[2] * b12) / det;
  const b = (-2 * beta[2] * b11 + beta[1] * b12) / det;
  const z = beta[0] + beta[1] * a + beta[2] * b + b11 * a * a + b12 * a * b + b22 * b * b;
  const h11 = 2 * b11;
  const h22 = 2 * b22;
  const middle = (h11 + h22) / 2;
  const delta = Math.sqrt(Math.pow((h11 - h22) / 2, 2) + b12 * b12);
  const roots = [middle + delta, middle - delta];
  const kind =
    roots.every(value => value > 0) ? 'minimum' : roots.every(value => value < 0) ? 'maximum' : 'saddle';
  return { a, b, z, kind };
};
