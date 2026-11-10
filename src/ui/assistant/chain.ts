import type { GridData } from '../../grid/types';
import type { ProjectParams } from '../../io/project';
import { validateLeafReadiness } from './readiness';
import { assistantLeaf, type AssistantLeaf } from './tree';

/** A chain is a short, ordered list of leaves to run one after another. */
export const CHAIN_LIMIT = 8;

export interface AssistantChainStep {
  id: string;
  leafId: string;
  /** Parameters frozen when the step was added, so later edits do not move it. */
  params: ProjectParams;
}

export type ChainAddOutcome = 'added' | 'duplicate' | 'full';

/** A step that passed preflight, with the parameters it will run. */
export interface ChainRunStep {
  step: AssistantChainStep;
  leaf: AssistantLeaf;
  params: ProjectParams;
}

export type ChainPreflight =
  | { ok: true; runs: ChainRunStep[] }
  | { ok: false; index: number };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Stable JSON: key order does not turn two identical snapshots into a duplicate miss. */
const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stable(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
};

/**
 * Identity of a step: the same leaf with the same parameters is a duplicate,
 * while the same procedure with different columns is a different step.
 */
export const chainSignature = (
  step: Pick<AssistantChainStep, 'leafId' | 'params'>
): string => `${step.leafId}:${stable(step.params)}`;

/** Validate a chain coming from storage or the project file. */
export const parseChain = (value: unknown): AssistantChainStep[] => {
  if (!Array.isArray(value)) return [];
  const steps: AssistantChainStep[] = [];
  const seen = new Set<string>();
  for (const raw of value) {
    if (steps.length >= CHAIN_LIMIT) break;
    if (!isRecord(raw)) continue;
    const leafId = typeof raw.leafId === 'string' ? raw.leafId : '';
    if (!assistantLeaf(leafId) || !isRecord(raw.params)) continue;
    const id =
      typeof raw.id === 'string' && raw.id.length > 0
        ? raw.id.slice(0, 64)
        : `chain-${steps.length + 1}`;
    const step: AssistantChainStep = {
      id,
      leafId,
      params: raw.params as unknown as ProjectParams,
    };
    const key = chainSignature(step);
    if (seen.has(key)) continue;
    seen.add(key);
    steps.push(step);
  }
  return steps;
};

export const addChainStep = (
  chain: readonly AssistantChainStep[],
  step: AssistantChainStep
): { chain: AssistantChainStep[]; outcome: ChainAddOutcome } => {
  if (chain.length >= CHAIN_LIMIT) return { chain: [...chain], outcome: 'full' };
  const key = chainSignature(step);
  if (chain.some(item => chainSignature(item) === key)) {
    return { chain: [...chain], outcome: 'duplicate' };
  }
  return { chain: [...chain, step], outcome: 'added' };
};

export const removeChainStep = (
  chain: readonly AssistantChainStep[],
  id: string
): AssistantChainStep[] => chain.filter(step => step.id !== id);

/** Swap a step with its neighbour; edges are no-ops. */
export const moveChainStep = (
  chain: readonly AssistantChainStep[],
  id: string,
  offset: -1 | 1
): AssistantChainStep[] => {
  const from = chain.findIndex(step => step.id === id);
  const to = from + offset;
  if (from < 0 || to < 0 || to >= chain.length) return [...chain];
  const next = [...chain];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
};

/**
 * Checks every step against the current grid before the first run: a missing
 * role or a type mismatch must stop the chain before it produces partial cards.
 */
export const chainPreflight = (
  chain: readonly AssistantChainStep[],
  grid: GridData
): ChainPreflight => {
  const runs: ChainRunStep[] = [];
  for (let index = 0; index < chain.length; index += 1) {
    const step = chain[index];
    const leaf = assistantLeaf(step.leafId);
    if (!leaf) return { ok: false, index };
    const readiness = validateLeafReadiness(leaf, step.params, grid);
    if (!readiness.canRun) return { ok: false, index };
    runs.push({ step, leaf, params: readiness.params });
  }
  return { ok: true, runs };
};
