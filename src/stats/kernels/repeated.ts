import { jStat } from '../jstat';
import { chi2SF } from '../distributions';
import type {
  CochranResult, FriedmanResult, JonckheereResult, McNemarResult, NemenyiPair, NemenyiResult,
} from '../repeated/types';

const normalCdf = (z: number): number => jStat.normal.cdf(z, 0, 1);

const alphaOf = (level: number): number => 1 - level / 100;

const twoSidedNormalP = (z: number): number => 2 * normalCdf(-Math.abs(z));

const binomialTwoSided = (x: number, n: number): number => {
  if (n <= 0) return NaN;
  const lower = jStat.binomial.cdf(Math.min(x, n - x), n, 0.5);
  return Math.min(1, 2 * lower);
};

/**
 * CDF of the studentized range for infinite df (the reference distribution of
 * the Nemenyi test): P(Q ≤ q) = k ∫ φ(z)[Φ(z) − Φ(z−q)]^(k−1) dz.
 * Simpson integration is enough for the 2–10 treatments used here and lets us
 * compute exact critical values instead of hard-coding a table.
 */
export const studentizedRangeCdf = (q: number, k: number): number => {
  if (!(q > 0) || k < 2) return q > 0 ? 1 : 0;
  const phi = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const integrand = (z: number) => {
    const width = Math.max(0, normalCdf(z) - normalCdf(z - q));
    return phi(z) * Math.pow(width, k - 1);
  };
  const a = -12;
  const b = 12 + q;
  const steps = 3000;
  const h = (b - a) / steps;
  let sum = integrand(a) + integrand(b);
  for (let i = 1; i < steps; i += 1) {
    sum += (i % 2 === 1 ? 4 : 2) * integrand(a + i * h);
  }
  return Math.min(1, Math.max(0, (k * sum * h) / 3));
};

