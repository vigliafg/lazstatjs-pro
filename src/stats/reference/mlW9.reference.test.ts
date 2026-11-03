import test from 'node:test';
import assert from 'node:assert/strict';
import { mlAnalysis } from '../kernels/ml';
import { assertClose, loadFixture } from './harness';

interface MlFixture {
  source: string;
  data: { X1: number; X2: number; X3: number; Y: number }[];
  forest: { r2: number; rmse: number; importance: number[]; names: string[] };
  boosting: { rmse: number; r2: number };
  nnet: { rmse: number; r2: number };
  classification: {
    data: { X1: number; X2: number; X3: number; Class: string }[];
    classes: string[];
    accuracy: number;
  };
}

const fixture = loadFixture<MlFixture>('mlW9.json');
const x = fixture.data.map(row => [row.X1, row.X2, row.X3]);
const y = fixture.data.map(row => row.Y);
const options = {
  trees: 200,
  minNode: 5,
  mtry: 2,
  shrinkage: 0.05,
  hidden: 4,
  iterations: 500,
  seed: 20261114,
  variableNames: ['X1', 'X2', 'X3'],
};

/**
 * Machine learning is stochastic and the three engines use different internal
 * optimisers, so these checks pin the error level and the importance ranking
 * instead of the individual trees. The tolerance is documented here, not
 * hidden in the harness.
 */
test('random forest reaches the error level of randomForest and ranks X1 first', () => {
  const result = mlAnalysis(x, y, { ...options, mode: 'rf' });
  assert.ok(result);
  assertClose(result!.oobR2!, fixture.forest.r2, { absolute: 0.25 }, 'out-of-bag R2');
  assert.equal(result!.importance[0].variable, 0, 'X1 should be the most important predictor');
});

test('gradient boosting stays close to gbm on the same data', () => {
  const result = mlAnalysis(x, y, { ...options, mode: 'boosting' });
  assert.ok(result);
  assertClose(result!.rmse, fixture.boosting.rmse, { absolute: 0.3 }, 'boosting RMSE');
});

test('the neural network stays close to nnet on the same data', () => {
  const result = mlAnalysis(x, y, { ...options, mode: 'nnet' });
  assert.ok(result);
  assertClose(result!.rmse, fixture.nnet.rmse, { absolute: 0.6 }, 'nnet RMSE');
});

test('classification reaches the randomForest accuracy on the same data', () => {
  const classX = fixture.classification.data.map(row => [row.X1, row.X2, row.X3]);
  const labels = fixture.classification.data.map(row => row.Class);
  const classes = [...new Set(labels)].sort((a, b) => a.localeCompare(b));
  const codes = labels.map(label => classes.indexOf(label));
  const result = mlAnalysis(classX, codes, {
    ...options,
    mode: 'rf',
    task: 'classification',
    classes,
    classCodes: codes,
  });
  assert.ok(result);
  assertClose(result!.accuracy, fixture.classification.accuracy, { absolute: 0.15 }, 'accuracy');
  assert.equal(result!.classes.length, fixture.classification.classes.length);
});
