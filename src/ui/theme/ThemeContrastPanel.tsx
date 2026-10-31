import { t, type MessageKey } from '../../i18n';
import { themeContrastReport, type ContrastLevel, type ThemeDefinition } from '../../theme';

const LABELS: Record<string, MessageKey> = {
  'text-bg': 'settings.themeContrastTextBg',
  'text-surface': 'settings.themeContrastTextSurface',
  'text-surface3': 'settings.themeContrastTextSurface3',
  'text2-surface': 'settings.themeContrastText2Surface',
  'text3-surface': 'settings.themeContrastText3Surface',
  'onAccent-accent': 'settings.themeContrastOnAccent',
  'onAccent2-accent2': 'settings.themeContrastOnAccent2',
  'accent-bg': 'settings.themeContrastAccentBg',
  'chart-text': 'settings.themeContrastChartText',
  'chart-muted': 'settings.themeContrastChartMuted',
  'chart-palette': 'settings.themeContrastChartPalette',
};

const badgeClass = (level: ContrastLevel, pass: boolean): string => {
  if (!pass) return 'border-red/40 bg-red/10 text-red';
  if (level === 'AAA') return 'border-green/40 bg-green/10 text-green';
  if (level === 'AA') return 'border-accent/40 bg-accent/10 text-accent';
  return 'border-yellow/40 bg-yellow/10 text-yellow';
};

/** WCAG table shown beside the token editor. */
export const ThemeContrastPanel = ({ theme }: { theme: ThemeDefinition }) => {
  const report = themeContrastReport(theme);
  const failed = report.checks.filter(check => !check.pass).length;
  return (
    <section className="rounded border border-border2 bg-surface2/40 p-2" data-theme-contrast>
      <div className="mb-1.5 flex items-baseline gap-2">
        <h3 className="font-mono text-[9px] uppercase tracking-widest text-text3">
          {t('settings.themeContrast')}
        </h3>
        <span className={`font-mono text-[9px] ${report.ok ? 'text-green' : 'text-yellow'}`}>
          {report.ok
            ? t('settings.themeContrastOk')
            : t('settings.themeContrastWarning', { count: failed })}
        </span>
      </div>
      <ul className="flex flex-col gap-1">
        {report.checks.map(check => (
          <li
            key={check.id}
            className="flex items-center gap-1.5 text-[9px] text-text3"
            data-contrast-check={check.id}
            data-contrast-level={check.level}
            data-contrast-pass={check.pass ? 'true' : 'false'}
          >
            <span
              aria-hidden="true"
              className="h-3 w-3 shrink-0 rounded-sm border"
              style={{ background: check.background, borderColor: check.foreground }}
            />
            <span className="min-w-0 flex-1 truncate">{t(LABELS[check.id] ?? 'settings.themeContrast')}</span>
            <span className="font-mono tabular-nums">{check.ratio.toFixed(2)}</span>
            <span
              className={`shrink-0 rounded border px-1 font-mono text-[8px] uppercase ${badgeClass(
                check.level,
                check.pass
              )}`}
            >
              {check.level === 'fail' ? '!' : check.level}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};
