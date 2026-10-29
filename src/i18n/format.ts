import type { MessageParams } from './types';

/**
 * Replaces `{name}` placeholders with the matching parameter.
 *
 * Unknown placeholders are left untouched so a broken translation degrades to
 * visible text instead of `undefined`.
 */
export const formatMessage = (template: string, params?: MessageParams): string => {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
};

/** Placeholders used by a message, in order of first appearance. */
export const placeholdersOf = (template: string): string[] => {
  const found = new Set<string>();
  for (const match of template.matchAll(/\{(\w+)\}/g)) found.add(match[1]);
  return [...found];
};

/** Locale-aware date for the UI (never used for statistical output). */
export const formatDate = (locale: string, value: Date | number): string =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(value);
