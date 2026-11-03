import type { ProjectParams } from '../io/project';

interface W9Role {
  key: string;
  label: string;
  kind: 'continuous' | 'group' | 'any';
  get: (params: ProjectParams) => number[];
  set: (params: ProjectParams, column: number) => ProjectParams;
}

const append = (values: readonly number[], column: number): number[] =>
  Array.from(new Set([...values, column]));

/** Column roles of the wave-9 survey, ML, text, choice, Bayesian and spatial procedures. */
export const W9_ROLES: Record<string, W9Role[]> = {
  survey: [
    {
      key: 'variable',
      label: 'Survey: variable',
      kind: 'continuous',
      get: p => [p.survey.variable],
      set: (p, c) => ({ ...p, survey: { ...p.survey, variable: c } }),
    },
    {
      key: 'category',
      label: 'Survey: category',
      kind: 'any',
      get: p => [p.survey.category],
      set: (p, c) => ({ ...p, survey: { ...p.survey, category: c } }),
    },
    {
      key: 'weight',
      label: 'Survey: weight',
      kind: 'continuous',
      get: p => [p.survey.weight],
      set: (p, c) => ({ ...p, survey: { ...p.survey, weight: c } }),
    },
    {
      key: 'strata',
      label: 'Survey: strata',
      kind: 'any',
      get: p => [p.survey.strata],
      set: (p, c) => ({ ...p, survey: { ...p.survey, strata: c } }),
    },
    {
      key: 'cluster',
      label: 'Survey: cluster',
      kind: 'any',
      get: p => [p.survey.cluster],
      set: (p, c) => ({ ...p, survey: { ...p.survey, cluster: c } }),
    },
    {
      key: 'predictors',
      label: 'Survey: predictors',
      kind: 'continuous',
      get: p => p.survey.predictors,
      set: (p, c) => ({
        ...p,
        survey: { ...p.survey, predictors: append(p.survey.predictors, c) },
      }),
    },
  ],
  ml: [
    {
      key: 'outcome',
      label: 'Machine learning: outcome',
      kind: 'continuous',
      get: p => [p.ml.outcome],
      set: (p, c) => ({ ...p, ml: { ...p.ml, outcome: c } }),
    },
    {
      key: 'predictors',
      label: 'Machine learning: predictors',
      kind: 'continuous',
      get: p => p.ml.predictors,
      set: (p, c) => ({ ...p, ml: { ...p.ml, predictors: append(p.ml.predictors, c) } }),
    },
  ],
  text: [
    {
      key: 'text',
      label: 'Text mining: text column',
      kind: 'any',
      get: p => [p.text.text],
      set: (p, c) => ({ ...p, text: { ...p.text, text: c } }),
    },
    {
      key: 'group',
      label: 'Text mining: group',
      kind: 'group',
      get: p => [p.text.group],
      set: (p, c) => ({ ...p, text: { ...p.text, group: c } }),
    },
  ],
  choice: [
    {
      key: 'set',
      label: 'Choice: set',
      kind: 'any',
      get: p => [p.choice.set],
      set: (p, c) => ({ ...p, choice: { ...p.choice, set: c } }),
    },
    {
      key: 'alternative',
      label: 'Choice: alternative',
      kind: 'any',
      get: p => [p.choice.alternative],
      set: (p, c) => ({ ...p, choice: { ...p.choice, alternative: c } }),
    },
    {
      key: 'chosen',
      label: 'Choice: chosen',
      kind: 'any',
      get: p => [p.choice.chosen],
      set: (p, c) => ({ ...p, choice: { ...p.choice, chosen: c } }),
    },
    {
      key: 'best',
      label: 'Choice: best',
      kind: 'any',
      get: p => [p.choice.best],
      set: (p, c) => ({ ...p, choice: { ...p.choice, best: c } }),
    },
    {
      key: 'worst',
      label: 'Choice: worst',
      kind: 'any',
      get: p => [p.choice.worst],
      set: (p, c) => ({ ...p, choice: { ...p.choice, worst: c } }),
    },
    {
      key: 'attributes',
      label: 'Choice: attributes',
      kind: 'continuous',
      get: p => p.choice.attributes,
      set: (p, c) => ({
        ...p,
        choice: { ...p.choice, attributes: append(p.choice.attributes, c) },
      }),
    },
  ],
  meta: [
    {
      key: 'effect',
      label: 'Meta-analysis: effect',
      kind: 'continuous',
      get: p => [p.meta.effect],
      set: (p, c) => ({ ...p, meta: { ...p.meta, effect: c } }),
    },
    {
      key: 'se',
      label: 'Meta-analysis: standard error',
      kind: 'continuous',
      get: p => [p.meta.se],
      set: (p, c) => ({ ...p, meta: { ...p.meta, se: c } }),
    },
    {
      key: 'study',
      label: 'Meta-analysis: study',
      kind: 'any',
      get: p => [p.meta.study],
      set: (p, c) => ({ ...p, meta: { ...p.meta, study: c } }),
    },
  ],
  bayes: [
    {
      key: 'outcome',
      label: 'Bayesian: outcome',
      kind: 'continuous',
      get: p => [p.bayes.outcome],
      set: (p, c) => ({ ...p, bayes: { ...p.bayes, outcome: c } }),
    },
    {
      key: 'predictors',
      label: 'Bayesian: predictors',
      kind: 'continuous',
      get: p => p.bayes.predictors,
      set: (p, c) => ({
        ...p,
        bayes: { ...p.bayes, predictors: append(p.bayes.predictors, c) },
      }),
    },
  ],
  spatial: [
    {
      key: 'variable',
      label: 'Spatial: variable',
      kind: 'continuous',
      get: p => [p.spatial.variable],
      set: (p, c) => ({ ...p, spatial: { ...p.spatial, variable: c } }),
    },
    {
      key: 'x',
      label: 'Spatial: X coordinate',
      kind: 'continuous',
      get: p => [p.spatial.x],
      set: (p, c) => ({ ...p, spatial: { ...p.spatial, x: c } }),
    },
    {
      key: 'y',
      label: 'Spatial: Y coordinate',
      kind: 'continuous',
      get: p => [p.spatial.y],
      set: (p, c) => ({ ...p, spatial: { ...p.spatial, y: c } }),
    },
    {
      key: 'predictors',
      label: 'Spatial: predictors',
      kind: 'continuous',
      get: p => p.spatial.predictors,
      set: (p, c) => ({
        ...p,
        spatial: { ...p.spatial, predictors: append(p.spatial.predictors, c) },
      }),
    },
  ],
};
