/**
 * Locale primitives, free of catalog and React imports.
 *
 * `io/` and `grid/` may depend on this module to validate persisted settings
 * without pulling the whole dictionary into their bundle.
 */
export const ACTIVE_LOCALES = ['en', 'it'] as const;

/** Locales the project targets; catalogs are added wave by wave. */
export const PLANNED_LOCALES = ['fr', 'es', 'de', 'pt-PT'] as const;

export type Locale = (typeof ACTIVE_LOCALES)[number] | (typeof PLANNED_LOCALES)[number];

/** Preserves the historical behaviour: English UI, Italian report prose. */
export const DEFAULT_LOCALE: Locale = 'en';
export const DEFAULT_REPORT_LOCALE: Locale = 'it';

/** Locales whose report prose is translated and selectable in Settings. */
export const REPORT_LOCALES: readonly Locale[] = ['it'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  'pt-PT': 'Português (PT)',
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' &&
  ([...ACTIVE_LOCALES, ...PLANNED_LOCALES] as readonly string[]).includes(value);

export const isActiveLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (ACTIVE_LOCALES as readonly string[]).includes(value);

/** Locale used for a selectable option: stored value when active, English otherwise. */
export const activeLocaleOf = (locale: Locale | undefined): Locale =>
  isActiveLocale(locale) ? locale : DEFAULT_LOCALE;

/** Language of the help book: the UI language unless the user picked one. */
export type HelpLocale = 'auto' | Locale;

export const isHelpLocale = (value: unknown): value is HelpLocale =>
  value === 'auto' || isLocale(value);

export const resolveHelpLocale = (help: HelpLocale, ui: Locale): Locale =>
  help === 'auto' ? ui : isActiveLocale(help) ? help : ui;
