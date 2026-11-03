import { fmtEst, fmtP } from '../format';
import { copy, sourceOf } from '../reportCopy';
import { isDecided, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import type { LifeTableRow, TurnbullResult } from '../survival/types';


export const survivalReport = (tables: TableSpec[], level: number): ReportSpec => {
  const summary = tableById(tables, 'surv-summary')?.rows ?? [];
  const logRank = tableById(tables, 'surv-logrank')?.rows ?? [];
  const km = tableById(tables, 'surv-km')?.rows ?? [];

  const overall = summary[0];
  const p = Number(logRank.find(row => sourceOf(String(row.metric)) === 'p')?.pValue ?? NaN);
  const significant = isDecided(p, level);
  const hr = Number(logRank.find(row => sourceOf(String(row.metric)).startsWith(sourceOf(copy('Hazard ratio'))))?.hrValue ?? NaN);
  const median = Number(overall?.median ?? NaN);
  const rmst = Number(overall?.rmst ?? NaN);
  const events = Number(overall?.events ?? NaN);
  const n = Number(overall?.n ?? NaN);
  const censored = Number(overall?.censored ?? NaN);
  const groups = summary.map(row => String(row.group));

  const lastPoint = km[km.length - 1];
  const finalSurvival = Number(lastPoint?.survival ?? NaN);

  return {
    id: 'survival',
    title: copy('Report di lettura'),
    headline:
      summary.length > 1 && Number.isFinite(p)
        ? significant
          ? copy('Le curve dei gruppi differiscono (log-rank p = {s1}).', { s1: fmtP(p) })
          : copy('Nessuna differenza tra le curve dei gruppi (log-rank p = {s1}).', { s1: fmtP(p) })
        : Number.isFinite(median)
          ? copy('Mediana di sopravvivenza: {s1} ({s2} eventi su {s3}).', { s1: fmtEst(median, 2), s2: events, s3: n })
          : copy('La mediana non viene raggiunta: {s1} eventi su {s2}.', { s1: events, s2: n }),
    badge: 'Sopravvivenza',
    tone: summary.length > 1 && significant ? 'positive' : 'neutral',
    intro: [
      copy('L’analisi di sopravvivenza stima quanto tempo passa prima di un evento (guarigione, guasto, abbandono) tenendo conto delle osservazioni censurate, cioè di chi non ha ancora avuto l’evento quando lo studio finisce.'),
      copy('Qui ci sono {s1} osservazioni, {s2} eventi e {s3} censurati: trattare i censurati come “nessun evento” o escluderli darebbe stime distorte, mentre Kaplan–Meier li mantiene nel rischio finché sono osservati.', { s1: n, s2: events, s3: censored }),
    ],
    sections: [
      {
        heading: copy('La curva e la mediana'),
        body: [
          Number.isFinite(median)
            ? copy('La mediana di sopravvivenza è {s1}: a quel tempo la curva scende sotto 0,50.{s2}', { s1: fmtEst(median, 2), s2: Number.isFinite(Number(overall?.medianLo)) ? copy(' Intervallo {s1} – {s2}.', { s1: fmtEst(Number(overall?.medianLo), 2), s2: fmtEst(Number(overall?.medianHi), 2) }) : '' })
            : copy('La curva non scende sotto 0,50 entro l’ultimo tempo osservato: la mediana non è raggiunta (non è “infinita”, semplicemente non stimabile con questo follow-up).'),
          Number.isFinite(finalSurvival)
            ? copy('All’ultimo tempo osservato la sopravvivenza stimata è {s1} ({s2}%).', { s1: fmtEst(finalSurvival, 3), s2: fmtEst(finalSurvival * 100, 1) })
            : copy('La sopravvivenza finale non è calcolabile.'),
          Number.isFinite(rmst)
            ? copy('RMST = {s1}: area media sotto la curva fino all’ultimo tempo, cioè il tempo medio trascorso senza evento entro l’orizzonte osservato.', { s1: fmtEst(rmst, 2) })
            : copy('RMST non calcolabile.'),
        ],
      },
      {
        heading: summary.length > 1 ? copy('Confronto tra gruppi') : copy('Confronto tra gruppi non richiesto'),
        body:
          summary.length > 1
            ? [
                copy('Gruppi: {s1}. Il log-rank dà χ² = {s2} con p = {s3}: {s4}', { s1: groups.join(', '), s2: String(logRank.find(row => sourceOf(String(row.metric)) === 'χ²')?.value ?? '—'), s3: fmtP(p), s4: significant ? copy('le curve non sono compatibili con l’ipotesi di uguale sopravvivenza.') : copy('non c’è evidenza che le curve differiscano.') }),
                Number.isFinite(hr)
                  ? copy('Hazard ratio = {s1} ({s2} – {s3}): {s4}', { s1: fmtEst(hr, 3), s2: String(logRank.find(row => sourceOf(String(row.metric)).startsWith(sourceOf(copy('HR CI low'))))?.value ?? '—'), s3: String(logRank.find(row => sourceOf(String(row.metric)).startsWith(sourceOf(copy('HR CI high'))))?.value ?? '—'), s4: hr > 1 ? copy('il primo gruppo ha un rischio di evento maggiore.') : copy('il primo gruppo ha un rischio di evento minore.') })
                  : copy('Con più di due gruppi l’hazard ratio non è riportato: usa la regressione di Cox per un HR aggiustato.'),
              ]
            : [copy('Seleziona una variabile di gruppo per confrontare due o più curve con il log-rank.')],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Censura non informativa: chi esce dallo studio non deve avere un rischio diverso da chi resta.'),
          copy('Il tempo zero deve essere definito in modo omogeneo per tutte le osservazioni.'),
          copy('La curva diventa imprecisa nelle code, dove restano poche osservazioni a rischio: guarda la colonna “a rischio”.'),
          copy('Il log-rank dà lo stesso peso a tutti i tempi; se il rischio cambia nel tempo (curve che si incrociano) può non vedere differenze reali.'),
          copy('Con pochi eventi per gruppo il test ha poca potenza e l’HR è instabile.'),
        ],
      },
    ],
    limitations: [
      copy('Il log-rank non aggiusta per covariariate: per hazard ratio aggiustati o per più di due gruppi usa la scheda Cox (PH).'),
      copy('Non sono stimati modelli parametrici (Weibull, esponenziale) con dati censurati.'),
      copy('Il log-rank assume rischi proporzionali: curve che si incrociano richiedono altri test.'),
      copy('L’hazard ratio è riportato solo per due gruppi.'),
      copy('I tempi di censura coincidenti con un evento sono trattati come eventi allo stesso tempo (nessuna correzione per i ties oltre alla gestione standard del risk set).'),
    ],
  };
};

