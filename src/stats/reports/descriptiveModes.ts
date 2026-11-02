/**
 * Written readings for the three Descriptive modes.
 *
 * They share the report contract with `descriptiveReport`: a headline, a
 * per-variable result section and a short methodological section. The prose
 * goes through `copy()` like every other report, so the six locales stay in
 * sync through the locale check.
 */
import { copy } from '../reportCopy';
import type { ReportSpec } from './shared';
import { alphaText, isDecided, show, showInt } from './shared';
import { equalShareChiSquare } from '../kernels/frequency';
import type { NamedFrequency } from '../tables/frequency';
import type { NamedOutliers } from '../tables/outliers';
import type { NamedRuns } from '../tables/runs';

const PERCENT = (value: number): string => `${show(value, 2)}%`;

export const frequencyReport = (entries: NamedFrequency[], level: number): ReportSpec => {
  const totalLevels = entries.reduce((sum, entry) => sum + entry.result.distinct, 0);
  const bullets = entries.map(({ name, result }) => {
    const top = result.rows.reduce((best, row) => (row.count > best.count ? row : best), result.rows[0]);
    const gof = equalShareChiSquare(result);
    const shares = copy('{s1} modalità su {s2} osservazioni non mancanti', {
      s1: result.distinct,
      s2: showInt(result.total),
    });
    const mode = copy('la più frequente è “{s1}” con {s2} casi', {
      s1: top.value,
      s2: PERCENT(top.percent),
    });
    const spread =
      gof === null
        ? ''
        : isDecided(gof.p, level)
          ? copy('le quote uguali sono rifiutate (χ² = {s1}, p = {s2})', {
              s1: show(gof.chi2, 2),
              s2: show(gof.p, 4),
            })
          : copy('le quote uguali non sono rifiutate (χ² = {s1}, p = {s2})', {
              s1: show(gof.chi2, 2),
              s2: show(gof.p, 4),
            });
    return copy('{s1}: {s2}; {s3}{s4}.', {
      s1: name,
      s2: shares,
      s3: mode,
      s4: spread ? `; ${spread}` : '',
    });
  });

  return {
    id: 'report-frequency',
    title: copy('Report di lettura — Frequenze'),
    headline:
      entries.length === 1
        ? copy('La variabile {s1} ha {s2} modalità distinte.', {
            s1: entries[0].name,
            s2: showInt(entries[0].result.distinct),
          })
        : copy('Frequenze di {s1} variabili, {s2} modalità in tutto.', {
            s1: showInt(entries.length),
            s2: showInt(totalLevels),
          }),
    badge: copy('Conteggi'),
    tone: entries.some(entry => {
      const gof = equalShareChiSquare(entry.result);
      return gof !== null && isDecided(gof.p, level);
    })
      ? 'caution'
      : 'neutral',
    intro: [
      copy('La tabella di frequenza conta quante volte compare ogni modalità e mostra la percentuale sul totale delle osservazioni valide.'),
      copy('L’intervallo di Wilson tiene conto della numerosità: con pochi casi è largo anche quando la percentuale sembra precisa.'),
    ],
    sections: [
      { heading: copy('Risultato per variabile'), bullets },
      {
        heading: copy('Come leggere i numeri'),
        bullets: [
          copy('Il conteggio ignora le celle vuote; la percentuale è calcolata sul totale non mancante, non sul numero di righe.'),
          copy('Il test di bontà di adattamento confronta le modalità con quote uguali: serve a capire se una categoria domina, non a stimare la sua proporzione.'),
          copy('Con molte modalità il test χ² diventa fragile: raggruppa le categorie rare prima di leggerlo.'),
        ],
      },
    ],
    limitations: [
      copy('Le frequenze descrivono il campione osservato: non dicono nulla sulla popolazione senza un modello o un disegno di campionamento.'),
      copy('Una variabile continua con molti valori distinti non va conteggiata: usa la sintesi descrittiva o crea classi.'),
      copy('Le percentuali non sono indipendenti tra loro: sommano a 100 e un intervallo alla volta non corregge per i confronti multipli.'),
    ],
  };
};

const outlierVerdict = (
  name: string,
  grubbsP: number,
  dixonP: number | null,
  level: number
): string => {
  const grubbs = isDecided(grubbsP, level);
  const dixon = dixonP !== null && isDecided(dixonP, level);
  if (!grubbs && !dixon) {
    return copy('{s1}: nessuno dei due test segnala valori anomali.', { s1: name });
  }
  if (grubbs && dixon) {
    return copy('{s1}: Grubbs e Dixon segnalano entrambi un valore anomalo.', { s1: name });
  }
  return grubbs
    ? copy('{s1}: Grubbs segnala un valore anomalo, Dixon no.', { s1: name })
    : copy('{s1}: Dixon segnala un valore anomalo, Grubbs no.', { s1: name });
};

