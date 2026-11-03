import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { TableSpec } from '../types';
import type { PanelResult } from '../kernels/panel';

export interface PanelTableNames {
  dep: string;
  predictors: string[];
}

/**
 * Tables of a panel run.
 *
 * The kernel labels its columns positionally (`x1`, `x2`, …) because it knows
 * nothing about the grid; the tables swap in the user's column names and label
 * the RE intercept as `(Intercept)`, the convention used by every other
 * regression report.
 *
 * Five blocks are possible and follow what the user asked for: the within fit
 * (FE), the Swamy–Arora fit (RE), the variance components with theta, the
 * Hausman test and the fit summary.
 */
export const panelTables = (
  result: PanelResult,
  names: PanelTableNames,
  level: number
): TableSpec[] => {
  const termName = (term: string, index: number): string =>
    term === '(Intercept)' ? copy('(Intercept)') : names.predictors[index] ?? term;

  const tables: TableSpec[] = [];

  if (result.fe) {
    const fit = result.fe;
    const offset = fit.terms[0] === '(Intercept)' ? 1 : 0;
    tables.push({
      id: 'panel-fe',
      title: copy('Effetti fissi (within)'),
      subtitle: copy('{s1} · SE cluster per entità · CI {s2}%', {
        s1: names.dep,
        s2: level,
      }),
      columns: [
        { key: 'term', label: copy('Termine'), format: 'text' },
        { key: 'beta', label: copy('B'), format: 'dec4' },
        { key: 'se', label: copy('SE cluster'), format: 'dec4' },
        { key: 'seClassic', label: copy('SE classica'), format: 'dec4' },
        { key: 't', label: copy('t'), format: 'dec3' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
      ],
      rows: fit.coefficients.map((coefficient, index) => ({
        term: termName(coefficient.term, index - offset),
        beta: coefficient.beta,
        se: coefficient.se,
        seClassic: coefficient.seClassic,
        t: coefficient.t,
        p: coefficient.p,
        ciLo: coefficient.ciLo,
        ciHi: coefficient.ciHi,
      })),
      notes: [
        copy('Gli effetti fissi eliminano il livello medio di ogni entità: i coefficienti misurano solo la variazione entro entità, al netto delle differenze stabili nel tempo.'),
        copy('Gli errori standard principali sono cluster-robust per entità (HC1, tipo Arellano): correggono l’autocorrelazione dentro la stessa entità.'),
        copy('La SE classica assume residui indipendenti e omoschedastici ed è riportata per confronto: è la base del test di Hausman.'),
      ],
    });
  }

  if (result.re) {
    const fit = result.re;
    const offset = fit.terms[0] === '(Intercept)' ? 1 : 0;
    tables.push({
      id: 'panel-re',
      title: copy('Effetti casuali (Swamy–Arora)'),
      subtitle: copy('{s1} · quasi-demeaning · CI {s2}%', {
        s1: names.dep,
        s2: level,
      }),
      columns: [
        { key: 'term', label: copy('Termine'), format: 'text' },
        { key: 'beta', label: copy('B'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 'seCluster', label: copy('SE cluster'), format: 'dec4' },
        { key: 'z', label: copy('z'), format: 'dec3' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
      ],
      rows: fit.coefficients.map((coefficient, index) => ({
        term: termName(coefficient.term, index - offset),
        beta: coefficient.beta,
        se: coefficient.se,
        seCluster: coefficient.seCluster,
        z: coefficient.t,
        p: coefficient.p,
        ciLo: coefficient.ciLo,
        ciHi: coefficient.ciHi,
      })),
      notes: [
        copy('Il modello a effetti casuali tratta il livello di ogni entità come una estrazione casuale da una popolazione: usa la variazione tra entità e quella entro entità.'),
        copy('La trasformazione (quasi-demeaning) sottrae a ogni osservazione una quota θ della media di entità; θ vale zero quando la varianza tra entità è nulla e uno quando è dominante.'),
        copy('Gli errori standard principali sono quelli classici di plm: la scala è la varianza residua del modello trasformato, non la varianza entro entità.'),
        copy('La SE cluster per entità è riportata per confronto: corregge l’autocorrelazione dentro l’entità e rende le inferenze più prudenti.'),
      ],
    });
  }

  const thetaValues = result.theta.filter(value => Number.isFinite(value));
  const thetaMinimum = thetaValues.length > 0 ? Math.min(...thetaValues) : Number.NaN;
  const thetaMaximum = thetaValues.length > 0 ? Math.max(...thetaValues) : Number.NaN;
  const thetaCommon =
    thetaValues.length > 0 && Math.abs(thetaMaximum - thetaMinimum) < 1e-9
      ? fmtEst(thetaMinimum, 4)
      : `${fmtEst(thetaMinimum, 4)} – ${fmtEst(thetaMaximum, 4)}`;

  tables.push({
    id: 'panel-variance',
    title: copy('Componenti di varianza'),
    subtitle: names.dep,
    columns: [
      { key: 'component', label: copy('Componente'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      {
        component: copy('σ² idiosincratico (entro entità)'),
        value: fmtEst(result.variance.idiosyncratic, 4),
      },
      {
        component: copy('σ² entità (tra entità)'),
        value: fmtEst(result.variance.entity, 4),
      },
      { component: copy('θ (quasi-demeaning)'), value: thetaCommon },
    ],
    notes: [
      copy('σ² idiosincratico misura la variabilità non spiegata dentro ogni entità; σ² entità misura quanto i livelli medi differiscono tra loro.'),
      copy('θ combina le due componenti con il numero di periodi: serve alla trasformazione del modello a effetti casuali.'),
    ],
  });

  if (result.hausman) {
    const test = result.hausman;
    tables.push({
      id: 'panel-hausman',
      title: copy('Test di Hausman'),
      subtitle: copy('FE contro RE · χ² con {s1} gradi di libertà', { s1: test.df }),
      columns: [
        { key: 'statistic', label: copy('Statistica'), format: 'dec4' },
        { key: 'df', label: copy('df'), format: 'int' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'verdict', label: copy('Esito'), format: 'text' },
      ],
      rows: [
        {
          statistic: test.statistic,
          df: test.df,
          p: test.p,
          verdict: test.valid
            ? copy('Differenza tra le covarianze definita positiva')
            : copy('Differenza tra le covarianze non definita positiva'),
        },
      ],
      notes: [
        copy('Hausman confronta FE e RE: sotto l’ipotesi nulla gli effetti di entità non sono correlati con i regressori e il modello RE è il più efficiente.'),
        copy('Con p basso la stima RE non è coerente e conviene il modello a effetti fissi.'),
        test.valid
          ? copy('La differenza tra le due matrici di covarianza è definita positiva: la statistica è un’autentica forma quadratica.')
          : copy('La differenza tra le due matrici di covarianza non è definita positiva: il test non è affidabile e la statistica va letta solo come diagnostica.'),
      ],
    });
  }

  const fitRows: { metric: string; value: string }[] = [
    { metric: copy('Osservazioni'), value: String(result.n) },
    { metric: copy('Entità'), value: String(result.entities) },
    { metric: copy('Periodi'), value: String(result.periods) },
    { metric: copy('Panel bilanciato'), value: result.balanced ? copy('sì') : copy('no') },
  ];
  for (const [fit, label] of [
    [result.fe, copy('FE')],
    [result.re, copy('RE')],
  ] as const) {
    if (!fit) continue;
    fitRows.push(
      { metric: copy('R² within ({s1})', { s1: label }), value: fmtEst(fit.r2Within, 4) },
      { metric: copy('R² between ({s1})', { s1: label }), value: fmtEst(fit.r2Between, 4) },
      { metric: copy('R² overall ({s1})', { s1: label }), value: fmtEst(fit.r2Overall, 4) }
    );
  }

  tables.push({
    id: 'panel-fit',
    title: copy('Adattamento del modello panel'),
    subtitle: copy('{s1} · {s2} entità · {s3} periodi', {
      s1: names.dep,
      s2: result.entities,
      s3: result.periods,
    }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: fitRows,
    notes: [
      copy('R² within usa solo la variazione entro entità, R² between solo le medie di entità, R² overall l’intera variabilità rispetto alla media generale.'),
      copy('I tre R² non sono confrontabili tra loro: un modello può spiegare bene le differenze tra entità e male la dinamica dentro le entità, o viceversa.'),
    ],
  });

  return tables;
};