/** Reading report for the actuarial life table. */
export const lifeTableReport = (
  groups: { name: string; rows: LifeTableRow[] }[],
  level: number
): ReportSpec => {
  const first = groups[0];
  const last = first?.rows[first.rows.length - 1];
  const medianRow = first?.rows.find(row => row.survival <= 0.5);
  return {
    id: 'survival-life',
    title: copy('Report di lettura — Life table'),
    headline: last
      ? copy('Sopravvivenza a fine follow-up: {s1} ({s2}%): {s3} gruppi e {s4} intervalli.', {
          s1: fmtEst(last.survival, 3),
          s2: fmtEst(last.survival * 100, 1),
          s3: groups.length,
          s4: first.rows.length,
        })
      : copy('Nessun intervallo calcolabile.'),
    badge: copy('Tavola attuariale'),
    tone: 'neutral',
    intro: [
      copy('La life table divide il tempo in intervalli e stima, per ciascuno, quante persone sono a rischio, quanti eventi e quante censure avvengono.'),
      copy('È la versione tabellare della curva di sopravvivenza: utile per riassumere il follow-up per anno o per periodo e per calcolare q e p intervallo per intervallo.'),
    ],
    sections: [
      {
        heading: copy('Come leggere la tavola'),
        body: [
          copy('“A rischio efficace” sottrae metà dei censurati dell’intervallo: è l’esposizione corretta quando le censure arrivano uniformemente nel periodo.'),
          copy('q è la probabilità condizionata di evento nell’intervallo, p = 1 − q; S(t) è il prodotto dei p fino a quell’intervallo.'),
          medianRow
            ? copy('La sopravvivenza scende sotto 0,50 nell’intervallo {s1}–{s2}.', { s1: fmtEst(medianRow.start, 2), s2: fmtEst(medianRow.end, 2) })
            : copy('La sopravvivenza non scende sotto 0,50 entro l’ultimo intervallo: la mediana non è raggiunta.'),
          copy('Il livello di confidenza dichiarato è {s1}%; l’errore standard della tavola è quello di Greenwood.', { s1: level }),
        ],
      },
      {
        heading: copy('Assunzioni'),
        bullets: [
          copy('Censura non informativa e uniforme dentro ogni intervallo.'),
          copy('Intervalli di uguale ampiezza scelti sui dati: cambiando il numero di intervalli cambia la granularità della stima.'),
          copy('Con intervalli molto piccoli q diventa rumoroso; con pochi intervalli si perde la forma della curva.'),
        ],
      },
    ],
    limitations: [
      copy('La tavola attuariale è descrittiva: non aggiusta per covariariate né confronta gruppi con un test formale.'),
      copy('La scelta degli intervalli è arbitraria e va dichiarata nel report.'),
      copy('Nelle code con pochi a rischio le stime sono instabili.'),
    ],
  };
};

