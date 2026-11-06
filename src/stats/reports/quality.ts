import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { ReportSpec } from '../report';
import type { CapabilityResult, ControlResult, ParetoResult } from '../analysisResults';

export const qualityControlReport = (result: ControlResult, variableName: string): ReportSpec => {
  const stable = result.outCount === 0;
  return {
    id: 'quality-control',
    title: copy('Report di lettura — Carta di controllo'),
    headline: stable
      ? copy('Il processo è stabile: nessun punto supera i limiti di controllo.')
      : copy('{s1} punti superano i limiti: il processo mostra segnali di instabilità.', {
          s1: result.outCount,
        }),
    badge: result.chart.toUpperCase(),
    tone: stable ? 'positive' : 'caution',
    intro: [
      copy('La carta di controllo separa la variabilità ordinaria del processo dagli scostamenti che meritano un’indagine.'),
      copy('I limiti non sono specifiche: sono calcolati dalla variabilità interna del processo e descrivono ciò che il processo produce quando resta stabile.'),
    ],
    sections: [
      {
        heading: copy('La carta'),
        bullets: [
          copy('Centro = {s1}, sigma stimata = {s2}.', {
            s1: fmtEst(result.center, 4),
            s2: fmtEst(result.sigma, 4),
          }),
          copy('Limiti di controllo: {s1} — {s2}.', {
            s1: fmtEst(result.lcl, 4),
            s2: fmtEst(result.ucl, 4),
          }),
          copy('I punti fuori limite sono {s1} su {s2}.', {
            s1: result.outCount,
            s2: result.points.length,
          }),
          ...(result.limits.length > 0
            ? [
                copy(
                  'I sottogruppi non hanno tutti la stessa dimensione: ogni punto ha i propri limiti, più stretti dove il sottogruppo è più numeroso.'
                ),
              ]
            : []),
        ],
      },
      {
        heading: copy('Cosa fare'),
        body: [
          copy('Un punto fuori limite è un segnale da spiegare con la sequenza reale delle osservazioni: cause speciali, cambi di turno, lotti diversi o errori di misura.'),
          copy('La carta non dimostra che il processo sia capace: per questo serve la capacità rispetto alle specifiche.'),
        ],
      },
    ],
    limitations: [
      copy('I limiti sono stimati dai dati: con pochi sottogruppi sono instabili e vanno letti come indicativi.'),
    ],
  };
};

export const qualityCapabilityReport = (
  result: CapabilityResult,
  variableName: string
): ReportSpec => {
  const capable = result.cpk >= 1.33;
  const marginal = result.cpk >= 1;
  return {
    id: 'quality-capability',
    title: copy('Report di lettura — Capacità del processo'),
    headline: capable
      ? copy('Il processo è capace: Cpk = {s1}.', { s1: fmtEst(result.cpk, 3) })
      : marginal
        ? copy('Il processo è marginalmente capace: Cpk = {s1}.', { s1: fmtEst(result.cpk, 3) })
        : copy('Il processo non è capace: Cpk = {s1}.', { s1: fmtEst(result.cpk, 3) }),
    badge: copy('Cpk {s1}', { s1: fmtEst(result.cpk, 3) }),
    tone: capable ? 'positive' : marginal ? 'caution' : 'neutral',
    intro: [
      copy('La capacità confronta la variabilità del processo con l’ampiezza delle specifiche: non dice se il processo è stabile, solo quanto margine ha rispetto ai limiti.'),
      copy('Cp misura il margine potenziale, Cpk tiene conto anche dello scostamento della media dal centro delle specifiche.'),
    ],
    sections: [
      {
        heading: copy('Indici'),
        bullets: [
          copy('Cp = {s1}, Cpk = {s2}.', { s1: fmtEst(result.cp, 3), s2: fmtEst(result.cpk, 3) }),
          copy('CPU = {s1}, CPL = {s2}.', { s1: fmtEst(result.cpu, 3), s2: fmtEst(result.cpl, 3) }),
          copy('Quota attesa fuori specifica = {s1}% ({s2} ppm).', {
            s1: fmtEst(result.pctOut, 4),
            s2: fmtEst(result.ppm, 1),
          }),
        ],
      },
      {
        heading: copy('Come leggerli'),
        body: [
          copy('Un Cpk attorno a 1,33 è il riferimento comune per un processo capace; sotto 1 il processo produce una quota non trascurabile di valori fuori specifica.'),
          copy('La stima assume normalità e un processo stabile: con distribuzioni asimmetriche o dati dipendenti dal tempo gli indici vanno interpretati con cautela.'),
        ],
      },
    ],
    limitations: [
      copy('Cp e Cpk usano la deviazione standard complessiva: se il processo non è stabile la capacità descrive la mescolanza di stati diversi, non il processo ideale.'),
    ],
  };
};

export const qualityParetoReport = (result: ParetoResult, categoryName: string): ReportSpec => {
  const top = result.rows[0];
  const vital = result.rows.filter(row => row.cumulative <= 80).length;
  return {
    id: 'quality-pareto',
    title: copy('Report di lettura — Pareto'),
    headline: top
      ? copy('{s1} è la categoria più frequente ({s2}%).', {
          s1: top.category,
          s2: fmtEst(top.pct, 1),
        })
      : copy('Nessuna categoria da mostrare.'),
    badge: copy('{s1} categorie', { s1: result.rows.length }),
    tone: 'neutral',
    intro: [
      copy('Il Pareto ordina le categorie per frequenza: poche categorie spiegano la maggior parte dei casi, ed è lì che conviene intervenire.'),
      copy('La linea cumulata mostra quando si raggiunge la quota di interesse; non è una legge naturale ma una descrizione dei dati osservati.'),
    ],
    sections: [
      {
        heading: copy('Prime categorie'),
        bullets: result.rows.slice(0, 5).map(row =>
          copy('{s1}: {s2} casi ({s3}%, cumulata {s4}%).', {
            s1: row.category,
            s2: row.count,
            s3: fmtEst(row.pct, 1),
            s4: fmtEst(row.cumulative, 1),
          })
        ),
      },
      {
        heading: copy('Come usarlo'),
        body: [
          copy('Le categorie che raggiungono l’80% cumulato sono {s1}. Sono un punto di partenza per la priorità, non una prova di causalità.', {
            s1: vital,
          }),
        ],
      },
    ],
    limitations: [
      copy('La categoria {s1} dipende da come sono state definite le categorie: raggruppamenti diversi cambiano la classifica.', { s1: categoryName }),
    ],
  };
};
