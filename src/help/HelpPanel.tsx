import { ExternalLink, Printer } from 'lucide-react';
import { t, type Locale } from '../i18n';
import { bookUrl } from './book';

/**
 * HELP tab: hosts the generated handbook (plain HTML/CSS/JS) in an iframe, so
 * the book keeps its own navigation, search and printable edition.
 */
export const HelpPanel = ({ locale }: { locale: Locale }) => {
  const src = bookUrl(locale);
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-surface px-3 py-1.5">
        <span className="text-[10px] leading-relaxed text-text3">{t('help.intro')}</span>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-text3 hover:bg-border hover:text-text"
        >
          <ExternalLink className="h-3 w-3" />
          {t('help.openNewTab')}
        </a>
        <a
          href={bookUrl(locale).replace('index.html', 'print.html')}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-text3 hover:bg-border hover:text-text"
        >
          <Printer className="h-3 w-3" />
          {t('help.printBook')}
        </a>
      </div>
      <iframe
        key={src}
        src={src}
        title={t('help.bookTitle')}
        className="min-h-0 flex-1 border-0 bg-surface"
      />
    </div>
  );
};
