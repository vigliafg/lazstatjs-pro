import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fitMediation } from './mediation';

const csv = readFileSync(
  new URL('../../../samples/regression/mtcars/data.csv', import.meta.url),
  'utf8'
)
  .trim()
  .split(/\r?\n/)
  .map(line => line.split(',').map(cell => cell.replace(/^"|"$/g, '')));

const header = csv[0];
const rows = csv.slice(1);
const column = (name: string): number[] => {
  const index = header.indexOf(name);
  assert.ok(index >= 0, `missing column ${name}`);
  return rows.map(row => Number(row[index]));
};

const outcome = column('mpg');
const predictor = column('hp');
const mediator = column('wt');

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} != ${expected} (${tolerance})`
  );

test('mediation reproduces the mtcars point estimates and effect decomposition', () => {
  const result = fitMediation({
    outcome,
    predictor,
    mediator,
    covariates: [],
    bootstrap: 0,
    seed: 20261103,
  });
  assert.ok(result);
  if (!result) return;

  close(result.paths.a.beta, 0.00940095984354293);
  close(result.paths.b.beta, -3.87783074240468);
  close(result.paths.cPrime.beta, -0.031772946982161);
  close(result.paths.cTotal.beta, -0.0682282780715637);

  close(result.effects.indirect.estimate, -0.0364553310894026);
  close(result.effects.indirect.estimate, result.paths.a.beta * result.paths.b.beta, 1e-12);
  close(
    result.paths.cTotal.beta,
    result.paths.cPrime.beta + result.effects.indirect.estimate,
    1e-10
  );
  close(result.effects.proportion.estimate, 0.534314101422363);
  close(
    result.effects.proportion.estimate,
    result.effects.indirect.estimate / result.effects.total.estimate,
    1e-12
  );

  const sobel = Math.sqrt(
    result.paths.a.beta ** 2 * result.paths.b.se ** 2 +
      result.paths.b.beta ** 2 * result.paths.a.se ** 2
  );
  close(result.sobel.se, sobel, 1e-12);
  close(result.effects.indirect.se, sobel, 1e-12);
  close(result.effects.proportion.se, 0.109439992991232);

  assert.equal(result.n, 32);
  assert.equal(result.complete, 32);
  assert.ok(result.fit.r2Mediator > 0);
  assert.ok(result.fit.r2Outcome > 0);
  assert.ok(result.fit.r2Total > 0);
  assert.equal(result.bootstrap, null);
});

test('mediation rejects coincident columns, non-finite values, short samples and collinearity', () => {
  const base = {
    outcome,
    predictor,
    mediator,
    covariates: [] as number[][],
    bootstrap: 0,
    seed: 1,
  };

  assert.equal(
    fitMediation({ ...base, mediator: predictor }),
    null,
    'predictor and mediator cannot be the same column'
  );
  assert.equal(
    fitMediation({ ...base, outcome: predictor }),
    null,
    'outcome and predictor cannot be the same column'
  );
  assert.equal(
    fitMediation({ ...base, outcome: [...outcome.slice(0, 31), Number.NaN] }),
    null,
    'non-finite values must be rejected'
  );
  assert.equal(
    fitMediation({
      ...base,
      outcome: outcome.slice(0, 4),
      predictor: predictor.slice(0, 4),
      mediator: mediator.slice(0, 4),
    }),
    null,
    'the largest equation needs at least p + 2 rows'
  );
  assert.equal(
    fitMediation({ ...base, covariates: [predictor, [...predictor]] }),
    null,
    'duplicated covariates are collinear'
  );
  assert.equal(
    fitMediation({ ...base, predictor: predictor.map(() => 1) }),
    null,
    'a constant predictor is collinear with the intercept'
  );
});

test('the bootstrap is deterministic for the same seed and changes with another seed', () => {
  const base = {
    outcome,
    predictor,
    mediator,
    covariates: [] as number[][],
    bootstrap: 200,
    seed: 7,
  };
  const first = fitMediation(base);
  const second = fitMediation(base);
  assert.ok(first?.bootstrap && second?.bootstrap);
  if (!first?.bootstrap || !second?.bootstrap) return;

  assert.equal(first.bootstrap.reps, 200);
  close(first.bootstrap.ciLo, second.bootstrap.ciLo, 0);
  close(first.bootstrap.ciHi, second.bootstrap.ciHi, 0);
  assert.deepEqual(first.bootstrap.samples, second.bootstrap.samples);

  const other = fitMediation({ ...base, seed: 8 });
  assert.ok(other?.bootstrap);
  if (!other?.bootstrap) return;
  assert.notDeepEqual(first.bootstrap.samples, other.bootstrap.samples);

  // The percentile interval contains the point estimate in a well-conditioned
  // sample such as mtcars.
  assert.ok(first.bootstrap.ciLo <= first.effects.indirect.estimate);
  assert.ok(first.effects.indirect.estimate <= first.bootstrap.ciHi);
});

/** Deterministic linear-mediation sample with a little noise. */
const synthetic = (n: number) => {
  const x = Array.from({ length: n }, (_, index) => index + 1);
  const m = x.map((value, index) => 0.5 * value + 0.3 * Math.sin(index * 1.7));
  const y = m.map(
    (value, index) => 0.8 * value + 0.3 * x[index] + 0.4 * Math.cos(index * 2.3)
  );
  return { x, m, y };
};

test('a larger sample narrows the bootstrap interval width', () => {
  const small = synthetic(24);
  const large = synthetic(120);

  const smallFit = fitMediation({
    outcome: small.y,
    predictor: small.x,
    mediator: small.m,
    covariates: [],
    bootstrap: 299,
    seed: 20261103,
  });
  const largeFit = fitMediation({
    outcome: large.y,
    predictor: large.x,
    mediator: large.m,
    covariates: [],
    bootstrap: 299,
    seed: 20261103,
  });
  assert.ok(smallFit?.bootstrap && largeFit?.bootstrap);
  if (!smallFit?.bootstrap || !largeFit?.bootstrap) return;

  const smallWidth = smallFit.bootstrap.ciHi - smallFit.bootstrap.ciLo;
  const largeWidth = largeFit.bootstrap.ciHi - largeFit.bootstrap.ciLo;
  assert.ok(smallWidth > 0 && largeWidth > 0);
  assert.ok(
    largeWidth < smallWidth,
    `expected the larger sample to narrow the interval (${largeWidth} vs ${smallWidth})`
  );
});
