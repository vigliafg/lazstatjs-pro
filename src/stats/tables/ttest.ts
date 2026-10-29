import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
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
    note: copy('JB su N = {s1}', { s1: stats.n }),
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
    title: copy('Campione e statistiche descrittive'),
    subtitle: copy('CI {s1}%', { s1: level }),
    columns: [
      { key: 'group', label: copy('Gruppo'), format: 'text' },
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'missing', label: copy('Missing'), format: 'int' },
      { key: 'mean', label: copy('Mean'), format: 'dec4' },
      { key: 'sd', label: copy('SD'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'median', label: copy('Median'), format: 'dec4' },
      { key: 'min', label: copy('Min'), format: 'dec4' },
      { key: 'max', label: copy('Max'), format: 'dec4' },
      { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
      { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
    ],
    rows: sampleRows(stats.samples, name1, name2),
    notes:
      stats.type === 'dep'
        ? [
            copy('Solo righe con entrambe le colonne numeriche: {s1} coppie complete, {s2} coppie escluse.', { s1: stats.completePairs, s2: stats.excludedPairs }),
            copy('Le statistiche descrittive dei gruppi sono calcolate sulle sole coppie complete, per coerenza con il test.'),
          ]
        : [copy('Missing = celle vuote o non numeriche escluse dal calcolo.')],
  });

  // -------------------------------------------------------------------------
  // Main test
  // -------------------------------------------------------------------------
  if (stats.type === 'one') {
    const { main, effects, assumptions, nonParam } = stats;

    tables.push({
      id: 'ttest-main',
      title: copy('Test t per un campione'),
      subtitle: copy('H₀: μ = {s1} · due code · α = {s2}', { s1: mu, s2: (1 - level / 100).toFixed(2) }),
      columns: [
        { key: 'comparison', label: copy('Confronto'), format: 'text' },
        { key: 'diff', label: copy('Mean − μ₀'), format: 'dec4' },
        { key: 'se', label: copy('SE diff'), format: 'dec4' },
        { key: 't', label: copy('t'), format: 'dec3' },
        { key: 'df', label: copy('df'), format: 'dec2' },
        { key: 'p', label: copy('p (2 code)'), format: 'p' },
        { key: 'pOne', label: copy('p (1 coda)'), format: 'p' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
      ],
      rows: [
        {
          comparison: copy('{s1} vs μ₀', { s1: name1 }),
          ...main,
        },
      ],
      notes: [
        copy('CI della differenza: (M − μ₀) ± t({s1}%, df = {s2}) · SE.', { s1: level, s2: main.df }),
        copy('p a una coda riferito alla direzione osservata (metà del p a due code).'),
      ],
    });

    tables.push({
      id: 'ttest-effects',
      title: copy('Effect size'),
      columns: [
        { key: 'measure', label: copy('Misura'), format: 'text' },
        { key: 'estimate', label: copy('Stima'), format: 'dec3' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec3' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec3' },
        { key: 'note', label: copy('Interpretazione'), format: 'text' },
      ],
      rows: [
        { measure: copy("Cohen's d (one-sample)"), estimate: effects.d.estimate, ciLo: effects.d.ciLo, ciHi: effects.d.ciHi, note: interpretD(effects.d.estimate) },
        { measure: copy('Hedges g'), estimate: effects.hedgesG.estimate, ciLo: effects.hedgesG.ciLo, ciHi: effects.hedgesG.ciHi, note: interpretD(effects.hedgesG.estimate) },
        { measure: copy('r punto-biseriale'), estimate: effects.r.estimate, ciLo: NaN, ciHi: NaN, note: interpretR(effects.r.estimate) },
        { measure: copy('r²'), estimate: effects.rSquared.estimate, ciLo: NaN, ciHi: NaN, note: copy('quota di varianza spiegata') },
      ],
      notes: [
        copy("d = (M − μ₀) / SD; SE(d) ≈ √(1/N + d²/(2N)); CI normale approssimato."),
        copy('Hedges g applica il fattore di correzione per campioni piccoli J = 1 − 3/(4N − 5).'),
      ],
    });

    tables.push({
      id: 'ttest-assumptions',
      title: copy('Assunzioni'),
      columns: [
        { key: 'check', label: copy('Controllo'), format: 'text' },
        { key: 'statistic', label: copy('Statistica'), format: 'dec4' },
        { key: 'df1', label: copy('df1'), format: 'dec2' },
        { key: 'df2', label: copy('df2'), format: 'dec2' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'note', label: copy('Nota'), format: 'text' },
      ],
      rows: [
        jarqueBeraRow('Jarque–Bera', assumptions.jarqueBera),
        lillieforsRow(copy('Lilliefors (KS)'), assumptions.lilliefors, copy('normalità con parametri stimati')),
      ],
      notes: [copy('Con N piccolo i test di normalità hanno potenza limitata: valutare anche il Q-Q plot.')],
    });

    if (nonParam) {
      tables.push({
        id: 'ttest-wilcoxon',
        title: copy('Wilcoxon signed-rank (non parametrico)'),
        subtitle: copy('H₀: mediana = {s1}', { s1: mu }),
        columns: [
          { key: 'nEff', label: copy('N effettivo'), format: 'int' },
          { key: 'wPlus', label: copy('W⁺'), format: 'dec2' },
          { key: 'wMinus', label: copy('W⁻'), format: 'dec2' },
          { key: 'w', label: copy('W'), format: 'dec2' },
          { key: 'z', label: copy('z'), format: 'dec3' },
          { key: 'p', label: copy('p'), format: 'p' },
          { key: 'r', label: copy('r = z/√N'), format: 'dec3' },
          { key: 'rb', label: copy('Rank-biserial'), format: 'dec3' },
        ],
        rows: [
          { ...nonParam.wilcoxon },
        ],
        notes: [
          copy('Approssimazione normale con correzione di continuità e correzione per i ranghi pari; differenze nulle escluse.'),
          copy('W riportato = min(W⁺, W⁻); r = z/√N è la dimensione dell’effetto; rank-biserial = (W⁺ − W⁻)/(W⁺ + W⁻).'),
        ],
      });
      tables.push({
        id: 'ttest-hl',
        title: copy('Hodges–Lehmann'),
        columns: [
          { key: 'estimate', label: copy('Stima'), format: 'dec4' },
          { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
          { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
          { key: 'method', label: copy('Metodo'), format: 'text' },
        ],
        rows: [{ ...nonParam.hodgesLehmann, method: copy('mediana delle differenze; CI bootstrap percentile') }],
        notes: [copy('CI bootstrap con 500 repliche e seed fisso; può differire leggermente da software che usa il metodo esatto.')],
      });
    }
  } else if (stats.type === 'ind') {
    const { main, effects, assumptions, nonParam } = stats;

    tables.push({
      id: 'ttest-main',
      title: options.equalVar ? copy('Test t per campioni indipendenti (varianze uguali)') : copy('Test t di Welch (varianze diseguali)'),
      subtitle: copy('H₀: μ₁ = μ₂ · due code · α = {s1}', { s1: (1 - level / 100).toFixed(2) }),
      columns: [
        { key: 'comparison', label: copy('Confronto'), format: 'text' },
        { key: 'diff', label: copy('Mean diff (A − B)'), format: 'dec4' },
        { key: 'se', label: copy('SE diff'), format: 'dec4' },
        { key: 't', label: copy('t'), format: 'dec3' },
        { key: 'df', label: copy('df'), format: 'dec2' },
        { key: 'p', label: copy('p (2 code)'), format: 'p' },
        { key: 'pOne', label: copy('p (1 coda)'), format: 'p' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
      ],
      rows: [
        {
          comparison: copy('{s1} − {s2}', { s1: name1, s2: name2 }),
          ...main,
        },
      ],
      notes: [
        options.equalVar
          ? copy('Varianza pooled: sp² = ((n₁−1)s₁² + (n₂−1)s₂²)/(n₁+n₂−2); df = {s1}.', { s1: main.df })
          : copy('Welch–Satterthwaite: SE = √(s₁²/n₁ + s₂²/n₂); df = {s1}.', { s1: fmtEst(main.df, 2) }),
        copy('CI della differenza: diff ± t({s1}%, df) · SE.', { s1: level }),
      ],
    });

    tables.push({
      id: 'ttest-effects',
      title: copy('Effect size'),
      columns: [
        { key: 'measure', label: copy('Misura'), format: 'text' },
        { key: 'estimate', label: copy('Stima'), format: 'dec3' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec3' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec3' },
        { key: 'note', label: copy('Interpretazione'), format: 'text' },
      ],
      rows: [
        { measure: copy("Cohen's d (pooled)"), estimate: effects.d.estimate, ciLo: effects.d.ciLo, ciHi: effects.d.ciHi, note: interpretD(effects.d.estimate) },
        { measure: copy('Hedges g'), estimate: effects.hedgesG.estimate, ciLo: effects.hedgesG.ciLo, ciHi: effects.hedgesG.ciHi, note: interpretD(effects.hedgesG.estimate) },
        { measure: copy('Glass Δ (SD gruppo A)'), estimate: effects.glass.estimate, ciLo: NaN, ciHi: NaN, note: interpretD(effects.glass.estimate) },
        { measure: copy('r punto-biseriale'), estimate: effects.r.estimate, ciLo: NaN, ciHi: NaN, note: interpretR(effects.r.estimate) },
        { measure: copy('r²'), estimate: effects.rSquared.estimate, ciLo: NaN, ciHi: NaN, note: copy('quota di varianza spiegata') },
      ],
      notes: [
        copy('d = (M₁ − M₂)/sp; SE(d) ≈ √((n₁+n₂)/(n₁n₂) + d²/(2(n₁+n₂))).'),
        copy('Hedges g = d · J, J = 1 − 3/(4(n₁+n₂) − 9). Glass usa la SD del gruppo A come riferimento.'),
      ],
    });

    tables.push({
      id: 'ttest-assumptions',
      title: copy('Assunzioni'),
      columns: [
        { key: 'check', label: copy('Controllo'), format: 'text' },
        { key: 'statistic', label: copy('Statistica'), format: 'dec4' },
        { key: 'df1', label: copy('df1'), format: 'dec2' },
        { key: 'df2', label: copy('df2'), format: 'dec2' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'note', label: copy('Nota'), format: 'text' },
      ],
      rows: [
        { check: copy('Levene (media)'), ...assumptions.levene, note: copy('omoschedasticità') },
        { check: copy('Brown–Forsythe (mediana)'), ...assumptions.brownForsythe, note: copy('robusto agli outlier') },
        jarqueBeraRow(copy('Jarque–Bera {s1}', { s1: name1 }), assumptions.jarqueBeraA),
        jarqueBeraRow(copy('Jarque–Bera {s1}', { s1: name2 }), assumptions.jarqueBeraB),
      ],
      notes: [
        assumptions.levene.p < 0.05
          ? copy('Levene significativo: l’assunzione di varianze uguali è dubbia, preferire Welch.')
          : copy('Nessuna evidenza di eteroschedasticità a questo livello.'),
      ],
    });

    if (nonParam) {
      const { groupA, groupB } = nonParam.mannWhitney;

      tables.push({
        id: 'ttest-mannwhitney',
        title: copy('Mann–Whitney U (non parametrico)'),
        columns: [
          { key: 'group', label: copy('Gruppo'), format: 'text' },
          { key: 'n', label: copy('N'), format: 'int' },
          { key: 'rankSum', label: copy('Rank sum'), format: 'dec2' },
          { key: 'meanRank', label: copy('Mean rank'), format: 'dec2' },
          { key: 'u', label: copy('U'), format: 'dec2' },
          { key: 'z', label: copy('z'), format: 'dec3' },
          { key: 'p', label: copy('p'), format: 'p' },
          { key: 'cles', label: copy('CLES'), format: 'dec3' },
          { key: 'rb', label: copy('Rank-biserial'), format: 'dec3' },
        ],
        rows: [
          { group: name1, ...groupA },
          { group: name2, ...groupB },
        ],
        notes: [
          copy('U riportato per ciascun gruppo (U₁ + U₂ = n₁·n₂); la significatività usa U = min(U₁, U₂) con approssimazione normale, correzione di continuità e correzione dei ranghi pari.'),
          copy('CLES = U₁/(n₁n₂) = probabilità che un valore del gruppo A superi uno del gruppo B; rank-biserial = 2·CLES − 1.'),
        ],
      });

      tables.push({
        id: 'ttest-hl',
        title: copy('Hodges–Lehmann'),
        columns: [
          { key: 'estimate', label: copy('Stima (A − B)'), format: 'dec4' },
          { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
          { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
          { key: 'method', label: copy('Metodo'), format: 'text' },
        ],
        rows: [{ ...nonParam.hodgesLehmann, method: copy('mediana di tutte le differenze A − B; CI bootstrap percentile') }],
        notes: [copy('CI bootstrap con 400 repliche e seed fisso.')],
      });
    }
  } else {
    const { main, effects, assumptions, nonParam, completePairs } = stats;

    tables.push({
      id: 'ttest-main',
      title: copy('Test t per campioni appaiati'),
      subtitle: copy('H₀: μ_diff = 0 · due code · α = {s1}', { s1: (1 - level / 100).toFixed(2) }),
      columns: [
        { key: 'comparison', label: copy('Confronto'), format: 'text' },
        { key: 'diff', label: copy('Mean diff (A − B)'), format: 'dec4' },
        { key: 'se', label: copy('SE diff'), format: 'dec4' },
        { key: 't', label: copy('t'), format: 'dec3' },
        { key: 'df', label: copy('df'), format: 'dec2' },
        { key: 'p', label: copy('p (2 code)'), format: 'p' },
        { key: 'pOne', label: copy('p (1 coda)'), format: 'p' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
      ],
      rows: [
        {
          comparison: copy('{s1} − {s2}', { s1: name1, s2: name2 }),
          ...main,
        },
      ],
      notes: [
        copy('Differenze calcolate riga per riga su {s1} coppie complete; le righe con una cella mancante sono escluse dall’intero test.', { s1: completePairs }),
        copy('CI: diff ± t({s1}%, df = {s2}) · SE.', { s1: level, s2: main.df }),
      ],
    });

    tables.push({
      id: 'ttest-effects',
      title: copy('Effect size'),
      columns: [
        { key: 'measure', label: copy('Misura'), format: 'text' },
        { key: 'estimate', label: copy('Stima'), format: 'dec3' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec3' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec3' },
        { key: 'note', label: copy('Interpretazione'), format: 'text' },
      ],
      rows: [
        { measure: copy("Cohen's d_z"), estimate: effects.d.estimate, ciLo: effects.d.ciLo, ciHi: effects.d.ciHi, note: interpretD(effects.d.estimate) },
        { measure: copy('Hedges g_z'), estimate: effects.hedgesG.estimate, ciLo: effects.hedgesG.ciLo, ciHi: effects.hedgesG.ciHi, note: interpretD(effects.hedgesG.estimate) },
        { measure: copy('r tra le coppie'), estimate: effects.r.estimate, ciLo: NaN, ciHi: NaN, note: interpretR(effects.r.estimate) },
        { measure: copy('r²'), estimate: effects.rSquared.estimate, ciLo: NaN, ciHi: NaN, note: copy('quota di varianza condivisa') },
      ],
      notes: [
        copy('d_z = media delle differenze / SD delle differenze; SE(d_z) ≈ √(1/n + d_z²/(2n)).'),
        copy('La correlazione tra le coppie descrive l’accoppiamento, non l’effetto del trattamento.'),
      ],
    });

    tables.push({
      id: 'ttest-assumptions',
      title: copy('Assunzioni'),
      columns: [
        { key: 'check', label: copy('Controllo'), format: 'text' },
        { key: 'statistic', label: copy('Statistica'), format: 'dec4' },
        { key: 'df1', label: copy('df1'), format: 'dec2' },
        { key: 'df2', label: copy('df2'), format: 'dec2' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'note', label: copy('Nota'), format: 'text' },
      ],
      rows: [
        jarqueBeraRow(copy('Jarque–Bera differenze'), assumptions.jarqueBera),
        lillieforsRow(copy('Lilliefors differenze'), assumptions.lilliefors, copy('normalità delle differenze')),
      ],
      notes: [copy('Il test t appaiato assume normalità delle differenze, non delle due variabili separatamente.')],
    });

    if (nonParam) {
      tables.push({
        id: 'ttest-wilcoxon',
        title: copy('Wilcoxon signed-rank (non parametrico)'),
        subtitle: copy('H₀: mediana delle differenze = 0'),
        columns: [
          { key: 'nEff', label: copy('N effettivo'), format: 'int' },
          { key: 'wPlus', label: copy('W⁺'), format: 'dec2' },
          { key: 'wMinus', label: copy('W⁻'), format: 'dec2' },
          { key: 'w', label: copy('W'), format: 'dec2' },
          { key: 'z', label: copy('z'), format: 'dec3' },
          { key: 'p', label: copy('p'), format: 'p' },
          { key: 'r', label: copy('r = z/√N'), format: 'dec3' },
          { key: 'rb', label: copy('Rank-biserial'), format: 'dec3' },
        ],
        rows: [
          { ...nonParam.wilcoxon },
        ],
        notes: [copy('Approssimazione normale con correzione di continuità e dei ranghi pari; differenze nulle escluse.')],
      });

      tables.push({
        id: 'ttest-hl',
        title: copy('Hodges–Lehmann'),
        columns: [
          { key: 'estimate', label: copy('Stima'), format: 'dec4' },
          { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
          { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
          { key: 'method', label: copy('Metodo'), format: 'text' },
        ],
        rows: [{ ...nonParam.hodgesLehmann, method: copy('mediana delle differenze; CI bootstrap percentile') }],
        notes: [copy('CI bootstrap con 500 repliche e seed fisso.')],
      });
    }
  }

  return tables;
};
