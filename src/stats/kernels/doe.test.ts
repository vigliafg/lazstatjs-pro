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
