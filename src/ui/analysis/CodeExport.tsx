import type { GridData } from '../../grid/types';
import type { ProjectParams } from '../../io/project';
import { buildAnalysisCode } from '../../io/codeExport';
import { downloadText } from '../../io/writers';
import { t } from '../../i18n';

/** Small reproducibility affordance: R/Python for the active analysis. */
export const CodeExport = ({
  analysisId,
  grid,
  params,
  ciLevel,
}: {
  analysisId: string;
  grid: GridData;
  params: ProjectParams;
  ciLevel: number;
}) => {
  const r = buildAnalysisCode(analysisId, grid, params, ciLevel, 'r');
  const python = buildAnalysisCode(analysisId, grid, params, ciLevel, 'python');
  if (!r && !python) return null;

  return (
    <details className="rounded border border-border/70 bg-surface3/30 px-2 py-1.5">
      <summary className="cursor-pointer font-mono text-[9px] uppercase tracking-widest text-text3">
        {t('code.title')}
      </summary>
      <p className="mt-1 text-[9px] leading-relaxed text-text3">{t('code.hint')}</p>
      <div className="mt-2 flex gap-1.5">
        {r && (
          <button
            type="button"
            className="tb-btn px-2 py-0.5 text-[10px]"
            onClick={() => downloadText(r, 'lazstats-analysis.R', 'text/plain;charset=utf-8')}
          >
            R
          </button>
        )}
        {python && (
          <button
            type="button"
            className="tb-btn px-2 py-0.5 text-[10px]"
            onClick={() => downloadText(python, 'lazstats-analysis.py', 'text/plain;charset=utf-8')}
          >
            Python
          </button>
        )}
      </div>
    </details>
  );
};
