import { fmtEst, fmtP } from '../format';
import { copy, sourceOf } from '../reportCopy';
import {
  describeP,
  isDecided,
  numOf,
  rowsOf,
  show,
  showInt,
  tableById,
  textOf,
} from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

/** Written reports for the Mantel–Haenszel, trend and exact modes. */

const alphaText = (level: number): string => (1 - level / 100).toFixed(2);

export const contingencyMantelHaenszelReport = (
  tables: TableSpec[],
  level: number
): ReportSpec => {
  const pooled = rowsOf(tables, 'cont-mh');
  const strata = rowsOf(tables, 'cont-mh-strata');
  const oddsRow = pooled.find(row => sourceOf(String(row.measure ?? '')).includes('Odds ratio'));
  const chiRow = pooled.find(row => sourceOf(String(row.measure ?? '')).includes('χ²'));
  const oddsRatio = numOf(oddsRow, 'estimate');
  const lo = numOf(oddsRow, 'lo');
  const hi = numOf(oddsRow, 'hi');
  const chi2 = numOf(chiRow, 'estimate');
  const p = numOf(chiRow, 'p');
  const significant = isDecided(p, level);
  const corrected = (tableById(tables, 'cont-mh')?.notes ?? []).some(note =>
    sourceOf(note).includes('cella vuota')
  );

  const drivers = strata
    .filter(row => Number.isFinite(numOf(row, 'logOddsRatio')))
    .sort((a, b) => Math.abs(numOf(b, 'logOddsRatio')) - Math.abs(numOf(a, 'logOddsRatio')))
    .slice(0, 4)
    .map(row => {
      const label = String(row.stratum ?? '');
      return copy('{s1}: OR = {s2} (log-OR {s3}, peso {s4})', {
        s1: label,
        s2: show(numOf(row, 'oddsRatio'), 3),
        s3: show(numOf(row, 'logOddsRatio'), 3),
        s4: show(numOf(row, 'weight'), 3),
      });
    });

  const headline = !Number.isFinite(p)
    ? copy('Non ci sono strati sufficienti: il test di Mantel–Haenszel non è calcolabile.')
    : significant
      ? copy('Associazione comune significativa dopo l’aggiustamento per strato (χ² MH = {s1}, p = {s2}).', { s1: fmtEst(chi2, 3), s2: fmtP(p) })
      : copy('Nessuna associazione comune rilevata dopo l’aggiustamento per strato (χ² MH = {s1}, p = {s2}).', { s1: fmtEst(chi2, 3), s2: fmtP(p) });

  return {
    id: 'contingency-mantel-haenszel',
    title: copy('Report di lettura'),
    headline,
    badge: significant ? copy('Associazione comune significativa') : copy('Nessuna associazione comune'),
    tone: significant ? 'positive' : 'neutral',
    intro: [
      copy('Il test di Mantel–Haenszel unisce più tabelle 2×2, una per strato, e verifica se l’associazione tra riga e colonna resta la stessa dopo aver tenuto conto dello strato.'),
      copy('È utile quando un fattore di confondimento crea gruppi diversi: invece di ignorarlo, lo si tratta come strato e si stima un odds ratio comune.'),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('Gli strati utilizzati sono {s1}. L’odds ratio comune vale {s2} con intervallo {s3} – {s4}: {s5}', {
            s1: showInt(strata.length),
            s2: show(oddsRatio, 3),
            s3: show(lo, 3),
            s4: show(hi, 3),
            s5: Number.isFinite(p) ? describeP(p) : copy('p non calcolabile.'),
          }),
          Number.isFinite(p)
            ? significant
              ? copy('Il χ² di Mantel–Haenszel = {s1} supera la soglia α = {s2}: l’ipotesi di associazione comune nulla viene rifiutata.', { s1: show(chi2, 3), s2: alphaText(level) })
              : copy('Il χ² di Mantel–Haenszel = {s1} non supera la soglia α = {s2}: non ci sono prove sufficienti contro l’associazione comune nulla.', { s1: show(chi2, 3), s2: alphaText(level) })
            : '',
          corrected
            ? copy('Uno o più strati contenevano una cella vuota: per quel calcolo è stato aggiunto 0,5 a ogni cella, come correzione di continuità.')
            : '',
        ].filter(Boolean),
      },
      {
        heading: copy('Dove sta l’associazione'),
        body: [
          copy('L’odds ratio comune è una media pesata degli odds ratio di strato: gli strati con più informazioni contano di più.'),
        ],
        bullets: drivers.length > 0
          ? drivers
          : [copy('Nessuno strato ha un odds ratio calcolabile: controlla le celle e i totali.')],
      },
      {
        heading: copy('Assunzioni da controllare'),
        bullets: [
          copy('Ogni strato deve essere una tabella 2×2 completa, con lo stesso significato delle righe e delle colonne in tutti gli strati.'),
          copy('L’odds ratio comune assume che l’associazione non cambi tra gli strati: se cambia, il valore pooled nasconde differenze importanti.'),
          copy('Osservazioni indipendenti e categorie esaustive restano necessarie, come nel χ² semplice.'),
          copy('Con molte celle piccole l’approssimazione χ² è fragile: il p va letto con cautela.'),
        ],
      },
    ],
    limitations: [
      copy('Mantel–Haenszel aggiusta per uno o più strati categorici, non per covariate continue.'),
      copy('Con strati molto diversi tra loro il valore comune può non rappresentare nessuno strato in particolare.'),
    ],
  };
};

