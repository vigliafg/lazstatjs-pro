/**
 * Prose française, fusionnée depuis les fichiers par procédure pour garder
 * chaque traduction relisible séparément.
 */
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
import { l4Copy } from './l4';
import { logisticCopy } from './logistic';
import { loglinearCopy } from './loglinear';
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
import { w2Copy } from './w2';
import { w3Copy } from './w3';
import { w3RegressionCopy } from './w3-regression';
import { w3EconometricsCopy } from './w3-econometrics';
import { proportionsCopy as frProportionsCopy } from './proportions';
import { w5Copy } from './w5';
import { variancesCopy as frVariancesCopy } from './variances';

export const frReportCopy: Record<string, string> = {
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
  ...l4Copy,
  ...logisticCopy,
  ...loglinearCopy,
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
  ...frProportionsCopy,
  ...frVariancesCopy,
  ...w2Copy,
  ...w3Copy,
  ...w3RegressionCopy,
  ...w3EconometricsCopy,
  ...w5Copy,
};
