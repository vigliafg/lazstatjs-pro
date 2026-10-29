import { useEffect } from 'react';
import { BookOpen, ExternalLink, X } from 'lucide-react';
import { t, type Locale } from '../i18n';
import { bookUrl } from './book';
import { closeHelp, useHelpRequest } from './helpStore';

/**
 * Popup of the handbook, opened from an analysis panel or an output card.
 * The book itself stays plain HTML/CSS/JS: the app only hosts it in an iframe.
 */
export const HelpDialog = ({ locale }: { locale: Locale }) => {
  const request = useHelpRequest();

  useEffect(() => {
    if (!request) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') closeHelp();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [request]);

  if (!request) return null;
  const src = bookUrl(locale, request.topicId, request.level);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('help.bookTitle')}
      onMouseDown={event => {
        if (event.target === event.currentTarget) closeHelp();
      }}
    >
      <div className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl">
        <header className="flex items-center gap-2 border-b border-border bg-surface2 px-3 py-2">
          <BookOpen className="h-4 w-4 shrink-0 text-accent2" />
          <span className="truncate font-mono text-[10px] uppercase tracking-widest text-text2">
            {t('help.bookTitle')}
          </span>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-text3 hover:bg-border hover:text-text"
            title={t('help.openNewTab')}
          >
            <ExternalLink className="h-3 w-3" />
            {t('help.openNewTab')}
          </a>
          <button
            type="button"
            onClick={closeHelp}
            className="flex h-6 w-6 items-center justify-center rounded text-text3 hover:bg-border hover:text-text"
            aria-label={t('help.close')}
            title={t('help.close')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>
        <iframe
          key={src}
          src={src}
          title={t('help.bookTitle')}
          className="min-h-0 flex-1 border-0 bg-surface"
        />
      </div>
    </div>
  );
};
