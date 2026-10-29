import { catalogFor, enReportCopy } from './catalog';
import { chartCopy as enChartCopy } from './catalog/en/charts';
import type { ReportLocale } from './types';

export { TRANSLATED_REPORT_LOCALES, isReportLocale, type ReportLocale } from './types';

/**
 * Copy of the written output: report prose and table labels.
 *
 * The Italian sentence is the message id (gettext style): the builders keep
 * writing Italian, and `c()` swaps in the translation of the active report
 * language. A missing translation falls back to Italian on purpose, so a
 * partial wave never shows `undefined`; `reportCopy.test.ts` keeps the catalog
 * complete so the fallback cannot become the normal path.
 *
 * The module holds no React and no app state: the runner sets the language for
 * the duration of one run with `withReportLocale`.
 */
export type CopyParams = Record<string, string | number>;

const interpolate = (template: string, params?: CopyParams): string =>
  params
    ? template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match
      )
    : template;

let active: ReportLocale = 'it';

export const setReportLocale = (locale: ReportLocale): void => {
  active = locale;
};

export const getReportLocale = (): ReportLocale => active;

/** Runs `build` with `locale` active, restoring the previous one afterwards. */
export const withReportLocale = <T>(locale: ReportLocale, build: () => T): T => {
  const previous = active;
  active = locale;
  try {
    return build();
  } finally {
    active = previous;
  }
};

/** Translated sentence (or the Italian source when the catalog lacks it). */
export const copy = (message: string, params?: CopyParams): string => {
  if (active === 'it') return interpolate(message, params);
  const translated = catalogFor(active)[message] ?? enChartCopy[message] ?? enReportCopy[message];
  return interpolate(translated ?? message, params);
};

/**
 * Italian source of an already translated label.
 *
 * Reports read the table rows that are shown to the user, but the row keys
 * (`measure: 'r punto-biseriale'`) are matched against Italian needles. Mapping
 * a translated label back to its source keeps those lookups working in every
 * language without adding a second id column to the tables.
 */
const reverseCache = new Map<ReportLocale, Map<string, string>>();

const reverseCatalog = (locale: ReportLocale): Map<string, string> => {
  const cached = reverseCache.get(locale);
  if (cached) return cached;
  const reverse = new Map<string, string>();
  for (const [source, translated] of Object.entries(catalogFor(locale))) {
    reverse.set(translated, source);
  }
  reverseCache.set(locale, reverse);
  return reverse;
};

export const sourceOf = (label: string): string =>
  active === 'it' ? label : reverseCatalog(active).get(label) ?? label;
