import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { useUiMode } from '../../components/UiMode';
import type { GridData } from '../../grid/types';
import { t } from '../../i18n';
import type { ProjectParams } from '../../io/project';
import type { OutputEntry } from '../output/types';
import { applyAssistantLeaf } from './apply';
import { AssistantChain } from './AssistantChain';
import type { AssistantChainStep } from './chain';
import { AssistantFlow } from './AssistantFlow';
import { AssistantHelp } from './AssistantHelp';
import { LeafView, QuestionView } from './AssistantViews';
import { optionIsPrepared, type LeafRepair } from './readiness';
import { goalForAnswers, recommendLeafForGrid } from './recommend';
import { ASSISTANT_ROOTS, type AssistantLeaf } from './tree';
import { useAssistant } from './useAssistant';

interface AssistantWorkspaceProps {
  grid: GridData;
  params: ProjectParams;
  outputs: OutputEntry[];
  running: boolean;
  chainRunning: boolean;
  chainRunningStep: number | null;
  chainFailedAt: number | null;
  onApply: (leaf: AssistantLeaf, params: ProjectParams) => void;
  onRun: (leaf: AssistantLeaf, params: ProjectParams, path: string[]) => void;
  onRunChain: (steps: AssistantChainStep[], from: number) => void;
  notify: (message: string, type?: 'ok' | 'warn' | 'error') => void;
  onRepair: (repair: LeafRepair) => void;
}

type AssistantView = 'questions' | 'flow';

const VIEW_KEY = 'lazstats.assistant.view';

/**
 * Full-page Assistant (`activeAnalysis === 'assistant'`).
 *
 * It replaces the wizard form with the same tree and the same leaf actions as
 * the docked panel. The header switches between the cascade of questions and
 * the diagram: the diagram auto-fits the whole path (no scrollbars) and always
 * carries the choices made so far plus a one-line explanation at its bottom.
 */
