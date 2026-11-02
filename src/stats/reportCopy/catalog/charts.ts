import type { ReportLocale } from '../types';
import { chartCopy as enChartCopy } from './en/charts';
import { l4ChartCopy as deL4ChartCopy } from './de/charts-l4';
import { l4ChartCopy as esL4ChartCopy } from './es/charts-l4';
import { l4ChartCopy as frL4ChartCopy } from './fr/charts-l4';
import { l4ChartCopy as ptPTL4ChartCopy } from './pt-PT/charts-l4';

/**
 * Chart titles, notes and axis labels.
 *
 * The general chart catalog is still English-first; the L4 wave adds one
 * locale-specific map per language so the new procedures do not fall back to
 * English. Italian remains the source language and is returned as-is by
 * `copy()`.
 */
const L4_BY_LOCALE: Partial<Record<ReportLocale, Record<string, string>>> = {
  fr: frL4ChartCopy,
  es: esL4ChartCopy,
  de: deL4ChartCopy,
  'pt-PT': ptPTL4ChartCopy,
};

export const chartCatalogFor = (locale: ReportLocale): Record<string, string> =>
  locale === 'en' || locale === 'it'
    ? enChartCopy
    : { ...enChartCopy, ...(L4_BY_LOCALE[locale] ?? {}) };

export { enChartCopy };
