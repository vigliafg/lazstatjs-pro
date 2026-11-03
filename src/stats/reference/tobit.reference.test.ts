import test from 'node:test';
import assert from 'node:assert/strict';
import { fitHeckman, fitTobit } from '../kernels/tobit';
import { invert, multiply, transpose } from '../kernels/matrix';
import { assertClose, assertCloseVector, loadFixture } from './harness';

interface FixtureCoefficient {
  term: string;
  beta: number;
  se: number;
}

interface FixtureTobitCase {
  name: string;
  lower: number;
  upper: number | null;
  coefficients: FixtureCoefficient[];
  sigma: number;
  sigmaSe: number;
  logLik: number;
  n: number;
  nLower: number;
  nUpper: number;
  nUncensored: number;
}

interface FixtureHeckmanCase {
  name: string;
  outcomeCoefficients: (FixtureCoefficient & { seOls: number })[];
  selectionCoefficients: FixtureCoefficient[];
  sigma: number;
  rho: number;
  lambda: number;
  lambdaSe: number;
  n: number;
  nSelected: number;
  imr: number[];
}

interface TobitFixture {
  source: string;
  generatedBy: string;
  dataset: string;
  dataSource: string;
  formula: Record<string, string>;
  data: {
    y: number[];
    yObserved: number[];
    selected: number[];
    x: Record<string, number[]>;
    z: Record<string, number[]>;
  };
  cases: {
    tobit: FixtureTobitCase;
    heckman: FixtureHeckmanCase;
  };
}

const fixture = loadFixture<TobitFixture>('tobit.json');

/** Columns of a column-oriented fixture block, transposed to one row per unit. */
const rowsOf = (columns: Record<string, number[]>): number[][] => {
  const names = Object.keys(columns);
  return (columns[names[0]] ?? []).map((_, row) => names.map(name => columns[name][row]));
};

/**
 * Declared tolerances.
 *
 * Tobit is maximum likelihood through BFGS with a numerical Hessian: the R
 * reference uses `survreg`'s optimiser and observed information, so the two
 * optima agree to ~1e-6 while the Hessian-based SEs differ in the fourth
 * decimal. `1e-4` is the declared tolerance for coefficients and SEs.
 *
 * Heckman is a closed-form two-step estimator: the point estimates reproduce
 * the R computation to machine precision and the corrected SEs are the same
 * algebraic expression in both implementations, so `1e-6` applies to the
 * coefficients and the OLS SEs, and `1e-4` to the first-stage-corrected SEs
 * (the only place where the two matrix evaluations can drift).
 */
const TOLERANCE_TOBIT = 1e-4;
const TOLERANCE_HECKMAN = 1e-6;
const TOLERANCE_HECKMAN_CORRECTED = 1e-4;

test('Tobit matches the AER::tobit reference fixture', () => {
  const reference = fixture.cases.tobit;
  const fit = fitTobit({
    y: fixture.data.y,
    x: rowsOf(fixture.data.x),
    lower: reference.lower,
    upper: reference.upper,
    level: 95,
  });
  assert.ok(fit, 'Tobit: model was not estimated');

  assert.equal(fit!.n, reference.n, 'Tobit: n');
  assert.equal(fit!.nLower, reference.nLower, 'Tobit: lower-censored rows');
  assert.equal(fit!.nUpper, reference.nUpper, 'Tobit: upper-censored rows');
  assert.equal(fit!.nUncensored, reference.nUncensored, 'Tobit: uncensored rows');

  assertCloseVector(
    fit!.coefficients.map(value => value.beta),
    reference.coefficients.map(value => value.beta),
    TOLERANCE_TOBIT,
    'Tobit beta'
  );
  assertCloseVector(
    fit!.coefficients.map(value => value.se),
    reference.coefficients.map(value => value.se),
    TOLERANCE_TOBIT,
    'Tobit se'
  );
  assertClose(fit!.sigma, reference.sigma, TOLERANCE_TOBIT, 'Tobit sigma');
  assertClose(fit!.sigmaSe, reference.sigmaSe, TOLERANCE_TOBIT, 'Tobit sigma SE');
  assertClose(fit!.logLik, reference.logLik, TOLERANCE_TOBIT, 'Tobit logLik');
});

