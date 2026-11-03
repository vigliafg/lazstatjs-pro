import test from 'node:test';
import assert from 'node:assert/strict';
import { surveyAnalysis, type SurveyObservation } from '../kernels/survey';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface SurveyFixture {
  source: string;
  data: {
    stratum: string[];
    psu: string[];
    weight: number[];
    y: number[];
    age: number[];
    employed: number[];
  }[];
  mean: { estimate: number; se: number; df: number };
  total: { estimate: number; se: number; df: number };
  proportion: { estimate: number; se: number; df: number };
  regression: { term: string[]; estimate: number[]; se: number[]; df: number };
}

const fixture = loadFixture<SurveyFixture>('surveyW9.json');
const rows = fixture.data as unknown as {
  stratum: string;
  psu: string;
  weight: number;
  y: number;
  age: number;
  employed: number;
}[];
const observations = (withPredictors: boolean): SurveyObservation[] =>
  rows.map(row => ({
    value: row.y,
    weight: row.weight,
    stratum: row.stratum,
    psu: row.psu,
    predictors: withPredictors ? [row.age] : [],
  }));

test('survey means and totals reproduce survey::svymean and svytotal', () => {
  const mean = surveyAnalysis(observations(false), {
    mode: 'mean',
    level: 95,
    variableName: 'y',
  });
  const total = surveyAnalysis(observations(false), {
    mode: 'total',
    level: 95,
    variableName: 'y',
  });
  assert.ok(mean && total);
  assertClose(mean!.estimates[0].estimate, fixture.mean.estimate, TOLERANCES.r, 'mean');
  assertClose(mean!.estimates[0].se, fixture.mean.se, TOLERANCES.r, 'mean SE');
  assert.equal(mean!.estimates[0].df, fixture.mean.df, 'mean df');
  assertClose(total!.estimates[0].estimate, fixture.total.estimate, TOLERANCES.r, 'total');
  assertClose(total!.estimates[0].se, fixture.total.se, TOLERANCES.r, 'total SE');
});

test('survey proportion reproduces the design-based binomial estimate', () => {
  const proportion = surveyAnalysis(
    rows.map(row => ({
      value: row.employed,
      weight: row.weight,
      stratum: row.stratum,
      psu: row.psu,
      category: String(row.employed),
    })),
    { mode: 'proportion', level: 95, successLevel: '1', categoryName: 'employed' }
  );
  assert.ok(proportion);
  assertClose(proportion!.estimates[0].estimate, fixture.proportion.estimate, TOLERANCES.r, 'proportion');
  assertClose(proportion!.estimates[0].se, fixture.proportion.se, TOLERANCES.r, 'proportion SE');
});

test('survey weighted regression reproduces svyglm', () => {
  const regression = surveyAnalysis(observations(true), {
    mode: 'regression',
    level: 95,
    predictorNames: ['age'],
  });
  assert.ok(regression);
  regression!.coefficients.forEach((coefficient, index) => {
    assertClose(coefficient.estimate, fixture.regression.estimate[index], TOLERANCES.r, `beta ${index}`);
    assertClose(coefficient.se, fixture.regression.se[index], TOLERANCES.r, `se ${index}`);
  });
});
