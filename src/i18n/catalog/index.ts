import type { Locale } from '../types';
import { enMessages, type Messages } from './en';
import { itMessages } from './it';
import { deMessages } from './de';
import { esMessages } from './es';
import { frMessages } from './fr';
import { ptPTMessages } from './pt-PT';

export { enMessages, type Messages };

/** Catalogs that are complete and selectable; anything else falls back to English. */
export const CATALOGS: Partial<Record<Locale, Messages>> = {
  en: enMessages,
  it: itMessages,
  de: deMessages,
  es: esMessages,
  fr: frMessages,
  'pt-PT': ptPTMessages,
};

export const catalogFor = (locale: Locale): Messages => CATALOGS[locale] ?? enMessages;
