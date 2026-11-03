import test from 'node:test';
import assert from 'node:assert/strict';
import { bayesAnalysis } from '../kernels/bayes';
import { assertClose, loadFixture } from './harness';

interface HierarchicalFixture {
  source: string;
  data: { Group: string; Y: number }[];
  mu: number;
  sigma: number;
  tau: number;
  groups: string[];
  groupMeans: number[];
}

const fixture = loadFixture<HierarchicalFixture>('bayesHierW9.json');
const labels = fixture.data.map(row => row.Group);
const names = [...new Set(labels)].sort((a, b) => a.localeCompare(b));
const codes = labels.map(label => names.indexOf(label));
const y = fixture.data.map(row => row.Y);

test('hierarchical normal model matches the random-intercept fit', () => {
  const result = bayesAnalysis(y, [], {
    mode: 'hierarchical',
    priorMean: 0,
    priorSd: 10,
    iterations: 6000,
    burnin: 1000,
    chains: 2,
    seed: 20261116,
    groupCodes: codes,
    groupNames: names,
  });
  assert.ok(result);
  assertClose(result!.parameters[0].mean, fixture.mu, { absolute: 0.35 }, 'mu');
  assertClose(result!.sigma!.mean, fixture.sigma, { absolute: 0.3 }, 'sigma');
  // The posterior of tau is skewed: the mean is above the REML estimate but
  // the group means remain close to the conditional modes.
  assertClose(result!.tau!.mean, fixture.tau, { absolute: 0.8 }, 'tau');
  result!.groups.forEach((group, index) => {
    assertClose(group.mean, fixture.groupMeans[index], { absolute: 0.35 }, `group ${index + 1}`);
  });
  assert.ok(result!.rhatMax < 1.05, `Rhat too high: ${result!.rhatMax}`);
});
