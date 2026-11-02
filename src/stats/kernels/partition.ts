/**
 * CART regression tree (JMP Partition, continuous response).
 *
 * The tree is grown greedily by variance reduction on a numeric response:
 * every candidate threshold of every predictor is scored with prefix sums, so
 * a split costs O(n log n) instead of O(n²). The result carries everything the
 * runner needs: predictions, leaf report, split list, variable importance and
 * a deterministic layout for the tree diagram.
 */

export interface PartitionInput {
  /** Response values, one per row. */
  y: number[];
  /** Predictor matrix, one row per observation. */
  x: number[][];
  maxDepth: number;
  /** Minimum observations on each side of a split and in a leaf. */
  minSplit: number;
}

import type {
  PartitionLeaf,
  PartitionModel,
  PartitionNode,
  PartitionSplit,
} from '../analysisResults';

export type {
  PartitionLeaf,
  PartitionModel,
  PartitionNode,
  PartitionSplit,
} from '../analysisResults';

interface Candidate {
  index: number;
  variable: number;
  threshold: number;
  left: number[];
  right: number[];
  improvement: number;
}

const meanOf = (values: number[], indices: number[]): number =>
  indices.reduce((sum, index) => sum + values[index], 0) / Math.max(1, indices.length);

const sseOf = (values: number[], indices: number[], mean: number): number =>
  indices.reduce((sum, index) => sum + Math.pow(values[index] - mean, 2), 0);

const bestSplit = (
  y: number[],
  x: number[][],
  indices: number[],
  parentSse: number,
  minSplit: number
): Candidate | null => {
  if (indices.length < 2 * minSplit) return null;
  let best: Candidate | null = null;

  for (let variable = 0; variable < (x[0]?.length ?? 0); variable += 1) {
    const values = indices
      .map(index => ({ value: x[index][variable], index }))
      .filter(item => Number.isFinite(item.value))
      .sort((a, b) => a.value - b.value);
    if (values.length < 2 * minSplit) continue;

    // Prefix sums let every candidate threshold be scored in O(1).
    const count = values.length;
    const prefix = new Array<number>(count + 1).fill(0);
    const prefixSq = new Array<number>(count + 1).fill(0);
    for (let i = 0; i < count; i += 1) {
      const value = y[values[i].index];
      prefix[i + 1] = prefix[i] + value;
      prefixSq[i + 1] = prefixSq[i] + value * value;
    }

    for (let i = 0; i < count - 1; i += 1) {
      if (values[i].value === values[i + 1].value) continue;
      const leftN = i + 1;
      const rightN = count - leftN;
      if (leftN < minSplit || rightN < minSplit) continue;
      const leftSum = prefix[leftN];
      const rightSum = prefix[count] - leftSum;
      const leftSse = prefixSq[leftN] - (leftSum * leftSum) / leftN;
      const rightSse =
        prefixSq[count] - prefixSq[leftN] - (rightSum * rightSum) / rightN;
      const improvement = parentSse - Math.max(0, leftSse) - Math.max(0, rightSse);
      if (improvement <= 1e-12) continue;
      if (best && improvement <= best.improvement) continue;
      best = {
        index: i,
        variable,
        threshold: (values[i].value + values[i + 1].value) / 2,
        left: values.slice(0, leftN).map(item => item.index),
        right: values.slice(leftN).map(item => item.index),
        improvement,
      };
    }
  }

  return best;
};

const buildNode = (
  y: number[],
  x: number[][],
  indices: number[],
  depth: number,
  maxDepth: number,
  minSplit: number,
  nextId: () => number,
  leaves: PartitionLeaf[],
  splits: PartitionSplit[],
  path: string
): PartitionNode => {
  const id = nextId();
  const prediction = meanOf(y, indices);
  const sse = sseOf(y, indices, prediction);
  const node: PartitionNode = { id, depth, indices, prediction, sse };

  if (depth >= maxDepth || indices.length < 2 * minSplit || sse <= 1e-12) {
    const values = indices.map(index => y[index]);
    leaves.push({
      node: id,
      n: indices.length,
      mean: prediction,
      sd:
        values.length > 1
          ? Math.sqrt(sse / (values.length - 1))
          : 0,
      min: Math.min(...values),
      max: Math.max(...values),
      path: path || 'Radice',
    });
    return node;
  }

  const candidate = bestSplit(y, x, indices, sse, minSplit);
  if (!candidate) {
    const values = indices.map(index => y[index]);
    leaves.push({
      node: id,
      n: indices.length,
      mean: prediction,
      sd: values.length > 1 ? Math.sqrt(sse / (values.length - 1)) : 0,
      min: Math.min(...values),
      max: Math.max(...values),
      path: path || 'Radice',
    });
    return node;
  }

  const label = `${path ? `${path} · ` : ''}X${candidate.variable + 1} < ${candidate.threshold.toFixed(2)}`;
  splits.push({
    node: id,
    depth,
    variable: candidate.variable,
    threshold: candidate.threshold,
    n: indices.length,
    improvement: candidate.improvement,
  });
  node.split = {
    variable: candidate.variable,
    threshold: candidate.threshold,
    improvement: candidate.improvement,
    left: buildNode(
      y,
      x,
      candidate.left,
      depth + 1,
      maxDepth,
      minSplit,
      nextId,
      leaves,
      splits,
      `${path ? `${path} · ` : ''}X${candidate.variable + 1} < ${candidate.threshold.toFixed(2)}`
    ),
    right: buildNode(
      y,
      x,
      candidate.right,
      depth + 1,
      maxDepth,
      minSplit,
      nextId,
      leaves,
      splits,
      `${path ? `${path} · ` : ''}X${candidate.variable + 1} ≥ ${candidate.threshold.toFixed(2)}`
    ),
  };
  return node;
};

