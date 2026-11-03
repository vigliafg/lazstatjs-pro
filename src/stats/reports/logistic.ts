import { fmtEst, fmtP } from '../format';
import { copy, sourceOf } from '../reportCopy';
import { isDecided, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export const logisticReport = (
  tables: TableSpec[],
  level: number,
  link: 'logit' | 'probit' = 'logit'
): ReportSpec => {
  const probit = link === 'probit';
  const fitRows = tableById(tables, 'logit-fit')?.rows ?? [];
  const coefficientRows = tableById(tables, 'logit-coefficients')?.rows ?? [];
  const classification = tableById(tables, 'logit-classification')?.rows ?? [];
  const warning = tableById(tables, 'logit-warning');
  const modelP = Number(fitRows.find(row => sourceOf(String(row.metric)) === copy('p del modello'))?.value ?? NaN);
  const pseudo = Number(fitRows.find(row => sourceOf(String(row.metric)).startsWith('McFadden'))?.value ?? NaN);
  const auc = Number(classification.find(row => sourceOf(String(row.metric)) === 'AUC')?.value ?? NaN);
  const accuracy = String(classification.find(row => sourceOf(String(row.metric)) === 'Accuratezza')?.value ?? '');
  const predictors = coefficientRows.filter(row => String(row.predictor) !== '(Intercept)');
  const significant = predictors.filter(row => isDecided(Number(row.p), level));

  const describeOr = (row: (typeof predictors)[number]): string => {
    const or = Number(row.or);
    const direction = or > 1 ? 'aumenta' : 'riduce';
    return copy('{s1}: OR = {s2} (CI {s3} – {s4}), p = {s5}: un’unità in più {s6} le probabilità dell’esito di circa {s7}%.', { s1: String(row.predictor), s2: fmtEst(or, 3), s3: String(row.orLo), s4: String(row.orHi), s5: fmtP(Number(row.p)), s6: direction, s7: fmtEst(Math.abs(or - 1) * 100, 0) });
  };
  const describeCoefficient = (row: (typeof predictors)[number]): string =>
    probit
      ? copy('{s1}: B = {s2} (CI {s3} – {s4}), p = {s5}.', {
          s1: String(row.predictor),
          s2: fmtEst(Number(row.b), 4),
          s3: String(row.orLo),
          s4: String(row.orHi),
          s5: fmtP(Number(row.p)),
        })
      : describeOr(row);

  return {
    id: 'logistic',
    title: copy('Report di lettura'),
    headline: warning
      ? copy('I dati separano quasi perfettamente gli esiti: le stime non sono affidabili.')
      : Number.isFinite(modelP) && modelP < 1 - level / 100
        ? copy('Il modello è significativo (LR p = {s1}) e {s2} sul risultato.', { s1: fmtP(modelP), s2: significant.length === 1 ? copy('1 predittore pesa') : copy('{s1} predittori pesano', { s1: significant.length }) })
        : copy('Il modello non è significativo (LR p = {s1}).', { s1: fmtP(modelP) }),
    badge: warning ? 'Separazione' : significant.length > 0 ? copy('Modello informativo') : copy('Modello debole'),
    tone: warning ? 'caution' : significant.length > 0 ? 'positive' : 'neutral',
    intro: [
      probit
        ? copy('La regressione probit modella la probabilità di un esito binario (sì/no) tramite la funzione di ripartizione normale standard, invece del logit usato dalla regressione logistica.')
        : copy('La regressione logistica modella la probabilità di un esito binario (sì/no) in funzione di uno o più predittori, invece di modellare direttamente il valore medio come fa la regressione lineare.'),
      copy('L’ipotesi nulla del test LR è “nessun predittore aggiunge informazione rispetto alla sola intercetta”; ogni coefficiente risponde invece alla domanda “questo predittore pesa, al netto degli altri?”.'),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('Il modello contiene {s1} predittore/i su {s2} osservazioni e {s3} eventi.', { s1: predictors.length, s2: fitRows.find(row => sourceOf(String(row.metric)) === 'Osservazioni')?.value ?? '—', s3: fitRows.find(row => sourceOf(String(row.metric)).startsWith(sourceOf(copy('Eventi (Y = 1)'))))?.value ?? '—' }),
          copy('Il test LR vale {s1} con {s2} gradi di libertà: {s3}', { s1: fitRows.find(row => sourceOf(String(row.metric)).startsWith('LR'))?.value ?? '—', s2: fitRows.find(row => sourceOf(String(row.metric)) === 'df')?.value ?? '—', s3: Number.isFinite(modelP) ? modelP < 1 - level / 100 ? copy('rifiuta l’ipotesi che nessun predittore conti.') : copy('non rifiuta l’ipotesi che nessun predittore conti.') : copy('non calcolabile.') }),
          ...predictors.map(item => describeCoefficient(item)),
        ],
      },
      {
        heading: probit ? copy('Come leggere i coefficienti probit') : copy('Come leggere gli odds ratio'),
        body: probit
          ? [
              copy('B misura lo spostamento del predittore latente normale: exp(B) non è un odds ratio e non va letto come tale.'),
              copy('I coefficienti sono stimati al netto degli altri predittori e con un CI al {s1}%: un intervallo che contiene 0 corrisponde a un effetto non significativo.', { s1: level }),
            ]
          : [
              copy('L’odds ratio non è un rischio relativo: OR = 2 significa che gli odds raddoppiano, non che la probabilità raddoppia. Con esiti frequenti la differenza tra le due letture è grande, con esiti rari è piccola.'),
              copy('Gli OR sono stimati al netto degli altri predittori e con un CI al {s1}%: un intervallo che contiene 1 corrisponde a un effetto non significativo.', { s1: level }),
            ],
      },
      {
        heading: copy('Quanto discrimina il modello'),
        body: [
          copy('AUC = {s1}: probabilità che un caso con esito positivo riceva un punteggio più alto di un caso negativo. Accuratezza alla soglia scelta: {s2}.', { s1: fmtEst(auc, 3), s2: accuracy }),
          copy('McFadden R² = {s1}: valori sopra 0,2 indicano un modello con potere esplicativo reale, ma non vanno confrontati con l’R² della regressione lineare.', { s1: fmtEst(pseudo, 3) }),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Gli esiti devono essere indipendenti tra loro (una riga = una unità).'),
          copy('La relazione tra predittore e logit della probabilità è lineare: con predittori continui controlla la forma o usa trasformazioni.'),
          copy('Servono eventi sufficienti: meno di 10 eventi per parametro rende le stime instabili (regola pratica EPV).'),
          copy('La separazione (outcome predetto perfettamente) gonfia i coefficienti e invalida i test.'),
          copy('L’accuratezza dipende dalla soglia: riportala sempre insieme a sensibilità e specificità.'),
        ],
      },
    ],
    limitations: [
      copy('Non sono inclusi modelli con effetti casuali, interazioni, regressione penalizzata o aggiustamento per dati sbilanciati.'),
      copy('La bontà di adattamento è riassunta da pseudo-R² e AUC: non sostituiscono un controllo dei residui per la forma della relazione.'),
    ],
  };
};