/** Reading report for the Turnbull interval-censored estimate. */
export const turnbullReport = (result: TurnbullResult, level: number): ReportSpec => {
  const final = result.points[result.points.length - 1];
  const mass = result.points.reduce((sum, point) => sum + point.mass, 0);
  return {
    id: 'survival-turnbull',
    title: copy('Report di lettura — Censura a intervalli'),
    headline: copy('NPMLE di Turnbull su {s1} osservazioni: sopravvivenza finale {s2}.', {
      s1: result.n,
      s2: fmtEst(final?.survival ?? 0, 3),
    }),
    badge: copy('Turnbull'),
    tone: result.converged ? 'neutral' : 'caution',
    intro: [
      copy('La censura a intervalli si ha quando non osserviamo il tempo esatto dell’evento ma solo un intervallo che lo contiene: per esempio un guasto compreso tra due ispezioni.'),
      copy('La stima NPMLE di Turnbull è la distribuzione discreta che massimizza la verosimiglianza sui soli intervalli osservati; non richiede di scegliere un punto dentro l’intervallo.'),
    ],
    sections: [
      {
        heading: copy('Come leggere il supporto'),
        body: [
          copy('Ogni punto del supporto è la fine di un intervallo in cui la stima concentra massa: la massa è la probabilità attribuita a quell’intervallo.'),
          copy('La somma delle masse è {s1}: se è vicina a 1 la distribuzione è completa, altrimenti parte della probabilità è oltre l’ultimo tempo osservato.', { s1: fmtEst(mass, 4) }),
          copy('La funzione di sopravvivenza è costante a tratti e scende solo alla fine degli intervalli con massa; il livello dichiarato è {s1}%.', { s1: level }),
          result.converged
            ? copy('L’algoritmo EM ha raggiunto la convergenza in {s1} iterazioni.', { s1: result.iterations })
            : copy('L’EM non ha raggiunto la convergenza: la stima è instabile e va interpretata con cautela.'),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Censura non informativa: il fatto di essere controllato a un certo tempo non dipende dal rischio.'),
          copy('Gli intervalli devono essere costruiti in modo coerente (stesse ispezioni o stesse finestre).'),
          copy('La NPMLE può non essere unica: intervalli adiacenti con massa piatta sono equivalenti.'),
          copy('Con pochi intervalli osservati il supporto è grossolano e la curva poco informativa.'),
        ],
      },
    ],
    limitations: [
      copy('La stima è non parametrica e descrittiva: non aggiusta per covariariate.'),
      copy('Non fornisce una curva continua né una mediana puntuale quando la massa è distribuita su intervalli ampi.'),
    ],
  };
};
