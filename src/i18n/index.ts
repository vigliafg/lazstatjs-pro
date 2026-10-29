/**
 * Internationalisation entry point.
 *
 * `t()` keeps the historical shape (a plain function usable outside React), and
 * reads the current locale from the store. React components that must re-render
 * when the language changes subscribe through `useT()` / `useLocale()`.
 */
import { useMemo, useSyncExternalStore } from 'react';
import { catalogFor } from './catalog';
import { enMessages } from './catalog/en';
import { formatMessage } from './format';
import { getLocale, setLocale, subscribeLocale } from './store';
import type { Locale, MessageKey, MessageParams } from './types';

export * from './types';
export { CATALOGS, catalogFor } from './catalog';
export { formatDate, formatMessage, placeholdersOf } from './format';
export { getLocale, setLocale, subscribeLocale } from './store';

/** Translate a message for an explicit locale (reports, exports, tests). */
export const translate = (locale: Locale, key: MessageKey, params?: MessageParams): string =>
  formatMessage(catalogFor(locale)[key] ?? enMessages[key], params);

export const t = (key: MessageKey, params?: MessageParams): string =>
  translate(getLocale(), key, params);

export const MESSAGE_KEYS = Object.keys(enMessages) as MessageKey[];

export const useLocale = (): Locale =>
  useSyncExternalStore(subscribeLocale, getLocale, getLocale);

/** Locale-bound `t` for components that must react to a language change. */
export const useT = (): ((key: MessageKey, params?: MessageParams) => string) => {
  const locale = useLocale();
  return useMemo(
    () => (key: MessageKey, params?: MessageParams) => translate(locale, key, params),
    [locale]
  );
};
