import { jStat } from '../jstat';
import { fmtEst, fmtP } from '../format';
import { zCrit } from '../distributions';
import type { TableSpec } from '../types';
import type { LogisticModel } from '../logistic/types';

export const logisticTables = (
  model: LogisticModel,
  level: number,
  cutoff: number
): TableSpec[] => {
  const critical = zCrit(level);
  const tables: TableSpec[] = [];

  tables.push({
    id: 'logit-fit',
    title: 'Modello logistico',
    subtitle: `stima di massima verosimiglianza · N = ${model.n}`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'text' },
    ],
    rows: [
      { metric: 'Osservazioni', value: String(model.n) },
      { metric: 'Eventi (Y = 1)', value: String(model.events) },
      { metric: 'Eventi per parametro', value: fmtEst(model.events / (model.names.length - 1), 1) },
      { metric: 'Log-verosimiglianza', value: fmtEst(model.logLik, 3) },
      { metric: 'Log-verosimiglianza nulla', value: fmtEst(model.logLikNull, 3) },
      { metric: 'LR χ² (vs modello nullo)', value: fmtEst(model.lr, 3) },
      { metric: 'df', value: String(model.df) },
      { metric: 'p del modello', value: fmtP(model.p) },
      { metric: 'McFadden R²', value: fmtEst(model.mcfadden, 3) },
      { metric: 'Cox–Snell R²', value: fmtEst(model.coxSnell, 3) },
      { metric: 'Nagelkerke R²', value: fmtEst(model.nagelkerke, 3) },
      { metric: 'AIC', value: fmtEst(model.aic, 2) },
      { metric: 'BIC', value: fmtEst(model.bic, 2) },
    ],
    notes: [
      'Il test LR confronta il modello con quello che contiene solo l’intercetta: p piccolo = almeno un predittore aggiunge informazione.',
      'Le pseudo-R² non hanno il significato dell’R² lineare: valori intorno a 0,2–0,4 indicano già un buon adattamento.',
    ],
  });

  tables.push({
    id: 'logit-coefficients',
    title: 'Coefficienti e odds ratio',
    subtitle: `CI ${level}%`,
    columns: [
      { key: 'predictor', label: 'Predittore', format: 'text' },
      { key: 'b', label: 'B', format: 'dec4' },
      { key: 'se', label: 'SE', format: 'dec4' },
      { key: 'z', label: 'Wald z', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'or', label: 'OR', format: 'dec3' },
      { key: 'orLo', label: 'OR CI low', format: 'dec3' },
      { key: 'orHi', label: 'OR CI high', format: 'dec3' },
    ],
    rows: model.names.map((name, index) => {
      const isIntercept = index === 0;
      return {
        predictor: name,
        b: model.beta[index],
        se: model.se[index],
        z: model.se[index] > 0 ? model.beta[index] / model.se[index] : NaN,
        p: model.se[index] > 0 ? 2 * jStat.normal.cdf(-Math.abs(model.beta[index] / model.se[index]), 0, 1) : NaN,
        or: isIntercept ? NaN : Math.exp(model.beta[index]),
        orLo: isIntercept ? NaN : Math.exp(model.beta[index] - critical * model.se[index]),
        orHi: isIntercept ? NaN : Math.exp(model.beta[index] + critical * model.se[index]),
      };
    }),
    notes: [
      'OR > 1 aumenta le probabilità dell’esito per un’unità in più del predittore; OR < 1 le riduce. OR = 1 non ha effetto.',
      'L’intervallo dell’OR è calcolato su scala logaritmica: exp(B ± z·SE). Se contiene 1, l’effetto non è significativo.',
      'Il p è di Wald (z = B/SE): con campioni piccoli o effetti forti può essere meno affidabile del test LR.',
    ],
  });

  tables.push({
    id: 'logit-classification',
    title: 'Classificazione',
    subtitle: `soglia p ≥ ${fmtEst(cutoff, 2)} → Y = 1`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'text' },
    ],
    rows: [
      { metric: 'Accuratezza', value: `${fmtEst(model.accuracy * 100, 1)}%` },
      { metric: 'Sensibilità', value: `${fmtEst(model.sensitivity * 100, 1)}%` },
      { metric: 'Specificità', value: `${fmtEst(model.specificity * 100, 1)}%` },
      { metric: 'AUC', value: fmtEst(model.auc, 3) },
    ],
    notes: [
      'L’AUC non dipende dalla soglia: 0,5 è il caso, 0,7 accettabile, 0,8 buono, 0,9 eccellente.',
      'La soglia 0,5 è arbitraria: se il costo di un falso negativo è alto, abbassala e guarda come cambiano sensibilità e specificità.',
    ],
  });

  if (model.separation) {
    tables.push({
      id: 'logit-warning',
      title: 'Attenzione: separazione',
      columns: [{ key: 'note', label: 'Diagnostica', format: 'text' }],
      rows: [{ note: 'Almeno un coefficiente è molto grande: i dati separano quasi perfettamente gli esiti e le stime/SE non sono affidabili.' }],
      notes: ['Raccogli più casi, riduci i predittori o usa una regressione penalizzata (Firth).'],
    });
  }

  return tables;
};
