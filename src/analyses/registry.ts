/**
 * Registro unico delle analisi.
 *
 * Fonte di verità per l'ordine dei tab, le etichette e gli id usati da
 * `runAnalysis`. Aggiungere un'analisi significa aggiungere una voce qui e il
 * suo modulo: niente più liste duplicate tra JSX, persistenza e test.
 */

export const ANALYSIS_TABS = [
  { id: 'wizard', label: 'Wizard' },
  { id: 'descriptive', label: 'Descriptive' },
  { id: 'ttest', label: 'T-Test' },
  { id: 'anova', label: 'ANOVA' },
  { id: 'regression', label: 'Regression' },
  { id: 'correlation', label: 'Correlation' },
  { id: 'multivariate', label: 'Multivariate' },
  { id: 'chisquare', label: 'Chi-Square (χ²)' },
  { id: 'contingency', label: 'Contingency (R×C)' },
  { id: 'nonparamrm', label: 'Non-parametric RM' },
  { id: 'repeatedanova', label: 'Repeated ANOVA' },
  { id: 'samplesize', label: 'Sample Size / Power' },
  { id: 'distfit', label: 'Distribution Fit' },
  { id: 'factorial', label: 'Factorial ANOVA' },
  { id: 'ancova', label: 'ANCOVA' },
  { id: 'logistic', label: 'Logistic Regression' },
  { id: 'countreg', label: 'Count Regression' },
  { id: 'lmm', label: 'Mixed Model (LMM)' },
  { id: 'ordinal', label: 'Ordinal Logistic' },
  { id: 'mixedanova', label: 'Mixed ANOVA' },
  { id: 'parametric', label: 'Parametric Survival' },
  { id: 'resampling', label: 'Resampling' },
  { id: 'mi', label: 'Missing Data (MI)' },
  { id: 'timeseries', label: 'Time Series' },
  { id: 'survival', label: 'Survival (KM)' },
  { id: 'cox', label: 'Cox (PH)' },
  { id: 'tost', label: 'Equivalence (TOST)' },
  { id: 'agreement', label: 'Agreement' },
] as const;

export type AnalysisId = (typeof ANALYSIS_TABS)[number]['id'];

export const ANALYSIS_IDS: readonly string[] = ANALYSIS_TABS.map(tab => tab.id);

/** Etichetta leggibile di un'analisi, con fallback sull'id. */
export const analysisLabel = (id: string): string =>
  ANALYSIS_TABS.find(tab => tab.id === id)?.label ?? id;
