/**
 * Free annotations on a rendered chart.
 *
 * Annotations are a per-card list of primitives in normalized plot coordinates
 * (0-1 inside the plot area). They are drawn inside the same SVG that Vega
 * produces, so preview, PNG and HTML export share one representation. The
 * interactive editor is only an overlay of handles and hit areas.
 */

export type AnnotationType = 'text' | 'line' | 'arrow' | 'rect';

export interface ChartAnnotation {
  id: string;
  type: AnnotationType;
  /** Normalized x inside the plot area (0 = left edge, 1 = right edge). */
  x: number;
  /** Normalized y inside the plot area (0 = top edge, 1 = bottom edge). */
  y: number;
  /** End point for line, arrow and rect. */
  x2?: number;
  y2?: number;
  text?: string;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  fontSize?: number;
  hidden?: boolean;
}

export const MAX_ANNOTATIONS = 20;
export const MAX_ANNOTATION_TEXT = 200;
/** Serialized cap so annotations can never push the chart over its model budget. */
export const MAX_ANNOTATION_BYTES = 20_000;

export const ANNOTATION_TYPES: readonly AnnotationType[] = ['text', 'line', 'arrow', 'rect'];

export const ANNOTATION_FONT = '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif';

const SVG_NS = 'http://www.w3.org/2000/svg';

let annotationSequence = 0;

/** Unique, stable id for an annotation created in this session. */
export const createAnnotationId = (): string =>
  `a-${Date.now().toString(36)}-${(annotationSequence++).toString(36)}`;

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const bounded = (value: unknown, min: number, max: number, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;

const coordinate = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? clamp01(value) : null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const COLOR_FUNCTION = /^(?:rgb|rgba|hsl|hsla)\(\s*[-+0-9.%\s,/]+\)$/i;
const COLOR_NAME = /^[a-z]{3,24}$/i;

/** Accept CSS colours that cannot smuggle markup or `url()` into the SVG. */
export const isSafeColor = (value: unknown): value is string =>
  typeof value === 'string' &&
  (HEX.test(value) ||
    COLOR_FUNCTION.test(value) ||
    (COLOR_NAME.test(value) && value.toLowerCase() !== 'url'));

const cleanText = (value: unknown): string =>
  typeof value === 'string'
    ? value
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_ANNOTATION_TEXT)
    : '';

const cleanId = (value: unknown, index: number, used: Set<string>): string => {
  const base =
    typeof value === 'string' && value.trim().length > 0
      ? value.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80)
      : `a-${index + 1}`;
  let id = base || `a-${index + 1}`;
  let suffix = 2;
  while (used.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  used.add(id);
  return id;
};

/**
 * Sanitize any untrusted annotation list (project file, worker payload).
 * Invalid entries are dropped; the result never exceeds the annotation budget.
 */
export const normalizeAnnotations = (value: unknown): ChartAnnotation[] => {
  if (!Array.isArray(value)) return [];
  const out: ChartAnnotation[] = [];
  const used = new Set<string>();
  for (let index = 0; index < value.length && out.length < MAX_ANNOTATIONS; index += 1) {
    const raw = value[index];
    if (!isRecord(raw)) continue;
    const type = ANNOTATION_TYPES.find(candidate => candidate === raw.type);
    if (!type) continue;
    const x = coordinate(raw.x);
    const y = coordinate(raw.y);
    if (x === null || y === null) continue;

    const id = cleanId(raw.id, index, used);
    const strokeWidth = bounded(raw.strokeWidth, 1, 8, 2);
    if (type === 'text') {
      out.push({
        id,
        type,
        x,
        y,
        ...(cleanText(raw.text) ? { text: cleanText(raw.text) } : {}),
        ...(isSafeColor(raw.color) ? { color: raw.color } : {}),
        strokeWidth,
        fontSize: bounded(raw.fontSize, 8, 32, 12),
        ...(raw.hidden === true ? { hidden: true } : {}),
      });
      continue;
    }

    const x2 = coordinate(raw.x2) ?? clamp01(x + 0.2);
    const y2 = coordinate(raw.y2) ?? clamp01(y + 0.15);
    out.push({
      id,
      type,
      x,
      y,
      x2,
      y2,
      ...(isSafeColor(raw.color) ? { color: raw.color } : {}),
      ...(type === 'rect' && isSafeColor(raw.fill) ? { fill: raw.fill } : {}),
      strokeWidth,
      ...(raw.hidden === true ? { hidden: true } : {}),
    });
  }
  while (out.length > 0 && JSON.stringify(out).length > MAX_ANNOTATION_BYTES) out.pop();
  return out;
};

