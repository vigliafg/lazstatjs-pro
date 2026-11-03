import test from 'node:test';
import assert from 'node:assert/strict';
import { doeDesign } from '../kernels/doeDesign';
import { assertClose, assertCloseMatrix, loadFixture } from './harness';

interface DoeDesignFixture {
  source: string;
  full3: { matrix: number[][]; center: number };
  half4: { matrix: number[][]; generator: string };
  ccd3: { matrix: number[][]; alpha: number; center: number };
  boxBehnken3: { matrix: number[][]; center: number };
}

const fixture = loadFixture<DoeDesignFixture>('doeDesign.json');

const cornerMatrix = (design: ReturnType<typeof doeDesign>): number[][] =>
  (design?.rows ?? []).filter(row => row.kind !== 'center').map(row => row.levels);

test('full and half factorial matrices match expand.grid', () => {
  const full = doeDesign({ design: 'full', factors: 3, centerPoints: fixture.full3.center });
  assert.ok(full);
  assertCloseMatrix(cornerMatrix(full), fixture.full3.matrix, { absolute: 0 }, 'full 3');

  const half = doeDesign({ design: 'half', factors: 4, centerPoints: 0 });
  assert.ok(half);
  assertCloseMatrix(cornerMatrix(half), fixture.half4.matrix, { absolute: 0 }, 'half 4');
});

test('CCD and Box–Behnken matrices match the explicit construction', () => {
  const ccd = doeDesign({ design: 'ccd', factors: 3, centerPoints: fixture.ccd3.center });
  assert.ok(ccd);
  assertCloseMatrix(cornerMatrix(ccd), fixture.ccd3.matrix, { absolute: 1e-12 }, 'CCD 3');
  assertClose(ccd!.alpha!, fixture.ccd3.alpha, { absolute: 1e-12 }, 'CCD alpha');

  const bb = doeDesign({ design: 'boxBehnken', factors: 3, centerPoints: fixture.boxBehnken3.center });
  assert.ok(bb);
  assertCloseMatrix(cornerMatrix(bb), fixture.boxBehnken3.matrix, { absolute: 0 }, 'Box–Behnken 3');
});
