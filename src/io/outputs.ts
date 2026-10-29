/**
 * Serialisable snapshots of the output console.
 *
 * Every run produces tables, a written report and chart models. The snapshot
 * stores tables and prose as static HTML; the chart models are saved
 * separately and rendered live by Vega-Lite after a reload. Restored HTML is
 * passed through `sanitizeOutputHtml` before injection.
 *
 * Snapshots are deliberately capped: the console is a reading aid, not the
 * project data, and localStorage has a ~5 MB budget shared with the grid.
 */

import { t } from '../i18n';
import type { AnalysisChart } from '../stats/charts';
import { parseChartModels } from '../charts/schema';

export const MAX_STORED_OUTPUTS = 20;
/** Total HTML kept in the project file / autosave (roughly 20 charts-heavy runs). */
export const MAX_STORED_OUTPUT_CHARS = 1_500_000;
/** A single block above this size is not stored (defensive on file load). */
export const MAX_SINGLE_OUTPUT_CHARS = 600_000;
/** Parameter snapshots are small; anything larger is not trusted. */
export const MAX_PARAMS_CHARS = 20_000;

export interface StoredOutput {
  id: string;
  title: string;
  createdAt: string;
  /** Analysis that produced the block, when the run knows it. */
  analysisId?: string;
  /** Snapshot of the analysis parameters used by the run (re-run/apply). */
  params?: unknown;
  /** Signature of those parameters, used for the params-stale badge. */
  paramsSignature?: string;
  /** Confidence level used by the run (global setting at that moment). */
  ciLevel?: number;
  /** In-session grid revision that produced the card (persisted for reload). */
  dataRevision?: number;
  /** Dataset identity that produced the card (persisted for reload). */
  datasetId?: string;
  html: string;
  /** Editable chart models; absent on legacy static cards. */
  charts?: AnalysisChart[];
  /** Charts beyond the interface cap (not stored, shown as a note). */
  chartOverflow?: number;
  /** Charts dropped by the character budget (not stored). */
  chartOmitted?: number;
}

/** Fields that decide whether a card still matches the current session. */
export interface OutputFreshness {
  dataRevision?: number;
  datasetId?: string;
  filterSignature?: string;
  paramsSignature?: string;
  ciLevel?: number;
}

/**
 * A card is stale when any setting that produced it changed. Optional fields
 * are skipped on both sides so old projects (without the metadata) stay valid.
 */
export const isOutputStale = (
  output: OutputFreshness,
  current: OutputFreshness
): boolean =>
  (output.dataRevision !== undefined &&
    current.dataRevision !== undefined &&
    output.dataRevision !== current.dataRevision) ||
  (output.datasetId !== undefined &&
    current.datasetId !== undefined &&
    output.datasetId !== current.datasetId) ||
  (output.filterSignature !== undefined &&
    current.filterSignature !== undefined &&
    output.filterSignature !== current.filterSignature) ||
  (output.paramsSignature !== undefined &&
    current.paramsSignature !== undefined &&
    output.paramsSignature !== current.paramsSignature) ||
  (output.ciLevel !== undefined &&
    current.ciLevel !== undefined &&
    output.ciLevel !== current.ciLevel);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const text = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const decodeEntities = (value: string): string =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

/**
 * The first `.output-title` in a rendered block names the analysis. Extracted
 * from the snapshot itself so `pushOutput` stays a single call for every
 * analysis (and future ones) instead of a new title argument at each call site.
 */
export const extractOutputTitle = (html: string): string => {
  const match = html.match(
    /<[^>]*class="[^"]*\boutput-title\b[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i
  );
  const raw = match ? match[1].replace(/<[^>]*>/g, ' ') : '';
  const title = decodeEntities(raw).replace(/\s+/g, ' ').trim();
  return title || t('output.untitled');
};

/** Keep the newest blocks that fit the count and character budget. */
export const storedOutputChars = (entry: StoredOutput): number =>
  entry.html.length + (entry.charts ? JSON.stringify(entry.charts).length : 0);

/** Keep the newest blocks that fit the count and character budget. */
export const capStoredOutputs = <T extends StoredOutput>(outputs: T[]): T[] => {
  const capped = outputs.slice(-MAX_STORED_OUTPUTS);
  const kept: T[] = [];
  let total = 0;
  for (let index = capped.length - 1; index >= 0; index -= 1) {
    const entry = capped[index];
    const size = storedOutputChars(entry);
    if (kept.length > 0 && total + size > MAX_STORED_OUTPUT_CHARS) break;
    kept.unshift(entry);
    total += size;
  }
  return kept;
};

