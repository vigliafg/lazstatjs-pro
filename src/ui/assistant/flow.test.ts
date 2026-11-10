import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFlow } from './flow';

test('the root question is current before any answer', () => {
  const flow = buildFlow('analysis', []);
  const current = flow.nodes.filter(node => node.state === 'current');
  assert.equal(current.length, 1);
  assert.equal(current[0].id, 'a1');
  assert.equal(current[0].depth, 0);
});

test('an open question lists its next options as available nodes', () => {
  const flow = buildFlow('analysis', []);
  const available = flow.nodes.filter(node => node.state === 'available');
  assert.ok(available.length >= 5);
  assert.ok(available.every(node => node.depth === 1 && node.optionId));
  assert.equal(flow.edges.length, available.length);
});

test('the answered path is marked and the reached leaf is current', () => {
  const flow = buildFlow('analysis', ['compare', 'means', 'independent', 'wide']);
  assert.deepEqual(
    flow.nodes.slice(0, 5).map(node => `${node.id}:${node.state}`),
    ['a1:answered', 'compare:answered', 'means:answered', 'format:answered', 'ttest-ind:current']
  );
  assert.equal(flow.nodes.filter(node => node.state === 'available').length, 0);
});

test('an unknown answer stops the walk instead of throwing', () => {
  const flow = buildFlow('analysis', ['compare', 'not-an-option']);
  assert.equal(flow.nodes.find(node => node.state === 'current')?.id, 'compare');
  assert.equal(flow.nodes.filter(node => node.state === 'answered').length, 1);
});
