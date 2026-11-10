import { useMemo } from 'react';
import { ChevronRight, Wand2 } from 'lucide-react';
import { analysisDescription, analysisLabel, analysisMeta } from '../../analyses/registry';
import type { GridData } from '../../grid/types';
import { t } from '../../i18n';
import type { ProjectParams } from '../../io/project';
import { applyAssistantLeaf } from './apply';
import { AssistantReportCard } from './AssistantReportCard';
import type { AssistantCardSpec } from './card';
import {
  validateLeafReadiness,
  type LeafReadinessState,
  type LeafRepair,
} from './readiness';
import { ASSISTANT_ROOTS, type AssistantLeaf, type AssistantQuestion } from './tree';

const readinessMessage = (state: LeafReadinessState): string => {
  switch (state) {
    case 'ready':
      return t('assistant.readiness.ready');
    case 'empty':
      return t('assistant.readiness.empty');
    case 'missing-roles':
      return t('assistant.readiness.missing');
    case 'type-mismatch':
      return t('assistant.readiness.types');
    default:
      return t('assistant.readiness.rules');
  }
};

/**
 * Question and leaf of the Assistant tree, shared by the docked panel and the
 * full-page workspace so both show the same answers, roles and actions.
 */
export const QuestionView = ({
  node,
  onAnswer,
  onNotSure,
  prepared,
}: {
  node: AssistantQuestion;
  onAnswer: (optionId: string) => void;
  onNotSure: () => void;
  /** False when no leaf below the option can run on the current data. */
  prepared?: (next: string) => boolean;
}) => (
  <div data-assistant-question={node.id}>
    <p className="text-[12px] font-medium leading-snug text-text">{t(node.prompt)}</p>
    {node.help && (
      <details className="mt-1.5 rounded border border-border2 bg-surface2/40 px-2 py-1">
        <summary className="cursor-pointer text-[10px] text-accent2">{t('assistant.help')}</summary>
        <p className="mt-1 text-[10px] leading-relaxed text-text2">
          <span className="font-semibold text-text3">{t('assistant.definition')}: </span>
          {t(node.help.definition)}
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-text2">
          <span className="font-semibold text-text3">{t('assistant.example')}: </span>
          {t(node.help.example)}
        </p>
      </details>
    )}
    <div className="mt-2 flex flex-col gap-1">
      {node.options.map(option => (
        <button
          key={option.id}
          type="button"
          data-assistant-option={option.id}
          onClick={() => onAnswer(option.id)}
          className="flex items-start justify-between gap-1.5 rounded border border-border bg-surface2/50 px-2 py-1.5 text-left text-[11px] leading-snug text-text2 hover:border-accent2 hover:bg-surface2 hover:text-text"
        >
          <span>{t(option.label)}</span>
          {prepared && !prepared(option.next) && (
            <span
              data-assistant-needed
              title={t('assistant.dataNeeded')}
              aria-label={t('assistant.dataNeeded')}
              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow"
            />
          )}
          <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-text3" />
        </button>
      ))}
    </div>
    {node.id === ASSISTANT_ROOTS.analysis && (
      <button
        type="button"
        data-assistant-not-sure
        onClick={onNotSure}
        title={t('assistant.notSureHelp')}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-border2 px-2 py-1.5 text-[10px] text-text3 hover:border-accent2 hover:text-accent2"
      >
        <Wand2 className="h-3 w-3" />
        {t('assistant.notSure')}
      </button>
    )}
  </div>
);

