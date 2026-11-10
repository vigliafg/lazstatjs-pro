import type { MessageKey } from '../../i18n';
import { DATA_TREE, type DataActionId, type DataLeaf } from './data';

export { DATA_ACTION_IDS } from './data';
export type { DataActionId, DataLeaf } from './data';

/**
 * Decision tree of the Assistant.
 *
 * The tree is plain data: the panel renders it, the validator proves that every
 * edge and every leaf points at a real procedure, role and message, and the
 * apply bridge turns a leaf into prefilled parameters. Questions carry the
 * definition/example pair Minitab shows under "Help me choose".
 */

export type AssistantDomain = 'data' | 'analysis';
export type AssistantRoleSource = 'outcome' | 'group' | 'second';
export type AssistantRoleKind =
  | 'continuous'
  | 'binary'
  | 'categorical'
  | 'group'
  | 'count'
  | 'event'
  | 'ordinal'
  | 'any';
export type AssistantValueRule = 'binary' | 'event01' | 'count' | 'ordinal' | 'groupLevels';

export interface AssistantRoleHint {
  /** Role key of the target analysis (`analysisRoles`). */
  roleKey: string;
  /** Heuristic used to preselect a column from the current data. */
  from: AssistantRoleSource;
  /** Tipo atteso dalla foglia; obbligatorio nei contratti, opzionale nei nodi legacy. */
  kind?: AssistantRoleKind;
  /** Colonne minime per questo ruolo (default 1; 2 per correlazione/accordo). */
  min?: number;
  /** Se vero, l'assenza non blocca: il ruolo resta facoltativo. */
  optional?: boolean;
}

export interface AssistantDataContract {
  /** Ruoli colonna; vuoto solo con `manual` esplicito. */
  roles: readonly AssistantRoleHint[];
  /** Righe minime per un run sensato (default 1). */
  minRows?: number;
  /** Completezza richiesta: righe intere o coppie appaiate. */
  complete?: 'rows' | 'pairs';
  /** Regole sui valori, oltre al tipo della colonna. */
  values?: readonly AssistantValueRule[];
  /** Nessuna colonna: conteggi o input manuali. */
  manual?: 'counts' | 'inputs';
}

export interface AssistantOptionInput {
  id: string;
  label: MessageKey;
  /** Una frase: quando scegliere questa risposta. */
  help?: MessageKey;
  /** Id of the next question or leaf. */
  next: string;
  /** Ritorno a una domanda già vista: non è un ciclo dell'albero. */
  back?: boolean;
}

export interface AssistantOption extends AssistantOptionInput {
  help: MessageKey;
}

export interface AssistantQuestionInput {
  kind: 'question';
  id: string;
  prompt: MessageKey;
  help?: { definition: MessageKey; example: MessageKey };
  options: readonly AssistantOptionInput[];
}

export interface AssistantQuestion extends Omit<AssistantQuestionInput, 'options'> {
  help: { definition: MessageKey; example: MessageKey };
  options: readonly AssistantOption[];
}

export interface AssistantLeafInput {
  kind: 'leaf';
  id: string;
  analysisId: string;
  variant?: MessageKey;
  roles: readonly AssistantRoleHint[];
  checks: readonly MessageKey[];
  preset?: { ttest?: 'ind' | 'dep'; anova?: 'oneway'; variances?: 'two'; proportions?: 'twoProp' };
  alternative?: string;
}

export interface ProcedureLeaf {
  kind: 'leaf';
  domain: 'analysis';
  id: string;
  analysisId: string;
  /** Short variant label when one analysis covers two designs. */
  variant?: MessageKey;
  /** Obbligatorio per ogni foglia, anche per le tabelle manuali. */
  contract: AssistantDataContract;
  /** What the Report Card will look at for this procedure. */
  checks: readonly MessageKey[];
  help: MessageKey;
  /** Parameters the Assistant preselects for this variant. */
  preset?: { ttest?: 'ind' | 'dep'; anova?: 'oneway'; variances?: 'two'; proportions?: 'twoProp' };
  /** Procedure to mention when the assumptions are not met. */
  alternative?: string;
}

