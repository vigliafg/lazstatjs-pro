import test from 'node:test';
import assert from 'node:assert/strict';
import { fitReliabilityGrowth, reliabilityBlockDiagram } from '../kernels/reliability';
import { assertClose, assertCloseVector, loadFixture, TOLERANCES } from './harness';

interface ReliabilityFixture {
  source: string;
  data: { time: number[]; failures: number[] };
  beta: number;
  lambda: number;
  logLik: number;
  mtbfCumulative: number;
  mtbfInstantaneous: number;
  stages: (number[] | number)[][];
  stageReliability: number[];
  system: number;
}

const fixture = loadFixture<ReliabilityFixture>('reliability.json');

test('Crow–AMSAA growth matches the independent R maximum likelihood', () => {
  const growth = fitReliabilityGrowth(fixture.data.time, fixture.data.failures);
  assert.ok(growth);
  assertClose(growth!.beta, fixture.beta, TOLERANCES.rProbability, 'beta');
  assertClose(growth!.lambda, fixture.lambda, TOLERANCES.rProbability, 'lambda');
  assertClose(growth!.logLik, fixture.logLik, TOLERANCES.rProbability, 'log likelihood');
  assertClose(growth!.mtbfCumulative, fixture.mtbfCumulative, TOLERANCES.r, 'cumulative MTBF');
  assertClose(growth!.mtbfInstantaneous, fixture.mtbfInstantaneous, { relative: 1e-6 }, 'instantaneous MTBF');
});

test('series/parallel reliability block diagram matches the closed form', () => {
  const stages = fixture.stages.map(stage => (Array.isArray(stage) ? stage : [stage])) as number[][];
  const rbd = reliabilityBlockDiagram(stages);
  assert.ok(rbd);
  assertCloseVector(
    rbd!.stages.map(stage => stage.reliability),
    fixture.stageReliability,
    TOLERANCES.r,
    'stage reliability'
  );
  assertClose(rbd!.system, fixture.system, TOLERANCES.r, 'system reliability');
});
