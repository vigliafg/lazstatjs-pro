import test from 'node:test';
import assert from 'node:assert/strict';
import { fitRecurrent } from '../kernels/recurrent';
import { assertClose, assertCloseVector, loadFixture, TOLERANCES } from './harness';

interface RecurrentFixture {
  source: string;
  data: { id: number[]; start: number[]; stop: number[]; event: number[]; x: number[]; z: number[] };
  ag: { coef: number[]; se: number[]; logLik: number; events: number };
  wlw: { coef: number[]; se: number[]; logLik: number; events: number };
}

const fixture = loadFixture<RecurrentFixture>('recurrent.json');

for (const model of ['ag', 'wlw'] as const) {
  test(`${model.toUpperCase()} recurrent-event model matches survival::coxph`, () => {
    const expected = fixture[model];
    const fit = fitRecurrent({
      id: fixture.data.id,
      start: fixture.data.start,
      stop: fixture.data.stop,
      event: fixture.data.event,
      covariates: [
        { name: 'x', values: fixture.data.x },
        { name: 'z', values: fixture.data.z },
      ],
      model,
      level: 95,
    });
    assert.ok(fit, `${model}: fit`);
    assertCloseVector(
      fit!.coefficients.map(coefficient => coefficient.beta),
      expected.coef,
      { absolute: 1e-4 },
      `${model} coefficients`
    );
    assertCloseVector(
      fit!.coefficients.map(coefficient => coefficient.se),
      expected.se,
      { absolute: 5e-3 },
      `${model} robust standard errors`
    );
    assertClose(fit!.logLik, expected.logLik, { absolute: 1e-2 }, `${model} log likelihood`);
    assert.equal(fit!.events, expected.events, `${model} events`);
  });
}
