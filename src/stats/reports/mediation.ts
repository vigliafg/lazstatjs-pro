import { copy } from '../reportCopy';
import type { ReportSpec } from './shared';
import {
  alphaText,
  describeP,
  isDecided,
  num,
  rowBy,
  rowsOf,
  show,
  showCI,
  text,
} from './shared';
import type { TableSpec } from '../types';

const numericText = (row: ReturnType<typeof rowBy>, key: string): number => {
  const raw = text(row, key);
  if (raw.trim() === '') return Number.NaN;
  const value = Number(raw);
  return Number.isFinite(value) ? value : Number.NaN;
};

/**
 * Report discorsivo della mediazione.
 *
 * Legge solo le righe delle tabelle già mostrate all'utente: niente kernel,
 * niente ricalcolo, così la prosa non può divergere dai numeri.
 */
export const mediationReport = (tables: TableSpec[], level: number): ReportSpec => {
  const pathRows = rowsOf(tables, 'mediation-paths');
  const effectRows = rowsOf(tables, 'mediation-effects');
  const bootstrapRows = rowsOf(tables, 'mediation-bootstrap');
  const fitRows = rowsOf(tables, 'mediation-fit');

  const path = (code: string) => rowBy(pathRows, 'path', code);
  const effect = (label: string) => rowBy(effectRows, 'effect', copy(label));

  const pathA = path('a');
  const pathB = path('b');
  const direct = path('c′');
  const total = path('c');
  const indirect = effect('Effetto indiretto (a·b)');
  const proportion = effect('Proporzione mediata');

  const observations = numericText(rowBy(fitRows, 'metric', copy('Osservazioni')), 'value');
  const r2Mediator = numericText(rowBy(fitRows, 'metric', copy('R² modello mediatore')), 'value');
  const r2Outcome = numericText(rowBy(fitRows, 'metric', copy('R² modello esito')), 'value');
  const r2Total = numericText(rowBy(fitRows, 'metric', copy('R² modello totale')), 'value');
  const coherence = numericText(
    rowBy(fitRows, 'metric', copy('Coerenza c = c′ + a·b')),
    'value'
  );

  const reps = numericText(rowBy(bootstrapRows, 'metric', copy('Replicazioni')), 'value');
  const seed = text(rowBy(bootstrapRows, 'metric', copy('Seme')), 'value');
  const bootstrapLo = numericText(rowBy(bootstrapRows, 'metric', copy('IC low')), 'value');
  const bootstrapHi = numericText(rowBy(bootstrapRows, 'metric', copy('IC high')), 'value');
  const pointEstimate = num(indirect, 'estimate');
  const indirectLo = Number.isFinite(bootstrapLo) ? bootstrapLo : num(indirect, 'lo');
  const indirectHi = Number.isFinite(bootstrapHi) ? bootstrapHi : num(indirect, 'hi');
  const intervalExcludesZero =
    Number.isFinite(indirectLo) &&
    Number.isFinite(indirectHi) &&
    (indirectLo > 0 || indirectHi < 0);
  const intervalName = Number.isFinite(bootstrapLo)
    ? copy('IC bootstrap percentile')
    : copy('IC di Sobel');

  const proportionValue = num(proportion, 'estimate');
  const proportionText = Number.isFinite(proportionValue)
    ? copy('{s1}% del totale', { s1: show(proportionValue * 100, 1) })
    : copy('non calcolabile');

  const describePath = (label: string, row: ReturnType<typeof path>): string =>
    copy('{s1}: β = {s2} (CI {s3}%), {s4}.', {
      s1: label,
      s2: show(num(row, 'beta'), 4),
      s3: level,
      s4: describeP(num(row, 'p')),
    });

  const significantPaths = [pathA, pathB, direct, total].filter(row =>
    isDecided(num(row, 'p'), level)
  ).length;

  const tone: ReportSpec['tone'] =
    Number.isFinite(coherence) && Math.abs(coherence) > 1e-6
      ? 'caution'
      : intervalExcludesZero
        ? 'positive'
        : 'neutral';

  return {
    id: 'report-mediation',
    title: copy('Report di lettura — Mediazione'),
    headline: intervalExcludesZero
      ? copy('L’effetto indiretto è {s1} e l’{s2} al {s3}% ({s4}) non contiene lo zero.', {
          s1: show(pointEstimate, 4),
          s2: intervalName,
          s3: level,
          s4: showCI(indirectLo, indirectHi, 4),
        })
      : copy('L’effetto indiretto è {s1}, ma l’{s2} al {s3}% ({s4}) contiene lo zero.', {
          s1: show(pointEstimate, 4),
          s2: intervalName,
          s3: level,
          s4: showCI(indirectLo, indirectHi, 4),
        }),
    badge: intervalExcludesZero
      ? copy('Mediazione compatibile')
      : copy('Mediazione non conclusiva'),
    tone,
    intro: [
      copy('La mediazione scompone l’effetto di un predittore sull’esito in una via diretta e in una via che passa per un mediatore.'),
      copy('Il modello è lineare e additivo: il predittore entra nell’equazione del mediatore (a), il mediatore e il predittore in quella dell’esito (b e c′), mentre c è l’effetto totale senza mediatore.'),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('Il run usa {s1} osservazioni complete; il modello mediatore ha R² = {s2} e il modello esito R² = {s3} (totale: {s4}).', {
            s1: show(observations, 0),
            s2: show(r2Mediator, 3),
            s3: show(r2Outcome, 3),
            s4: show(r2Total, 3),
          }),
          describePath(copy('Percorso a (predittore → mediatore)'), pathA),
          describePath(copy('Percorso b (mediatore → esito)'), pathB),
          describePath(copy('Effetto diretto c′'), direct),
          describePath(copy('Effetto totale c'), total),
          significantPaths === 0
            ? copy('Nessun percorso risulta significativo al livello scelto: la scomposizione va letta con cautela.', {
                s1: alphaText(level),
              })
            : copy('{s1} percorsi su 4 sono significativi (p < {s2}).', {
                s1: significantPaths,
                s2: alphaText(level),
              }),
        ],
      },
      {
        heading: copy('Effetti e proporzione mediata'),
        body: [
          copy('Effetto indiretto a·b = {s1} ({s2} al {s3}%: {s4}); effetto diretto c′ = {s5}; effetto totale c = {s6}.', {
            s1: show(pointEstimate, 4),
            s2: intervalName,
            s3: level,
            s4: showCI(indirectLo, indirectHi, 4),
            s5: show(num(direct, 'beta'), 4),
            s6: show(num(total, 'beta'), 4),
          }),
          copy('La proporzione mediata è {s1}: indica quanta parte dell’effetto totale passa dal mediatore.', {
            s1: proportionText,
          }),
          Number.isFinite(coherence) && Math.abs(coherence) > 1e-6
            ? copy('Attenzione: c − (c′ + a·b) = {s1}, quindi la scomposizione non è coerente. Controlla collinearità e convergenza dei modelli.', {
                s1: show(coherence, 6),
              })
            : copy('La coerenza algebrica è rispettata: c coincide con c′ + a·b entro errore numerico.'),
          Number.isFinite(reps)
            ? copy('Il bootstrap ha usato {s1} replicazioni con seme {s2}; l’intervallo percentile è {s3}.', {
                s1: show(reps, 0),
                s2: seed,
                s3: showCI(bootstrapLo, bootstrapHi, 4),
              })
            : copy('Il bootstrap non è disponibile: l’intervallo dell’effetto indiretto è quello di Sobel.'),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Il predittore deve precedere il mediatore e il mediatore deve precedere l’esito: la mediazione è un’ipotesi causale, non una conseguenza automatica della regressione.'),
          copy('Servono assenza di confondimento non misurato, specificazione corretta delle covariate e relazioni lineari senza interazione predittore × mediatore.'),
          copy('Il disegno trasversale non distingue la direzione causale: un modello alternativo con esito e mediatore scambiati può adattarsi ugualmente bene.'),
          copy('La proporzione mediata è instabile quando l’effetto totale è vicino a zero e non ha un intervallo affidabile in quel caso.'),
        ],
      },
    ],
    limitations: [
      copy('Non sono inclusi effetti moderati, interazioni predittore × mediatore, variabili latenti o modelli SEM completi.'),
      copy('Il bootstrap è percentile: non corregge il bias e non sostituisce il disegno causale.'),
      copy('Con campioni piccoli le stime dei percorsi e gli errori standard possono essere instabili, anche quando il bootstrap converge.'),
    ],
  };
};
