import { copy, sourceOf } from '../reportCopy';
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

/** Il kernel riporta sempre intervalli normali a due code al 95%. */
const LEVEL = 95;

/**
 * Report discorsivo della regressione quantilica.
 *
 * Come gli altri report della wave, non ricalcola nulla: legge le righe delle
 * tabelle già mostrate all'utente, così prosa e numeri non possono divergere.
 */
export const quantileReport = (tables: TableSpec[]): ReportSpec => {
  const fitRows = rowsOf(tables, 'quantile-fit');
  const coefficientRows = rowsOf(tables, 'quantile-coefficients');

  const tau = Number(text(rowBy(fitRows, 'metric', copy('Quantile (τ)')), 'value'));
  const observations = Number(text(rowBy(fitRows, 'metric', copy('Osservazioni')), 'value'));
  const parameters = Number(text(rowBy(fitRows, 'metric', copy('Parametri')), 'value'));
  const iterations = Number(text(rowBy(fitRows, 'metric', copy('Iterazioni')), 'value'));
  const converged =
    text(rowBy(fitRows, 'metric', copy('Convergenza')), 'value') === copy('sì');
  const objective = Number(text(rowBy(fitRows, 'metric', copy('Funzione obiettivo')), 'value'));

  const intercept = coefficientRows.find(
    row => sourceOf(String(row.predictor ?? '')) === '(Intercept)'
  );
  const predictors = coefficientRows.filter(
    row => sourceOf(String(row.predictor ?? '')) !== '(Intercept)'
  );
  const significant = predictors.filter(row => isDecided(num(row, 'p'), LEVEL));

  const describeCoefficient = (row: (typeof predictors)[number]): string =>
    copy('{s1}: β = {s2} (CI 95% {s3}), {s4}.', {
      s1: String(row.predictor),
      s2: show(num(row, 'beta'), 4),
      s3: showCI(num(row, 'ciLo'), num(row, 'ciHi'), 4),
      s4: describeP(num(row, 'p')),
    });

  return {
    id: 'report-quantile',
    title: copy('Report di lettura — Regressione quantilica'),
    headline: !converged
      ? copy('Il simplesso non ha raggiunto la convergenza: le stime non sono affidabili.')
      : significant.length === 0
        ? copy('Al quantile τ = {s1}, nessun coefficiente di predittore è significativo (p < {s2}).', {
            s1: show(tau, 2),
            s2: alphaText(LEVEL),
          })
        : significant.length === 1
          ? copy('Al quantile τ = {s1}, 1 coefficiente di predittore su {s2} è significativo (p < {s3}).', {
              s1: show(tau, 2),
              s2: predictors.length,
              s3: alphaText(LEVEL),
            })
          : copy('Al quantile τ = {s1}, {s2} coefficienti di predittore su {s3} sono significativi (p < {s4}).', {
              s1: show(tau, 2),
              s2: significant.length,
              s3: predictors.length,
              s4: alphaText(LEVEL),
            }),
    badge: !converged
      ? copy('Non convergente')
      : significant.length > 0
        ? copy('Modello informativo')
        : copy('Modello debole'),
    tone: !converged ? 'caution' : significant.length > 0 ? 'positive' : 'neutral',
    intro: [
      copy('La regressione quantilica stima come cambia un quantile condizionale di Y, non la media: al posto della somma dei quadrati minimizza una perdita assoluta asimmetrica.'),
      copy('Con τ = 0,5 è una regressione mediana, robusta agli outlier; con τ vicino a 0 o 1 descrive la coda bassa o alta della distribuzione.'),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('Il modello usa {s1} osservazioni complete e {s2} parametri (intercetta inclusa), con {s3} iterazioni del simplesso.', {
            s1: observations,
            s2: parameters,
            s3: iterations,
          }),
          converged
            ? copy('Il simplesso ha raggiunto la convergenza e la perdita minima vale {s1}.', {
                s1: show(objective, 4),
              })
            : copy('La convergenza non è stata raggiunta: aumenta il budget di iterazioni o riduci i predittori prima di leggere i coefficienti.'),
          ...(intercept ? [describeCoefficient(intercept)] : []),
          ...predictors.map(describeCoefficient),
        ],
      },
      {
        heading: copy('Come leggere i coefficienti'),
        bullets: [
          copy('β misura di quanto cambia il quantile τ di Y per una unità in più del predittore, mantenendo gli altri costanti.'),
          copy('L’intercetta è il quantile τ stimato quando tutti i predittori valgono zero: spesso non ha un’interpretazione sostantiva.'),
          copy('Un intervallo che contiene zero è compatibile con nessun effetto al livello scelto; il p è di Wald e usa errori standard approssimati.'),
          copy('Con più predittori il grafico a punti mostra il profilo del primo predittore alle medie degli altri, non una superficie completa.'),
        ],
      },
      {
        heading: copy('Perché scegliere un quantile'),
        body: [
          copy('La media è sensibile agli outlier e alle code pesanti; la mediana e gli altri quantili descrivono il centro o gli estremi della distribuzione condizionata.'),
          copy('Confrontare quantili diversi dello stesso modello mostra se l’effetto di un predittore cambia lungo la distribuzione, cosa che la regressione lineare non evidenzia.'),
          copy('Il prezzo è che ogni quantile va stimato separatamente: le rette di quantili vicini possono incrociarsi e non c’è una verosimiglianza unica da confrontare con un test LR.'),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Le osservazioni devono essere indipendenti tra loro (una riga = una unità).'),
          copy('Il modello è lineare nei parametri per il quantile scelto: se la relazione cambia forma nelle code, servono trasformazioni o termini aggiunti.'),
          copy('Servono osservazioni sufficienti vicino a τ: con code estreme e campioni piccoli le stime diventano instabili.'),
          copy('Gli errori standard usano l’approssimazione di Powell/Hall–Sheather (quantreg, se = "nid") e possono essere inaffidabili con pochi casi o residui degeneri.'),
          copy('La convergenza del simplesso va controllata: un numero di iterazioni al limite indica un problema numerico, non un risultato.'),
        ],
      },
    ],
    limitations: [
      copy('Non sono inclusi intervalli bootstrap, test tra quantili o correzione per code estreme.'),
      copy('Il modello è lineare nei parametri: relazioni non lineari richiedono trasformazioni o termini aggiunti.'),
      copy('La bontà di adattamento non è riassunta da un R²: valuta la perdita asimmetrica e il confronto tra quantili.'),
    ],
  };
};
