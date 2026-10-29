import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
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
  kwPosthoc: 'none' | 'bonferroni' | 'holm' | 'fdr';
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
    title: copy('Descrittive per gruppo'),
    subtitle: copy('{s1} per {s2} · CI {s3}%', { s1: depName, s2: grpName, s3: level }),
    columns: [
      { key: 'group', label: copy('Gruppo'), format: 'text' },
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'mean', label: copy('Mean'), format: 'dec4' },
      { key: 'sd', label: copy('SD'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'median', label: copy('Median'), format: 'dec4' },
      { key: 'min', label: copy('Min'), format: 'dec4' },
      { key: 'max', label: copy('Max'), format: 'dec4' },
      { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
      { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
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
    notes: [copy('CI della media entro gruppo: t di Student con df = n_gruppo − 1.')],
  });

  // -------------------------------------------------------------------------
  // ANOVA table
  // -------------------------------------------------------------------------
  tables.push({
    id: 'anova-table',
    title: copy('ANOVA a una via'),
    subtitle: copy('H₀: tutte le medie uguali · α = {s1}', { s1: (1 - level / 100).toFixed(2) }),
    columns: [
      { key: 'source', label: copy('Source'), format: 'text' },
      { key: 'ss', label: copy('SS'), format: 'dec4' },
      { key: 'df', label: copy('df'), format: 'int' },
      { key: 'ms', label: copy('MS'), format: 'dec4' },
      { key: 'f', label: copy('F'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
    ],
    rows: [
      { source: copy('Between (gruppi)'), ss: ssBetween, df: dfBetween, ms: msBetween, f, p },
      { source: copy('Within (errore)'), ss: ssWithin, df: dfWithin, ms: msWithin, f: NaN, p: NaN },
      { source: 'Total', ss: ssTotal, df: nTotal - 1, ms: NaN, f: NaN, p: NaN },
    ],
    notes: [copy('F = MS_between / MS_within; p da F({s1}, {s2}).', { s1: dfBetween, s2: dfWithin })],
  });

  tables.push({
    id: 'anova-effects',
    title: copy('Effect size'),
    columns: [
      { key: 'measure', label: copy('Misura'), format: 'text' },
      { key: 'estimate', label: copy('Stima'), format: 'dec4' },
      { key: 'note', label: copy('Interpretazione'), format: 'text' },
    ],
    rows: [
      { measure: copy('η²'), estimate: eta2, note: interpretEta(eta2) },
      { measure: copy('partial η²'), estimate: eta2, note: interpretEta(eta2) },
      { measure: copy('ω²'), estimate: omega2, note: interpretEta(omega2) },
      { measure: copy('ε²'), estimate: epsilon2, note: interpretEta(epsilon2) },
      { measure: copy("Cohen's f"), estimate: cohenF, note: cohenF < 0.25 ? 'piccolo' : cohenF < 0.4 ? 'medio' : 'grande' },
    ],
    notes: [
      copy('η² = SS_between / SS_total; ω² = (SS_between − (k−1)·MS_within)/(SS_total + MS_within); ε² = (SS_between − (k−1)·MS_within)/SS_total.'),
      copy('In un ANOVA a una via partial η² coincide con η².'),
    ],
  });

  // -------------------------------------------------------------------------
  // Assumptions
  // -------------------------------------------------------------------------
  const assumptionRows = assumptions.map(item => {
    switch (item.kind) {
      case 'levene':
        return { check: copy('Levene (media)'), statistic: item.statistic, df1: item.df1, df2: item.df2, p: item.p, note: copy('omoschedasticità') };
      case 'brownForsythe':
        return { check: copy('Brown–Forsythe (mediana)'), statistic: item.statistic, df1: item.df1, df2: item.df2, p: item.p, note: copy('robusto agli outlier') };
      case 'sdRatio':
        return { check: copy('Rapporto SD max/min'), statistic: item.statistic, df1: item.df1, df2: item.df2, p: item.p, note: copy('omogeneità descrittiva delle SD') };
      case 'welch':
        return { check: copy('Welch ANOVA'), statistic: item.statistic, df1: item.df1, df2: item.df2, p: item.p, note: copy('alternativa con varianze diseguali') };
      default:
        return {
          check: copy('Jarque–Bera {s1}', { s1: item.group }),
          statistic: item.statistic,
          df1: item.df1,
          df2: item.df2,
          p: item.p,
          note: copy('normalità residui del gruppo (N = {s1})', { s1: item.n }),
        };
    }
  });

  tables.push({
    id: 'anova-assumptions',
    title: copy('Assunzioni'),
    columns: [
      { key: 'check', label: copy('Controllo'), format: 'text' },
      { key: 'statistic', label: copy('Statistica'), format: 'dec4' },
      { key: 'df1', label: copy('df1'), format: 'dec2' },
      { key: 'df2', label: copy('df2'), format: 'dec2' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'note', label: copy('Nota'), format: 'text' },
    ],
    rows: assumptionRows,
    notes: [
      leveneP < 0.05
        ? copy('Levene significativo: varianze non omogenee. Riportare anche la Welch ANOVA e/o Kruskal-Wallis.')
        : copy('Nessuna evidenza di eteroschedasticità.'),
      copy('Il rapporto max(SD)/min(SD) è un ulteriore controllo descrittivo della omogeneità.'),
    ],
  });

  // -------------------------------------------------------------------------
  // Post-hoc
  // -------------------------------------------------------------------------
  if (posthocPairs) {
    const labels: { [key in Exclude<PostHocMethod, 'none'>]: string } = {
      tukey: copy('Tukey–Kramer (approssimazione Bonferroni)'),
      bonferroni: 'Bonferroni',
      holm: 'Holm',
      fdr: copy('FDR (Benjamini–Hochberg)'),
      gameshowell: copy('Games–Howell (Welch pairwise)'),
    };

    tables.push({
      id: 'anova-posthoc',
      title: copy('Post-hoc'),
      subtitle: labels[posthoc],
      columns: [
        { key: 'comparison', label: copy('Confronto'), format: 'text' },
        { key: 'diff', label: copy('Mean diff'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 't', label: copy('t'), format: 'dec3' },
        { key: 'df', label: copy('df'), format: 'dec2' },
        { key: 'pRaw', label: copy('p non corretto'), format: 'p' },
        { key: 'pAdj', label: copy('p corretto'), format: 'p' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
        { key: 'd', label: copy("Cohen's d"), format: 'dec3' },
      ],
      rows: posthocPairs.map(pair => ({
        comparison: copy('{s1} vs {s2}', { s1: pair.a, s2: pair.b }),
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
        copy('Tukey–Kramer qui usa l’approssimazione t con aggiustamento Bonferroni: riportato esplicitamente per non spacciarla per il range studentizzato esatto.'),
        copy('I CI sono individuali (non simultanei) al livello scelto; per Holm/Bonferroni il p è corretto, il CI no.'),
        copy('Cohen’s d per confronto usa la SD within pooled (√MS_within).'),
      ],
    });
  }

  // -------------------------------------------------------------------------
  // Kruskal-Wallis
  // -------------------------------------------------------------------------
  if (kruskal) {
    tables.push({
      id: 'anova-kruskal',
      title: copy('Kruskal–Wallis H (non parametrico)'),
      columns: [
        { key: 'h', label: copy('H'), format: 'dec3' },
        { key: 'df', label: copy('df'), format: 'int' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'etaH', label: copy('η²_H'), format: 'dec3' },
      ],
      rows: [{ h: kruskal.hStat, df: kruskal.df, p: kruskal.pValue, etaH: kruskal.etaH }],
      notes: [copy('H corretto per i ranghi pari; η²_H = (H − k + 1)/(N − k) è una dimensione dell’effetto.')],
    });

    tables.push({
      id: 'anova-kruskal-ranks',
      title: copy('Ranghi per gruppo'),
      columns: [
        { key: 'group', label: copy('Gruppo'), format: 'text' },
        { key: 'n', label: copy('N'), format: 'int' },
        { key: 'rankSum', label: copy('Rank sum'), format: 'dec2' },
        { key: 'meanRank', label: copy('Mean rank'), format: 'dec2' },
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
        title: copy('Post-hoc Dunn'),
        subtitle: kwPosthoc === 'holm' ? copy('correzione Holm') : kwPosthoc === 'fdr' ? copy('correzione FDR') : copy('correzione Bonferroni'),
        columns: [
          { key: 'comparison', label: copy('Confronto'), format: 'text' },
          { key: 'z', label: copy('z'), format: 'dec3' },
          { key: 'p', label: copy('p non corretto'), format: 'p' },
          { key: 'pAdj', label: copy('p corretto'), format: 'p' },
        ],
        rows: dunn.map(result => ({
          comparison: copy('{s1} vs {s2}', { s1: result.a, s2: result.b }),
          z: result.z,
          p: result.p,
          pAdj: result.pAdj,
        })),
        notes: [copy('Dunn usa la varianza dei ranghi con correzione per i pari; p corretto con Holm o Bonferroni.')],
      });
    }
  }

  return tables;
};
