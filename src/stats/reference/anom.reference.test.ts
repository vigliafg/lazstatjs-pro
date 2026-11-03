import test from 'node:test';
import assert from 'node:assert/strict';
import { anom } from '../kernels/anom';
import { assertClose, assertCloseVector, loadFixture, TOLERANCES } from './harness';

interface AnomGroup {
  group: string;
  n: number;
  mean: number;
  lower: number;
  upper: number;
  outside: boolean;
}

interface AnomCase {
  name: string;
  y: number[];
  group: string[];
  alpha: number;
  grandMean: number;
  msWithin: number;
  dfWithin: number;
  k: number;
  h: number;
  groups: AnomGroup[];
}

interface AnomFixture {
  source: string;
  generatedBy: string;
  cases: AnomCase[];
}

const fixture = loadFixture<AnomFixture>('anom.json');

test('ANOM decision lines and group flags match the R computation', () => {
  for (const reference of fixture.cases) {
    const rows = reference.y.map((value, index) => [reference.group[index], String(value)]);
    const result = anom(rows, 1, 0, reference.alpha);
    assert.ok(result, `${reference.name}: result is null`);

    assertClose(result!.grandMean, reference.grandMean, TOLERANCES.r, `${reference.name} grand mean`);
    assertClose(result!.msWithin, reference.msWithin, TOLERANCES.r, `${reference.name} MS within`);
    assert.equal(result!.dfWithin, reference.dfWithin, `${reference.name} df`);
    assert.equal(result!.k, reference.k, `${reference.name} k`);
    assertClose(result!.h, reference.h, TOLERANCES.rProbability, `${reference.name} h`);

    assert.equal(result!.groups.length, reference.groups.length);
    result!.groups.forEach((group, index) => {
      const expected = reference.groups[index];
      assert.equal(group.group, expected.group);
      assert.equal(group.n, expected.n);
      assertClose(group.mean, expected.mean, TOLERANCES.r, `${reference.name} ${group.group} mean`);
      assertCloseVector(
        [group.lower, group.upper],
        [expected.lower, expected.upper],
        TOLERANCES.r,
        `${reference.name} ${group.group} limits`
      );
      assert.equal(group.outside, expected.outside, `${reference.name} ${group.group} outside`);
    });
  }
});
