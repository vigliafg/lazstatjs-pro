/**
 * Serializable chart contract produced by analysis runners.
 *
 * A chart is a semantic model (data already aggregated by the statistical
 * kernel, field labels and user options), not a React tree. The same model can
 * cross a Web Worker, be stored in a `.lzs` project and be compiled to a
 * Vega-Lite specification on demand.
 */

/** Deterministic downsample cap applied by the schema before persistence. */
export const MAX_CHART_POINTS = 2000;
/** Interface and persistence cap for one output card. */
export const MAX_CHARTS_PER_OUTPUT = 24;
/** A single serialized model above this size is not persisted. */
export const MAX_CHART_MODEL_CHARS = 120_000;

export type ChartValue = string | number | null;
export type ChartRow = Record<string, ChartValue>;

export type ChartKind =
  | 'scatter'
  | 'line'
  | 'bar'
  | 'box'
  | 'histogram'
  | 'qq'
  | 'forest'
  | 'survival'
  | 'acf'
  | 'heatmap'
  | 'mosaic'
  | 'residual'
  | 'scree'
  | 'score'
  | 'bland'
  | 'power'
  | 'bootstrap'
  | 'missingness';

export type ChartLayout = 'full' | 'half';

export interface CommonChartOptions {
  preset: 'default' | 'minimal' | 'print';
  theme: 'dark' | 'light';
  gridX: boolean;
  gridY: boolean;
  gridOpacity: number;
  palette: 'default' | 'colorblind' | 'mono';
  showLegend: boolean;
  legendPosition: 'right' | 'bottom';
  showTitle: boolean;
  showSubtitle: boolean;
  showNote: boolean;
  showXTitle: boolean;
  showYTitle: boolean;
  zeroBaseline: boolean;
  pointShape: 'circle' | 'square' | 'diamond' | 'triangle';
  pointSize: number;
  pointOpacity: number;
  lineWidth: number;
  lineDash: 'solid' | 'dashed' | 'dotted';
  size: 'compact' | 'regular' | 'wide';
  tooltip: boolean;
}

export interface ScatterOptions extends CommonChartOptions {
  kind: 'scatter';
  showPoints: boolean;
  fit: 'none' | 'ols' | 'robust' | 'both';
  band: 'none' | 'ci' | 'pi';
  bandLevel: 90 | 95 | 99;
  bandOpacity: number;
  equation: 'none' | 'short' | 'full';
  showR2: boolean;
  showN: boolean;
  pointLabels: boolean;
}

export interface LineOptions extends CommonChartOptions {
  kind: 'line';
  step: boolean;
  showMarkers: boolean;
  showBand: boolean;
}

export interface BarOptions extends CommonChartOptions {
  kind: 'bar';
  error: 'none' | 'se' | 'ci' | 'sd';
  valueLabels: boolean;
  sort: 'none' | 'asc' | 'desc';
  referenceLine: 'none' | 'zero' | 'one';
}

export interface BoxOptions extends CommonChartOptions {
  kind: 'box';
  showPoints: boolean;
  showOutliers: boolean;
  showMean: boolean;
  labelMedian: boolean;
  sort: 'none' | 'asc' | 'desc';
}

export interface HistogramOptions extends CommonChartOptions {
  kind: 'histogram';
  showDensity: boolean;
  showRug: boolean;
  showMeanLine: boolean;
  bins: number;
}

export interface QqOptions extends CommonChartOptions {
  kind: 'qq';
  showReference: boolean;
  showCI: boolean;
}

export interface ForestOptions extends CommonChartOptions {
  kind: 'forest';
  logScale: boolean;
  reference: 'one' | 'zero';
  sort: 'none' | 'estimate' | 'label';
}

export interface SurvivalOptions extends CommonChartOptions {
  kind: 'survival';
  showCI: boolean;
  showCensoring: boolean;
  showMedian: boolean;
  step: boolean;
}

export interface AcfOptions extends CommonChartOptions {
  kind: 'acf';
  showBand: boolean;
}

export interface HeatmapOptions extends CommonChartOptions {
  kind: 'heatmap';
  showValues: boolean;
  diverging: boolean;
  sort: 'none' | 'asc' | 'desc';
}

export interface MosaicOptions extends CommonChartOptions {
  kind: 'mosaic';
  showResiduals: boolean;
  showValues: boolean;
}

export interface ResidualOptions extends CommonChartOptions {
  kind: 'residual';
  showPoints: boolean;
  showZeroLine: boolean;
}

export interface ScreeOptions extends CommonChartOptions {
  kind: 'scree';
  showKaiser: boolean;
  showValues: boolean;
}

export interface ScoreOptions extends CommonChartOptions {
  kind: 'score';
  showLabels: boolean;
  ellipse: boolean;
}

export interface BlandOptions extends CommonChartOptions {
  kind: 'bland';
  showBias: boolean;
  showLoA: boolean;
  showIdentity: boolean;
}

export interface PowerOptions extends CommonChartOptions {
  kind: 'power';
  showTarget: boolean;
  showDesignMarker: boolean;
}

export interface BootstrapOptions extends CommonChartOptions {
  kind: 'bootstrap';
  showObserved: boolean;
  showCI: boolean;
}

export interface MissingnessOptions extends CommonChartOptions {
  kind: 'missingness';
  showLabels: boolean;
}

export type ChartOptions =
  | ScatterOptions
  | LineOptions
  | BarOptions
  | BoxOptions
  | HistogramOptions
  | QqOptions
  | ForestOptions
  | SurvivalOptions
  | AcfOptions
  | HeatmapOptions
  | MosaicOptions
  | ResidualOptions
  | ScreeOptions
  | ScoreOptions
  | BlandOptions
  | PowerOptions
  | BootstrapOptions
  | MissingnessOptions;

/** Layers are named (`points`, `fit`, `band`, `summary`, ...) so the renderer
 * and the editor never depend on the chart kind for row access. */
export type ChartData = Record<string, ChartRow[]>;

export interface AnalysisChart {
  version: 1;
  id: string;
  kind: ChartKind;
  title: string;
  subtitle?: string;
  note?: string;
  layout: ChartLayout;
  data: ChartData;
  /** Human-readable names for axes and legends, keyed by row field. */
  fields: Record<string, string>;
  stats?: Record<string, number | string | null>;
  options: ChartOptions;
  /** True when the schema downsampled at least one layer. */
  sampled?: boolean;
}