export const LeafView = ({
  leaf,
  grid,
  params,
  card,
  running,
  onApply,
  onRun,
  onAddToChain,
  inChain,
  onRepair,
}: {
  leaf: AssistantLeaf;
  grid: GridData;
  params: ProjectParams;
  card: AssistantCardSpec | null;
  running: boolean;
  onApply: () => void;
  onRun: () => void;
  /** Only the workspace offers the chain; the docked panel omits the action. */
  onAddToChain?: () => void;
  inChain?: boolean;
  /** Takes the user to the data editor on the column to fix. */
  onRepair?: (repair: LeafRepair) => void;
}) => {
  const result = useMemo(() => applyAssistantLeaf(leaf, params, grid), [leaf, params, grid]);
  const readiness = useMemo(
    () => validateLeafReadiness(leaf, params, grid),
    [leaf, params, grid]
  );
  const meta = analysisMeta(leaf.analysisId);
  return (
    <div data-assistant-leaf={leaf.id}>
      <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
        {t('assistant.target')}
      </span>
      <h3 className="mt-0.5 text-[13px] font-semibold text-text">{analysisLabel(leaf.analysisId)}</h3>
      {leaf.variant && <p className="text-[10px] text-accent2">{t(leaf.variant)}</p>}

      {meta && (
        <p className="mt-1.5 text-[10px] leading-relaxed text-text2">
          <span className="font-semibold text-text3">{t('assistant.why')}: </span>
          {analysisDescription(meta)}
        </p>
      )}

      <div className="mt-2.5">
        <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
          {t('assistant.roles')}
        </span>
        {result.assignments.length === 0 ? (
          <p className="mt-0.5 text-[10px] text-text2">{t('assistant.noRoles')}</p>
        ) : (
          <ul className="mt-1 space-y-1">
            {result.assignments.map(item => (
              <li key={item.roleKey} className="flex items-start justify-between gap-2 text-[10px]">
                <span className="min-w-0 text-text2">{item.label}</span>
                <span
                  data-assistant-role={item.roleKey}
                  className={
                    item.column === null
                      ? 'shrink-0 rounded border border-yellow/40 bg-yellow/10 px-1 text-yellow'
                      : 'shrink-0 rounded border border-border2 bg-surface2 px-1 font-mono text-text'
                  }
                >
                  {item.column === null ? t('assistant.missingRole') : grid.cols[item.column]?.name}
                </span>
              </li>
            ))}
          </ul>
        )}
        {result.missing.length > 0 && (
          <p className="mt-1 text-[9px] leading-snug text-yellow">{t('assistant.missingRoles')}</p>
        )}
      </div>

      <div className="mt-2.5">
        <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
          {t('assistant.checks')}
        </span>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {leaf.checks.map(key => (
            <li key={key} className="text-[10px] leading-relaxed text-text2">
              {t(key)}
            </li>
          ))}
        </ul>
        {leaf.alternative && (
          <p className="mt-1 text-[9px] text-text3">
            {t('assistant.alternative')}: {analysisLabel(leaf.alternative)}
          </p>
        )}
      </div>

      {!readiness.canRun && (
        <div
          data-assistant-readiness={readiness.state}
          className="mt-2 space-y-1 rounded border border-yellow/40 bg-yellow/10 p-1.5"
        >
          <p className="text-[9px] leading-snug text-yellow">
            {readinessMessage(readiness.state)}
          </p>
          {readiness.state === 'type-mismatch' && result.problems.length > 0 && (
            <ul className="space-y-0.5">
              {result.problems.map(problem => (
                <li key={problem} className="text-[9px] leading-snug text-yellow">
                  {problem}
                </li>
              ))}
            </ul>
          )}
          {onRepair && readiness.repairs[0] && (
            <button
              type="button"
              data-assistant-repair
              onClick={() => onRepair(readiness.repairs[0])}
              className="rounded border border-yellow/40 px-1.5 py-1 text-[9px] text-yellow hover:bg-yellow/10"
            >
              {t('assistant.repair')}
            </button>
          )}
        </div>
      )}

      {card && (
        <div className="mt-2.5" data-assistant-summary>
          <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
            {t('assistant.cardSummary')}
          </span>
          <AssistantReportCard spec={card} compact />
        </div>
      )}

      <div className="mt-3 flex flex-col gap-1">
        <button
          type="button"
          data-assistant-apply
          onClick={onApply}
          disabled={running || !readiness.canRun}
          className="rounded border border-border2 bg-surface2 px-2 py-1.5 text-[11px] text-text hover:border-accent2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('assistant.apply')}
        </button>
        {onAddToChain && (
          <button
            type="button"
            data-assistant-chain-add
            onClick={onAddToChain}
            disabled={running || inChain || !readiness.canRun}
            className="rounded border border-border2 bg-surface2 px-2 py-1.5 text-[11px] text-text hover:border-accent2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {inChain ? t('assistant.chainAdded') : t('assistant.chainAdd')}
          </button>
        )}
        <button
          type="button"
          data-assistant-run
          onClick={onRun}
          disabled={running || !readiness.canRun}
          className="rounded bg-accent px-2 py-1.5 text-[11px] font-semibold text-on-accent hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? t('assistant.running') : t('assistant.run')}
        </button>
      </div>
    </div>
  );
};
