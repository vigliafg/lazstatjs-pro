import { Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import { t } from '../../i18n';
import { MAX_CUSTOM_THEMES, type CustomTheme } from '../../theme';
import { ThemeSwatch } from './ThemeSwatch';

interface ThemeLibraryProps {
  themes: CustomTheme[];
  activeTheme: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onEdit: (theme: CustomTheme) => void;
  onDuplicate: (theme: CustomTheme) => void;
  onDelete: (theme: CustomTheme) => void;
}

/** Settings section listing the project's custom themes. */
export const ThemeLibrary = ({
  themes,
  activeTheme,
  onSelect,
  onCreate,
  onEdit,
  onDuplicate,
  onDelete,
}: ThemeLibraryProps) => {
  const full = themes.length >= MAX_CUSTOM_THEMES;
  return (
  <div className="mt-5 border-t border-border2 pt-4" data-custom-theme-library>
    <div className="mb-2 flex flex-wrap items-baseline gap-2">
      <h3 className="font-mono text-[9px] uppercase tracking-widest text-text3">
        {t('settings.themeCustom')}
      </h3>
      <span className="font-mono text-[9px] text-text3">
        {t('settings.themeCustomCount', { count: themes.length })}
      </span>
      <button
        type="button"
        className="tb-btn ml-auto flex items-center gap-1 px-2 py-0.5 text-[10px]"
        onClick={onCreate}
        disabled={full}
        title={full ? t('settings.themeCustomLimit') : undefined}
        data-theme-create
      >
        <Plus className="h-3 w-3" />
        {t('settings.themeCreate')}
      </button>
    </div>
    <p className="mb-2 text-[10px] leading-relaxed text-text3">{t('settings.themeCustomHint')}</p>
    {themes.length === 0 ? (
      <p className="text-[10px] text-text3" data-custom-theme-empty>
        {t('settings.themeCustomEmpty')}
      </p>
    ) : (
      <div
        role="group"
        aria-label={t('settings.themeCustom')}
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {themes.map(theme => {
          const selected = theme.id === activeTheme;
          return (
            <div
              key={theme.id}
              data-custom-theme={theme.id}
              className={`flex items-center gap-1 rounded border p-1.5 transition-all ${
                selected
                  ? 'border-accent bg-accent/10 shadow-[inset_0_0_0_1px_var(--color-accent)]'
                  : 'border-border bg-surface3/40 hover:border-border2 hover:bg-surface3'
              }`}
            >
              <button
                type="button"
                aria-pressed={selected}
                aria-label={`${theme.name} · ${t('settings.themeCustom')}`}
                onClick={() => onSelect(theme.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                data-custom-theme-select={theme.id}
              >
                <ThemeSwatch theme={theme} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-medium text-text">{theme.name}</span>
                  <span className="block font-mono text-[8px] uppercase tracking-widest text-text3">
                    {theme.mode === 'dark' ? t('settings.themeModeDark') : t('settings.themeModeLight')}
                  </span>
                </span>
              </button>
              <span className="flex shrink-0 items-center">
                <button
                  type="button"
                  className="rounded p-1 text-text3 hover:bg-surface3 hover:text-text"
                  title={t('settings.themeEdit')}
                  aria-label={`${theme.name} · ${t('settings.themeEdit')}`}
                  onClick={() => onEdit(theme)}
                  data-theme-edit={theme.id}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  className="rounded p-1 text-text3 hover:bg-surface3 hover:text-text disabled:opacity-30"
                  title={full ? t('settings.themeCustomLimit') : t('settings.themeDuplicate')}
                  aria-label={`${theme.name} · ${t('settings.themeDuplicate')}`}
                  onClick={() => onDuplicate(theme)}
                  disabled={full}
                  data-theme-duplicate={theme.id}
                >
                  <Copy className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  className="rounded p-1 text-text3 hover:bg-red hover:text-on-accent"
                  title={t('settings.themeDelete')}
                  aria-label={`${theme.name} · ${t('settings.themeDelete')}`}
                  onClick={() => onDelete(theme)}
                  data-theme-delete={theme.id}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            </div>
          );
        })}
      </div>
    )}
  </div>
  );
};
