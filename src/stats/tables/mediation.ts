import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { TableSpec } from '../types';
import type { MediationResult } from '../kernels/mediation';

export interface MediationTableNames {
  outcome: string;
  predictor: string;
  mediator: string;
}

const effectRows = (result: MediationResult): TableSpec['rows'] => [
  {
    effect: copy('Effetto indiretto (a·b)'),
    estimate: result.effects.indirect.estimate,
    se: result.effects.indirect.se,
    lo: result.effects.indirect.lo,
    hi: result.effects.indirect.hi,
  },
  {
    effect: copy('Effetto diretto (c′)'),
    estimate: result.effects.direct.estimate,
    se: result.effects.direct.se,
    lo: result.effects.direct.lo,
    hi: result.effects.direct.hi,
  },
  {
    effect: copy('Effetto totale (c)'),
    estimate: result.effects.total.estimate,
    se: result.effects.total.se,
    lo: result.effects.total.lo,
    hi: result.effects.total.hi,
  },
  {
    effect: copy('Proporzione mediata'),
    estimate: result.effects.proportion.estimate,
    se: result.effects.proportion.se,
    lo: result.effects.proportion.lo,
    hi: result.effects.proportion.hi,
  },
];

/**
 * Tables of the mediation run.
 *
 * Paths and effects are kept separate: the first table is the three regression
 * equations with the usual coefficient scale, the second is the decomposition
 * of the total effect. The bootstrap table reports only the percentile
 * interval of the indirect effect; the fit table collects the sample size and
 * the R² of the mediator, outcome and total-effect models.
 */
