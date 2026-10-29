import test from 'node:test';
import assert from 'node:assert/strict';
import { OVERSCAN, ROW_HEIGHT, VIRTUAL_THRESHOLD, visibleWindow } from './virtual';

test('small grids render every row without spacers', () => {
  assert.deepEqual(visibleWindow(20, 0, 500), { start: 0, end: 20, padTop: 0, padBottom: 0 });
  assert.deepEqual(visibleWindow(VIRTUAL_THRESHOLD, 0, 500), {
    start: 0,
    end: VIRTUAL_THRESHOLD,
    padTop: 0,
    padBottom: 0,
  });
});

test('large grids render only the viewport plus overscan', () => {
  const total = 1000;
  const window = visibleWindow(total, 0, 460);
  assert.equal(window.start, 0);
  assert.equal(window.end, Math.ceil(460 / ROW_HEIGHT) + OVERSCAN);
  assert.equal(window.padTop, 0);
  assert.equal(window.padBottom, (total - window.end) * ROW_HEIGHT);

  const middle = visibleWindow(total, 100 * ROW_HEIGHT, 460);
  assert.equal(middle.start, 100 - OVERSCAN);
  assert.equal(middle.end, 100 + Math.ceil(460 / ROW_HEIGHT) + OVERSCAN);
  assert.equal(middle.padTop, middle.start * ROW_HEIGHT);
});

test('the window is clamped to the row count and to non-negative scroll', () => {
  const atEnd = visibleWindow(200, 1_000_000, 460);
  assert.equal(atEnd.end, 200);
  assert.equal(atEnd.padBottom, 0);
  assert.ok(atEnd.start <= 200);

  const negative = visibleWindow(200, -50, -10);
  assert.equal(negative.start, 0);
  assert.equal(negative.end, OVERSCAN);
});
