/**
 * L3 composite panels.
 *
 * A panel is a report made of charts and tables that the runner has already
 * produced: it never computes statistics and never appears in the style
 * gallery. The builders below only choose which existing objects belong to the
 * JMP-style report and in what order; a missing object simply drops out, so a
 * panel degrades instead of showing an empty frame.
 */

import type {
  AnalysisChart,
  PanelChart,
  PanelLayout,
} from '../stats/charts';
import { MAX_PANEL_CHILDREN } from '../stats/charts';
import { copy } from '../stats/reportCopy';
import type { TableSpec } from '../stats/types';

export interface PanelInit {
  id: string;
  title: string;
  subtitle?: string;
  note?: string;
  layout?: PanelLayout;
  children: readonly AnalysisChart[];
  tables?: readonly TableSpec[];
}

/** Build a valid panel, or `null` when none of its children is available. */
export const makePanel = (init: PanelInit): PanelChart | null => {
  const seen = new Set<string>();
  const children: AnalysisChart[] = [];
  for (const chart of init.children) {
    if (seen.has(chart.id)) continue;
    seen.add(chart.id);
    children.push(chart);
    if (children.length >= MAX_PANEL_CHILDREN) break;
  }
  if (children.length === 0) return null;
  const tables = (init.tables ?? []).slice(0, 4);
  return {
    version: 1,
    id: init.id,
    kind: 'panel',
    title: init.title,
    ...(init.subtitle ? { subtitle: init.subtitle } : {}),
    ...(init.note ? { note: init.note } : {}),
    layout: init.layout ?? 'grid',
    children: [...children],
    ...(tables.length > 0 ? { tables: [...tables] } : {}),
  };
};

const firstById = (
  charts: readonly AnalysisChart[],
  ids: readonly string[]
): AnalysisChart[] => {
  const found: AnalysisChart[] = [];
  ids.forEach(id => {
    const chart = charts.find(item => item.id === id);
    if (chart) found.push(chart);
  });
  return found;
};

const firstByPrefix = (
  charts: readonly AnalysisChart[],
  prefix: string,
  limit = 1
): AnalysisChart[] => charts.filter(chart => chart.id.startsWith(prefix)).slice(0, limit);

const firstByKind = (
  charts: readonly AnalysisChart[],
  kind: AnalysisChart['kind'],
  limit = 1
): AnalysisChart[] => charts.filter(chart => chart.kind === kind).slice(0, limit);

const tablesById = (
  tables: readonly TableSpec[] | undefined,
  ids: readonly string[]
): TableSpec[] =>
  (tables ?? []).filter(table => ids.includes(table.id)).slice(0, 4);

export interface DistributionPanelOptions {
  id?: string;
  title: string;
  subtitle?: string;
  note?: string;
  charts: readonly AnalysisChart[];
  tables?: readonly TableSpec[];
  layout?: PanelLayout;
}

/**
 * Distribution report: histogram, quantile box, normal Q-Q and shadowgram.
 * The histogram and the shadowgram describe the same first variable; the box
 * and the Q-Q stay useful even when only one of them is present.
 */
export const distributionPanel = (options: DistributionPanelOptions): PanelChart | null =>
  makePanel({
    id: options.id ?? 'panel-distribution',
    title: options.title,
    ...(options.subtitle ? { subtitle: options.subtitle } : {}),
    note:
      options.note ??
      copy('Istogramma, box, Q-Q e shadowgram descrivono la stessa variabile: nessun grafico aggiunge un test, mostrano solo forma, centro e code.'),
    layout: options.layout ?? 'grid',
    children: [
      ...firstByPrefix(options.charts, 'desc-hist-'),
      ...firstById(options.charts, ['desc-box']),
      ...firstByPrefix(options.charts, 'desc-qq-'),
      ...firstByPrefix(options.charts, 'desc-shadow-'),
      ...firstByKind(options.charts, 'histogram'),
    ],
    tables: tablesById(options.tables, ['desc-location', 'desc-dispersion', 'desc-quantiles']),
  });

export interface OnewayPanelOptions {
  id?: string;
  title: string;
  subtitle?: string;
  note?: string;
  charts: readonly AnalysisChart[];
  tables?: readonly TableSpec[];
  layout?: PanelLayout;
}

/**
 * Oneway report: mean diamonds, comparison circles, the quantile box and the
 * post-hoc differences. The diamond/circles are the JMP signature of the
 * platform; the box keeps the raw distribution visible.
 */
export const onewayPanel = (options: OnewayPanelOptions): PanelChart | null =>
  makePanel({
    id: options.id ?? 'panel-oneway',
    title: options.title,
    ...(options.subtitle ? { subtitle: options.subtitle } : {}),
    note:
      options.note ??
      copy('I diamanti mostrano media e incertezza, i cerchi il confronto visivo tra gruppi; il test formale resta nella tabella post-hoc.'),
    layout: options.layout ?? 'grid',
    children: firstById(options.charts, [
      'anova-diamond',
      'anova-circles',
      'anova-box',
      'anova-posthoc-forest',
      'anova-means',
    ]),
    tables: tablesById(options.tables, [
      'anova-table',
      'anova-posthoc',
      'anova-kruskal',
      'anova-kruskal-ranks',
    ]),
  });

export interface FitModelPanelOptions {
  id?: string;
  title: string;
  subtitle?: string;
  note?: string;
  charts: readonly AnalysisChart[];
  tables?: readonly TableSpec[];
  layout?: PanelLayout;
}

/**
 * Fit Model report: actual by predicted (or the simple regression), residual
 * by predicted, scale-location, residual leverage and the normal Q-Q.
 */
