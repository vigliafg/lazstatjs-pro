/**
 * Row-level dynamic linking (L5).
 *
 * Charts carry pre-aggregated layers. A chart can opt into linking by adding a
 * stable `__row` key to the rows that represent an observation; the key is the
 * index of the source dataset row. This module owns the pure part: extracting
 * keys, the selection/hidden state, the Vega opacity overlay and the geometry
 * helpers used by the brush and the lasso.
 *
 * Linking never changes the data or the statistics: it only changes the
 * opacity of marks whose row is outside the current selection.
 */

import type { TopLevelSpec } from 'vega-lite';
import type { AnalysisChart, ChartRow, ChartValue } from '../stats/charts';

/** Reserved row field used by every link-aware chart. */
export const ROW_KEY_FIELD = '__row';

/** Opacity of an unselected row while a selection is active. */
export const DIM_OPACITY = 0.14;
/** Opacity of a row removed by the Data Filter. */
export const HIDDEN_OPACITY = 0.04;
/** Upper bound so a pathological selection cannot bloat the Vega spec. */
export const MAX_LINK_KEYS = 20_000;

/**
 * Parameters that carry the selection into the compiled Vega view.
 *
 * The keys live in signals rather than in the specification: changing a brush
 * must update the existing view with `view.signal(...)`, without recompiling
 * and re-embedding a chart with thousands of points.
 */
export const LINK_KEYS_SIGNAL = 'linkKeys';
export const HIDDEN_KEYS_SIGNAL = 'hiddenKeys';

export type LinkSelectionKind = 'brush' | 'lasso' | 'point';

/** One selection produced by a chart. `sourceId` is the chart id. */
export interface LinkSelection {
  sourceId: string;
  kind: LinkSelectionKind;
  keys: string[];
}

/** Selection + hidden rows shared by every chart in the run-report. */
export interface ChartLink {
  keys: readonly string[];
  hidden: readonly string[];
}

export const EMPTY_LINK: ChartLink = { keys: [], hidden: [] };

export const rowKeyOf = (row: ChartRow): string | null => {
  const value = row[ROW_KEY_FIELD];
  if (typeof value === 'string') return value.length > 0 ? value : null;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
};

const dedupe = (values: readonly string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length >= MAX_LINK_KEYS) break;
  }
  return out;
};

/** Normalise any untrusted key list before it reaches a Vega expression. */
export const normalizeKeys = (values: readonly string[] | null | undefined): string[] =>
  dedupe((values ?? []).filter(value => typeof value === 'string' && value.length > 0));

export const chartHasRowKeys = (chart: AnalysisChart): boolean =>
  Object.values(chart.data).some(rows => rows.some(row => rowKeyOf(row) !== null));

/** All row keys present in a chart, across every layer. */
export const chartRowKeys = (chart: AnalysisChart): string[] => {
  const keys: string[] = [];
  Object.values(chart.data).forEach(rows => {
    rows.forEach(row => {
      const key = rowKeyOf(row);
      if (key !== null) keys.push(key);
    });
  });
  return dedupe(keys);
};

export const linkSignature = (link: ChartLink | undefined): string =>
  link && (link.keys.length > 0 || link.hidden.length > 0)
    ? `${link.keys.join('\u0001')}\u0002${link.hidden.join('\u0001')}`
    : '';

export interface InteractionPoint {
  key: string;
  x: ChartValue;
  y: ChartValue;
}

const POINT_LAYERS = ['points', 'markers', 'series', 'summary', 'values'] as const;

/**
 * Rows that a brush or lasso can match. The first layer with link keys wins so
 * a chart is linked through its observation layer, not through annotations.
 * `category`/`value` cover categorical charts such as box and dot plots.
 */
export const interactionPoints = (chart: AnalysisChart): InteractionPoint[] => {
  for (const layer of POINT_LAYERS) {
    const rows = chart.data[layer] ?? [];
    const points: InteractionPoint[] = [];
    for (const row of rows) {
      const key = rowKeyOf(row);
      if (key === null) continue;
      const x = row.x ?? row.category;
      const y = row.y ?? row.value;
      if (x === undefined || x === null || y === undefined || y === null) continue;
      points.push({ key, x, y });
    }
    if (points.length > 0) return points;
  }
  return [];
};

const POINT_MARKS = new Set([
  'point',
  'circle',
  'square',
  'diamond',
  'triangle',
  'symbol',
]);

/**
 * A chart is linkable when it renders at least one observation as a symbol
 * mark. Histogram bins, shadowgram silhouettes and lines without markers have
 * row keys too, but there is no point to brush, so the overlay stays off.
 */
