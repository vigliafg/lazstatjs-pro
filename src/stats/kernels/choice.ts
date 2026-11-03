import { jStat } from '../jstat';

export interface ChoiceRow {
  set: string;
  alternative: string;
  attributes: number[];
  chosen: boolean;
}

export interface ChoiceCoefficient {
  term: string;
  estimate: number;
  se: number;
  z: number;
  p: number;
}

export interface ChoiceShare {
  alternative: string;
  observed: number;
  predicted: number;
}

export interface ChoiceResult {
  mode: 'choice' | 'maxdiff';
  sets: number;
  rows: number;
  coefficients: ChoiceCoefficient[];
  logLik: number;
  nullLogLik: number;
  r2: number;
  aic: number;
  bic: number;
  shares: ChoiceShare[];
  maxdiff: MaxDiffItem[];
  iterations: number;
}

export interface MaxDiffItem {
  item: string;
  best: number;
  worst: number;
  score: number;
  share: number;
  se: number;
  utility: number;
}

interface Design {
  sets: { rows: number[]; chosen: number }[];
  x: number[][];
  labels: string[];
}

export const conditionalLogit = (
  input: readonly ChoiceRow[],
  variableNames: readonly string[],
  maxIterations = 60
): {
  coefficients: ChoiceCoefficient[];
  logLik: number;
  nullLogLik: number;
  shares: ChoiceShare[];
  iterations: number;
} | null => {
  const grouped = new Map<string, number[]>();
  input.forEach((row, index) => {
    const group = grouped.get(row.set) ?? [];
    group.push(index);
    grouped.set(row.set, group);
  });
  const design: Design = { sets: [], x: input.map(row => row.attributes), labels: [] };
  for (const [set, indices] of grouped) {
    const chosen = indices.find(index => input[index].chosen);
    // A choice set without a selected alternative carries no information.
    if (chosen === undefined) continue;
    design.sets.push({ rows: indices, chosen });
    design.labels.push(set);
  }
  if (design.sets.length < 2) return null;
  const p = variableNames.length;
  if (p === 0) return null;

  const probabilities = (beta: readonly number[]): Map<number, number> => {
    const result = new Map<number, number>();
    for (const set of design.sets) {
      const utilities = set.rows.map(index => {
        const x = design.x[index];
        return x.reduce((sum, value, column) => sum + value * beta[column], 0);
      });
      const max = Math.max(...utilities);
      const weights = utilities.map(value => Math.exp(value - max));
      const total = weights.reduce((sum, value) => sum + value, 0) || 1;
      set.rows.forEach((index, position) => result.set(index, weights[position] / total));
    }
    return result;
  };

  const logLikelihood = (beta: readonly number[]): number => {
    const probs = probabilities(beta);
    return design.sets.reduce((sum, set) => {
      const value = probs.get(set.chosen) ?? 0;
      return sum + Math.log(Math.max(1e-12, value));
    }, 0);
  };

  let beta = Array(p).fill(0);
  let iterations = 0;
  for (; iterations < maxIterations; iterations += 1) {
    const gradient = Array(p).fill(0);
    const hessian = Array.from({ length: p }, () => Array(p).fill(0));
    const probs = probabilities(beta);
    for (const set of design.sets) {
      const mean = Array(p).fill(0);
      for (const index of set.rows) {
        const weight = probs.get(index) ?? 0;
        for (let a = 0; a < p; a += 1) mean[a] += weight * design.x[index][a];
      }
      for (let a = 0; a < p; a += 1) {
        gradient[a] += design.x[set.chosen][a] - mean[a];
        for (let b = 0; b < p; b += 1) {
          let second = 0;
          for (const index of set.rows) {
            const weight = probs.get(index) ?? 0;
            second += weight * design.x[index][a] * design.x[index][b];
          }
          hessian[a][b] -= second - mean[a] * mean[b];
        }
      }
    }
    const norm = Math.sqrt(gradient.reduce((sum, value) => sum + value ** 2, 0));
    if (norm < 1e-9) break;
    // A small ridge keeps the Newton step finite with collinear attributes.
    const ridge = 1e-8;
    const regularised = hessian.map((row, i) => row.map((value, j) => value - (i === j ? ridge : 0)));
    const inverse = jStat.inv(regularised) as number[][];
    if (!inverse || inverse.some(row => row.some(value => !Number.isFinite(value)))) break;
    const step = inverse.map(row => row.reduce((sum, value, index) => sum + value * gradient[index], 0));
    const stepNorm = Math.sqrt(step.reduce((sum, value) => sum + value ** 2, 0));
    const scale = stepNorm > 1 ? 1 / stepNorm : 1;
    // hessian is negative definite: the Newton update subtracts H^{-1} g.
    beta = beta.map((value, index) => value - scale * step[index]);
  }

  const probs = probabilities(beta);
  const logLik = logLikelihood(beta);
  const nullLogLik = design.sets.reduce(
    (sum, set) => sum + Math.log(1 / set.rows.length),
    0
  );
  const gradient = Array(p).fill(0);
  const hessian = Array.from({ length: p }, () => Array(p).fill(0));
  for (const set of design.sets) {
    const mean = Array(p).fill(0);
    for (const index of set.rows) {
      const weight = probs.get(index) ?? 0;
      for (let a = 0; a < p; a += 1) mean[a] += weight * design.x[index][a];
    }
    for (let a = 0; a < p; a += 1) {
      gradient[a] += design.x[set.chosen][a] - mean[a];
      for (let b = 0; b < p; b += 1) {
        let second = 0;
        for (const index of set.rows) {
          const weight = probs.get(index) ?? 0;
          second += weight * design.x[index][a] * design.x[index][b];
        }
        hessian[a][b] -= second - mean[a] * mean[b];
      }
    }
  }
  void gradient;
  const inverse = jStat.inv(hessian.map((row, i) => row.map((value, j) => -value + (i === j ? 1e-8 : 0)))) as number[][];
  const coefficients = beta.map((estimate, index) => {
    const se = inverse ? Math.sqrt(Math.max(0, inverse[index][index])) : NaN;
    const z = se > 0 ? estimate / se : NaN;
    return {
      term: variableNames[index],
      estimate,
      se,
      z,
      p: Number.isFinite(z) ? 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1)) : NaN,
    };
  });

  const observed = new Map<string, number>();
  design.x.forEach((_, index) =>
    observed.set(input[index].alternative, (observed.get(input[index].alternative) ?? 0) + (input[index].chosen ? 1 : 0))
  );
  const predicted = new Map<string, number>();
  for (const set of design.sets) {
    for (const index of set.rows) {
      predicted.set(
        input[index].alternative,
        (predicted.get(input[index].alternative) ?? 0) + (probs.get(index) ?? 0)
      );
    }
  }
  const shares: ChoiceShare[] = [...observed.keys()].map(alternative => ({
    alternative,
    observed: (observed.get(alternative) ?? 0) / design.sets.length,
    predicted: (predicted.get(alternative) ?? 0) / design.sets.length,
  }));

  return {
    coefficients,
    logLik,
    nullLogLik,
    shares,
    iterations,
  };
};

