import test from 'node:test';
import assert from 'node:assert/strict';
import { createRunGate } from './liveGate';

test('only the newest token is current', () => {
  const gate = createRunGate();
  const first = gate.next();
  assert.equal(gate.isCurrent(first), true);

  const second = gate.next();
  assert.equal(gate.isCurrent(first), false);
  assert.equal(gate.isCurrent(second), true);
});

test('invalidate makes every issued token stale', () => {
  const gate = createRunGate();
  const token = gate.next();
  gate.invalidate();
  assert.equal(gate.isCurrent(token), false);
});

test('an invalidated gate issues fresh tokens', () => {
  const gate = createRunGate();
  const old = gate.next();
  gate.invalidate();
  const next = gate.next();
  assert.equal(gate.isCurrent(old), false);
  assert.equal(gate.isCurrent(next), true);
});
