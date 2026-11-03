import test from 'node:test';
import assert from 'node:assert/strict';
import { fitHeckman, fitTobit } from './tobit';

/**
 * Deterministic pseudo-noise: the tests must not depend on the platform RNG.
 * The amplitude is small enough that the structural parameters stay
 * identifiable and large enough that the model is not degenerate.
 */
const noise = (index: number, amplitude = 0.6): number =>
  amplitude *
  (Math.sin(index * 1.7) + 0.5 * Math.cos(index * 0.9) + 0.25 * Math.sin(index * 3.1));

const close = (actual: number, expected: number, tolerance: number, label: string): void =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: ${actual} != ${expected} (tolerance ${tolerance})`
  );

// ---------------------------------------------------------------------------
// Tobit
// ---------------------------------------------------------------------------

/** Lower-censored sample: y* = -1 + 2 x + noise, observed max(y*, 0). */
const tobitRows = Array.from({ length: 80 }, (_, index) => {
  const x = (index % 20) / 5;
  const latent = -1 + 2 * x + noise(index);
  return { x, latent, y: Math.max(0, latent) };
});

test('Tobit estimates a lower-censored regression and counts the limits', () => {
  const fit = fitTobit({
    y: tobitRows.map(row => row.y),
    x: tobitRows.map(row => [row.x]),
    lower: 0,
    upper: null,
    level: 95,
  });
  assert.ok(fit);
  if (!fit) return;

  assert.equal(fit.n, tobitRows.length);
  assert.equal(fit.nLower, tobitRows.filter(row => row.y === 0).length);
  assert.equal(fit.nUpper, 0);
  assert.equal(fit.nLower + fit.nUncensored, fit.n);
  assert.ok(fit.nLower > 0, 'the fixture must contain censored rows');

  close(fit.coefficients[0].beta, -1, 0.35, 'Tobit intercept');
  close(fit.coefficients[1].beta, 2, 0.35, 'Tobit slope');
  close(fit.sigma, 0.6, 0.35, 'Tobit sigma');
  assert.ok(fit.sigmaSe > 0);
  assert.ok(fit.coefficients.every(coefficient => coefficient.se > 0));
  assert.ok(fit.coefficients.every(coefficient => Number.isFinite(coefficient.p)));
  assert.ok(fit.converged && fit.iterations > 0);
  assert.ok(Number.isFinite(fit.logLik) && fit.logLik < 0);
  close(fit.aic, -2 * fit.logLik + 2 * 3, 1e-9, 'Tobit AIC');
});

test('Tobit separates the latent mean from the observed mean at the limit', () => {
  const fit = fitTobit({
    y: tobitRows.map(row => row.y),
    x: tobitRows.map(row => [row.x]),
    lower: 0,
    level: 90,
  });
  assert.ok(fit);
  if (!fit) return;

  tobitRows.forEach((row, index) => {
    if (row.y === 0) {
      assert.ok(
        fit.fittedObserved[index] <= 0 + 1e-9,
        `row ${index}: expected observed mean at or below the limit`
      );
      assert.ok(
        fit.fittedObserved[index] <= fit.fitted[index] + 1e-9,
        `row ${index}: truncated mean must lie below the latent mean`
      );
    } else {
      close(fit.fittedObserved[index], fit.fitted[index], 1e-12, `row ${index} uncensored`);
    }
  });
});

test('Tobit handles upper censoring symmetrically', () => {
  const rows = Array.from({ length: 80 }, (_, index) => {
    const x = (index % 20) / 5;
    const latent = 1 + 2 * x + noise(index, 0.7);
    return { x, y: Math.min(8, latent) };
  });
  const fit = fitTobit({
    y: rows.map(row => row.y),
    x: rows.map(row => [row.x]),
    lower: -10,
    upper: 8,
  });
  assert.ok(fit);
  if (!fit) return;
  assert.equal(fit.nLower, 0);
  assert.ok(fit.nUpper > 0, 'the fixture must contain upper-censored rows');
  assert.equal(fit.nUpper + fit.nUncensored, fit.n);
  rows.forEach((row, index) => {
    if (row.y === 8) {
      assert.ok(fit.fittedObserved[index] >= 8 - 1e-9, `row ${index}: truncated mean above the limit`);
      assert.ok(fit.fittedObserved[index] >= fit.fitted[index] - 1e-9);
    }
  });
});

test('Tobit rejects inputs that cannot identify the model', () => {
  const y = tobitRows.map(row => row.y);
  const x = tobitRows.map(row => [row.x]);

  // No censoring at all.
  assert.equal(fitTobit({ y: y.map(value => value + 1), x, lower: 0 }), null);
  // Every observation censored.
  assert.equal(fitTobit({ y: y.map(() => 0), x, lower: 0 }), null);
  // Inconsistent limits.
  assert.equal(fitTobit({ y, x, lower: 5, upper: 5 }), null);
  assert.equal(fitTobit({ y, x, lower: 6, upper: 5 }), null);
  assert.equal(fitTobit({ y, x, lower: Number.NaN }), null);
  // Collinear design (a duplicated column next to the intercept).
  assert.equal(
    fitTobit({
      y,
      x: tobitRows.map(row => [row.x, row.x]),
      lower: 0,
    }),
    null
  );
  // Fewer observations than parameters.
  assert.equal(fitTobit({ y: y.slice(0, 2), x: x.slice(0, 2), lower: 0 }), null);
});

// ---------------------------------------------------------------------------
// Heckman
// ---------------------------------------------------------------------------

const heckmanRows = Array.from({ length: 240 }, (_, index) => {
  const z1 = (index % 12) / 3;
  const z2 = ((index * 7) % 5) - 2;
  const kids = index % 3;
  const selectionIndex = -1 + 0.6 * z1 + 0.2 * z2 - 0.5 * kids + noise(index, 0.8);
  const selected = selectionIndex > 0 ? 1 : 0;
  const x1 = z1;
  const x2 = ((index * 5) % 7) / 2 - 1.5;
  const outcome = 2 + 1.5 * x1 - 0.5 * x2 + noise(index + 11, 0.5);
  return { z1, z2, kids, selected, x1, x2, outcome };
});

const heckmanInput = () => ({
  y: heckmanRows.map(row => (row.selected === 1 ? row.outcome : 0)),
  x: heckmanRows.map(row => [row.x1, row.x2]),
  selected: heckmanRows.map(row => row.selected),
  z: heckmanRows.map(row => [row.z1, row.z2, row.kids]),
  level: 95,
});

test('Heckman two-step returns both equations, the Mills ratio and the correction', () => {
  const input = heckmanInput();
  const fit = fitHeckman(input);
  assert.ok(fit);
  if (!fit) return;

  const nSelected = heckmanRows.filter(row => row.selected === 1).length;
  assert.equal(fit.n, heckmanRows.length);
  assert.equal(fit.nSelected, nSelected);
  assert.ok(nSelected > 0 && nSelected < fit.n);
  assert.ok(fit.seCorrected, 'the first-stage correction should be computable');
  assert.equal(fit.logLik, null);
  assert.equal(fit.coefficients.length, 4);
  assert.equal(fit.coefficients[3].term, 'lambda');
  assert.equal(fit.selectionCoefficients.length, 4);
  assert.ok(fit.coefficients.every(coefficient => coefficient.se > 0));
  assert.ok(fit.selectionCoefficients.every(coefficient => coefficient.se > 0));

  // Structural coefficients survive the selection correction.
  close(fit.coefficients[1].beta, 1.5, 0.4, 'Heckman outcome x1');
  close(fit.coefficients[2].beta, -0.5, 0.4, 'Heckman outcome x2');
  assert.ok(Number.isFinite(fit.rho));
  close(fit.rho, fit.lambda / fit.sigma, 1e-12, 'rho = lambda / sigma');
  close(fit.lambda, fit.coefficients[3].beta, 1e-12, 'lambda coefficient');
  close(fit.lambdaSe, fit.coefficients[3].se, 1e-12, 'lambda SE');

  // Wald for H0: lambda = 0.
  const z = fit.lambda / fit.lambdaSe;
  close(fit.wald.statistic, z * z, 1e-12, 'Wald statistic');
  assert.ok(fit.wald.p >= 0 && fit.wald.p <= 1);

  // IMR is zero outside the selected sample and positive inside.
  fit.imr.forEach((value, index) => {
    if (heckmanRows[index].selected === 1) {
      assert.ok(value > 0, `row ${index}: IMR must be positive`);
      assert.ok(Number.isFinite(fit.residuals[index]), `row ${index}: residual expected`);
    } else {
      assert.equal(value, 0, `row ${index}: IMR outside selection`);
      assert.ok(Number.isNaN(fit.residuals[index]), `row ${index}: residual undefined`);
    }
  });
});

test('Heckman rejects non-binary or degenerate selection indicators', () => {
  const input = heckmanInput();

  assert.equal(
    fitHeckman({ ...input, selected: input.selected.map((value, index) => (index === 0 ? 2 : value)) }),
    null
  );
  assert.equal(
    fitHeckman({ ...input, selected: input.selected.map(() => 1) }),
    null
  );
  assert.equal(
    fitHeckman({ ...input, selected: input.selected.map(() => 0) }),
    null
  );
  assert.equal(
    fitHeckman({ ...input, selected: input.selected.map((value, index) => (index === 0 ? 0.5 : value)) }),
    null
  );
});

test('Heckman rejects collinear selection predictors and too few selected rows', () => {
  const input = heckmanInput();
  const collinearZ = heckmanRows.map(row => [row.z1, row.z1, row.kids]);
  assert.equal(fitHeckman({ ...input, z: collinearZ }), null);

  // Keep only three selected rows: k = 1 + 2 outcome regressors + lambda = 4.
  const selected = input.selected.map((value, index) =>
    value === 1 && heckmanRows.slice(0, index).filter(row => row.selected === 1).length < 3 ? 1 : 0
  );
  assert.equal(fitHeckman({ ...input, selected }), null);
});
