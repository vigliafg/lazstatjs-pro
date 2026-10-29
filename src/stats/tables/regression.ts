import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import { interpretR } from '../format';
import { regressionStats } from '../kernels/regression';

export interface RegressionTablesOptions {
  rows: readonly (readonly string[])[];
  depIdx: number;
  indepIdxs: number[];
  depName: string;
  predNames: string[];
  level: number;
  robustSE?: 'none' | 'HC1' | 'HC3';
}

export const regressionTables = (options: RegressionTablesOptions): TableSpec[] => {
  const { rows, depIdx, indepIdxs, depName, predNames, level } = options;
  const robustSE = options.robustSE ?? 'none';
  const stats = regressionStats(rows, depIdx, indepIdxs, level, robustSE);
  if (!stats) return [];
  const {
    n, k, df, sse, ssr, sst, mse, msRegression, r, r2, adjR2, seEstimate, f, pF,
    aic, bic, dw, intercept, coefficients, diagnostics,
    residualsOls, residualsTs, theilSen, univariateSlopes, robust,
  } = stats;
  const {
    maxLeverage, maxCook, cookOutliers, bpStat, bpP,
    whiteStat, whiteP, whiteDf, resetF, resetP,
    dfbetasMax, dfbetasCount, dfbetasThreshold,
    conditionIndex, conditionCount, residualOutliers,
  } = diagnostics;

  const tables: TableSpec[] = [];

  tables.push({
    id: 'reg-model',
    title: copy('Sintesi del modello'),
    subtitle: copy('{s1} ~ {s2}', { s1: depName, s2: predNames.join(' + ') }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
      { key: 'detail', label: copy('Dettaglio'), format: 'text' },
    ],
    rows: [
      { metric: copy('N'), value: n, detail: copy('osservazioni complete (k = {s1} predittori)', { s1: k }) },
      { metric: copy('R'), value: r, detail: interpretR(r) },
      { metric: copy('R²'), value: r2, detail: copy('quota di varianza spiegata') },
      { metric: copy('Adjusted R²'), value: adjR2, detail: copy('corretto per numero di predittori') },
      { metric: copy('SE of estimate'), value: seEstimate, detail: copy('√(SSE / {s1})', { s1: df }) },
      { metric: copy('F'), value: f, detail: copy('F({s1}, {s2})', { s1: k, s2: df }) },
      { metric: copy('p (F)'), value: pF, detail: copy('test globale del modello') },
      { metric: copy('AIC'), value: aic, detail: copy('n·ln(SSE/n) + 2(k+1)') },
      { metric: copy('BIC'), value: bic, detail: copy('n·ln(SSE/n) + ln(n)(k+1)') },
      { metric: copy('Durbin–Watson'), value: dw, detail: copy('≈2 assenza di autocorrelazione; ordine righe') },
    ],
    notes: [copy('R² e F assumono un modello con intercetta. AIC/BIC sono definiti a meno di una costante additiva.')],
  });

  tables.push({
    id: 'reg-anova',
    title: copy('ANOVA del modello'),
    columns: [
      { key: 'source', label: copy('Source'), format: 'text' },
      { key: 'ss', label: copy('SS'), format: 'dec4' },
      { key: 'df', label: copy('df'), format: 'int' },
      { key: 'ms', label: copy('MS'), format: 'dec4' },
      { key: 'f', label: copy('F'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
    ],
    rows: [
      { source: 'Regression', ss: ssr, df: k, ms: msRegression, f, p: pF },
      { source: 'Residual', ss: sse, df, ms: mse, f: NaN, p: NaN },
      { source: 'Total', ss: sst, df: n - 1, ms: NaN, f: NaN, p: NaN },
    ],
  });

  tables.push({
    id: 'reg-coefficients',
    title: copy('Coefficienti'),
    subtitle: copy('CI {s1}% · stima OLS', { s1: level }),
    columns: [
      { key: 'predictor', label: copy('Predictor'), format: 'text' },
      { key: 'b', label: copy('B'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'beta', label: copy('β std.'), format: 'dec3' },
      { key: 't', label: copy('t'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
      { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
      { key: 'tol', label: copy('Tolerance'), format: 'dec3' },
      { key: 'vif', label: copy('VIF'), format: 'dec2' },
    ],
    rows: [
      { predictor: '(Intercept)', ...intercept },
      ...predNames.map((name, index) => ({
        predictor: name,
        ...coefficients[index],
      })),
    ],
    notes: [
      copy('CI: B ± t({s1}%, df = {s2})·SE. β std. = B·SD(x)/SD(y).', { s1: level, s2: df }),
      copy('VIF = 1/(1−R²_aux) da regressione del predittore sugli altri; valori > 5 indicano collinearità problematica.'),
    ],
  });

  tables.push({
    id: 'reg-diagnostics',
    title: copy('Diagnostica del modello'),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
      { key: 'note', label: copy('Nota'), format: 'text' },
    ],
    rows: [
      { metric: copy('Leverage massimo'), value: maxLeverage, note: copy('h_ii = x_iᵀ(XᵀX)⁻¹x_i') },
      { metric: copy("Cook's D massimo"), value: maxCook, note: copy('valori > 1 indicano osservazioni influenti') },
      { metric: copy("Cook's D > 1"), value: cookOutliers, note: copy('numero di osservazioni') },
      { metric: copy('Breusch–Pagan LM'), value: bpStat, note: copy('eteroschedasticità dei residui') },
      { metric: copy('Breusch–Pagan p'), value: bpP, note: copy('χ² con {s1} df', { s1: k }) },
      { metric: copy('White LM'), value: whiteStat, note: copy('quadrati e prodotti incrociati dei predittori') },
      { metric: copy('White p'), value: whiteP, note: copy('χ² con {s1} df', { s1: whiteDf }) },
      { metric: copy('RESET F (ŷ²)'), value: resetF, note: copy('non linearità da potenze dei valori adattati') },
      { metric: copy('RESET p'), value: resetP, note: copy('F con 1 e df del modello aumentato') },
      { metric: copy('|DFBETAS| massimo'), value: dfbetasMax, note: copy('influenza su singolo coefficiente') },
      { metric: copy('DFBETAS oltre 2/√n'), value: dfbetasCount, note: copy('soglia {s1}', { s1: dfbetasThreshold.toFixed(3) }) },
      { metric: copy('Condition index massimo'), value: conditionIndex, note: copy('X scalato a norma unitaria; > 30 collinearità') },
      { metric: copy('Condition index > 30'), value: conditionCount, note: copy('numero di dimensioni coinvolte') },
      { metric: copy('Residui studentizzati |z| > 3'), value: residualOutliers, note: copy('outlier sui residui studentizzati') },
    ],
    notes: [
      copy('Breusch–Pagan richiede l’ipotesi di normalità dei residui; con N piccolo ha potenza limitata.'),
      copy('White usa n·R² della regressione ausiliaria (quadrati e prodotti incrociati); RESET2 aggiunge ŷ². DFBETAS misura il cambio standardizzato di un coefficiente eliminando un’osservazione.'),
      copy('Condition index di Belsley calcolato sugli autovalori di XᵀX dopo scala a norma unitaria: valori > 30 suggeriscono collinearità, > 100 sono gravi.'),
    ],
  });

  const residualRows = [
    { metric: copy('N'), ols: residualsOls.n, ts: residualsTs?.n },
    { metric: copy('Mean'), ols: residualsOls.mean, ts: residualsTs?.mean },
    { metric: copy('Median'), ols: residualsOls.median, ts: residualsTs?.median },
    { metric: copy('SD'), ols: residualsOls.sd, ts: residualsTs?.sd },
    { metric: copy('Min'), ols: residualsOls.min, ts: residualsTs?.min },
    { metric: copy('Max'), ols: residualsOls.max, ts: residualsTs?.max },
    { metric: copy('Skewness'), ols: residualsOls.skew, ts: residualsTs?.skew },
    { metric: copy('Excess kurtosis'), ols: residualsOls.kurt, ts: residualsTs?.kurt },
    { metric: copy('Jarque–Bera p'), ols: residualsOls.jbP, ts: residualsTs?.jbP },
    { metric: copy('Lilliefors p'), ols: residualsOls.lillieforsP, ts: residualsTs?.lillieforsP },
    { metric: copy('Residui oltre 3 SD'), ols: residualsOls.outliers, ts: residualsTs?.outliers },
  ];

  tables.push({
    id: 'reg-residuals',
    title: copy('Diagnostica dei residui'),
    subtitle: copy('OLS vs Theil–Sen'),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'ols', label: copy('Residui OLS'), format: 'dec4' },
      ...(residualsTs ? [{ key: 'ts', label: copy('Residui Theil–Sen'), format: 'dec4' as const }] : []),
    ],
    rows: residualRows,
    notes: [copy('I residui Theil–Sen sono disponibili per la regressione semplice; con più predittori il TS è univariato e non definisce un modello congiunto.')],
  });

  if (k === 1 && theilSen) {
    tables.push({
      id: 'reg-robust',
      title: copy('Stimatore robusto Theil–Sen'),
      columns: [
        { key: 'measure', label: copy('Parametro'), format: 'text' },
        { key: 'ols', label: copy('OLS'), format: 'dec4' },
        { key: 'ts', label: copy('Theil–Sen'), format: 'dec4' },
        { key: 'ciLo', label: copy('TS CI low'), format: 'dec4' },
        { key: 'ciHi', label: copy('TS CI high'), format: 'dec4' },
      ],
      rows: [
        { measure: copy('Slope'), ols: coefficients[0].b, ts: theilSen.slope, ciLo: theilSen.lo, ciHi: theilSen.hi },
        { measure: copy('Intercept'), ols: intercept.b, ts: theilSen.intercept, ciLo: NaN, ciHi: NaN },
      ],
      notes: [copy('Theil–Sen: mediana delle pendenze tra tutte le coppie di punti; CI bootstrap percentile (600 repliche, seed fisso).')],
    });
  } else if (k > 1) {
    tables.push({
      id: 'reg-robust',
      title: copy('Stimatori robusti univariati'),
      columns: [
        { key: 'predictor', label: copy('Predictor'), format: 'text' },
        { key: 'ols', label: copy('OLS B'), format: 'dec4' },
        { key: 'ts', label: copy('Theil–Sen slope'), format: 'dec4' },
      ],
      rows: predNames.map((name, index) => ({
        predictor: name,
        ols: coefficients[index].b,
        ts: univariateSlopes[index],
      })),
      notes: [copy('Con più predittori il Theil–Sen è calcolato separatamente per ciascun predittore e non controlla gli altri: usarlo solo come diagnostica descrittiva.')],
    });
  }

  if (robust) {
    tables.push({
      id: 'reg-robust-se',
      title: copy('Errori standard robusti'),
      subtitle: copy('{s1} · CI {s2}%', { s1: robustSE, s2: level }),
      columns: [
        { key: 'predictor', label: copy('Predictor'), format: 'text' },
        { key: 'b', label: copy('B'), format: 'dec4' },
        { key: 'se', label: copy('SE robusto'), format: 'dec4' },
        { key: 't', label: copy('t'), format: 'dec3' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
      ],
      rows: [
        { predictor: '(Intercept)', ...robust.intercept },
        ...predNames.map((name, index) => ({ predictor: name, ...robust.coefficients[index] })),
      ],
      notes: [
        copy('HC1 = n/(n−k−1); HC3 = 1/(1−h)². La matrice di covarianza robusta non assume varianza costante.'),
        copy('I gradi di libertà restano n−k−1; con pochi casi i test robusti sono instabili.'),
      ],
    });
  }

  return tables;
};
