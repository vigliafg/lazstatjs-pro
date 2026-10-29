import { useEffect, useState } from 'react';
import { Loader2, Play, X } from 'lucide-react';
import { t } from '../../i18n';

/**
 * Run / progress / cancel footer.
 *
 * Kept out of `AnalysisOptions` so the setup panel stays a composition file
 * and the worker lifecycle has one small, testable surface.
 */
export const RunControl = ({
  running,
  phase,
  disabled,
  rowCount,
  columnCount,
  onRun,
  onCancel,
}: {
  running: boolean;
  phase: 'starting' | 'computing' | 'finishing';
  disabled: boolean;
  rowCount: number;
  columnCount: number;
  onRun: () => void;
  onCancel: () => void;
}) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running) {
      setElapsed(0);
      return;
    }
    const started = Date.now();
    const timer = setInterval(() => setElapsed((Date.now() - started) / 1000), 250);
    return () => clearInterval(timer);
  }, [running]);

  return (
  <div className="shrink-0 border-t border-border bg-surface2/60 p-3">
    {running ? (
      <>
        <button
          type="button"
          disabled
          className="run-btn flex h-10 w-full items-center justify-center gap-2 opacity-90"
          aria-live="polite"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t('analysis.running')} · {elapsed.toFixed(1)}s
        </button>
        <div
          className="mt-1.5 h-1 w-full overflow-hidden rounded bg-surface3"
          role="progressbar"
          aria-label={t('analysis.running')}
        >
          <div className="h-full w-1/3 animate-pulse rounded bg-accent" />
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-wider text-text3">
          <span className="truncate">{t(`analysis.phase.${phase}`)}</span>
          <button
            type="button"
            onClick={onCancel}
            className="tb-btn flex shrink-0 items-center gap-1 px-2 py-0.5 text-[9px]"
          >
            <X className="h-3 w-3" />
            {t('analysis.cancel')}
          </button>
        </div>
      </>
    ) : (
      <>
        <button
          type="button"
          onClick={onRun}
          disabled={disabled}
          title={t('analysis.runTitle')}
          className="run-btn flex h-10 w-full items-center justify-center gap-2"
        >
          <Play className="h-3.5 w-3.5" />
          {t('analysis.run')}
        </button>
        <div className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-wider text-text3">
          <span className="truncate" title={`${rowCount} ${t('data.rowsUnit')} · ${columnCount} ${t('analysis.variablesLower')}`}>
            {rowCount} × {columnCount}
          </span>
          <span className="shrink-0 text-text3/80" title={t('analysis.shortcut')}>
            {t('analysis.shortcut')}
          </span>
        </div>
      </>
    )}
  </div>
  );
};