/** Quantile of the studentized range (infinite df) by bisection. */
export const studentizedRangeQuantile = (level: number, k: number): number => {
  const target = Math.min(0.999999, Math.max(0.5, level / 100));
  let lo = 0;
  let hi = 25;
  for (let i = 0; i < 70; i += 1) {
    const mid = (lo + hi) / 2;
    if (studentizedRangeCdf(mid, k) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

const rankWithTies = (values: number[]): number[] => {
  const order = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const ranks = new Array<number>(values.length).fill(0);
  let i = 0;
  while (i < order.length) {
    let j = i;
    while (j + 1 < order.length && order[j + 1].value === order[i].value) j += 1;
    const rank = (i + j + 2) / 2;
    for (let k = i; k <= j; k += 1) ranks[order[k].index] = rank;
    i = j + 1;
  }
  return ranks;
};


export const friedmanTest = (blocks: number[][]): FriedmanResult | null => {
  if (blocks.length < 2) return null;
  const k = blocks[0].length;
  if (k < 3 || blocks.some((block) => block.length !== k)) return null;
  if (blocks.some((block) => block.some((value) => !Number.isFinite(value)))) return null;

  const n = blocks.length;
  const rankSums = new Array<number>(k).fill(0);
  let tieSum = 0;
  blocks.forEach((block) => {
    const ranks = rankWithTies(block);
    ranks.forEach((rank, index) => {
      rankSums[index] += rank;
    });
    const counts = new Map<number, number>();
    block.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
    counts.forEach((count) => {
      if (count > 1) tieSum += count * count * count - count;
    });
  });

  const raw = (12 / (n * k * (k + 1))) * rankSums.reduce((sum, value) => sum + value * value, 0) - 3 * n * (k + 1);
  const correction = 1 - tieSum / (n * (k * k * k - k));
  if (!(correction > 0)) return null;
  const chi2 = raw / correction;
  const df = k - 1;
  return {
    n,
    k,
    chi2,
    df,
    p: chi2SF(chi2, df),
    w: chi2 / (n * df),
    rankSums,
    meanRanks: rankSums.map((sum) => sum / n),
    tieCorrection: correction,
  };
};


export const nemenyiPosthoc = (test: FriedmanResult, level: number): NemenyiResult => {
  const se = Math.sqrt((test.k * (test.k + 1)) / (6 * test.n));
  const qCritical = studentizedRangeQuantile(level, test.k) / Math.SQRT2;
  const criticalDifference = qCritical * se;
  const pairs: NemenyiPair[] = [];
  for (let i = 0; i < test.k; i += 1) {
    for (let j = i + 1; j < test.k; j += 1) {
      const diff = Math.abs(test.meanRanks[i] - test.meanRanks[j]);
      const q = diff / se;
      const p = 1 - studentizedRangeCdf(q * Math.SQRT2, test.k);
      pairs.push({ a: i, b: j, diff, q, p, significant: p < alphaOf(level) });
    }
  }
  return { se, qCritical, criticalDifference, pairs };
};

export const mcnemarTest = (pairs: [number, number][]): McNemarResult | null => {
  if (pairs.length < 2) return null;
  if (pairs.some(([x, y]) => ![0, 1].includes(x) || ![0, 1].includes(y))) return null;
  let a = 0;
  let b = 0;
  let c = 0;
  let d = 0;
  pairs.forEach(([x, y]) => {
    if (x === 1 && y === 1) a += 1;
    else if (x === 1 && y === 0) b += 1;
    else if (x === 0 && y === 1) c += 1;
    else d += 1;
  });
  const discordant = b + c;
  const chi2Yates = discordant > 0 ? Math.pow(Math.abs(b - c) - 1, 2) / discordant : NaN;
  return {
    a,
    b,
    c,
    d,
    n: pairs.length,
    exactP: binomialTwoSided(Math.min(b, c), discordant),
    chi2Yates,
    pYates: chi2SF(chi2Yates, 1),
    oddsRatio: c > 0 ? b / c : b > 0 ? Infinity : NaN,
  };
};


export const cochranQ = (blocks: number[][]): CochranResult | null => {
  if (blocks.length < 2) return null;
  const k = blocks[0].length;
  if (k < 3 || blocks.some((block) => block.length !== k)) return null;
  if (blocks.some((block) => block.some((value) => value !== 0 && value !== 1))) return null;

  const n = blocks.length;
  const totals = blocks.map((block) => block.reduce((sum, value) => sum + value, 0));
  const successes = new Array<number>(k).fill(0);
  blocks.forEach((block) => {
    block.forEach((value, index) => {
      successes[index] += value;
    });
  });
  const grand = successes.reduce((sum, value) => sum + value, 0);
  const denominator = k * totals.reduce((sum, value) => sum + value, 0) - totals.reduce((sum, value) => sum + value * value, 0);
  if (!(denominator > 0)) return null;
  const numerator = (k - 1) * (k * successes.reduce((sum, value) => sum + value * value, 0) - grand * grand);
  const q = numerator / denominator;
  return {
    n,
    k,
    q,
    df: k - 1,
    p: chi2SF(q, k - 1),
    successes,
    totals,
  };
};


export const jonckheereTerpstra = (groups: number[][]): JonckheereResult | null => {
  const k = groups.length;
  if (k < 2) return null;
  const clean = groups.map((group) => group.filter((value) => Number.isFinite(value)));
  if (clean.some((group) => group.length === 0)) return null;
  const n = clean.reduce((sum, group) => sum + group.length, 0);
  if (n < 3) return null;

  let u = 0;
  for (let i = 0; i < k; i += 1) {
    for (let j = i + 1; j < k; j += 1) {
      clean[i].forEach((a) => {
        clean[j].forEach((b) => {
          if (a < b) u += 1;
          else if (a === b) u += 0.5;
        });
      });
    }
  }

  const sumsq = clean.reduce((sum, group) => sum + group.length * group.length, 0);
  const expected = (n * n - sumsq) / 4;
  const variance = (n * n * (2 * n + 3) - clean.reduce((sum, group) => sum + group.length * group.length * (2 * group.length + 3), 0)) / 72;
  if (!(variance > 0)) return null;
  const z = (u - expected) / Math.sqrt(variance);
  return {
    n,
    k,
    groupSizes: clean.map((group) => group.length),
    u,
    expected,
    variance,
    z,
    p: twoSidedNormalP(z),
    effect: z / Math.sqrt(n),
  };
};

