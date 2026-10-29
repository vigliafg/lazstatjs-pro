/** German report prose, merged from the per-procedure files. */
import { agreementCopy } from './agreement';
import { ancovaCopy } from './ancova';
import { anovaCopy } from './anova';
import { chisquareCopy } from './chisquare';
import { contingencyCopy } from './contingency';
import { correlationCopy } from './correlation';
import { countregCopy } from './countreg';
import { coxCopy } from './cox';
import { descriptiveCopy } from './descriptive';
import { distfitCopy } from './distfit';
import { factorialCopy } from './factorial';
import { geeCopy } from './gee';
import { lmmCopy } from './lmm';
import { logisticCopy } from './logistic';
import { miCopy } from './mi';
import { mixedanovaCopy } from './mixedanova';
import { multivariateCopy } from './multivariate';
import { ordinalCopy } from './ordinal';
import { parametricCopy } from './parametric';
import { regressionCopy } from './regression';
import { repeatedCopy } from './repeated';
import { repeatedAnovaCopy } from './repeatedAnova';
import { resamplingCopy } from './resampling';
import { samplesizeCopy } from './samplesize';
import { sharedCopy } from './shared';
import { stratcoxCopy } from './stratcox';
import { survivalCopy } from './survival';
import { tdcoxCopy } from './tdcox';
import { timeseriesCopy } from './timeseries';
import { tostCopy } from './tost';
import { ttestCopy } from './ttest';
import { wizardCopy } from './wizard';

export const deReportCopy: Record<string, string> = {
  ...agreementCopy,
  ...ancovaCopy,
  ...anovaCopy,
  ...chisquareCopy,
  ...contingencyCopy,
  ...correlationCopy,
  ...countregCopy,
  ...coxCopy,
  ...descriptiveCopy,
  ...distfitCopy,
  ...factorialCopy,
  ...geeCopy,
  ...lmmCopy,
  ...logisticCopy,
  ...miCopy,
  ...mixedanovaCopy,
  ...multivariateCopy,
  ...ordinalCopy,
  ...parametricCopy,
  ...regressionCopy,
  ...repeatedCopy,
  ...repeatedAnovaCopy,
  ...resamplingCopy,
  ...samplesizeCopy,
  ...sharedCopy,
  ...stratcoxCopy,
  ...survivalCopy,
  ...tdcoxCopy,
  ...timeseriesCopy,
  ...tostCopy,
  ...ttestCopy,
  ...wizardCopy,
};
