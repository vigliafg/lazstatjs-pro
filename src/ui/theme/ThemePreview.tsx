import type { CSSProperties, ReactNode } from 'react';
import { t } from '../../i18n';
import { cssVariablesOf, type CustomTheme } from '../../theme';
import { ThemeChartPreview } from './ThemeChartPreview';

const PreviewCard = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) => (
  <section
    className="min-w-0 rounded border border-border2 bg-surface/60 p-2"
    data-theme-preview-area={id}
    aria-label={title}
  >
    <h4 className="mb-1.5 font-mono text-[8px] uppercase tracking-widest text-text3">{title}</h4>
    {children}
  </section>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="flex min-w-0 flex-col gap-0.5 text-[9px] text-text3">
    <span>{label}</span>
    {children}
  </label>
);

const inputClass =
  'w-full rounded border border-border2 bg-surface3 px-1.5 py-1 text-[10px] text-text2 outline-none focus:border-accent';

/** Live sample of the interface areas the theme touches. */
export const ThemePreview = ({ theme }: { theme: CustomTheme }) => {
  const style = {
    ...cssVariablesOf(theme),
    colorScheme: theme.mode,
  } as CSSProperties;
  return (
    <div
      className="rounded-lg border border-border2 bg-bg p-2 text-text"
      style={style}
      data-theme-preview
      aria-label={t('settings.themePreview')}
    >
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
        <PreviewCard id="shell" title={t('settings.themePreviewShell')}>
          <div className="overflow-hidden rounded border border-border bg-surface2">
            <div className="flex flex-wrap items-center gap-1 border-b border-border px-1.5 py-1">
              <span className="rounded border border-accent/30 bg-accent/10 px-1 font-mono text-[8px] uppercase tracking-widest text-accent">
                LazStats
              </span>
              <span className="main-tab active px-2 py-0.5 text-[8px]">Data</span>
              <span className="main-tab px-2 py-0.5 text-[8px]">Analysis</span>
              <span className="main-tab px-2 py-0.5 text-[8px]">Settings</span>
              <span className="ml-auto rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono text-[8px] text-text2">
                {theme.mode === 'dark' ? 'Dark' : 'Light'}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1.5">
              <span className="rounded bg-accent px-2 py-0.5 text-[9px] text-on-accent">Run</span>
              <span className="rounded border border-border2 bg-surface3 px-2 py-0.5 text-[9px] text-text2">
                Cancel
              </span>
              <span className="ml-auto flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-text3">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                Ready
              </span>
            </div>
          </div>
        </PreviewCard>

        <PreviewCard id="toolbar" title={t('settings.themePreviewToolbar')}>
          <div className="flex flex-wrap items-center gap-1">
            <button type="button" className="run-btn px-2 py-1 text-[9px]">Primary</button>
            <button type="button" className="tb-btn px-2 py-0.5 text-[9px]">Secondary</button>
            <button type="button" className="tb-btn px-2 py-0.5 text-[9px]" disabled>
              Disabled
            </button>
            <span className="h-4 w-px bg-border" />
            <span className="panel-header rounded px-2 py-0.5 text-[8px]">Panel header</span>
          </div>
          <div className="mt-1.5 flex gap-1">
            <span className="rounded border border-green/40 bg-green/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-green">
              AAA
            </span>
            <span className="rounded border border-yellow/40 bg-yellow/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-yellow">
              Warning
            </span>
            <span className="rounded border border-red/40 bg-red/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-red">
              Error
            </span>
          </div>
        </PreviewCard>

        <PreviewCard id="forms" title={t('settings.themePreviewForms')}>
          <div className="grid grid-cols-2 gap-1.5">
            <Field label="Input">
              <input className={inputClass} defaultValue="Score_Pre" />
            </Field>
            <Field label="Select">
              <select className={inputClass} defaultValue="a">
                <option value="a">Group A</option>
                <option value="b">Group B</option>
              </select>
            </Field>
            <Field label="Textarea">
              <textarea className={inputClass} rows={2} defaultValue="Notes and labels" />
            </Field>
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[9px] text-text2">
                <input type="checkbox" defaultChecked className="accent-accent" />
                Checkbox
              </label>
              <label className="flex items-center gap-1.5 text-[9px] text-text3">
                <input type="range" defaultValue="60" className="h-1 accent-accent" />
                Range
              </label>
              <span className="text-[8px] text-yellow">Hint / validation message</span>
            </div>
          </div>
        </PreviewCard>

        <PreviewCard id="grid" title={t('settings.themePreviewGrid')}>
          <div className="overflow-x-auto">
            <table className="output-table mb-0 text-[9px]">
              <thead>
                <tr>
                  <th>Score_Pre</th>
                  <th>Group</th>
                  <th>Age</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bg-accent/10 text-text">50</td>
                  <td>A</td>
                  <td>20</td>
                </tr>
                <tr>
                  <td>60</td>
                  <td className="bg-red/10 text-red">invalid</td>
                  <td>41</td>
                </tr>
                <tr>
                  <td>45</td>
                  <td>B</td>
                  <td className="text-yellow">missing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </PreviewCard>

        <PreviewCard id="analysis" title={t('settings.themePreviewAnalysis')}>
          <div className="rounded border border-border2 bg-surface2/50 p-2">
            <div className="mb-1 flex items-center gap-1 rounded border border-border2 bg-surface3 p-0.5 text-[8px]">
              <span className="rounded bg-accent px-1.5 py-0.5 text-on-accent">Guided</span>
              <span className="px-1.5 py-0.5 text-text3">Expert</span>
            </div>
            <Field label="Dependent variable">
              <select className={inputClass} defaultValue="score">
                <option value="score">Score_Post</option>
              </select>
            </Field>
            <p className="mt-1 text-[8px] text-text3">Confidence level · 95%</p>
            <button type="button" className="run-btn mt-1.5 px-2 py-0.5 text-[9px]">
              Run analysis
            </button>
            <div className="mt-1.5 h-1 rounded bg-surface3">
              <div className="h-1 w-2/3 rounded bg-accent" />
            </div>
          </div>
        </PreviewCard>

        <PreviewCard id="output" title={t('settings.themePreviewOutput')}>
          <div className="output-card p-2">
            <div className="output-title mb-1 text-[9px]">ANOVA: Score by Group</div>
            <p className="text-[9px] text-text2">F(2, 27) = 4.21 · p = .025 · N = 30</p>
            <div className="summary-box mt-1 p-1.5 text-[8px]">
              Difference between groups is statistically significant.
            </div>
          </div>
        </PreviewCard>

        <PreviewCard id="charts" title={t('settings.themePreviewCharts')}>
          <ThemeChartPreview theme={theme} />
        </PreviewCard>

        <PreviewCard id="dialogs" title={t('settings.themePreviewDialogs')}>
          <div className="relative h-28 overflow-hidden rounded border border-border2 bg-surface2">
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute left-3 right-3 top-4 rounded border border-border2 bg-surface p-2 shadow-lg">
              <p className="text-[9px] font-semibold text-text">Discard changes?</p>
              <p className="mt-0.5 text-[8px] text-text3">This cannot be undone.</p>
              <div className="mt-1.5 flex justify-end gap-1">
                <span className="tb-btn px-1.5 py-0.5 text-[8px]">Cancel</span>
                <span className="rounded bg-accent px-1.5 py-0.5 text-[8px] text-on-accent">Confirm</span>
              </div>
            </div>
            <div className="absolute bottom-1 left-1 right-1 flex items-center gap-1 rounded border border-border2 bg-surface2 px-2 py-1 text-[8px] text-text2 shadow">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              Project saved as .lzs
            </div>
          </div>
        </PreviewCard>

        <PreviewCard id="help" title={t('settings.themePreviewHelp')}>
          <div className="rounded border border-border2 bg-surface2/60 p-2">
            <p className="text-[9px] font-semibold text-text">Advanced reading</p>
            <p className="mt-0.5 text-[8px] leading-relaxed text-text2">
              Use a non-parametric alternative when the normality assumption is doubtful.
            </p>
            <pre className="mt-1 overflow-x-auto rounded bg-surface3 p-1 font-mono text-[8px] text-text2">
              t.test(x ~ group, data = df)
            </pre>
          </div>
        </PreviewCard>

        <PreviewCard id="scrollbar" title={t('settings.themePreviewScrollbar')}>
          <div className="scrollbar max-h-20 overflow-auto rounded border border-border2 bg-surface2/50 p-1.5 font-mono text-[8px] text-text3">
            {Array.from({ length: 12 }, (_, index) => (
              <p key={index}>row {String(index + 1).padStart(2, '0')} · selected / hover / focus</p>
            ))}
          </div>
        </PreviewCard>
      </div>
    </div>
  );
};