export type AssistantLeaf = ProcedureLeaf;
export type AssistantNode = AssistantQuestion | ProcedureLeaf | DataLeaf;

export const ASSISTANT_ROOTS = { data: 'd1', analysis: 'a1' } as const;
export const ASSISTANT_ROOT = ASSISTANT_ROOTS.analysis;

/** Nodi scritti a mano: il contratto e l'aiuto vengono normalizzati sotto. */
type AssistantTreeInput = Record<string, AssistantQuestionInput | AssistantLeafInput | DataLeaf>;

const BASE_TREE: AssistantTreeInput = {
  a1: {
    kind: 'question',
    id: 'a1',
    prompt: 'assistant.q.goal',
    help: { definition: 'assistant.h.goal.definition', example: 'assistant.h.goal.example' },
    options: [
      { id: 'describe', label: 'assistant.q.goal.describe', next: 'describe' },
      { id: 'compare', label: 'assistant.q.goal.compare', next: 'compare' },
      { id: 'associate', label: 'assistant.q.goal.associate', next: 'associate' },
      { id: 'predict', label: 'assistant.q.goal.predict', next: 'predict' },
      { id: 'time', label: 'assistant.q.goal.time', next: 'time' },
      { id: 'plan', label: 'assistant.q.goal.plan', next: 'samplesize' },
      { id: 'missing', label: 'assistant.q.goal.missing', next: 'mi' },
    ],
  },
  describe: {
    kind: 'question',
    id: 'describe',
    prompt: 'assistant.q.describe',
    help: { definition: 'assistant.h.describe.definition', example: 'assistant.h.describe.example' },
    options: [
      { id: 'summary', label: 'assistant.q.describe.summary', next: 'descriptive' },
      { id: 'distribution', label: 'assistant.q.describe.distribution', next: 'distfit' },
    ],
  },
  compare: {
    kind: 'question',
    id: 'compare',
    prompt: 'assistant.q.compare',
    help: { definition: 'assistant.h.compare.definition', example: 'assistant.h.compare.example' },
    options: [
      { id: 'means', label: 'assistant.q.compare.means', next: 'means' },
      { id: 'spread', label: 'assistant.q.compare.spread', next: 'variances' },
      { id: 'shares', label: 'assistant.q.compare.shares', next: 'proportions' },
    ],
  },
  means: {
    kind: 'question',
    id: 'means',
    prompt: 'assistant.q.means',
    help: { definition: 'assistant.h.means.definition', example: 'assistant.h.means.example' },
    options: [
      { id: 'independent', label: 'assistant.q.means.independent', next: 'format' },
      { id: 'paired', label: 'assistant.q.means.paired', next: 'ttest-paired' },
      { id: 'many', label: 'assistant.q.means.many', next: 'anova' },
    ],
  },
  format: {
    kind: 'question',
    id: 'format',
    prompt: 'assistant.q.format',
    help: { definition: 'assistant.h.format.definition', example: 'assistant.h.format.example' },
    options: [
      { id: 'wide', label: 'assistant.q.format.wide', next: 'ttest-ind' },
      { id: 'long', label: 'assistant.q.format.long', next: 'anova' },
    ],
  },
  associate: {
    kind: 'question',
    id: 'associate',
    prompt: 'assistant.q.associate',
    help: { definition: 'assistant.h.associate.definition', example: 'assistant.h.associate.example' },
    options: [
      { id: 'numeric', label: 'assistant.q.associate.numeric', next: 'correlation' },
      { id: 'categorical', label: 'assistant.q.associate.categorical', next: 'table' },
      { id: 'agreement', label: 'assistant.q.associate.agreement', next: 'agreement' },
    ],
  },
  table: {
    kind: 'question',
    id: 'table',
    prompt: 'assistant.q.table',
    help: { definition: 'assistant.h.table.definition', example: 'assistant.h.table.example' },
    options: [
      { id: 'two', label: 'assistant.q.table.two', next: 'chisquare' },
      { id: 'larger', label: 'assistant.q.table.larger', next: 'contingency' },
    ],
  },
  predict: {
    kind: 'question',
    id: 'predict',
    prompt: 'assistant.q.predict',
    help: { definition: 'assistant.h.predict.definition', example: 'assistant.h.predict.example' },
    options: [
      { id: 'continuous', label: 'assistant.q.predict.continuous', next: 'regression' },
      { id: 'binary', label: 'assistant.q.predict.binary', next: 'logistic' },
      { id: 'counts', label: 'assistant.q.predict.counts', next: 'countreg' },
      { id: 'ordered', label: 'assistant.q.predict.ordered', next: 'ordinal' },
    ],
  },
  time: {
    kind: 'question',
    id: 'time',
    prompt: 'assistant.q.time',
    help: { definition: 'assistant.h.time.definition', example: 'assistant.h.time.example' },
    options: [
      { id: 'series', label: 'assistant.q.time.series', next: 'timeseries' },
      { id: 'survival', label: 'assistant.q.time.survival', next: 'survival-kind' },
    ],
  },
  'survival-kind': {
    kind: 'question',
    id: 'survival-kind',
    prompt: 'assistant.q.survival',
    help: { definition: 'assistant.h.survival.definition', example: 'assistant.h.survival.example' },
    options: [
      { id: 'describe', label: 'assistant.q.survival.describe', next: 'survival' },
      { id: 'covariates', label: 'assistant.q.survival.covariates', next: 'cox' },
    ],
  },

  descriptive: {
    kind: 'leaf',
    id: 'descriptive',
    analysisId: 'descriptive',
    roles: [{ roleKey: 'vars', from: 'outcome' }],
    checks: ['assistant.checks.descriptive'],
  },
  distfit: {
    kind: 'leaf',
    id: 'distfit',
    analysisId: 'distfit',
    roles: [{ roleKey: 'variable', from: 'outcome' }],
    checks: ['assistant.checks.descriptive'],
  },
  variances: {
    kind: 'leaf',
    id: 'variances',
    analysisId: 'variances',
    roles: [
      { roleKey: 'variable', from: 'outcome' },
      { roleKey: 'group', from: 'group' },
    ],
    checks: ['assistant.checks.means'],
  },
  proportions: {
    kind: 'leaf',
    id: 'proportions',
    analysisId: 'proportions',
    roles: [
      { roleKey: 'variable', from: 'outcome' },
      { roleKey: 'group', from: 'group' },
    ],
    checks: ['assistant.checks.categorical'],
  },
  'ttest-ind': {
    kind: 'leaf',
    id: 'ttest-ind',
    analysisId: 'ttest',
    variant: 'assistant.leaf.ttest.ind',
    roles: [
      { roleKey: 'var1', from: 'outcome' },
      { roleKey: 'var2', from: 'second' },
    ],
    checks: ['assistant.checks.means'],
    preset: { ttest: 'ind' },
    alternative: 'anova',
  },
  'ttest-paired': {
    kind: 'leaf',
    id: 'ttest-paired',
    analysisId: 'ttest',
    variant: 'assistant.leaf.ttest.paired',
    roles: [
      { roleKey: 'var1', from: 'outcome' },
      { roleKey: 'var2', from: 'second' },
    ],
    checks: ['assistant.checks.means'],
    preset: { ttest: 'dep' },
  },
  anova: {
    kind: 'leaf',
    id: 'anova',
    analysisId: 'anova',
    roles: [
      { roleKey: 'dep', from: 'outcome' },
      { roleKey: 'grp', from: 'group' },
    ],
    checks: ['assistant.checks.means'],
    preset: { anova: 'oneway' },
    alternative: 'nonparamrm',
  },
  correlation: {
    kind: 'leaf',
    id: 'correlation',
    analysisId: 'correlation',
    roles: [{ roleKey: 'vars', from: 'outcome' }],
    checks: ['assistant.checks.correlation'],
  },
  chisquare: {
    kind: 'leaf',
    id: 'chisquare',
    analysisId: 'chisquare',
    roles: [],
    checks: ['assistant.checks.categorical'],
  },
  contingency: {
    kind: 'leaf',
    id: 'contingency',
    analysisId: 'contingency',
    roles: [],
    checks: ['assistant.checks.categorical'],
  },
  agreement: {
    kind: 'leaf',
    id: 'agreement',
    analysisId: 'agreement',
    roles: [{ roleKey: 'columns', from: 'outcome' }],
    checks: ['assistant.checks.categorical'],
  },
  regression: {
    kind: 'leaf',
    id: 'regression',
    analysisId: 'regression',
    roles: [
      { roleKey: 'dep', from: 'outcome' },
      { roleKey: 'indeps', from: 'second' },
    ],
    checks: ['assistant.checks.regression'],
  },
  logistic: {
    kind: 'leaf',
    id: 'logistic',
    analysisId: 'logistic',
    roles: [
      { roleKey: 'outcome', from: 'outcome' },
      { roleKey: 'predictors', from: 'second' },
    ],
    checks: ['assistant.checks.regression'],
  },
  countreg: {
    kind: 'leaf',
    id: 'countreg',
    analysisId: 'countreg',
    roles: [
      { roleKey: 'dep', from: 'outcome' },
      { roleKey: 'indeps', from: 'second' },
    ],
    checks: ['assistant.checks.regression'],
  },
  ordinal: {
    kind: 'leaf',
    id: 'ordinal',
    analysisId: 'ordinal',
    roles: [
      { roleKey: 'dep', from: 'outcome' },
      { roleKey: 'indeps', from: 'second' },
    ],
    checks: ['assistant.checks.regression'],
  },
  timeseries: {
    kind: 'leaf',
    id: 'timeseries',
    analysisId: 'timeseries',
    roles: [{ roleKey: 'variable', from: 'outcome' }],
    checks: ['assistant.checks.timeseries'],
  },
  survival: {
    kind: 'leaf',
    id: 'survival',
    analysisId: 'survival',
    roles: [
      { roleKey: 'time', from: 'outcome' },
      { roleKey: 'event', from: 'group' },
    ],
    checks: ['assistant.checks.survival'],
  },
  cox: {
    kind: 'leaf',
    id: 'cox',
    analysisId: 'cox',
    roles: [
      { roleKey: 'time', from: 'outcome' },
      { roleKey: 'event', from: 'group' },
      { roleKey: 'covariates', from: 'second' },
    ],
    checks: ['assistant.checks.survival'],
  },
  samplesize: {
    kind: 'leaf',
    id: 'samplesize',
    analysisId: 'samplesize',
    roles: [],
    checks: ['assistant.checks.samplesize'],
  },
  mi: {
    kind: 'leaf',
    id: 'mi',
    analysisId: 'mi',
    roles: [{ roleKey: 'variables', from: 'outcome' }],
    checks: ['assistant.checks.missing'],
  },

  // Dominio dati completo: albero, diagnosi e azioni vivono in `data.ts`.
  ...DATA_TREE,
};

