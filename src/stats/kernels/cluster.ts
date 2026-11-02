/**
 * Agglomerative hierarchical clustering with four classic linkages.
 *
 * The kernel works on a capped sample of complete rows (the runner caps it) and
 * returns the merge sequence, the dendrogram layout, the cut into k clusters and
 * the standardised cluster profiles. It never draws: the chart is a projection
 * of the merge tree produced here.
 */

import type {
  ClusterMerge,
  ClusterMethod,
  ClusterResult,
} from '../analysisResults';

export type {
  ClusterMerge,
  ClusterMethod,
  ClusterResult,
} from '../analysisResults';

export interface ClusterInput {
  data: number[][];
  method: ClusterMethod;
  /** 0 keeps the full tree; otherwise the tree is cut into this many groups. */
  clusters: number;
  standardize: boolean;
  variableNames: string[];
}

const mean = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);

const distance = (a: number[], b: number[]): number =>
  Math.sqrt(a.reduce((sum, value, index) => sum + Math.pow(value - (b[index] ?? 0), 2), 0));

const standardizeData = (data: number[][]): number[][] | null => {
  const width = data[0]?.length ?? 0;
  const means = Array.from({ length: width }, (_, column) =>
    mean(data.map(row => row[column] ?? 0))
  );
  const sds = Array.from({ length: width }, (_, column) => {
    const variance =
      data.reduce((sum, row) => sum + Math.pow((row[column] ?? 0) - means[column], 2), 0) /
      Math.max(1, data.length - 1);
    return Math.sqrt(variance);
  });
  if (sds.some(sd => !(sd > 0))) return null;
  return data.map(row => row.map((value, column) => (value - means[column]) / sds[column]));
};

const linkage = (
  a: { data: number[]; original: number }[],
  b: { data: number[]; original: number }[],
  method: ClusterMethod
): number => {
  if (method === 'single') {
    let best = Infinity;
    a.forEach(i => b.forEach(j => (best = Math.min(best, distance(i.data, j.data)))));
    return best;
  }
  if (method === 'complete') {
    let worst = 0;
    a.forEach(i => b.forEach(j => (worst = Math.max(worst, distance(i.data, j.data)))));
    return worst;
  }
  if (method === 'ward') {
    const meanA = a[0].data.map((_, column) => mean(a.map(item => item.data[column])));
    const meanB = b[0].data.map((_, column) => mean(b.map(item => item.data[column])));
    const factor = (2 * a.length * b.length) / (a.length + b.length);
    return Math.sqrt(factor * Math.pow(distance(meanA, meanB), 2));
  }
  let sum = 0;
  let count = 0;
  a.forEach(i => b.forEach(j => {
    sum += distance(i.data, j.data);
    count += 1;
  }));
  return count > 0 ? sum / count : 0;
};

interface WorkingCluster {
  id: number;
  members: { data: number[]; original: number }[];
}

const buildLayout = (
  merges: ClusterMerge[],
  n: number,
  labels: string[]
): { leafOrder: number[]; links: { x1: number; y1: number; x2: number; y2: number }[]; leaves: { x: number; label: string }[] } => {
  const children = new Map<number, [number, number]>();
  merges.forEach(merge => children.set(merge.id, [merge.left, merge.right]));
  const heightOf = new Map<number, number>();
  merges.forEach(merge => heightOf.set(merge.id, merge.height));
  const maxHeight = Math.max(1e-9, ...merges.map(merge => merge.height));
  const order: number[] = [];
  const position = new Map<number, number>();

  const visit = (id: number): number => {
    if (id < n) {
      const x = order.length;
      order.push(id);
      position.set(id, x);
      return x;
    }
    const pair = children.get(id);
    if (!pair) return 0;
    const left = visit(pair[0]);
    const right = visit(pair[1]);
    const x = (left + right) / 2;
    position.set(id, x);
    return x;
  };
  const root = merges.length > 0 ? merges[merges.length - 1].id : 0;
  visit(root);

  const width = Math.max(1, order.length - 1);
  const links: { x1: number; y1: number; x2: number; y2: number }[] = [];
  merges.forEach(merge => {
    const parentX = (position.get(merge.id) ?? 0) / width;
    const parentY = merge.height / maxHeight;
    [merge.left, merge.right].forEach(child => {
      const childX = (position.get(child) ?? 0) / width;
      const childY = child < n ? 0 : (heightOf.get(child) ?? 0) / maxHeight;
      links.push({
        x1: childX,
        y1: childY,
        x2: childX,
        y2: parentY,
      });
      links.push({ x1: childX, y1: parentY, x2: parentX, y2: parentY });
    });
  });
  const leaves = order.map(id => ({
    x: (position.get(id) ?? 0) / width,
    label: labels[id] ?? `Riga ${id + 1}`,
  }));
  return { leafOrder: order, links, leaves };
};

