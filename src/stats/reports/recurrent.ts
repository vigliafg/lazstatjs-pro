import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import { isDecided, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export const recurrentReport = (tables: TableSpec[], level: number): ReportSpec => {
  const summary = tableById(tables, 'recurrent-summary')?.rows ?? [];
  const coefficients = tableById(tables, 'recurrent-coefficients')?.rows ?? [];
  const value = (metric: string): number =>
    Number(summary.find(row => String(row.metric) === metric)?.raw ?? NaN);
  const subjects = value(copy('Soggetti'));
  const events = value(copy('Eventi'));
  const episodes = value(copy('Episodi'));
  const strongest = coefficients
    .slice()
    .sort((left, right) => Math.abs(Number(right.z ?? 0)) - Math.abs(Number(left.z ?? 0)))[0];
  const significant = strongest ? isDecided(Number(strongest.p), level) : false;

  return {
    id: 'recurrent',
    title: copy('Report di lettura — Eventi ricorrenti'),
    headline: copy('{s1} eventi in {s2} soggetti e {s3} episodi.', {
      s1: events,
      s2: subjects,
      s3: episodes,
    }),
    badge: copy('Eventi ricorrenti'),
    tone: 'neutral',
    intro: [
      copy('Gli eventi ricorrenti sono eventi che possono accadere più volte alla stessa persona: ricadute, guasti, ricoveri.'),
      copy('Trattare ogni evento come indipendente sottostima gli errori standard, perché gli eventi dello stesso soggetto sono correlati.'),
    ],
    sections: [
      {
        heading: copy('Il modello'),
        body: [
          copy('Andersen–Gill usa il processo di conteggio: ogni soggetto rientra nel rischio dopo ogni evento e gli errori standard sono raggruppati per soggetto.'),
          copy('Wei–Lin–Weissfeld stratifica per numero di evento e usa il tempo dal precedente evento: confronta il primo evento con il primo, il secondo con il secondo, eccetera.'),
          strongest
            ? copy('La covariata con effetto più netto è {s1}: HR = {s2} (p = {s3}) — {s4}.', {
                s1: String(strongest.term),
                s2: fmtEst(Number(strongest.hr), 3),
                s3: fmtP(Number(strongest.p)),
                s4: significant
                  ? copy('l’associazione è compatibile con un effetto reale.')
                  : copy('non c’è evidenza sufficiente di un effetto.'),
              })
            : copy('Nessuna covariata nel modello.'),
        ],
      },
      {
        heading: copy('Come leggere gli hazard ratio'),
        body: [
          copy('Un HR maggiore di 1 indica un rischio più alto di un nuovo evento, non un tempo più lungo.'),
          copy('Gli intervalli di confidenza sono basati sugli errori standard robusti: sono la lettura corretta quando un soggetto contribuisce con più eventi.'),
          copy('Il livello di confidenza è {s1}%.', { s1: level }),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Censura non informativa e definizione coerente di episodio.'),
          copy('Gli eventi dello stesso soggetto possono essere correlati: il modello robusto lo tiene conto, ma non spiega perché.'),
          copy('Il modello AG assume che l’effetto delle covariati sia costante tra gli eventi.'),
          copy('Con pochi soggetti gli errori robusti sono instabili.'),
        ],
      },
    ],
    limitations: [
      copy('Non distingue tipi diversi di evento: per cause diverse servono modelli separati o un modello multi-stato.'),
      copy('La scelta tra AG e WLW cambia la domanda: AG descrive il processo complessivo, WLW confronta eventi dello stesso ordine.'),
      copy('Non sono stimati effetti casuali per soggetto né fragilità.'),
    ],
  };
};
