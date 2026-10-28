import type { TableSpec } from '../types';
import { interpretEta } from '../format';
import { anovaStats } from '../kernels/anova';
import type { PostHocMethod } from '../kernels/anova';

export type { PostHocMethod } from '../kernels/anova';

export interface AnovaTablesOptions {
  rows: readonly (readonly string[])[];
  depIdx: number;
  grpIdx: number;
  depName: string;
  grpName: string;
  posthoc: PostHocMethod;
  kwPosthoc: 'none' | 'bonferroni' | 'holm';
  level: number;
  useNonParam: boolean;
}

export const anovaTables = (options: AnovaTablesOptions): TableSpec[] => {
  const { rows, depIdx, grpIdx, depName, grpName, posthoc, kwPosthoc, level, useNonParam } = options;

  const stats = anovaStats({ rows, depIdx, grpIdx, posthoc, kwPosthoc, level, useNonParam });
  if (!stats) return [];

  const { keys, groupStats, test, effects, assumptions, leveneP, posthocPairs, kruskal, dunn } = stats;
  const { ssBetween, ssWithin, ssTotal, dfBetween, dfWithin, msBetween, msWithin, f, p, nTotal } = test;
  const { eta2, omega2, epsilon2, cohenF } = effects;

  const tables: TableSpec[] = [];

  // -------------------------------------------------------------------------
  // Group descriptives
  // -------------------------------------------------------------------------
  tables.push({
    id: 'anova-groups',
    title: 'Descrittive per gruppo',
    subtitle: `${depName} per ${grpName} · CI ${level}%`,
    columns: [
      { key: 'group', label: 'Gruppo', format: 'text' },
      { key: 'n', label: 'N', format: 'int' },
      { key: 'mean', label: 'Mean', format: 'dec4' },
      { key: 'sd', label: 'SD', format: 'dec4' },
      { key: 'se', label: 'SE', format: 'dec4' },
      { key: 'median', label: 'Median', format: 'dec4' },
      { key: 'min', label: 'Min', format: 'dec4' },
      { key: 'max', label: 'Max', format: 'dec4' },
      { key: 'ciLo', label: 'CI low', format: 'dec4' },
      { key: 'ciHi', label: 'CI high', format: 'dec4' },
    ],
    rows: groupStats.map(item => ({
      group: item.group,
      n: item.n,
      mean: item.mean,
      sd: item.sd,
      se: item.se,
      median: item.median,
      min: item.min,
      max: item.max,
      ciLo: item.ciLo,
      ciHi: item.ciHi,
    })),
    notes: ['CI della media entro gruppo: t di Student con df = n_gruppo − 1.'],
  });

  // -------------------------------------------------------------------------
  // ANOVA table
  // -------------------------------------------------------------------------
  tables.push({
    id: 'anova-table',
    title: 'ANOVA a una via',
    subtitle: `H₀: tutte le medie uguali · α = ${(1 - level / 100).toFixed(2)}`,
    columns: [
      { key: 'source', label: 'Source', format: 'text' },
      { key: 'ss', label: 'SS', format: 'dec4' },
      { key: 'df', label: 'df', format: 'int' },
      { key: 'ms', label: 'MS', format: 'dec4' },
      { key: 'f', label: 'F', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
    ],
    rows: [
      { source: 'Between (gruppi)', ss: ssBetween, df: dfBetween, ms: msBetween, f, p },
      { source: 'Within (errore)', ss: ssWithin, df: dfWithin, ms: msWithin, f: NaN, p: NaN },
      { source: 'Total', ss: ssTotal, df: nTotal - 1, ms: NaN, f: NaN, p: NaN },
    ],
    notes: [`F = MS_between / MS_within; p da F(${dfBetween}, ${dfWithin}).`],
  });

  tables.push({
    id: 'anova-effects',
    title: 'Effect size',
    columns: [
      { key: 'measure', label: 'Misura', format: 'text' },
      { key: 'estimate', label: 'Stima', format: 'dec4' },
      { key: 'note', label: 'Interpretazione', format: 'text' },
    ],
    rows: [
      { measure: 'η²', estimate: eta2, note: interpretEta(eta2) },
      { measure: 'partial η²', estimate: eta2, note: interpretEta(eta2) },
      { measure: 'ω²', estimate: omega2, note: interpretEta(omega2) },
      { measure: 'ε²', estimate: epsilon2, note: interpretEta(epsilon2) },
      { measure: "Cohen's f", estimate: cohenF, note: cohenF < 0.25 ? 'piccolo' : cohenF < 0.4 ? 'medio' : 'grande' },
    ],
    notes: [
      'η² = SS_between / SS_total; ω² = (SS_between − (k−1)·MS_within)/(SS_total + MS_within); ε² = (SS_between − (k−1)·MS_within)/SS_total.',
      'In un ANOVA a una via partial η² coincide con η².',
    ],
  });

  // -------------------------------------------------------------------------
  // Assumptions
  // -------------------------------------------------------------------------
  const assumptionRows = assumptions.map(item => {
    switch (item.kind) {
      case 'levene':
        return { check: 'Levene (media)', statistic: item.statistic, df1: item.df1, df2: item.df2, p: item.p, note: 'omoschedasticità' };
      case 'brownForsythe':
        return { check: 'Brown–Forsythe (mediana)', statistic: item.statistic, df1: item.df1, df2: item.df2, p: item.p, note: 'robusto agli outlier' };
      case 'sdRatio':
        return { check: 'Rapporto SD max/min', statistic: item.statistic, df1: item.df1, df2: item.df2, p: item.p, note: 'omogeneità descrittiva delle SD' };
      case 'welch':
        return { check: 'Welch ANOVA', statistic: item.statistic, df1: item.df1, df2: item.df2, p: item.p, note: 'alternativa con varianze diseguali' };
      default:
        return {
          check: `Jarque–Bera ${item.group}`,
          statistic: item.statistic,
          df1: item.df1,
          df2: item.df2,
          p: item.p,
          note: `normalità residui del gruppo (N = ${item.n})`,
        };
    }
  });

  tables.push({
    id: 'anova-assumptions',
    title: 'Assunzioni',
    columns: [
      { key: 'check', label: 'Controllo', format: 'text' },
      { key: 'statistic', label: 'Statistica', format: 'dec4' },
      { key: 'df1', label: 'df1', format: 'dec2' },
      { key: 'df2', label: 'df2', format: 'dec2' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'note', label: 'Nota', format: 'text' },
    ],
    rows: assumptionRows,
    notes: [
      leveneP < 0.05
        ? 'Levene significativo: varianze non omogenee. Riportare anche la Welch ANOVA e/o Kruskal-Wallis.'
        : 'Nessuna evidenza di eteroschedasticità.',
      'Il rapporto max(SD)/min(SD) è un ulteriore controllo descrittivo della omogeneità.',
    ],
  });

  // -------------------------------------------------------------------------
  // Post-hoc
  // -------------------------------------------------------------------------
  if (posthocPairs) {
    const labels: { [key in Exclude<PostHocMethod, 'none'>]: string } = {
      tukey: 'Tukey–Kramer (approssimazione Bonferroni)',
      bonferroni: 'Bonferroni',
      holm: 'Holm',
      gameshowell: 'Games–Howell (Welch pairwise)',
    };

    tables.push({
      id: 'anova-posthoc',
      title: 'Post-hoc',
      subtitle: labels[posthoc],
      columns: [
        { key: 'comparison', label: 'Confronto', format: 'text' },
        { key: 'diff', label: 'Mean diff', format: 'dec4' },
        { key: 'se', label: 'SE', format: 'dec4' },
        { key: 't', label: 't', format: 'dec3' },
        { key: 'df', label: 'df', format: 'dec2' },
        { key: 'pRaw', label: 'p non corretto', format: 'p' },
        { key: 'pAdj', label: 'p corretto', format: 'p' },
        { key: 'ciLo', label: 'CI low', format: 'dec4' },
        { key: 'ciHi', label: 'CI high', format: 'dec4' },
        { key: 'd', label: "Cohen's d", format: 'dec3' },
      ],
      rows: posthocPairs.map(pair => ({
        comparison: `${pair.a} vs ${pair.b}`,
        diff: pair.diff,
        se: pair.se,
        t: pair.t,
        df: pair.df,
        pRaw: pair.pRaw,
        pAdj: pair.pAdj,
        ciLo: pair.ciLo,
        ciHi: pair.ciHi,
        d: pair.d,
      })),
      notes: [
        'Tukey–Kramer qui usa l’approssimazione t con aggiustamento Bonferroni: riportato esplicitamente per non spacciarla per il range studentizzato esatto.',
        'I CI sono individuali (non simultanei) al livello scelto; per Holm/Bonferroni il p è corretto, il CI no.',
        'Cohen’s d per confronto usa la SD within pooled (√MS_within).',
      ],
    });
  }

  // -------------------------------------------------------------------------
  // Kruskal-Wallis
  // -------------------------------------------------------------------------
  if (kruskal) {
    tables.push({
      id: 'anova-kruskal',
      title: 'Kruskal–Wallis H (non parametrico)',
      columns: [
        { key: 'h', label: 'H', format: 'dec3' },
        { key: 'df', label: 'df', format: 'int' },
        { key: 'p', label: 'p', format: 'p' },
        { key: 'etaH', label: 'η²_H', format: 'dec3' },
      ],
      rows: [{ h: kruskal.hStat, df: kruskal.df, p: kruskal.pValue, etaH: kruskal.etaH }],
      notes: ['H corretto per i ranghi pari; η²_H = (H − k + 1)/(N − k) è una dimensione dell’effetto.'],
    });

    tables.push({
      id: 'anova-kruskal-ranks',
      title: 'Ranghi per gruppo',
      columns: [
        { key: 'group', label: 'Gruppo', format: 'text' },
        { key: 'n', label: 'N', format: 'int' },
        { key: 'rankSum', label: 'Rank sum', format: 'dec2' },
        { key: 'meanRank', label: 'Mean rank', format: 'dec2' },
      ],
      rows: keys.map(key => ({
        group: key,
        n: kruskal.groupNs[key],
        rankSum: kruskal.groupRankSums[key],
        meanRank: kruskal.groupMeanRanks[key],
      })),
    });

    if (dunn) {
      tables.push({
        id: 'anova-dunn',
        title: 'Post-hoc Dunn',
        subtitle: kwPosthoc === 'holm' ? 'correzione Holm' : 'correzione Bonferroni',
        columns: [
          { key: 'comparison', label: 'Confronto', format: 'text' },
          { key: 'z', label: 'z', format: 'dec3' },
          { key: 'p', label: 'p non corretto', format: 'p' },
          { key: 'pAdj', label: 'p corretto', format: 'p' },
        ],
        rows: dunn.map(result => ({
          comparison: `${result.a} vs ${result.b}`,
          z: result.z,
          p: result.p,
          pAdj: result.pAdj,
        })),
        notes: ['Dunn usa la varianza dei ranghi con correzione per i pari; p corretto con Holm o Bonferroni.'],
      });
    }
  }

  return tables;
};
