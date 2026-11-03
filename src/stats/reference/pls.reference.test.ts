import test from 'node:test';
import assert from 'node:assert/strict';
import { fitPls } from '../kernels/pls';
import { assertClose, assertCloseVector, loadFixture } from './harness';

interface PlsFixtureCase {
  name: string;
  components: number;
  /** Intercept followed by the four mtcars predictors. */
  coefficients: number[];
  fitted: number[];
  /** One row per observation, one column per component. */
  scores: number[][];
  /** One row per predictor, one column per component. */
  loadings: number[][];
  /** One row per predictor, one column per component. */
  weights: number[][];
  /** Per-component increment of the cumulative training R². */
  r2: number[];
  /** Cumulative training R² of the first a components. */
  cumulativeR2: number[];
  xVariance: number[];
  cumulativeXVariance: number[];
}

interface PlsFixture {
  source: string;
  generatedBy: string;
  response: string;
  predictors: string[];
  y: number[];
  x: number[][];
  cases: PlsFixtureCase[];
}

const fixture = loadFixture<PlsFixture>('pls.json');

// oscorespls is the same algorithm as the R package, and the fixture is
// regenerated from it. The observed difference is at most ~2.3e-11 (the
// fourth-component coefficient); 1e-6 leaves room for floating-point order
// without hiding a real discrepancy.
const REFERENCE = 1e-6;

/** Transpose a row-major `rows x columns` fixture into per-component vectors. */
const columns = (rows: number[][]): number[][] =>
  (rows[0] ?? []).map((_, column) => rows.map(row => row[column]));

/**
 * The fixture stores R² exactly as pls::R2(estimate = "train") defines it:
 * cumulative, i.e. `1 - SSE_a / SST` with `SST = var(y) * (n - 1)`. The
 * kernel exposes the cumulative value directly and the per-component
 * increment separately; both are checked against that definition.
 */
test('PLS1 matches the pls::plsr(oscorespls) fixtures', () => {
  assert.equal(fixture.generatedBy, 'src/stats/reference/r/pls.R');
  assert.deepEqual(fixture.predictors, ['wt', 'hp', 'disp', 'qsec']);
  assert.deepEqual(
    fixture.cases.map(reference => reference.components),
    [2, 4]
  );

  for (const reference of fixture.cases) {
    const fit = fitPls({
      y: fixture.y,
      x: fixture.x,
      components: reference.components,
    });
    assert.ok(fit, `${reference.name}: fit returned null`);

    assert.equal(fit!.n, fixture.y.length, `${reference.name}: n`);
    assert.equal(fit!.p, fixture.x[0].length, `${reference.name}: p`);
    assert.equal(fit!.components.length, reference.components, `${reference.name}: components`);

    assertCloseVector(fit!.coefficients, reference.coefficients, REFERENCE, `${reference.name} coefficients`);
    assertCloseVector(fit!.fitted, reference.fitted, REFERENCE, `${reference.name} fitted`);
    assertCloseVector(fit!.residuals, fixture.y.map((value, i) => value - reference.fitted[i]), REFERENCE, `${reference.name} residuals`);

    const loadings = columns(reference.loadings);
    const weights = columns(reference.weights);
    const scores = columns(reference.scores);
    for (let a = 0; a < reference.components; a += 1) {
      assertCloseVector(fit!.components[a].loading, loadings[a], REFERENCE, `${reference.name} loadings[${a}]`);
      assertCloseVector(fit!.components[a].weight, weights[a], REFERENCE, `${reference.name} weights[${a}]`);
      assertCloseVector(fit!.components[a].score, scores[a], REFERENCE, `${reference.name} scores[${a}]`);
      assertClose(fit!.components[a].r2, reference.r2[a], REFERENCE, `${reference.name} r2[${a}]`);
      assertClose(
        fit!.components[a].cumulativeR2,
        reference.cumulativeR2[a],
        REFERENCE,
        `${reference.name} cumulativeR2[${a}]`
      );
      assertClose(fit!.components[a].xVariance, reference.xVariance[a], REFERENCE, `${reference.name} xVariance[${a}]`);
      assertClose(
        fit!.components[a].cumulativeXVariance,
        reference.cumulativeXVariance[a],
        REFERENCE,
        `${reference.name} cumulativeXVariance[${a}]`
      );
    }

    assertClose(fit!.r2, reference.cumulativeR2[reference.components - 1], REFERENCE, `${reference.name} r2`);
    // No cross-validation was requested: Q² must be explicitly unavailable.
    assert.ok(
      fit!.q2.every(value => Number.isNaN(value)),
      `${reference.name}: q2 should be NaN without CV`
    );
  }
});

test('PLS1 VIP is positive and ranks the dominant predictor', () => {
  const reference = fixture.cases[fixture.cases.length - 1];
  const fit = fitPls({ y: fixture.y, x: fixture.x, components: reference.components });
  assert.ok(fit);
  assert.equal(fit!.vip.length, fixture.x[0].length);
  assert.ok(fit!.vip.every(value => Number.isFinite(value) && value > 0));
  // disp carries the largest projection weight in this mtcars model.
  const largest = fit!.vip.indexOf(Math.max(...fit!.vip));
  assert.equal(fixture.predictors[largest], 'disp');
});
