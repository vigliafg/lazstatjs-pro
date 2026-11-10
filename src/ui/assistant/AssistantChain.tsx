import { ArrowDown, ArrowUp, Play, RotateCcw, Trash2, X } from 'lucide-react';
import { analysisLabel } from '../../analyses/registry';
import { t } from '../../i18n';
import { assistantLeaf } from './tree';
import type { AssistantChainStep } from './chain';

interface AssistantChainProps {
  chain: AssistantChainStep[];
  running: boolean;
  runningStep: number | null;
  failedAt: number | null;
  onRemove: (id: string) => void;
  onMove: (id: string, offset: -1 | 1) => void;
  onClear: () => void;
  onRun: () => void;
  onRetry: () => void;
}

const stepLabel = (step: AssistantChainStep): string => {
  const leaf = assistantLeaf(step.leafId);
  if (!leaf) return step.leafId;
  return leaf.variant
    ? `${analysisLabel(leaf.analysisId)} · ${t(leaf.variant)}`
    : analysisLabel(leaf.analysisId);
};

/**
 * Strip of the chain: the leaves chosen in the workspace, their order and the
 * single action that runs them one after another.
 */
export const AssistantChain = ({
  chain,
  running,
  runningStep,
  failedAt,
  onRemove,
  onMove,
  onClear,
  onRun,
  onRetry,
}: AssistantChainProps) => {
  if (chain.length === 0) return null;
  const failed = failedAt !== null && failedAt >= 0 ? chain[failedAt] : undefined;

  return (
    <section
      data-assistant-chain
      className="rounded-lg border border-border bg-surface p-3 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
          {t('assistant.chain')}
        </span>
        <span data-chain-count className="rounded border border-border2 bg-surface2 px-1 font-mono text-[9px] text-text2">
          {chain.length}/8
        </span>
        <button
          type="button"
          data-chain-clear
          onClick={onClear}
          disabled={running}
          aria-label={t('assistant.chainClear')}
          title={t('assistant.chainClear')}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded text-text3 hover:bg-surface2 hover:text-text disabled:opacity-40"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <ol className="mt-2 flex flex-col gap-1">
        {chain.map((step, index) => (
          <li
            key={step.id}
            data-chain-step={index}
            data-chain-leaf={step.leafId}
            className="flex items-center gap-1.5 rounded border border-border2 bg-surface2/50 px-1.5 py-1"
          >
            <span className="w-4 shrink-0 font-mono text-[9px] text-text3">{index + 1}</span>
            <span className="min-w-0 flex-1 truncate text-[10px] text-text2" title={stepLabel(step)}>
              {stepLabel(step)}
            </span>
            <button
              type="button"
              data-chain-up
              onClick={() => onMove(step.id, -1)}
              disabled={running || index === 0}
              aria-label={t('assistant.chainMoveUp')}
              className="flex h-5 w-5 items-center justify-center rounded text-text3 hover:bg-surface3 hover:text-text disabled:opacity-30"
            >
              <ArrowUp className="h-2.5 w-2.5" />
            </button>
            <button
              type="button"
              data-chain-down
              onClick={() => onMove(step.id, 1)}
              disabled={running || index === chain.length - 1}
              aria-label={t('assistant.chainMoveDown')}
              className="flex h-5 w-5 items-center justify-center rounded text-text3 hover:bg-surface3 hover:text-text disabled:opacity-30"
            >
              <ArrowDown className="h-2.5 w-2.5" />
            </button>
            <button
              type="button"
              data-chain-remove
              onClick={() => onRemove(step.id)}
              disabled={running}
              aria-label={t('assistant.chainRemove')}
              className="flex h-5 w-5 items-center justify-center rounded text-text3 hover:bg-surface3 hover:text-text disabled:opacity-40"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </li>
        ))}
      </ol>

      {failed && (
        <p data-chain-error className="mt-2 rounded border border-red/30 bg-red/10 px-1.5 py-1 text-[9px] leading-snug text-red">
          {t('assistant.chainFailed', { i: (failedAt ?? 0) + 1, label: stepLabel(failed) })}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          data-chain-run
          onClick={onRun}
          disabled={running}
          className="flex items-center gap-1 rounded bg-accent px-2 py-1.5 text-[10px] font-semibold text-on-accent hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="h-3 w-3" />
          {running
            ? t('assistant.chainRunning', { i: runningStep ?? 1, n: chain.length })
            : t('assistant.chainRun', { n: chain.length })}
        </button>
        {failedAt !== null && !running && (
          <button
            type="button"
            data-chain-retry
            onClick={onRetry}
            className="flex items-center gap-1 rounded border border-border2 bg-surface2 px-2 py-1.5 text-[10px] text-text hover:border-accent2"
          >
            <RotateCcw className="h-3 w-3" />
            {t('assistant.chainRetry', { i: failedAt + 1 })}
          </button>
        )}
      </div>
    </section>
  );
};
