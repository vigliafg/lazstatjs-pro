import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { IvResult } from '../kernels/iv';

export interface IvNames {
  dep: string;
  endog: string[];
  instruments: string[];
  exog: string[];
}

/**
 * Tables for a 2SLS run: structural equation, first stage with the partial F
 * of the excluded instruments, and the diagnostics (Sargan, Wu–Hausman, R²,
 * sigma).
 *
 * The kernel labels its columns positionally (`exog1`, `endog1`,
 * `instrument1`); the table swaps in the grid column names so the output reads
 * like the model the user specified.
 */
export const ivTables = (fit: IvResult, names: IvNames, level: number): TableSpec[] => {
  const structuralTerms = ['(Intercept)', ...names.exog, ...names.endog];
  const instrumentTerms = ['(Intercept)', ...names.exog, ...names.instruments];

  const structuralRows = fit.coefficients.map((value, index) => ({
    term: structuralTerms[index] ?? value.term,
    beta: value.beta,
    se: value.se,
    t: value.t,
    p: value.p,
    ciLo: value.ciLo,
    ciHi: value.ciHi,
  }));

  const firstStageRows = fit.firstStage.flatMap((stage, stageIndex) => {
    const instrumentStart = 1 + names.exog.length;
    return stage.coefficients.slice(instrumentStart).map((value, index) => ({
      endog: names.endog[stageIndex] ?? stage.endog,
      term: instrumentTerms[instrumentStart + index] ?? value.term,
      beta: value.beta,
      se: value.se,
      t: value.t,
      p: value.p,
      f: index === 0 ? stage.f : null,
      df1: index === 0 ? stage.df1 : null,
      df2: index === 0 ? stage.df2 : null,
      pF: index === 0 ? stage.p : null,
    }));
  });

  const diagnosticRows = [
    { metric: copy('Osservazioni'), value: String(fit.n), df: null as string | null, p: null as number | null },
    { metric: 'R²', value: fit.r2.toFixed(4), df: null, p: null },
    { metric: copy('R² corretto'), value: fit.adjR2.toFixed(4), df: null, p: null },
    { metric: copy('Sigma'), value: fit.sigma.toFixed(4), df: null, p: null },
    {
      metric: 'Sargan',
      value: fit.sargan ? fit.sargan.statistic.toFixed(4) : null,
      df: fit.sargan ? String(fit.sargan.df) : null,
      p: fit.sargan?.p ?? null,
    },
    {
      metric: 'Wu–Hausman',
      value: fit.wuHausman ? fit.wuHausman.statistic.toFixed(4) : null,
      df: fit.wuHausman ? `${fit.wuHausman.df1}; ${fit.wuHausman.df2}` : null,
      p: fit.wuHausman?.p ?? null,
    },
  ];

  return [
    {
      id: 'iv-structural',
      title: copy('Equazione strutturale'),
      subtitle: copy('{s1} · 2SLS · CI {s2}%', { s1: names.dep, s2: level }),
      columns: [
        { key: 'term', label: copy('Termine'), format: 'text' },
        { key: 'beta', label: copy('B'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 't', label: copy('t'), format: 'dec3' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
      ],
      rows: structuralRows,
      notes: [
        copy('I coefficienti sono stimati con i minimi quadrati a due stadi: ogni regressore endogeno è sostituito dai valori stimati nel primo stadio.'),
        copy('L’interpretazione è quella di una regressione lineare, ma la validità dipende dagli strumenti: devono essere rilevanti ed esclusi dal modello strutturale.'),
      ],
    },
    {
      id: 'iv-first-stage',
      title: copy('Primo stadio'),
      subtitle: copy('Coefficienti degli strumenti esclusi e F parziale'),
      columns: [
        { key: 'endog', label: copy('Endogeno'), format: 'text' },
        { key: 'term', label: copy('Strumento'), format: 'text' },
        { key: 'beta', label: copy('B'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 't', label: copy('t'), format: 'dec3' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'f', label: copy('F'), format: 'dec3' },
        { key: 'pF', label: copy('p(F)'), format: 'p' },
      ],
      rows: firstStageRows,
      notes: [
        copy('F e p(F) si riferiscono agli strumenti esclusi e compaiono sulla prima riga di ciascun regressore endogeno.'),
        copy('Un F parziale basso segnala strumenti deboli: le stime 2SLS diventano distorte e gli errori standard troppo piccoli.'),
      ],
    },
    {
      id: 'iv-diagnostics',
      title: copy('Diagnostica'),
      subtitle: copy('{s1} · 2SLS', { s1: names.dep }),
      columns: [
        { key: 'metric', label: copy('Metrica'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'text' },
        { key: 'df', label: copy('df'), format: 'text' },
        { key: 'p', label: copy('p'), format: 'p' },
      ],
      rows: diagnosticRows,
      notes: [
        copy('Sargan verifica la validità congiunta degli strumenti quando il modello è sovraidentificato; Wu–Hausman verifica l’esogeneità dei regressori endogeni.'),
        copy('Con identificazione esatta (numero di strumenti uguale al numero di endogeni) i due test non sono calcolabili e compaiono come “—”.'),
      ],
    },
  ];
};
