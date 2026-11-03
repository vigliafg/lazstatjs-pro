import test from 'node:test';
import assert from 'node:assert/strict';
import { metaAnalysis } from '../kernels/meta';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface MetaEstimate {
  estimate: number;
  se: number;
  z: number;
  p: number;
  lo: number;
  hi: number;
  tau2: number;
  q: number;
  qDf: number;
  qP: number;
  i2: number;
}

interface MetaFixture {
  source: string;
  data: { study: string; effect: number; se: number }[];
  DL: MetaEstimate;
  REML: MetaEstimate;
  FE: MetaEstimate;
  prediction: { lo: number; hi: number };
  egger: { intercept: number; se: number; t: number; p: number };
}

const fixture = loadFixture<MetaFixture>('metaW9.json');
const studies = fixture.data.map(row => ({ label: row.study, effect: row.effect, se: row.se }));

for (const method of ['DL', 'REML', 'FE'] as const) {
  test(`meta-analysis ${method} reproduces metafor::rma`, () => {
    const result = metaAnalysis(studies, method, 95, true);
    assert.ok(result);
    const expected = fixture[method];
    const estimate = result!.random ?? result!.fixed;
    assertClose(estimate.estimate, expected.estimate, TOLERANCES.r, 'pooled estimate');
    assertClose(estimate.se, expected.se, TOLERANCES.r, 'pooled SE');
    assertClose(result!.q, expected.q, TOLERANCES.r, 'Q');
    assertClose(result!.i2, expected.i2, TOLERANCES.r, 'I2');
    assertClose(result!.tau2, expected.tau2, { absolute: 1e-6, relative: 1e-5 }, 'tau2');
  });
}

test('meta-analysis reproduces the prediction interval and Egger test', () => {
  const result = metaAnalysis(studies, 'DL', 95, true);
  assert.ok(result);
  assertClose(result!.prediction!.lo, fixture.prediction.lo, TOLERANCES.r, 'prediction lo');
  assertClose(result!.prediction!.hi, fixture.prediction.hi, TOLERANCES.r, 'prediction hi');
  assertClose(result!.egger!.intercept, fixture.egger.intercept, TOLERANCES.r, 'Egger intercept');
  assertClose(result!.egger!.se, fixture.egger.se, TOLERANCES.r, 'Egger SE');
  assertClose(result!.egger!.p, fixture.egger.p, TOLERANCES.rProbability, 'Egger p');
});
