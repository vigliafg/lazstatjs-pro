import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { analysisLabel } from '../../analyses/registry';
import { t } from '../../i18n';
import type { AssistantLeaf, AssistantQuestion } from './tree';

interface Props {
  node: AssistantQuestion | AssistantLeaf;
  canNotSure: boolean;
  canBack: boolean;
  onNotSure: () => void;
  onBack: () => void;
  onClose: () => void;
}

/**
 * Contextual help of the full-page Assistant: definition, example and the help
 * of every option for a question; the procedure help and its checks for a leaf.
 * Escape closes it; the workspace returns focus to the trigger.
 */
export const AssistantHelp = ({
  node,
  canNotSure,
  canBack,
  onNotSure,
  onBack,
  onClose,
}: Props) => {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-4 sm:items-center"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('assistant.help')}
        data-assistant-help
        className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-lg border border-border bg-surface shadow-2xl scrollbar"
      >
        <header className="sticky top-0 flex items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
          <span className="text-[12px] font-semibold text-text">{t('assistant.help')}</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t('help.close')}
            title={t('help.close')}
            className="ml-auto flex h-6 w-6 items-center justify-center rounded text-text3 hover:bg-surface2 hover:text-text"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        <div className="flex flex-col gap-3 px-4 py-3">
          {node.kind === 'question' ? (
            <>
              <p className="text-[12px] font-medium text-text">{t(node.prompt)}</p>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
                  {t('assistant.definition')}
                </span>
                <p className="mt-0.5 text-[11px] leading-relaxed text-text2">
                  {t(node.help.definition)}
                </p>
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
                  {t('assistant.example')}
                </span>
                <p className="mt-0.5 text-[11px] leading-relaxed text-text2">
                  {t(node.help.example)}
                </p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {node.options.map(option => (
                  <li key={option.id} className="rounded border border-border2 bg-surface2/40 px-2 py-1.5">
                    <p className="text-[11px] font-medium text-text">{t(option.label)}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-text2">{t(option.help)}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className="text-[12px] font-medium text-text">{analysisLabel(node.analysisId)}</p>
              {node.variant && <p className="text-[10px] text-accent2">{t(node.variant)}</p>}
              <p className="text-[11px] leading-relaxed text-text2">{t(node.help)}</p>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
                  {t('assistant.checks')}
                </span>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {node.checks.map(key => (
                    <li key={key} className="text-[10px] leading-relaxed text-text2">
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {(canNotSure || canBack) && (
          <footer className="flex flex-wrap gap-2 border-t border-border px-4 py-2.5">
            {canNotSure && (
              <button
                type="button"
                onClick={onNotSure}
                title={t('assistant.notSureHelp')}
                className="rounded border border-dashed border-border2 px-2 py-1 text-[10px] text-text3 hover:border-accent2 hover:text-accent2"
              >
                {t('assistant.notSure')}
              </button>
            )}
            {canBack && (
              <button
                type="button"
                onClick={onBack}
                className="rounded border border-border2 bg-surface2 px-2 py-1 text-[10px] text-text2 hover:border-accent2 hover:text-text"
              >
                {t('assistant.back')}
              </button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
};