export const maxDiff = (
  rows: readonly { block: string; item: string; best: boolean; worst: boolean }[]
): { items: MaxDiffItem[]; blocks: number } | null => {
  const blocks = new Map<string, { best: string; worst: string }>();
  for (const row of rows) {
    const block = blocks.get(row.block) ?? { best: '', worst: '' };
    if (row.best) block.best = row.item;
    if (row.worst) block.worst = row.item;
    blocks.set(row.block, block);
  }
  const valid = [...blocks.values()].filter(block => block.best && block.worst && block.best !== block.worst);
  if (valid.length < 2) return null;
  const bestCounts = new Map<string, number>();
  const worstCounts = new Map<string, number>();
  const items = new Set<string>();
  valid.forEach(block => {
    items.add(block.best);
    items.add(block.worst);
    bestCounts.set(block.best, (bestCounts.get(block.best) ?? 0) + 1);
    worstCounts.set(block.worst, (worstCounts.get(block.worst) ?? 0) + 1);
  });
  const result: MaxDiffItem[] = [...items].map(item => {
    const best = bestCounts.get(item) ?? 0;
    const worst = worstCounts.get(item) ?? 0;
    const share = (best + 0.5) / (best + worst + 1);
    return {
      item,
      best,
      worst,
      score: best - worst,
      share,
      se: Math.sqrt((share * (1 - share)) / Math.max(1, best + worst)),
      utility: Math.log((best + 0.5) / (worst + 0.5)),
    };
  });
  result.sort((a, b) => b.score - a.score || b.share - a.share);
  return { items: result, blocks: valid.length };
};

export const choiceAnalysis = (
  rows: readonly ChoiceRow[],
  options: {
    mode: 'choice' | 'maxdiff';
    variableNames: string[];
    maxdiff?: { block: string; item: string; best: boolean; worst: boolean }[];
  }
): ChoiceResult | null => {
  if (options.mode === 'maxdiff') {
    const result = maxDiff(options.maxdiff ?? []);
    if (!result) return null;
    const shares: ChoiceShare[] = result.items.map(item => ({
      alternative: item.item,
      observed: item.share,
      predicted: item.share,
    }));
    return {
      mode: 'maxdiff',
      sets: result.blocks,
      rows: options.maxdiff?.length ?? 0,
      coefficients: [],
      logLik: NaN,
      nullLogLik: NaN,
      r2: NaN,
      aic: NaN,
      bic: NaN,
      shares,
      maxdiff: result.items,
      iterations: 0,
    };
  }
  const fit = conditionalLogit(rows, options.variableNames);
  if (!fit) return null;
  const parameters = fit.coefficients.length;
  return {
    mode: 'choice',
    sets: new Set(rows.map(row => row.set)).size,
    rows: rows.length,
    coefficients: fit.coefficients,
    logLik: fit.logLik,
    nullLogLik: fit.nullLogLik,
    r2: 1 - fit.logLik / fit.nullLogLik,
    aic: 2 * parameters - 2 * fit.logLik,
    bic: parameters * Math.log(Math.max(1, rows.length)) - 2 * fit.logLik,
    shares: fit.shares,
    maxdiff: [],
    iterations: fit.iterations,
  };
};
