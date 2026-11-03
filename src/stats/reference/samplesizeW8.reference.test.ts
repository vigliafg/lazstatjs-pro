import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleSizeLogistic, sampleSizeRegression } from '../kernels/samplesize';
import { assertClose, loadFixture } from './harness';

interface SampleSizeFixture {
  source: string;
  regression: { u: number; f2: number; alpha: number; power: number; v: number; n: number }[];
  logistic: { p: number; oddsRatio: number; alpha: number; power: number; n: number }[];
}

const fixture = loadFixture<SampleSizeFixture>('samplesizeW8.json');

test('multiple-regression sample sizes match pwr.f2.test', () => {
  for (const reference of fixture.regression) {
    const result = sampleSizeRegression(reference.u, reference.f2, reference.alpha, reference.power);
    assert.equal(result.nPerGroup, Math.ceil(reference.n), `n for u=${reference.u}`);
    assert.ok(result.achievedPower >= reference.power);
    assertClose(result.achievedPower, reference.power, { absolute: 3e-3 }, 'achieved power');
  }
});

test('logistic sample sizes match the Hsieh closed form', () => {
  for (const reference of fixture.logistic) {
    const result = sampleSizeLogistic(reference.p, reference.oddsRatio, reference.alpha, reference.power);
    assert.equal(result.nPerGroup, Math.ceil(reference.n), `n for OR=${reference.oddsRatio}`);
    assert.ok(result.achievedPower >= reference.power);
    assertClose(result.achievedPower, reference.power, { absolute: 3e-3 }, 'achieved power');
  }
});
