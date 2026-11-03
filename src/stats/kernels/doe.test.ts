import test from 'node:test';
import assert from 'node:assert/strict';
import { responseSurface } from './doe';

const grid = () => {
  const response: number[] = [];
  const factorA: number[] = [];
  const factorB: number[] = [];
  for (const a of [1, 2, 3, 4, 5]) {
    for (const b of [1, 2, 3, 4, 5]) {
      factorA.push(a);
      factorB.push(b);
      response.push(10 + 2 * a + 3 * b + 0.5 * a * b);
    }
  }
  return { response, factorA, factorB };
};

test('quadratic surface fits an interaction model and builds mesh and contours', () => {
  const { response, factorA, factorB } = grid();
  const result = responseSurface({ response, factorA, factorB, model: 'quadratic' });
  assert.ok(result);
  assert.equal(result!.terms.length, 6);
  assert.ok(result!.r2 > 0.999);
  assert.equal(result!.n, 25);
  assert.ok(result!.mesh.length > 0);
  assert.ok(result!.contours.length > 0);
  assert.equal(result!.grid.length, 13);
  assert.ok(result!.points.length === 25);
  assert.ok(result!.stationary);
  assert.equal(result!.stationary!.kind, 'saddle');
});

test('linear surface keeps three terms and reports the fit', () => {
  const { response, factorA, factorB } = grid();
  const result = responseSurface({
    response: response.map(value => value + (value % 3) * 0.01),
    factorA,
    factorB,
    model: 'linear',
  });
  assert.ok(result);
  assert.equal(result!.terms.length, 3);
  assert.ok(result!.f > 0);
  assert.ok(result!.adjR2 <= result!.r2);
  assert.equal(result!.stationary, null);
});

const referenceClose = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

// Reference: R 4.x, lm(y ~ a*b + I(a^2) + I(b^2)) on the same 20 runs. The
// kernel orders the terms (Intercept, A, B, A^2, A*B, B^2); R orders
// (Intercept, a, b, I(a^2), I(b^2), a:b), so the expectations are permuted
// accordingly.
test('quadratic surface matches the R lm coefficients, errors and stationary point', () => {
  const factorA = [
    -1, -1, -1, -1, 0, 0, 0, 0, 1, 1, 1, 1, -1, 1, -1, 1, 0, 0, 1, -1,
  ];
  const factorB = [
    -1, 0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, 1, 1, -1, -1, 1, -1, 1, -1,
  ];
  const response = [
    4.2, 5.1, 6.0, 4.8, 6.3, 7.6, 8.4, 7.1, 9.1, 10.2, 11.4, 9.8, 5.9, 9.4, 4.1, 6.8, 7.2, 7.9,
    10.6, 4.5,
  ];
  const result = responseSurface({ response, factorA, factorB, model: 'quadratic' });
  assert.ok(result);

  const estimates = [
    7.5386792452830171,
    2.2177083333333334,
    0.82604166666666723,
    -0.15801886792452846,
    0.20047169811320742,
    -0.18301886792452807,
  ];
  const standardErrors = [
    0.42140565802150542,
    0.21755431399266409,
    0.21755431399266412,
    0.39515861414337711,
    0.25953605920073125,
    0.39515861414337711,
  ];
  const pValues = [
    4.8489551719038229e-11,
    7.3607675564786963e-08,
    0.0019626144728379113,
    0.69527420776681548,
    0.45270714200288287,
    0.65037249508157313,
  ];
  result!.terms.forEach((term, index) => {
    referenceClose(term.estimate, estimates[index], 1e-9);
    referenceClose(term.se, standardErrors[index], 1e-9);
    referenceClose(term.p, pValues[index], 1e-8);
  });

  referenceClose(result!.r2, 0.90473690801042872, 1e-12);
  referenceClose(result!.adjR2, 0.87071437515701033, 1e-12);
  referenceClose(result!.rmse, 0.80566462674654904, 1e-12);
  referenceClose(result!.f, 26.59228552760521, 1e-9);
  assert.equal(result!.n, 20);

  // Stationary point from the fitted surface: a maximum.
  assert.ok(result!.stationary);
  referenceClose(result!.stationary!.a, 12.946432676579361, 1e-9);
  referenceClose(result!.stationary!.b, 9.3472193568035671, 1e-9);
  referenceClose(result!.stationary!.z, 25.754981390274008, 1e-9);
  assert.equal(result!.stationary!.kind, 'maximum');
});
