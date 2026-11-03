import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptancePlan } from '../kernels/acceptance';
import { assertClose, loadFixture } from './harness';

interface AcceptanceFixture {
  source: string;
  plans: Record<
    'binomial' | 'hypergeometric',
    {
      n: number;
      c: number;
      lot: number;
      aql: number;
      ltpd: number;
      alpha: number;
      beta: number;
      aoql: number;
      aoqlP: number;
      curve: { p: number; pa: number; aoq: number; ati: number }[];
    }
  >;
}

const fixture = loadFixture<AcceptanceFixture>('acceptance.json');

for (const key of ['binomial', 'hypergeometric'] as const) {
  test(`acceptance plan ${key} matches pbinom/phyper`, () => {
    const reference = fixture.plans[key];
    const result = acceptancePlan({ n: reference.n, c: reference.c, lotSize: reference.lot });
    assert.ok(result);

    // A finite lot rounds p·N to an integer count, so the crossing is a step
    // function: the independent root finder and the kernel can land on
    // different sides of the same step. The curve itself is compared exactly.
    const crossing = key === 'binomial' ? 1e-7 : 3e-3;
    assertClose(result!.aql, reference.aql, { absolute: crossing }, 'AQL');
    assertClose(result!.ltpd, reference.ltpd, { absolute: crossing }, 'LTPD');
    assertClose(result!.alpha, reference.alpha, { absolute: crossing }, 'alpha');
    assertClose(result!.beta, reference.beta, { absolute: crossing }, 'beta');
    assertClose(result!.aoql, reference.aoql, { absolute: key === 'binomial' ? 1e-5 : crossing }, 'AOQL');
    assertClose(result!.aoqlP, reference.aoqlP, { absolute: key === 'binomial' ? 1e-3 : 0.01 }, 'AOQL quality');

    assert.equal(result!.points.length, reference.curve.length);
    reference.curve.forEach((row, index) => {
      assertClose(result!.points[index].p, row.p, { absolute: 1e-12 }, `p ${index}`);
      assertClose(result!.points[index].pa, row.pa, { absolute: 1e-10 }, `Pa ${index}`);
      assertClose(result!.points[index].aoq, row.aoq, { absolute: 1e-10 }, `AOQ ${index}`);
      assertClose(result!.points[index].ati, row.ati, { absolute: 1e-10 }, `ATI ${index}`);
    });
  });
}
