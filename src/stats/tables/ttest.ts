import type { TableSpec } from '../types';
import { fmtEst, interpretD, interpretR } from '../format';
import {
  ttestStats,
  type AssumptionStats,
  type JarqueBeraStats,
  type TTestKernelOptions,
  type TTestSampleStats,
} from '../kernels/ttest';

export interface TTestTablesOptions extends TTestKernelOptions {
  name1: string;
  name2: string;
}

const sampleRows = (
  samples: TTestSampleStats[],
  name1: string,
  name2: string
) => samples.map((sample, index) => ({
  group: index === 0 ? name1 : name2,
  ...sample,
}));

const jarqueBeraRow = (label: string, stats: JarqueBeraStats) => {
  const { statistic, df1, df2, p } = stats;
  return {
    check: label,
    statistic,
    df1,
    df2,
    p,
    note: `JB su N = ${stats.n}`,
  };
};

const lillieforsRow = (check: string, stats: AssumptionStats, note: string) => {
  const { statistic, df1, df2, p } = stats;
  return { check, statistic, df1, df2, p, note };
};

export const ttestTables = (options: TTestTablesOptions): TableSpec[] => {
  const { name1, name2, mu, level } = options;
  const stats = ttestStats(options);

  const tables: TableSpec[] = [];

  tables.push({
    id: 'ttest-sample',
    title: 'Campione e statistiche descrittive',
    subtitle: `CI ${level}%`,
    columns: [
      { key: 'group', label: 'Gruppo', format: 'text' },
      { key: 'n', label: 'N', format: 'int' },
      { key: 'missing', label: 'Missing', format: 'int' },
      { key: 'mean', label: 'Mean', format: 'dec4' },
      { key: 'sd', label: 'SD', format: 'dec4' },
      { key: 'se', label: 'SE', format: 'dec4' },
      { key: 'median', label: 'Median', format: 'dec4' },
      { key: 'min', label: 'Min', format: 'dec4' },
      { key: 'max', label: 'Max', format: 'dec4' },
      { key: 'ciLo', label: 'CI low', format: 'dec4' },
      { key: 'ciHi', label: 'CI high', format: 'dec4' },
    ],
    rows: sampleRows(stats.samples, name1, name2),
    notes:
      stats.type === 'dep'
        ? [
            `Solo righe con entrambe le colonne numeriche: ${stats.completePairs} coppie complete, ${stats.excludedPairs} coppie escluse.`,
            'Le statistiche descrittive dei gruppi sono calcolate sulle sole coppie complete, per coerenza con il test.',
          ]
        : ['Missing = celle vuote o non numeriche escluse dal calcolo.'],
  });

  // -------------------------------------------------------------------------
  // Main test
  // -------------------------------------------------------------------------
  if (stats.type === 'one') {
    const { main, effects, assumptions, nonParam } = stats;

    tables.push({
      id: 'ttest-main',
      title: 'Test t per un campione',
      subtitle: `H₀: μ = ${mu} · due code · α = ${(1 - level / 100).toFixed(2)}`,
      columns: [
        { key: 'comparison', label: 'Confronto', format: 'text' },
        { key: 'diff', label: 'Mean − μ₀', format: 'dec4' },
        { key: 'se', label: 'SE diff', format: 'dec4' },
        { key: 't', label: 't', format: 'dec3' },
        { key: 'df', label: 'df', format: 'dec2' },
        { key: 'p', label: 'p (2 code)', format: 'p' },
        { key: 'pOne', label: 'p (1 coda)', format: 'p' },
        { key: 'ciLo', label: 'CI low', format: 'dec4' },
        { key: 'ciHi', label: 'CI high', format: 'dec4' },
      ],
      rows: [
        {
          comparison: `${name1} vs μ₀`,
          ...main,
        },
      ],
      notes: [
        `CI della differenza: (M − μ₀) ± t(${level}%, df = ${main.df}) · SE.`,
        'p a una coda riferito alla direzione osservata (metà del p a due code).',
      ],
    });

    tables.push({
      id: 'ttest-effects',
      title: 'Effect size',
      columns: [
        { key: 'measure', label: 'Misura', format: 'text' },
        { key: 'estimate', label: 'Stima', format: 'dec3' },
        { key: 'ciLo', label: 'CI low', format: 'dec3' },
        { key: 'ciHi', label: 'CI high', format: 'dec3' },
        { key: 'note', label: 'Interpretazione', format: 'text' },
      ],
      rows: [
        { measure: "Cohen's d (one-sample)", estimate: effects.d.estimate, ciLo: effects.d.ciLo, ciHi: effects.d.ciHi, note: interpretD(effects.d.estimate) },
        { measure: 'Hedges g', estimate: effects.hedgesG.estimate, ciLo: effects.hedgesG.ciLo, ciHi: effects.hedgesG.ciHi, note: interpretD(effects.hedgesG.estimate) },
        { measure: 'r punto-biseriale', estimate: effects.r.estimate, ciLo: NaN, ciHi: NaN, note: interpretR(effects.r.estimate) },
        { measure: 'r²', estimate: effects.rSquared.estimate, ciLo: NaN, ciHi: NaN, note: 'quota di varianza spiegata' },
      ],
      notes: [
        "d = (M − μ₀) / SD; SE(d) ≈ √(1/N + d²/(2N)); CI normale approssimato.",
        'Hedges g applica il fattore di correzione per campioni piccoli J = 1 − 3/(4N − 5).',
      ],
    });

    tables.push({
      id: 'ttest-assumptions',
      title: 'Assunzioni',
      columns: [
        { key: 'check', label: 'Controllo', format: 'text' },
        { key: 'statistic', label: 'Statistica', format: 'dec4' },
        { key: 'df1', label: 'df1', format: 'dec2' },
        { key: 'df2', label: 'df2', format: 'dec2' },
        { key: 'p', label: 'p', format: 'p' },
        { key: 'note', label: 'Nota', format: 'text' },
      ],
      rows: [
        jarqueBeraRow('Jarque–Bera', assumptions.jarqueBera),
        lillieforsRow('Lilliefors (KS)', assumptions.lilliefors, 'normalità con parametri stimati'),
      ],
      notes: ['Con N piccolo i test di normalità hanno potenza limitata: valutare anche il Q-Q plot.'],
    });

    if (nonParam) {
      tables.push({
        id: 'ttest-wilcoxon',
        title: 'Wilcoxon signed-rank (non parametrico)',
        subtitle: `H₀: mediana = ${mu}`,
        columns: [
          { key: 'nEff', label: 'N effettivo', format: 'int' },
          { key: 'wPlus', label: 'W⁺', format: 'dec2' },
          { key: 'wMinus', label: 'W⁻', format: 'dec2' },
          { key: 'w', label: 'W', format: 'dec2' },
          { key: 'z', label: 'z', format: 'dec3' },
          { key: 'p', label: 'p', format: 'p' },
          { key: 'r', label: 'r = z/√N', format: 'dec3' },
          { key: 'rb', label: 'Rank-biserial', format: 'dec3' },
        ],
        rows: [
          { ...nonParam.wilcoxon },
        ],
        notes: [
          'Approssimazione normale con correzione di continuità e correzione per i ranghi pari; differenze nulle escluse.',
          'W riportato = min(W⁺, W⁻); r = z/√N è la dimensione dell’effetto; rank-biserial = (W⁺ − W⁻)/(W⁺ + W⁻).',
        ],
      });
      tables.push({
        id: 'ttest-hl',
        title: 'Hodges–Lehmann',
        columns: [
          { key: 'estimate', label: 'Stima', format: 'dec4' },
          { key: 'ciLo', label: 'CI low', format: 'dec4' },
          { key: 'ciHi', label: 'CI high', format: 'dec4' },
          { key: 'method', label: 'Metodo', format: 'text' },
        ],
        rows: [{ ...nonParam.hodgesLehmann, method: 'mediana delle differenze; CI bootstrap percentile' }],
        notes: ['CI bootstrap con 500 repliche e seed fisso; può differire leggermente da software che usa il metodo esatto.'],
      });
    }
  } else if (stats.type === 'ind') {
    const { main, effects, assumptions, nonParam } = stats;

    tables.push({
      id: 'ttest-main',
      title: options.equalVar ? 'Test t per campioni indipendenti (varianze uguali)' : 'Test t di Welch (varianze diseguali)',
      subtitle: `H₀: μ₁ = μ₂ · due code · α = ${(1 - level / 100).toFixed(2)}`,
      columns: [
        { key: 'comparison', label: 'Confronto', format: 'text' },
        { key: 'diff', label: 'Mean diff (A − B)', format: 'dec4' },
        { key: 'se', label: 'SE diff', format: 'dec4' },
        { key: 't', label: 't', format: 'dec3' },
        { key: 'df', label: 'df', format: 'dec2' },
        { key: 'p', label: 'p (2 code)', format: 'p' },
        { key: 'pOne', label: 'p (1 coda)', format: 'p' },
        { key: 'ciLo', label: 'CI low', format: 'dec4' },
        { key: 'ciHi', label: 'CI high', format: 'dec4' },
      ],
      rows: [
        {
          comparison: `${name1} − ${name2}`,
          ...main,
        },
      ],
      notes: [
        options.equalVar
          ? `Varianza pooled: sp² = ((n₁−1)s₁² + (n₂−1)s₂²)/(n₁+n₂−2); df = ${main.df}.`
          : `Welch–Satterthwaite: SE = √(s₁²/n₁ + s₂²/n₂); df = ${fmtEst(main.df, 2)}.`,
        `CI della differenza: diff ± t(${level}%, df) · SE.`,
      ],
    });

    tables.push({
      id: 'ttest-effects',
      title: 'Effect size',
      columns: [
        { key: 'measure', label: 'Misura', format: 'text' },
        { key: 'estimate', label: 'Stima', format: 'dec3' },
        { key: 'ciLo', label: 'CI low', format: 'dec3' },
        { key: 'ciHi', label: 'CI high', format: 'dec3' },
        { key: 'note', label: 'Interpretazione', format: 'text' },
      ],
      rows: [
        { measure: "Cohen's d (pooled)", estimate: effects.d.estimate, ciLo: effects.d.ciLo, ciHi: effects.d.ciHi, note: interpretD(effects.d.estimate) },
        { measure: 'Hedges g', estimate: effects.hedgesG.estimate, ciLo: effects.hedgesG.ciLo, ciHi: effects.hedgesG.ciHi, note: interpretD(effects.hedgesG.estimate) },
        { measure: 'Glass Δ (SD gruppo A)', estimate: effects.glass.estimate, ciLo: NaN, ciHi: NaN, note: interpretD(effects.glass.estimate) },
        { measure: 'r punto-biseriale', estimate: effects.r.estimate, ciLo: NaN, ciHi: NaN, note: interpretR(effects.r.estimate) },
        { measure: 'r²', estimate: effects.rSquared.estimate, ciLo: NaN, ciHi: NaN, note: 'quota di varianza spiegata' },
      ],
      notes: [
        'd = (M₁ − M₂)/sp; SE(d) ≈ √((n₁+n₂)/(n₁n₂) + d²/(2(n₁+n₂))).',
        'Hedges g = d · J, J = 1 − 3/(4(n₁+n₂) − 9). Glass usa la SD del gruppo A come riferimento.',
      ],
    });

    tables.push({
      id: 'ttest-assumptions',
      title: 'Assunzioni',
      columns: [
        { key: 'check', label: 'Controllo', format: 'text' },
        { key: 'statistic', label: 'Statistica', format: 'dec4' },
        { key: 'df1', label: 'df1', format: 'dec2' },
        { key: 'df2', label: 'df2', format: 'dec2' },
        { key: 'p', label: 'p', format: 'p' },
        { key: 'note', label: 'Nota', format: 'text' },
      ],
      rows: [
        { check: 'Levene (media)', ...assumptions.levene, note: 'omoschedasticità' },
        { check: 'Brown–Forsythe (mediana)', ...assumptions.brownForsythe, note: 'robusto agli outlier' },
        jarqueBeraRow(`Jarque–Bera ${name1}`, assumptions.jarqueBeraA),
        jarqueBeraRow(`Jarque–Bera ${name2}`, assumptions.jarqueBeraB),
      ],
      notes: [
        assumptions.levene.p < 0.05
          ? 'Levene significativo: l’assunzione di varianze uguali è dubbia, preferire Welch.'
          : 'Nessuna evidenza di eteroschedasticità a questo livello.',
      ],
    });

    if (nonParam) {
      const { groupA, groupB } = nonParam.mannWhitney;

      tables.push({
        id: 'ttest-mannwhitney',
        title: 'Mann–Whitney U (non parametrico)',
        columns: [
          { key: 'group', label: 'Gruppo', format: 'text' },
          { key: 'n', label: 'N', format: 'int' },
          { key: 'rankSum', label: 'Rank sum', format: 'dec2' },
          { key: 'meanRank', label: 'Mean rank', format: 'dec2' },
          { key: 'u', label: 'U', format: 'dec2' },
          { key: 'z', label: 'z', format: 'dec3' },
          { key: 'p', label: 'p', format: 'p' },
          { key: 'cles', label: 'CLES', format: 'dec3' },
          { key: 'rb', label: 'Rank-biserial', format: 'dec3' },
        ],
        rows: [
          { group: name1, ...groupA },
          { group: name2, ...groupB },
        ],
        notes: [
          'U riportato per ciascun gruppo (U₁ + U₂ = n₁·n₂); la significatività usa U = min(U₁, U₂) con approssimazione normale, correzione di continuità e correzione dei ranghi pari.',
          'CLES = U₁/(n₁n₂) = probabilità che un valore del gruppo A superi uno del gruppo B; rank-biserial = 2·CLES − 1.',
        ],
      });

      tables.push({
        id: 'ttest-hl',
        title: 'Hodges–Lehmann',
        columns: [
          { key: 'estimate', label: 'Stima (A − B)', format: 'dec4' },
          { key: 'ciLo', label: 'CI low', format: 'dec4' },
          { key: 'ciHi', label: 'CI high', format: 'dec4' },
          { key: 'method', label: 'Metodo', format: 'text' },
        ],
        rows: [{ ...nonParam.hodgesLehmann, method: 'mediana di tutte le differenze A − B; CI bootstrap percentile' }],
        notes: ['CI bootstrap con 400 repliche e seed fisso.'],
      });
    }
  } else {
    const { main, effects, assumptions, nonParam, completePairs } = stats;

    tables.push({
      id: 'ttest-main',
      title: 'Test t per campioni appaiati',
      subtitle: `H₀: μ_diff = 0 · due code · α = ${(1 - level / 100).toFixed(2)}`,
      columns: [
        { key: 'comparison', label: 'Confronto', format: 'text' },
        { key: 'diff', label: 'Mean diff (A − B)', format: 'dec4' },
        { key: 'se', label: 'SE diff', format: 'dec4' },
        { key: 't', label: 't', format: 'dec3' },
        { key: 'df', label: 'df', format: 'dec2' },
        { key: 'p', label: 'p (2 code)', format: 'p' },
        { key: 'pOne', label: 'p (1 coda)', format: 'p' },
        { key: 'ciLo', label: 'CI low', format: 'dec4' },
        { key: 'ciHi', label: 'CI high', format: 'dec4' },
      ],
      rows: [
        {
          comparison: `${name1} − ${name2}`,
          ...main,
        },
      ],
      notes: [
        `Differenze calcolate riga per riga su ${completePairs} coppie complete; le righe con una cella mancante sono escluse dall’intero test.`,
        `CI: diff ± t(${level}%, df = ${main.df}) · SE.`,
      ],
    });

    tables.push({
      id: 'ttest-effects',
      title: 'Effect size',
      columns: [
        { key: 'measure', label: 'Misura', format: 'text' },
        { key: 'estimate', label: 'Stima', format: 'dec3' },
        { key: 'ciLo', label: 'CI low', format: 'dec3' },
        { key: 'ciHi', label: 'CI high', format: 'dec3' },
        { key: 'note', label: 'Interpretazione', format: 'text' },
      ],
      rows: [
        { measure: "Cohen's d_z", estimate: effects.d.estimate, ciLo: effects.d.ciLo, ciHi: effects.d.ciHi, note: interpretD(effects.d.estimate) },
        { measure: 'Hedges g_z', estimate: effects.hedgesG.estimate, ciLo: effects.hedgesG.ciLo, ciHi: effects.hedgesG.ciHi, note: interpretD(effects.hedgesG.estimate) },
        { measure: 'r tra le coppie', estimate: effects.r.estimate, ciLo: NaN, ciHi: NaN, note: interpretR(effects.r.estimate) },
        { measure: 'r²', estimate: effects.rSquared.estimate, ciLo: NaN, ciHi: NaN, note: 'quota di varianza condivisa' },
      ],
      notes: [
        'd_z = media delle differenze / SD delle differenze; SE(d_z) ≈ √(1/n + d_z²/(2n)).',
        'La correlazione tra le coppie descrive l’accoppiamento, non l’effetto del trattamento.',
      ],
    });

    tables.push({
      id: 'ttest-assumptions',
      title: 'Assunzioni',
      columns: [
        { key: 'check', label: 'Controllo', format: 'text' },
        { key: 'statistic', label: 'Statistica', format: 'dec4' },
        { key: 'df1', label: 'df1', format: 'dec2' },
        { key: 'df2', label: 'df2', format: 'dec2' },
        { key: 'p', label: 'p', format: 'p' },
        { key: 'note', label: 'Nota', format: 'text' },
      ],
      rows: [
        jarqueBeraRow('Jarque–Bera differenze', assumptions.jarqueBera),
        lillieforsRow('Lilliefors differenze', assumptions.lilliefors, 'normalità delle differenze'),
      ],
      notes: ['Il test t appaiato assume normalità delle differenze, non delle due variabili separatamente.'],
    });

    if (nonParam) {
      tables.push({
        id: 'ttest-wilcoxon',
        title: 'Wilcoxon signed-rank (non parametrico)',
        subtitle: 'H₀: mediana delle differenze = 0',
        columns: [
          { key: 'nEff', label: 'N effettivo', format: 'int' },
          { key: 'wPlus', label: 'W⁺', format: 'dec2' },
          { key: 'wMinus', label: 'W⁻', format: 'dec2' },
          { key: 'w', label: 'W', format: 'dec2' },
          { key: 'z', label: 'z', format: 'dec3' },
          { key: 'p', label: 'p', format: 'p' },
          { key: 'r', label: 'r = z/√N', format: 'dec3' },
          { key: 'rb', label: 'Rank-biserial', format: 'dec3' },
        ],
        rows: [
          { ...nonParam.wilcoxon },
        ],
        notes: ['Approssimazione normale con correzione di continuità e dei ranghi pari; differenze nulle escluse.'],
      });

      tables.push({
        id: 'ttest-hl',
        title: 'Hodges–Lehmann',
        columns: [
          { key: 'estimate', label: 'Stima', format: 'dec4' },
          { key: 'ciLo', label: 'CI low', format: 'dec4' },
          { key: 'ciHi', label: 'CI high', format: 'dec4' },
          { key: 'method', label: 'Metodo', format: 'text' },
        ],
        rows: [{ ...nonParam.hodgesLehmann, method: 'mediana delle differenze; CI bootstrap percentile' }],
        notes: ['CI bootstrap con 500 repliche e seed fisso.'],
      });
    }
  }

  return tables;
};
