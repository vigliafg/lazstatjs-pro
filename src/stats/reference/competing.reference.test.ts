import test from 'node:test';
import assert from 'node:assert/strict';
import { fitCompetingRisks } from '../kernels/competing';
import { assertClose, assertCloseVector, loadFixture, TOLERANCES } from './harness';

interface CompetingFixture {
  source: string;
  data: { time: number[]; cause: number[]; x: number[]; z: number[] };
  cause: number;
  coef: number[];
  se: number[];
  logLik: number;
  cif: { time: number[]; value: number[] };
}

const fixture = loadFixture<CompetingFixture>('competing.json');

test('Fine–Gray coefficients match cmprsk::crr and standard errors stay close', () => {
  const fit = fitCompetingRisks({
    time: fixture.data.time,
    event: fixture.data.cause,
    covariates: [
      { name: 'x', values: fixture.data.x },
      { name: 'z', values: fixture.data.z },
    ],
    cause: fixture.cause,
    level: 95,
  });
  assert.ok(fit);
  assertCloseVector(
    fit!.coefficients.map(coefficient => coefficient.beta),
    fixture.coef,
    { absolute: 2e-3 },
    'Fine–Gray coefficients'
  );
  assertCloseVector(
    fit!.coefficients.map(coefficient => coefficient.se),
    fixture.se,
    // The kernel reports the model-based inverse-information SE; cmprsk adds
    // the contribution of the estimated censoring distribution.
    { absolute: 2e-2 },
    'Fine–Gray standard errors'
  );
  assertClose(fit!.logLik, fixture.logLik, { absolute: 1 }, 'Fine–Gray log likelihood');
});

test('cumulative incidence follows cmprsk::crr predictions', () => {
  const fit = fitCompetingRisks({
    time: fixture.data.time,
    event: fixture.data.cause,
    covariates: [
      { name: 'x', values: fixture.data.x },
      { name: 'z', values: fixture.data.z },
    ],
    cause: fixture.cause,
    level: 95,
  });
  assert.ok(fit);
  let cursor = 0;
  fixture.cif.time.forEach((time, index) => {
    while (cursor + 1 < fit!.cif.length && fit!.cif[cursor + 1].time <= time) cursor += 1;
    assertClose(fit!.cif[cursor].cif, fixture.cif.value[index], TOLERANCES.monteCarlo, `CIF(${time})`);
  });
});
