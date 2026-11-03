import { mulberry32 } from './distributions';

/** A least-squares regression tree with a compact node representation. */
export interface TreeNode {
  prediction: number;
  n: number;
  sse: number;
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

export interface TreeOptions {
  minNode: number;
  maxDepth: number;
  /** Predictors tried at each split; the full set when omitted. */
  features?: number[];
  /** Number of predictors sampled at each split (random forest). */
  featureCount?: number;
  rng?: () => number;
}

const sseOf = (values: readonly number[]): number => {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
};

const bestSplit = (
  x: readonly number[][],
  y: readonly number[],
  indices: readonly number[],
  features: readonly number[]
): { feature: number; threshold: number; gain: number } | null => {
  const total = sseOf(indices.map(index => y[index]));
  let best: { feature: number; threshold: number; gain: number } | null = null;
  for (const feature of features) {
    const sorted = [...indices].sort((a, b) => x[a][feature] - x[b][feature]);
    let leftSum = 0;
    let leftSq = 0;
    let rightSum = 0;
    let rightSq = 0;
    for (const index of sorted) {
      rightSum += y[index];
      rightSq += y[index] ** 2;
    }
    for (let position = 1; position < sorted.length; position += 1) {
      const previous = sorted[position - 1];
      const current = sorted[position];
      const value = y[previous];
      leftSum += value;
      leftSq += value ** 2;
      rightSum -= value;
      rightSq -= value ** 2;
      if (x[previous][feature] === x[current][feature]) continue;
      const leftN = position;
      const rightN = sorted.length - position;
      const leftSse = leftSq - (leftSum * leftSum) / leftN;
      const rightSse = rightSq - (rightSum * rightSum) / rightN;
      const gain = total - leftSse - rightSse;
      if (gain > 1e-12 && (!best || gain > best.gain)) {
        best = {
          feature,
          threshold: (x[previous][feature] + x[current][feature]) / 2,
          gain,
        };
      }
    }
  }
  return best;
};

export const buildTree = (
  x: readonly number[][],
  y: readonly number[],
  indices: readonly number[],
  options: TreeOptions,
  depth = 0
): TreeNode => {
  const values = indices.map(index => y[index]);
  const prediction = values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
  const node: TreeNode = { prediction, n: indices.length, sse: sseOf(values) };
  if (indices.length < 2 * options.minNode || depth >= options.maxDepth) return node;

  let features = options.features ?? x[0]?.map((_, index) => index) ?? [];
  if (options.rng && options.features && options.features.length > 1) {
    features = [...options.features];
    for (let i = features.length - 1; i > 0; i -= 1) {
      const j = Math.floor(options.rng() * (i + 1));
      [features[i], features[j]] = [features[j], features[i]];
    }
    if (options.featureCount) features = features.slice(0, options.featureCount);
  }
  const split = bestSplit(x, y, indices, features);
  if (!split) return node;

  const leftIndices: number[] = [];
  const rightIndices: number[] = [];
  for (const index of indices) {
    if (x[index][split.feature] <= split.threshold) leftIndices.push(index);
    else rightIndices.push(index);
  }
  if (leftIndices.length === 0 || rightIndices.length === 0) return node;

  node.feature = split.feature;
  node.threshold = split.threshold;
  node.left = buildTree(x, y, leftIndices, options, depth + 1);
  node.right = buildTree(x, y, rightIndices, options, depth + 1);
  return node;
};

export const predictTree = (tree: TreeNode, row: readonly number[]): number => {
  let node = tree;
  while (node.feature !== undefined && node.left && node.right) {
    node = row[node.feature] <= (node.threshold ?? 0) ? node.left : node.right;
  }
  return node.prediction;
};

export interface EnsembleFit {
  predictions: number[];
  oobPredictions: number[];
  importance: number[];
  trees: number;
}

export const randomForest = (
  x: readonly number[][],
  y: readonly number[],
  options: {
    trees: number;
    minNode: number;
    mtry: number;
    maxDepth?: number;
    seed: number;
  }
): EnsembleFit => {
  const rng = mulberry32(options.seed);
  const n = y.length;
  const p = x[0]?.length ?? 0;
  const mtry = Math.max(1, Math.min(p, options.mtry > 0 ? options.mtry : Math.round(Math.sqrt(p))));
  const maxDepth = options.maxDepth ?? 14;
  const sums = Array(n).fill(0);
  const counts = Array(n).fill(0);
  const totals = Array(n).fill(0);
  const importance = Array(p).fill(0);
  for (let tree = 0; tree < options.trees; tree += 1) {
    const bootstrap = Array.from({ length: n }, () => Math.floor(rng() * n));
    const inBag = new Set(bootstrap);
    const features = Array.from({ length: p }, (_, index) => index);
    const model = buildTree(x, y, bootstrap, {
      minNode: options.minNode,
      maxDepth,
      features,
      featureCount: mtry,
      rng,
    });
    const local = Array(p).fill(0);
    const collectRandom = (node: TreeNode, parentSse?: number): void => {
      if (node.feature === undefined || !node.left || !node.right) return;
      local[node.feature] += Math.max(0, (parentSse ?? node.sse) - node.left.sse - node.right.sse);
      collectRandom(node.left, node.left.sse);
      collectRandom(node.right, node.right.sse);
    };
    collectRandom(model);
    local.forEach((value, index) => {
      importance[index] += value / Math.max(1, options.trees);
    });
    for (let row = 0; row < n; row += 1) {
      const prediction = predictTree(model, x[row]);
      totals[row] += prediction;
      if (!inBag.has(row)) {
        sums[row] += prediction;
        counts[row] += 1;
      }
    }
  }
  const predictions = totals.map((sum, index) => sum / Math.max(1, options.trees));
  const oobPredictions = sums.map((sum, index) =>
    counts[index] > 0 ? sum / counts[index] : y[index]
  );
  return { predictions, oobPredictions, importance, trees: options.trees };
};

export const gradientBoosting = (
  x: readonly number[][],
  y: readonly number[],
  options: {
    trees: number;
    minNode: number;
    shrinkage: number;
    maxDepth?: number;
    seed: number;
  }
): EnsembleFit => {
  const rng = mulberry32(options.seed);
  const n = y.length;
  const p = x[0]?.length ?? 0;
  const mean = y.reduce((sum, value) => sum + value, 0) / Math.max(1, n);
  const predictions = Array(n).fill(mean);
  const importance = Array(p).fill(0);
  for (let iteration = 0; iteration < options.trees; iteration += 1) {
    const residuals = y.map((value, index) => value - predictions[index]);
    const tree = buildTree(
      x,
      residuals,
      Array.from({ length: n }, (_, index) => index),
      {
        minNode: options.minNode,
        maxDepth: options.maxDepth ?? 2,
        features: Array.from({ length: p }, (_, index) => index),
        rng,
      }
    );
    const local = Array(p).fill(0);
    const collect = (node: TreeNode, parentSse?: number): void => {
      if (node.feature === undefined || !node.left || !node.right) return;
      local[node.feature] += Math.max(0, (parentSse ?? node.sse) - node.left.sse - node.right.sse);
      collect(node.left, node.left.sse);
      collect(node.right, node.right.sse);
    };
    collect(tree);
    local.forEach((value, index) => {
      importance[index] += value;
    });
    for (let row = 0; row < n; row += 1) {
      predictions[row] += options.shrinkage * predictTree(tree, x[row]);
    }
  }
  return { predictions, oobPredictions: [], importance, trees: options.trees };
};
