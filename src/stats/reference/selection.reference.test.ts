import test from 'node:test';
import assert from 'node:assert/strict';
import { bestSubsets, stepwiseSelection } from '../kernels/selection';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface ReferenceSubset {
  variables: number | number[];
  sse: number;
  r2: number;
  adjR2: number;
  aic: number;
  bic: number;
}

interface SelectionFixture {
  source: string;
  generatedBy: string;
  candidates: string[];
  y: number[];
  predictors: number[][];
  bestSubsets: ReferenceSubset[];
  stepwise: { direction: 'both'; criterion: 'bic'; selected: number[]; sse: number };
}

const fixture = loadFixture<SelectionFixture>('selection.json');

const asArray = (value: number | number[]): number[] => (Array.isArray(value) ? value : [value]);

test('best subsets matches the leaps::regsubsets models', () => {
  const models = bestSubsets(fixture.y, fixture.predictors, 'bic');
  assert.ok(models);
  assert.equal(models!.length, fixture.bestSubsets.length);

  fixture.bestSubsets.forEach((reference, index) => {
    const model = models![index];
    assert.deepEqual(model.variables, asArray(reference.variables));
    assertClose(model.sse, reference.sse, TOLERANCES.r, `subset ${index} sse`);
    assertClose(model.r2, reference.r2, TOLERANCES.r, `subset ${index} r2`);
    assertClose(model.adjR2, reference.adjR2, TOLERANCES.r, `subset ${index} adjR2`);
    assertClose(model.aic, reference.aic, TOLERANCES.r, `subset ${index} aic`);
    assertClose(model.bic, reference.bic, TOLERANCES.r, `subset ${index} bic`);
  });
});

test('stepwise BIC selection matches stats::step', () => {
  const result = stepwiseSelection(
    fixture.y,
    fixture.predictors,
    fixture.stepwise.direction,
    fixture.stepwise.criterion
  );
  assert.ok(result);
  assert.deepEqual(result!.selected, fixture.stepwise.selected);
  assertClose(result!.model.sse, fixture.stepwise.sse, TOLERANCES.r, 'stepwise sse');
});
