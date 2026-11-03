import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptancePa, acceptancePlan } from './acceptance';

test('the OC curve starts at certainty and falls with incoming quality', () => {
  const plan = acceptancePlan({ n: 50, c: 2, lotSize: 0 });
  assert.ok(plan);
  assert.equal(plan!.distribution, 'binomial');
  assert.ok(plan!.points[0].pa > 0.99);
  assert.ok(plan!.points[plan!.points.length - 1].pa < 0.1);
  assert.ok(plan!.aql > 0 && plan!.aql < plan!.ltpd);
  assert.ok(plan!.aoql > 0);
});

test('a finite lot uses the hypergeometric distribution', () => {
  const plan = acceptancePlan({ n: 20, c: 1, lotSize: 200 });
  assert.ok(plan);
  assert.equal(plan!.distribution, 'hypergeometric');
  assert.ok(acceptancePa({ n: 20, c: 1, lotSize: 200 }, 0) > 0.999);
});

test('invalid plans are rejected instead of returning misleading curves', () => {
  assert.equal(acceptancePlan({ n: 0, c: 0, lotSize: 0 }), null);
  assert.equal(acceptancePlan({ n: 10, c: 10, lotSize: 0 }), null);
  assert.equal(acceptancePlan({ n: 100, c: 1, lotSize: 50 }), null);
});
