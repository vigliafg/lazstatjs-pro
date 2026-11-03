import type { ReportLocale } from '../types';
import { chartCopy as baseChartCopy } from './en/charts';
import { f0ChartCopy } from './en/charts-f0';
import { w10ChartCopy } from './en/charts-w10';
import { l4ChartCopy as enL4ChartCopy } from './en/charts-l4';
import { w9ChartCopy } from './en/charts-w9';
import { l4ChartCopy as deL4ChartCopy } from './de/charts-l4';
import { l4ChartCopy as esL4ChartCopy } from './es/charts-l4';
import { l4ChartCopy as frL4ChartCopy } from './fr/charts-l4';
import { l4ChartCopy as ptPTL4ChartCopy } from './pt-PT/charts-l4';
import { extraChartCopy as deExtraChartCopy } from './de/charts-extra';
import { extraChartCopy as esExtraChartCopy } from './es/charts-extra';
import { extraChartCopy as frExtraChartCopy } from './fr/charts-extra';
import { extraChartCopy as ptPTExtraChartCopy } from './pt-PT/charts-extra';

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

const EXTRA_BY_LOCALE: Partial<Record<ReportLocale, Record<string, string>>> = {
  fr: frExtraChartCopy,
  es: esExtraChartCopy,
  de: deExtraChartCopy,
  'pt-PT': ptPTExtraChartCopy,
};

export const enChartCopy: Record<string, string> = {
  ...baseChartCopy,
  ...enL4ChartCopy,
  ...w9ChartCopy,
  ...f0ChartCopy,
  ...w10ChartCopy,
};

export const chartCatalogFor = (locale: ReportLocale): Record<string, string> =>
  locale === 'en' || locale === 'it'
    ? enChartCopy
    : {
        ...enChartCopy,
        ...(EXTRA_BY_LOCALE[locale] ?? {}),
        ...(L4_BY_LOCALE[locale] ?? {}),
      };

export { enChartCopy as baseEnChartCopy };
