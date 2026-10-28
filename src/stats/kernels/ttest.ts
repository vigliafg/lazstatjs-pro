import { jStat } from '../jstat';
import { parseNum, pairedValues, pooledTTest, welchTTest } from '../core';
import { calcMannWhitneyU, calcWilcoxonSignedRank } from './index';
import {
  bootstrapCI,
  chi2SF,
  cohensD,
  dCI,
  dStandardError,
  hedgesCorrection,
  leveneTest,
  meanCI,
  pairedDStandardError,
  pooledSD,
  tCrit,
  twoSidedTP,
  lillieforsTest,
} from '../distributions';

export type TTestType = 'one' | 'ind' | 'dep';

export interface TTestKernelOptions {
  type: TTestType;
  rows: readonly (readonly string[])[];
  i1: number;
  i2: number;
  mu: number;
  equalVar: boolean;
  level: number;
  useNonParam: boolean;
}

export interface TTestSampleStats {
  n: number;
  missing: number;
  mean: number;
  sd: number;
  se: number;
  median: number;
  min: number;
  max: number;
  ciLo: number;
  ciHi: number;
}

export interface EffectSizeStats {
  estimate: number;
  ciLo: number;
  ciHi: number;
}

export interface AssumptionStats {
  statistic: number;
  df1: number;
  df2: number;
  p: number;
}

export interface JarqueBeraStats extends AssumptionStats {
  n: number;
}

export interface WilcoxonStats {
  nEff: number;
  wPlus: number;
  wMinus: number;
  w: number;
  z: number;
  p: number;
  r: number;
  rb: number;
}

export interface HodgesLehmannStats {
  estimate: number;
  ciLo: number;
  ciHi: number;
}

export interface TTestMainStats {
  diff: number;
  se: number;
  t: number;
  df: number;
  p: number;
  pOne: number;
  ciLo: number;
  ciHi: number;
}

export interface OneSampleEffectStats {
  d: EffectSizeStats;
  hedgesG: EffectSizeStats;
  r: EffectSizeStats;
  rSquared: EffectSizeStats;
}

export interface OneSampleResult {
  type: 'one';
  samples: TTestSampleStats[];
  main: TTestMainStats;
  effects: OneSampleEffectStats;
  assumptions: {
    jarqueBera: JarqueBeraStats;
    lilliefors: AssumptionStats;
  };
  nonParam: {
    wilcoxon: WilcoxonStats;
    hodgesLehmann: HodgesLehmannStats;
  } | null;
}

export interface MannWhitneyGroupStats {
  n: number;
  rankSum: number;
  meanRank: number;
  u: number;
  z: number;
  p: number;
  cles: number;
  rb: number;
}

export interface IndependentEffectStats {
  d: EffectSizeStats;
  hedgesG: EffectSizeStats;
  glass: EffectSizeStats;
  r: EffectSizeStats;
  rSquared: EffectSizeStats;
}

export interface IndependentResult {
  type: 'ind';
  samples: TTestSampleStats[];
  main: TTestMainStats;
  effects: IndependentEffectStats;
  assumptions: {
    levene: AssumptionStats;
    brownForsythe: AssumptionStats;
    jarqueBeraA: JarqueBeraStats;
    jarqueBeraB: JarqueBeraStats;
  };
  nonParam: {
    mannWhitney: {
      groupA: MannWhitneyGroupStats;
      groupB: MannWhitneyGroupStats;
    };
    hodgesLehmann: HodgesLehmannStats;
  } | null;
}

export interface PairedResult {
  type: 'dep';
  samples: TTestSampleStats[];
  completePairs: number;
  excludedPairs: number;
  main: TTestMainStats;
  effects: OneSampleEffectStats;
  assumptions: {
    jarqueBera: JarqueBeraStats;
    lilliefors: AssumptionStats;
  };
  nonParam: {
    wilcoxon: WilcoxonStats;
    hodgesLehmann: HodgesLehmannStats;
  } | null;
}

