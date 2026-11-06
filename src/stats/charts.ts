/**
 * Serializable chart contract produced by analysis runners.
 *
 * A chart is a semantic model (data already aggregated by the statistical
 * kernel, field labels and user options), not a React tree. The same model can
 * cross a Web Worker, be stored in a `.lzs` project and be compiled to a
 * Vega-Lite specification on demand.
 */

import type { ChartAnnotation } from '../charts/annotations';
import type { TableSpec } from './types';

/** Deterministic downsample cap applied by the schema before persistence. */
export const MAX_CHART_POINTS = 2000;
/** Interface and persistence cap for one output card. */
export const MAX_CHARTS_PER_OUTPUT = 24;
/** A single serialized model above this size is not persisted. */
export const MAX_CHART_MODEL_CHARS = 120_000;
/**
 * A panel is depth 1: its children are ordinary charts, never other panels.
 * The cap keeps one composite card readable and inside the export budget.
 */
export const MAX_PANEL_CHILDREN = 8;

export type ChartValue = string | number | null;
export type ChartRow = Record<string, ChartValue>;

export const CHART_KINDS = [
  'scatter',
  'line',
  'bar',
  'box',
  'histogram',
  'interval',
  'dot',
  'ecdf',
  'qq',
  'forest',
  'survival',
  'risk',
  'mosaic',
  'acf',
  'heatmap',
  'residual',
  'scree',
  'score',
  'bland',
  'power',
  'bootstrap',
  'missingness',
  'diamond',
  'circles',
  'shadowgram',
  'scattermatrix',
  'bubble',
  'scatter3d',
  'tree',
  'pareto',
  'dendrogram',
  'surface',
] as const;

export type ChartKind = (typeof CHART_KINDS)[number];

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
  /**
   * Free annotations in normalized plot coordinates. Per card only: this key
   * is intentionally absent from factory, user and global chart defaults.
   */
  annotations?: ChartAnnotation[];
}

export interface ScatterOptions extends CommonChartOptions {
  kind: 'scatter';
  showPoints: boolean;
  fit: 'none' | 'ols' | 'robust' | 'both';
  showFit: boolean;
  band: 'none' | 'ci' | 'pi';
  showBand: boolean;
  bandLevel: 90 | 95 | 99;
  bandOpacity: number;
  equation: 'none' | 'short' | 'full';
  showR2: boolean;
  showN: boolean;
  pointLabels: boolean;
  ellipse: boolean;
  /** Horizontal reference line at the mean of Y, when the model carries it. */
  showMeanLine: boolean;
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
  showErrorBars: boolean;
  capSize: number;
  valueLabels: boolean;
  sort: 'none' | 'asc' | 'desc';
  referenceLine: 'none' | 'zero' | 'one';
  /** Series side by side (dodged) instead of stacked. */
  grouping: 'stacked' | 'grouped';
}

export interface BoxOptions extends CommonChartOptions {
  kind: 'box';
  /** Presentation: classic box, notched box or KDE violin. */
  display: 'box' | 'notched' | 'violin' | 'raincloud';
  /** Tukey fences or the 10th–90th percentile (the JMP-like Oneway box). */
  whisker: 'tukey' | 'percentile';
  showPoints: boolean;
  showWhiskers: boolean;
  showOutliers: boolean;
  showMean: boolean;
  /** Mean confidence interval, drawn only when the summary carries it. */
  showMeanInterval: boolean;
  /** Deterministic horizontal spread of the raw points. */
  jitter: boolean;
  labelMedian: boolean;
  sort: 'none' | 'asc' | 'desc';
}

export interface HistogramOptions extends CommonChartOptions {
  kind: 'histogram';
  showDensity: boolean;
  showKde: boolean;
  showRug: boolean;
  showMeanLine: boolean;
  bins: number;
}

export interface IntervalOptions extends CommonChartOptions {
  kind: 'interval';
  valueLabels: boolean;
  /** Draw the estimate as a diamond instead of a point. */
  showMeanDiamond: boolean;
  sort: 'none' | 'asc' | 'desc';
}

export interface DotOptions extends CommonChartOptions {
  kind: 'dot';
  showMean: boolean;
  /** Horizontal spread of the raw observations. */
  jitter: 'none' | 'strip' | 'wide';
  sort: 'none' | 'asc' | 'desc';
}

export interface EcdfOptions extends CommonChartOptions {
  kind: 'ecdf';
  showPoints: boolean;
  showMedian: boolean;
}

/** How the normal Q-Q uncertainty envelope is drawn. */
export type QqCiStyle = 'band' | 'curves';

/**
 * Horizontal scale of a Q-Q plot.
 *
 * `z` keeps the theoretical quantiles as they are, `probability` labels the
 * same axis with normal probabilities, and `both` shows probabilities at the
 * bottom with z-scores repeated on the top axis (the JMP layout).
 */
export type QqAxis = 'z' | 'probability' | 'both';

