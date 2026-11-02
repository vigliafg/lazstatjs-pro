import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutPartitionTree, partitionModel } from './partition';

const simple = () => {
  const x = Array.from({ length: 20 }, (_, index) => [index + 1, (index * 7) % 5]);
  const y = x.map(row => (row[0] < 11 ? 0 : 10));
  return { x, y };
};

test('partition grows a split that separates two constant leaves', () => {
  const { x, y } = simple();
  const model = partitionModel({ x, y, maxDepth: 3, minSplit: 3 });
  assert.ok(model);
  assert.equal(model!.leaves.length, 2);
  assert.ok(model!.splits.length >= 1);
  assert.ok(model!.r2 > 0.95);
  assert.equal(model!.importance[0].variable, 0);
  assert.ok(model!.splits[0].threshold > 10 && model!.splits[0].threshold < 12);
});

test('partition respects the minimum split and the empty-split case', () => {
  const { x, y } = simple();
  const tooDeep = partitionModel({ x, y, maxDepth: 0, minSplit: 50 });
  assert.equal(tooDeep, null);
  const constant = partitionModel({
    x,
    y: y.map(() => 5),
    maxDepth: 3,
    minSplit: 2,
  });
  assert.ok(constant);
  assert.equal(constant!.leaves.length, 1);
  assert.equal(constant!.splits.length, 0);
  assert.equal(constant!.r2, 0);
});

test('tree layout stays inside the unit square and links every child', () => {
  const { x, y } = simple();
  const model = partitionModel({ x, y, maxDepth: 3, minSplit: 3 })!;
  const layout = layoutPartitionTree(model, ['A', 'B']);
  assert.ok(layout.nodes.length >= 3);
  assert.ok(layout.links.length >= 4);
  for (const node of layout.nodes) {
    assert.ok(node.x >= 0 && node.x <= 1);
    assert.ok(node.y >= 0 && node.y <= 1);
  }
  assert.ok(layout.nodes.some(node => node.terminal));
  assert.ok(layout.nodes.some(node => !node.terminal));
});

const referenceClose = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

// Reference: R 4.x, rpart::rpart(y ~ x1 + x2, method = "anova",
// control = rpart.control(minsplit = 3, minbucket = 3, maxdepth = 2,
// cp = 0, xval = 0)) on the same 20 observations.
test('partition reproduces the rpart tree, leaf means and R²', () => {
  const x1 = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40];
  const x2 = [1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0];
  const y = [
    1.1, 2.2, 2.6, 3.8, 4.9, 6.2, 7.1, 7.9, 9.2, 10.1, 10.8, 11.9, 12.2, 13.1, 14.2, 14.9, 16.1,
    16.8, 18.2, 19.1,
  ];
  const model = partitionModel({
    x: x1.map((value, index) => [value, x2[index]]),
    y,
    maxDepth: 2,
    minSplit: 3,
  });
  assert.ok(model);

  // rpart: root x1 < 19, then x1 < 11 and x1 < 31.
  assert.deepEqual(
    model!.splits.map(split => [split.variable, split.threshold, split.n]),
    [
      [0, 19, 20],
      [0, 11, 9],
      [0, 31, 11],
    ]
  );

  // rpart frame: n = 5, 4, 6, 5 and yval = 2.92, 7.60, 12.05, 17.02.
  assert.deepEqual(model!.leaves.map(leaf => leaf.n), [5, 4, 6, 5]);
  const means = [2.92, 7.6, 12.05, 17.02];
  model!.leaves.forEach((leaf, index) => referenceClose(leaf.mean, means[index], 1e-12));

  referenceClose(model!.r2, 0.93847247956027913, 1e-12);
  referenceClose(model!.rmse, 1.3366188686383265, 1e-12);
  assert.equal(model!.depth, 2);
});
