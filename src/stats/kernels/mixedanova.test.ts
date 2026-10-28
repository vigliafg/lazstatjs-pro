import test from 'node:test';
import assert from 'node:assert/strict';
import { mixedAnovaStats } from './mixedanova';

const rows = [
  ['1', '1.766166', '2.436160', '2.214607'],
  ['1', '1.579666', '2.394416', '2.356847'],
  ['1', '1.731884', '1.664667', '1.195579'],
  ['1', '1.562730', '1.796082', '2.516820'],
  ['2', '2.468559', '2.082204', '2.927714'],
  ['2', '1.974785', '3.204341', '2.791356'],
  ['2', '2.923302', '2.505060', '3.413249'],
  ['2', '2.296204', '2.439967', '2.908794'],
  ['3', '3.497107', '2.657130', '2.975804'],
  ['3', '3.580465', '3.341083', '2.591756'],
  ['3', '3.402670', '3.485484', '2.778443'],
  ['3', '2.490543', '3.604311', '3.571382'],
];

const close = (actual: number, expected: number, tolerance = 1e-4) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('mixed ANOVA matches aov(y ~ group*time + Error(subject/time))', () => {
  const stats = mixedAnovaStats({ rows, groupIdx: 0, conditionIdxs: [1, 2, 3], level: 95 });
  assert.ok(stats);
  if (!stats) return;
  const [group, within, time, interaction, error] = stats.effects;
  close(group.ss, 9.1777821);
  close(group.f, 36.16919);
  close(within.ss, 1.1418563);
  close(time.ss, 0.4075035);
  close(time.f, 1.00643);
  close(interaction.ss, 1.0236649);
  close(interaction.f, 1.26410);
  close(error.ss, 3.6440871);
  assert.equal(group.df, 2);
  assert.equal(time.df, 2);
  assert.equal(interaction.df, 4);
  assert.equal(error.df, 18);
});

test('mixed ANOVA rejects missing groups or too few conditions', () => {
  assert.equal(mixedAnovaStats({ rows, groupIdx: 0, conditionIdxs: [1], level: 95 }), null);
  assert.equal(
    mixedAnovaStats({ rows: rows.map(row => ['A', ...row.slice(1)]), groupIdx: 0, conditionIdxs: [1, 2, 3], level: 95 }),
    null
  );
});