export type TTestResult = OneSampleResult | IndependentResult | PairedResult;

const sampleStats = (
  values: number[],
  level: number,
  missing: number
): TTestSampleStats => {
  const ci = meanCI(values, level);
  return {
    n: values.length,
    missing,
    mean: ci.mean,
    sd: jStat.stdev(values, true),
    se: ci.se,
    median: jStat.median(values),
    min: values.length ? jStat.min(values) : NaN,
    max: values.length ? jStat.max(values) : NaN,
    ciLo: ci.lo,
    ciHi: ci.hi,
  };
};

const jarqueBera = (values: number[]): JarqueBeraStats => {
  const n = values.length;
  const skew = n >= 3 ? jStat.skewness(values) : NaN;
  const kurt = n >= 3 ? jStat.kurtosis(values) : NaN;
  const statistic = (n / 6) * (skew * skew + (kurt * kurt) / 4);
  return {
    n,
    statistic,
    df1: 2,
    df2: NaN,
    p: chi2SF(statistic, 2),
  };
};

const wilcoxonStats = (wilcox: ReturnType<typeof calcWilcoxonSignedRank>): WilcoxonStats => {
  const nEff = wilcox.nEffective;
  const r = nEff > 0 ? wilcox.zStat / Math.sqrt(nEff) : NaN;
  const rb = wilcox.posRankSum + wilcox.negRankSum > 0
    ? (wilcox.posRankSum - wilcox.negRankSum) / (wilcox.posRankSum + wilcox.negRankSum)
    : NaN;
  return {
    nEff,
    wPlus: wilcox.posRankSum,
    wMinus: wilcox.negRankSum,
    w: wilcox.wStat,
    z: wilcox.zStat,
    p: wilcox.pValue,
    r,
    rb,
  };
};