/** Factory used by the editor buttons. Text is filled by the caller. */
export const createAnnotation = (
  type: AnnotationType,
  count: number,
  text = ''
): ChartAnnotation => {
  const offset = (count % 5) * 0.035;
  const id = createAnnotationId();
  if (type === 'text') {
    return {
      id,
      type,
      x: clamp01(0.08 + offset),
      y: clamp01(0.12 + offset),
      text: text.slice(0, MAX_ANNOTATION_TEXT),
      strokeWidth: 2,
      fontSize: 12,
    };
  }
  if (type === 'rect') {
    return {
      id,
      type,
      x: clamp01(0.25 + offset),
      y: clamp01(0.25 + offset),
      x2: clamp01(0.6 + offset),
      y2: clamp01(0.55 + offset),
      strokeWidth: 2,
    };
  }
  return {
    id,
    type,
    x: clamp01(0.25 + offset),
    y: clamp01(0.3 + offset),
    x2: clamp01(0.6 + offset),
    y2: clamp01(0.55 + offset),
    strokeWidth: 2,
  };
};

export const annotationColor = (
  annotation: ChartAnnotation,
  theme: 'dark' | 'light'
): string => annotation.color ?? (theme === 'dark' ? '#fbbf24' : '#b45309');

/** Rect fill is a translucent tint of the stroke unless the user picked one. */
export const annotationFill = (
  annotation: ChartAnnotation,
  theme: 'dark' | 'light'
): { fill: string; opacity: number } =>
  annotation.fill
    ? { fill: annotation.fill, opacity: 1 }
    : { fill: annotationColor(annotation, theme), opacity: 0.14 };

/** Plot rectangle in SVG user units and in CSS pixels relative to the host. */
export interface PlotArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ChartPlotArea {
  /** Coordinates in the Vega SVG user space (used by the exported marks). */
  svg: PlotArea;
  /** Coordinates in CSS pixels relative to the chart wrapper (used by the editor). */
  css: PlotArea;
}

export interface AnnotationBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextGeometry {
  kind: 'text';
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  bbox: AnnotationBBox;
}

export interface SegmentGeometry {
  kind: 'line' | 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  strokeWidth: number;
  points?: string;
  bbox: AnnotationBBox;
}

export interface RectGeometry {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fill: string;
  fillOpacity: number;
  strokeWidth: number;
  bbox: AnnotationBBox;
}

export type AnnotationGeometry = TextGeometry | SegmentGeometry | RectGeometry;

const arrowPoints = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size: number
): string => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const baseX = x2 - Math.cos(angle) * size;
  const baseY = y2 - Math.sin(angle) * size;
  const spread = size * 0.55;
  const p2x = baseX + Math.sin(angle) * spread;
  const p2y = baseY - Math.cos(angle) * spread;
  const p3x = baseX - Math.sin(angle) * spread;
  const p3y = baseY + Math.cos(angle) * spread;
  return `${x2.toFixed(2)},${y2.toFixed(2)} ${p2x.toFixed(2)},${p2y.toFixed(2)} ${p3x.toFixed(
    2
  )},${p3y.toFixed(2)}`;
};

/** Convert one normalized annotation to pixel geometry inside `area`. */
export const annotationGeometry = (
  annotation: ChartAnnotation,
  area: PlotArea,
  theme: 'dark' | 'light'
): AnnotationGeometry => {
  const color = annotationColor(annotation, theme);
  const strokeWidth = annotation.strokeWidth ?? 2;
  if (annotation.type === 'text') {
    const fontSize = annotation.fontSize ?? 12;
    const text = annotation.text ?? '';
    const x = area.left + annotation.x * area.width;
    const y = area.top + annotation.y * area.height;
    const width = Math.max(fontSize * 0.6, text.length * fontSize * 0.58);
    return {
      kind: 'text',
      x,
      y,
      text,
      color,
      fontSize,
      bbox: { x, y, width, height: fontSize * 1.35 },
    };
  }

  const x1 = area.left + annotation.x * area.width;
  const y1 = area.top + annotation.y * area.height;
  const x2 = area.left + (annotation.x2 ?? annotation.x + 0.2) * area.width;
  const y2 = area.top + (annotation.y2 ?? annotation.y + 0.15) * area.height;

  if (annotation.type === 'line' || annotation.type === 'arrow') {
    return {
      kind: annotation.type,
      x1,
      y1,
      x2,
      y2,
      color,
      strokeWidth,
      ...(annotation.type === 'arrow'
        ? { points: arrowPoints(x1, y1, x2, y2, 7 + strokeWidth) }
        : {}),
      bbox: {
        x: Math.min(x1, x2) - 4,
        y: Math.min(y1, y2) - 4,
        width: Math.abs(x2 - x1) + 8,
        height: Math.abs(y2 - y1) + 8,
      },
    };
  }

  const fill = annotationFill(annotation, theme);
  return {
    kind: 'rect',
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
    color,
    fill: fill.fill,
    fillOpacity: fill.opacity,
    strokeWidth,
    bbox: {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    },
  };
};

export const annotationBBox = (
  annotation: ChartAnnotation,
  area: PlotArea,
  theme: 'dark' | 'light'
): AnnotationBBox => annotationGeometry(annotation, area, theme).bbox;

const escapeXml = (value: string): string =>
  value
    // XML 1.0 forbids most C0 controls, the replacement/noncharacters and
    // unpaired surrogates. Persisted data is already sanitised; live edits are
    // not, so strip them here before the fragment reaches DOMParser.
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffe\uffff]/g, '')
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, '')
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const attr = (value: string | number): string => escapeXml(String(value));

