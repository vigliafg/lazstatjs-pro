import test from 'node:test';
import assert from 'node:assert/strict';
import { arSpectrum, fisherTest, periodogram } from '../kernels/spectral';
import { assertClose, assertCloseVector, loadFixture } from './harness';

interface SpectralFixture {
  source: string;
  data: number[];
  frequency: number[];
  power: number[];
  fisher: { g: number; p: number; frequency: number };
  ar: { order: number; coefficients: number[]; variance: number };
}

const fixture = loadFixture<SpectralFixture>('spectral.json');

test('periodogram matches stats::spectrum', () => {
  const points = periodogram(fixture.data);
  assertCloseVector(
    points.map(point => point.frequency),
    fixture.frequency,
    { absolute: 1e-12 },
    'frequency'
  );
  assertCloseVector(
    points.map(point => point.power),
    fixture.power,
    { relative: 1e-9, absolute: 1e-9 },
    'power'
  );
});

test("Fisher's g matches the exact finite-sum reference", () => {
  const fisher = fisherTest(periodogram(fixture.data));
  assertClose(fisher.g, fixture.fisher.g, { absolute: 1e-12 }, 'g');
  assertClose(fisher.frequency, fixture.fisher.frequency, { absolute: 1e-12 }, 'peak frequency');
  assertClose(fisher.p, fixture.fisher.p, { absolute: 1e-10 }, 'p');
});

test('Yule–Walker AR spectrum matches ar() order and coefficients', () => {
  const ar = arSpectrum(fixture.data, 20);
  assert.ok(ar);
  assert.equal(ar!.order, fixture.ar.order);
  assertCloseVector(ar!.coefficients, fixture.ar.coefficients, { absolute: 1e-8 }, 'AR coefficients');
  assertClose(ar!.variance, fixture.ar.variance, { relative: 1e-8 }, 'prediction variance');
});
