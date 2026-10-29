import type { ProjectParams } from '../../io/project';
import { t } from '../../i18n';

export interface AnalysisPreset {
  id: string;
  label: string;
  apply: (params: ProjectParams) => ProjectParams;
}

/** A few opinionated starting points, not a full template system. */
export const presetsFor = (analysisId: string): AnalysisPreset[] => {
  if (analysisId === 'ttest') {
    return [
      {
        id: 'welch',
        label: t('preset.ttestWelch'),
        apply: params => ({ ...params, ttest: { ...params.ttest, type: 'ind', equalVar: false } }),
      },
      {
        id: 'pooled',
        label: t('preset.ttestPooled'),
        apply: params => ({ ...params, ttest: { ...params.ttest, type: 'ind', equalVar: true } }),
      },
      {
        id: 'paired',
        label: t('preset.ttestPaired'),
        apply: params => ({ ...params, ttest: { ...params.ttest, type: 'dep' } }),
      },
    ];
  }
  if (analysisId === 'anova') {
    return [
      {
        id: 'holm',
        label: t('preset.anovaHolm'),
        apply: params => ({ ...params, anova: { ...params.anova, posthoc: 'holm' } }),
      },
      {
        id: 'tukey',
        label: t('preset.anovaTukey'),
        apply: params => ({ ...params, anova: { ...params.anova, posthoc: 'tukey' } }),
      },
      {
        id: 'kruskal',
        label: t('preset.anovaKruskal'),
        apply: params => ({ ...params, anova: { ...params.anova, useNonParam: true } }),
      },
    ];
  }
  if (analysisId === 'regression') {
    return [
      {
        id: 'ols',
        label: t('preset.regressionOls'),
        apply: params => ({
          ...params,
          reg: { ...params.reg, robustSE: 'none', useNonParam: false },
        }),
      },
      {
        id: 'hc3',
        label: t('preset.regressionHc3'),
        apply: params => ({
          ...params,
          reg: { ...params.reg, robustSE: 'HC3', useNonParam: false },
        }),
      },
      {
        id: 'theil',
        label: t('preset.regressionTheil'),
        apply: params => ({ ...params, reg: { ...params.reg, useNonParam: true } }),
      },
    ];
  }
  if (analysisId === 'logistic') {
    return [
      {
        id: 'standard',
        label: t('preset.logisticStandard'),
        apply: params => ({ ...params, logistic: { ...params.logistic, penalized: false } }),
      },
      {
        id: 'firth',
        label: t('preset.logisticFirth'),
        apply: params => ({ ...params, logistic: { ...params.logistic, penalized: true } }),
      },
    ];
  }
  if (analysisId === 'correlation') {
    return [
      {
        id: 'pearson',
        label: t('preset.correlationPearson'),
        apply: params => ({ ...params, corr: { ...params.corr, method: 'pearson' } }),
      },
      {
        id: 'spearman',
        label: t('preset.correlationSpearman'),
        apply: params => ({ ...params, corr: { ...params.corr, method: 'spearman' } }),
      },
    ];
  }
  return [];
};
