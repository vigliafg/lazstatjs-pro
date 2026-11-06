import { copy, sourceOf } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import { describeP, isDecided, num, rowsOf, show, tableById } from './shared';

/**
 * Report di lettura del GLMM.
 *
 * Legge soltanto le tabelle già mostrate all'utente: nessun import dal kernel
 * (regola depcruise `reports-senza-ricalcolo`). La convergenza arriva come nota
 * della tabella `glmm-random`, così la prosa resta allineata ai numeri.
 */
export const glmmReport = (
  tables: TableSpec[],
  names: { dep: string; group: string; family: string; link: string },
  level: number
): ReportSpec => {
  const coefficients = rowsOf(tables, 'glmm-coefficients');
  const variance = rowsOf(tables, 'glmm-random');
  const blups = rowsOf(tables, 'glmm-blups');

  const componentOf = (label: string): number =>
    num(
      variance.find(row => sourceOf(String(row.component ?? '')) === label),
      'estimate'
    );

  const interceptVariance = componentOf('Varianza intercetta');
  const slopeVariance = componentOf('Varianza pendenza');
  const residualVariance = componentOf('Varianza residua');
  const correlation = componentOf('Correlazione (intercetta–pendenza)');
  const icc = componentOf('ICC');

  const predictors = coefficients.filter(row => String(row.term) !== '(Intercept)');
  const significant = predictors.filter(row => isDecided(Number(row.p), level));

  const nonConvergenceNote = (tableById(tables, 'glmm-random')?.notes ?? []).some(note =>
    sourceOf(note).includes('Convergenza non raggiunta')
  );
  const invalidEstimates = coefficients.some(
    row => !Number.isFinite(Number(row.beta)) || !Number.isFinite(Number(row.se))
  );
  const notConverged = nonConvergenceNote || invalidEstimates;

  const nearZero = (value: number): boolean => Number.isFinite(value) && value <= 1e-6;
  const varianceAtBoundary =
    nearZero(interceptVariance) || nearZero(slopeVariance) || nearZero(residualVariance);
  const iccNearOne = Number.isFinite(icc) && icc >= 0.99;
  const correlationAtBoundary = Number.isFinite(correlation) && Math.abs(correlation) >= 0.999;
  const unstable = notConverged || varianceAtBoundary || iccNearOne || correlationAtBoundary;

  const headline = notConverged
    ? copy('Il modello non ha raggiunto la convergenza: le stime degli effetti e delle varianze non sono affidabili.')
    : significant.length > 0
      ? copy(
          '{s1} spiegato da {s2} predittore/i con effetti casuali per {s3}; ICC = {s4}.',
          {
            s1: names.dep,
            s2: predictors.length,
            s3: names.group,
            s4: show(icc, 3),
          }
        )
      : copy(
          '{s1}: nessun predittore risulta significativo al livello scelto, con effetti casuali per {s2}; ICC = {s3}.',
          {
            s1: names.dep,
            s2: names.group,
            s3: show(icc, 3),
          }
        );

  const varianceBullet = copy(
    'Varianza dell’intercetta casuale = {s1}; ICC = {s2}: il {s3}% della variabilità è attribuibile ai gruppi.',
    {
      s1: show(interceptVariance, 4),
      s2: show(icc, 3),
      s3: show(icc * 100, 1),
    }
  );

  return {
    id: 'report-glmm',
    title: copy('Report di lettura — Modello lineare generalizzato misto'),
    headline,
    badge: copy('Regressione'),
    tone: unstable ? 'caution' : significant.length > 0 ? 'positive' : 'neutral',
    intro: [
      copy(
        'Un GLMM serve quando le osservazioni sono raggruppate: dentro lo stesso gruppo le misure si somigliano e i residui non sono indipendenti.'
      ),
      copy(
        'Rispetto al GLM, il GLMM aggiunge effetti casuali che assorbono la correlazione entro gruppo; rispetto al LMM, estende il modello a risposte non normali tramite famiglia e link.'
      ),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        bullets: [
          copy('{s1} predittore/i su {s2} risultano significativi al livello di confidenza del {s3}%.', {
            s1: significant.length,
            s2: predictors.length,
            s3: level,
          }),
          ...predictors.map(row =>
            copy('{s1}: B = {s2} (CI {s3} – {s4}), p = {s5}.', {
              s1: String(row.term),
              s2: show(Number(row.beta), 4),
              s3: show(Number(row.lo), 4),
              s4: show(Number(row.hi), 4),
              s5: describeP(Number(row.p)),
            })
          ),
          varianceBullet,
          copy('La tabella delle componenti di varianza riporta SE e CI di Wald su scala log: un intervallo ampio dice che servono piu gruppi per una stima stabile.'),
          copy('I test degli effetti fissi riportano il Wald per termine: con una sola colonna per termine coincide con lo z al quadrato.'),
          ...(Number.isFinite(slopeVariance)
            ? [
                copy('Varianza della pendenza casuale = {s1}; correlazione intercetta–pendenza = {s2}.', {
                  s1: show(slopeVariance, 4),
                  s2: show(correlation, 3),
                }),
              ]
            : []),
          copy('{s1} gruppi hanno effetti casuali stimati (BLUP); famiglia {s2}, link {s3}.', {
            s1: blups.length,
            s2: names.family,
            s3: names.link,
          }),
        ],
      },
      {
        heading: copy('Come leggerlo'),
        bullets: [
          copy(
            'I coefficienti fissi sono sulla scala del link: con logit B è un log-odds, con log è una differenza di log-medie, con identity coincide con la scala della risposta.'
          ),
          copy(
            'I BLUP sono stime condizionate al gruppo, con contrazione verso l’effetto fisso: i gruppi con pochi casi sono tirati verso la media generale.'
          ),
          copy(
            'L’ICC è la quota di varianza attribuibile ai gruppi: un ICC alto indica che ignorare il gruppo sottostima l’errore standard degli effetti fissi.'
          ),
        ],
      },
      {
        heading: copy('Cautele'),
        bullets: [
          copy(
            'La verosimiglianza è approssimata con Laplace: con gruppi piccoli o risposte estreme l’approssimazione può essere imprecisa.'
          ),
          copy('Con pochi gruppi le componenti di varianza sono instabili e l’ICC va letto con prudenza.'),
          copy(
            'Nella famiglia binomiale la separazione (esiti perfettamente separati) rende le stime instabili o divergenti.'
          ),
          copy(
            'Una varianza stimata al bordo (vicina a zero) o una correlazione vicina a ±1 segnala un modello al limite dello spazio dei parametri.'
          ),
          copy('Non estrapolare oltre i livelli osservati dei predittori né a gruppi nuovi non rappresentati nel campione.'),
        ],
      },
    ],
    limitations: [
      copy(
        'Il motore copre famiglie gaussiana, binomiale e Poisson con un solo fattore di raggruppamento e al più una pendenza casuale.'
      ),
      copy(
        'Gli effetti casuali sono assunti normali e la verosimiglianza è approssimata: AIC e BIC vanno confrontati solo tra modelli con la stessa risposta e struttura.'
      ),
    ],
  };
};