/** Statistiche del test t (un campione, indipendente o appaiato) e dei test collegati. */
export const ttestStats = (options: TTestKernelOptions): TTestResult => {
  const { type, rows, i1, i2, mu, equalVar, level, useNonParam } = options;

  const a1 = rows.map(row => parseNum(row[i1])).filter(value => !isNaN(value));
  const a2 = type === 'one' ? [] : rows.map(row => parseNum(row[i2])).filter(value => !isNaN(value));
  const paired = type === 'dep' ? pairedValues(rows, i1, i2) : { a: [] as number[], b: [] as number[] };

  const samples =
    type === 'one'
      ? [sampleStats(a1, level, rows.length - a1.length)]
      : type === 'ind'
        ? [
            sampleStats(a1, level, rows.length - a1.length),
            sampleStats(a2, level, rows.length - a2.length),
          ]
        : [
            sampleStats(paired.a, level, rows.length - paired.a.length),
            sampleStats(paired.b, level, rows.length - paired.a.length),
          ];

  if (type === 'one') {
    const n = a1.length;
    const mean = jStat.mean(a1);
    const sd = jStat.stdev(a1, true);
    const se = sd / Math.sqrt(n);
    const t = se > 0 ? (mean - mu) / se : NaN;
    const df = n - 1;
    const p = twoSidedTP(t, df);
    const crit = n > 1 ? tCrit(level, df) : NaN;
    const diff = mean - mu;
    const d = sd > 0 ? diff / sd : NaN;
    const dSe = pairedDStandardError(d, n);
    const g = d * (1 - 3 / (4 * n - 5));
    const rPoint = isFinite(t) ? t / Math.sqrt(t * t + df) : NaN;
    const dCi = dCI(d, dSe, level);
    const gCi = dCI(g, dSe, level);

    const lilliefors = lillieforsTest(a1);

    let nonParam: OneSampleResult['nonParam'] = null;
    if (useNonParam && a1.filter(value => value !== mu).length >= 3) {
      const wilcox = calcWilcoxonSignedRank(a1, mu);
      const nEff = wilcox.nEffective;
      const hl = jStat.median(a1.map(v => v - mu));
      const hlCI = bootstrapCI(rnd => {
        const sample = Array.from({ length: nEff || a1.length }, () => a1[Math.floor(rnd() * a1.length)]);
        return jStat.median(sample.map(v => v - mu));
      }, level, 500);
      nonParam = {
        wilcoxon: wilcoxonStats(wilcox),
        hodgesLehmann: { estimate: hl, ciLo: hlCI.lo, ciHi: hlCI.hi },
      };
    }

    return {
      type: 'one',
      samples,
      main: {
        diff,
        se,
        t,
        df,
        p,
        pOne: p / 2,
        ciLo: diff - crit * se,
        ciHi: diff + crit * se,
      },
      effects: {
        d: { estimate: d, ciLo: dCi.lo, ciHi: dCi.hi },
        hedgesG: { estimate: g, ciLo: gCi.lo, ciHi: gCi.hi },
        r: { estimate: rPoint, ciLo: NaN, ciHi: NaN },
        rSquared: { estimate: rPoint * rPoint, ciLo: NaN, ciHi: NaN },
      },
      assumptions: {
        jarqueBera: jarqueBera(a1),
        lilliefors: { statistic: lilliefors.d, df1: NaN, df2: NaN, p: lilliefors.p },
      },
      nonParam,
    };
  }

  if (type === 'ind') {
    const n1 = a1.length;
    const n2 = a2.length;
    const m1 = jStat.mean(a1);
    const m2 = jStat.mean(a2);
    const sd1 = jStat.stdev(a1, true);
    const sd2 = jStat.stdev(a2, true);
    const diff = m1 - m2;
    const pooled = pooledTTest(a1, a2);
    const welch = welchTTest(a1, a2);
    const used = equalVar ? pooled : welch;
    const df = used.df;
    const crit = tCrit(level, df);
    const sp = pooledSD(a1, a2);
    const d = cohensD(m1, m2, sp);
    const dSe = dStandardError(d, n1, n2);
    const g = d * hedgesCorrection(n1, n2);
    const glass = sd1 > 0 ? diff / sd1 : NaN;
    const rPoint = isFinite(used.t) ? used.t / Math.sqrt(used.t * used.t + df) : NaN;
    const dCi = dCI(d, dSe, level);
    const gCi = dCI(g, dSe, level);

    const levene = leveneTest([a1, a2], 'mean');
    const brownForsythe = leveneTest([a1, a2], 'median');

    let nonParam: IndependentResult['nonParam'] = null;
    if (useNonParam) {
      const mw = calcMannWhitneyU(a1, a2);
      const u1 = mw.sumRank1 - (n1 * (n1 + 1)) / 2;
      const u2 = n1 * n2 - u1;
      const cles = u1 / (n1 * n2);
      const rb = 2 * cles - 1;
      const hl = jStat.median(
        a1.flatMap(x => a2.map(y => x - y))
      );
      const hlCI = bootstrapCI(rnd => {
        const sampleA = Array.from({ length: n1 }, () => a1[Math.floor(rnd() * n1)]);
        const sampleB = Array.from({ length: n2 }, () => a2[Math.floor(rnd() * n2)]);
        return jStat.median(sampleA.flatMap(x => sampleB.map(y => x - y)));
      }, level, 400);
      nonParam = {
        mannWhitney: {
          groupA: {
            n: n1,
            rankSum: mw.sumRank1,
            meanRank: mw.meanRank1,
            u: u1,
            z: mw.zStat,
            p: mw.pValue,
            cles,
            rb,
          },
          groupB: {
            n: n2,
            rankSum: mw.sumRank2,
            meanRank: mw.meanRank2,
            u: u2,
            z: NaN,
            p: NaN,
            cles: NaN,
            rb: NaN,
          },
        },
        hodgesLehmann: { estimate: hl, ciLo: hlCI.lo, ciHi: hlCI.hi },
      };
    }

    return {
      type: 'ind',
      samples,
      main: {
        diff,
        se: used.se,
        t: used.t,
        df,
        p: used.p,
        pOne: used.p / 2,
        ciLo: diff - crit * used.se,
        ciHi: diff + crit * used.se,
      },
      effects: {
        d: { estimate: d, ciLo: dCi.lo, ciHi: dCi.hi },
        hedgesG: { estimate: g, ciLo: gCi.lo, ciHi: gCi.hi },
        glass: { estimate: glass, ciLo: NaN, ciHi: NaN },
        r: { estimate: rPoint, ciLo: NaN, ciHi: NaN },
        rSquared: { estimate: rPoint * rPoint, ciLo: NaN, ciHi: NaN },
      },
      assumptions: {
        levene: {
          statistic: levene.stat,
          df1: levene.df1,
          df2: levene.df2,
          p: levene.p,
        },
        brownForsythe: {
          statistic: brownForsythe.stat,
          df1: brownForsythe.df1,
          df2: brownForsythe.df2,
          p: brownForsythe.p,
        },
        jarqueBeraA: jarqueBera(a1),
        jarqueBeraB: jarqueBera(a2),
      },
      nonParam,
    };
  }

  const n = paired.a.length;
  const diffs = paired.a.map((value, index) => value - paired.b[index]);
  const meanDiff = jStat.mean(diffs);
  const sdDiff = jStat.stdev(diffs, true);
  const se = sdDiff / Math.sqrt(n);
  const t = se > 0 ? meanDiff / se : NaN;
  const df = n - 1;
  const p = twoSidedTP(t, df);
  const crit = n > 1 ? tCrit(level, df) : NaN;
  const dz = sdDiff > 0 ? meanDiff / sdDiff : NaN;
  const dzSe = pairedDStandardError(dz, n);
  const gz = dz * (1 - 3 / (4 * n - 5));
  const rPairs = n >= 3 ? jStat.corrcoeff(paired.a, paired.b) : NaN;
  const dzCi = dCI(dz, dzSe, level);
  const gzCi = dCI(gz, dzSe, level);

  const lilliefors = lillieforsTest(diffs);

  let nonParam: PairedResult['nonParam'] = null;
  if (useNonParam && diffs.filter(value => value !== 0).length >= 3) {
    const wilcox = calcWilcoxonSignedRank(diffs, 0);
    const hl = jStat.median(diffs);
    const hlCI = bootstrapCI(rnd => {
      const sample = Array.from({ length: n }, () => diffs[Math.floor(rnd() * n)]);
      return jStat.median(sample);
    }, level, 500);
    nonParam = {
      wilcoxon: wilcoxonStats(wilcox),
      hodgesLehmann: { estimate: hl, ciLo: hlCI.lo, ciHi: hlCI.hi },
    };
  }

  return {
    type: 'dep',
    samples,
    completePairs: paired.a.length,
    excludedPairs: rows.length - paired.a.length,
    main: {
      diff: meanDiff,
      se,
      t,
      df,
      p,
      pOne: p / 2,
      ciLo: meanDiff - crit * se,
      ciHi: meanDiff + crit * se,
    },
    effects: {
      d: { estimate: dz, ciLo: dzCi.lo, ciHi: dzCi.hi },
      hedgesG: { estimate: gz, ciLo: gzCi.lo, ciHi: gzCi.hi },
      r: { estimate: rPairs, ciLo: NaN, ciHi: NaN },
      rSquared: { estimate: rPairs * rPairs, ciLo: NaN, ciHi: NaN },
    },
    assumptions: {
      jarqueBera: jarqueBera(diffs),
      lilliefors: { statistic: lilliefors.d, df1: NaN, df2: NaN, p: lilliefors.p },
    },
    nonParam,
  };
};
