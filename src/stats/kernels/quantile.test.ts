import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fitQuantile, type QuantileResult } from './quantile';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected} (${tolerance})`);

const design = (rows: number[][]): number[][] => rows.map(row => [1, ...row]);

/** Objective sum rho_tau(y - x beta) evaluated from scratch. */
const objectiveAt = (y: number[], x: number[][], beta: number[], tau: number): number =>
  y.reduce((sum, value, i) => {
    const residual = value - x[i].reduce((inner, cell, j) => inner + cell * beta[j], 0);
    return sum + (residual >= 0 ? tau * residual : (tau - 1) * residual);
  }, 0);

/**
 * Optimality of a quantile-regression fit: for every column, the sum of the
 * subgradient contributions of the non-zero residuals must be cancellable by
 * the zero-residual observations, whose subgradient lies in [tau - 1, tau].
 */
const assertStationary = (y: number[], x: number[][], fit: QuantileResult, tau: number) => {
  const p = x[0].length;
  for (let column = 0; column < p; column += 1) {
    let gradient = 0;
    let slack = 0;
    y.forEach((value, i) => {
      const residual = fit.residuals[i];
      const scale = Math.max(1, Math.abs(value));
      if (Math.abs(residual) > 1e-9 * scale) {
        gradient += x[i][column] * (residual > 0 ? tau : tau - 1);
      } else {
        slack += Math.max(tau, 1 - tau) * Math.abs(x[i][column]);
      }
    });
    assert.ok(
      Math.abs(gradient) <= slack + 1e-8,
      `column ${column}: |gradient| ${Math.abs(gradient)} exceeds slack ${slack}`
    );
  }
};

// Deterministic, slightly noisy line: enough observations for the sparsity
// estimate, small enough to read the expected values.
const noisyY = [2.3, 3.1, 4.9, 5.2, 7.1, 6.8, 8.4, 9.2, 10.6, 11.1, 12.4, 13.3];
const noisyX = design([
  [1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12],
]);

describe('quantile regression (exact LP)', () => {
  it('recovers an exact linear relation at every quantile', () => {
    const y = [1, 2, 3, 4, 5].map(value => 2 + 3 * value);
    const x = design([[1], [2], [3], [4], [5]]);
    for (const tau of [0.1, 0.25, 0.5, 0.9]) {
      const fit = fitQuantile({ y, x, tau });
      assert.ok(fit, `tau ${tau}: no fit`);
      close(fit!.coefficients[0].beta, 2, 1e-9);
      close(fit!.coefficients[1].beta, 3, 1e-9);
      close(fit!.objective, 0, 1e-9);
      assert.equal(fit!.converged, true);
      assert.equal(fit!.n, 5);
      assert.equal(fit!.p, 2);
      assert.equal(fit!.tau, tau);
      assert.equal(fit!.coefficients.length, 2);
    }
  });

  it('matches the median-regression vertex of a hand-computable case', () => {
    const y = [2.1, 3.9, 6.2, 7.8, 10.1];
    const x = design([[1], [2], [3], [4], [5]]);
    const fit = fitQuantile({ y, x, tau: 0.5 });
    assert.ok(fit);
    close(fit!.coefficients[0].beta, 0.1, 1e-9);
    close(fit!.coefficients[1].beta, 2.0, 1e-9);
    close(fit!.objective, 0.3, 1e-9);
    // residuals y - (0.1 + 2 x) = 0, -0.2, 0.1, -0.3, 0
    close(fit!.residuals[1], -0.2, 1e-9);
    close(fit!.residuals[3], -0.3, 1e-9);
  });

  it('reduces to the sample quantile for an intercept-only model', () => {
    const y = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const x = y.map(() => [1]);
    const median = fitQuantile({ y, x, tau: 0.5 });
    const lower = fitQuantile({ y, x, tau: 0.25 });
    assert.ok(median && lower);
    close(median!.coefficients[0].beta, 5, 1e-9);
    close(median!.objective, 12.5, 1e-9); // 0.5 * (10 + 8 + 6 + 4 + 2)
    close(lower!.coefficients[0].beta, 3, 1e-9);
    close(lower!.objective, 9.25, 1e-9); // 0.25 * 17 + 0.75 * 7
  });

  it('satisfies the subgradient stationarity conditions', () => {
    for (const tau of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      const fit = fitQuantile({ y: noisyY, x: noisyX, tau });
      assert.ok(fit, `tau ${tau}: no fit`);
      assertStationary(noisyY, noisyX, fit!, tau);
      close(fit!.objective, objectiveAt(noisyY, noisyX, fit!.coefficients.map(c => c.beta), tau), 1e-9);
    }
  });

  it('does not decrease the objective under small coefficient perturbations', () => {
    const fit = fitQuantile({ y: noisyY, x: noisyX, tau: 0.4 });
    assert.ok(fit);
    const beta = fit!.coefficients.map(coefficient => coefficient.beta);
    for (const direction of [
      [1, 0],
      [0, 1],
      [1, -1],
      [-0.5, 2],
    ]) {
      for (const step of [-1e-3, 1e-3]) {
        const moved = beta.map((value, index) => value + step * direction[index]);
        assert.ok(
          objectiveAt(noisyY, noisyX, moved, 0.4) >= fit!.objective - 1e-10,
          `objective improved along ${direction} by ${step}`
        );
      }
    }
  });

  it('keeps fitted values consistent with the residuals and the response', () => {
    const fit = fitQuantile({ y: noisyY, x: noisyX, tau: 0.3 });
    assert.ok(fit);
    assert.equal(fit!.fitted.length, noisyY.length);
    assert.equal(fit!.residuals.length, noisyY.length);
    noisyY.forEach((value, i) => close(fit!.fitted[i] + fit!.residuals[i], value, 1e-9));
  });

  it('is equivariant under a positive rescaling of the response', () => {
    const base = fitQuantile({ y: noisyY, x: noisyX, tau: 0.6 });
    const scaled = fitQuantile({ y: noisyY.map(value => value * 10), x: noisyX, tau: 0.6 });
    assert.ok(base && scaled);
    base!.coefficients.forEach((coefficient, index) => {
      close(scaled!.coefficients[index].beta, 10 * coefficient.beta, 1e-8);
      // The Powell sparsity divides by `dyhat - sqrt(eps)`, and that absolute
      // offset makes the standard errors only approximately equivariant.
      close(scaled!.coefficients[index].se, 10 * coefficient.se, 1e-6);
    });
    close(scaled!.objective, 10 * base!.objective, 1e-8);
  });

  it('reports standard errors, t statistics and two-sided normal intervals', () => {
    const fit = fitQuantile({ y: noisyY, x: noisyX, tau: 0.5 });
    assert.ok(fit);
    for (const coefficient of fit!.coefficients) {
      assert.ok(coefficient.se > 0, `se ${coefficient.se}`);
      close(coefficient.t, coefficient.beta / coefficient.se, 1e-9);
      close(coefficient.ciLo, coefficient.beta - 1.959963984540054 * coefficient.se, 1e-9);
      close(coefficient.ciHi, coefficient.beta + 1.959963984540054 * coefficient.se, 1e-9);
      assert.ok(coefficient.ciLo < coefficient.beta && coefficient.beta < coefficient.ciHi);
      assert.ok(coefficient.p >= 0 && coefficient.p <= 1, `p ${coefficient.p}`);
    }
  });

  it('returns a well formed fit for the mtcars reference model', () => {
    // mpg ~ wt + hp, first six cars, enough for a smoke check of the contract.
    const y = [21, 21, 22.8, 21.4, 18.7, 18.1, 14.3, 24.4, 22.8, 19.2];
    const x = design([
      [2.62, 110], [2.875, 110], [2.32, 93], [3.215, 110], [3.44, 175],
      [3.46, 105], [3.57, 245], [3.19, 62], [3.15, 95], [3.44, 123],
    ]);
    const fit = fitQuantile({ y, x, tau: 0.25 });
    assert.ok(fit);
    assert.equal(fit!.coefficients.length, 3);
    assert.ok(Number.isFinite(fit!.objective));
    assertStationary(y, x, fit!, 0.25);
  });

  it('leaves the standard errors undefined when the fit is exact', () => {
    // Every residual is zero, so the sparsity estimate has no variation.
    const y = [1, 2, 3, 4, 5].map(value => 2 + 3 * value);
    const x = design([[1], [2], [3], [4], [5]]);
    const fit = fitQuantile({ y, x, tau: 0.5 });
    assert.ok(fit);
    assert.ok(fit!.coefficients.every(coefficient => Number.isNaN(coefficient.se)));
    assert.ok(fit!.coefficients.every(coefficient => Number.isNaN(coefficient.p)));
  });

  it('rejects invalid inputs', () => {
    const y = [1, 2, 3, 4, 5];
    const x = design([[1], [2], [3], [4], [5]]);
    assert.equal(fitQuantile({ y: [], x: [], tau: 0.5 }), null);
    assert.equal(fitQuantile({ y, x, tau: 0 }), null);
    assert.equal(fitQuantile({ y, x, tau: 1 }), null);
    assert.equal(fitQuantile({ y, x, tau: -0.2 }), null);
    assert.equal(fitQuantile({ y, x, tau: 1.2 }), null);
    assert.equal(fitQuantile({ y, x: x.slice(0, 4), tau: 0.5 }), null);
    assert.equal(fitQuantile({ y, x: x.map(row => [row[0], 1]), tau: 0.5 }), null);
    assert.equal(
      fitQuantile({ y: [1, 2, Number.NaN, 4, 5], x, tau: 0.5 }),
      null
    );
    assert.equal(
      fitQuantile({ y, x: x.map((row, i) => (i === 2 ? [Number.POSITIVE_INFINITY] : row)), tau: 0.5 }),
      null
    );
    // No residual degrees of freedom.
    assert.equal(fitQuantile({ y, x: y.map(() => [1, 1]), tau: 0.5 }), null);
  });

  it('returns null for a singular design', () => {
    const y = [1, 2, 3, 4, 5, 6];
    const x = design([[1], [2], [3], [4], [5], [6]]).map((row, i) => [...row, row[1] * 2 + i]);
    assert.equal(fitQuantile({ y, x, tau: 0.5 }), null);
  });

  it('returns null when the pivot budget is exhausted', () => {
    const y = [2.1, 3.9, 6.2, 7.8, 10.1];
    const x = design([[1], [2], [3], [4], [5]]);
    // This vertex needs two pivots from the initial basis.
    assert.equal(fitQuantile({ y, x, tau: 0.25, maxIterations: 1 }), null);
    assert.ok(fitQuantile({ y, x, tau: 0.25, maxIterations: 100 }));
  });
});