const role = (
  roleKey: string,
  from: AssistantRoleSource,
  kind: AssistantRoleKind,
  extra: Partial<AssistantRoleHint> = {}
): AssistantRoleHint => ({ roleKey, from, kind, ...extra });

const contract = (
  roles: readonly AssistantRoleHint[],
  extra: Omit<AssistantDataContract, 'roles'> = {}
): AssistantDataContract => ({ roles, ...extra });

/** Contratti delle 20 foglie di analisi, obbligatori anche per le tabelle manuali. */
const LEAF_CONTRACTS: Record<string, AssistantDataContract> = {
  descriptive: contract([role('vars', 'outcome', 'continuous')]),
  distfit: contract([
    role('variable', 'outcome', 'continuous'),
    role('group', 'group', 'group', { optional: true }),
  ]),
  variances: contract([
    role('variable', 'outcome', 'continuous'),
    role('group', 'group', 'group'),
  ]),
  proportions: contract([
    role('variable', 'outcome', 'binary'),
    role('group', 'group', 'group'),
  ], { values: ['binary'] }),
  'ttest-ind': contract([
    role('var1', 'outcome', 'continuous'),
    role('var2', 'second', 'continuous'),
  ]),
  'ttest-paired': contract([
    role('var1', 'outcome', 'continuous'),
    role('var2', 'second', 'continuous'),
  ], { complete: 'pairs', minRows: 2 }),
  anova: contract([
    role('dep', 'outcome', 'continuous'),
    role('grp', 'group', 'group'),
  ]),
  correlation: contract([role('vars', 'outcome', 'continuous', { min: 2 })]),
  chisquare: contract([], { manual: 'counts' }),
  contingency: contract([], { manual: 'counts' }),
  agreement: contract([role('columns', 'outcome', 'continuous', { min: 2 })]),
  regression: contract([
    role('dep', 'outcome', 'continuous'),
    role('indeps', 'second', 'continuous'),
  ]),
  logistic: contract([
    role('outcome', 'outcome', 'binary'),
    role('predictors', 'second', 'any'),
  ], { values: ['binary'] }),
  countreg: contract([
    role('dep', 'outcome', 'count'),
    role('indeps', 'second', 'any'),
  ], { values: ['count'] }),
  ordinal: contract([
    role('dep', 'outcome', 'ordinal'),
    role('indeps', 'second', 'any'),
  ], { values: ['ordinal'] }),
  timeseries: contract([role('variable', 'outcome', 'continuous')]),
  survival: contract([
    role('time', 'outcome', 'continuous'),
    role('event', 'group', 'event'),
    role('group', 'group', 'group', { optional: true }),
  ], { values: ['event01'] }),
  cox: contract([
    role('time', 'outcome', 'continuous'),
    role('event', 'group', 'event'),
    role('covariates', 'second', 'any'),
  ], { values: ['event01'] }),
  samplesize: contract([], { manual: 'inputs' }),
  mi: contract([
    role('variables', 'outcome', 'any'),
    role('outcome', 'outcome', 'any'),
  ]),
};