export const AssistantWorkspace = ({
  grid,
  params,
  outputs,
  running,
  chainRunning,
  chainRunningStep,
  chainFailedAt,
  onApply,
  onRun,
  onRunChain,
  notify,
  onRepair,
}: AssistantWorkspaceProps) => {
  const mode = useUiMode();
  const assistant = useAssistant('analysis', mode);
  const helpTrigger = useRef<HTMLButtonElement | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [view, setView] = useState<AssistantView>(() => {
    try {
      return localStorage.getItem(VIEW_KEY) === 'questions' ? 'questions' : 'flow';
    } catch {
      return 'flow';
    }
  });

  const chooseView = (next: AssistantView) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Storage can be unavailable: the view still switches for this session.
    }
  };

  const lastCard = useMemo(() => {
    const leafId = assistant.leaf?.id;
    if (!leafId) return null;
    for (let index = outputs.length - 1; index >= 0; index -= 1) {
      const card = outputs[index].session?.assistantCard;
      if (card && card.leafId === leafId) return card;
    }
    return null;
  }, [assistant.leaf, outputs]);

  // A new step closes the previous help instead of explaining another node.
  useEffect(() => {
    setHelpOpen(false);
  }, [assistant.node?.id, assistant.leaf?.id]);

  const helpNode = assistant.leaf ?? (assistant.node?.kind === 'question' ? assistant.node : null);

  const closeHelp = useCallback(() => {
    setHelpOpen(false);
    requestAnimationFrame(() => helpTrigger.current?.focus());
  }, []);

  const notSure = () => {
    const result = recommendLeafForGrid(grid, goalForAnswers(assistant.answers));
    if (result.leafId) assistant.suggest(result.leafId);
    else if (result.message) notify(t(result.message), 'warn');
  };

  const apply = () => {
    if (!assistant.leaf) return;
    onApply(assistant.leaf, applyAssistantLeaf(assistant.leaf, params, grid).params);
  };
  const run = () => {
    if (!assistant.leaf) return;
    const result = applyAssistantLeaf(assistant.leaf, params, grid);
    onRun(
      assistant.leaf,
      result.params,
      assistant.steps.map(step => step.optionId)
    );
  };
  const addToChain = () => {
    if (!assistant.leaf) return;
    const applied = applyAssistantLeaf(assistant.leaf, params, grid);
    const outcome = assistant.addToChain(assistant.leaf.id, applied.params);
    if (outcome === 'duplicate') notify(t('assistant.chainDuplicate'), 'warn');
    else if (outcome === 'full') notify(t('assistant.chainFull'), 'warn');
  };

  const leafView = assistant.leaf ? (
    <LeafView
      leaf={assistant.leaf}
      grid={grid}
      params={params}
      card={lastCard}
      running={running || chainRunning}
      onApply={apply}
      onRun={run}
      onAddToChain={addToChain}
      inChain={assistant.chain.some(step => step.leafId === assistant.leaf?.id)}
      onRepair={onRepair}
    />
  ) : null;

  const questionView =
    assistant.node?.kind === 'question' ? (
      <QuestionView
        node={assistant.node}
        onAnswer={assistant.answer}
        prepared={next => optionIsPrepared(next, params, grid)}
        onNotSure={notSure}
      />
    ) : (
      <p className="text-[11px] text-text3">{t('assistant.noData')}</p>
    );

  const caption = (
    <div data-assistant-flow-caption className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-1">
        <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
          {t('assistant.flowCaption')}
        </span>
        {assistant.steps.length === 0 ? (
          <span className="text-[10px] text-text3">{t('assistant.path')}</span>
        ) : (
          assistant.steps.map(step => (
            <span
              key={`caption-${step.questionId}-${step.optionId}`}
              data-flow-choice={step.optionId}
              className="max-w-full truncate rounded border border-border2 bg-surface2 px-1.5 py-0.5 text-[9px] text-text2"
            >
              {t(step.label)}
            </span>
          ))
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p data-assistant-flow-explanation className="min-w-0 text-[10px] leading-snug text-text2">
          {assistant.leaf
            ? t(assistant.leaf.help)
            : assistant.node?.kind === 'question'
              ? t(assistant.node.prompt)
              : t('assistant.noData')}
        </p>
        {assistant.node?.kind === 'question' && assistant.node.id === ASSISTANT_ROOTS.analysis && (
          <button
            type="button"
            data-assistant-not-sure
            onClick={notSure}
            title={t('assistant.notSureHelp')}
            className="flex shrink-0 items-center gap-1 rounded border border-dashed border-border2 px-2 py-1 text-[10px] text-text3 hover:border-accent2 hover:text-accent2"
          >
            <Wand2 className="h-3 w-3" />
            {t('assistant.notSure')}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div data-assistant-workspace className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface px-5 py-3">
        <Sparkles className="h-4 w-4 shrink-0 text-accent2" />
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold text-text">{t('assistant.title')}</h2>
          <p className="truncate text-[10px] text-text3">{t('assistant.subtitle')}</p>
        </div>
        <div
          role="group"
          aria-label={t('assistant.viewMode')}
          className="flex shrink-0 items-center gap-0.5 rounded border border-border2 bg-surface3/60 p-0.5"
        >
          <button
            type="button"
            data-assistant-mode="questions"
            aria-pressed={view === 'questions'}
            onClick={() => chooseView('questions')}
            className={`rounded px-2 py-1 text-[10px] transition-colors ${
              view === 'questions' ? 'bg-accent text-on-accent' : 'text-text3 hover:text-text'
            }`}
          >
            {t('assistant.mode.questions')}
          </button>
          <button
            type="button"
            data-assistant-mode="flow"
            aria-pressed={view === 'flow'}
            onClick={() => chooseView('flow')}
            className={`rounded px-2 py-1 text-[10px] transition-colors ${
              view === 'flow' ? 'bg-accent text-on-accent' : 'text-text3 hover:text-text'
            }`}
          >
            {t('assistant.mode.flow')}
          </button>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {helpNode && (
            <button
              ref={helpTrigger}
              type="button"
              data-assistant-help-trigger
              onClick={() => setHelpOpen(true)}
              aria-label={t('assistant.help')}
              title={t('assistant.help')}
              className="flex h-7 w-7 items-center justify-center rounded border border-border2 font-mono text-[11px] text-text3 hover:border-accent2 hover:text-accent2"
            >
              ?
            </button>
          )}
          {assistant.steps.length > 0 && (
            <button
              type="button"
              onClick={assistant.back}
              aria-label={t('assistant.back')}
              className="flex h-7 w-7 items-center justify-center rounded text-text3 hover:bg-surface2 hover:text-text"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          )}
          {assistant.steps.length > 0 && (
            <button
              type="button"
              onClick={assistant.reset}
              aria-label={t('assistant.reset')}
              title={t('assistant.reset')}
              className="flex h-7 w-7 items-center justify-center rounded text-text3 hover:bg-surface2 hover:text-text"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
          {view === 'questions' && (
            <div className="flex flex-wrap gap-1" data-assistant-path>
              {assistant.steps.length === 0 ? (
                <span className="text-[10px] text-text3">{t('assistant.path')}</span>
              ) : (
                assistant.steps.map(step => (
                  <span
                    key={`${step.questionId}-${step.optionId}`}
                    className="max-w-full truncate rounded border border-border2 bg-surface2 px-1.5 py-0.5 text-[9px] text-text2"
                  >
                    {t(step.label)}
                  </span>
                ))
              )}
            </div>
          )}

          {view === 'flow' ? (
            <AssistantFlow
              domain="analysis"
              answers={assistant.answers}
              chain={assistant.chain.map(step => step.leafId)}
              onAnswer={assistant.answer}
              onGoTo={assistant.goTo}
              caption={caption}
            />
          ) : (
            <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
              {leafView ?? questionView}
            </section>
          )}

          {view === 'flow' && leafView && (
            <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
              {leafView}
            </section>
          )}

          <AssistantChain
            chain={assistant.chain}
            running={chainRunning}
            runningStep={chainRunningStep}
            failedAt={chainFailedAt}
            onRemove={assistant.removeFromChain}
            onMove={assistant.moveFromChain}
            onClear={assistant.clearChain}
            onRun={() => onRunChain(assistant.chain, 0)}
            onRetry={() => onRunChain(assistant.chain, chainFailedAt ?? 0)}
          />

          <div className="flex flex-wrap gap-2 text-[9px] text-text3">
            <span className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono">
              {t('analysis.rows')} {grid.rows.length}
            </span>
            <span className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono">
              {t('analysis.variables')} {grid.cols.length}
            </span>
          </div>
        </div>
      </div>

      {helpOpen && helpNode && (
        <AssistantHelp
          node={helpNode}
          canNotSure={
            assistant.node?.kind === 'question' && assistant.node.id === ASSISTANT_ROOTS.analysis
          }
          canBack={assistant.steps.length > 0}
          onNotSure={() => {
            notSure();
            closeHelp();
          }}
          onBack={() => {
            assistant.back();
            closeHelp();
          }}
          onClose={closeHelp}
        />
      )}
    </div>
  );
};
