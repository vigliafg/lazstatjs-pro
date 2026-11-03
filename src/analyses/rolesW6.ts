import type { ProjectParams } from '../io/project';

interface W6Role {
  key: string;
  label: string;
  kind: 'continuous' | 'group' | 'any';
  get: (params: ProjectParams) => number[];
  set: (params: ProjectParams, column: number) => ProjectParams;
}

const append = (values: readonly number[], column: number): number[] =>
  Array.from(new Set([...values, column]));

/** Column roles of the wave-6 survival and reliability procedures. */
export const W6_ROLES: Record<string, W6Role[]> = {
  competing: [
    {
      key: 'time',
      label: 'Competing risks: time',
      kind: 'any',
      get: p => [p.competing.time],
      set: (p, c) => ({ ...p, competing: { ...p.competing, time: c } }),
    },
    {
      key: 'event',
      label: 'Competing risks: event',
      kind: 'any',
      get: p => [p.competing.event],
      set: (p, c) => ({ ...p, competing: { ...p.competing, event: c } }),
    },
    {
      key: 'covariates',
      label: 'Competing risks: covariates',
      kind: 'continuous',
      get: p => p.competing.covariates,
      set: (p, c) => ({
        ...p,
        competing: { ...p.competing, covariates: append(p.competing.covariates, c) },
      }),
    },
  ],
  recurrent: [
    {
      key: 'id',
      label: 'Recurrent events: subject',
      kind: 'any',
      get: p => [p.recurrent.id],
      set: (p, c) => ({ ...p, recurrent: { ...p.recurrent, id: c } }),
    },
    {
      key: 'start',
      label: 'Recurrent events: start',
      kind: 'any',
      get: p => [p.recurrent.start],
      set: (p, c) => ({ ...p, recurrent: { ...p.recurrent, start: c } }),
    },
    {
      key: 'stop',
      label: 'Recurrent events: stop',
      kind: 'any',
      get: p => [p.recurrent.stop],
      set: (p, c) => ({ ...p, recurrent: { ...p.recurrent, stop: c } }),
    },
    {
      key: 'event',
      label: 'Recurrent events: event',
      kind: 'any',
      get: p => [p.recurrent.event],
      set: (p, c) => ({ ...p, recurrent: { ...p.recurrent, event: c } }),
    },
    {
      key: 'covariates',
      label: 'Recurrent events: covariates',
      kind: 'continuous',
      get: p => p.recurrent.covariates,
      set: (p, c) => ({
        ...p,
        recurrent: { ...p.recurrent, covariates: append(p.recurrent.covariates, c) },
      }),
    },
  ],
  alt: [
    {
      key: 'time',
      label: 'ALT: time',
      kind: 'any',
      get: p => [p.alt.time],
      set: (p, c) => ({ ...p, alt: { ...p.alt, time: c } }),
    },
    {
      key: 'event',
      label: 'ALT: event',
      kind: 'any',
      get: p => [p.alt.event],
      set: (p, c) => ({ ...p, alt: { ...p.alt, event: c } }),
    },
    {
      key: 'stress',
      label: 'ALT: stress',
      kind: 'continuous',
      get: p => [p.alt.stress],
      set: (p, c) => ({ ...p, alt: { ...p.alt, stress: c } }),
    },
    {
      key: 'covariates',
      label: 'ALT: covariates',
      kind: 'continuous',
      get: p => p.alt.covariates,
      set: (p, c) => ({ ...p, alt: { ...p.alt, covariates: append(p.alt.covariates, c) } }),
    },
  ],
  reliability: [
    {
      key: 'time',
      label: 'Reliability: time',
      kind: 'continuous',
      get: p => [p.reliability.time],
      set: (p, c) => ({ ...p, reliability: { ...p.reliability, time: c } }),
    },
    {
      key: 'failures',
      label: 'Reliability: failures',
      kind: 'continuous',
      get: p => [p.reliability.failures],
      set: (p, c) => ({ ...p, reliability: { ...p.reliability, failures: c } }),
    },
  ],
};