export const fitModelPanel = (options: FitModelPanelOptions): PanelChart | null =>
  makePanel({
    id: options.id ?? 'panel-fit-model',
    title: options.title,
    ...(options.subtitle ? { subtitle: options.subtitle } : {}),
    note:
      options.note ??
      copy('Osservati vs stimati misura l’accordo del modello; i pannelli dei residui controllano struttura, varianza e punti influenti.'),
    layout: options.layout ?? 'grid',
    children: firstById(options.charts, [
      'reg-observed-fitted',
      'reg-scatter',
      'reg-residual-fitted',
      'reg-scale-location',
      'reg-residual-leverage',
      'reg-residual-qq',
    ]),
    tables: tablesById(options.tables, ['reg-model', 'reg-anova', 'reg-coefficients', 'reg-diagnostics']),
  });

export interface RegressionDiagnosticPanelOptions {
  id?: string;
  title: string;
  subtitle?: string;
  note?: string;
  charts: readonly AnalysisChart[];
  tables?: readonly TableSpec[];
  layout?: PanelLayout;
}

/** Regression diagnostics: residuals, scale, leverage, Cook distance and Q-Q. */
export const regressionDiagnosticPanel = (
  options: RegressionDiagnosticPanelOptions
): PanelChart | null =>
  makePanel({
    id: options.id ?? 'panel-regression-diagnostics',
    title: options.title,
    ...(options.subtitle ? { subtitle: options.subtitle } : {}),
    note:
      options.note ??
      copy('Residui senza struttura, varianza stabile e nessun punto oltre le soglie di leverage/Cook sostengono le assunzioni del modello.'),
    layout: options.layout ?? 'grid',
    children: firstById(options.charts, [
      'reg-residual-fitted',
      'reg-scale-location',
      'reg-residual-leverage',
      'reg-cooks',
      'reg-residual-qq',
      'reg-residual-box',
    ]),
    tables: tablesById(options.tables, ['reg-diagnostics', 'reg-coefficients']),
  });

export interface PcaPanelOptions {
  id?: string;
  title: string;
  subtitle?: string;
  note?: string;
  charts: readonly AnalysisChart[];
  tables?: readonly TableSpec[];
  layout?: PanelLayout;
}

/** PCA report: scree, scores, loadings heatmap and biplot. */
export const pcaPanel = (options: PcaPanelOptions): PanelChart | null =>
  makePanel({
    id: options.id ?? 'panel-pca',
    title: options.title,
    ...(options.subtitle ? { subtitle: options.subtitle } : {}),
    note:
      options.note ??
      copy('Lo scree sceglie quante componenti trattenere; score e biplot mostrano i casi, i carichi mostrano come le variabili costruiscono le componenti.'),
    layout: options.layout ?? 'grid',
    children: firstById(options.charts, [
      'pca-scree',
      'pca-score',
      'pca-loadings',
      'pca-biplot',
    ]),
    tables: tablesById(options.tables, ['pca-eigen', 'pca-loadings', 'pca-adequacy']),
  });

export interface TimeSeriesPanelOptions {
  id?: string;
  title: string;
  subtitle?: string;
  note?: string;
  charts: readonly AnalysisChart[];
  tables?: readonly TableSpec[];
  layout?: PanelLayout;
}

/** Time-series report: series/forecast, ACF/PACF and decomposition. */
export const timeSeriesPanel = (options: TimeSeriesPanelOptions): PanelChart | null => {
  const forecast = firstById(options.charts, ['ts-arima-chart', 'ts-simple-chart']).slice(0, 1);
  return makePanel({
    id: options.id ?? 'panel-timeseries',
    title: options.title,
    ...(options.subtitle ? { subtitle: options.subtitle } : {}),
    note:
      options.note ??
      copy('La serie e la previsione si leggono insieme ad ACF/PACF e alla scomposizione: un residuo bianco sostiene il modello, un pattern no.'),
    layout: options.layout ?? 'stack',
    children: [
      ...forecast,
      ...firstById(options.charts, [
        'ts-acf-chart',
        'ts-pacf-chart',
        'ts-decomposition-trend',
        'ts-decomposition-components',
        'ts-rolling',
        'ts-spectrum',
      ]),
    ],
    tables: tablesById(options.tables, ['ts-summary', 'ts-models', 'ts-acf']),
  });
};

export interface QualityPanelOptions {
  id?: string;
  /** Optional: the builder owns a translated default title. */
  title?: string;
  subtitle?: string;
  note?: string;
  charts: readonly AnalysisChart[];
  tables?: readonly TableSpec[];
  layout?: PanelLayout;
}

/**
 * Quality report: control chart, capability, Pareto and variability.
 *
 * The panel is ready now, but no procedure emits those charts until the L4
 * quality platform lands (Milestone D). It is therefore a builder with a
 * tested contract, not a card produced by the current runners.
 */
export const qualityPanel = (options: QualityPanelOptions): PanelChart | null => {
  const prefixes = [
    'control',
    'capab',
    'pareto',
    'variab',
    'quality',
    'xbar',
    'ewma',
    'msa',
    'accept',
    'mcontrol',
  ];
  const children = options.charts.filter(chart =>
    prefixes.some(prefix => chart.id.toLowerCase().startsWith(prefix))
  );
  return makePanel({
    id: options.id ?? 'panel-quality',
    title: options.title ?? copy('Report di qualità'),
    ...(options.subtitle ? { subtitle: options.subtitle } : {}),
    note:
      options.note ??
      copy('Controllo del processo, capacità, Pareto e variabilità rispondono a domande diverse: il pannello le tiene vicine senza confonderle.'),
    layout: options.layout ?? 'grid',
    children,
    tables: options.tables,
  });
};