export interface QqOptions extends CommonChartOptions {
  kind: 'qq';
  showReference: boolean;
  showCI: boolean;
  ciStyle: QqCiStyle;
  qqAxis: QqAxis;
  detrended: boolean;
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

export interface MosaicOptions extends CommonChartOptions {
  kind: 'mosaic';
  showValues: boolean;
  residualColor: boolean;
}

export interface RiskOptions extends CommonChartOptions {
  kind: 'risk';
  /** Add cumulative events in parentheses next to the at-risk count. */
  showEvents: boolean;
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

export interface ResidualOptions extends CommonChartOptions {
  kind: 'residual';
  showPoints: boolean;
  showZeroLine: boolean;
  /** ±2 SD reference band, drawn when the model carries the residual SD. */
  showStdBand: boolean;
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
  showVectors: boolean;
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
  showDensity: boolean;
}

export interface MissingnessOptions extends CommonChartOptions {
  kind: 'missingness';
  showLabels: boolean;
  display: 'bars' | 'matrix';
}

/** JMP-like mean diamond: one estimate per category, optionally scaled by CI. */
export interface DiamondOptions extends CommonChartOptions {
  kind: 'diamond';
  showLabels: boolean;
  /** Diamond size follows the interval width instead of a fixed marker. */
  scaleToCI: boolean;
  sort: 'none' | 'asc' | 'desc';
}

/** Comparison circles: group estimates on a shared numeric axis. */
export interface CirclesOptions extends CommonChartOptions {
  kind: 'circles';
  showLabels: boolean;
  showIntervals: boolean;
  sort: 'none' | 'asc' | 'desc';
}

/** Shaded distribution: a filled density silhouette with optional mean line. */
export interface ShadowgramOptions extends CommonChartOptions {
  kind: 'shadowgram';
  showRug: boolean;
  showMeanLine: boolean;
}

/** Scatterplot matrix: pairwise panels prepared by the runner. */
export interface ScatterMatrixOptions extends CommonChartOptions {
  kind: 'scattermatrix';
  showEllipses: boolean;
}

/** Bubble plot: x, y and a size channel. */
export interface BubbleOptions extends CommonChartOptions {
  kind: 'bubble';
  showLabels: boolean;
  showSizeLegend: boolean;
}

/** Projected 3D scatter with a projected density ellipsoid. */
export interface Scatter3dOptions extends CommonChartOptions {
  kind: 'scatter3d';
  showEllipsoid: boolean;
  showPoints: boolean;
}

/** Binary partition tree: nodes are rules and leaves are predictions. */
export interface TreeOptions extends CommonChartOptions {
  kind: 'tree';
  showValues: boolean;
  showLeaves: boolean;
}

/** Pareto chart: sorted bars plus a cumulative percentage line. */
export interface ParetoOptions extends CommonChartOptions {
  kind: 'pareto';
  showCumulative: boolean;
  valueLabels: boolean;
  sort: 'none' | 'asc' | 'desc';
}

/** Hierarchical cluster dendrogram with optional leaf labels. */
export interface DendrogramOptions extends CommonChartOptions {
  kind: 'dendrogram';
  showLabels: boolean;
  showHeights: boolean;
}

/** Response surface: projected 3D mesh or a contour map. */
export interface SurfaceOptions extends CommonChartOptions {
  kind: 'surface';
  display: 'mesh' | 'contour';
  showPoints: boolean;
}

export type ChartOptions =
  | ScatterOptions
  | LineOptions
  | BarOptions
  | BoxOptions
  | HistogramOptions
  | IntervalOptions
  | DotOptions
  | EcdfOptions
  | QqOptions
  | ForestOptions
  | SurvivalOptions
  | RiskOptions
  | MosaicOptions
  | AcfOptions
  | HeatmapOptions
  | ResidualOptions
  | ScreeOptions
  | ScoreOptions
  | BlandOptions
  | PowerOptions
  | BootstrapOptions
  | MissingnessOptions
  | DiamondOptions
  | CirclesOptions
  | ShadowgramOptions
  | ScatterMatrixOptions
  | BubbleOptions
  | Scatter3dOptions
  | TreeOptions
  | ParetoOptions
  | DendrogramOptions
  | SurfaceOptions;

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

/** How a composite panel arranges its children. */
export type PanelLayout = 'grid' | 'stack';

/**
 * L3 composite card: a JMP-style report made of already-computed charts.
 *
 * A panel is not a chart kind and never appears in the style gallery: it owns
 * no data kernels of its own. Its children are complete `AnalysisChart`
 * models, so every plot keeps its own options, editor and export path.
 * Depth is one by construction (`children` cannot contain panels).
 */
export interface PanelChart {
  version: 1;
  id: string;
  kind: 'panel';
  title: string;
  subtitle?: string;
  /** Short prose rendered below the panel (what the panel shows / caveats). */
  note?: string;
  layout: PanelLayout;
  children: AnalysisChart[];
  /** Compact tables that belong to this report, already computed by the run. */
  tables?: TableSpec[];
}

/** Anything that can sit in a run-report card: one chart or one panel. */
export type ReportChart = AnalysisChart | PanelChart;

export const isPanelChart = (chart: ReportChart): chart is PanelChart =>
  chart.kind === 'panel';