export const outliersReport = (entries: NamedOutliers[], level: number): ReportSpec => {
  const flagged = entries.filter(
    entry =>
      (entry.grubbs !== null && isDecided(entry.grubbs.p, level)) ||
      (entry.dixon !== null && isDecided(entry.dixon.p, level))
  ).length;

  const bullets = entries.map(({ name, grubbs, dixon }) => {
    const pieces: string[] = [];
    if (grubbs) {
      pieces.push(
        copy('Grubbs G = {s1}, p = {s2}', {
          s1: show(grubbs.statistic, 3),
          s2: show(grubbs.p, 4),
        })
      );
    }
    if (dixon) {
      pieces.push(
        copy('Dixon {s1} = {s2}, p = {s3}', {
          s1: dixon.type,
          s2: show(dixon.statistic, 3),
          s3: show(dixon.p, 4),
        })
      );
    } else {
      pieces.push(copy('Dixon non applicabile (servono 3–30 osservazioni)'));
    }
    return `${outlierVerdict(name, grubbs?.p ?? Number.NaN, dixon?.p ?? null, level)} ${pieces.join('; ')}.`;
  });

  return {
    id: 'report-outliers',
    title: copy('Report di lettura — Valori anomali'),
    headline:
      entries.length === 1
        ? copy('Test dei valori anomali per {s1}.', { s1: entries[0].name })
        : copy('Test dei valori anomali per {s1} variabili: {s2} con almeno un segnale.', {
            s1: showInt(entries.length),
            s2: showInt(flagged),
          }),
    badge: copy('Diagnostica'),
    tone: flagged > 0 ? 'caution' : 'neutral',
    intro: [
      copy('Grubbs e Dixon rispondono alla stessa domanda — l’osservazione più estrema è compatibile con le altre? — ma con assunzioni diverse.'),
      copy('Un test significativo non prova che il dato sia un errore: dice che è improbabile estrarlo da una popolazione normale con la stessa media e dispersione.'),
    ],
    sections: [
      { heading: copy('Risultato per variabile'), bullets },
      {
        heading: copy('Come leggere i numeri'),
        bullets: [
          copy('Grubbs standardizza lo scarto dalla media con la deviazione standard: risente degli estremi e va usato con campioni non troppo piccoli.'),
          copy('Dixon confronta differenze adiacenti ed è più robusto, ma è definito solo tra 3 e 30 osservazioni.'),
          copy('Il p-value è già corretto per il fatto che il candidato è il massimo scarto, non un’osservazione scelta a priori.'),
        ],
      },
    ],
    limitations: [
      copy('Entrambi i test assumono una popolazione normale: con distribuzioni asimmetriche il p-value non è affidabile.'),
      copy('Un outlier può essere un caso reale e importante: verifica la fonte prima di escluderlo.'),
      copy('Con molti valori estremi il test segnala solo il più lontano: ripetilo dopo aver rimosso il caso o usa una regola robusta come MAD.'),
    ],
  };
};

export const runsReport = (entries: NamedRuns[], level: number): ReportSpec => {
  const rejected = entries.filter(entry => isDecided(entry.result.p, level)).length;
  const bullets = entries.map(({ name, result }) => {
    const direction =
      result.runs < result.expected
        ? copy('meno sequenze del previsto: le osservazioni tendono a raggrupparsi')
        : copy('più sequenze del previsto: le osservazioni tendono ad alternarsi');
    const exact =
      result.exactP === null
        ? ''
        : copy('; p esatto {s1}', { s1: show(result.exactP, 4) });
    return copy('{s1}: {s2} sequenze su {s3} osservazioni (attese {s4}); {s5} (p = {s6}{s7}).', {
      s1: name,
      s2: showInt(result.runs),
      s3: showInt(result.n),
      s4: show(result.expected, 2),
      s5: direction,
      s6: show(result.p, 4),
      s7: exact,
    });
  });

  return {
    id: 'report-runs',
    title: copy('Report di lettura — Test delle sequenze'),
    headline:
      entries.length === 1
        ? copy('Sequenze di {s1} rispetto al punto di taglio {s2}.', {
            s1: entries[0].name,
            s2: show(entries[0].result.cut, 3),
          })
        : copy('Test delle sequenze per {s1} variabili: {s2} con ordine non casuale.', {
            s1: showInt(entries.length),
            s2: showInt(rejected),
          }),
    badge: copy('Diagnostica'),
    tone: rejected > 0 ? 'caution' : 'neutral',
    intro: [
      copy('Il test delle sequenze controlla se l’ordine delle righe è casuale: conta quante volte il valore attraversa il punto di taglio.'),
      copy('Serve per dati raccolti in sequenza — tempo, ordine di produzione, righe di un foglio — dove una tendenza o un ciclo rompe l’indipendenza.'),
    ],
    sections: [
      { heading: copy('Risultato per variabile'), bullets },
      {
        heading: copy('Come leggere i numeri'),
        bullets: [
          copy('Il punto di taglio predefinito è la mediana, così i due lati hanno all’incirca lo stesso numero di osservazioni.'),
          copy('Il z confronta le sequenze osservate con quelle attese sotto casualità; la correzione di continuità rende il test più prudente.'),
          copy('Il p esatto enumera tutte le disposizioni possibili: è il riferimento quando il campione è piccolo e l’approssimazione normale è dubbia.'),
        ],
      },
    ],
    limitations: [
      copy('Il test rileva dipendenza dall’ordine, non la forma della dipendenza: un p piccolo non distingue tendenza, ciclo e cluster.'),
      copy('Le osservazioni con valore uguale al punto di taglio finiscono nel lato basso: con molti pareggi il test diventa conservativo.'),
      copy('Il test assume che le osservazioni siano altrimenti identicamente distribuite: un cambiamento di livello a metà serie lo fa rifiutare anche senza vera dipendenza. Il livello usato è {s1}.', { s1: alphaText(level) }),
    ],
  };
};
