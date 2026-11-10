import { useCallback, useEffect, useMemo, useState } from 'react';
import type { UiMode } from '../../components/UiMode';
import {
  addChainStep,
  moveChainStep,
  parseChain,
  removeChainStep,
  type AssistantChainStep,
} from './chain';
import type { ProjectParams } from '../../io/project';
import {
  ASSISTANT_ROOTS,
  ASSISTANT_TREE,
  assistantLeaf,
  dataLeaf,
  type AssistantDomain,
  type AssistantLeaf,
  type AssistantNode,
  type DataLeaf,
} from './tree';

export const ASSISTANT_STORAGE_KEY = 'lazstat.assistant.v2';
export const ASSISTANT_LEGACY_STORAGE_KEY = 'lazstat.assistant.v1';
export const ASSISTANT_DEFAULT_WIDTH = 320;
export const ASSISTANT_MIN_WIDTH = 280;
export const ASSISTANT_MAX_WIDTH = 520;
export const ASSISTANT_RAIL_WIDTH = 44;
export const ASSISTANT_NARROW_BREAKPOINT = 1280;

let chainSeq = 0;
const chainId = (leafId: string): string => {
  chainSeq += 1;
  return `chain-${leafId}-${Date.now().toString(36)}-${chainSeq}`;
};

type AssistantPaths = Record<AssistantDomain, string[]>;

interface StoredAssistantState {
  open: Partial<Record<AssistantDomain, boolean>>;
  width?: number;
  paths: AssistantPaths;
  chains: AssistantChainStep[];
}

const emptyPaths = (): AssistantPaths => ({ data: [], analysis: [] });

const clampWidth = (value: number): number =>
  Math.min(ASSISTANT_MAX_WIDTH, Math.max(ASSISTANT_MIN_WIDTH, Math.round(value)));

/** Clicking an answered node keeps the answers that lead to it. */
export const truncatePath = (answers: readonly string[], index: number): string[] =>
  answers.slice(0, Math.max(0, Math.min(answers.length, Math.round(index))));

const parseObject = (raw: string | null): Record<string, unknown> | null => {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
};

const answers = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];

const parseOpen = (value: unknown): Partial<Record<AssistantDomain, boolean>> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  return {
    ...(typeof source.data === 'boolean' ? { data: source.data } : {}),
    ...(typeof source.analysis === 'boolean' ? { analysis: source.analysis } : {}),
  };
};

const parsePaths = (value: unknown): AssistantPaths => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyPaths();
  const source = value as Record<string, unknown>;
  return { data: answers(source.data), analysis: answers(source.analysis) };
};

/** Legge v2 e, solo se manca, migra il vecchio stato v1 (solo analisi). */
export const parseAssistantState = (
  rawV2: string | null,
  rawV1: string | null
): StoredAssistantState => {
  const v2 = parseObject(rawV2);
  if (v2) {
    return {
      ...(typeof v2.width === 'number' ? { width: clampWidth(v2.width) } : {}),
      open: parseOpen(v2.open),
      paths: parsePaths(v2.paths),
      chains: parseChain(v2.chains),
    };
  }

  const v1 = parseObject(rawV1);
  return {
    ...(typeof v1?.width === 'number' ? { width: clampWidth(v1.width) } : {}),
    open: typeof v1?.open === 'boolean' ? { data: v1.open } : {},
    paths: { data: [], analysis: answers(v1?.answers) },
    chains: [],
  };
};

const readState = (): StoredAssistantState => {
  if (typeof localStorage === 'undefined') return { open: {}, paths: emptyPaths(), chains: [] };
  try {
    return parseAssistantState(
      localStorage.getItem(ASSISTANT_STORAGE_KEY),
      localStorage.getItem(ASSISTANT_LEGACY_STORAGE_KEY)
    );
  } catch {
    return { open: {}, paths: emptyPaths(), chains: [] };
  }
};

const isNarrowViewport = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(`(max-width: ${ASSISTANT_NARROW_BREAKPOINT - 1}px)`).matches;

/** A parità di preferenza salvata, l'analisi su schermo stretto parte chiusa. */
export const defaultAssistantOpen = (
  domain: AssistantDomain,
  mode: UiMode,
  narrow: boolean
): boolean => (domain === 'analysis' && narrow ? false : mode === 'guided');

export interface AssistantStep {
  questionId: string;
  optionId: string;
  label: string;
}

