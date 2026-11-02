import test from 'node:test';
import assert from 'node:assert/strict';
import { miStats } from './mi';

test('MI returns the observed mean and SD when nothing is missing', () => {
  const rows = [['1', '2'], ['2', '4'], ['3', '6'], ['4', '8'], ['5', '10']];
  const stats = miStats({ rows, variables: [0, 1], imputations: 3, iterations: 2, level: 95 });
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.variables[0].missing, 0);
  assert.ok(Math.abs(stats.variables[0].mean - 3) < 1e-9);
  assert.ok(Math.abs(stats.variables[0].sd - Math.sqrt(2.5)) < 1e-6);
  assert.ok(stats.variables[0].fmi < 1e-9);
});

test('MI imputes missing cells and pools means', () => {
  const rows = [
    ['1', '2'], ['2', ''], ['3', '6'], ['', '8'], ['5', '10'], ['6', '12'],
  ];
  const stats = miStats({ rows, variables: [0, 1], imputations: 5, iterations: 5, level: 95 });
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.variables[0].missing, 1);
  assert.equal(stats.variables[1].missing, 1);
  for (const variable of stats.variables) {
    assert.ok(Number.isFinite(variable.mean));
    assert.ok(Number.isFinite(variable.sd));
    assert.ok(variable.lo < variable.mean && variable.mean < variable.hi);
  }
});

test('MI rejects variables with fewer than two observations', () => {
  assert.equal(
    miStats({ rows: [['1', ''], ['', '']], variables: [0, 1], imputations: 3, iterations: 2, level: 95 }),
    null
  );
});


test('MI pools a linear regression when there is no missingness', () => {
  const data = Array.from({ length: 20 }, (_, index) => [
    String(1 + 2 * index),
    String(index),
  ]);
  const stats = miStats({
    rows: data,
    variables: [0, 1],
    imputations: 3,
    iterations: 2,
    level: 95,
    model: 'linear',
    outcome: 0,
    predictors: [1],
  });
  assert.ok(stats?.regression);
  if (!stats?.regression) return;
  const [intercept, slope] = stats.regression.coefficients;
  assert.ok(Math.abs(intercept.beta - 1) < 1e-6);
  assert.ok(Math.abs(slope.beta - 2) < 1e-6);
  assert.ok(stats.regression.r2 > 0.999);
});

test('MI pooled regression produces finite estimates with missing data', () => {
  const data = [
    ['1', '0'], ['3', ''], ['5', '2'], ['7', '3'], ['', '4'],
    ['11', '5'], ['13', '6'], ['15', '7'], ['17', '8'], ['19', '9'],
  ];
  const stats = miStats({
    rows: data,
    variables: [0, 1],
    imputations: 5,
    iterations: 5,
    level: 95,
    model: 'linear',
    outcome: 0,
    predictors: [1],
  });
  assert.ok(stats?.regression);
  if (!stats?.regression) return;
  assert.ok(stats.regression.coefficients.every(coefficient => Number.isFinite(coefficient.beta)));
  assert.ok(stats.regression.coefficients.every(coefficient => Number.isFinite(coefficient.se)));
});

// Reference: x = 1..10, y = 2x + 1, with x missing on two rows. The
// conditional model has zero residual variance, so every imputation collapses
// to the exact line; the pooled mean/SD are the complete-data mean/SD of 1..10
// (R: mean(1:10) = 5.5, sd(1:10) = 3.0276503540974917) and the pooled
// regression of x on y is x = -0.5 + 0.5 y with R² = 1.
test('MI matches the closed-form pooled mean, SD and regression', () => {
  const rows = Array.from({ length: 10 }, (_, index) => {
    const x = index + 1;
    const missingX = index === 2 || index === 6;
    return [missingX ? '' : String(x), String(2 * x + 1)];
  });
  const stats = miStats({
    rows,
    variables: [0, 1],
    imputations: 5,
    iterations: 5,
    level: 95,
    model: 'linear',
    outcome: 0,
    predictors: [1],
  });
  assert.ok(stats);
  if (!stats) return;

  assert.equal(stats.variables[0].missing, 2);
  assert.equal(stats.variables[1].missing, 0);
  assert.ok(Math.abs(stats.variables[0].mean - 5.5) < 1e-9);
  assert.ok(Math.abs(stats.variables[0].sd - 3.027650354097491) < 1e-9);
  assert.ok(Math.abs(stats.variables[1].mean - 12) < 1e-9);
  assert.ok(Math.abs(stats.variables[1].sd - 6.0553007081949835) < 1e-9);

  // The two imputed cells sit on the line x = (y - 1) / 2.
  assert.ok(Math.abs(stats.imputedValues[0][2] - 3) < 1e-9);
  assert.ok(Math.abs(stats.imputedValues[0][6] - 7) < 1e-9);

  assert.ok(stats.regression);
  assert.ok(Math.abs(stats.regression!.coefficients[0].beta + 0.5) < 1e-9);
  assert.ok(Math.abs(stats.regression!.coefficients[1].beta - 0.5) < 1e-9);
  assert.ok(Math.abs(stats.regression!.r2 - 1) < 1e-12);
});
