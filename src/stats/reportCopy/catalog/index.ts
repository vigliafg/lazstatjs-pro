import type { ReportLocale } from '../types';

/**
 * English copy, merged from the per-procedure files so each translation stays
 * reviewable on its own and no file grows past the size guard.
 */
import { agreementCopy } from './en/agreement';
import { ancovaCopy } from './en/ancova';
import { anovaCopy } from './en/anova';
import { chisquareCopy } from './en/chisquare';
import { contingencyCopy } from './en/contingency';
import { correlationCopy } from './en/correlation';
import { countregCopy } from './en/countreg';
import { coxCopy } from './en/cox';
import { descriptiveCopy } from './en/descriptive';
import { distfitCopy } from './en/distfit';
import { factorialCopy } from './en/factorial';
import { geeCopy } from './en/gee';
import { lmmCopy } from './en/lmm';
import { logisticCopy } from './en/logistic';
import { miCopy } from './en/mi';
import { mixedanovaCopy } from './en/mixedanova';
import { multivariateCopy } from './en/multivariate';
import { ordinalCopy } from './en/ordinal';
import { parametricCopy } from './en/parametric';
import { regressionCopy } from './en/regression';
import { repeatedCopy } from './en/repeated';
import { repeatedAnovaCopy } from './en/repeatedAnova';
import { resamplingCopy } from './en/resampling';
import { samplesizeCopy } from './en/samplesize';
import { sharedCopy } from './en/shared';
import { stratcoxCopy } from './en/stratcox';
import { survivalCopy } from './en/survival';
import { tdcoxCopy } from './en/tdcox';
import { timeseriesCopy } from './en/timeseries';
import { tostCopy } from './en/tost';
import { ttestCopy } from './en/ttest';
import { deReportCopy } from './de';
import { esReportCopy } from './es';
import { frReportCopy } from './fr';
import { ptPTReportCopy } from './pt-PT';
import { wizardCopy } from './en/wizard';

export const enReportCopy: Record<string, string> = {
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

const CATALOGS: Partial<Record<ReportLocale, Record<string, string>>> = {
  en: enReportCopy,
  de: deReportCopy,
  es: esReportCopy,
  fr: frReportCopy,
  'pt-PT': ptPTReportCopy,
};

/** Empty for the source language: `copy()` returns the Italian sentence as-is. */
export const catalogFor = (locale: ReportLocale): Record<string, string> =>
  CATALOGS[locale] ?? {};
