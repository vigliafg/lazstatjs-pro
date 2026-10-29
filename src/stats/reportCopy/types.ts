import type { Locale } from '../../i18n/locales';

/**
 * Languages with a report prose catalog.
 *
 * Kept in its own module so the catalog can import the type without a cycle
 * back into the lookup functions in `index.ts`.
 */
export type ReportLocale = Extract<Locale, 'it' | 'en' | 'fr' | 'es' | 'de' | 'pt-PT'>;

/** Languages whose report prose is complete (mirrors `REPORT_LOCALES`). */
export const TRANSLATED_REPORT_LOCALES: readonly ReportLocale[] = ['it', 'en', 'fr', 'es', 'de', 'pt-PT'];

export const isReportLocale = (value: unknown): value is ReportLocale =>
  (TRANSLATED_REPORT_LOCALES as readonly unknown[]).includes(value);
