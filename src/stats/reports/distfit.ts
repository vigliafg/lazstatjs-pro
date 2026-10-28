import { fmtEst, fmtP } from '../format';
import { tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import { DISTRIBUTION_LABEL } from '../distfit/types';

const strengthOfEvidence = (deltaAic: number): string => {
  if (!Number.isFinite(deltaAic)) return 'non calcolabile';
  if (deltaAic < 2) return 'praticamente equivalente';
  if (deltaAic < 6) return 'moderatamente migliore';
  return 'chiaramente migliore';
};

export const distributionFitReport = (tables: TableSpec[], level: number): ReportSpec => {
  const parameters = tableById(tables, 'fit-parameters')?.rows ?? [];
  if (parameters.length === 0) {
    return {
      id: 'distfit',
      title: 'Report di lettura',
      headline: 'Nessuna distribuzione stimabile con questi dati.',
      badge: 'Fit non disponibile',
      tone: 'caution',
      intro: ['Servono almeno tre valori e, per le distribuzioni a supporto positivo, tutti i valori maggiori di zero.'],
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
    title: 'Report di lettura',
    headline: `La distribuzione che descrive meglio i dati è la ${bestName.toLowerCase()} (AIC = ${fmtEst(Number(best.aic), 1)}).`,
    badge: 'Distribuzione stimata',
    tone: 'neutral',
    intro: [
      'Il fitting cerca la distribuzione teorica che rende più plausibile il campione osservato, e serve per descrivere la variabile, stimare percentili e alimentare carte di controllo o analisi di affidabilità.',
      `La scelta qui è guidata dall’AIC, che premia l’adattamento e penalizza i parametri in più. La ${bestName.toLowerCase()} ha AIC = ${fmtEst(Number(best.aic), 1)}${
        second ? `, ${strengthOfEvidence(delta)} della seconda (${String(second.distribution)}, ΔAIC = ${fmtEst(delta, 1)})` : ''
      }.`,
    ],
    sections: [
      {
        heading: 'I parametri stimati',
        bullets: [
          `Parametri: ${String(best.parameters)}. Sono stime di massima verosimiglianza, non medie campionarie.`,
          `Log-verosimiglianza = ${fmtEst(Number(best.logLik), 2)}: valore assoluto poco interpretabile, utile solo per confrontare modelli.`,
          Number.isFinite(Number(ksRow?.ks))
            ? `KS D = ${fmtEst(Number(ksRow?.ks), 4)} (p indicativo ${fmtP(Number(ksRow?.ksP))}): ${Number(ksRow?.ksP) < 0.05 ? 'la distribuzione non è un buon adattamento ai dati' : 'non c’è evidenza contraria all’adattamento'}.`
            : 'La bontà di adattamento non è calcolabile.',
        ],
      },
      {
        heading: 'Cosa ci fai con questa distribuzione',
        bullets: [
          median ? `Mediana stimata: ${fmtEst(Number(median.value), 3)}.` : '',
          p95 ? `95° percentile stimato: ${fmtEst(Number(p95.value), 3)} (il 5% delle osservazioni dovrebbe superarlo).` : '',
          'Puoi usarla per definire limiti di specifica, stimare la probabilità di superare una soglia o generare dati simulati coerenti.',
        ].filter(Boolean),
      },
      {
        heading: 'Come leggere il confronto',
        body: [
          'L’AIC non dice che la distribuzione scelta sia “vera”: dice che è la meno peggiore tra quelle provate. Se le prime due sono a meno di 2 punti, i dati non distinguono tra loro e la scelta va fatta con criteri esterni (supporto, comportamento delle code, semplicità).',
        ],
      },
      {
        heading: 'Assunzioni e cautele',
        bullets: [
          'Le osservazioni devono essere indipendenti e provenire dalla stessa popolazione.',
          'Le distribuzioni a supporto positivo (lognormale, esponenziale, gamma, Weibull) richiedono valori > 0; i valori nulli o negativi le escludono.',
          'Con N piccolo le stime delle code sono instabili: i percentili estremi vanno riportati con prudenza.',
          'Un buon AIC non compensa un disegno di campionamento distorto.',
        ],
      },
    ],
    limitations: [
      'Il p-value del test KS è calcolato con la formula asintotica e non corregge per i parametri stimati: è indicativo, non definitivo.',
      'Non sono inclusi modelli con dati censurati (Weibull su dati di sopravvivenza troncati).',
      `Il livello di confidenza scelto (${level}%) non si applica ai percentili stimati da una distribuzione fittata.`,
    ],
  };
};
