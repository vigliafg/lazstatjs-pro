import { fmtEst, fmtP } from '../format';
import { isDecided, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export const survivalReport = (tables: TableSpec[], level: number): ReportSpec => {
  const summary = tableById(tables, 'surv-summary')?.rows ?? [];
  const logRank = tableById(tables, 'surv-logrank')?.rows ?? [];
  const km = tableById(tables, 'surv-km')?.rows ?? [];

  const overall = summary[0];
  const p = Number(logRank.find(row => String(row.metric) === 'p')?.pValue ?? NaN);
  const significant = isDecided(p, level);
  const hr = Number(logRank.find(row => String(row.metric).startsWith('Hazard ratio'))?.hrValue ?? NaN);
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
    title: 'Report di lettura',
    headline:
      summary.length > 1 && Number.isFinite(p)
        ? significant
          ? `Le curve dei gruppi differiscono (log-rank p = ${fmtP(p)}).`
          : `Nessuna differenza tra le curve dei gruppi (log-rank p = ${fmtP(p)}).`
        : Number.isFinite(median)
          ? `Mediana di sopravvivenza: ${fmtEst(median, 2)} (${events} eventi su ${n}).`
          : `La mediana non viene raggiunta: ${events} eventi su ${n}.`,
    badge: 'Sopravvivenza',
    tone: summary.length > 1 && significant ? 'positive' : 'neutral',
    intro: [
      'L’analisi di sopravvivenza stima quanto tempo passa prima di un evento (guarigione, guasto, abbandono) tenendo conto delle osservazioni censurate, cioè di chi non ha ancora avuto l’evento quando lo studio finisce.',
      `Qui ci sono ${n} osservazioni, ${events} eventi e ${censored} censurati: trattare i censurati come “nessun evento” o escluderli darebbe stime distorte, mentre Kaplan–Meier li mantiene nel rischio finché sono osservati.`,
    ],
    sections: [
      {
        heading: 'La curva e la mediana',
        body: [
          Number.isFinite(median)
            ? `La mediana di sopravvivenza è ${fmtEst(median, 2)}: a quel tempo la curva scende sotto 0,50.${Number.isFinite(Number(overall?.medianLo)) ? ` Intervallo ${fmtEst(Number(overall?.medianLo), 2)} – ${fmtEst(Number(overall?.medianHi), 2)}.` : ''}`
            : 'La curva non scende sotto 0,50 entro l’ultimo tempo osservato: la mediana non è raggiunta (non è “infinita”, semplicemente non stimabile con questo follow-up).',
          Number.isFinite(finalSurvival)
            ? `All’ultimo tempo osservato la sopravvivenza stimata è ${fmtEst(finalSurvival, 3)} (${fmtEst(finalSurvival * 100, 1)}%).`
            : 'La sopravvivenza finale non è calcolabile.',
          Number.isFinite(rmst)
            ? `RMST = ${fmtEst(rmst, 2)}: area media sotto la curva fino all’ultimo tempo, cioè il tempo medio trascorso senza evento entro l’orizzonte osservato.`
            : 'RMST non calcolabile.',
        ],
      },
      {
        heading: summary.length > 1 ? 'Confronto tra gruppi' : 'Confronto tra gruppi non richiesto',
        body:
          summary.length > 1
            ? [
                `Gruppi: ${groups.join(', ')}. Il log-rank dà χ² = ${String(logRank.find(row => String(row.metric) === 'χ²')?.value ?? '—')} con p = ${fmtP(p)}: ${significant ? 'le curve non sono compatibili con l’ipotesi di uguale sopravvivenza.' : 'non c’è evidenza che le curve differiscano.'}`,
                Number.isFinite(hr)
                  ? `Hazard ratio = ${fmtEst(hr, 3)} (${String(logRank.find(row => String(row.metric).startsWith('HR CI low'))?.value ?? '—')} – ${String(logRank.find(row => String(row.metric).startsWith('HR CI high'))?.value ?? '—')}): ${hr > 1 ? 'il primo gruppo ha un rischio di evento maggiore.' : 'il primo gruppo ha un rischio di evento minore.'}`
                  : 'Con più di due gruppi l’hazard ratio non è riportato: usa la regressione di Cox per un HR aggiustato.',
              ]
            : ['Seleziona una variabile di gruppo per confrontare due o più curve con il log-rank.'],
      },
      {
        heading: 'Assunzioni e cautele',
        bullets: [
          'Censura non informativa: chi esce dallo studio non deve avere un rischio diverso da chi resta.',
          'Il tempo zero deve essere definito in modo omogeneo per tutte le osservazioni.',
          'La curva diventa imprecisa nelle code, dove restano poche osservazioni a rischio: guarda la colonna “a rischio”.',
          'Il log-rank dà lo stesso peso a tutti i tempi; se il rischio cambia nel tempo (curve che si incrociano) può non vedere differenze reali.',
          'Con pochi eventi per gruppo il test ha poca potenza e l’HR è instabile.',
        ],
      },
    ],
    limitations: [
      'Il log-rank non aggiusta per covariariate: per hazard ratio aggiustati o per più di due gruppi usa la scheda Cox (PH).',
      'Non sono stimati modelli parametrici (Weibull, esponenziale) con dati censurati.',
      'Il log-rank assume rischi proporzionali: curve che si incrociano richiedono altri test.',
      'L’hazard ratio è riportato solo per due gruppi.',
      'I tempi di censura coincidenti con un evento sono trattati come eventi allo stesso tempo (nessuna correzione per i ties oltre alla gestione standard del risk set).',
    ],
  };
};
