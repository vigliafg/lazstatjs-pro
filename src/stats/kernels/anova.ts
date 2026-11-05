import { jStat } from '../jstat';
import { parseNum } from '../core';
import { calcKruskalWallis } from './index';
import { benjaminiHochberg } from './multiple';
import {
  bonferroniAdjust,
  chi2SF,
  dunnTest,
  fSF,
  holmAdjust,
  leveneTest,
  meanCI,
  tCrit,
  twoSidedTP,
  welchAnova,
} from '../distributions';
import type { DunnResult } from '../distributions';

export type PostHocMethod = 'none' | 'tukey' | 'bonferroni' | 'holm' | 'fdr' | 'gameshowell' | 'steeldwass';

export interface AnovaStatsOptions {
  rows: readonly (readonly string[])[];
  depIdx: number;
  grpIdx: number;
  posthoc: PostHocMethod;
  kwPosthoc: 'none' | 'bonferroni' | 'holm' | 'fdr';
  level: number;
  useNonParam: boolean;
}

export interface AnovaGroupStats {
  group: string;
  n: number;
  mean: number;
  sd: number;
  se: number;
  median: number;
  min: number;
  max: number;
  ciLo: number;
  ciHi: number;
}

export interface AnovaTestStats {
  nTotal: number;
  k: number;
  ssBetween: number;
  ssWithin: number;
  ssTotal: number;
  dfBetween: number;
  dfWithin: number;
  msBetween: number;
  msWithin: number;
  f: number;
  p: number;
}

export interface AnovaEffectSizes {
  eta2: number;
  omega2: number;
  epsilon2: number;
  cohenF: number;
}

export type AnovaAssumptionKind =
  | 'levene'
  | 'brownForsythe'
  | 'bartlett'
  | 'obrien'
  | 'sdRatio'
  | 'welch'
  | 'jarqueBera';

export interface AnovaAssumption {
  kind: AnovaAssumptionKind;
  group: string | null;
  n: number;
  statistic: number;
  df1: number;
  df2: number;
  p: number;
}

export interface AnovaPostHocPair {
  a: string;
  b: string;
  diff: number;
  se: number;
  df: number;
  t: number;
  pRaw: number;
  pAdj: number;
  ciLo: number;
  ciHi: number;
  d: number;
}

export interface AnovaKruskalStats {
  hStat: number;
  df: number;
  pValue: number;
  etaH: number;
  groupNs: { [key: string]: number };
  groupRankSums: { [key: string]: number };
  groupMeanRanks: { [key: string]: number };
}

export interface AnovaStats {
  keys: string[];
  groups: { [key: string]: number[] };
  groupStats: AnovaGroupStats[];
  test: AnovaTestStats;
  effects: AnovaEffectSizes;
  assumptions: AnovaAssumption[];
  leveneP: number;
  posthocPairs: AnovaPostHocPair[] | null;
  kruskal: AnovaKruskalStats | null;
  dunn: DunnResult[] | null;
}

const jbFor = (values: number[]) => {
  const n = values.length;
  if (n < 3) return { stat: NaN, p: NaN };
  const skew = jStat.skewness(values);
  const kurt = jStat.kurtosis(values);
  const stat = (n / 6) * (skew * skew + (kurt * kurt) / 4);
  return { stat, p: chi2SF(stat, 2) };
};

/** Bartlett: omogeneità delle varianze assumendo la normalità (log-varianze). */
const bartlettTest = (groups: number[][]): { stat: number; df: number; p: number } => {
  const k = groups.length;
  const ns = groups.map(values => values.length);
  const variances = groups.map(values => jStat.variance(values, true));
  const df = Math.max(0, k - 1);
  if (k < 2 || ns.some((n, index) => n < 2 || !(variances[index] > 0))) {
    return { stat: NaN, df, p: NaN };
  }
  const total = ns.reduce((sum, n) => sum + n, 0);
  const pooled = ns.reduce((sum, n, index) => sum + (n - 1) * variances[index], 0) / (total - k);
  const numerator =
    (total - k) * Math.log(pooled) -
    ns.reduce((sum, n, index) => sum + (n - 1) * Math.log(variances[index]), 0);
  const correction =
    1 + (ns.reduce((sum, n) => sum + 1 / (n - 1), 0) - 1 / (total - k)) / (3 * (k - 1));
  const stat = numerator / correction;
  return { stat, df, p: chi2SF(stat, df) };
};

