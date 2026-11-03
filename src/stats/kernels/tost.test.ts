import test from 'node:test';
import assert from 'node:assert/strict';
import { tostStats } from './tost';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

const oneSample = {
  design: 'one' as const,
  rows: [['10'], ['11'], ['9'], ['10'], ['11'], ['10'], ['9'], ['10']],
  var1: 0,
  var2: 1,
  mu: 10,
  margin: 1,
  equalVar: true,
  level: 95,
};

const paired = {
  design: 'paired' as const,
  rows: [['10', '10.2'], ['11', '11.1'], ['9', '9.3'], ['10', '10.4'], ['11', '11.2'], ['10', '10.1']],
  var1: 0,
  var2: 1,
  mu: 0,
  margin: 1,
  equalVar: true,
  level: 95,
};

const independent = {
  design: 'ind' as const,
  rows: [['10', '20'], ['11', '21'], ['9', '19'], ['10', '20']],
  var1: 0,
  var2: 1,
  mu: 0,
  margin: 15,
  equalVar: true,
  level: 95,
};

test('TOST one-sample demonstrates equivalence with a wide margin', () => {
  const stats = tostStats(oneSample);
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.design, 'one');
  assert.equal(stats.equivalent, true);
  assert.ok(stats.pTost < 0.05);
  assert.ok(stats.ciLo >= -1 && stats.ciHi <= 1);
});

test('TOST one-sample rejects equivalence with a narrow margin', () => {
  const stats = tostStats({ ...oneSample, margin: 0.01 });
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.equivalent, false);
  assert.ok(stats.pTost > 0.05);
});

test('TOST paired and independent designs return a decision', () => {
  const pairedStats = tostStats(paired);
  assert.ok(pairedStats);
  if (pairedStats) {
    assert.equal(pairedStats.design, 'paired');
    assert.ok(Number.isFinite(pairedStats.diff));
    assert.equal(pairedStats.equivalent, true);
  }

  const indStats = tostStats(independent);
  assert.ok(indStats);
  if (indStats) {
    assert.equal(indStats.design, 'ind');
    assert.ok(Number.isFinite(indStats.se));
    assert.ok(Number.isFinite(indStats.pTost));
  }
});

test('TOST rejects invalid margins and insufficient data', () => {
  assert.equal(tostStats({ ...oneSample, margin: 0 }), null);
  assert.equal(tostStats({ ...oneSample, rows: [['10']] }), null);
  assert.equal(tostStats({ ...independent, rows: [['10'], ['20']] }), null);
});

test('TOST statistics match the R one-sample, paired and independent references', () => {
  const one = tostStats(oneSample);
  assert.ok(one);
  close(one!.diff, 0);
  close(one!.se, 0.26726124191242434);
  close(one!.df, 7);
  close(one!.pLower, 0.003623494910654723);
  close(one!.pUpper, 0.0036234949106547605);
  close(one!.pTost, 0.0036234949106547605);

  const pairedResult = tostStats(paired);
  assert.ok(pairedResult);
  close(pairedResult!.diff, -0.21666666666666648);
  close(pairedResult!.se, 0.04772607021092134);
  close(pairedResult!.df, 5);
  close(pairedResult!.pTost, 0.00000765948604553035);

  const independentResult = tostStats(independent);
  assert.ok(independentResult);
  close(independentResult!.diff, -10);
  close(independentResult!.se, 0.5773502691896257);
  close(independentResult!.df, 6);
  close(independentResult!.pTost, 0.00006535332516977022);
});
