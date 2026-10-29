/**
 * Reading order of the book, shared by every locale so translations stay
 * aligned. The generator follows this order for the "previous / next" links.
 */
export const TOPIC_ORDER = [
  'start-tour',
  'data-import',
  'data-editor',
  'data-clean',
  'levels',
  'analysis-workflow',
  'choosing-test',
  'wizard',
  'descriptive',
  'distfit',
  'ttest',
  'anova',
  'factorial',
  'ancova',
  'repeatedanova',
  'mixedanova',
  'nonparamrm',
  'tost',
  'correlation',
  'regression',
  'logistic',
  'countreg',
  'ordinal',
  'lmm',
  'gee',
  'multivariate',
  'chisquare',
  'contingency',
  'agreement',
  'survival',
  'cox',
  'stratcox',
  'tdcox',
  'parametric',
  'timeseries',
  'mi',
  'samplesize',
  'resampling',
  'output-console',
  'projects',
] as const;

export const orderTopics = <T extends { id: string }>(topics: T[]): T[] => {
  const byId = new Map(topics.map(topic => [topic.id, topic]));
  const ordered = TOPIC_ORDER.map(id => byId.get(id)).filter((topic): topic is T => Boolean(topic));
  const extra = topics.filter(topic => !TOPIC_ORDER.includes(topic.id as never));
  return [...ordered, ...extra];
};