test('Heckman two-step matches the base-R reference fixture', () => {
  const reference = fixture.cases.heckman;
  const fit = fitHeckman({
    y: fixture.data.yObserved,
    x: rowsOf(fixture.data.x),
    selected: fixture.data.selected,
    z: rowsOf(fixture.data.z),
    level: 95,
  });
  assert.ok(fit, 'Heckman: model was not estimated');

  assert.equal(fit!.n, reference.n, 'Heckman: n');
  assert.equal(fit!.nSelected, reference.nSelected, 'Heckman: selected rows');
  assert.equal(fit!.seCorrected, true, 'Heckman: first-stage correction expected');

  assertCloseVector(
    fit!.coefficients.map(value => value.beta),
    reference.outcomeCoefficients.map(value => value.beta),
    TOLERANCE_HECKMAN,
    'Heckman outcome beta'
  );
  assertCloseVector(
    fit!.selectionCoefficients.map(value => value.beta),
    reference.selectionCoefficients.map(value => value.beta),
    TOLERANCE_HECKMAN,
    'Heckman selection beta'
  );
  // Independent OLS check: rebuild W = [1, x, IMR] from the fixture and invert
  // W'W. This validates the uncorrected part of the correction formula.
  const x = rowsOf(fixture.data.x);
  const w: number[][] = fixture.data.selected
    .map((value, index) => (value === 1 ? [1, ...x[index], reference.imr[index]] : null))
    .filter((row): row is number[] => row !== null);
  const information = invert(multiply(transpose(w), w));
  assert.ok(information, 'Heckman: W\'W is singular');
  const sigma2 = reference.sigma * reference.sigma;
  const olsSe = information!.map((row, index) =>
    Math.sqrt(sigma2 * row[index])
  );
  assertCloseVector(
    olsSe,
    reference.outcomeCoefficients.map(value => value.seOls),
    TOLERANCE_HECKMAN,
    'Heckman fixture OLS se'
  );
  // The first-stage correction is small but not zero for this sample: verify
  // that the distance from the OLS SE reproduces the reference correction.
  assertCloseVector(
    fit!.coefficients.map((value, index) => value.se - olsSe[index]),
    reference.outcomeCoefficients.map(
      value => (value.se as number) - (value.seOls as number)
    ),
    TOLERANCE_HECKMAN_CORRECTED,
    'Heckman first-stage correction'
  );
  assertCloseVector(
    fit!.coefficients.map(value => value.se),
    reference.outcomeCoefficients.map(value => value.se),
    TOLERANCE_HECKMAN_CORRECTED,
    'Heckman corrected se'
  );
  assertCloseVector(
    fit!.selectionCoefficients.map(value => value.se),
    reference.selectionCoefficients.map(value => value.se),
    TOLERANCE_HECKMAN,
    'Heckman selection se'
  );
  assertClose(fit!.sigma, reference.sigma, TOLERANCE_HECKMAN, 'Heckman sigma');
  assertClose(fit!.rho, reference.rho, TOLERANCE_HECKMAN, 'Heckman rho');
  assertClose(fit!.lambda, reference.lambda, TOLERANCE_HECKMAN, 'Heckman lambda');
  assertClose(fit!.lambdaSe, reference.lambdaSe, TOLERANCE_HECKMAN_CORRECTED, 'Heckman lambda SE');
  // The kernel reports 0 for non-selected rows by contract; the reference
  // fixture stores the Mills ratio for every row, so compare selected rows.
  fixture.data.selected.forEach((value, index) => {
    if (value === 1) {
      assertClose(fit!.imr[index], reference.imr[index], TOLERANCE_HECKMAN, `Heckman IMR[${index}]`);
    } else {
      assert.equal(fit!.imr[index], 0, `Heckman IMR[${index}] outside selection`);
    }
  });
  assert.equal(fit!.logLik, null, 'Heckman: two-step logLik is not defined');
});

test('the Tobit/Heckman harness rejects values outside the declared tolerance', () => {
  assert.throws(() => assertClose(1.001, 1, TOLERANCE_TOBIT));
  assert.throws(() => assertCloseVector([1, 2], [1, 3], TOLERANCE_HECKMAN));
  assertClose(1.0000001, 1, TOLERANCE_HECKMAN);
});