export const mediationTables = (
  result: MediationResult,
  names: MediationTableNames,
  level: number
): TableSpec[] => {
  const tables: TableSpec[] = [
    {
      id: 'mediation-paths',
      title: copy('Percorsi della mediazione'),
      subtitle: copy('{s1} → {s2} → {s3} · CI {s4}%', {
        s1: names.predictor,
        s2: names.mediator,
        s3: names.outcome,
        s4: level,
      }),
      columns: [
        { key: 'path', label: copy('Percorso'), format: 'text' },
        { key: 'description', label: copy('Relazione'), format: 'text' },
        { key: 'beta', label: copy('Coefficiente'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 't', label: copy('z'), format: 'dec4' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
      ],
      rows: [
        {
          path: 'a',
          description: copy('{s1} → {s2}', { s1: names.predictor, s2: names.mediator }),
          beta: result.paths.a.beta,
          se: result.paths.a.se,
          t: result.paths.a.t,
          p: result.paths.a.p,
          ciLo: result.paths.a.lo,
          ciHi: result.paths.a.hi,
        },
        {
          path: 'b',
          description: copy('{s1} → {s2}', { s1: names.mediator, s2: names.outcome }),
          beta: result.paths.b.beta,
          se: result.paths.b.se,
          t: result.paths.b.t,
          p: result.paths.b.p,
          ciLo: result.paths.b.lo,
          ciHi: result.paths.b.hi,
        },
        {
          path: 'c′',
          description: copy('{s1} → {s2} (diretto)', {
            s1: names.predictor,
            s2: names.outcome,
          }),
          beta: result.paths.cPrime.beta,
          se: result.paths.cPrime.se,
          t: result.paths.cPrime.t,
          p: result.paths.cPrime.p,
          ciLo: result.paths.cPrime.lo,
          ciHi: result.paths.cPrime.hi,
        },
        {
          path: 'c',
          description: copy('{s1} → {s2} (totale)', {
            s1: names.predictor,
            s2: names.outcome,
          }),
          beta: result.paths.cTotal.beta,
          se: result.paths.cTotal.se,
          t: result.paths.cTotal.t,
          p: result.paths.cTotal.p,
          ciLo: result.paths.cTotal.lo,
          ciHi: result.paths.cTotal.hi,
        },
      ],
      notes: [
        copy('a è la pendenza del mediatore sul predittore; b è il coefficiente del mediatore nell’equazione dell’esito; c′ è l’effetto diretto del predittore al netto del mediatore.'),
        copy('c è l’effetto totale del predittore sull’esito, stimato senza il mediatore. Nel modello lineare senza interazione deve coincidere con c′ + a·b.'),
        copy('Gli errori standard sono delta/ML (varianza residua divisa per n), come nella reference lavaan; p e intervalli sono normali a due code.'),
      ],
    },
    {
      id: 'mediation-effects',
      title: copy('Scomposizione degli effetti'),
      subtitle: copy('CI {s1}% · indiretto = a·b', { s1: level }),
      columns: [
        { key: 'effect', label: copy('Effetto'), format: 'text' },
        { key: 'estimate', label: copy('Stima'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 'lo', label: copy('CI low'), format: 'dec4' },
        { key: 'hi', label: copy('CI high'), format: 'dec4' },
      ],
      rows: effectRows(result),
      notes: [
        copy('L’effetto indiretto è il prodotto a·b; il suo errore standard è quello di Sobel e l’intervallo è normale.'),
        copy('La proporzione mediata è indiretto / totale: se il totale è vicino a zero il rapporto non è stabile e viene riportato come non calcolabile.'),
        copy('Il bootstrap percentile dell’effetto indiretto è riportato nella tabella dedicata e non coincide necessariamente con l’intervallo di Sobel.'),
      ],
    },
  ];

  if (result.bootstrap) {
    const { samples } = result.bootstrap;
    const mean = samples.reduce((sum, value) => sum + value, 0) / Math.max(1, samples.length);
    const variance =
      samples.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) /
      Math.max(1, samples.length - 1);
    tables.push({
      id: 'mediation-bootstrap',
      title: copy('Bootstrap dell’effetto indiretto'),
      subtitle: copy('{s1} replicazioni · IC percentile {s2}%', {
        s1: result.bootstrap.reps,
        s2: level,
      }),
      columns: [
        { key: 'metric', label: copy('Metrica'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'text' },
      ],
      rows: [
        { metric: copy('Replicazioni'), value: String(result.bootstrap.reps) },
        { metric: copy('Seme'), value: String(result.bootstrap.seed) },
        { metric: copy('Stima indiretta'), value: fmtEst(result.effects.indirect.estimate, 4) },
        { metric: copy('IC low'), value: fmtEst(result.bootstrap.ciLo, 4) },
        { metric: copy('IC high'), value: fmtEst(result.bootstrap.ciHi, 4) },
        { metric: copy('SE bootstrap'), value: fmtEst(Math.sqrt(Math.max(0, variance)), 4) },
      ],
      notes: [
        copy('Il bootstrap ricampiona righe complete con reimmissione e rifitta entrambe le equazioni; le replicazioni non finite vengono scartate.'),
        copy('L’intervallo è percentile (2,5–97,5%): non usa la normalità e può essere asimmetrico.'),
      ],
    });
  }

  tables.push({
    id: 'mediation-fit',
    title: copy('Adattamento dei modelli'),
    subtitle: copy('{s1} osservazioni complete', { s1: result.n }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Osservazioni'), value: String(result.n) },
      { metric: copy('R² modello mediatore'), value: fmtEst(result.fit.r2Mediator, 4) },
      { metric: copy('R² modello esito'), value: fmtEst(result.fit.r2Outcome, 4) },
      { metric: copy('R² modello totale'), value: fmtEst(result.fit.r2Total, 4) },
      {
        metric: copy('Coerenza c = c′ + a·b'),
        value: fmtEst(
          result.paths.cTotal.beta -
            (result.paths.cPrime.beta + result.paths.a.beta * result.paths.b.beta),
          6
        ),
      },
    ],
    notes: [
      copy('Il modello mediatore spiega il mediatore con il predittore e le covariate; il modello esito aggiunge il mediatore.'),
      copy('La riga di coerenza è la differenza numerica tra l’effetto totale stimato e la somma c′ + a·b: deve essere circa zero.'),
    ],
  });

  return tables;
};
