import test from 'node:test';
import assert from 'node:assert/strict';
import { fitMars } from '../kernels/mars';
import { assertClose, assertCloseVector, loadFixture } from './harness';

interface MarsFixtureCase {
  name: string;
  degree: number;
  maxTerms: number;
  prune: boolean;
  pmethod: string;
  penalty: number;
  terms: string[];
  coefficients: number[];
  knots: Array<number | number[]>;
  fitted: number[];
  rss: number;
  rsq: number;
  gcv: number;
  n: number;
  p: number;
}

interface MarsFixture {
  source: string;
  generatedBy: string;
  variables: string[];
  x: number[][];
  y: number[];
  cases: MarsFixtureCase[];
}

const fixture = loadFixture<MarsFixture>('mars.json');
const x = fixture.x[0].map((_, row) => fixture.x.map(column => column[row]));

// The kernel reproduces earth's forward knot grid (minspan/endspan), so
// coefficients, fitted values, RSS and R² agree to far better than the
// contractual 1e-6.  The backward cases also agree exactly on this dataset;
// the tolerance is deliberately the agreed 1e-6, not a widened one.
const REFERENCE = 1e-6;

test('MARS forward pass matches earth on mtcars', () => {
  const forward = fixture.cases.filter(reference => reference.pmethod === 'none');
  assert.ok(forward.length >= 2);

  for (const reference of forward) {
    const fit = fitMars({
      y: fixture.y,
      x,
      names: fixture.variables,
      degree: reference.degree,
      maxTerms: reference.maxTerms,
      penalty: reference.penalty,
      prune: false,
    });
    assert.ok(fit, `${reference.name}: fit returned null`);
    if (!fit) continue;

    assert.equal(fit.n, reference.n);
    assert.equal(fit.p, reference.p);
    assert.equal(fit.selectedTerms, reference.p);
    assert.deepEqual(
      fit.terms.map(term => term.name),
      reference.terms,
      `${reference.name}: selected terms`
    );
    assertCloseVector(
      fit.terms.map(term => term.coefficient),
      reference.coefficients,
      REFERENCE,
      `${reference.name} coefficients`
    );
    assertCloseVector(fit.fitted, reference.fitted, REFERENCE, `${reference.name} fitted`);
    assertClose(fit.rss, reference.rss, REFERENCE, `${reference.name} rss`);
    assertClose(fit.r2, reference.rsq, REFERENCE, `${reference.name} r2`);
    assertClose(fit.gcv, reference.gcv, REFERENCE, `${reference.name} gcv`);
    assert.deepEqual(
      fit.terms.map(term => term.knot),
      reference.knots.map(knot => (Array.isArray(knot) ? null : knot)),
      `${reference.name}: knots`
    );
  }
});

test('MARS backward GCV pruning matches earth on mtcars', () => {
  const backward = fixture.cases.filter(reference => reference.pmethod === 'backward');
  assert.ok(backward.length >= 2);

  for (const reference of backward) {
    const fit = fitMars({
      y: fixture.y,
      x,
      names: fixture.variables,
      degree: reference.degree,
      maxTerms: reference.maxTerms,
      penalty: reference.penalty,
      prune: true,
    });
    assert.ok(fit, `${reference.name}: fit returned null`);
    if (!fit) continue;

    assert.equal(fit.pruned, true, `${reference.name}: expected a pruned model`);
    assert.equal(fit.p, reference.p);
    assert.deepEqual(
      fit.terms.map(term => term.name),
      reference.terms,
      `${reference.name}: selected terms`
    );
    assertCloseVector(
      fit.terms.map(term => term.coefficient),
      reference.coefficients,
      REFERENCE,
      `${reference.name} coefficients`
    );
    assertCloseVector(fit.fitted, reference.fitted, REFERENCE, `${reference.name} fitted`);
    assertClose(fit.rss, reference.rss, REFERENCE, `${reference.name} rss`);
    assertClose(fit.r2, reference.rsq, REFERENCE, `${reference.name} r2`);
    assertClose(fit.gcv, reference.gcv, REFERENCE, `${reference.name} gcv`);
  }
});

test('the fitted values are the linear combination of the reported basis', () => {
  for (const reference of fixture.cases) {
    const fit = fitMars({
      y: fixture.y,
      x,
      names: fixture.variables,
      degree: reference.degree,
      maxTerms: reference.maxTerms,
      penalty: reference.penalty,
      prune: reference.prune,
    });
    assert.ok(fit);
    if (!fit) continue;

    fit.fitted.forEach((value, row) => {
      let reconstructed = 0;
      fit.terms.forEach(term => {
        let basis = 1;
        term.hinges.forEach(hinge => {
          const delta = x[row][hinge.predictor] - hinge.knot;
          basis *= Math.max(hinge.side === 1 ? delta : -delta, 0);
        });
        reconstructed += term.coefficient * basis;
      });
      assertClose(reconstructed, value, 1e-9, `${reference.name} fitted[${row}]`);
    });
  }
});

test('the declared tolerance rejects a visible gap', () => {
  assert.throws(() => assertClose(1 + 1e-4, 1, REFERENCE));
  assertClose(1 + 1e-7, 1, REFERENCE);
});
