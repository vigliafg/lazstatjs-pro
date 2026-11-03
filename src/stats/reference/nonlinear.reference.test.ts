import test from 'node:test';
import assert from 'node:assert/strict';
import { fitNonlinear, nonlinearModelValue, type NonlinearModelType } from '../kernels/nonlinear';
import { assertClose, assertCloseVector, loadFixture, TOLERANCES } from './harness';

interface NonlinearFixtureParameter {
  name: string;
  estimate: number;
  se: number;
  t: number;
  p: number;
  ciLo: number;
  ciHi: number;
}

interface NonlinearFixtureCase {
  name: string;
  model: NonlinearModelType;
  x: number[];
  y: number[];
  /** Starting values used by R's nls(); they are not needed by the kernel. */
  start: Record<string, number>;
  parameters: NonlinearFixtureParameter[];
  fitted: number[];
  residuals: number[];
  sse: number;
  r2: number;
  adjR2: number;
  rmse: number;
  n: number;
  df: number;
}

interface NonlinearFixture {
  source: string;
  generatedBy: string;
  cases: NonlinearFixtureCase[];
}

const fixture = loadFixture<NonlinearFixture>('nonlinear.json');

// R cannot run nls() tighter than tol = 1e-6 with numerical derivatives, so
// the generator polishes the fit with BFGS restarts before writing the
// fixture (see r/nonlinear.R). Against that polished optimum the kernel's
// analytic Gauss–Newton differs by at most ~1.6e-6 (the gompertz `a` standard
// error); 1e-5 leaves ~6x headroom without hiding a real discrepancy.
const REFERENCE = 1e-5;

const MODEL_NAMES: NonlinearModelType[] = [
  'exponential',
  'logistic',
  'gompertz',
  'power',
  'michaelis',
];

test('nonlinear regression matches the R nls() fixtures', () => {
  assert.ok(fixture.cases.length >= 5);
  assert.deepEqual(
    [...new Set(fixture.cases.map(reference => reference.model))].sort(),
    [...MODEL_NAMES].sort()
  );

  for (const reference of fixture.cases) {
    const fit = fitNonlinear({ x: reference.x, y: reference.y, model: reference.model });
    assert.ok(fit, `${reference.name}: model did not converge`);

    assert.equal(fit!.model, reference.model);
    assert.equal(fit!.converged, true);
    assert.equal(fit!.n, reference.n);
    assert.equal(fit!.df, reference.df);
    assert.equal(fit!.parameters.length, reference.parameters.length);

    assert.deepEqual(
      fit!.parameters.map(parameter => parameter.name),
      reference.parameters.map(parameter => parameter.name),
      `${reference.name}: parameter order`
    );
    assertCloseVector(
      fit!.parameters.map(parameter => parameter.estimate),
      reference.parameters.map(parameter => parameter.estimate),
      REFERENCE,
      `${reference.name} estimates`
    );
    assertCloseVector(
      fit!.parameters.map(parameter => parameter.se),
      reference.parameters.map(parameter => parameter.se),
      REFERENCE,
      `${reference.name} se`
    );
    assertCloseVector(
      fit!.parameters.map(parameter => parameter.t),
      reference.parameters.map(parameter => parameter.t),
      REFERENCE,
      `${reference.name} t`
    );
    // The p-values are pinned indirectly by se and t; their magnitudes range
    // from 1e-57 to 1e-3, so an absolute probability tolerance is the only
    // meaningful comparison here.
    assertCloseVector(
      fit!.parameters.map(parameter => parameter.p),
      reference.parameters.map(parameter => parameter.p),
      TOLERANCES.rProbability,
      `${reference.name} p`
    );
    assertCloseVector(
      fit!.parameters.map(parameter => parameter.ciLo),
      reference.parameters.map(parameter => parameter.ciLo),
      REFERENCE,
      `${reference.name} ciLo`
    );
    assertCloseVector(
      fit!.parameters.map(parameter => parameter.ciHi),
      reference.parameters.map(parameter => parameter.ciHi),
      REFERENCE,
      `${reference.name} ciHi`
    );

    assertCloseVector(fit!.fitted, reference.fitted, REFERENCE, `${reference.name} fitted`);
    assertCloseVector(fit!.residuals, reference.residuals, REFERENCE, `${reference.name} residuals`);
    assertClose(fit!.sse, reference.sse, TOLERANCES.r, `${reference.name} sse`);
    assertClose(fit!.r2, reference.r2, TOLERANCES.r, `${reference.name} r2`);
    assertClose(fit!.adjR2, reference.adjR2, TOLERANCES.r, `${reference.name} adjR2`);
    assertClose(fit!.rmse, reference.rmse, TOLERANCES.r, `${reference.name} rmse`);
  }
});

test('the model evaluator reproduces the R fitted values', () => {
  for (const reference of fixture.cases) {
    const parameters = reference.parameters.map(parameter => parameter.estimate);
    const evaluated = reference.x.map(x => nonlinearModelValue(reference.model, parameters, x));
    assertCloseVector(evaluated, reference.fitted, TOLERANCES.r, `${reference.name} evaluator`);
  }
});

test("starting from R's nls() values reaches the same optimum", () => {
  const order: Record<NonlinearModelType, string[]> = {
    exponential: ['a', 'b'],
    logistic: ['L', 'k', 'x0'],
    gompertz: ['a', 'b', 'c'],
    power: ['a', 'b'],
    michaelis: ['vmax', 'km'],
  };

  for (const reference of fixture.cases) {
    const initial = order[reference.model].map(name => reference.start[name]);
    const fit = fitNonlinear({
      x: reference.x,
      y: reference.y,
      model: reference.model,
      initial,
    });
    assert.ok(fit, `${reference.name}: model did not converge from the R start`);
    assertCloseVector(
      fit!.parameters.map(parameter => parameter.estimate),
      reference.parameters.map(parameter => parameter.estimate),
      REFERENCE,
      `${reference.name} estimates from R start`
    );
  }
});

test('the declared tolerance rejects a visible gap', () => {
  assert.throws(() => assertClose(1 + 1e-4, 1, REFERENCE));
  assertClose(1 + 1e-7, 1, REFERENCE);
});
