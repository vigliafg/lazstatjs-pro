/** English copy for chart titles, notes and axis labels. */
import { categoricalMultivariateChartCopy } from './charts-multivariate';
import { timeMissingChartCopy } from './charts-time-missing';
import { distfitTTestChartCopy } from './charts-distfit-ttest';
import { lmmChartCopy } from './charts-lmm';
import { remainingChartCopy } from './charts-remaining';
import { l4ChartCopy } from './charts-l4';
import { w6ChartCopy } from './charts-w6';
import { w7ChartCopy } from './charts-w7';
import { w8ChartCopy } from './charts-w8';

import { chartCopyPartA } from './charts-part-a';
import { chartCopyPartB } from './charts-part-b';

export const chartCopy: Record<string, string> = {
  ...w6ChartCopy,
  ...w7ChartCopy,
  ...w8ChartCopy,
  ...chartCopyPartA,
  ...chartCopyPartB,
};
