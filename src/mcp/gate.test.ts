import test from 'node:test';
import assert from 'node:assert/strict';
import { RunGate } from './gate';
import { McpError } from './errors';

test('bounds concurrent runs and rejects beyond the queue limit with E_BUSY', async () => {
  const gate = new RunGate();
  let release!: () => void;
  const blocked = new Promise<void>(resolve => {
    release = resolve;
  });
  const running = Array.from({ length: 4 }, () => gate.run(() => blocked));
  assert.deepEqual(gate.stats, { active: 4, queued: 0 });

  const queued = Array.from({ length: 16 }, () => gate.run(async () => undefined));
  assert.deepEqual(gate.stats, { active: 4, queued: 16 });

  await assert.rejects(
    gate.run(async () => undefined),
    (error: unknown) => error instanceof McpError && error.code === 'E_BUSY'
  );

  release();
  await Promise.all([...running, ...queued]);
  assert.deepEqual(gate.stats, { active: 0, queued: 0 });
});
