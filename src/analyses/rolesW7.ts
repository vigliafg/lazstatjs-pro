import type { ProjectParams } from '../io/project';

interface W7Role {
  key: string;
  label: string;
  kind: 'continuous' | 'group' | 'any';
  get: (params: ProjectParams) => number[];
  set: (params: ProjectParams, column: number) => ProjectParams;
}

const append = (values: readonly number[], column: number): number[] =>
  Array.from(new Set([...values, column]));

/** Column roles of the wave-7 time-series procedures. */
export const W7_ROLES: Record<string, W7Role[]> = {
  var: [
    {
      key: 'variables',
      label: 'VAR: variables',
      kind: 'continuous',
      get: p => p.var.variables,
      set: (p, c) => ({ ...p, var: { ...p.var, variables: append(p.var.variables, c) } }),
    },
  ],
  garch: [
    {
      key: 'variable',
      label: 'GARCH: series',
      kind: 'continuous',
      get: p => [p.garch.variable],
      set: (p, c) => ({ ...p, garch: { ...p.garch, variable: c } }),
    },
  ],
  statespace: [
    {
      key: 'variable',
      label: 'State-space: series',
      kind: 'continuous',
      get: p => [p.statespace.variable],
      set: (p, c) => ({ ...p, statespace: { ...p.statespace, variable: c } }),
    },
  ],
};
