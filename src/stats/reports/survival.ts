import { fmtEst, fmtP } from '../format';
import { copy, sourceOf } from '../reportCopy';
import { isDecided, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

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
