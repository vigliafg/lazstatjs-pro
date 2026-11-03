import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bfgs, emAlgorithm, newtonOptimize, newtonRoot } from './optimize';

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

describe('optimisation primitives', () => {
  it('finds a scalar root with Newton–Raphson', () => {
    const result = newtonRoot(
      x => x * x - 2,
      x => 2 * x,
      1
    );
    assert.equal(result.converged, true);
    close(result.x, Math.SQRT2, 1e-10);
    close(result.fx, 0, 1e-10);
  });

  it('minimises a quadratic form with Newton', () => {
    const objective = (x: number[]) => (x[0] - 3) ** 2 + 2 * (x[1] + 1) ** 2;
    const gradient = (x: number[]) => [2 * (x[0] - 3), 4 * (x[1] + 1)];
    const hessian = () => [
      [2, 0],
      [0, 4],
    ];
    const result = newtonOptimize(objective, gradient, hessian, [0, 0]);
    assert.equal(result.converged, true);
    close(result.x[0], 3, 1e-8);
    close(result.x[1], -1, 1e-8);
    close(result.value, 0, 1e-12);
  });

  it('minimises the same quadratic form with BFGS', () => {
    const objective = (x: number[]) => (x[0] - 3) ** 2 + 2 * (x[1] + 1) ** 2;
    const gradient = (x: number[]) => [2 * (x[0] - 3), 4 * (x[1] + 1)];
    const result = bfgs(objective, gradient, [0, 0]);
    assert.equal(result.converged, true);
    close(result.x[0], 3, 1e-4);
    close(result.x[1], -1, 1e-4);
  });

  it('runs a generic EM loop to the mean of a missing-data vector', () => {
    type State = { observed: number[]; values: number[]; mean: number };
    const initial: State = { observed: [1, 2, Number.NaN, 4, 5], values: [], mean: 0 };
    const eStep = (state: State): State => ({
      ...state,
      values: state.observed.map(value => (Number.isFinite(value) ? value : state.mean)),
    });
    const mStep = (state: State): State => ({
      ...state,
      mean: state.values.reduce((sum, value) => sum + value, 0) / state.values.length,
    });
    const logLik = (state: State) =>
      -state.values.reduce((sum, value) => sum + (value - state.mean) ** 2, 0);

    const result = emAlgorithm(initial, eStep, mStep, logLik, { tolerance: 1e-10 });
    assert.equal(result.converged, true);
    close(result.state.mean, 3, 1e-6);
  });
});
