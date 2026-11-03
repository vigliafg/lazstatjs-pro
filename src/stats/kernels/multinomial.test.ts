import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { jStat } from '../jstat';
import { fitMultinomial, type MultinomialResult } from './multinomial';

const close = (actual: number, expected: number, tolerance = 1e-8) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

/** Deterministic pseudo-uniform value in [0, 1). */
const uniform = (index: number, salt: number): number => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

/**
 * Deterministic three-or-more-class design with overlapping classes. Labels are
 * drawn from a softmax model of the predictors, so the MLE is finite and the
 * kernel has real signal to recover (accuracy well above chance).
 */
const makeData = (
  classes: number,
  predictors: number,
  n: number
): { y: number[]; x: number[][] } => {
  const y: number[] = [];
  const x: number[][] = [];
  for (let i = 0; i < n; i += 1) {
    const row = [1, ...Array.from({ length: predictors }, (_, j) => (uniform(i, j + 1) - 0.5) * 4)];
    const scores = Array.from({ length: classes }, (_, k) => {
      let sum = 0.3 * Math.sin(k + 1);
      for (let j = 1; j < row.length; j += 1) sum += row[j] * Math.cos((k + 1) * (j + 1));
      return sum;
    });
    const maximum = Math.max(...scores);
    const exponentials = scores.map(value => Math.exp(value - maximum));
    const total = exponentials.reduce((sum, value) => sum + value, 0);
    const probabilities = exponentials.map(value => value / total);

    let target = uniform(i, classes + 7);
    let chosen = classes - 1;
    for (let k = 0; k < classes; k += 1) {
      if (target < probabilities[k]) {
        chosen = k;
        break;
      }
      target -= probabilities[k];
    }
    y.push(chosen);
    x.push(row);
  }
  return { y, x };
};

const data = makeData(3, 2, 180);

const fitted = (): MultinomialResult => {
  const result = fitMultinomial({ y: data.y, x: data.x });
  assert.ok(result, 'model did not converge');
  return result!;
};

describe('multinomial logistic regression', () => {
  it('fits a three-class softmax model with the documented contract', () => {
    const model = fitted();
    assert.deepEqual(model.classes, ['0', '1', '2']);
    assert.equal(model.referenceClass, 0);
    assert.equal(model.n, data.y.length);
    assert.equal(model.p, data.x[0].length);
    assert.equal(model.converged, true);
    assert.ok(model.iterations > 0);

    assert.equal(model.coefficients.length, 2);
    assert.deepEqual(model.coefficients.map(row => row.length), [3, 3]);
    assert.deepEqual(model.standardErrors.map(row => row.length), [3, 3]);
    assert.deepEqual(model.z.map(row => row.length), [3, 3]);
    assert.deepEqual(model.pValues.map(row => row.length), [3, 3]);

    // The predictors carry signal, so the slopes must not all be zero.
    assert.ok(model.coefficients.some(row => row.slice(1).some(value => Math.abs(value) > 0.1)));
  });

  it('derives standard errors, z statistics and two-sided normal p-values', () => {
    const model = fitted();
    for (let k = 0; k < model.coefficients.length; k += 1) {
      for (let j = 0; j < model.p; j += 1) {
        const beta = model.coefficients[k][j];
        const se = model.standardErrors[k][j];
        assert.ok(se > 0, 'standard error must be positive');
        close(model.z[k][j], beta / se, 1e-10);
        const expected = 2 * (1 - jStat.normal.cdf(Math.abs(beta / se), 0, 1));
        close(model.pValues[k][j], expected, 1e-10);
        assert.ok(model.pValues[k][j] >= 0 && model.pValues[k][j] <= 1);
      }
    }
  });

  it('computes probabilities, predictions and accuracy consistently', () => {
    const model = fitted();
    assert.equal(model.fitted.length, data.y.length);
    for (let i = 0; i < model.fitted.length; i += 1) {
      const row = model.fitted[i];
      assert.equal(row.length, 3);
      assert.ok(row.every(value => value > 0 && value < 1));
      close(row.reduce((sum, value) => sum + value, 0), 1, 1e-12);
      assert.equal(model.predicted[i], row.indexOf(Math.max(...row)));
    }
    const accuracy =
      model.predicted.reduce((sum, value, index) => sum + (value === data.y[index] ? 1 : 0), 0) /
      data.y.length;
    close(model.accuracy, accuracy, 1e-12);
    assert.ok(model.accuracy > 1 / 3, 'the model should beat chance');
  });

  it('reports logLik, deviance and AIC from the fitted probabilities', () => {
    const model = fitted();
    const logLik = model.fitted.reduce(
      (sum, row, index) => sum + Math.log(row[data.y[index]]),
      0
    );
    close(model.logLik, logLik, 1e-9);
    close(model.deviance, -2 * logLik, 1e-8);
    close(model.aic, -2 * logLik + 2 * (3 - 1) * model.p, 1e-8);
  });

  it('accepts custom class labels and a four-class response', () => {
    const four = makeData(4, 2, 180);
    const model = fitMultinomial({
      y: four.y,
      x: four.x,
      classes: ['north', 'east', 'south', 'west'],
    });
    assert.ok(model);
    assert.deepEqual(model!.classes, ['north', 'east', 'south', 'west']);
    assert.equal(model!.referenceClass, 0);
    assert.equal(model!.coefficients.length, 3);
    assert.equal(model!.fitted[0].length, 4);
    assert.equal(model!.predicted.length, four.y.length);
    assert.ok(model!.coefficients.every(row => row.length === four.x[0].length));
  });

  it('rejects invalid inputs', () => {
    const y = [0, 1, 2, 0, 1, 2];
    const x = [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]];
    assert.equal(fitMultinomial({ y: [], x: [] }), null);
    assert.equal(fitMultinomial({ y, x: x.slice(1) }), null);
    assert.equal(fitMultinomial({ y: [0, 1, 1, 0, 1, 1], x }), null);
    assert.equal(fitMultinomial({ y: [0, 1, 1.5, 0, 1, 2], x }), null);
    assert.equal(fitMultinomial({ y: [0, 1, 2, 0, 1, -1], x }), null);
    // A missing intermediate class leaves the reference contrast unidentified.
    assert.equal(fitMultinomial({ y: [0, 2, 0, 2, 0, 2], x }), null);
    assert.equal(
      fitMultinomial({ y, x: x.map((row, index) => (index === 2 ? [1, 2, 3] : row)) }),
      null
    );
    assert.equal(fitMultinomial({ y, x: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, Number.NaN]] }), null);
    assert.equal(fitMultinomial({ y, x: [[1, 0], [1], [1, 2], [1, 3], [1, 4], [1, 5]] }), null);
    assert.equal(fitMultinomial({ y, x: [[], [], [], [], [], []] }), null);
    assert.equal(fitMultinomial({ y, x, classes: ['a', 'b'] }), null);
    // (K - 1) * p must be smaller than n.
    assert.equal(
      fitMultinomial({ y: [0, 1, 2, 0], x: [[1, 0], [1, 1], [1, 2], [1, 3]] }),
      null
    );
  });

  it('returns null when the iteration budget is exhausted', () => {
    assert.equal(fitMultinomial({ y: data.y, x: data.x, maxIterations: 1 }), null);
    assert.equal(fitMultinomial({ y: data.y, x: data.x, maxIterations: 0 }), null);
    assert.equal(fitMultinomial({ y: data.y, x: data.x, tolerance: 0 }), null);
  });
});
