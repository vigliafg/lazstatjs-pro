import type { MessageKey } from '../../i18n';
import {
  ASSISTANT_ROOTS,
  ASSISTANT_TREE,
  type AssistantDomain,
  type AssistantNode,
  type AssistantOption,
  type AssistantQuestion,
} from './tree';

export type FlowNodeState = 'answered' | 'current' | 'available';

export interface FlowNode {
  /** Unique per depth: the same tree node cannot appear twice in one layout. */
  key: string;
  id: string;
  kind: 'question' | 'leaf';
  analysisId?: string;
  prompt?: MessageKey;
  /** Answers that lead here: clicking an answered node truncates the path here. */
  depth: number;
  row: number;
  state: FlowNodeState;
  /** Option that leads here; only available nodes carry it. */
  optionId?: string;
  optionLabel?: MessageKey;
}

export interface FlowEdge {
  from: string;
  to: string;
  state: 'path' | 'available';
}

export interface FlowLayout {
  nodes: FlowNode[];
  edges: FlowEdge[];
  columns: number;
  rows: number;
}

interface PathStep {
  question: AssistantQuestion;
  option: AssistantOption;
  target: AssistantNode;
}

/**
 * Progressive layout of the Assistant tree.
 *
 * Left to right: one column per answer depth. The layout keeps the answered
 * path, the current node and the options of the current question — not the
 * whole tree, which would be unreadable in a 200px column.
 *
 * `back` options are returns to a previous question, not new branches, so they
 * stay out of the graph; the breadcrumb and the Back button cover them.
 */
export const buildFlow = (domain: AssistantDomain, answers: readonly string[]): FlowLayout => {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

  const addNode = (
    node: AssistantNode,
    depth: number,
    state: FlowNodeState,
    extra: { optionId?: string; optionLabel?: MessageKey } = {}
  ): FlowNode => {
    const key = `${depth}:${node.id}`;
    const existing = nodes.find(item => item.key === key);
    if (existing) return existing;
    const row = nodes.filter(item => item.depth === depth).length;
    const next: FlowNode = {
      key,
      id: node.id,
      kind: node.kind,
      depth,
      row,
      state,
      ...(node.kind === 'question'
        ? { prompt: node.prompt }
        : node.kind === 'leaf' && 'analysisId' in node
          ? { analysisId: node.analysisId }
          : {}),
      ...extra,
    };
    nodes.push(next);
    return next;
  };

  const addEdge = (from: string, to: string, state: FlowEdge['state']): void => {
    if (edges.some(edge => edge.from === from && edge.to === to)) return;
    edges.push({ from, to, state });
  };

  let node: AssistantNode | undefined = ASSISTANT_TREE[ASSISTANT_ROOTS[domain]];
  const path: PathStep[] = [];
  for (const optionId of answers) {
    if (!node || node.kind !== 'question') break;
    const option = node.options.find(item => item.id === optionId);
    if (!option) break;
    const target = ASSISTANT_TREE[option.next];
    if (!target) break;
    path.push({ question: node, option, target });
    node = target;
  }

  if (path.length === 0) {
    if (node) addNode(node, 0, 'current');
  } else {
    path.forEach((step, index) => {
      const question = addNode(step.question, index, 'answered');
      const target = addNode(
        step.target,
        index + 1,
        index === path.length - 1 ? 'current' : 'answered'
      );
      addEdge(question.key, target.key, 'path');
    });
  }

  if (node?.kind === 'question') {
    const current = addNode(node, path.length, 'current');
    node.options
      .filter(option => !option.back)
      .forEach(option => {
        const target = ASSISTANT_TREE[option.next];
        if (!target) return;
        const next = addNode(target, path.length + 1, 'available', {
          optionId: option.id,
          optionLabel: option.label,
        });
        addEdge(current.key, next.key, 'available');
      });
  }

  const columns = nodes.reduce((max, item) => Math.max(max, item.depth + 1), 0);
  const rows = nodes.reduce((max, item) => Math.max(max, item.row + 1), 0);
  return { nodes, edges, columns, rows };
};
