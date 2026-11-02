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