export const contingencyTrendReport = (tables: TableSpec[], level: number): ReportSpec => {
  const test = rowsOf(tables, 'cont-trend')[0];
  const proportions = rowsOf(tables, 'cont-trend-proportions');
  const statistic = numOf(test, 'statistic');
  const df = numOf(test, 'df');
  const p = numOf(test, 'p');
  const significant = isDecided(p, level);

  const finite = proportions.filter(row => Number.isFinite(numOf(row, 'proportion')));
  const sorted = [...finite].sort((a, b) => numOf(a, 'score') - numOf(b, 'score'));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const direction =
    first && last
      ? numOf(last, 'proportion') >= numOf(first, 'proportion')
        ? copy('in aumento')
        : copy('in diminuzione')
      : copy('non determinabile');

  const headline = !Number.isFinite(p)
    ? copy('Il trend non è calcolabile: servono almeno due righe con totali positivi e punteggi validi.')
    : significant
      ? copy('La proporzione mostra un trend significativo lungo i punteggi (z² = {s1}, p = {s2}).', { s1: fmtEst(statistic, 3), s2: fmtP(p) })
      : copy('Nessuna evidenza di trend lungo i punteggi (z² = {s1}, p = {s2}).', { s1: fmtEst(statistic, 3), s2: fmtP(p) });

  return {
    id: 'contingency-trend',
    title: copy('Report di lettura'),
    headline,
    badge: significant ? copy('Trend significativo') : copy('Nessun trend rilevato'),
    tone: significant ? 'positive' : 'neutral',
    intro: [
      copy('Il test di Cochran–Armitage verifica se la proporzione di successi cambia in modo sistematico quando le righe della tabella hanno un ordine numerico.'),
      copy('I punteggi stabiliscono la distanza tra le righe: non sono etichette, ma posizioni sulla scala che si vuole testare.'),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('La statistica z² vale {s1} con {s2} grado/i di libertà e {s3}.', {
            s1: show(statistic, 3),
            s2: showInt(df),
            s3: Number.isFinite(p) ? describeP(p) : copy('p non calcolabile'),
          }),
          Number.isFinite(p)
            ? significant
              ? copy('Il trend è {s1} e supera la soglia α = {s2}: la proporzione cambia con il punteggio più di quanto il caso spieghi.', { s1: direction, s2: alphaText(level) })
              : copy('Il trend osservato è {s1}, ma non supera la soglia α = {s2}: non ci sono prove sufficienti di un andamento sistematico.', { s1: direction, s2: alphaText(level) })
            : '',
        ].filter(Boolean),
      },
      {
        heading: copy('Le proporzioni osservate'),
        body: [
          copy('La tabella riporta, per ogni riga, successi, totale e proporzione. Il grafico lineare collega le proporzioni nell’ordine dei punteggi.'),
        ],
        bullets:
          sorted.length > 0
            ? sorted.map(row =>
                copy('{s1} (punteggio {s2}): {s3} su {s4} = {s5}', {
                  s1: String(row.row ?? ''),
                  s2: show(numOf(row, 'score'), 3),
                  s3: showInt(numOf(row, 'successes')),
                  s4: showInt(numOf(row, 'total')),
                  s5: show(numOf(row, 'proportion'), 3),
                })
              )
            : [copy('Nessuna proporzione calcolabile con i dati forniti.')],
      },
      {
        heading: copy('Assunzioni da controllare'),
        bullets: [
          copy('Le righe devono avere un ordine numerico plausibile: i punteggi non possono essere scelti dopo aver visto il risultato.'),
          copy('Le osservazioni devono essere indipendenti e ogni riga deve avere un totale positivo.'),
          copy('Il test rileva un trend lineare; un andamento a U può risultare non significativo anche se le proporzioni cambiano.'),
          copy('Con totali piccoli l’approssimazione χ² è fragile: verifica le frequenze attese e valuta un test esatto.'),
        ],
      },
    ],
    limitations: [
      copy('Il trend non implica causalità: un punteggio associato alla proporzione può riflettere un altro fattore.'),
      copy('Punteggi arbitrari cambiano la statistica: vanno giustificati prima dell’analisi.'),
    ],
  };
};

