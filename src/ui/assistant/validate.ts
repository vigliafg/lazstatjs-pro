import { ANALYSIS_IDS } from '../../analyses/registry';
import { analysisRoles } from '../../analyses/roles';
import {
  ASSISTANT_ROOTS,
  ASSISTANT_TREE,
  DATA_ACTION_IDS,
  assistantMessageKeys,
  type AssistantDataContract,
  type AssistantNode,
  type AssistantRoleKind,
  type AssistantValueRule,
  type DataLeaf,
} from './tree';

const ROLE_KINDS: readonly AssistantRoleKind[] = [
  'continuous', 'binary', 'categorical', 'group', 'count', 'event', 'ordinal', 'any',
];
const MANUAL_MODES: readonly NonNullable<AssistantDataContract['manual']>[] = ['counts', 'inputs'];
const REQUIRES: readonly NonNullable<DataLeaf['requires']>[] = ['column', 'selection', 'none'];

const COMPLETE_MODES: readonly NonNullable<AssistantDataContract['complete']>[] = ['rows', 'pairs'];
const VALUE_RULES: readonly AssistantValueRule[] = ['binary', 'event01', 'count', 'ordinal', 'groupLevels'];

/**
 * Structural proof of both domains: every edge exists, every node is
 * reachable from its root, there are no cycles, every contract is coherent and
 * every id/role/message is real.
 */
export const validateAssistantTree = (
  tree: Record<string, AssistantNode> = ASSISTANT_TREE,
  hasMessage: (key: string) => boolean = () => true,
  roots: readonly string[] = Object.values(ASSISTANT_ROOTS)
): string[] => {
  const problems: string[] = [];

  for (const rootId of roots) {
    const root = tree[rootId];
    if (!root) {
      problems.push(`missing root ${rootId}`);
      continue;
    }
    if (root.kind !== 'question') problems.push(`${rootId}: root must be a question`);
  }

  const edges = new Map<string, string[]>();
  for (const node of Object.values(tree)) {
    for (const key of assistantMessageKeys(node)) {
      if (!hasMessage(key)) problems.push(`${node.id}: missing message ${key}`);
    }
    if (node.kind === 'question') {
      if (node.options.length < 2) problems.push(`${node.id}: fewer than two options`);
      edges.set(
        node.id,
        node.options
          .filter(option => {
            if (!tree[option.next]) problems.push(`${node.id}/${option.id}: missing next ${option.next}`);
            // Le opzioni di ritorno riportano a una domanda già vista: sono
            // navigazione, non un ciclo da segnalare.
            return !option.back;
          })
          .map(option => option.next)
      );
      continue;
    }
    if (node.domain === 'data') {
      if (!DATA_ACTION_IDS.includes(node.action)) {
        problems.push(`${node.id}: unknown data action ${node.action}`);
      }
      if (node.requires && !REQUIRES.includes(node.requires)) {
        problems.push(`${node.id}: unknown requirement ${node.requires}`);
      }
      continue;
    }
    if (!ANALYSIS_IDS.includes(node.analysisId)) {
      problems.push(`${node.id}: unknown analysis ${node.analysisId}`);
    }
    if (!node.contract) {
      problems.push(`${node.id}: missing data contract`);
      continue;
    }
    if (node.contract.manual) {
      if (!MANUAL_MODES.includes(node.contract.manual)) {
        problems.push(`${node.id}: unknown manual mode ${node.contract.manual}`);
      }
      if (node.contract.roles.length > 0) {
        problems.push(`${node.id}: manual contract cannot declare column roles`);
      }
    } else if (node.contract.roles.length === 0) {
      problems.push(`${node.id}: empty contract without a manual mode`);
    }
    const roles = analysisRoles(node.analysisId);
    for (const hint of node.contract.roles) {
      if (!roles.some(item => item.key === hint.roleKey)) {
        problems.push(`${node.id}: unknown role ${hint.roleKey} for ${node.analysisId}`);
      }
      if (!hint.kind || !ROLE_KINDS.includes(hint.kind)) {
        problems.push(`${node.id}: role ${hint.roleKey} has no valid kind`);
      }
      if (hint.min !== undefined && (!Number.isInteger(hint.min) || hint.min < 1)) {
        problems.push(`${node.id}: role ${hint.roleKey} has invalid min ${hint.min}`);
      }
      if (hint.optional && hint.min !== undefined && hint.min > 0) {
        problems.push(`${node.id}: optional role ${hint.roleKey} cannot have a minimum`);
      }
    }
    if (node.alternative && !ANALYSIS_IDS.includes(node.alternative)) {
      problems.push(`${node.id}: unknown alternative ${node.alternative}`);
    }
    if (node.contract.minRows !== undefined && (!Number.isInteger(node.contract.minRows) || node.contract.minRows < 1)) {
      problems.push(`${node.id}: invalid minRows ${node.contract.minRows}`);
    }
    if (node.contract.complete && !COMPLETE_MODES.includes(node.contract.complete)) {
      problems.push(`${node.id}: unknown complete mode ${node.contract.complete}`);
    }
    for (const value of node.contract.values ?? []) {
      if (!VALUE_RULES.includes(value)) {
        problems.push(`${node.id}: unknown value rule ${value}`);
      }
    }
  }

  const seen = new Set<string>();
  const stack = new Set<string>();
  const visit = (id: string) => {
    if (stack.has(id)) {
      problems.push(`cycle at ${id}`);
      return;
    }
    if (seen.has(id)) return;
    seen.add(id);
    stack.add(id);
    for (const next of edges.get(id) ?? []) if (tree[next]) visit(next);
    stack.delete(id);
  };
  for (const rootId of roots) if (tree[rootId]) visit(rootId);
  for (const id of Object.keys(tree)) {
    if (!seen.has(id)) problems.push(`${id}: unreachable`);
  }
  return Array.from(new Set(problems));
};
