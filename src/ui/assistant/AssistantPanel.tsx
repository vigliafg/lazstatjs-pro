import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, RotateCcw, Sparkles, X } from 'lucide-react';
import { useUiMode } from '../../components/UiMode';
import type { GridData } from '../../grid/types';
import { t } from '../../i18n';
import type { ProjectParams } from '../../io/project';
import type { OutputEntry } from '../output/types';
import type { Range } from '../../grid/ops';
import { applyAssistantLeaf } from './apply';
import type { DataActionId, DataActionParams } from './data';
import { AssistantFlow } from './AssistantFlow';
import { LeafView, QuestionView } from './AssistantViews';
import { optionIsPrepared, type LeafRepair } from './readiness';
import { DataLeafView, DataQualityCard } from './DataLeafView';
import { goalForAnswers, recommendLeafForGrid } from './recommend';
import {
  ASSISTANT_ROOTS,
  type AssistantDomain,
  type AssistantLeaf,
} from './tree';
import {
  ASSISTANT_DEFAULT_WIDTH,
  ASSISTANT_RAIL_WIDTH,
  useAssistant,
} from './useAssistant';

interface AssistantPanelProps {
  domain: AssistantDomain;
  grid: GridData;
  params: ProjectParams;
  outputs: OutputEntry[];
  running: boolean;
  selection: Range | null;
  onApply: (leaf: AssistantLeaf, params: ProjectParams) => void;
  onRun: (leaf: AssistantLeaf, params: ProjectParams, path: string[]) => void;
  onDataAction: (action: DataActionId, params?: DataActionParams) => void;
  onInspect: (column: number) => void;
  onRepair: (repair: LeafRepair) => void;
  onOpenAnalysis: () => void;
  onNotify: (message: string, type?: 'ok' | 'warn' | 'error') => void;
  /** Keeps the panel out of the way when the full-page workspace is open. */
  maxWidth?: number;
  /** The full-page workspace already carries the mode toggle. */
  workspaceActive?: boolean;
}

/**
 * Assistant shell: a full-height column next to DATA and ANALISI.
 *
 * The active tab chooses the domain; the same shell keeps the per-domain path,
 * width and open state. In the data domain F2 shows the question/help shell;
 * F3 adds the data actions.
 */