export const contingencyExactReport = (tables: TableSpec[], level: number): ReportSpec => {
  const row = rowsOf(tables, 'cont-exact')[0];
  const p = numOf(row, 'p');
  const statistic = numOf(row, 'statistic');
  const significant = isDecided(p, level);
  const method = sourceOf(textOf(row, 'method'));
  const detail = textOf(row, 'detail');
  const available = Number.isFinite(p);

  const headline = !available
    ? copy('Il p esatto non è calcolabile per questa tabella.')
    : significant
      ? copy('Il test esatto rifiuta l’indipendenza (p = {s1}).', { s1: fmtP(p) })
      : copy('Il test esatto non rifiuta l’indipendenza (p = {s1}).', { s1: fmtP(p) });

  return {
    id: 'contingency-exact',
    title: copy('Report di lettura'),
    headline,
    badge: significant ? copy('Associazione significativa') : copy('Nessuna associazione rilevata'),
    tone: significant ? 'positive' : 'neutral',
    intro: [
      copy('Il test esatto calcola il p senza affidarsi all’approssimazione χ²: confronta la tabella osservata con tutte le tabelle che hanno gli stessi margini.'),
      copy('È la scelta naturale quando le celle sono piccole o quando la regola di Cochran non è rispettata.'),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          available
            ? copy('Il metodo usato è “{s1}”. La statistica Σ|O − E| vale {s2} e il p esatto è {s3}: {s4}', {
                s1: method,
                s2: show(statistic, 3),
                s3: fmtP(p),
                s4: significant
                  ? copy('sotto la soglia α = {s1}, quindi l’ipotesi di indipendenza viene rifiutata.', { s1: alphaText(level) })
                  : copy('sopra la soglia α = {s1}, quindi l’ipotesi di indipendenza non viene rifiutata.', { s1: alphaText(level) }),
              })
            : copy('La tabella non permette il calcolo esatto: {s1}', { s1: detail }),
          method === 'Monte Carlo a margini fissi'
            ? copy('Il numero di tavole con questi margini supera il budget di enumerazione: il p è una stima Monte Carlo deterministica, non un valore esatto.')
            : '',
          method === "Fisher's exact (two-sided)"
            ? copy('Per una tabella 2×2 il p è quello di Fisher a due code, che coincide con l’enumerazione esatta delle tavole con margini fissi.')
            : '',
        ].filter(Boolean),
      },
      {
        heading: copy('Come si legge il p esatto'),
        body: [
          copy('Il p è la probabilità, sotto indipendenza e con i margini osservati, di ottenere una tabella almeno tanto estrema quanto quella osservata.'),
          copy('Non dipende dalla numerosità asintotica: resta valido anche con celle molto piccole, purché l’enumerazione o la simulazione siano affidabili.'),
        ],
      },
      {
        heading: copy('Assunzioni da controllare'),
        bullets: [
          copy('Osservazioni indipendenti e categorie esaustive: ogni unità cade in una sola cella.'),
          copy('I margini sono trattati come fissi; se il disegno non li fissa, il p esatto va interpretato come condizionale.'),
          copy('Con molte categorie il numero di tavole cresce rapidamente: oltre il budget il risultato diventa una stima Monte Carlo.'),
        ],
      },
    ],
    limitations: [
      copy('Il test esatto dice se c’è associazione, non quanto sia forte né in quale direzione: usa residui e misure di associazione.'),
      copy('Con tabelle molto grandi l’enumerazione è sostituita da una simulazione: riporta sempre il metodo usato.'),
    ],
  };
};
