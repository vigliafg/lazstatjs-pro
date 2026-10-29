import { jStat } from '../jstat';
import { copy } from '../reportCopy';
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
    title: copy('Modello logistico'),
    subtitle: copy('{s1} · N = {s2}', { s1: model.penalized ? copy('Firth penalized likelihood') : copy('stima di massima verosimiglianza'), s2: model.n }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Osservazioni'), value: String(model.n) },
      { metric: copy('Eventi (Y = 1)'), value: String(model.events) },
      { metric: copy('Eventi per parametro'), value: fmtEst(model.events / (model.names.length - 1), 1) },
      { metric: copy('Log-verosimiglianza'), value: fmtEst(model.logLik, 3) },
      { metric: copy('Log-verosimiglianza nulla'), value: fmtEst(model.logLikNull, 3) },
      { metric: copy('LR χ² (vs modello nullo)'), value: fmtEst(model.lr, 3) },
      { metric: copy('df'), value: String(model.df) },
      { metric: copy('p del modello'), value: fmtP(model.p) },
      { metric: copy('McFadden R²'), value: fmtEst(model.mcfadden, 3) },
      { metric: copy('Cox–Snell R²'), value: fmtEst(model.coxSnell, 3) },
      { metric: copy('Nagelkerke R²'), value: fmtEst(model.nagelkerke, 3) },
      { metric: copy('AIC'), value: fmtEst(model.aic, 2) },
      { metric: copy('BIC'), value: fmtEst(model.bic, 2) },
    ],
    notes: [
      copy('Il test LR confronta il modello con quello che contiene solo l’intercetta: p piccolo = almeno un predittore aggiunge informazione.'),
      copy('Le pseudo-R² non hanno il significato dell’R² lineare: valori intorno a 0,2–0,4 indicano già un buon adattamento.'),
    ],
  });

  tables.push({
    id: 'logit-coefficients',
    title: copy('Coefficienti e odds ratio'),
    subtitle: copy('CI {s1}%', { s1: level }),
    columns: [
      { key: 'predictor', label: copy('Predittore'), format: 'text' },
      { key: 'b', label: copy('B'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'z', label: copy('Wald z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'or', label: copy('OR'), format: 'dec3' },
      { key: 'orLo', label: copy('OR CI low'), format: 'dec3' },
      { key: 'orHi', label: copy('OR CI high'), format: 'dec3' },
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
      copy('OR > 1 aumenta le probabilità dell’esito per un’unità in più del predittore; OR < 1 le riduce. OR = 1 non ha effetto.'),
      copy('L’intervallo dell’OR è calcolato su scala logaritmica: exp(B ± z·SE). Se contiene 1, l’effetto non è significativo.'),
      copy('Il p è di Wald (z = B/SE): con campioni piccoli o effetti forti può essere meno affidabile del test LR.'),
    ],
  });

  tables.push({
    id: 'logit-classification',
    title: copy('Classificazione'),
    subtitle: copy('soglia p ≥ {s1} → Y = 1', { s1: fmtEst(cutoff, 2) }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Accuratezza'), value: copy('{s1}%', { s1: fmtEst(model.accuracy * 100, 1) }) },
      { metric: copy('Sensibilità'), value: copy('{s1}%', { s1: fmtEst(model.sensitivity * 100, 1) }) },
      { metric: copy('Specificità'), value: copy('{s1}%', { s1: fmtEst(model.specificity * 100, 1) }) },
      { metric: copy('AUC'), value: fmtEst(model.auc, 3) },
    ],
    notes: [
      copy('L’AUC non dipende dalla soglia: 0,5 è il caso, 0,7 accettabile, 0,8 buono, 0,9 eccellente.'),
      copy('La soglia 0,5 è arbitraria: se il costo di un falso negativo è alto, abbassala e guarda come cambiano sensibilità e specificità.'),
    ],
  });

  if (model.separation) {
    tables.push({
      id: 'logit-warning',
      title: model.penalized ? copy('Separazione gestita da Firth') : copy('Attenzione: separazione'),
      columns: [{ key: 'note', label: copy('Diagnostica'), format: 'text' }],
      rows: [{ note: copy('Almeno un coefficiente è molto grande: i dati separano quasi perfettamente gli esiti e le stime/SE non sono affidabili.') }],
      notes: [model.penalized ? copy('La verosimiglianza penalizzata di Firth mantiene finite le stime; gli errori standard restano approssimati.') : copy('Raccogli più casi, riduci i predittori o usa una regressione penalizzata (Firth).')],
    });
  }

  return tables;
};
