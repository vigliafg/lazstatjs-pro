import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fitPropensity, type PropensityInput } from './propensity';

const close = (actual: number, expected: number, tolerance = 1e-8) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} != ${expected} (tolerance ${tolerance})`
  );

interface Sample {
  treatment: number[];
  outcome: number[];
  covariates: number[][];
  names: string[];
}

/** Deterministic observational sample with a real treatment effect. */
const sample = (n = 220): Sample => {
  const treatment: number[] = [];
  const outcome: number[] = [];
  const covariates: number[][] = [];
  for (let index = 0; index < n; index += 1) {
    const age = -2 + ((index % 22) / 21) * 4;
    const score = -1.5 + (((index * 7) % 23) / 22) * 4;
    const sex = index % 2;
    const latent =
      -0.2 + 0.85 * age - 0.45 * score + 0.5 * sex + 0.35 * Math.sin(index * 1.7);
    const treated = latent > 0 ? 1 : 0;
    treatment.push(treated);
    covariates.push([age, score, sex]);
    outcome.push(
      2 * treated + 0.7 * age - 0.25 * score + 0.3 * sex + 0.6 * Math.cos(index * 0.9)
    );
  }
  return { treatment, outcome, covariates, names: ['Age', 'Score', 'Sex'] };
};

const baseInput = (method: 'nearest' | 'ipw' = 'nearest'): PropensityInput => ({
  ...sample(),
  method,
  caliper: 0.2,
  ratio: 1,
  level: 95,
});

describe('propensity score kernel', () => {
  it('fits the propensity model and returns matching balance and ATT', () => {
    const input = baseInput('nearest');
    const result = fitPropensity(input);
    assert.ok(result);

    assert.equal(result!.ps.coefficients.length, 4);
    assert.deepEqual(
      result!.ps.coefficients.map(coefficient => coefficient.term),
      ['(Intercept)', 'Age', 'Score', 'Sex']
    );
    assert.equal(result!.ps.fitted.length, input.treatment.length);
    result!.ps.fitted.forEach(value => assert.ok(value > 0 && value < 1));

    assert.equal(result!.balance.length, 3);
    result!.balance.forEach(row => {
      assert.ok(Number.isFinite(row.meanTreated));
      assert.ok(Number.isFinite(row.meanControlBefore));
      assert.ok(Number.isFinite(row.meanControlAfter));
      assert.ok(Number.isFinite(row.smdBefore));
      assert.ok(Number.isFinite(row.smdAfter));
    });

    assert.ok(result!.att.estimate > 0);
    assert.ok(Number.isFinite(result!.att.se) && result!.att.se > 0);
    assert.ok(Number.isFinite(result!.att.lo) && Number.isFinite(result!.att.hi));
    assert.ok(result!.att.lo < result!.att.estimate && result!.att.hi > result!.att.estimate);
    assert.equal(result!.matchedTreated + result!.droppedTreated, result!.nTreated);
    assert.ok(result!.matchedControls >= result!.matchedTreated);
    assert.ok(result!.effectiveSampleSize > 0);
    assert.ok(result!.commonSupport.lo <= result!.commonSupport.hi);
  });

  it('matches 1:k controls with replacement and drops treated units outside a tiny caliper', () => {
    const input = baseInput('nearest');
    const pair = fitPropensity({ ...input, ratio: 2, caliper: 0 });
    assert.ok(pair);
    assert.equal(pair!.droppedTreated, 0);
    assert.equal(pair!.matchedTreated, pair!.nTreated);
    assert.equal(pair!.matchedControls, pair!.matchedTreated * 2);

    const tight = fitPropensity({ ...input, caliper: 1e-9 });
    // Ties cannot all be within an essentially zero caliper.
    assert.ok(tight === null || tight.matchedTreated < tight.nTreated);
  });

  it('computes IPW ATT from the ATT weights and reports the Kish effective sample size', () => {
    const input = baseInput('ipw');
    const result = fitPropensity(input);
    assert.ok(result);

    const treated: number[] = [];
    const control: number[] = [];
    const controlWeights: number[] = [];
    input.treatment.forEach((value, index) => {
      if (value === 1) treated.push(input.outcome[index]);
      else {
        control.push(input.outcome[index]);
        const score = result!.ps.fitted[index];
        controlWeights.push(score / (1 - score));
      }
    });
    const meanTreated = treated.reduce((sum, value) => sum + value, 0) / treated.length;
    const weightedControl =
      control.reduce((sum, value, index) => sum + value * controlWeights[index], 0) /
      controlWeights.reduce((sum, value) => sum + value, 0);
    close(result!.att.estimate, meanTreated - weightedControl, 1e-10);

    const weights = input.treatment.map((value, index) =>
      value === 1 ? 1 : result!.ps.fitted[index] / (1 - result!.ps.fitted[index])
    );
    const sumWeights = weights.reduce((sum, value) => sum + value, 0);
    const sumSquares = weights.reduce((sum, value) => sum + value * value, 0);
    close(result!.effectiveSampleSize, (sumWeights * sumWeights) / sumSquares, 1e-8);
    assert.equal(result!.matchedTreated, result!.nTreated);
    assert.equal(result!.matchedControls, result!.nControl);
    assert.equal(result!.droppedTreated, 0);
    assert.equal(result!.balance.length, 3);
  });

  it('rejects a treatment indicator that is not binary', () => {
    const input = baseInput();
    const broken = [...input.treatment];
    broken[0] = 2;
    assert.equal(fitPropensity({ ...input, treatment: broken }), null);
  });

  it('rejects a sample without treated or without control observations', () => {
    const input = baseInput();
    assert.equal(
      fitPropensity({ ...input, treatment: input.treatment.map(() => 1) }),
      null
    );
    assert.equal(
      fitPropensity({ ...input, treatment: input.treatment.map(() => 0) }),
      null
    );
  });

  it('rejects collinear covariates and samples that are too small', () => {
    const input = baseInput();
    const collinear = input.covariates.map(row => [row[0], row[0], row[1]]);
    assert.equal(fitPropensity({ ...input, covariates: collinear }), null);

    const tiny = baseInput();
    assert.equal(
      fitPropensity({
        ...tiny,
        treatment: [1, 0, 1],
        outcome: [1, 2, 3],
        covariates: [[1, 2], [2, 3], [3, 4]],
      }),
      null
    );
  });

  it('rejects a negative caliper and an out-of-range ratio', () => {
    const input = baseInput();
    assert.equal(fitPropensity({ ...input, caliper: -0.1 }), null);
    assert.equal(fitPropensity({ ...input, caliper: Number.NaN }), null);
    assert.equal(fitPropensity({ ...input, ratio: 0 }), null);
    assert.equal(fitPropensity({ ...input, ratio: 11 }), null);
    assert.equal(fitPropensity({ ...input, ratio: 1.5 }), null);
  });
});