/**
 * O'Brien (1979): ANOVA sulle devianze trasformate
 * r = ((n − 1.5)·n·(y − media)² − 0.5·s²·(n − 1)) / ((n − 1)·(n − 2)),
 * che è robusta alla non normalità rispetto a Bartlett.
 */
export const obrienTest = (groups: number[][]): { stat: number; df1: number; df2: number; p: number } => {
  const k = groups.length;
  const df1 = Math.max(0, k - 1);
  const transformed = groups.map(values => {
    const n = values.length;
    if (n < 3) return [];
    const centre = jStat.mean(values);
    const variance = jStat.variance(values, true);
    return values.map(value =>
      ((n - 1.5) * n * Math.pow(value - centre, 2) - 0.5 * variance * (n - 1)) / ((n - 1) * (n - 2))
    );
  });
  const total = transformed.reduce((sum, values) => sum + values.length, 0);
  const df2 = total - k;
  if (k < 2 || transformed.some(values => values.length < 3) || df2 <= 0) {
    return { stat: NaN, df1, df2: Math.max(0, df2), p: NaN };
  }
  const grand =
    transformed.reduce((sum, values) => sum + values.reduce((inner, value) => inner + value, 0), 0) / total;
  let between = 0;
  let within = 0;
  for (const values of transformed) {
    const centre = values.reduce((sum, value) => sum + value, 0) / values.length;
    between += values.length * Math.pow(centre - grand, 2);
    within += values.reduce((sum, value) => sum + Math.pow(value - centre, 2), 0);
  }
  if (!(within > 0)) return { stat: NaN, df1, df2, p: NaN };
  const stat = between / df1 / (within / df2);
  return { stat, df1, df2, p: fSF(stat, df1, df2) };
};

const midranks = (values: number[]): number[] => {
  const order = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const ranks = new Array<number>(values.length).fill(0);
  let start = 0;
  while (start < order.length) {
    let end = start;
    while (end + 1 < order.length && order[end + 1].value === order[start].value) end += 1;
    const rank = (start + end) / 2 + 1;
    for (let position = start; position <= end; position += 1) ranks[order[position].index] = rank;
    start = end + 1;
  }
  return ranks;
};

const normalCdf = (value: number): number => jStat.normal.cdf(value, 0, 1);

const standardNormalPdf = (value: number): number => Math.exp(-0.5 * value * value) / Math.sqrt(2 * Math.PI);

/**
 * Steel–Dwass: p del massimo dei |z| pairwise. Le statistiche dei confronti
 * sono correlate 1/2, quindi la sopravvivenza si integra sul fattore comune.
 */
const maxAbsP = (critical: number, comparisons: number): number => {
  if (!(critical > 0)) return 1;
  const rho = 0.5;
  const scale = Math.sqrt(1 - rho);
  const steps = 400;
  const lo = -10;
  const hi = 10;
  const step = (hi - lo) / steps;
  let acc = 0;
  for (let index = 0; index <= steps; index += 1) {
    const t = lo + index * step;
    const upper = (critical - Math.sqrt(rho) * t) / scale;
    const lower = (-critical - Math.sqrt(rho) * t) / scale;
    const inside = Math.pow(normalCdf(upper) - normalCdf(lower), comparisons);
    const weight = index === 0 || index === steps ? 1 : index % 2 === 1 ? 4 : 2;
    acc += weight * standardNormalPdf(t) * inside;
  }
  return Math.min(1, Math.max(0, 1 - (acc * step) / 3));
};

