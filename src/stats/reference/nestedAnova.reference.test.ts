import test from 'node:test';
import assert from 'node:assert/strict';
import { nestedAnova } from '../kernels/nestedAnova';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface NestedEffect {
  ss: number;
  df: number;
  ms: number;
  f: number;
  p: number;
}

interface NestedCase {
  name: string;
  y: number[];
  outerLevels: string[];
  innerLevels: string[];
  outer: NestedEffect;
  inner: NestedEffect;
  error: { ss: number; df: number; ms: number };
}

interface NestedFixture {
  source: string;
  generatedBy: string;
  cases: NestedCase[];
}

const fixture = loadFixture<NestedFixture>('nestedAnova.json');

test('nested ANOVA matches the R aov table', () => {
  for (const reference of fixture.cases) {
    const rows = reference.y.map((value, index) => [
      reference.outerLevels[index],
      reference.innerLevels[index],
      String(value),
    ]);
    const result = nestedAnova(rows, 2, 0, 1);
    assert.ok(result, `${reference.name}: result is null`);

    for (const source of ['outer', 'inner'] as const) {
      const expected = reference[source];
      const actual = result![source];
      assertClose(actual.ss, expected.ss, TOLERANCES.r, `${reference.name} ${source} ss`);
      assert.equal(actual.df, expected.df, `${reference.name} ${source} df`);
      assertClose(actual.ms, expected.ms, TOLERANCES.r, `${reference.name} ${source} ms`);
      assertClose(actual.f, expected.f, TOLERANCES.r, `${reference.name} ${source} F`);
      assertClose(actual.p, expected.p, TOLERANCES.rProbability, `${reference.name} ${source} p`);
    }
    assertClose(result!.error.ss, reference.error.ss, TOLERANCES.r, `${reference.name} error ss`);
    assert.equal(result!.error.df, reference.error.df);
    assertClose(result!.error.ms, reference.error.ms, TOLERANCES.r, `${reference.name} error ms`);
  }
});
