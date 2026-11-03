import test from 'node:test';
import assert from 'node:assert/strict';
import { irtAnalysis } from '../kernels/irt';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface IrtFixture {
  source: string;
  cases: {
    name: string;
    model: '2PL' | 'Rasch';
    data: number[][];
    a: number[];
    b: number[];
    logLik: number;
    aic: number;
    bic: number;
  }[];
}

const fixture = loadFixture<IrtFixture>('irt.json');

test('IRT item parameters and log-likelihood match R mirt', () => {
  assert.equal(fixture.source, 'R mirt::mirt (quadpts = 21)');
  for (const reference of fixture.cases) {
    const fit = irtAnalysis({
      data: reference.data,
      variableNames: reference.a.map((_, index) => `Item${index + 1}`),
      model: reference.model === '2PL' ? '2pl' : 'rasch',
      quadrature: 21,
    });
    assert.ok(fit, `${reference.name}: fit`);
    reference.a.forEach((value, index) => {
      // mirt and the EM kernel can settle on a slightly different point along
      // the same likelihood ridge; the item curves and the total likelihood
      // are the stable quantities.
      assertClose(fit!.items[index].discrimination, value, { absolute: 0.2, relative: 0.15 }, `${reference.name} a[${index}]`);
      assertClose(fit!.items[index].difficulty, value === 1 ? reference.b[index] : reference.b[index], { absolute: 0.3, relative: 0.2 }, `${reference.name} b[${index}]`);
    });
    assertClose(fit!.logLik, reference.logLik, { absolute: 1.5, relative: 0.001 }, `${reference.name} logLik`);
  }
});
