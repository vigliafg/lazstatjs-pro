import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import { isDecided, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export const altReport = (tables: TableSpec[], level: number): ReportSpec => {
  const summary = tableById(tables, 'alt-summary')?.rows ?? [];
  const coefficients = tableById(tables, 'alt-coefficients')?.rows ?? [];
  const value = (metric: string): number =>
    Number(summary.find(row => String(row.metric) === metric)?.raw ?? NaN);
  const n = value(copy('Osservazioni'));
  const events = value(copy('Eventi'));
  const acceleration = value(copy('Fattore di accelerazione'));
  const useStress = value(copy('Stress d’uso'));
  const referenceStress = value(copy('Stress di riferimento'));
  const stress = coefficients[0];
  const significant = stress ? isDecided(Number(stress.p), level) : false;

  return {
    id: 'alt',
    title: copy('Report di lettura — Test di vita accelerata'),
    headline: copy('Fattore di accelerazione {s1} tra stress {s2} e stress {s3}.', {
      s1: fmtEst(acceleration, 3),
      s2: fmtEst(referenceStress, 3),
      s3: fmtEst(useStress, 3),
    }),
    badge: copy('Weibull AFT'),
    tone: 'neutral',
    intro: [
      copy('I test di vita accelerata sottopongono i componenti a stress più alti del normale per osservare i guasti in meno tempo, poi riportano la stima allo stress d’uso.'),
      copy('Il modello usato è un AFT di Weibull: il log del tempo alla vita è una funzione lineare della trasformazione scelta per lo stress.'),
    ],
    sections: [
      {
        heading: copy('Il fattore di accelerazione'),
        body: [
          copy('Il fattore è il rapporto tra il tempo di vita atteso allo stress d’uso e quello allo stress di riferimento: valori sopra 1 indicano vita più lunga a stress d’uso.'),
          stress
            ? copy('Il coefficiente dello stress è {s1} (p = {s2}) — {s3}.', {
                s1: fmtEst(Number(stress.beta), 3),
                s2: fmtP(Number(stress.p)),
                s3: significant
                  ? copy('lo stress è associato alla durata in modo statisticamente rilevabile.')
                  : copy('non c’è evidenza sufficiente di un effetto dello stress.'),
              })
            : copy('Nessun coefficiente dello stress disponibile.'),
          copy('La stima si basa su {s1} osservazioni e {s2} eventi; il livello di confidenza è {s3}%.', {
            s1: n,
            s2: events,
            s3: level,
          }),
        ],
      },
      {
        heading: copy('Come leggere il modello'),
        body: [
          copy('La scala σ descrive la dispersione dei tempi: valori alti indicano tempi più variabili.'),
          copy('Il time ratio si riferisce a un’unità in più della variabile trasformata, non a un’unità di stress grezzo.'),
          copy('La forma AFT implica che lo stress moltiplichi il tempo di vita: se il meccanismo cambia, il modello non è più valido.'),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Lo stress è misurato senza errore e i livelli sono sufficientemente distinti.'),
          copy('La distribuzione di Weibull descrive adeguatamente i tempi.'),
          copy('Il meccanismo di guasto è lo stesso a tutti i livelli di stress.'),
          copy('L’estrapolazione oltre i livelli osservati è un rischio: dichiarala e, se possibile, verificala con un livello intermedio.'),
        ],
      },
    ],
    limitations: [
      copy('Non sono inclusi guasti competitivi né fragilità tra lotti.'),
      copy('Il fattore di accelerazione dipende dalla scelta del livello di riferimento.'),
      copy('Con pochi eventi la stima dello stress è instabile e l’estrapolazione può divergere.'),
    ],
  };
};
