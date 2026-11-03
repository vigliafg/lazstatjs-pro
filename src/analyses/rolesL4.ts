import type { ProjectParams } from '../io/project';

/** Same shape as `AnalysisRole`; kept local to avoid a roles↔rolesL4 cycle. */
interface L4Role {
  key: string;
  label: string;
  kind: 'continuous' | 'group' | 'any';
  get: (params: ProjectParams) => number[];
  set: (params: ProjectParams, column: number) => ProjectParams;
}

const append = (values: readonly number[], column: number): number[] =>
  Array.from(new Set([...values, column]));

/** Column roles of the L4 procedures, merged into the main roles registry. */
export const L4_ROLES: Record<string, L4Role[]> = {
  partition: [
    {
      key: 'response',
      label: 'Partition: response',
      kind: 'continuous',
      get: p => [p.partition.response],
      set: (p, c) => ({ ...p, partition: { ...p.partition, response: c } }),
    },
    {
      key: 'predictors',
      label: 'Partition: predictors',
      kind: 'continuous',
      get: p => p.partition.predictors,
      set: (p, c) => ({
        ...p,
        partition: { ...p.partition, predictors: append(p.partition.predictors, c) },
      }),
    },
  ],
  quality: [
    {
      key: 'variable',
      label: 'Quality: variable',
      kind: 'continuous',
      get: p => [p.quality.variable],
      set: (p, c) => ({ ...p, quality: { ...p.quality, variable: c } }),
    },
    {
      key: 'category',
      label: 'Quality: category',
      kind: 'any',
      get: p => [p.quality.category],
      set: (p, c) => ({ ...p, quality: { ...p.quality, category: c } }),
    },
    {
      key: 'group',
      label: 'Quality: group',
      kind: 'group',
      get: p => [p.quality.group],
      set: (p, c) => ({ ...p, quality: { ...p.quality, group: c } }),
    },
    {
      key: 'part',
      label: 'MSA: part',
      kind: 'any',
      get: p => [p.quality.part],
      set: (p, c) => ({ ...p, quality: { ...p.quality, part: c } }),
    },
    {
      key: 'operator',
      label: 'MSA: operator',
      kind: 'any',
      get: p => [p.quality.operator],
      set: (p, c) => ({ ...p, quality: { ...p.quality, operator: c } }),
    },
    {
      key: 'variables',
      label: 'Multivariate control: variables',
      kind: 'continuous',
      get: p => p.quality.variables,
      set: (p, c) => ({
        ...p,
        quality: { ...p.quality, variables: append(p.quality.variables, c) },
      }),
    },
  ],
  cluster: [
    {
      key: 'variables',
      label: 'Cluster: variables',
      kind: 'continuous',
      get: p => p.cluster.selected,
      set: (p, c) => ({
        ...p,
        cluster: { ...p.cluster, selected: append(p.cluster.selected, c) },
      }),
    },
  ],
  discriminant: [
    {
      key: 'group',
      label: 'Discriminant: group',
      kind: 'group',
      get: p => [p.discriminant.group],
      set: (p, c) => ({ ...p, discriminant: { ...p.discriminant, group: c } }),
    },
    {
      key: 'predictors',
      label: 'Discriminant: predictors',
      kind: 'continuous',
      get: p => p.discriminant.predictors,
      set: (p, c) => ({
        ...p,
        discriminant: {
          ...p.discriminant,
          predictors: append(p.discriminant.predictors, c),
        },
      }),
    },
  ],
  doe: [
    {
      key: 'response',
      label: 'DOE: response',
      kind: 'continuous',
      get: p => [p.doe.response],
      set: (p, c) => ({ ...p, doe: { ...p.doe, response: c } }),
    },
    {
      key: 'factorA',
      label: 'DOE: factor A',
      kind: 'continuous',
      get: p => [p.doe.factorA],
      set: (p, c) => ({ ...p, doe: { ...p.doe, factorA: c } }),
    },
    {
      key: 'factorB',
      label: 'DOE: factor B',
      kind: 'continuous',
      get: p => [p.doe.factorB],
      set: (p, c) => ({ ...p, doe: { ...p.doe, factorB: c } }),
    },
  ],
};
