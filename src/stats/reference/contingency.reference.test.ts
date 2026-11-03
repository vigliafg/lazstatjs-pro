import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cochranArmitageTrend,
  exactContingency,
  mantelHaenszel,
} from '../kernels/contingency';
import { assertClose, loadFixture } from './harness';

interface StratumReference {
  label: string;
  oddsRatio: number;
  logOddsRatio: number;
  weight: number;
  corrected: boolean;
}

interface MantelHaenszelReference {
  name: string;
  strata: number[][][];
  labels: string[];
  expected: {
    oddsRatio: number;
    logOddsRatio: number;
    standardError: number;
    lo: number;
    hi: number;
    chi2: number;
    p: number;
    strata: StratumReference[];
  };
}

interface ExactReference {
  observed: number[][];
  p: number;
  statistic?: number;
  tables?: number;
}

interface ContingencyFixture {
  source: string;
  generatedBy: string;
  mantelHaenszel: MantelHaenszelReference;
  mantelHaenszelNoZero: {
    name: string;
    strata: number[][][];
    labels: string[];
    expected: { oddsRatio: number; chi2: number; p: number };
  };
  trend: {
    name: string;
    observed: number[][];
    scores: number[];
    statistic: number;
    p: number;
    proportions: number[];
  };
  exact: {
    twoByTwo: ExactReference;
    threeByTwo: ExactReference;
    threeByThree: ExactReference;
  };
}

const fixture = loadFixture<ContingencyFixture>('contingency.json');

// Declared tolerances: the pooled estimates are closed-form sums, so 1e-8 is
// enough to expose a different weighting. The exact enumeration is compared at
// 1e-12 because both implementations sum the same hypergeometric masses.
const MH_TOLERANCE = 1e-8;
const TREND_TOLERANCE = 1e-8;
const EXACT_TOLERANCE = 1e-12;

const toStrata = (strata: number[][][], labels: string[]) =>
  strata.map((observed, index) => ({ label: labels[index] ?? `Stratum ${index + 1}`, observed }));

test('Mantel–Haenszel matches the R fixture, including a zero-cell stratum', () => {
  assert.equal(fixture.generatedBy, 'src/stats/reference/r/contingency.R');
  const reference = fixture.mantelHaenszel;
  const result = mantelHaenszel(toStrata(reference.strata, reference.labels), {
    correct: true,
    level: 95,
  });
  assert.ok(result);

  assertClose(result!.oddsRatio, reference.expected.oddsRatio, MH_TOLERANCE, 'MH odds ratio');
  assertClose(result!.logOddsRatio, reference.expected.logOddsRatio, MH_TOLERANCE, 'MH log odds ratio');
  assertClose(result!.standardError, reference.expected.standardError, MH_TOLERANCE, 'MH standard error');
  assertClose(result!.lo, reference.expected.lo, MH_TOLERANCE, 'MH log-OR lower bound');
  assertClose(result!.hi, reference.expected.hi, MH_TOLERANCE, 'MH log-OR upper bound');
  assertClose(result!.chi2, reference.expected.chi2, MH_TOLERANCE, 'MH chi-square');
  assertClose(result!.p, reference.expected.p, MH_TOLERANCE, 'MH p-value');
  assert.equal(result!.df, 1);
  assert.equal(result!.usedStrata, reference.strata.length);
  assert.equal(result!.corrected, true);

  result!.strata.forEach((stratum, index) => {
    const expected = reference.expected.strata[index];
    assertClose(stratum.oddsRatio, expected.oddsRatio, MH_TOLERANCE, `stratum ${index} OR`);
    assertClose(stratum.logOddsRatio, expected.logOddsRatio, MH_TOLERANCE, `stratum ${index} log-OR`);
    assertClose(stratum.weight, expected.weight, MH_TOLERANCE, `stratum ${index} weight`);
    assert.equal(stratum.corrected, expected.corrected, `stratum ${index} correction flag`);
  });
});

test('Mantel–Haenszel without zero cells matches mantelhaen.test', () => {
  const reference = fixture.mantelHaenszelNoZero;
  const result = mantelHaenszel(toStrata(reference.strata, reference.labels), {
    correct: true,
    level: 95,
  });
  assert.ok(result);
  assertClose(result!.oddsRatio, reference.expected.oddsRatio, MH_TOLERANCE, 'MH odds ratio');
  assertClose(result!.chi2, reference.expected.chi2, MH_TOLERANCE, 'MH chi-square');
  assertClose(result!.p, reference.expected.p, MH_TOLERANCE, 'MH p-value');
  assert.equal(result!.corrected, false);
});

test('Cochran–Armitage trend matches prop.trend.test', () => {
  const reference = fixture.trend;
  const result = cochranArmitageTrend(reference.observed, reference.scores);
  assert.ok(result);
  assertClose(result!.statistic, reference.statistic, TREND_TOLERANCE, 'trend statistic');
  assertClose(result!.p, reference.p, TREND_TOLERANCE, 'trend p-value');
  assert.equal(result!.df, 1);
  result!.rows.forEach((row, index) => {
    assertClose(row.proportion, reference.proportions[index], TREND_TOLERANCE, `row ${index} proportion`);
  });
});

test('exact 2×2 p-value matches fisher.test', () => {
  const reference = fixture.exact.twoByTwo;
  const result = exactContingency(reference.observed);
  assert.equal(result.method, 'fisher');
  assertClose(result.p, reference.p, EXACT_TOLERANCE, 'Fisher p-value');
});

test('exact R×C enumeration matches the base-R fixture', () => {
  for (const key of ['threeByTwo', 'threeByThree'] as const) {
    const reference = fixture.exact[key];
    const result = exactContingency(reference.observed);
    assert.equal(result.method, 'enumeration', `${key}: method`);
    assert.equal(result.tables, reference.tables, `${key}: enumerated tables`);
    assertClose(result.statistic, reference.statistic ?? NaN, EXACT_TOLERANCE, `${key}: statistic`);
    assertClose(result.p, reference.p, EXACT_TOLERANCE, `${key}: p-value`);
  }
});
