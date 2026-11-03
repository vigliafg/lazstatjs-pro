import test from 'node:test';
import assert from 'node:assert/strict';
import { gageRr } from '../kernels/msa';
import { assertClose, loadFixture } from './harness';

interface MsaFixture {
  source: string;
  data: { part: string[]; operator: string[]; value: number[] };
  anova: {
    df: number[];
    ss: number[];
    ms: number[];
    fOperator: number;
    pOperator: number;
    fInteraction: number;
    pInteraction: number;
  };
  components: {
    parts: number;
    operators: number;
    replicates: number;
    repeatability: number;
    reproducibility: number;
    interaction: number;
    part: number;
    grr: number;
    total: number;
    pctContribution: number;
    pctStudyVariation: number;
    ndc: number;
  };
}

const fixture = loadFixture<MsaFixture>('msa.json');

test('Gage R&R reproduces the base-R two-way ANOVA', () => {
  const rows = fixture.data.value.map((value, index) => ({
    part: fixture.data.part[index],
    operator: fixture.data.operator[index],
    value,
  }));
  const result = gageRr(rows);
  assert.ok(result);

  assert.equal(result!.parts, fixture.components.parts);
  assert.equal(result!.operators, fixture.components.operators);
  assert.equal(result!.replicates, fixture.components.replicates);

  fixture.anova.df.forEach((df, index) => assert.equal(result!.anova[index].df, df, `df ${index}`));
  fixture.anova.ss.forEach((ss, index) => assertClose(result!.anova[index].ss, ss, { absolute: 1e-10 }, `ss ${index}`));
  fixture.anova.ms.forEach((ms, index) => assertClose(result!.anova[index].ms, ms, { absolute: 1e-10 }, `ms ${index}`));

  assertClose(result!.anova[1].f!, fixture.anova.fOperator, { absolute: 1e-10 }, 'operator F');
  assertClose(result!.anova[1].p!, fixture.anova.pOperator, { absolute: 1e-10 }, 'operator p');
  assertClose(result!.anova[2].f!, fixture.anova.fInteraction, { absolute: 1e-10 }, 'interaction F');
  assertClose(result!.anova[2].p!, fixture.anova.pInteraction, { absolute: 1e-10 }, 'interaction p');

  assertClose(result!.variance.repeatability, fixture.components.repeatability, { absolute: 1e-10 }, 'repeatability');
  assertClose(result!.variance.reproducibility, fixture.components.reproducibility, { absolute: 1e-10 }, 'reproducibility');
  assertClose(result!.variance.part, fixture.components.part, { absolute: 1e-10 }, 'part variance');
  assertClose(result!.variance.grr, fixture.components.grr, { absolute: 1e-10 }, 'GRR variance');
  assertClose(result!.variance.total, fixture.components.total, { absolute: 1e-10 }, 'total variance');
  assertClose(result!.pctContribution, fixture.components.pctContribution, { absolute: 1e-10 }, '% contribution');
  assertClose(result!.pctStudyVariation, fixture.components.pctStudyVariation, { absolute: 1e-10 }, '% study variation');
  assertClose(result!.ndc, Math.floor(fixture.components.ndc), { absolute: 0 }, 'ndc');
});
