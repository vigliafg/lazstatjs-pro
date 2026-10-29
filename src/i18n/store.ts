import { DEFAULT_LOCALE, isActiveLocale, type Locale } from './types';

const STORAGE_KEY = 'lazstats.locale.v1';

const read = (): Locale => {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (isActiveLocale(stored)) return stored;
  } catch {
    // Private mode or no DOM: keep the default.
  }
  return DEFAULT_LOCALE;
};

let current: Locale = read();
const listeners = new Set<() => void>();

export const getLocale = (): Locale => current;

export const subscribeLocale = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const syncDocument = (locale: Locale): void => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
};

export const setLocale = (locale: Locale): void => {
  if (!isActiveLocale(locale) || locale === current) return;
  current = locale;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, locale);
  } catch {
    // Preferences simply do not persist.
  }
  syncDocument(locale);
  listeners.forEach((listener) => listener());
};

syncDocument(current);
