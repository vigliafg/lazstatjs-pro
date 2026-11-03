import test from 'node:test';
import assert from 'node:assert/strict';
import { spatialAnalysis } from '../kernels/spatial';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface SpatialFixture {
  source: string;
  data: { X: number; Y: number; Covariate: number; Value: number }[];
  k: number;
  moran: { i: number; expected: number; se: number; p: number };
  geary: { c: number; expected: number; p: number };
  local: { index: number[]; value: number[]; p: number[] };
  sar: {
    rho: number;
    coefficients: number[];
    se: number[];
    logLik: number;
    lr: number;
  };
}

const fixture = loadFixture<SpatialFixture>('spatialW9.json');
const points = fixture.data.map(row => ({
  x: row.X,
  y: row.Y,
  value: row.Value,
  predictors: [row.Covariate],
}));

test('Moran and Geary statistics reproduce spdep', () => {
  const moran = spatialAnalysis(points, {
    mode: 'moran',
    k: fixture.k,
    permutations: 199,
    seed: 1,
    predictorNames: ['Covariate'],
  });
  assert.ok(moran);
  assertClose(moran!.moran!.i, fixture.moran.i, TOLERANCES.r, 'Moran I');
  assertClose(moran!.moran!.expected, fixture.moran.expected, TOLERANCES.r, 'Moran expectation');
  assertClose(moran!.moran!.se, fixture.moran.se, TOLERANCES.r, 'Moran SE');
  assertClose(moran!.moran!.p, fixture.moran.p, TOLERANCES.rProbability, 'Moran p');

  const geary = spatialAnalysis(points, {
    mode: 'geary',
    k: fixture.k,
    permutations: 199,
    seed: 1,
    predictorNames: ['Covariate'],
  });
  assert.ok(geary);
  assertClose(geary!.geary!.c, fixture.geary.c, TOLERANCES.r, 'Geary C');
  assertClose(geary!.geary!.expected, fixture.geary.expected, TOLERANCES.r, 'Geary expectation');
});

test('local Moran indicators reproduce spdep::localmoran', () => {
  const result = spatialAnalysis(points, {
    mode: 'lisa',
    k: fixture.k,
    permutations: 199,
    seed: 1,
    predictorNames: ['Covariate'],
  });
  assert.ok(result);
  fixture.local.value.forEach((value, index) => {
    assertClose(result!.lisa[index].local, value, TOLERANCES.r, `local I ${index + 1}`);
  });
});

test('spatial lag reproduces spatialreg::lagsarlm', () => {
  const result = spatialAnalysis(points, {
    mode: 'sar',
    k: fixture.k,
    permutations: 199,
    seed: 1,
    predictorNames: ['Covariate'],
  });
  assert.ok(result && result.sar);
  assertClose(result!.sar!.rho, fixture.sar.rho, { absolute: 1e-4 }, 'rho');
  result!.sar!.coefficients.forEach((coefficient, index) => {
    assertClose(coefficient.estimate, fixture.sar.coefficients[index], { absolute: 1e-4 }, `beta ${index}`);
  });
  assertClose(result!.sar!.logLik, fixture.sar.logLik, { absolute: 1e-4 }, 'log likelihood');
  assertClose(result!.sar!.lr, fixture.sar.lr, { absolute: 1e-4 }, 'LR statistic');
});
