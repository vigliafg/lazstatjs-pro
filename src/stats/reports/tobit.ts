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

export type SelectionReportMode = 'tobit' | 'heckman';

const interceptOf = (
  rows: ReturnType<typeof rowsOf>
): ReturnType<typeof rowsOf>[number] | undefined =>
  rows.find(row => sourceOf(String(row.term ?? '')) === '(Intercept)');

const describeRow = (
  row: ReturnType<typeof rowsOf>[number],
  level: number
): string =>
  copy('{s1}: β = {s2} (CI {s5}% {s3}), {s4}.', {
    s1: String(row.term),
    s2: show(num(row, 'beta'), 4),
    s3: showCI(num(row, 'ciLo'), num(row, 'ciHi'), 4),
    s4: describeP(num(row, 'p')),
    s5: level,
  });

/**
 * Report for Tobit type-I and Heckman two-step.
 *
 * Like the other wave reports it never recomputes the model: it reads the rows
 * of the tables already shown to the user, so the prose cannot disagree with
 * the numbers. The mode selects which tables and sentences apply.
 */
export const selectionReport = (
  tables: TableSpec[],
  mode: SelectionReportMode,
  level: number
): ReportSpec => {
  if (mode === 'tobit') {
    const outcomeRows = rowsOf(tables, 'tobit-outcome');
    const varianceRows = rowsOf(tables, 'tobit-variance');
    const diagnosticRows = rowsOf(tables, 'tobit-diagnostics');
    const fitRows = rowsOf(tables, 'tobit-fit');

    const sigma = Number(text(rowBy(varianceRows, 'metric', copy('Sigma (σ)')), 'value'));
    const lower = Number(text(rowBy(varianceRows, 'metric', copy('Limite inferiore')), 'value'));
    const upperText = text(rowBy(varianceRows, 'metric', copy('Limite superiore')), 'value');
    const n = Number(text(rowBy(diagnosticRows, 'metric', copy('Osservazioni')), 'value'));
    const nLower = Number(text(rowBy(diagnosticRows, 'metric', copy('Censurati a sinistra')), 'value'));
    const nUpper = Number(text(rowBy(diagnosticRows, 'metric', copy('Censurati a destra')), 'value'));
    const nUncensored = Number(text(rowBy(diagnosticRows, 'metric', copy('Non censurati')), 'value'));
    const iterations = Number(text(rowBy(diagnosticRows, 'metric', copy('Iterazioni')), 'value'));
    const converged =
      text(rowBy(diagnosticRows, 'metric', copy('Convergenza')), 'value') === copy('sì');
    const logLik = Number(text(rowBy(fitRows, 'metric', copy('Log-verosimiglianza')), 'value'));
    const aic = Number(text(rowBy(fitRows, 'metric', 'AIC'), 'value'));

    const intercept = interceptOf(outcomeRows);
    const predictors = outcomeRows.filter(
      row => sourceOf(String(row.term ?? '')) !== '(Intercept)'
    );
    const significant = predictors.filter(row => isDecided(num(row, 'p'), level));
    const censored = nLower + nUpper;
    const censoredShare = n > 0 ? censored / n : Number.NaN;
    const upperTextIsNone = upperText === copy('nessuno');

    return {
      id: 'report-tobit',
      title: copy('Report di lettura — Regressione Tobit (censurata)'),
      headline: !converged
        ? copy('L’ottimizzatore non ha raggiunto la convergenza: le stime non sono affidabili.')
        : significant.length === 0
          ? copy('Nessun coefficiente di predittore è significativo (p < {s1}).', {
              s1: alphaText(level),
            })
          : copy('{s1} coefficienti di predittore su {s2} sono significativi (p < {s3}).', {
              s1: significant.length,
              s2: predictors.length,
              s3: alphaText(level),
            }),
      badge: !converged
        ? copy('Non convergente')
        : significant.length > 0
          ? copy('Modello informativo')
          : copy('Modello debole'),
      tone: !converged ? 'caution' : significant.length > 0 ? 'positive' : 'neutral',
      intro: [
        copy('Il Tobit di tipo I stima una regressione lineare su una risposta latente che osserviamo solo entro i limiti di censura: sotto (o sopra) il limite registriamo il limite, non il valore vero.'),
        copy('Usare una regressione lineare sui valori censurati mescolerebbe il limite con i valori reali e sottostimerebbe la pendenza; il Tobit usa l’informazione “almeno il limite” correttamente.'),
      ],
      sections: [
        {
          heading: copy('La lettura dei risultati'),
          body: [
            copy('Il modello usa {s1} osservazioni: {s2} censurate a sinistra, {s3} a destra e {s4} non censurate.', {
              s1: n,
              s2: nLower,
              s3: nUpper,
              s4: nUncensored,
            }),
            upperTextIsNone
              ? copy('La censura è solo inferiore, al limite {s1} ({s2}% delle osservazioni).', {
                  s1: show(lower, 2),
                  s2: show(censoredShare * 100, 1),
                })
              : copy('La censura è bilaterale: limite inferiore {s1}, limite superiore {s2} ({s3}% delle osservazioni al limite).', {
                  s1: show(lower, 2),
                  s2: upperText,
                  s3: show(censoredShare * 100, 1),
                }),
            converged
              ? copy('L’ottimizzatore ha raggiunto la convergenza in {s1} iterazioni; la log-verosimiglianza vale {s2} e l’AIC {s3}.', {
                  s1: iterations,
                  s2: show(logLik, 4),
                  s3: show(aic, 4),
                })
              : copy('La convergenza non è stata raggiunta: controlla collinearità, scala delle colonne e numero di righe prima di leggere i coefficienti.'),
            ...(intercept ? [describeRow(intercept, level)] : []),
            ...predictors.map(row => describeRow(row, level)),
            copy('Sigma stimato: {s1}; è la deviazione standard della parte non spiegata sulla scala latente.', {
              s1: show(sigma, 4),
            }),
          ],
        },
        {
          heading: copy('Coefficienti latenti e valori osservati'),
          bullets: [
            copy('β descrive come cambia la media latente y*, non la media dei valori osservati: vicino al limite la seconda è compressa dalla censura.'),
            copy('Una variazione di β non si traduce in una variazione uguale del valore atteso osservato, perché il troncamento cambia con i predittori.'),
            copy('Il grafico confronta la media latente con la media osservata e mostra la linea del limite: le righe appiattite sul limite sono quelle censurate.'),
          ],
        },
        {
          heading: copy('Assunzioni e cautele'),
          bullets: [
            copy('La componente non spiegata deve essere normale e omoschedastica: code pesanti o eteroschedasticità distortono le stime.'),
            copy('La censura deve essere di tipo I, con il limite noto e uguale per tutte le righe; limiti diversi richiedono un modello diverso.'),
            copy('Le osservazioni devono essere indipendenti e il limite va scelto prima di guardare i risultati.'),
            copy('La log-verosimiglianza del Tobit non è confrontabile con quella di una regressione lineare sugli stessi dati: cambia il modello di probabilità.'),
          ],
        },
      ],
      limitations: [
        copy('Il modello è lineare e normale sulla scala latente; non copre selezione campionaria né effetti casuali.'),
        copy('La censura è di tipo I: non distingue tra “zero vero” e “zero per mancata osservazione”.'),
        copy('Gli errori standard sono normali e basati sull’Hessiana numerica; con pochi casi o molta censura possono essere instabili.'),
      ],
    };
  }

  const outcomeRows = rowsOf(tables, 'heckman-outcome');
  const selectionRows = rowsOf(tables, 'heckman-selection');
  const varianceRows = rowsOf(tables, 'heckman-variance');
  const diagnosticRows = rowsOf(tables, 'heckman-diagnostics');
  const fitRows = rowsOf(tables, 'heckman-fit');

  const sigma = Number(text(rowBy(varianceRows, 'metric', copy('Sigma (σ)')), 'value'));
  const rho = Number(text(rowBy(varianceRows, 'metric', copy('Rho (ρ)')), 'value'));
  const lambdaSe = Number(text(rowBy(varianceRows, 'metric', copy('SE di lambda')), 'value'));
  const correction = text(rowBy(varianceRows, 'metric', copy('Correzione prima fase')), 'value');
  const n = Number(text(rowBy(diagnosticRows, 'metric', copy('Osservazioni')), 'value'));
  const nSelected = Number(text(rowBy(diagnosticRows, 'metric', copy('Selezionati')), 'value'));
  const nExcluded = Number(text(rowBy(diagnosticRows, 'metric', copy('Non selezionati')), 'value'));
  const wald = Number(text(rowBy(diagnosticRows, 'metric', 'Wald (λ = 0)'), 'value'));
  const waldP = Number(text(rowBy(diagnosticRows, 'metric', copy('p(Wald)')), 'value'));
  const converged =
    text(rowBy(diagnosticRows, 'metric', copy('Convergenza')), 'value') === copy('sì');
  const logLik = text(rowBy(fitRows, 'metric', copy('Log-verosimiglianza')), 'value');

  const intercept = interceptOf(outcomeRows);
  const lambdaRow = outcomeRows.find(row => sourceOf(String(row.term ?? '')) === 'IMR (λ)');
  const predictors = outcomeRows.filter(
    row =>
      sourceOf(String(row.term ?? '')) !== '(Intercept)' &&
      sourceOf(String(row.term ?? '')) !== 'IMR (λ)'
  );
  const selectionPredictors = selectionRows.filter(
    row => sourceOf(String(row.term ?? '')) !== '(Intercept)'
  );
  const selectionSignificant = selectionPredictors.filter(row => isDecided(num(row, 'p'), level));
  const selectionEffect = lambdaRow ? isDecided(num(lambdaRow, 'p'), level) : false;
  const rhoOutside = Number.isFinite(rho) && Math.abs(rho) > 1;

  return {
    id: 'report-heckman',
    title: copy('Report di lettura — Selezione campionaria (Heckman, due passi)'),
    headline: !converged
      ? copy('Il probit di selezione non ha raggiunto la convergenza: le stime non sono affidabili.')
      : selectionEffect
        ? copy('La selezione sposta la media dell’esito osservato: lambda è significativo (p < {s1}).', {
            s1: alphaText(level),
          })
        : copy('Non emerge un effetto di selezione sulla media dell’esito (p = {s1}).', {
            s1: show(waldP, 3),
          }),
    badge: !converged
      ? copy('Non convergente')
      : selectionEffect
        ? copy('Selezione rilevante')
        : copy('Selezione non rilevata'),
    tone: !converged ? 'caution' : selectionEffect ? 'positive' : 'neutral',
    intro: [
      copy('Il modello di Heckman a due passi stima prima chi entra nel campione (probit di selezione) e poi l’esito sulle sole righe selezionate, inserendo l’inverse Mills ratio come correzione per la selezione.'),
      copy('Serve quando l’esito è osservato solo per un sottoinsieme non casuale delle unità: una regressione sulle sole righe osservate confonderebbe l’effetto dei predittori con il meccanismo di selezione.'),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('Il probit usa {s1} osservazioni e {s2} predittori di selezione; l’equazione dell’esito è stimata su {s3} righe selezionate, con {s4} righe escluse.', {
            s1: n,
            s2: selectionPredictors.length,
            s3: nSelected,
            s4: nExcluded,
          }),
          selectionSignificant.length === 0
            ? copy('Nessun predittore della selezione è significativo (p < {s1}): il meccanismo di ingresso è debole o poco informativo.', {
                s1: alphaText(level),
              })
            : copy('{s1} predittori della selezione su {s2} sono significativi (p < {s3}), quindi l’ingresso nel campione non è casuale rispetto a quelle variabili.', {
                s1: selectionSignificant.length,
                s2: selectionPredictors.length,
                s3: alphaText(level),
              }),
          lambdaRow
            ? copy('Lambda (δ) = {s1} (CI {s6}% {s2}), {s3}; il test di Wald vale {s4} con p = {s5}.', {
                s1: show(num(lambdaRow, 'beta'), 4),
                s2: showCI(num(lambdaRow, 'ciLo'), num(lambdaRow, 'ciHi'), 4),
                s3: describeP(num(lambdaRow, 'p')),
                s4: show(wald, 4),
                s5: show(waldP, 4),
                s6: level,
              })
            : copy('Il coefficiente di lambda non è disponibile.'),
          copy('Sigma = {s1}, rho = {s2}: rho misura la correlazione tra le due equazioni; con rho vicino a zero la correzione cambia poco le stime.', {
            s1: show(sigma, 4),
            s2: show(rho, 4),
          }),
          correction === copy('applicata')
            ? copy('Gli errori standard includono la correzione di prima fase (Murphy–Topel/Greene).')
            : copy('La correzione di prima fase non era calcolabile: gli errori standard riportati sono quelli OLS e vanno letti come limite inferiore.'),
          ...(intercept ? [describeRow(intercept, level)] : []),
          ...predictors.map(row => describeRow(row, level)),
          copy('Log-verosimiglianza: {s1}. Il due passi non è un estimatore di massima verosimiglianza e non produce un AIC confrontabile.', {
            s1: logLik,
          }),
        ],
      },
      {
        heading: copy('Come leggere lambda e rho'),
        bullets: [
          copy('Lambda (δ) è il coefficiente dell’inverse Mills ratio: se è positivo la selezione aumenta la media dell’esito osservato, se è negativo la riduce.'),
          copy('Rho = δ / σ riassume la correlazione tra selezione ed esito; valori vicini a zero indicano che la selezione non sposta la media condizionata.'),
          copy('Il test di Wald su lambda riguarda la media dell’esito, non la probabilità di selezione: un p alto non dimostra che la selezione sia assente.'),
          ...(rhoOutside
            ? [
                copy('Rho è fuori da (-1, 1): con campioni piccoli o selezione debole il due passi può produrre un valore non ammissibile, segnale di instabilità più che di un effetto reale.'),
              ]
            : []),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Il probit deve essere specificato correttamente: se manca un predittore rilevante della selezione, la correzione non basta.'),
          copy('Serve almeno una variabile che entra nella selezione e non nell’esito (esclusione): senza di essa l’identificazione poggia solo sulla non linearità dell’inverse Mills ratio.'),
          copy('La normalità congiunta delle due componenti è assunta; deviazioni forti rendono fragili le stime e gli errori standard.'),
          copy('Il due passi è meno efficiente della massima verosimiglianza congiunta e può produrre rho fuori dall’intervallo ammissibile.'),
          copy('Con pochi casi selezionati la correzione di prima fase diventa instabile: controlla il numero di righe selezionate e la diagnostica.'),
        ],
      },
    ],
    limitations: [
      copy('Solo stimatore a due passi: non è implementata la massima verosimiglianza congiunta di Heckman.'),
      copy('La selezione è binaria e il probit è lineare nei predittori; non copre selezione multi-stadio né variabili strumentali aggiuntive.'),
      copy('Il modello non gestisce censura dell’esito oltre alla selezione: per un esito censurato e selezionato servirebbe un modello più generale.'),
      copy('Rho può uscire da (-1, 1) e viene riportato senza forzature, con la nota di instabilità.'),
      copy('La log-verosimiglianza e l’AIC non sono definiti per il due passi e non vengono riportati.'),
    ],
  };
};
