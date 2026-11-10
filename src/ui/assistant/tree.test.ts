import assert from 'node:assert/strict';
import test from 'node:test';
import { CATALOGS } from '../../i18n/catalog';
import { enMessages } from '../../i18n/catalog/en';
import {
  ASSISTANT_ROOT,
  ASSISTANT_ROOTS,
  ASSISTANT_TREE,
  assistantMessageKeys,
} from './tree';
import { validateAssistantTree } from './validate';

test('the Assistant tree is structurally valid', () => {
  const problems = validateAssistantTree(ASSISTANT_TREE, key => key in enMessages);
  assert.deepEqual(problems, []);
});

test('every question and leaf message exists in all six catalogs', () => {
  const keys = new Set<string>();
  for (const node of Object.values(ASSISTANT_TREE)) {
    for (const key of assistantMessageKeys(node)) keys.add(key);
  }
  for (const [locale, catalog] of Object.entries(CATALOGS)) {
    assert.ok(catalog, `${locale} catalog missing`);
    for (const key of keys) {
      assert.ok(catalog[key]?.trim(), `${locale}: missing ${key}`);
    }
  }
});

test('both roots are questions and every leaf is reachable', () => {
  assert.equal(ASSISTANT_TREE[ASSISTANT_ROOTS.analysis]?.kind, 'question');
  assert.equal(ASSISTANT_TREE[ASSISTANT_ROOTS.data]?.kind, 'question');
  const reachable = new Set<string>();
  const visit = (id: string) => {
    const node = ASSISTANT_TREE[id];
    if (!node || reachable.has(id)) return;
    reachable.add(id);
    if (node.kind === 'question') for (const option of node.options) visit(option.next);
  };
  for (const root of Object.values(ASSISTANT_ROOTS)) visit(root);
  const leaves = Object.values(ASSISTANT_TREE).filter(node => node.kind === 'leaf');
  assert.ok(leaves.length >= 15);
  for (const leaf of leaves) assert.ok(reachable.has(leaf.id), `${leaf.id} unreachable`);
});

test('every analysis leaf has a data contract and optional roles are explicit', () => {
  for (const node of Object.values(ASSISTANT_TREE)) {
    if (node.kind !== 'leaf' || node.domain !== 'analysis') continue;
    assert.ok(node.contract, `${node.id}: missing contract`);
    if (node.contract.manual) assert.equal(node.contract.roles.length, 0);
    else assert.ok(node.contract.roles.length > 0, `${node.id}: empty contract`);
    for (const hint of node.contract.roles) {
      assert.ok(hint.kind, `${node.id}/${hint.roleKey}: missing kind`);
      assert.ok((hint.min ?? 1) >= 1, `${node.id}/${hint.roleKey}: invalid min`);
    }
  }
  const distfit = ASSISTANT_TREE.distfit;
  assert.ok(
    distfit && distfit.kind === 'leaf' && distfit.domain === 'analysis' &&
      distfit.contract.roles.some(hint => hint.optional)
  );
});

test('a missing option target is reported instead of throwing', () => {
  const broken = {
    ...ASSISTANT_TREE,
    [ASSISTANT_ROOT]: {
      kind: 'question' as const,
      id: ASSISTANT_ROOT,
      prompt: 'assistant.q.goal' as const,
      help: {
        definition: 'assistant.h.goal.definition' as const,
        example: 'assistant.h.goal.example' as const,
      },
      options: [
        {
          id: 'x',
          label: 'assistant.q.goal.describe' as const,
          help: 'assistant.optionHelp' as const,
          next: 'nowhere',
        },
      ],
    },
  };
  const problems = validateAssistantTree(broken, () => true);
  assert.ok(problems.some(problem => problem.includes('missing next nowhere')));
  assert.ok(problems.some(problem => problem.includes('fewer than two options')));
});
