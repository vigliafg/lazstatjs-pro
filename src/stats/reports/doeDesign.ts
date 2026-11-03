import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { DoeDesignResult } from '../analysisResults';

export const doeDesignReport = (result: DoeDesignResult): ReportSpec => ({
  id: 'doe-design',
  title: copy('Report di lettura — Disegno sperimentale'),
  headline: copy('{s1} run per {s2} fattori.', {
    s1: result.runs,
    s2: result.factors,
  }),
  badge: copy('{s1} run', { s1: result.runs }),
  tone: 'neutral',
  intro: [
    copy('La matrice elenca le combinazioni da provare in livelli codificati: −1 e +1 sono i livelli basso e alto, 0 il centro.'),
    copy('Il disegno decisionale viene prima dei dati: stabilisce quali effetti sono stimabili e con quale precisione.'),
  ],
  sections: [
    {
      heading: copy('Struttura'),
      bullets: [
        copy('Punti ai vertici: {s1}; assiali: {s2}; centrali: {s3}.', {
          s1: result.cornerRuns,
          s2: result.axialRuns,
          s3: result.centerRuns,
        }),
        result.alpha !== null
          ? copy('α assiale = {s1} per un disegno rotabile.', { s1: result.alpha.toFixed(4) })
          : copy('Nessun punto assiale: i fattori restano ai livelli del disegno fattoriale.'),
        result.resolution !== null
          ? copy('Risoluzione {s1}: gli effetti principali non sono confusi con altri effetti principali.', {
              s1: result.resolution,
            })
          : copy('Disegno non frazionato: tutti gli effetti previsti sono stimabili.'),
      ],
    },
    {
      heading: copy('Come usarlo'),
      body: [
        copy('Esegui i run nell’ordine indicato e registra la risposta con lo stesso protocollo per ogni combinazione.'),
        copy('I punti centrali stimano la curvatura e l’errore puro; senza repliche il test degli effetti dipende dalle interazioni.'),
      ],
    },
  ],
  limitations: [
    copy('Il generatore descrive il piano, non garantisce che il processo sperimentale sia sotto controllo: randomizza l’ordine e controlla i fattori di disturbo.'),
  ],
});