const steelDwassPairs = (
  keys: string[],
  groups: { [key: string]: number[] }
): AnovaPostHocPair[] => {
  const pairs: AnovaPostHocPair[] = [];
  const zScores: { pair: AnovaPostHocPair; z: number }[] = [];
  for (let i = 0; i < keys.length; i += 1) {
    for (let j = i + 1; j < keys.length; j += 1) {
      const a = groups[keys[i]];
      const b = groups[keys[j]];
      const pooled = [...a, ...b];
      const ranks = midranks(pooled);
      const rankSum = ranks.slice(0, a.length).reduce((sum, value) => sum + value, 0);
      const n = pooled.length;
      const expected = (a.length * (n + 1)) / 2;
      const squares = ranks.reduce((sum, value) => sum + value * value, 0);
      const variance = (a.length * b.length / (n * (n - 1))) * (squares - (n * Math.pow(n + 1, 2)) / 4);
      if (!(variance > 0)) continue;
      const z = (rankSum - expected) / Math.sqrt(variance);
      const pair: AnovaPostHocPair = {
        a: keys[i],
        b: keys[j],
        diff: jStat.mean(a) - jStat.mean(b),
        se: Math.sqrt(variance),
        df: n - 2,
        t: z,
        pRaw: Math.min(1, 2 * (1 - normalCdf(Math.abs(z)))),
        pAdj: NaN,
        ciLo: NaN,
        ciHi: NaN,
        d: NaN,
      };
      pairs.push(pair);
      zScores.push({ pair, z: Math.abs(z) });
    }
  }
  const comparisons = pairs.length;
  zScores.forEach(entry => {
    entry.pair.pAdj = comparisons > 0 ? maxAbsP(entry.z, comparisons) : entry.pair.pRaw;
  });
  return pairs;
};

