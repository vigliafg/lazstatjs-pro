import type { AnalysisFamily, AnalysisMeta } from '../../analyses/registry';
import { analysisDescription, analysisLabel, familyLabel } from '../../analyses/registry';
import { t } from '../../i18n';
import { HelpButton } from '../../help/HelpButton';
import { topicForAnalysis } from '../../help/book';

/** Title block of the setup panel: family, badges, name and handbook shortcut. */
export const AnalysisHeader = ({
  meta,
  family,
  activeAnalysis,
}: {
  meta: AnalysisMeta | undefined;
  family: AnalysisFamily | undefined;
  activeAnalysis: string;
}) => (
  <>
    <div className="mb-1 flex flex-wrap items-center gap-2">
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent2">
        {family ? familyLabel(family) : t('analysis.familyFallback')}
      </span>
      {meta?.cost === 'heavy' && (
        <span className="rounded border border-yellow/25 bg-yellow/5 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-yellow/80">
          {t('analysis.heavyBadge')}
        </span>
      )}
    </div>
    <h2 className="flex items-center gap-1 text-[15px] font-semibold text-text">
      {meta ? analysisLabel(meta.id) : activeAnalysis}
      {meta && <HelpButton topicId={topicForAnalysis(meta.id)} />}
    </h2>
    <p className="mt-1 text-[10px] leading-relaxed text-text3">
      {meta ? analysisDescription(meta) : t('analysis.descriptionFallback')}
    </p>
  </>
);
