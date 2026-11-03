import { fmtEst } from '../format';
import { copy } from '../reportCopy';
import { tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import type { ReliabilityResult } from '../reliability/types';

export const reliabilityReport = (tables: TableSpec[], result: ReliabilityResult, level: number): ReportSpec => {
  if (result.mode === 'growth' && result.growth) {
    const growth = result.growth;
    const summary = tableById(tables, 'reliability-growth-summary')?.rows ?? [];
    const value = (metric: string): number =>
      Number(summary.find(row => String(row.metric) === metric)?.raw ?? NaN);
    return {
      id: 'reliability-growth',
      title: copy('Report di lettura — Crescita dell’affidabilità'),
      headline: copy('β = {s1}: {s2} con {s3} guasti e MTBF istantaneo {s4}.', {
        s1: fmtEst(growth.beta, 3),
        s2: growth.beta < 1 ? copy('tasso di guasto decrescente') : copy('nessuna crescita netta'),
        s3: growth.n,
        s4: fmtEst(growth.mtbfInstantaneous, 3),
      }),
      badge: copy('Crow–AMSAA'),
      tone: growth.beta < 1 ? 'positive' : 'caution',
      intro: [
        copy('La crescita dell’affidabilità studia un sistema che viene corretto mentre si guasta: se le correzioni funzionano, il tempo tra guasti aumenta.'),
        copy('Il modello Crow–AMSAA descrive il numero cumulato di guasti come una legge di potenza nel tempo; β < 1 indica un tasso di guasto che cala.'),
      ],
      sections: [
        {
          heading: copy('I parametri'),
          body: [
            copy('β = {s1} è la forma della curva: sotto 1 il tasso di guasto diminuisce, sopra 1 aumenta.', { s1: fmtEst(growth.beta, 3) }),
            copy('λ = {s1} è la scala: modifica il numero atteso di guasti a parità di tempo.', { s1: fmtEst(growth.lambda, 6) }),
            copy('Il MTBF istantaneo è {s1}; quello cumulativo è {s2}.', {
              s1: fmtEst(growth.mtbfInstantaneous, 3),
              s2: fmtEst(growth.mtbfCumulative, 3),
            }),
            copy('Il tasso di crescita è {s1}: {s2}', {
              s1: fmtEst(growth.growthRate, 3),
              s2:
                growth.growthRate > 0
                  ? copy('positivo, quindi l’affidabilità sta migliorando.')
                  : copy('non positivo, quindi non c’è evidenza di miglioramento.'),
            }),
          ],
        },
        {
          heading: copy('Assunzioni e cautele'),
          bullets: [
            copy('I guasti seguono un processo di Poisson non omogeneo con intensità a legge di potenza.'),
            copy('Le correzioni sono cumulative e il sistema è lo stesso nel tempo.'),
            copy('I tempi sono cumulati dall’inizio del programma, non tempi tra guasti isolati.'),
            copy('Con pochi guasti la stima di β è molto incerta.'),
          ],
        },
      ],
      limitations: [
        copy('Il modello descrive il processo aggregato, non il meccanismo di guasto.'),
        copy('Non distingue correzioni efficaci da cambiamenti del sistema o del carico.'),
        copy('L’estrapolazione oltre l’ultimo tempo osservato è un’assunzione.'),
        copy('Il livello di confidenza dichiarato ({s1}%) riguarda la presentazione, non è un intervallo formale per β.', { s1: level }),
      ],
    };
  }

  const rbd = result.rbd;
  const stageRows = tableById(tables, 'reliability-rbd-stages')?.rows ?? [];
  return {
    id: 'reliability-rbd',
    title: copy('Report di lettura — Diagramma di affidabilità'),
    headline: rbd
      ? copy('Affidabilità del sistema {s1} ({s2}%): {s3} stadi in serie.', {
          s1: fmtEst(rbd.system, 4),
          s2: fmtEst(rbd.system * 100, 2),
          s3: rbd.stages.length,
        })
      : copy('Nessuno stadio valido.'),
    badge: copy('RBD'),
    tone: 'neutral',
    intro: [
      copy('Un diagramma a blocchi di affidabilità rappresenta il sistema come una serie di stadi: ogni stadio deve funzionare perché il sistema funzioni.'),
      copy('Dentro ogni stadio i componenti sono in parallelo: lo stadio funziona se almeno uno dei suoi componenti funziona.'),
    ],
    sections: [
      {
        heading: copy('Come si combina l’affidabilità'),
        body: [
          copy('Uno stadio con componenti in parallelo ha affidabilità 1 − Π(1 − r_i): aggiungere componenti aumenta l’affidabilità dello stadio.'),
          copy('Il sistema in serie ha affidabilità Π R_stadio: più stadi in serie riducono l’affidabilità complessiva.'),
          stageRows.length > 0
            ? copy('Lo stadio più debole è quello con affidabilità più bassa: è lì che conviene intervenire.')
            : copy('Nessuno stadio da leggere.'),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('I componenti sono indipendenti e hanno affidabilità note senza incertezza.'),
          copy('La struttura serie/parallelo riflette davvero il funzionamento del sistema.'),
          copy('Non sono modellati guasti correlati, cause comuni o riparazioni.'),
        ],
      },
    ],
    limitations: [
      copy('L’affidabilità del sistema è un prodotto di valori puntuali: non propaga l’incertezza dei componenti.'),
      copy('Il diagramma non dice nulla sulla durata nel tempo né sulla manutenzione.'),
      copy('Componenti con lo stesso valore ma strutture diverse possono dare lo stesso risultato: il diagramma va letto insieme all’architettura.'),
    ],
  };
};