export const AssistantPanel = ({
  domain,
  grid,
  params,
  outputs,
  running,
  selection,
  onApply,
  onRun,
  onDataAction,
  onInspect,
  onRepair,
  onOpenAnalysis,
  onNotify,
  maxWidth,
  workspaceActive = false,
}: AssistantPanelProps) => {
  const mode = useUiMode();
  const assistant = useAssistant(domain, mode);
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const lastCard = useMemo(() => {
    const leafId = assistant.leaf?.id;
    if (!leafId) return null;
    for (let index = outputs.length - 1; index >= 0; index -= 1) {
      const card = outputs[index].session?.assistantCard;
      if (card && card.leafId === leafId) return card;
    }
    return null;
  }, [assistant.leaf, outputs]);

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { startX: event.clientX, startWidth: assistant.width };
    setDragging(true);
  };
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    assistant.setWidth(drag.current.startWidth + (event.clientX - drag.current.startX));
  };
  const stopDrag = () => {
    drag.current = null;
    setDragging(false);
  };
  const resizeKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      assistant.setWidth(assistant.width - 16);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      assistant.setWidth(assistant.width + 16);
    } else if (event.key === 'Home') {
      event.preventDefault();
      assistant.setWidth(ASSISTANT_DEFAULT_WIDTH);
    }
  };

  const [panelView, setPanelView] = useState<'questions' | 'flow'>('questions');
  const panelFlow = panelView === 'flow' && !workspaceActive;
  const notSure = () => {
    const result = recommendLeafForGrid(grid, goalForAnswers(assistant.answers));
    if (result.leafId) assistant.suggest(result.leafId);
    else if (result.message) onNotify(t(result.message), 'warn');
  };

  const flowCaption = (
    <div data-assistant-flow-caption className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1">
        <span className="font-mono text-[8px] uppercase tracking-widest text-text3">
          {t('assistant.flowCaption')}
        </span>
        {assistant.steps.length === 0 ? (
          <span className="text-[9px] text-text3">{t('assistant.path')}</span>
        ) : (
          assistant.steps.map(step => (
            <span
              key={`panel-${step.questionId}-${step.optionId}`}
              data-flow-choice={step.optionId}
              className="max-w-full truncate rounded border border-border2 bg-surface2 px-1 py-0.5 text-[8px] text-text2"
            >
              {t(step.label)}
            </span>
          ))
        )}
      </div>
      <p data-assistant-flow-explanation className="text-[9px] leading-snug text-text2">
        {assistant.leaf
          ? t(assistant.leaf.help)
          : assistant.node?.kind === 'question'
            ? t(assistant.node.prompt)
            : t('assistant.noData')}
      </p>
      {assistant.node?.kind === 'question' && assistant.node.id === ASSISTANT_ROOTS[domain] && (
        <button
          type="button"
          data-assistant-not-sure
          onClick={notSure}
          title={t('assistant.notSureHelp')}
          className="flex items-center justify-center gap-1 rounded border border-dashed border-border2 px-2 py-1 text-[9px] text-text3 hover:border-accent2 hover:text-accent2"
        >
          {t('assistant.notSure')}
        </button>
      )}
    </div>
  );

  const run = () => {
    if (!assistant.leaf) return;
    const result = applyAssistantLeaf(assistant.leaf, params, grid);
    onRun(
      assistant.leaf,
      result.params,
      assistant.steps.map(step => step.optionId)
    );
  };
  const apply = () => {
    if (!assistant.leaf) return;
    onApply(assistant.leaf, applyAssistantLeaf(assistant.leaf, params, grid).params);
  };

  if (!assistant.open) {
    return (
      <>
        <aside
          role="complementary"
          aria-label={t('assistant.drawer')}
          data-assistant-panel
          data-domain={domain}
          data-open="false"
          style={{ width: ASSISTANT_RAIL_WIDTH }}
          className="hidden h-full min-h-0 shrink-0 flex-col items-center gap-2 border-r border-border bg-surface py-2 lg:flex"
        >
          <button
            type="button"
            onClick={() => assistant.setOpen(true)}
            aria-label={t('assistant.expand')}
            title={t('assistant.expand')}
            className="flex h-7 w-7 items-center justify-center rounded text-text3 hover:bg-surface2 hover:text-accent2"
          >
            <Sparkles className="h-4 w-4" />
          </button>
          <span className="select-none font-mono text-[9px] uppercase tracking-widest text-text3 [writing-mode:vertical-rl]">
            {t('assistant.title')}
          </span>
        </aside>
        <button
          type="button"
          data-assistant-launcher
          onClick={() => assistant.setOpen(true)}
          aria-label={t('assistant.open')}
          className="fixed bottom-3 left-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border2 bg-surface text-accent2 shadow-lg lg:hidden"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      </>
    );
  }

  if (panelFlow) {
    return createPortal(
      <div
        data-assistant-diagram-overlay
        className="fixed inset-0 z-50 flex flex-col bg-bg text-text"
      >
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface px-4 py-2">
          <Sparkles className="h-4 w-4 shrink-0 text-accent2" />
          <span className="text-[12px] font-semibold">{t('assistant.title')}</span>
          <span className="hidden min-w-0 flex-1 truncate text-[10px] text-text3 sm:block">
            {t('assistant.subtitle')}
          </span>
          <div
            role="group"
            aria-label={t('assistant.viewMode')}
            className="ml-auto flex shrink-0 items-center gap-0.5 rounded border border-border2 bg-surface3/60 p-0.5 sm:ml-0"
          >
            <button
              type="button"
              data-assistant-mode="questions"
              onClick={() => setPanelView('questions')}
              className="rounded px-2 py-1 text-[10px] text-text3 transition-colors hover:text-text"
            >
              {t('assistant.mode.questions')}
            </button>
            <button
              type="button"
              data-assistant-mode="flow"
              aria-pressed="true"
              className="rounded bg-accent px-2 py-1 text-[10px] text-on-accent"
            >
              {t('assistant.mode.flow')}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setPanelView('questions')}
            aria-label={t('assistant.collapse')}
            title={t('assistant.collapse')}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-text3 hover:bg-surface2 hover:text-text"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-2 p-3 lg:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <AssistantFlow
              fill
              domain={domain}
              answers={assistant.answers}
              onAnswer={assistant.answer}
              onGoTo={assistant.goTo}
              caption={flowCaption}
            />
          </div>
          {assistant.leaf && (
            <section className="max-h-[45vh] shrink-0 overflow-y-auto rounded-lg border border-border bg-surface p-3 lg:max-h-none lg:w-80">
              <LeafView
                leaf={assistant.leaf}
                grid={grid}
                params={params}
                card={lastCard}
                running={running}
                onApply={apply}
                onRun={run}
                onRepair={onRepair}
              />
            </section>
          )}
        </div>
      </div>,
      document.body
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        aria-hidden="true"
        onClick={() => assistant.setOpen(false)}
      />
      <aside
        role="complementary"
        aria-label={t('assistant.drawer')}
        data-assistant-panel
        data-domain={domain}
        data-open="true"
        data-width={assistant.width}
        style={{ width: maxWidth === undefined ? assistant.width : Math.min(assistant.width, maxWidth) }}
        className="relative flex h-full min-h-0 max-w-[90vw] shrink-0 flex-col border-r border-border bg-surface max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-40 max-lg:shadow-2xl"
      >
        <header className="flex shrink-0 items-center gap-1.5 border-b border-border px-2 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent2" />
          <span className="text-[11px] font-semibold text-text">{t('assistant.title')}</span>
          <span className="min-w-0 flex-1 truncate text-[9px] text-text3">{t('assistant.subtitle')}</span>
          {!workspaceActive && (
            <div
              role="group"
              aria-label={t('assistant.viewMode')}
              className="flex shrink-0 items-center gap-0.5 rounded border border-border2 bg-surface3/60 p-0.5"
            >
              <button
                type="button"
                data-assistant-mode="questions"
                aria-pressed={panelView === 'questions'}
                onClick={() => setPanelView('questions')}
                className={`rounded px-1 py-0.5 text-[8px] transition-colors ${
                  panelView === 'questions' ? 'bg-accent text-on-accent' : 'text-text3 hover:text-text'
                }`}
              >
                {t('assistant.mode.questions')}
              </button>
              <button
                type="button"
                data-assistant-mode="flow"
                aria-pressed={panelView === 'flow'}
                onClick={() => setPanelView('flow')}
                className={`rounded px-1 py-0.5 text-[8px] transition-colors ${
                  panelView === 'flow' ? 'bg-accent text-on-accent' : 'text-text3 hover:text-text'
                }`}
              >
                {t('assistant.mode.flow')}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => assistant.setOpen(false)}
            aria-label={t('assistant.collapse')}
            title={t('assistant.collapse')}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-text3 hover:bg-surface2 hover:text-text"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        <div className="flex shrink-0 items-center gap-1 border-b border-border/60 px-2 py-1">
          {assistant.steps.length > 0 ? (
            <button
              type="button"
              onClick={assistant.back}
              aria-label={t('assistant.back')}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text3 hover:bg-surface2 hover:text-text"
            >
              <ArrowLeft className="h-3 w-3" />
            </button>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-wrap gap-1" data-assistant-path>
            {assistant.steps.length === 0 ? (
              <span className="text-[9px] text-text3">{t('assistant.path')}</span>
            ) : (
              assistant.steps.map(step => (
                <span
                  key={`${step.questionId}-${step.optionId}`}
                  className="max-w-full truncate rounded border border-border2 bg-surface2 px-1 py-0.5 text-[8px] text-text2"
                >
                  {t(step.label)}
                </span>
              ))
            )}
          </div>
          {assistant.steps.length > 0 && (
            <button
              type="button"
              onClick={assistant.reset}
              aria-label={t('assistant.reset')}
              title={t('assistant.reset')}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text3 hover:bg-surface2 hover:text-text"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
          {panelFlow && (
            <div className="mb-2">
              <AssistantFlow
                compact
                domain={domain}
                answers={assistant.answers}
                onAnswer={assistant.answer}
                onGoTo={assistant.goTo}
                caption={flowCaption}
              />
            </div>
          )}
          {domain === 'data' && assistant.dataLeaf ? (
            <DataLeafView
              leaf={assistant.dataLeaf}
              grid={grid}
              selection={selection}
              onAction={onDataAction}
              onInspect={onInspect}
            />
          ) : assistant.leaf ? (              <LeafView
                leaf={assistant.leaf}
                grid={grid}
                params={params}
                card={lastCard}
                running={running}
                onApply={apply}
                onRun={run}
                onRepair={onRepair}
              />
          ) : assistant.node?.kind === 'question' && !panelFlow ? (
            <>
              {domain === 'data' && assistant.node.id === ASSISTANT_ROOTS.data && (
                <div className="mb-2">
                  <DataQualityCard grid={grid} onAction={onDataAction} onInspect={onInspect} />
                </div>
              )}
              <QuestionView
                node={assistant.node}
                onAnswer={assistant.answer}
                prepared={next => optionIsPrepared(next, params, grid)}
                onNotSure={notSure}
              />
            </>
          ) : assistant.node?.kind === 'question' ? null : (
            <p className="text-[10px] text-text3">{t('assistant.noData')}</p>
          )}
        </div>

        {domain === 'data' && (
          <div className="shrink-0 border-t border-border p-2.5">
            <button
              type="button"
              data-assistant-footer-handoff
              onClick={onOpenAnalysis}
              className="w-full rounded border border-border2 bg-surface2 px-2 py-1.5 text-[11px] text-text hover:border-accent2"
            >
              {t('assistant.d.goal.handoff')}
            </button>
          </div>
        )}

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t('assistant.resize')}
          aria-valuemin={280}
          aria-valuemax={520}
          aria-valuenow={assistant.width}
          tabIndex={0}
          data-assistant-resize
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onDoubleClick={() => assistant.setWidth(ASSISTANT_DEFAULT_WIDTH)}
          onKeyDown={resizeKeys}
          className={`absolute right-0 top-0 z-10 hidden h-full w-1 cursor-col-resize touch-none hover:bg-accent2/40 lg:block ${dragging ? 'bg-accent2/60' : ''}`}
        />
      </aside>
    </>
  );
};