const markAttributes = (annotation: ChartAnnotation): string =>
  `data-annotation-id="${attr(annotation.id)}" data-annotation-type="${annotation.type}"`;

const geometryMarkup = (mark: AnnotationGeometry, annotation: ChartAnnotation): string => {
  if (mark.kind === 'text') {
    return `<text ${markAttributes(annotation)} x="${attr(mark.x.toFixed(2))}" y="${attr(
      mark.y.toFixed(2)
    )}" fill="${attr(mark.color)}" font-family="${attr(ANNOTATION_FONT)}" font-size="${attr(
      mark.fontSize
    )}" font-weight="500" dominant-baseline="hanging">${escapeXml(
      mark.text.slice(0, MAX_ANNOTATION_TEXT)
    )}</text>`;
  }
  if (mark.kind === 'line' || mark.kind === 'arrow') {
    const line = `<line ${markAttributes(annotation)} x1="${attr(mark.x1.toFixed(2))}" y1="${attr(
      mark.y1.toFixed(2)
    )}" x2="${attr(mark.x2.toFixed(2))}" y2="${attr(mark.y2.toFixed(2))}" stroke="${attr(
      mark.color
    )}" stroke-width="${attr(mark.strokeWidth)}" stroke-linecap="round" />`;
    if (mark.kind === 'line') return line;
    return `${line}<polygon ${markAttributes(annotation)} points="${attr(
      mark.points ?? ''
    )}" fill="${attr(mark.color)}" />`;
  }
  const rect = mark as RectGeometry;
  return `<rect ${markAttributes(annotation)} x="${attr(rect.x.toFixed(2))}" y="${attr(
    rect.y.toFixed(2)
  )}" width="${attr(rect.width.toFixed(2))}" height="${attr(
    rect.height.toFixed(2)
  )}" rx="2" fill="${attr(rect.fill)}" fill-opacity="${attr(
    rect.fillOpacity
  )}" stroke="${attr(rect.color)}" stroke-width="${attr(rect.strokeWidth)}" />`;
};

/**
 * Pure SVG fragment for the static annotation layer. Kept as a string so it can
 * be unit-tested without a DOM and appended to the Vega SVG after rendering.
 */
export const annotationsMarkup = (
  annotations: ChartAnnotation[],
  area: PlotArea,
  theme: 'dark' | 'light'
): string => {
  const marks = annotations
    .filter(annotation => !annotation.hidden)
    .map(annotation => geometryMarkup(annotationGeometry(annotation, area, theme), annotation))
    .join('');
  return `<g data-chart-annotations="true" pointer-events="none">${marks}</g>`;
};

/** The first background inside the root plot frame is the drawable plot area. */
const plotFrame = (svg: SVGSVGElement): SVGGraphicsElement | null => {
  const root =
    svg.querySelector<SVGGElement>('.mark-group.role-frame.root') ??
    svg.querySelector<SVGGElement>('.mark-group.role-frame');
  const background = root?.querySelector<SVGGraphicsElement>('.background');
  return background ?? null;
};

/** Locate the Vega plot frame inside the generated SVG. */
export const findPlotArea = (svg: SVGSVGElement): PlotArea | null => {
  const frame = plotFrame(svg);
  if (!frame) return null;
  const box = frame.getBBox();
  if (!(box.width > 0) || !(box.height > 0)) return null;
  const matrix = frame.getCTM();
  if (matrix) {
    return {
      left: matrix.e + box.x * matrix.a,
      top: matrix.f + box.y * matrix.d,
      width: box.width * matrix.a,
      height: box.height * matrix.d,
    };
  }
  return { left: box.x, top: box.y, width: box.width, height: box.height };
};

/** Measure both SVG-user and CSS-pixel plot areas after Vega has rendered. */
export const measurePlotArea = (
  svg: SVGSVGElement,
  origin: HTMLElement
): ChartPlotArea | null => {
  const frame = plotFrame(svg);
  if (!frame) return null;
  const area = findPlotArea(svg);
  if (!area) return null;
  const frameRect = frame.getBoundingClientRect();
  const originRect = origin.getBoundingClientRect();
  if (frameRect.width <= 0 || frameRect.height <= 0) return null;
  return {
    svg: area,
    css: {
      left: frameRect.left - originRect.left,
      top: frameRect.top - originRect.top,
      width: frameRect.width,
      height: frameRect.height,
    },
  };
};

/** Append or replace the static annotation layer inside a rendered Vega SVG. */
export const applyAnnotationsToSvg = (
  svg: SVGSVGElement,
  annotations: ChartAnnotation[],
  theme: 'dark' | 'light'
): void => {
  svg.querySelector('[data-chart-annotations]')?.remove();
  if (annotations.length === 0) return;
  const area = findPlotArea(svg);
  if (!area) return;
  const markup = annotationsMarkup(annotations, area, theme);
  const parsed = new DOMParser().parseFromString(
    `<svg xmlns="${SVG_NS}">${markup}</svg>`,
    'image/svg+xml'
  );
  const group = parsed.documentElement.firstElementChild;
  if (group) svg.appendChild(document.importNode(group, true));
};
