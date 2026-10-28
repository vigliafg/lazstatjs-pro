import type { TableSpec } from '../types';
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
    title: 'Sintesi del modello',
    subtitle: `${depName} ~ ${predNames.join(' + ')}`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
      { key: 'detail', label: 'Dettaglio', format: 'text' },
    ],
    rows: [
      { metric: 'N', value: n, detail: `osservazioni complete (k = ${k} predittori)` },
      { metric: 'R', value: r, detail: interpretR(r) },
      { metric: 'R²', value: r2, detail: 'quota di varianza spiegata' },
      { metric: 'Adjusted R²', value: adjR2, detail: 'corretto per numero di predittori' },
      { metric: 'SE of estimate', value: seEstimate, detail: `√(SSE / ${df})` },
      { metric: 'F', value: f, detail: `F(${k}, ${df})` },
      { metric: 'p (F)', value: pF, detail: 'test globale del modello' },
      { metric: 'AIC', value: aic, detail: 'n·ln(SSE/n) + 2(k+1)' },
      { metric: 'BIC', value: bic, detail: 'n·ln(SSE/n) + ln(n)(k+1)' },
      { metric: 'Durbin–Watson', value: dw, detail: '≈2 assenza di autocorrelazione; ordine righe' },
    ],
    notes: ['R² e F assumono un modello con intercetta. AIC/BIC sono definiti a meno di una costante additiva.'],
  });

  tables.push({
    id: 'reg-anova',
    title: 'ANOVA del modello',
    columns: [
      { key: 'source', label: 'Source', format: 'text' },
      { key: 'ss', label: 'SS', format: 'dec4' },
      { key: 'df', label: 'df', format: 'int' },
      { key: 'ms', label: 'MS', format: 'dec4' },
      { key: 'f', label: 'F', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
    ],
    rows: [
      { source: 'Regression', ss: ssr, df: k, ms: msRegression, f, p: pF },
      { source: 'Residual', ss: sse, df, ms: mse, f: NaN, p: NaN },
      { source: 'Total', ss: sst, df: n - 1, ms: NaN, f: NaN, p: NaN },
    ],
  });

  tables.push({
    id: 'reg-coefficients',
    title: 'Coefficienti',
    subtitle: `CI ${level}% · stima OLS`,
    columns: [
      { key: 'predictor', label: 'Predictor', format: 'text' },
      { key: 'b', label: 'B', format: 'dec4' },
      { key: 'se', label: 'SE', format: 'dec4' },
      { key: 'beta', label: 'β std.', format: 'dec3' },
      { key: 't', label: 't', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'ciLo', label: 'CI low', format: 'dec4' },
      { key: 'ciHi', label: 'CI high', format: 'dec4' },
      { key: 'tol', label: 'Tolerance', format: 'dec3' },
      { key: 'vif', label: 'VIF', format: 'dec2' },
    ],
    rows: [
      { predictor: '(Intercept)', ...intercept },
      ...predNames.map((name, index) => ({
        predictor: name,
        ...coefficients[index],
      })),
    ],
    notes: [
      `CI: B ± t(${level}%, df = ${df})·SE. β std. = B·SD(x)/SD(y).`,
      'VIF = 1/(1−R²_aux) da regressione del predittore sugli altri; valori > 5 indicano collinearità problematica.',
    ],
  });

  tables.push({
    id: 'reg-diagnostics',
    title: 'Diagnostica del modello',
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
      { key: 'note', label: 'Nota', format: 'text' },
    ],
    rows: [
      { metric: 'Leverage massimo', value: maxLeverage, note: 'h_ii = x_iᵀ(XᵀX)⁻¹x_i' },
      { metric: "Cook's D massimo", value: maxCook, note: 'valori > 1 indicano osservazioni influenti' },
      { metric: "Cook's D > 1", value: cookOutliers, note: 'numero di osservazioni' },
      { metric: 'Breusch–Pagan LM', value: bpStat, note: 'eteroschedasticità dei residui' },
      { metric: 'Breusch–Pagan p', value: bpP, note: `χ² con ${k} df` },
      { metric: 'White LM', value: whiteStat, note: 'quadrati e prodotti incrociati dei predittori' },
      { metric: 'White p', value: whiteP, note: `χ² con ${whiteDf} df` },
      { metric: 'RESET F (ŷ²)', value: resetF, note: 'non linearità da potenze dei valori adattati' },
      { metric: 'RESET p', value: resetP, note: 'F con 1 e df del modello aumentato' },
      { metric: '|DFBETAS| massimo', value: dfbetasMax, note: 'influenza su singolo coefficiente' },
      { metric: 'DFBETAS oltre 2/√n', value: dfbetasCount, note: `soglia ${dfbetasThreshold.toFixed(3)}` },
      { metric: 'Condition index massimo', value: conditionIndex, note: 'X scalato a norma unitaria; > 30 collinearità' },
      { metric: 'Condition index > 30', value: conditionCount, note: 'numero di dimensioni coinvolte' },
      { metric: 'Residui studentizzati |z| > 3', value: residualOutliers, note: 'outlier sui residui studentizzati' },
    ],
    notes: [
      'Breusch–Pagan richiede l’ipotesi di normalità dei residui; con N piccolo ha potenza limitata.',
      'White usa n·R² della regressione ausiliaria (quadrati e prodotti incrociati); RESET2 aggiunge ŷ². DFBETAS misura il cambio standardizzato di un coefficiente eliminando un’osservazione.',
      'Condition index di Belsley calcolato sugli autovalori di XᵀX dopo scala a norma unitaria: valori > 30 suggeriscono collinearità, > 100 sono gravi.',
    ],
  });

  const residualRows = [
    { metric: 'N', ols: residualsOls.n, ts: residualsTs?.n },
    { metric: 'Mean', ols: residualsOls.mean, ts: residualsTs?.mean },
    { metric: 'Median', ols: residualsOls.median, ts: residualsTs?.median },
    { metric: 'SD', ols: residualsOls.sd, ts: residualsTs?.sd },
    { metric: 'Min', ols: residualsOls.min, ts: residualsTs?.min },
    { metric: 'Max', ols: residualsOls.max, ts: residualsTs?.max },
    { metric: 'Skewness', ols: residualsOls.skew, ts: residualsTs?.skew },
    { metric: 'Excess kurtosis', ols: residualsOls.kurt, ts: residualsTs?.kurt },
    { metric: 'Jarque–Bera p', ols: residualsOls.jbP, ts: residualsTs?.jbP },
    { metric: 'Lilliefors p', ols: residualsOls.lillieforsP, ts: residualsTs?.lillieforsP },
    { metric: 'Residui oltre 3 SD', ols: residualsOls.outliers, ts: residualsTs?.outliers },
  ];

  tables.push({
    id: 'reg-residuals',
    title: 'Diagnostica dei residui',
    subtitle: 'OLS vs Theil–Sen',
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'ols', label: 'Residui OLS', format: 'dec4' },
      ...(residualsTs ? [{ key: 'ts', label: 'Residui Theil–Sen', format: 'dec4' as const }] : []),
    ],
    rows: residualRows,
    notes: ['I residui Theil–Sen sono disponibili per la regressione semplice; con più predittori il TS è univariato e non definisce un modello congiunto.'],
  });

  if (k === 1 && theilSen) {
    tables.push({
      id: 'reg-robust',
      title: 'Stimatore robusto Theil–Sen',
      columns: [
        { key: 'measure', label: 'Parametro', format: 'text' },
        { key: 'ols', label: 'OLS', format: 'dec4' },
        { key: 'ts', label: 'Theil–Sen', format: 'dec4' },
        { key: 'ciLo', label: 'TS CI low', format: 'dec4' },
        { key: 'ciHi', label: 'TS CI high', format: 'dec4' },
      ],
      rows: [
        { measure: 'Slope', ols: coefficients[0].b, ts: theilSen.slope, ciLo: theilSen.lo, ciHi: theilSen.hi },
        { measure: 'Intercept', ols: intercept.b, ts: theilSen.intercept, ciLo: NaN, ciHi: NaN },
      ],
      notes: ['Theil–Sen: mediana delle pendenze tra tutte le coppie di punti; CI bootstrap percentile (600 repliche, seed fisso).'],
    });
  } else if (k > 1) {
    tables.push({
      id: 'reg-robust',
      title: 'Stimatori robusti univariati',
      columns: [
        { key: 'predictor', label: 'Predictor', format: 'text' },
        { key: 'ols', label: 'OLS B', format: 'dec4' },
        { key: 'ts', label: 'Theil–Sen slope', format: 'dec4' },
      ],
      rows: predNames.map((name, index) => ({
        predictor: name,
        ols: coefficients[index].b,
        ts: univariateSlopes[index],
      })),
      notes: ['Con più predittori il Theil–Sen è calcolato separatamente per ciascun predittore e non controlla gli altri: usarlo solo come diagnostica descrittiva.'],
    });
  }

  if (robust) {
    tables.push({
      id: 'reg-robust-se',
      title: 'Errori standard robusti',
      subtitle: `${robustSE} · CI ${level}%`,
      columns: [
        { key: 'predictor', label: 'Predictor', format: 'text' },
        { key: 'b', label: 'B', format: 'dec4' },
        { key: 'se', label: 'SE robusto', format: 'dec4' },
        { key: 't', label: 't', format: 'dec3' },
        { key: 'p', label: 'p', format: 'p' },
        { key: 'ciLo', label: 'CI low', format: 'dec4' },
        { key: 'ciHi', label: 'CI high', format: 'dec4' },
      ],
      rows: [
        { predictor: '(Intercept)', ...robust.intercept },
        ...predNames.map((name, index) => ({ predictor: name, ...robust.coefficients[index] })),
      ],
      notes: [
        'HC1 = n/(n−k−1); HC3 = 1/(1−h)². La matrice di covarianza robusta non assume varianza costante.',
        'I gradi di libertà restano n−k−1; con pochi casi i test robusti sono instabili.',
      ],
    });
  }

  return tables;
};
