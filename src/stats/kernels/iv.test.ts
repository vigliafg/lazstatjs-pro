import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fitIv } from './iv';

const close = (actual: number, expected: number, tolerance = 1e-8) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

const column = (values: number[]): number[][] => values.map(value => [value]);

/**
 * Synthetic endogenous model with two excluded instruments:
 *   X = 0.4 + 0.7 W + 0.6 Z1 + 0.4 Z2 + v
 *   Y = 1.0 + 0.3 W + 1.5 X + u
 * The noise is deterministic but the regressors are not collinear.
 */
const n = 60;
const w = Array.from({ length: n }, (_, index) => Math.sin(index * 0.7));
const z1 = Array.from({ length: n }, (_, index) => Math.cos(index * 0.31) + index * 0.01);
const z2 = Array.from({ length: n }, (_, index) => Math.sin(index * 0.13 + 1) - index * 0.005);
const v = Array.from({ length: n }, (_, index) => 0.4 * Math.cos(index * 1.7));
const u = Array.from({ length: n }, (_, index) => 0.5 * Math.sin(index * 2.3));
const x = w.map((value, index) => 0.4 + 0.7 * value + 0.6 * z1[index] + 0.4 * z2[index] + v[index]);
const y = x.map((value, index) => 1 + 0.3 * w[index] + 1.5 * value + u[index]);

const endog = column(x);
const instruments = z1.map((_, row) => [z1[row], z2[row]]);
const exog = column(w);

describe('IV / 2SLS kernel', () => {
  it('recovers the structural coefficients of a synthetic model', () => {
    const fit = fitIv({ y, endog, instruments, exog });
    assert.ok(fit);
    assert.equal(fit!.n, n);
    assert.equal(fit!.p, 3);
    assert.equal(fit!.dfResidual, n - 3);
    close(fit!.coefficients[0].beta, 1, 0.15);
    close(fit!.coefficients[1].beta, 0.3, 0.15);
    close(fit!.coefficients[2].beta, 1.5, 0.15);
    assert.ok(fit!.coefficients.every(value => Number.isFinite(value.se) && value.se > 0));
    assert.ok(fit!.r2 >= 0 && fit!.r2 <= 1);
    assert.ok(fit!.adjR2 <= fit!.r2);
    close(
      fit!.sigma,
      Math.sqrt(fit!.residuals.reduce((sum, value) => sum + value ** 2, 0) / fit!.dfResidual)
    );
  });

  it('keeps fitted values and residuals consistent with the response', () => {
    const fit = fitIv({ y, endog, instruments, exog });
    assert.ok(fit);
    fit!.fitted.forEach((value, index) => close(value + fit!.residuals[index], y[index], 1e-9));
  });

  it('reports the first stage, Sargan and Wu–Hausman diagnostics', () => {
    const fit = fitIv({ y, endog, instruments, exog });
    assert.ok(fit);
    assert.equal(fit!.firstStage.length, 1);
    const stage = fit!.firstStage[0];
    assert.equal(stage.endog, 'endog1');
    assert.equal(stage.coefficients.length, 4); // intercept, W, Z1, Z2
    assert.equal(stage.df1, 2);
    assert.equal(stage.df2, n - 4);
    assert.ok(stage.f > 0);
    assert.ok(stage.p >= 0 && stage.p <= 1);

    // Two excluded instruments for one endogenous regressor: over-identified.
    assert.ok(fit!.sargan);
    assert.equal(fit!.sargan!.df, 1);
    assert.ok(fit!.sargan!.statistic >= 0);
    assert.equal(fit!.wuHausman.df1, 1);
    assert.equal(fit!.wuHausman.df2, n - 4);
  });

  it('changes only the standard errors when robust is requested', () => {
    const homoskedastic = fitIv({ y, endog, instruments, exog });
    const robust = fitIv({ y, endog, instruments, exog, robust: true });
    assert.ok(homoskedastic && robust);
    homoskedastic!.coefficients.forEach((value, index) => {
      close(robust!.coefficients[index].beta, value.beta, 1e-12);
      assert.notEqual(robust!.coefficients[index].se, value.se);
      assert.ok(robust!.coefficients[index].se > 0);
    });
    assert.ok(robust!.sargan);
    close(robust!.sargan!.statistic, homoskedastic!.sargan!.statistic, 1e-9);
    close(robust!.wuHausman.statistic, homoskedastic!.wuHausman.statistic, 1e-9);
  });

  it('reduces to OLS when the instruments coincide with the regressor', () => {
    // Just identified: Z = X, so the projection is the identity and 2SLS = OLS.
    const fit = fitIv({ y, endog, instruments: endog, exog });
    assert.ok(fit);
    const design = y.map((_, index) => [1, w[index], x[index]]);
    const xt = [0, 1, 2].map(columnIndex => design.map(row => row[columnIndex]));
    const xtx = xt.map(row => xt.map(inner => row.reduce((sum, value, index) => sum + value * inner[index], 0)));
    const xty = xt.map(row => row.reduce((sum, value, index) => sum + value * y[index], 0));
    // Solve the 3x3 normal equations with Cramer's rule.
    const det = (m: number[][]): number =>
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const determinant = det(xtx);
    const ols = [0, 1, 2].map(replaced =>
      det(xtx.map((row, index) => (index === replaced ? xty : row))) / determinant
    );
    fit!.coefficients.forEach((value, index) => close(value.beta, ols[index], 1e-8));
    assert.equal(fit!.sargan, null);
    assert.equal(fit!.wuHausman, null);
  });

  it('rejects invalid model specifications', () => {
    // No endogenous regressor.
    assert.equal(fitIv({ y, endog: [], instruments, exog }), null);
    // No excluded instrument.
    assert.equal(fitIv({ y, endog, instruments: [], exog }), null);
    // Fewer instruments than endogenous regressors.
    assert.equal(
      fitIv({
        y,
        endog: x.map((value, row) => [value, w[row]]),
        instruments: column(z2),
        exog,
      }),
      null
    );
    // More parameters than observations.
    assert.equal(
      fitIv({ y: [1, 2], endog: column([0.5, 0.4]), instruments: column([0.1, 0.2]), exog: column([1, 0]) }),
      null
    );
    // Collinear instruments.
    assert.equal(fitIv({ y, endog, instruments: z1.map(value => [value, value]) }), null);
    // Non-finite response.
    assert.equal(fitIv({ y: [Number.NaN, ...y.slice(1)], endog, instruments }), null);
  });
});
