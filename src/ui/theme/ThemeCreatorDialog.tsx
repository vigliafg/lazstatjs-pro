import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Eye, Pencil, X } from 'lucide-react';
import { t } from '../../i18n';
import { ToolbarButton } from '../../components/ToolbarButton';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  deriveChartTokens,
  themeContrastReport,
  themeNameExists,
  type CustomTheme,
  type ThemeDefinition,
} from '../../theme';
import { ThemeContrastPanel } from './ThemeContrastPanel';
import { ThemePreview } from './ThemePreview';
import { ThemeTokenEditor } from './ThemeTokenEditor';

interface ThemeCreatorDialogProps {
  initial: CustomTheme;
  baseTheme: ThemeDefinition;
  baseThemes: ThemeDefinition[];
  mode: 'create' | 'edit';
  initialDerive?: boolean;
  onSave: (theme: CustomTheme) => void;
  onCancel: () => void;
}

/**
 * Full-screen theme editor: token rows on the left, scoped live preview on the
 * right. The preview owns its CSS variables, so the editor itself keeps the
 * current theme and stays readable even while the draft has poor contrast.
 */
export const ThemeCreatorDialog = ({
  initial,
  baseTheme,
  baseThemes,
  mode,
  initialDerive,
  onSave,
  onCancel,
}: ThemeCreatorDialogProps) => {
  const [theme, setTheme] = useState<CustomTheme>(initial);
  const [baseId, setBaseId] = useState(baseTheme.id);
  const [deriveChart, setDeriveChart] = useState(initialDerive ?? mode === 'create');
  const [error, setError] = useState<'name' | 'duplicate' | null>(null);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const wide = useMediaQuery('(min-width: 1024px)');
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const base = baseThemes.find(item => item.id === baseId) ?? baseTheme;
  const dirty = JSON.stringify(theme) !== JSON.stringify(initial);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      previousFocus.current?.focus?.();
    };
  }, []);

  const requestClose = () => {
    if (dirty && !window.confirm(t('settings.themeDiscard'))) return;
    onCancel();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = (Array.from(
        panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[]).filter(node => !node.hasAttribute('disabled') && node.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  const save = () => {
    const name = theme.name.trim();
    if (!name) {
      setError('name');
      return;
    }
    // Names must be unique across built-ins too: the header select would
    // otherwise show two indistinguishable options.
    if (themeNameExists(baseThemes, name, theme.id)) {
      setError('duplicate');
      return;
    }
    const next: CustomTheme = {
      ...theme,
      name,
      ...(deriveChart ? { chart: deriveChartTokens(theme.tokens) } : {}),
    };
    if (!themeContrastReport(next).ok && !window.confirm(t('settings.themeLowContrastConfirm'))) {
      return;
    }
    onSave(next);
  };

  const changeBase = (id: string) => {
    const nextBase = baseThemes.find(item => item.id === id) ?? baseTheme;
    setBaseId(id);
    setTheme(previous => ({
      ...previous,
      mode: nextBase.mode,
      tokens: { ...nextBase.tokens },
      chart: deriveChart
        ? deriveChartTokens(nextBase.tokens)
        : { ...nextBase.chart, palette: [...nextBase.chart.palette] },
    }));
  };

  const changeDerive = (next: boolean) => {
    setDeriveChart(next);
    if (next) setTheme(previous => ({ ...previous, chart: deriveChartTokens(previous.tokens) }));
  };

  return createPortal(
    <div className="fixed left-0 top-0 z-50 flex h-[100dvh] w-[100dvw] items-stretch justify-center bg-black/70 p-0 sm:inset-0 sm:h-auto sm:w-auto sm:p-4">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-creator-title"
        tabIndex={-1}
        className="flex h-full min-h-0 w-full min-w-0 max-w-[100dvw] flex-col overflow-hidden border border-border2 bg-bg outline-none sm:h-auto sm:max-h-[95vh] sm:max-w-[1400px] sm:rounded-lg"
        data-theme-creator-dialog
      >
        <header className="flex flex-wrap items-center gap-2 border-b border-border bg-surface2 px-3 py-2">
          <div className="min-w-0">
            <h2 id="theme-creator-title" className="truncate text-[12px] font-semibold text-text">
              {t(mode === 'create' ? 'settings.themeCreateTitle' : 'settings.themeEditTitle')}
            </h2>
            <p className="truncate font-mono text-[9px] text-text3">
              {dirty ? t('settings.themeUnsaved') : t('settings.themeSaved')}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {!wide && (
              <ToolbarButton
                icon={mobileView === 'edit' ? Eye : Pencil}
                label={t(mobileView === 'edit' ? 'settings.themePreviewTab' : 'settings.themeEditTab')}
                size="md"
                labelVisibility="always"
                onClick={() => setMobileView(mobileView === 'edit' ? 'preview' : 'edit')}
                data-theme-mobile-toggle=""
              />
            )}
            <ToolbarButton
              icon={X}
              label={t('settings.themeCancel')}
              size="md"
              labelVisibility="always"
              onClick={requestClose}
            />
            <ToolbarButton
              icon={Check}
              label={t('settings.themeSave')}
              size="md"
              tone="primary"
              labelVisibility="always"
              onClick={save}
              data-theme-save=""
            />
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          {(wide || mobileView === 'edit') && (
            <div className="flex min-w-0 flex-col gap-2 overflow-auto p-3">
              <label htmlFor="theme-name" className="flex flex-col gap-0.5 text-[9px] text-text3">
                <span>{t('settings.themeName')}</span>
                <input
                  id="theme-name"
                  value={theme.name}
                  maxLength={48}
                  placeholder={t('settings.themeNamePlaceholder')}
                  aria-invalid={error !== null}
                  onChange={event => {
                    setTheme(previous => ({ ...previous, name: event.target.value }));
                    setError(null);
                  }}
                  className={`rounded border bg-surface3 px-2 py-1 text-[11px] text-text ${
                    error ? 'border-red' : 'border-border2'
                  }`}
                  data-theme-name
                />
              </label>
              {error && (
                <p className="text-[9px] text-red" role="alert" data-theme-name-error>
                  {error === 'duplicate'
                    ? t('settings.themeNameDuplicate')
                    : t('settings.themeNameRequired')}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <label htmlFor="theme-mode" className="flex flex-col gap-0.5 text-[9px] text-text3">
                  <span>{t('settings.themeMode')}</span>
                  <select
                    id="theme-mode"
                    value={theme.mode}
                    onChange={event =>
                      setTheme(previous => ({
                        ...previous,
                        mode: event.target.value as 'dark' | 'light',
                      }))
                    }
                    className="rounded border border-border2 bg-surface3 px-1.5 py-1 text-[10px] text-text2"
                    data-theme-mode
                  >
                    <option value="dark">{t('settings.themeModeDark')}</option>
                    <option value="light">{t('settings.themeModeLight')}</option>
                  </select>
                </label>
                <label htmlFor="theme-base" className="flex flex-col gap-0.5 text-[9px] text-text3">
                  <span>{t('settings.themeBase')}</span>
                  <select
                    id="theme-base"
                    value={baseId}
                    onChange={event => changeBase(event.target.value)}
                    className="rounded border border-border2 bg-surface3 px-1.5 py-1 text-[10px] text-text2"
                    data-theme-base
                  >
                    {baseThemes.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="text-[9px] leading-relaxed text-text3">{t('settings.themeBaseHint')}</p>

              <ThemeTokenEditor
                theme={theme}
                baseTheme={base}
                deriveChart={deriveChart}
                onDeriveChange={changeDerive}
                onChange={setTheme}
              />
              <ThemeContrastPanel theme={theme} />
            </div>
          )}

          {(wide || mobileView === 'preview') && (
            <div className="min-h-0 overflow-auto border-l border-border bg-surface p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent2">
                  {t('settings.themePreview')}
                </span>
                <ChevronDown className="h-3 w-3 text-text3" aria-hidden="true" />
              </div>
              <ThemePreview theme={theme} />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
