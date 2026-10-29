import type { enMessages } from './catalog/en';

export * from './locales';

/** Every message key, derived from the English catalog. */
export type MessageKey = keyof typeof enMessages;

export type MessageParams = Record<string, string | number>;
