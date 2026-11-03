import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fitNonlinear, nonlinearModelValue, type NonlinearModelType } from './nonlinear';

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected} (tolerance ${tolerance})`);

const closeRelative = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `${actual} != ${expected} (relative tolerance ${tolerance})`
  );

const sequence = (start: number, stop: number, count: number): number[] =>
  Array.from({ length: count }, (_, index) => start + ((stop - start) * index) / (count - 1));

/** Deterministic, small disturbance so the inference is not degenerate. */
const disturbance = (index: number): number => 0.01 * Math.sin(1.7 * index + 0.3);

interface SyntheticCase {
  model: NonlinearModelType;
  truth: number[];
  x: number[];
}

const synthetic: SyntheticCase[] = [
  { model: 'exponential', truth: [3, 0.4], x: sequence(0, 5, 40) },
  { model: 'logistic', truth: [10, 1.5, 2.5], x: sequence(0, 5, 40) },
  { model: 'gompertz', truth: [20, 2, 0.7], x: sequence(0, 6, 40) },
  { model: 'power', truth: [2.5, 0.8], x: sequence(0.5, 6, 40) },
  { model: 'michaelis', truth: [12, 3], x: sequence(0.2, 10, 40) },
];

const responseOf = (testCase: SyntheticCase): number[] =>
  testCase.x.map(
    (value, index) => nonlinearModelValue(testCase.model, testCase.truth, value) + disturbance(index)
  );

const PARAMETER_NAMES: Record<NonlinearModelType, string[]> = {
  exponential: ['a', 'b'],
  logistic: ['L', 'k', 'x0'],
  gompertz: ['a', 'b', 'c'],
  power: ['a', 'b'],
  michaelis: ['vmax', 'km'],
};

describe('nonlinear regression', () => {
  it('recovers the parameters of every model family', () => {
    for (const testCase of synthetic) {
      const y = responseOf(testCase);
      const fit = fitNonlinear({ x: testCase.x, y, model: testCase.model });
      assert.ok(fit, `${testCase.model}: model did not converge`);
      assert.equal(fit!.model, testCase.model);
      assert.equal(fit!.converged, true);
      assert.ok(fit!.iterations >= 1);
      assert.equal(fit!.n, 40);
      assert.equal(fit!.df, 40 - testCase.truth.length);
      assert.deepEqual(
        fit!.parameters.map(parameter => parameter.name),
        PARAMETER_NAMES[testCase.model]
      );
      fit!.parameters.forEach((parameter, index) => {
        close(parameter.estimate, testCase.truth[index], 0.01);
      });
    }
  });

  it('reports fitted values, residuals and fit statistics consistently', () => {
    for (const testCase of synthetic) {
      const y = responseOf(testCase);
      const fit = fitNonlinear({ x: testCase.x, y, model: testCase.model });
      assert.ok(fit);

      assert.equal(fit!.fitted.length, y.length);
      assert.equal(fit!.residuals.length, y.length);
      const estimates = fit!.parameters.map(parameter => parameter.estimate);
      let sse = 0;
      fit!.fitted.forEach((value, index) => {
        closeRelative(value, nonlinearModelValue(testCase.model, estimates, testCase.x[index]), 1e-12);
        closeRelative(fit!.residuals[index], y[index] - value, 1e-12);
        sse += fit!.residuals[index] ** 2;
      });
      closeRelative(fit!.sse, sse, 1e-12);

      const centre = y.reduce((sum, value) => sum + value, 0) / y.length;
      const total = y.reduce((sum, value) => sum + (value - centre) ** 2, 0);
      const r2 = 1 - fit!.sse / total;
      closeRelative(fit!.r2, r2, 1e-12);
      closeRelative(fit!.adjR2, 1 - ((1 - r2) * (y.length - 1)) / fit!.df, 1e-12);
      closeRelative(fit!.rmse, Math.sqrt(fit!.sse / fit!.df), 1e-12);
    }
  });

  it('produces Wald inference for each parameter', () => {
    for (const testCase of synthetic) {
      const fit = fitNonlinear({ x: testCase.x, y: responseOf(testCase), model: testCase.model });
      assert.ok(fit);
      for (const parameter of fit!.parameters) {
        assert.ok(parameter.se > 0, `${testCase.model}/${parameter.name}: expected a positive SE`);
        closeRelative(parameter.t, parameter.estimate / parameter.se, 1e-12);
        assert.ok(parameter.p >= 0 && parameter.p <= 1, `${testCase.model}/${parameter.name}: p`);
        assert.ok(parameter.ciLo < parameter.estimate);
        assert.ok(parameter.ciHi > parameter.estimate);
        closeRelative(
          parameter.estimate - parameter.ciLo,
          parameter.ciHi - parameter.estimate,
          1e-12
        );
      }
    }
  });

  it('evaluates each model formula directly', () => {
    close(nonlinearModelValue('exponential', [2, 0.5], 1), 2 * Math.exp(0.5), 1e-12);
    close(nonlinearModelValue('logistic', [10, 1.5, 2.5], 2.5), 5, 1e-12);
    close(nonlinearModelValue('gompertz', [20, 2, 0.7], 0), 20 * Math.exp(-2), 1e-12);
    close(nonlinearModelValue('power', [2.5, 0.8], 1), 2.5, 1e-12);
    close(nonlinearModelValue('michaelis', [12, 3], 3), 6, 1e-12);
    close(nonlinearModelValue('michaelis', [12, 3], 0), 0, 1e-12);

    // The logistic parameterisation uses k = 1 / scale, not R's SSlogis scale.
    close(nonlinearModelValue('logistic', [10, 2, 0], 0), 5, 1e-12);
    close(nonlinearModelValue('logistic', [10, 2, 0], 1), 10 / (1 + Math.exp(-2)), 1e-12);

    assert.ok(Number.isNaN(nonlinearModelValue('exponential', [1], 0)));
    assert.ok(Number.isNaN(nonlinearModelValue('logistic', [1, 1], 0)));
    assert.ok(Number.isNaN(nonlinearModelValue('power', [1, 1], 0)));
    assert.ok(Number.isNaN(nonlinearModelValue('michaelis', [1, 0], 0)));
    assert.ok(Number.isNaN(nonlinearModelValue('exponential', [Number.NaN, 1], 0)));
    assert.ok(Number.isNaN(nonlinearModelValue('exponential', [1, 1], Number.POSITIVE_INFINITY)));
    assert.ok(Number.isNaN(nonlinearModelValue('weibull' as NonlinearModelType, [1, 1], 1)));
  });

  it('rejects invalid inputs', () => {
    assert.equal(fitNonlinear({ x: [], y: [], model: 'exponential' }), null);
    assert.equal(fitNonlinear({ x: [1, 2, 3], y: [1, 2], model: 'exponential' }), null);
    assert.equal(fitNonlinear({ x: [1, 2], y: [1, 2], model: 'power' }), null);
    assert.equal(fitNonlinear({ x: [1, 2, 3], y: [1, Number.NaN, 3], model: 'exponential' }), null);
    assert.equal(
      fitNonlinear({ x: [1, 2, Number.POSITIVE_INFINITY], y: [1, 2, 3], model: 'exponential' }),
      null
    );
    assert.equal(fitNonlinear({ x: [0, 1, 2], y: [1, 2, 3], model: 'power' }), null);
    assert.equal(
      fitNonlinear({
        x: [1, 2, 3, 4],
        y: [1, 2, 3, 4],
        model: 'exponential',
        initial: [1],
      }),
      null
    );
    assert.equal(
      fitNonlinear({
        x: [1, 2, 3, 4],
        y: [1, 2, 3, 4],
        model: 'exponential',
        initial: [1, Number.NaN],
      }),
      null
    );
    assert.equal(
      fitNonlinear({ x: [1, 2, 3, 4], y: [1, 2, 3, 4], model: 'exponential', maxIterations: 0 }),
      null
    );
    assert.equal(
      fitNonlinear({ x: [1, 2, 3, 4], y: [1, 2, 3, 4], model: 'exponential', tolerance: 0 }),
      null
    );
    assert.equal(
      fitNonlinear({ x: [1, 2, 3, 4], y: [1, 2, 3, 4], model: 'weibull' as NonlinearModelType }),
      null
    );
  });

  it('returns null when the iteration budget runs out', () => {
    for (const testCase of synthetic) {
      const fit = fitNonlinear({
        x: testCase.x,
        y: responseOf(testCase),
        model: testCase.model,
        maxIterations: 1,
      });
      assert.equal(fit, null, `${testCase.model}: a single iteration cannot converge`);
    }
  });

  it('honours explicit starting values', () => {
    const testCase = synthetic[0];
    const y = responseOf(testCase);
    const fit = fitNonlinear({
      x: testCase.x,
      y,
      model: testCase.model,
      initial: [3.2, 0.35],
    });
    assert.ok(fit);
    fit!.parameters.forEach((parameter, index) => close(parameter.estimate, testCase.truth[index], 0.01));
  });

  it('fits an exact curve without noise', () => {
    const x = sequence(0, 5, 20);
    const y = x.map(value => nonlinearModelValue('exponential', [3, 0.4], value));
    const fit = fitNonlinear({ x, y, model: 'exponential' });
    assert.ok(fit);
    assert.ok(fit!.sse < 1e-20, `exact fit SSE ${fit!.sse}`);
    close(fit!.r2, 1, 1e-12);
    close(fit!.rmse, 0, 1e-10);
    fit!.parameters.forEach((parameter, index) => {
      close(parameter.estimate, [3, 0.4][index], 1e-8);
      assert.ok(parameter.se < 1e-10);
    });
  });

  it('reports degenerate inference on a constant response', () => {
    const x = sequence(0, 5, 20);
    const fit = fitNonlinear({ x, y: x.map(() => 5), model: 'exponential' });
    assert.ok(fit);
    close(fit!.parameters[0].estimate, 5, 1e-12);
    close(fit!.parameters[1].estimate, 0, 1e-12);
    assert.equal(fit!.sse, 0);
    assert.equal(fit!.r2, 1);
    assert.equal(fit!.rmse, 0);
    for (const parameter of fit!.parameters) {
      assert.equal(parameter.se, 0);
      assert.ok(Number.isNaN(parameter.t));
      assert.ok(Number.isNaN(parameter.p));
      assert.equal(parameter.ciLo, parameter.estimate);
      assert.equal(parameter.ciHi, parameter.estimate);
    }
  });
});