/** Statistiche ANOVA a una via, post-hoc e Kruskal-Wallis. */
export const anovaStats = (options: AnovaStatsOptions): AnovaStats | null => {
  const { rows, depIdx, grpIdx, posthoc, kwPosthoc, level, useNonParam } = options;

  const groups: { [key: string]: number[] } = {};
  rows.forEach(row => {
    const value = parseNum(row[depIdx]);
    const group = row[grpIdx];
    if (!isNaN(value) && group !== '' && group !== undefined) {
      if (!groups[group]) groups[group] = [];
      groups[group].push(value);
    }
  });

  const keys = Object.keys(groups);
  if (keys.length < 2) return null;

  const allData = Object.values(groups).flat();
  const nTotal = allData.length;
  const k = keys.length;
  const grandMean = jStat.mean(allData);

  let ssBetween = 0;
  let ssWithin = 0;
  keys.forEach(key => {
    const values = groups[key];
    const mean = jStat.mean(values);
    ssBetween += values.length * Math.pow(mean - grandMean, 2);
    values.forEach(value => {
      ssWithin += Math.pow(value - mean, 2);
    });
  });

  const dfBetween = k - 1;
  const dfWithin = nTotal - k;
  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  const f = msWithin > 0 ? msBetween / msWithin : NaN;
  const p = fSF(f, dfBetween, dfWithin);
  const ssTotal = ssBetween + ssWithin;

  const eta2 = ssTotal > 0 ? ssBetween / ssTotal : NaN;
  const omega2 = ssTotal + msWithin > 0 ? (ssBetween - (k - 1) * msWithin) / (ssTotal + msWithin) : NaN;
  const epsilon2 = ssTotal > 0 ? (ssBetween - (k - 1) * msWithin) / ssTotal : NaN;
  const cohenF = eta2 >= 0 && eta2 < 1 ? Math.sqrt(eta2 / (1 - eta2)) : NaN;

  const groupStats: AnovaGroupStats[] = keys.map(key => {
    const values = groups[key];
    const ci = meanCI(values, level);
    return {
      group: key,
      n: values.length,
      mean: ci.mean,
      sd: jStat.stdev(values, true),
      se: ci.se,
      median: jStat.median(values),
      min: jStat.min(values),
      max: jStat.max(values),
      ciLo: ci.lo,
      ciHi: ci.hi,
    };
  });

  const levene = leveneTest(keys.map(key => groups[key]), 'mean');
  const brownForsythe = leveneTest(keys.map(key => groups[key]), 'median');
  const welch = welchAnova(keys.map(key => groups[key]));
  const groupSds = keys.map(key => jStat.stdev(groups[key], true)).filter(value => isFinite(value));
  const minSd = groupSds.length ? Math.min(...groupSds) : NaN;
  const sdRatio = minSd > 0 ? Math.max(...groupSds) / minSd : NaN;
  const bartlett = bartlettTest(keys.map(key => groups[key]));
  const obrien = obrienTest(keys.map(key => groups[key]));
  const assumptions: AnovaAssumption[] = [
    { kind: 'levene', group: null, n: NaN, statistic: levene.stat, df1: levene.df1, df2: levene.df2, p: levene.p },
    { kind: 'brownForsythe', group: null, n: NaN, statistic: brownForsythe.stat, df1: brownForsythe.df1, df2: brownForsythe.df2, p: brownForsythe.p },
    { kind: 'bartlett', group: null, n: NaN, statistic: bartlett.stat, df1: bartlett.df, df2: NaN, p: bartlett.p },
    { kind: 'obrien', group: null, n: NaN, statistic: obrien.stat, df1: obrien.df1, df2: obrien.df2, p: obrien.p },
    { kind: 'sdRatio', group: null, n: NaN, statistic: sdRatio, df1: NaN, df2: NaN, p: NaN },
    { kind: 'welch', group: null, n: NaN, statistic: welch.stat, df1: welch.df1, df2: welch.df2, p: welch.p },
  ];
  keys.forEach(key => {
    const jb = jbFor(groups[key]);
    assumptions.push({
      kind: 'jarqueBera',
      group: key,
      n: groups[key].length,
      statistic: jb.stat,
      df1: 2,
      df2: NaN,
      p: jb.p,
    });
  });

  let posthocPairs: AnovaPostHocPair[] | null = null;
  if (posthoc === 'steeldwass' && k >= 2) {
    posthocPairs = steelDwassPairs(keys, groups);
  } else if (posthoc !== 'none' && k >= 2 && dfWithin > 0) {
    const pairs: AnovaPostHocPair[] = [];

    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const a = keys[i];
        const b = keys[j];
        const na = groups[a].length;
        const nb = groups[b].length;
        const diff = jStat.mean(groups[a]) - jStat.mean(groups[b]);

        if (posthoc === 'gameshowell') {
          const va = jStat.variance(groups[a], true);
          const vb = jStat.variance(groups[b], true);
          const se = Math.sqrt(va / na + vb / nb);
          const df = Math.pow(va / na + vb / nb, 2) /
            (Math.pow(va / na, 2) / (na - 1) + Math.pow(vb / nb, 2) / (nb - 1));
          const t = se > 0 ? diff / se : NaN;
          pairs.push({ a, b, diff, se, df, t, pRaw: twoSidedTP(t, df), pAdj: NaN, ciLo: NaN, ciHi: NaN, d: NaN });
        } else {
          const se = Math.sqrt(msWithin * (1 / na + 1 / nb));
          const t = se > 0 ? diff / se : NaN;
          pairs.push({ a, b, diff, se, df: dfWithin, t, pRaw: twoSidedTP(t, dfWithin), pAdj: NaN, ciLo: NaN, ciHi: NaN, d: msWithin > 0 ? diff / Math.sqrt(msWithin) : NaN });
        }
      }
    }

    const raw = pairs.map(pair => pair.pRaw);
    let adjusted: number[] = raw;
    if (posthoc === 'holm') adjusted = holmAdjust(raw);
    else if (posthoc === 'bonferroni') adjusted = bonferroniAdjust(raw);
    else if (posthoc === 'fdr') adjusted = benjaminiHochberg(raw);
    else adjusted = raw.map(value => Math.min(1, value * raw.length));

    pairs.forEach((pair, index) => {
      pair.pAdj = adjusted[index];
      const crit = tCrit(level, pair.df);
      pair.ciLo = pair.diff - crit * pair.se;
      pair.ciHi = pair.diff + crit * pair.se;
    });

    posthocPairs = pairs;
  }

  let kruskal: AnovaKruskalStats | null = null;
  let dunn: DunnResult[] | null = null;
  if (useNonParam) {
    const kw = calcKruskalWallis(groups);
    const etaH = nTotal > k ? Math.max(0, (kw.hStat - k + 1) / (nTotal - k)) : NaN;
    kruskal = {
      hStat: kw.hStat,
      df: kw.df,
      pValue: kw.pValue,
      etaH,
      groupNs: kw.groupNs,
      groupRankSums: kw.groupRankSums,
      groupMeanRanks: kw.groupMeanRanks,
    };
    if (kwPosthoc !== 'none' && k > 2) {
      dunn = dunnTest(groups, kwPosthoc);
    }
  }

  return {
    keys,
    groups,
    groupStats,
    test: {
      nTotal,
      k,
      ssBetween,
      ssWithin,
      ssTotal,
      dfBetween,
      dfWithin,
      msBetween,
      msWithin,
      f,
      p,
    },
    effects: { eta2, omega2, epsilon2, cohenF },
    assumptions,
    leveneP: levene.p,
    posthocPairs,
    kruskal,
    dunn,
  };
};
