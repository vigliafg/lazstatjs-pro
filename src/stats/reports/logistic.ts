import { fmtEst, fmtP } from '../format';
import { isDecided, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export const logisticReport = (tables: TableSpec[], level: number): ReportSpec => {
  const fitRows = tableById(tables, 'logit-fit')?.rows ?? [];
  const coefficientRows = tableById(tables, 'logit-coefficients')?.rows ?? [];
  const classification = tableById(tables, 'logit-classification')?.rows ?? [];
  const warning = tableById(tables, 'logit-warning');
  const modelP = Number(fitRows.find(row => String(row.metric) === 'p del modello')?.value ?? NaN);
  const pseudo = Number(fitRows.find(row => String(row.metric).startsWith('McFadden'))?.value ?? NaN);
  const auc = Number(classification.find(row => String(row.metric) === 'AUC')?.value ?? NaN);
  const accuracy = String(classification.find(row => String(row.metric) === 'Accuratezza')?.value ?? '');
  const predictors = coefficientRows.filter(row => String(row.predictor) !== '(Intercept)');
  const significant = predictors.filter(row => isDecided(Number(row.p), level));

  const describeOr = (row: (typeof predictors)[number]): string => {
    const or = Number(row.or);
    const direction = or > 1 ? 'aumenta' : 'riduce';
    return `${String(row.predictor)}: OR = ${fmtEst(or, 3)} (CI ${String(row.orLo)} – ${String(row.orHi)}), p = ${fmtP(Number(row.p))}: un’unità in più ${direction} le probabilità dell’esito di circa ${fmtEst(Math.abs(or - 1) * 100, 0)}%.`;
  };

  return {
    id: 'logistic',
    title: 'Report di lettura',
    headline: warning
      ? 'I dati separano quasi perfettamente gli esiti: le stime non sono affidabili.'
      : Number.isFinite(modelP) && modelP < 1 - level / 100
        ? `Il modello è significativo (LR p = ${fmtP(modelP)}) e ${significant.length === 1 ? '1 predittore pesa' : `${significant.length} predittori pesano`} sul risultato.`
        : `Il modello non è significativo (LR p = ${fmtP(modelP)}).`,
    badge: warning ? 'Separazione' : significant.length > 0 ? 'Modello informativo' : 'Modello debole',
    tone: warning ? 'caution' : significant.length > 0 ? 'positive' : 'neutral',
    intro: [
      'La regressione logistica modella la probabilità di un esito binario (sì/no) in funzione di uno o più predittori, invece di modellare direttamente il valore medio come fa la regressione lineare.',
      'L’ipotesi nulla del test LR è “nessun predittore aggiunge informazione rispetto alla sola intercetta”; ogni coefficiente risponde invece alla domanda “questo predittore pesa, al netto degli altri?”.',
    ],
    sections: [
      {
        heading: 'La lettura dei risultati',
        body: [
          `Il modello contiene ${predictors.length} predittore/i su ${fitRows.find(row => String(row.metric) === 'Osservazioni')?.value ?? '—'} osservazioni e ${fitRows.find(row => String(row.metric).startsWith('Eventi (Y = 1)'))?.value ?? '—'} eventi.`,
          `Il test LR vale ${fitRows.find(row => String(row.metric).startsWith('LR'))?.value ?? '—'} con ${fitRows.find(row => String(row.metric) === 'df')?.value ?? '—'} gradi di libertà: ${Number.isFinite(modelP) ? modelP < 1 - level / 100 ? 'rifiuta l’ipotesi che nessun predittore conti.' : 'non rifiuta l’ipotesi che nessun predittore conti.' : 'non calcolabile.'}`,
          ...predictors.map(item => describeOr(item)),
        ],
      },
      {
        heading: 'Come leggere gli odds ratio',
        body: [
          'L’odds ratio non è un rischio relativo: OR = 2 significa che gli odds raddoppiano, non che la probabilità raddoppia. Con esiti frequenti la differenza tra le due letture è grande, con esiti rari è piccola.',
          `Gli OR sono stimati al netto degli altri predittori e con un CI al ${level}%: un intervallo che contiene 1 corrisponde a un effetto non significativo.`,
        ],
      },
      {
        heading: 'Quanto discrimina il modello',
        body: [
          `AUC = ${fmtEst(auc, 3)}: probabilità che un caso con esito positivo riceva un punteggio più alto di un caso negativo. Accuratezza alla soglia scelta: ${accuracy}.`,
          `McFadden R² = ${fmtEst(pseudo, 3)}: valori sopra 0,2 indicano un modello con potere esplicativo reale, ma non vanno confrontati con l’R² della regressione lineare.`,
        ],
      },
      {
        heading: 'Assunzioni e cautele',
        bullets: [
          'Gli esiti devono essere indipendenti tra loro (una riga = una unità).',
          'La relazione tra predittore e logit della probabilità è lineare: con predittori continui controlla la forma o usa trasformazioni.',
          'Servono eventi sufficienti: meno di 10 eventi per parametro rende le stime instabili (regola pratica EPV).',
          'La separazione (outcome predetto perfettamente) gonfia i coefficienti e invalida i test.',
          'L’accuratezza dipende dalla soglia: riportala sempre insieme a sensibilità e specificità.',
        ],
      },
    ],
    limitations: [
      'Non sono inclusi modelli con effetti casuali, interazioni, regressione penalizzata o aggiustamento per dati sbilanciati.',
      'La bontà di adattamento è riassunta da pseudo-R² e AUC: non sostituiscono un controllo dei residui per la forma della relazione.',
    ],
  };
};
