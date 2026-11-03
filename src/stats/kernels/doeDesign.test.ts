import test from 'node:test';
import assert from 'node:assert/strict';
import { doeDesign } from './doeDesign';

test('full factorial enumerates every corner in standard order', () => {
  const design = doeDesign({ design: 'full', factors: 3, centerPoints: 2 });
  assert.ok(design);
  assert.equal(design!.runs, 10);
  assert.equal(design!.cornerRuns, 8);
  assert.equal(design!.centerRuns, 2);
  assert.deepEqual(design!.rows[0].levels, [-1, -1, -1]);
  assert.deepEqual(design!.rows[1].levels, [1, -1, -1]);
  assert.deepEqual(design!.rows[8].levels, [0, 0, 0]);
});

test('the half fraction adds the defining generator', () => {
  const design = doeDesign({ design: 'half', factors: 4, centerPoints: 0 });
  assert.ok(design);
  assert.equal(design!.runs, 8);
  assert.equal(design!.resolution, 4);
  assert.ok(design!.aliases.length > 0);
  for (const row of design!.rows) {
    assert.equal(row.levels[3], row.levels[0] * row.levels[1] * row.levels[2]);
  }
});

test('CCD and Box–Behnken add the expected points', () => {
  const ccd = doeDesign({ design: 'ccd', factors: 3, centerPoints: 4 });
  assert.ok(ccd);
  assert.equal(ccd!.runs, 8 + 6 + 4);
  assert.equal(ccd!.axialRuns, 6);
  assert.ok(ccd!.alpha !== null && ccd!.alpha > 1);

  const bb = doeDesign({ design: 'boxBehnken', factors: 3, centerPoints: 3 });
  assert.ok(bb);
  assert.equal(bb!.runs, 12 + 3);
  assert.equal(bb!.centerRuns, 3);
});
