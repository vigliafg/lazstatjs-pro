import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { VarFit, VarResult, VecmFit } from '../kernels/var';

const decision = (p: number, level: number): string =>
  !Number.isFinite(p) ? copy('non calcolabile') : p < 1 - level / 100 ? copy('significativo') : copy('non significativo');

export const varTables = (result: VarResult, level: number): TableSpec[] => {
  if (result.mode === 'var') return varFitTables(result, level);
  return vecmTables(result, level);
};

const varFitTables = (fit: VarFit, level: number): TableSpec[] => {
  const tables: TableSpec[] = [];
  tables.push({
    id: 'var-model',
    title: copy('Modello VAR({s1})', { s1: fit.lags }),
    subtitle: copy('{s1} osservazioni · {s2} serie', { s1: fit.n, s2: fit.k }),
    columns: [
      { key: 'metric', label: copy('Voce'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Serie'), value: fit.names.join(', ') },
      { metric: copy('Osservazioni'), value: String(fit.n) },
      { metric: copy('Ritardi'), value: String(fit.lags) },
      { metric: copy('Log-verosimiglianza'), value: fmtEst(fit.logLik, 3) },
      { metric: 'AIC', value: fmtEst(fit.aic, 3) },
      { metric: 'BIC', value: fmtEst(fit.bic, 3) },
      {
        metric: copy('Stabilità'),
        value: fit.stable
          ? copy('sistema stabile (radici fuori dal cerchio unitario)')
          : copy('sistema instabile: le risposte impulsive possono divergere'),
      },
      { metric: copy('Radice minima'), value: fmtEst(fit.stability, 4) },
    ],
    notes: [
      copy('Ogni equazione è stimata con i minimi quadrati sui ritardi di tutte le serie; i residui delle equazioni sono correlati tra loro.'),
      copy('La stabilità richiede che tutte le radici del polinomio caratteristico stiano fuori dal cerchio unitario.'),
    ],
  });

  tables.push({
    id: 'var-selection',
    title: copy('Scelta dell’ordine'),
    subtitle: copy('confronto AIC/BIC fino a {s1} ritardi', { s1: fit.selection[fit.selection.length - 1]?.lags ?? fit.lags }),
    columns: [
      { key: 'lags', label: copy('Ritardi'), format: 'int' },
      { key: 'logLik', label: copy('Log-verosimiglianza'), format: 'dec3' },
      { key: 'aic', label: 'AIC', format: 'dec3' },
      { key: 'bic', label: 'BIC', format: 'dec3' },
    ],
    rows: fit.selection.map(row => ({ ...row, selected: row.lags === fit.lags ? copy('scelto') : '' })),
    notes: [copy('L’ordine scelto minimizza l’AIC; il BIC tende a scegliere modelli più parsimoniosi.')],
  });

  const coefficientRows = fit.equations.flatMap(equation =>
    equation.coefficients.map(coefficient => ({
      equation: equation.name,
      term: coefficient.term,
      estimate: coefficient.estimate,
      se: coefficient.se,
      t: coefficient.t,
      p: coefficient.p,
    }))
  );
  tables.push({
    id: 'var-coefficients',
    title: copy('Coefficienti del VAR'),
    columns: [
      { key: 'equation', label: copy('Equazione'), format: 'text' },
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'estimate', label: copy('Stima'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 't', label: 't', format: 'dec2' },
      { key: 'p', label: 'p', format: 'p' },
    ],
    rows: coefficientRows,
    notes: [
      copy('Il termine y.l1 indica il primo ritardo della serie y: un coefficiente significativo misura la dipendenza dal passato.'),
    ],
  });

  const sigmaColumns = [
    { key: 'variable', label: copy('Variabile'), format: 'text' as const },
    ...fit.names.map((name, index) => ({
      key: `sigma${index}`,
      label: name,
      format: 'dec4' as const,
    })),
  ];
  tables.push({
    id: 'var-sigma',
    title: copy('Matrice di covarianza dei residui'),
    columns: sigmaColumns,
    rows: fit.names.map((name, index) => {
      const row: Record<string, number | string> = { variable: name };
      fit.sigma[index].forEach((value, column) => {
        row[`sigma${column}`] = value;
      });
      return row;
    }),
    notes: [copy('La diagonale contiene le varianze residue; le covarianze fuori diagonale misurano le innovazioni comuni.')],
  });

  tables.push({
    id: 'var-granger',
    title: copy('Causalità di Granger'),
    columns: [
      { key: 'cause', label: copy('Causa'), format: 'text' },
      { key: 'effect', label: copy('Effetto'), format: 'text' },
      { key: 'f', label: 'F', format: 'dec3' },
      { key: 'df1', label: 'df1', format: 'int' },
      { key: 'df2', label: 'df2', format: 'int' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'decision', label: copy('Lettura'), format: 'text' },
    ],
    rows: fit.granger.map(row => ({ ...row, decision: decision(row.p, level) })),
    notes: [
      copy('Il test confronta il modello completo con quello senza i ritardi della causa: p piccolo indica che il passato della causa migliora la previsione dell’effetto.'),
      copy('È una precedenza temporale, non una prova di causalità strutturale.'),
    ],
  });

  const irfRows = fit.irf.flatMap(impulse => {
    const rows: Record<string, number | string>[] = [];
    fit.names.forEach((variable, variableIndex) => {
      fit.names.forEach((shock, shockIndex) => {
        rows.push({
          horizon: impulse.horizon,
          shock,
          variable,
          response: impulse.responses[variableIndex][shockIndex],
        });
      });
    });
    return rows;
  });
  tables.push({
    id: 'var-irf',
    title: copy('Risposte impulsive ortogonalizzate'),
    subtitle: copy('orizzonte 0–{s1}', { s1: fit.irf.length - 1 }),
    columns: [
      { key: 'horizon', label: copy('Orizzonte'), format: 'int' },
      { key: 'shock', label: copy('Shock'), format: 'text' },
      { key: 'variable', label: copy('Risposta'), format: 'text' },
      { key: 'response', label: copy('Risposta'), format: 'dec4' },
    ],
    rows: irfRows,
    notes: [
      copy('Le risposte sono ortogonalizzate con la scomposizione di Cholesky: l’ordine delle serie conta.'),
      copy('Uno shock di una deviazione standard si propaga nel sistema secondo i coefficienti stimati.'),
    ],
  });

  tables.push({
    id: 'var-fevd',
    title: copy('Scomposizione della varianza dell’errore di previsione'),
    columns: [
      { key: 'variable', label: copy('Variabile'), format: 'text' },
      { key: 'shock', label: copy('Shock'), format: 'text' },
      { key: 'horizon', label: copy('Orizzonte'), format: 'int' },
      { key: 'share', label: copy('Quota'), format: 'dec3' },
    ],
    rows: fit.fevd.map(row => ({ ...row, share: row.share })),
    notes: [copy('La quota è la frazione della varianza dell’errore di previsione attribuita a ciascuno shock; per ogni orizzonte le quote sommano a 1.')],
  });

  return tables;
};

const vecmTables = (fit: VecmFit, level: number): TableSpec[] => {
  const tables: TableSpec[] = [];
  tables.push({
    id: 'vecm-model',
    title: copy('Modello VECM (Engle–Granger)'),
    subtitle: copy('{s1} osservazioni · {s2} serie', { s1: fit.n, s2: fit.k }),
    columns: [
      { key: 'metric', label: copy('Voce'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Serie'), value: fit.names.join(', ') },
      { metric: copy('Osservazioni'), value: String(fit.n) },
      { metric: copy('Ritardi nelle differenze'), value: String(fit.lags) },
      { metric: copy('Log-verosimiglianza'), value: fmtEst(fit.logLik, 3) },
      { metric: 'AIC', value: fmtEst(fit.aic, 3) },
      { metric: 'BIC', value: fmtEst(fit.bic, 3) },
    ],
    notes: [
      copy('La procedura è a due passi: regressione di cointegrazione in livelli, poi modello a correzione dell’errore sulle differenze.'),
    ],
  });

  tables.push({
    id: 'vecm-beta',
    title: copy('Vettore di cointegrazione'),
    subtitle: copy('normalizzato sulla prima serie'),
    columns: [
      { key: 'term', label: copy('Serie'), format: 'text' },
      { key: 'estimate', label: copy('Coefficiente'), format: 'dec4' },
    ],
    rows: fit.beta.map(row => ({ ...row })),
    notes: [copy('Il vettore β definisce la combinazione stazionaria: β′y_{t−1} è il termine di correzione dell’errore.')],
  });

  tables.push({
    id: 'vecm-cointegration',
    title: copy('Test di cointegrazione sui residui'),
    columns: [
      { key: 'test', label: copy('Test'), format: 'text' },
      { key: 'stat', label: copy('Statistica'), format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'lags', label: copy('Ritardi'), format: 'int' },
      { key: 'cv5', label: copy('Valore critico 5%'), format: 'dec3' },
      { key: 'decision', label: copy('Lettura'), format: 'text' },
    ],
    rows: [
      {
        test: copy('ADF sui residui di cointegrazione'),
        stat: fit.cointegration.adf,
        p: fit.cointegration.p,
        lags: fit.cointegration.lags,
        cv5: fit.cointegration.cv5,
        decision: decision(fit.cointegration.p, level),
      },
    ],
    notes: [
      copy('I valori critici dell’ADF sui residui sono indicativi: la regressione di cointegrazione è stimata, non imposta.'),
      copy('Se la radice unitaria non è rifiutata, il VECM va letto come rappresentazione descrittiva e non come relazione di lungo periodo accertata.'),
    ],
  });

  tables.push({
    id: 'vecm-alpha',
    title: copy('Velocità di aggiustamento'),
    columns: [
      { key: 'equation', label: copy('Equazione'), format: 'text' },
      { key: 'estimate', label: copy('α'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 't', label: 't', format: 'dec2' },
      { key: 'p', label: 'p', format: 'p' },
    ],
    rows: fit.alpha.map(row => ({ ...row })),
    notes: [copy('Un α negativo e significativo indica che la serie corregge gli scostamenti dal rapporto di lungo periodo.')],
  });

  const coefficientRows = fit.equations.flatMap(equation =>
    equation.coefficients.map(coefficient => ({
      equation: equation.name,
      term: coefficient.term,
      estimate: coefficient.estimate,
      se: coefficient.se,
      t: coefficient.t,
      p: coefficient.p,
    }))
  );
  tables.push({
    id: 'vecm-coefficients',
    title: copy('Coefficienti del modello a correzione dell’errore'),
    columns: [
      { key: 'equation', label: copy('Equazione'), format: 'text' },
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'estimate', label: copy('Stima'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 't', label: 't', format: 'dec2' },
      { key: 'p', label: 'p', format: 'p' },
    ],
    rows: coefficientRows,
    notes: [copy('ECT è il termine di correzione dell’errore; i termini Δ indicano i ritardi delle differenze.')],
  });

  return tables;
};

export { fmtP };