const resolveAnswers = (
  domain: AssistantDomain,
  answersList: readonly string[]
): { node: AssistantNode | null; steps: AssistantStep[] } => {
  let node: AssistantNode | undefined = ASSISTANT_TREE[ASSISTANT_ROOTS[domain]];
  const steps: AssistantStep[] = [];
  for (const optionId of answersList) {
    if (!node || node.kind !== 'question') break;
    const option = node.options.find(item => item.id === optionId);
    if (!option) break;
    steps.push({ questionId: node.id, optionId, label: option.label });
    node = ASSISTANT_TREE[option.next];
  }
  return { node: node ?? null, steps };
};

/**
 * Session state of the Assistant shell.
 *
 * v2 stores a path for each domain plus the panel width and per-domain open
 * flags. v1 stored a single `answers` path and is migrated to `analysis`,
 * because the v1 panel only contained the analysis tree.
 */
export const useAssistant = (domain: AssistantDomain, mode: UiMode) => {
  const [initial] = useState<StoredAssistantState>(readState);
  const [openByDomain, setOpenByDomain] = useState<Partial<Record<AssistantDomain, boolean>>>(initial.open);
  const [width, setWidthState] = useState(() => clampWidth(initial.width ?? ASSISTANT_DEFAULT_WIDTH));
  const [paths, setPaths] = useState<AssistantPaths>(initial.paths);
  const [chains, setChains] = useState<AssistantChainStep[]>(initial.chains);
  const [suggested, setSuggested] = useState<string | null>(null);

  const answersList = paths[domain] ?? [];
  const { node, steps } = useMemo(
    () => resolveAnswers(domain, answersList),
    [domain, answersList]
  );
  const currentLeaf: AssistantLeaf | null = useMemo(() => {
    if (domain !== 'analysis') return null;
    if (suggested) return assistantLeaf(suggested);
    return node?.kind === 'leaf' ? assistantLeaf(node.id) : null;
  }, [domain, node, suggested]);
  const currentDataLeaf: DataLeaf | null = useMemo(
    () => (domain === 'data' && node?.kind === 'leaf' ? dataLeaf(node.id) : null),
    [domain, node]
  );
  const open = openByDomain[domain] ?? defaultAssistantOpen(domain, mode, isNarrowViewport());

  useEffect(() => {
    setSuggested(null);
  }, [domain]);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(
        ASSISTANT_STORAGE_KEY,
        JSON.stringify({ open: openByDomain, width, paths, chains })
      );
    } catch {
      // A full storage must not break the panel.
    }
  }, [chains, openByDomain, paths, width]);

  const setOpen = useCallback(
    (next: boolean) => setOpenByDomain(previous => ({ ...previous, [domain]: next })),
    [domain]
  );
  const answer = useCallback(
    (optionId: string) => {
      setSuggested(null);
      setPaths(previous => ({
        ...previous,
        [domain]: [...(previous[domain] ?? []), optionId],
      }));
    },
    [domain]
  );
  const back = useCallback(() => {
    setSuggested(null);
    setPaths(previous => ({
      ...previous,
      [domain]: (previous[domain] ?? []).slice(0, -1),
    }));
  }, [domain]);
  const reset = useCallback(() => {
    setSuggested(null);
    setPaths(previous => ({ ...previous, [domain]: [] }));
  }, [domain]);
  const goTo = useCallback(
    (index: number) => {
      setSuggested(null);
      setPaths(previous => ({
        ...previous,
        [domain]: truncatePath(previous[domain] ?? [], index),
      }));
    },
    [domain]
  );
  const suggest = useCallback((leafId: string) => setSuggested(leafId), []);
  const setWidth = useCallback((next: number) => setWidthState(clampWidth(next)), []);
  const addToChain = useCallback(
    (leafId: string, params: ProjectParams) => {
      const result = addChainStep(chains, { id: chainId(leafId), leafId, params });
      if (result.outcome === 'added') setChains(result.chain);
      return result.outcome;
    },
    [chains]
  );
  const removeFromChain = useCallback(
    (id: string) => setChains(previous => removeChainStep(previous, id)),
    []
  );
  const moveFromChain = useCallback(
    (id: string, offset: -1 | 1) =>
      setChains(previous => moveChainStep(previous, id, offset)),
    []
  );
  const clearChain = useCallback(() => setChains([]), []);

  return {
    domain,
    open,
    setOpen,
    width,
    setWidth,
    answers: answersList,
    paths,
    node,
    steps,
    chain: chains,
    addToChain,
    removeFromChain,
    moveFromChain,
    clearChain,
    leaf: currentLeaf,
    dataLeaf: currentDataLeaf,
    answer,
    back,
    reset,
    goTo,
    suggest,
  };
};