/** Agglomerate, cut and profile. */
export const hierarchicalClusters = (input: ClusterInput): ClusterResult | null => {
  const { variableNames } = input;
  const n = input.data.length;
  const width = variableNames.length;
  if (n < 3 || width < 1 || input.data.some(row => row.length !== width)) return null;
  const working = input.standardize ? standardizeData(input.data) : input.data;
  if (!working) return null;

  let clusters: WorkingCluster[] = working.map((row, index) => ({
    id: index,
    members: [{ data: row, original: index }],
  }));
  const merges: ClusterMerge[] = [];
  let nextId = n;

  while (clusters.length > 1) {
    let bestI = 0;
    let bestJ = 1;
    let best = Infinity;
    for (let i = 0; i < clusters.length; i += 1) {
      for (let j = i + 1; j < clusters.length; j += 1) {
        const value = linkage(clusters[i].members, clusters[j].members, input.method);
        if (value < best) {
          best = value;
          bestI = i;
          bestJ = j;
        }
      }
    }
    const left = clusters[bestI];
    const right = clusters[bestJ];
    const merged: WorkingCluster = {
      id: nextId,
      members: [...left.members, ...right.members],
    };
    merges.push({
      id: nextId,
      left: left.id,
      right: right.id,
      height: best,
      size: merged.members.length,
    });
    nextId += 1;
    clusters = clusters.filter((_, index) => index !== bestI && index !== bestJ);
    clusters.push(merged);
  }

  const k = input.clusters > 0 ? Math.max(1, Math.min(n, input.clusters)) : 0;
  const assignment = new Array<number>(n).fill(0);
  if (k > 0) {
    const parent = Array.from({ length: 2 * n }, (_, index) => index);
    const find = (value: number): number => {
      let node = value;
      while (parent[node] !== node) node = parent[node];
      while (parent[value] !== node) {
        const next = parent[value];
        parent[value] = node;
        value = next;
      }
      return node;
    };
    const union = (a: number, b: number) => {
      const rootA = find(a);
      const rootB = find(b);
      if (rootA !== rootB) parent[rootA] = rootB;
    };
    merges.slice(0, Math.max(0, n - k)).forEach(merge => {
      union(merge.id, merge.left);
      union(merge.id, merge.right);
    });
    const roots = new Map<number, number>();
    for (let index = 0; index < n; index += 1) {
      const root = find(index);
      if (!roots.has(root)) roots.set(root, roots.size);
      assignment[index] = roots.get(root) ?? 0;
    }
  }

  const centers: number[][] = [];
  const profiles: number[][] = [];
  const clusterCount = k > 0 ? Math.max(...assignment) + 1 : 0;
  for (let cluster = 0; cluster < clusterCount; cluster += 1) {
    const rows = working.filter((_, index) => assignment[index] === cluster);
    const raw = input.data.filter((_, index) => assignment[index] === cluster);
    centers.push(Array.from({ length: width }, (_, column) => mean(raw.map(row => row[column]))));
    profiles.push(Array.from({ length: width }, (_, column) => mean(rows.map(row => row[column]))));
  }

  const layout = buildLayout(merges, n, input.data.map((_, index) => `Riga ${index + 1}`));

  return {
    merges,
    assignment,
    k,
    centers,
    profiles,
    variableNames,
    leafOrder: layout.leafOrder,
    heights: merges.map(merge => merge.height),
    labels: layout.leaves.map(leaf => leaf.label),
    links: layout.links,
    leaves: layout.leaves,
  };
};

export { buildLayout as clusterLayout };
