import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import { tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import { DISTRIBUTION_LABEL } from '../distfit/types';

const strengthOfEvidence = (deltaAic: number): string => {
  if (!Number.isFinite(deltaAic)) return copy('non calcolabile');
  if (deltaAic < 2) return copy('praticamente equivalente');
  if (deltaAic < 6) return copy('moderatamente migliore');
  return copy('chiaramente migliore');
};

export const distributionFitReport = (tables: TableSpec[], level: number): ReportSpec => {
  const parameters = tableById(tables, 'fit-parameters')?.rows ?? [];
  if (parameters.length === 0) {
    return {
      id: 'distfit',
      title: copy('Report di lettura'),
      headline: copy('Nessuna distribuzione stimabile con questi dati.'),
      badge: copy('Fit non disponibile'),
      tone: 'caution',
      intro: [copy('Servono almeno tre valori e, per le distribuzioni a supporto positivo, tutti i valori maggiori di zero.')],
      sections: [],
      limitations: [],
    };
  }

  const best = parameters[0];
  const second = parameters[1];
  const bestName = String(best.distribution);
  const delta = second ? Number(second.aic) - Number(best.aic) : NaN;
  const ksRow = (tableById(tables, 'fit-gof')?.rows ?? []).find(
    row => String(row.distribution) === bestName
  );
  const percentileRows = tableById(tables, 'fit-percentiles')?.rows ?? [];
  const median = percentileRows.find(row => String(row.p) === 'P50');
  const p95 = percentileRows.find(row => String(row.p) === 'P95');

  return {
    id: 'distfit',
    title: copy('Report di lettura'),
    headline: copy('La distribuzione che descrive meglio i dati è la {s1} (AIC = {s2}).', { s1: bestName.toLowerCase(), s2: fmtEst(Number(best.aic), 1) }),
    badge: copy('Distribuzione stimata'),
    tone: 'neutral',
    intro: [
      copy('Il fitting cerca la distribuzione teorica che rende più plausibile il campione osservato, e serve per descrivere la variabile, stimare percentili e alimentare carte di controllo o analisi di affidabilità.'),
      copy('La scelta qui è guidata dall’AIC, che premia l’adattamento e penalizza i parametri in più. La {s1} ha AIC = {s2}{s3}.', { s1: bestName.toLowerCase(), s2: fmtEst(Number(best.aic), 1), s3: 
        second ? copy(', {s1} della seconda ({s2}, ΔAIC = {s3})', { s1: strengthOfEvidence(delta), s2: String(second.distribution), s3: fmtEst(delta, 1) }) : ''
       }),
    ],
    sections: [
      {
        heading: copy('I parametri stimati'),
        bullets: [
          copy('Parametri: {s1}. Sono stime di massima verosimiglianza, non medie campionarie.', { s1: String(best.parameters) }),
          copy('Log-verosimiglianza = {s1}: valore assoluto poco interpretabile, utile solo per confrontare modelli.', { s1: fmtEst(Number(best.logLik), 2) }),
          Number.isFinite(Number(ksRow?.ks))
            ? copy('KS D = {s1} (p indicativo {s2}): {s3}.', { s1: fmtEst(Number(ksRow?.ks), 4), s2: fmtP(Number(ksRow?.ksP)), s3: Number(ksRow?.ksP) < 0.05 ? copy('la distribuzione non è un buon adattamento ai dati') : copy('non c’è evidenza contraria all’adattamento') })
            : copy('La bontà di adattamento non è calcolabile.'),
        ],
      },
      {
        heading: copy('Cosa ci fai con questa distribuzione'),
        bullets: [
          median ? copy('Mediana stimata: {s1}.', { s1: fmtEst(Number(median.value), 3) }) : '',
          p95 ? copy('95° percentile stimato: {s1} (il 5% delle osservazioni dovrebbe superarlo).', { s1: fmtEst(Number(p95.value), 3) }) : '',
          copy('Puoi usarla per definire limiti di specifica, stimare la probabilità di superare una soglia o generare dati simulati coerenti.'),
        ].filter(Boolean),
      },
      {
        heading: copy('Come leggere il confronto'),
        body: [
          copy('L’AIC non dice che la distribuzione scelta sia “vera”: dice che è la meno peggiore tra quelle provate. Se le prime due sono a meno di 2 punti, i dati non distinguono tra loro e la scelta va fatta con criteri esterni (supporto, comportamento delle code, semplicità).'),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Le osservazioni devono essere indipendenti e provenire dalla stessa popolazione.'),
          copy('Le distribuzioni a supporto positivo (lognormale, esponenziale, gamma, Weibull) richiedono valori > 0; i valori nulli o negativi le escludono.'),
          copy('Con N piccolo le stime delle code sono instabili: i percentili estremi vanno riportati con prudenza.'),
          copy('Un buon AIC non compensa un disegno di campionamento distorto.'),
        ],
      },
    ],
    limitations: [
      copy('Il p-value del test KS è calcolato con la formula asintotica e non corregge per i parametri stimati: è indicativo, non definitivo.'),
      copy('Non sono inclusi modelli con dati censurati (Weibull su dati di sopravvivenza troncati).'),
      copy('Il livello di confidenza scelto ({s1}%) non si applica ai percentili stimati da una distribuzione fittata.', { s1: level }),
    ],
  };
};
