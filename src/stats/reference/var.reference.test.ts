import test from 'node:test';
import assert from 'node:assert/strict';
import { fitVar, fitVecm } from '../kernels/var';
import { assertClose, assertCloseMatrix, assertCloseVector, loadFixture } from './harness';

interface VarFixture {
  source: string;
  var: {
    names: string[];
    data: number[][];
    lags: number;
    coefficients: number[][];
    sigma: number[][];
    logLik: number;
    aic: number;
    bic: number;
    irf: number[][][];
    fevd: { variable: string; shock: string; horizon: number; share: number }[];
    granger: { cause: string; effect: string; f: number; df1: number; df2: number; p: number }[];
  };
  vecm: {
    names: string[];
    data: number[][];
    lags: number;
    beta: number[];
    coefficients: number[][];
    logLik: number;
    aic: number;
    bic: number;
  };
}

const fixture = loadFixture<VarFixture>('var.json');

test('VAR(2) matches the equation-wise R implementation', () => {
  const fit = fitVar({
    data: fixture.var.data,
    names: fixture.var.names,
    lags: fixture.var.lags,
    horizon: fixture.var.irf.length - 1,
  });
  assert.ok(fit);

  fixture.var.coefficients.forEach((reference, equation) => {
    assertCloseVector(
      fit!.equations[equation].coefficients.map(coefficient => coefficient.estimate),
      reference,
      { absolute: 1e-10 },
      `equation ${equation} coefficients`
    );
  });
  assertCloseMatrix(fit!.sigma, fixture.var.sigma, { absolute: 1e-10 }, 'residual covariance');
  assertClose(fit!.logLik, fixture.var.logLik, { absolute: 1e-9 }, 'log likelihood');
  assertClose(fit!.aic, fixture.var.aic, { absolute: 1e-8 }, 'AIC');
  assertClose(fit!.bic, fixture.var.bic, { absolute: 1e-8 }, 'BIC');

  fit!.irf.forEach((impulse, horizon) => {
    assertCloseMatrix(
      impulse.responses,
      fixture.var.irf[horizon],
      { absolute: 1e-10 },
      `IRF horizon ${horizon}`
    );
  });

  fixture.var.fevd.forEach(reference => {
    const row = fit!.fevd.find(
      item =>
        item.variable === reference.variable &&
        item.shock === reference.shock &&
        item.horizon === reference.horizon
    );
    assert.ok(row, `FEVD ${reference.variable}/${reference.shock}/${reference.horizon}`);
    assertClose(row!.share, reference.share, { absolute: 1e-10 }, 'FEVD share');
  });

  fixture.var.granger.forEach(reference => {
    const row = fit!.granger.find(
      item => item.cause === reference.cause && item.effect === reference.effect
    );
    assert.ok(row, `Granger ${reference.cause} -> ${reference.effect}`);
    assertClose(row!.f, reference.f, { absolute: 1e-10 }, 'Granger F');
    assert.equal(row!.df1, reference.df1);
    assert.equal(row!.df2, reference.df2);
    assertClose(row!.p, reference.p, { absolute: 1e-8 }, 'Granger p');
  });

  assert.ok(Number.isFinite(fit!.stability));
});

test('Engle–Granger VECM matches the two-step R implementation', () => {
  const fit = fitVecm({
    data: fixture.vecm.data,
    names: fixture.vecm.names,
    lags: fixture.vecm.lags,
  });
  assert.ok(fit);
  assertClose(fit!.betaVector[1], fixture.vecm.beta[1], { absolute: 1e-10 }, 'cointegrating beta');
  fixture.vecm.coefficients.forEach((reference, equation) => {
    assertCloseVector(
      fit!.equations[equation].coefficients.map(coefficient => coefficient.estimate),
      reference,
      { absolute: 1e-10 },
      `VECM equation ${equation}`
    );
  });
  assertClose(fit!.logLik, fixture.vecm.logLik, { absolute: 1e-8 }, 'VECM log likelihood');
  assertClose(fit!.aic, fixture.vecm.aic, { absolute: 1e-8 }, 'VECM AIC');
  assertClose(fit!.bic, fixture.vecm.bic, { absolute: 1e-8 }, 'VECM BIC');
});
