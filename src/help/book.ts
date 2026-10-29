import { resolveHelpLocale, type HelpLocale, type Locale } from '../i18n';

export type HelpLevel = 'tutorial' | 'advanced';

const base = (): string => {
  const env = (import.meta as { env?: { BASE_URL?: string } }).env;
  const value = env?.BASE_URL ?? '/';
  return value.endsWith('/') ? value : `${value}/`;
};

/** URL of a page of the generated book, always inside `public/help`. */
export const bookUrl = (
  locale: Locale,
  topicId?: string | null,
  level?: HelpLevel
): string => {
  const page = topicId ? `${encodeURIComponent(topicId)}.html` : 'index.html';
  const hash = level ? `#${level}` : '';
  return `${base()}help/${resolveHelpLocale('auto', locale)}/${page}${hash}`;
};

export const bookLocaleFor = (help: HelpLocale, ui: Locale): Locale =>
  resolveHelpLocale(help, ui);

/** Topic the popup should show for an analysis id: the registry id itself. */
export const topicForAnalysis = (analysisId: string): string =>
  analysisId === 'guided' ? 'wizard' : analysisId;