const normalized = (node: AssistantQuestionInput | AssistantLeafInput | DataLeaf): AssistantNode => {
  if (node.kind === 'question') {
    return {
      ...node,
      help: node.help ?? { definition: 'assistant.h.goal.definition', example: 'assistant.h.goal.example' },
      options: node.options.map(option => ({ ...option, help: option.help ?? 'assistant.optionHelp' })),
    };
  }
  if ('analysisId' in node) {
    const { roles, ...rest } = node;
    return {
      ...rest,
      domain: 'analysis',
      contract: LEAF_CONTRACTS[node.id] ?? contract(roles),
      help: 'assistant.leafHelp',
    };
  }
  return node;
};

export const ASSISTANT_TREE: Record<string, AssistantNode> = Object.fromEntries(
  Object.entries(BASE_TREE).map(([id, node]) => [id, normalized(node)])
);

/** Leaf that represents an analysis when the tree offers more than one variant. */
export const ASSISTANT_LEAF_BY_ANALYSIS: Record<string, string> = {
  descriptive: 'descriptive',
  distfit: 'distfit',
  variances: 'variances',
  proportions: 'proportions',
  ttest: 'ttest-ind',
  anova: 'anova',
  nonparamrm: 'anova',
  correlation: 'correlation',
  chisquare: 'chisquare',
  contingency: 'contingency',
  agreement: 'agreement',
  regression: 'regression',
  glm: 'regression',
  logistic: 'logistic',
  countreg: 'countreg',
  ordinal: 'ordinal',
  timeseries: 'timeseries',
  survival: 'survival',
  cox: 'cox',
  samplesize: 'samplesize',
  mi: 'mi',
};

export const assistantLeaf = (id: string | null | undefined): AssistantLeaf | null => {
  if (!id) return null;
  const node = ASSISTANT_TREE[id];
  return node && node.kind === 'leaf' && node.domain === 'analysis' ? node : null;
};

export const dataLeaf = (id: string | null | undefined): DataLeaf | null => {
  if (!id) return null;
  const node = ASSISTANT_TREE[id];
  return node && node.kind === 'leaf' && node.domain === 'data' ? node : null;
};

export const assistantMessageKeys = (node: AssistantNode): MessageKey[] => {
  if (node.kind === 'leaf') {
    if (node.domain === 'data') return [node.help, ...node.checks];
    return [node.help, ...node.checks, ...(node.variant ? [node.variant] : [])];
  }
  return [
    node.prompt,
    node.help.definition,
    node.help.example,
    ...node.options.flatMap(option => [option.label, option.help]),
  ];
};


