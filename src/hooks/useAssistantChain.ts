import { useRef, useState } from 'react';
import { analysisLabel } from '../analyses/registry';
import type { GridData } from '../grid/types';
import { t } from '../i18n';
import type { ProjectParams } from '../io/project';
import type { AssistantRunMeta } from '../io/outputs';
import { chainPreflight, type AssistantChainStep } from '../ui/assistant/chain';
import { assistantLeaf } from '../ui/assistant/tree';

export interface AssistantChainState {
  running: boolean;
  step: number | null;
  failedAt: number | null;
}

interface UseAssistantChainOptions {
  grid: GridData;
  showToast: (title: string, message: string, type?: 'ok' | 'warn' | 'error') => void;
  runAnalysisWith: (
    analysisId: string,
    params: ProjectParams,
    level?: number,
    assistant?: AssistantRunMeta
  ) => Promise<boolean>;
}

/**
 * Runs the chain one step at a time. Nothing in the visible form changes:
 * every step brings its own parameters and the console receives one
 * run-report per step. Preflight stops the chain before the first card, while
 * a runtime failure keeps the completed steps and offers a retry from there.
 */
export const useAssistantChain = ({
  grid,
  showToast,
  runAnalysisWith,
}: UseAssistantChainOptions) => {
  const [state, setState] = useState<AssistantChainState>({
    running: false,
    step: null,
    failedAt: null,
  });
  const seq = useRef(0);

  const label = (steps: AssistantChainStep[], index: number): string => {
    const step = steps[index];
    const leaf = step ? assistantLeaf(step.leafId) : null;
    return leaf ? analysisLabel(leaf.analysisId) : step?.leafId ?? '';
  };

  const run = async (steps: AssistantChainStep[], from = 0) => {
    if (steps.length === 0) return;
    const token = ++seq.current;
    const preflight = chainPreflight(steps.slice(from), grid);
    if ('index' in preflight) {
      const index = from + preflight.index;
      setState({ running: false, step: null, failedAt: null });
      showToast(
        t('assistant.chain'),
        t('assistant.chainBlocked', { i: index + 1, label: label(steps, index) }),
        'error'
      );
      return;
    }
    for (let offset = 0; offset < preflight.runs.length; offset += 1) {
      if (token !== seq.current) return;
      const step = preflight.runs[offset];
      const position = from + offset + 1;
      setState({ running: true, step: position, failedAt: null });
      const ok = await runAnalysisWith(step.leaf.analysisId, step.params, undefined, {
        leafId: step.leaf.id,
        path: [],
        chain: { index: position, total: steps.length },
      });
      if (token !== seq.current) return;
      if (!ok) {
        setState({ running: false, step: null, failedAt: position - 1 });
        showToast(
          t('assistant.chain'),
          t('assistant.chainFailed', {
            i: position,
            label: label(steps, position - 1),
          }),
          'error'
        );
        return;
      }
    }
    setState({ running: false, step: null, failedAt: null });
    showToast(t('assistant.chain'), t('assistant.chainDone', { n: steps.length }), 'ok');
  };

  return { state, run };
};
