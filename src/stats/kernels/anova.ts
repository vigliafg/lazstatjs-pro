import { jStat } from '../jstat';
import { parseNum } from '../core';
import { calcKruskalWallis } from './index';
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

export type PostHocMethod = 'none' | 'tukey' | 'bonferroni' | 'holm' | 'gameshowell';

export interface AnovaStatsOptions {
  rows: readonly (readonly string[])[];
  depIdx: number;
  grpIdx: number;
  posthoc: PostHocMethod;
  kwPosthoc: 'none' | 'bonferroni' | 'holm';
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
  const assumptions: AnovaAssumption[] = [
    { kind: 'levene', group: null, n: NaN, statistic: levene.stat, df1: levene.df1, df2: levene.df2, p: levene.p },
    { kind: 'brownForsythe', group: null, n: NaN, statistic: brownForsythe.stat, df1: brownForsythe.df1, df2: brownForsythe.df2, p: brownForsythe.p },
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
  if (posthoc !== 'none' && k >= 2 && dfWithin > 0) {
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