export const chartLinkable = (chart: AnalysisChart): boolean => {
  if (interactionPoints(chart).length === 0) return false;
  const options = chart.options;
  const pointsVisible = (): boolean => {
    if (options.kind === 'scatter' || options.kind === 'residual') return options.showPoints;
    if (options.kind === 'box') return options.showPoints;
    if (options.kind === 'scatter3d') return options.showPoints;
    return true;
  };
  switch (chart.kind) {
    case 'scatter':
    case 'residual':
    case 'score':
    case 'bland':
    case 'bubble':
    case 'scatter3d':
    case 'box':
    case 'dot':
    case 'qq':
    case 'diamond':
    case 'circles':
      return pointsVisible();
    case 'line':
      return options.kind === 'line' && options.showMarkers;
    default:
      return false;
  }
};

const opacityExpression = (): string =>
  `(datum.__row == null ? 1 : (indexof(${HIDDEN_KEYS_SIGNAL}, datum.__row + '') >= 0 ? ${HIDDEN_OPACITY} : (length(${LINK_KEYS_SIGNAL}) === 0 ? 1 : (indexof(${LINK_KEYS_SIGNAL}, datum.__row + '') >= 0 ? 1 : ${DIM_OPACITY}))))`;

/**
 * Add a row-aware opacity encoding to the point layers of a compiled spec.
 * Lines, bands, rules and summaries are untouched: linking must not remove the
 * statistical structure of the chart.
 *
 * The opacity uses the `linkKeys`/`hiddenKeys` signals, so a new brush only
 * updates signals in the mounted view. The initial values are taken from
 * `link` when the chart is embedded; an empty selection is fully opaque.
 */
export const applyChartLink = <T extends TopLevelSpec>(
  spec: T,
  chart: AnalysisChart,
  link: ChartLink | undefined
): T => {
  if (!chartHasRowKeys(chart)) return spec;
  const layers = (spec as unknown as { layer?: Record<string, unknown>[] }).layer;
  if (!Array.isArray(layers) || layers.length === 0) return spec;
  const expression = opacityExpression();
  const linked = layers.map(layer => {
    const mark = layer.mark as { type?: unknown } | string | undefined;
    const type = typeof mark === 'string' ? mark : mark?.type;
    if (typeof type !== 'string' || !POINT_MARKS.has(type)) return layer;
    const encoding = (layer.encoding ?? {}) as Record<string, unknown>;
    const transform = Array.isArray(layer.transform) ? layer.transform : [];
    return {
      ...layer,
      transform: [...transform, { calculate: expression, as: '__linkOpacity' }],
      encoding: {
        ...encoding,
        opacity: { field: '__linkOpacity', type: 'quantitative', scale: null, legend: null },
      },
    };
  });
  const existing = (spec as unknown as { params?: { name?: string }[] }).params;
  const params = Array.isArray(existing)
    ? existing.filter(param => param.name !== LINK_KEYS_SIGNAL && param.name !== HIDDEN_KEYS_SIGNAL)
    : [];
  return {
    ...spec,
    params: [
      ...params,
      { name: LINK_KEYS_SIGNAL, value: link?.keys ?? [] },
      { name: HIDDEN_KEYS_SIGNAL, value: link?.hidden ?? [] },
    ],
    layer: linked,
  } as T;
};

export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface PixelPoint {
  key: string;
  x: number;
  y: number;
}

export interface PolygonPoint {
  x: number;
  y: number;
}

/** Keys inside an axis-aligned rectangle, in the same pixel space. */
export const keysInRect = (points: readonly PixelPoint[], rect: Rect): string[] => {
  const left = Math.min(rect.x0, rect.x1);
  const right = Math.max(rect.x0, rect.x1);
  const top = Math.min(rect.y0, rect.y1);
  const bottom = Math.max(rect.y0, rect.y1);
  return points
    .filter(point => point.x >= left && point.x <= right && point.y >= top && point.y <= bottom)
    .map(point => point.key);
};

const inPolygon = (x: number, y: number, polygon: readonly PolygonPoint[]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
};

/** Keys inside a lasso polygon (ray casting, boundary-safe enough for a UI). */
export const keysInPolygon = (
  points: readonly PixelPoint[],
  polygon: readonly PolygonPoint[]
): string[] => {
  if (polygon.length < 3) return [];
  return points.filter(point => inPolygon(point.x, point.y, polygon)).map(point => point.key);
};

/** Normalise a pointer rectangle; returns null for a click without a drag. */
export const brushRect = (
  start: PolygonPoint,
  end: PolygonPoint,
  minimum = 3
): Rect | null =>
  Math.abs(end.x - start.x) >= minimum && Math.abs(end.y - start.y) >= minimum
    ? { x0: start.x, y0: start.y, x1: end.x, y1: end.y }
    : null;
