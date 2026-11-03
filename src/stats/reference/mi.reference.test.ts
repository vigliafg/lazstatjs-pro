import test from 'node:test';
import assert from 'node:assert/strict';
import { miCategoricalStats } from '../kernels/miCategorical';
import { assertClose, loadFixture } from './harness';

interface MiFixtureVariable {
  name: string;
  categories: number[];
  observed: number;
  missing: number;
  proportions: number[];
}

interface MiFixture {
  source: string;
  generatedBy: string;
  seed: number;
  imputations: number;
  iterations: number;
  rows: string[][];
  variables: MiFixtureVariable[];
}

const fixture = loadFixture<MiFixture>('mi.json');

/**
 * mice draws with its own RNG and runs a different chained-equation schedule,
 * so individual imputed values cannot match. What must agree is the pooled
 * category distribution: the test compares the mean proportion over the five
 * imputations. The observed spread on this fixture is below 0.013, so 0.06
 * catches a real distributional shift without hiding it behind RNG noise.
 */
const POOLED_PROPORTION = 0.06;

test('categorical MI matches the mice pooled category proportions', () => {
  assert.equal(fixture.generatedBy, 'src/stats/reference/r/mi.R');
  const stats = miCategoricalStats({
    rows: fixture.rows,
    variables: [0, 1, 2],
    imputations: fixture.imputations,
    iterations: fixture.iterations,
    level: 95,
    model: 'categorical',
    predictors: [3],
  });
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.categories?.length, fixture.variables.length);
  fixture.variables.forEach((reference, index) => {
    const variable = stats.categories?.[index];
    assert.ok(variable, `missing variable ${reference.name}`);
    if (!variable) return;
    assert.deepEqual(variable.categories, reference.categories, reference.name);
    assert.equal(variable.observed, reference.observed, `${reference.name}: observed`);
    assert.equal(variable.missing, reference.missing, `${reference.name}: missing`);
    assertClose(
      variable.proportions.reduce((sum, entry) => sum + entry.proportion, 0),
      1,
      1e-9,
      `${reference.name}: proportions sum`
    );
    variable.proportions.forEach((entry, category) => {
      assertClose(
        entry.proportion,
        reference.proportions[category] ?? Number.NaN,
        POOLED_PROPORTION,
        `${reference.name} category ${entry.category}`
      );
    });
  });
});

test('categorical MI keeps every imputed value inside the observed categories', () => {
  const stats = miCategoricalStats({
    rows: fixture.rows,
    variables: [0, 1, 2],
    imputations: fixture.imputations,
    iterations: fixture.iterations,
    level: 95,
    model: 'categorical',
    predictors: [3],
  });
  assert.ok(stats);
  for (const [index, variable] of (stats?.categories ?? []).entries()) {
    const allowed = new Set(variable.categories);
    for (const value of stats?.imputedValues[index] ?? []) {
      assert.ok(allowed.has(value), `${variable.name}: unexpected code ${value}`);
    }
  }
});
