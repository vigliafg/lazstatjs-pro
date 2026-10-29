/**
 * European Portuguese report copy, merged from the per-procedure files so each
 * translation stays reviewable on its own and no file grows past the size guard.
 */
import { agreementCopy } from './agreement';
import { anovaCopy } from './anova';
import { contingencyCopy } from './contingency';
import { correlationCopy } from './correlation';
import { countregCopy } from './countreg';
import { coxCopy } from './cox';
import { descriptiveCopy } from './descriptive';
import { distfitCopy } from './distfit';
import { geeCopy } from './gee';
import { lmmCopy } from './lmm';
import { logisticCopy } from './logistic';
import { miCopy } from './mi';
import { ordinalCopy } from './ordinal';
import { parametricCopy } from './parametric';
import { resamplingCopy } from './resampling';
import { samplesizeCopy } from './samplesize';
import { sharedCopy } from './shared';
import { stratcoxCopy } from './stratcox';
import { survivalCopy } from './survival';
import { tdcoxCopy } from './tdcox';
import { tostCopy } from './tost';
import { ttestCopy } from './ttest';
import { wizardCopy } from './wizard';

export const ptPTReportCopy: Record<string, string> = {
  ...agreementCopy,
  ...anovaCopy,
  ...contingencyCopy,
  ...correlationCopy,
  ...countregCopy,
  ...coxCopy,
  ...descriptiveCopy,
  ...distfitCopy,
  ...geeCopy,
  ...lmmCopy,
  ...logisticCopy,
  ...miCopy,
  ...ordinalCopy,
  ...parametricCopy,
  ...resamplingCopy,
  ...samplesizeCopy,
  ...sharedCopy,
  ...stratcoxCopy,
  ...survivalCopy,
  ...tdcoxCopy,
  ...tostCopy,
  ...ttestCopy,
  ...wizardCopy,
};
