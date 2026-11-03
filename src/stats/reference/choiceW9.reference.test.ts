import test from 'node:test';
import assert from 'node:assert/strict';
import { choiceAnalysis } from '../kernels/choice';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface ChoiceFixture {
  source: string;
  choice: {
    data: {
      Set: string;
      Alternative: string;
      Price: number;
      Quality: number;
      Chosen: number;
    }[];
    coefficients: number[];
    se: number[];
    logLik: number;
    rows: number;
    sets: number;
  };
  maxdiff: {
    data: { Block: string; Item: string; Best: number; Worst: number }[];
    items: string[];
    best: number[];
    worst: number[];
    score: number[];
    share: number[];
  };
}

const fixture = loadFixture<ChoiceFixture>('choiceW9.json');

test('conditional logit reproduces the base-R maximum likelihood fit', () => {
  const rows = fixture.choice.data.map(row => ({
    set: row.Set,
    alternative: row.Alternative,
    attributes: [row.Price, row.Quality],
    chosen: row.Chosen === 1,
  }));
  const result = choiceAnalysis(rows, {
    mode: 'choice',
    variableNames: ['Price', 'Quality'],
  });
  assert.ok(result);
  result!.coefficients.forEach((coefficient, index) => {
    // The kernel uses a small Newton ridge; the reference is an unconstrained
    // optim fit, so the two agree to the numerical optimiser, not to 1e-8.
    assertClose(coefficient.estimate, fixture.choice.coefficients[index], { absolute: 1e-4 }, `beta ${index}`);
    assertClose(coefficient.se, fixture.choice.se[index], { absolute: 1e-4 }, `se ${index}`);
  });
  assertClose(result!.logLik, fixture.choice.logLik, { absolute: 1e-6 }, 'log likelihood');
  assert.equal(result!.sets, fixture.choice.sets);
  assert.equal(result!.rows, fixture.choice.rows);
});

test('MaxDiff counts and preference shares match the exact enumeration', () => {
  const rows = fixture.maxdiff.data;
  const result = choiceAnalysis([], {
    mode: 'maxdiff',
    variableNames: [],
    maxdiff: rows.map(row => ({
      block: row.Block,
      item: row.Item,
      best: row.Best === 1,
      worst: row.Worst === 1,
    })),
  });
  assert.ok(result);
  const byItem = new Map(result!.maxdiff.map(item => [item.item, item]));
  fixture.maxdiff.items.forEach((item, index) => {
    const entry = byItem.get(item);
    assert.ok(entry, `missing item ${item}`);
    assert.equal(entry!.best, fixture.maxdiff.best[index], `${item} best`);
    assert.equal(entry!.worst, fixture.maxdiff.worst[index], `${item} worst`);
    assert.equal(entry!.score, fixture.maxdiff.score[index], `${item} score`);
    assertClose(entry!.share, fixture.maxdiff.share[index], TOLERANCES.r, `${item} share`);
  });
});
