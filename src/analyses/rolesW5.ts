import type { ProjectParams } from '../io/project';

interface W5Role {
  key: string;
  label: string;
  kind: 'continuous' | 'group' | 'any';
  get: (params: ProjectParams) => number[];
  set: (params: ProjectParams, column: number) => ProjectParams;
}

const append = (values: readonly number[], column: number): number[] =>
  Array.from(new Set([...values, column]));

/** Column roles of the wave-5 multivariate procedures. */
export const W5_ROLES: Record<string, W5Role[]> = {
  canonical: [
    {
      key: 'x',
      label: 'Canonical: X variables',
      kind: 'continuous',
      get: p => p.canonical.x,
      set: (p, c) => ({
        ...p,
        canonical: {
          x: append(p.canonical.x, c),
          y: p.canonical.y.filter(value => value !== c),
        },
      }),
    },
    {
      key: 'y',
      label: 'Canonical: Y variables',
      kind: 'continuous',
      get: p => p.canonical.y,
      set: (p, c) => ({
        ...p,
        canonical: {
          x: p.canonical.x.filter(value => value !== c),
          y: append(p.canonical.y, c),
        },
      }),
    },
  ],
  mds: [
    {
      key: 'selected',
      label: 'MDS: variables',
      kind: 'continuous',
      get: p => p.mds.selected,
      set: (p, c) => ({ ...p, mds: { ...p.mds, selected: append(p.mds.selected, c) } }),
    },
  ],
  sem: [
    {
      key: 'selected',
      label: 'SEM: indicators',
      kind: 'continuous',
      get: p => p.sem.selected,
      set: (p, c) => ({
        ...p,
        sem: {
          ...p.sem,
          selected: append(p.sem.selected, c),
          groups: append(p.sem.selected, c).map((_, index) => p.sem.groups[index] ?? 0),
        },
      }),
    },
  ],
  latentclass: [
    {
      key: 'selected',
      label: 'Latent class: indicators',
      kind: 'group',
      get: p => p.latentclass.selected,
      set: (p, c) => ({
        ...p,
        latentclass: {
          ...p.latentclass,
          selected: append(p.latentclass.selected, c),
        },
      }),
    },
  ],
  irt: [
    {
      key: 'selected',
      label: 'IRT: items',
      kind: 'group',
      get: p => p.irt.selected,
      set: (p, c) => ({ ...p, irt: { ...p.irt, selected: append(p.irt.selected, c) } }),
    },
  ],
  conjoint: [
    {
      key: 'attributes',
      label: 'Conjoint: attributes',
      kind: 'group',
      get: p => p.conjoint.attributes,
      set: (p, c) => ({
        ...p,
        conjoint: {
          ...p.conjoint,
          attributes: append(p.conjoint.attributes, c).filter(value => value !== p.conjoint.response),
        },
      }),
    },
    {
      key: 'response',
      label: 'Conjoint: rating',
      kind: 'continuous',
      get: p => [p.conjoint.response],
      set: (p, c) => ({
        ...p,
        conjoint: {
          ...p.conjoint,
          response: c,
          attributes: p.conjoint.attributes.filter(value => value !== c),
        },
      }),
    },
  ],
};