const predictNode = (node: PartitionNode, index: number, x: number[][]): number => {
  if (!node.split) return node.prediction;
  const value = x[index]?.[node.split.variable] ?? 0;
  return predictNode(value < node.split.threshold ? node.split.left : node.split.right, index, x);
};

/** Grow the tree and collect predictions, importance and leaf report. */
export const partitionModel = (input: PartitionInput): PartitionModel | null => {
  const { y, x } = input;
  if (y.length < 4 || x.length !== y.length || (x[0]?.length ?? 0) === 0) return null;
  const maxDepth = Math.max(1, Math.min(6, Math.round(input.maxDepth)));
  const minSplit = Math.max(2, Math.min(50, Math.round(input.minSplit)));
  if (y.length < 2 * minSplit) return null;

  const leaves: PartitionLeaf[] = [];
  const splits: PartitionSplit[] = [];
  let id = 0;
  const root = buildNode(
    y,
    x,
    y.map((_, index) => index),
    0,
    maxDepth,
    minSplit,
    () => id++,
    leaves,
    splits,
    ''
  );

  const predictions = y.map((_, row) => predictNode(root, row, x));
  const grand = y.reduce((sum, value) => sum + value, 0) / y.length;
  const sst = y.reduce((sum, value) => sum + Math.pow(value - grand, 2), 0);
  const sse = y.reduce((sum, value, index) => sum + Math.pow(value - predictions[index], 2), 0);
  const reduction = new Array<number>(x[0].length).fill(0);
  splits.forEach(split => {
    reduction[split.variable] += split.improvement;
  });
  const totalReduction = reduction.reduce((sum, value) => sum + value, 0);
  const importance = reduction
    .map((value, variable) => ({
      variable,
      reduction: value,
      pct: totalReduction > 0 ? (value / totalReduction) * 100 : 0,
    }))
    .sort((a, b) => b.reduction - a.reduction);

  return {
    root,
    leaves: leaves.sort((a, b) => a.node - b.node),
    splits: splits.sort((a, b) => a.depth - b.depth || a.node - b.node),
    importance,
    predictions,
    r2: sst > 0 ? 1 - sse / sst : 0,
    rmse: Math.sqrt(sse / y.length),
    mae: y.reduce((sum, value, index) => sum + Math.abs(value - predictions[index]), 0) / y.length,
    n: y.length,
    depth: Math.max(...collectDepth(root)),
    sse,
    sst,
  };
};

export interface TreeLayoutNode {
  x: number;
  y: number;
  label: string;
  value: number;
  n: number;
  depth: number;
  terminal: boolean;
}

export interface TreeLayout {
  nodes: TreeLayoutNode[];
  links: { x1: number; y1: number; x2: number; y2: number }[];
}

/** Deterministic binary-tree layout in normalized [0, 1] coordinates. */
export const layoutPartitionTree = (
  model: PartitionModel,
  variableNames: string[]
): TreeLayout => {
  const leaves: { node: PartitionNode; x: number }[] = [];
  let cursor = 0;

  const place = (node: PartitionNode): number => {
    if (!node.split) {
      const x = cursor;
      cursor += 1;
      leaves.push({ node, x });
      return x;
    }
    const left = place(node.split.left);
    const right = place(node.split.right);
    return (left + right) / 2;
  };
  place(model.root);

  const maxDepth = Math.max(1, ...collectDepth(model.root));
  const nodes: TreeLayoutNode[] = [];
  const links: TreeLayout['links'] = [];

  const emit = (node: PartitionNode): { x: number; y: number } => {
    const children = node.split ? [node.split.left, node.split.right] : [];
    const positions = children.map(emit);
    const x = children.length > 0 ? (positions[0].x + positions[1].x) / 2 : leaves.find(leaf => leaf.node === node)?.x ?? 0;
    const y = node.depth / maxDepth;
    const label = node.split
      ? `${variableNames[node.split.variable] ?? `X${node.split.variable + 1}`} < ${node.split.threshold.toFixed(2)}`
      : `Media ${node.prediction.toFixed(2)}`;
    nodes.push({
      x: cursor > 1 ? x / (cursor - 1) : 0.5,
      y,
      label,
      value: node.prediction,
      n: node.indices.length,
      depth: node.depth,
      terminal: !node.split,
    });
    positions.forEach(position => {
      links.push({
        x1: cursor > 1 ? position.x / (cursor - 1) : 0.5,
        y1: position.y,
        x2: cursor > 1 ? position.x / (cursor - 1) : 0.5,
        y2: y,
      });
      links.push({
        x1: cursor > 1 ? position.x / (cursor - 1) : 0.5,
        y1: y,
        x2: cursor > 1 ? x / (cursor - 1) : 0.5,
        y2: y,
      });
    });
    return { x, y };
  };
  emit(model.root);

  return { nodes, links };
};

const collectDepth = (node: PartitionNode): number[] =>
  node.split ? [node.depth, ...collectDepth(node.split.left), ...collectDepth(node.split.right)] : [node.depth];