/** Validate an untrusted `outputs` array coming from a project file. */
export const parseStoredOutputs = (value: unknown): StoredOutput[] => {
  if (!Array.isArray(value)) return [];
  const entries: StoredOutput[] = [];
  value.forEach((raw) => {
    if (!isRecord(raw)) return;
    const html = text(raw.html, '');
    if (!html || html.length > MAX_SINGLE_OUTPUT_CHARS) return;
    let charts = Array.isArray(raw.charts) ? parseChartModels(raw.charts) : [];
    if (charts.length > 0) {
      const kept: typeof charts = [];
      let used = html.length;
      for (const chart of charts) {
        const size = JSON.stringify(chart).length;
        if (used + size > MAX_SINGLE_OUTPUT_CHARS) break;
        kept.push(chart);
        used += size;
      }
      charts = kept;
    }
    entries.push({
      id: text(raw.id, `run-${entries.length + 1}`),
      title: text(raw.title, t('output.untitled')),
      createdAt: text(raw.createdAt, ''),
      ...(typeof raw.analysisId === 'string' && raw.analysisId.length > 0
        ? { analysisId: raw.analysisId.slice(0, 64) }
        : {}),
      ...(isRecord(raw.params) || Array.isArray(raw.params)
        ? JSON.stringify(raw.params).length <= MAX_PARAMS_CHARS
          ? { params: raw.params }
          : {}
        : {}),
      ...(typeof raw.paramsSignature === 'string' && raw.paramsSignature.length <= 2048
        ? { paramsSignature: raw.paramsSignature }
        : {}),
      ...(typeof raw.ciLevel === 'number' && Number.isFinite(raw.ciLevel) && raw.ciLevel > 0 && raw.ciLevel < 100
        ? { ciLevel: raw.ciLevel }
        : {}),
      ...(typeof raw.dataRevision === 'number' && Number.isInteger(raw.dataRevision) && raw.dataRevision >= 0
        ? { dataRevision: raw.dataRevision }
        : {}),
      ...(typeof raw.datasetId === 'string' && raw.datasetId.length > 0
        ? { datasetId: raw.datasetId.slice(0, 80) }
        : {}),
      ...(typeof raw.chartOverflow === 'number' && Number.isInteger(raw.chartOverflow) && raw.chartOverflow > 0
        ? { chartOverflow: raw.chartOverflow }
        : {}),
      ...(typeof raw.chartOmitted === 'number' && Number.isInteger(raw.chartOmitted) && raw.chartOmitted > 0
        ? { chartOmitted: raw.chartOmitted }
        : {}),
      ...(charts.length > 0 ? { charts } : {}),
      html,
    });
  });
  return capStoredOutputs(entries);
};

const FORBIDDEN_TAGS = new Set([
  'script',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'applet',
  'link',
  'meta',
  'base',
  'form',
  'input',
  'textarea',
  'select',
  'option',
  'button',
  'style',
]);

const UNSAFE_URL = /^\s*(javascript|vbscript|data:text\/html)/i;
const UNSAFE_STYLE = /url\s*\(|expression\s*\(|@import/i;

/**
 * Allow-list of attributes that cannot execute code once the forbidden tags
 * above are gone. Inline styles are kept (Vega SVG uses them) but CSS-based
 * payloads (`url(...)`, `expression(...)`, `@import`) are dropped.
 */
const isSafeAttribute = (attribute: Attr): boolean => {
  const name = attribute.name.toLowerCase();
  if (name.startsWith('on')) return false;
  if (name === 'srcdoc' || name === 'formaction' || name === 'action') return false;
  if (name === 'src' || name === 'href' || name === 'xlink:href') {
    const value = attribute.value.trim();
    return value.startsWith('#') || /^data:image\//i.test(value);
  }
  if (name === 'style') return !UNSAFE_STYLE.test(attribute.value);
  return true;
};

const sanitizeElement = (element: Element): void => {
  Array.from(element.children).forEach((child) => {
    if (FORBIDDEN_TAGS.has(child.tagName.toLowerCase())) {
      child.remove();
      return;
    }
    Array.from(child.attributes).forEach((attribute) => {
      if (attribute.name.toLowerCase() === 'href' && UNSAFE_URL.test(attribute.value)) {
        child.removeAttribute(attribute.name);
        return;
      }
      if (!isSafeAttribute(attribute)) child.removeAttribute(attribute.name);
    });
    sanitizeElement(child);
  });
};

/**
 * Strip executable content from a stored snapshot. Runs only in the browser
 * (DOMParser); returning an empty string elsewhere is safe because snapshots
 * are only rendered in the browser. The HTML is generated by our own renderer,
 * so this is defence in depth against a hand-edited or hostile .lzs file.
 */
export const sanitizeOutputHtml = (html: string): string => {
  if (!html || html.length > MAX_SINGLE_OUTPUT_CHARS) return '';
  if (typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (doc.body) sanitizeElement(doc.body);
  return doc.body ? doc.body.innerHTML : '';
};
