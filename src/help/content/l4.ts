import type { HelpTopic } from './types';

/**
 * L4 procedure pages (English source).
 *
 * Each locale has its own translated module (`l4-fr.ts`, `l4-es.ts`,
 * `l4-de.ts`, `l4-pt-PT.ts`); this file stays the reference for structure and
 * ids. Each page follows the same two-level contract as the older procedures.
 */
export const l4Topics: HelpTopic[] = [
  {
    id: 'partition',
    area: 'procedures',
    title: 'Partition (regression tree)',
    summary: 'Split the data into homogeneous leaves with a regression tree.',
    tutorial: {
      goal: 'Explain a numeric outcome with a short set of if-then rules.',
      steps: [
        'Choose the numeric response and one or more numeric predictors.',
        'Set the maximum depth and the minimum number of cases per split.',
        'Run it and read the tree, the split list and the leaf report.',
      ],
      expected: 'A tree diagram, split rules, leaf means and variable importance.',
    },
    advanced: {
      assumptions: ['The response is numeric; predictors are numeric and complete.'],
      whenToUse: ['Exploratory explanation, segmentation and non-linear effects.'],
      whenNotToUse: ['Formal inference or causal claims; use a regression model instead.'],
      reading: [
        'Each internal node is a threshold; the leaf mean is the prediction.',
        'Variable importance sums the error reduction attributed to each predictor.',
      ],
      pitfalls: [
        'Deep trees overfit: validate on a separate sample before trusting the rules.',
        'Thresholds are data-dependent and can change with a different sample.',
      ],
      charts: ['Tree diagram', 'Observed vs predicted', 'Variable importance'],
      glossary: [
        { term: 'Leaf', definition: 'A final group whose mean is the prediction.' },
        { term: 'SSE', definition: 'Sum of squared differences between observed and predicted values.' },
      ],
    },
    seeAlso: ['regression', 'cluster'],
  },
  {
    id: 'quality',
    area: 'procedures',
    title: 'Quality (SPC)',
    summary: 'Control charts, capability, Pareto and variability in one platform.',
    tutorial: {
      goal: 'Check whether a process is stable and capable.',
      steps: [
        'Choose the mode: control chart, capability, Pareto, variability, tolerance interval or CUSUM.',
        'Select the numeric variable (or the category for Pareto).',
        'Set specification limits, the subgroup size and the population proportion for the tolerance interval when needed.',
        'Run it and read the chart, the indices and the reading report.',
      ],
      expected: 'A control chart with limits, capability indices or a Pareto chart, plus tables.',
    },
    advanced: {
      assumptions: ['Observations are in their real time order; subgroups are meaningful.'],
      whenToUse: ['Monitoring a process, comparing variability across groups, prioritising defects.'],
      whenNotToUse: ['Judging capability before stability; a capability index on an unstable process is misleading.'],
      reading: [
        'Points outside the control limits are signals, not proof of a change.',
        'Cp is potential margin; Cpk also penalises a mean far from the specification centre.',
        'The Pareto cumulative line shows which categories to tackle first.',
        'The tolerance interval covers a share of the population, not the mean; CUSUM accumulates small persistent shifts.',
      ],
      pitfalls: [
        'Control limits are not specification limits.',
        'Capability assumes normality and a stable process.',
      ],
      charts: ['Control chart', 'Capability histogram', 'Pareto chart', 'Variability box plot', 'Tolerance interval'],
      glossary: [
        { term: 'UCL/LCL', definition: 'Upper and lower control limits at ±3 sigma from the centre.' },
        { term: 'Cpk', definition: 'Capability index that accounts for the distance between the mean and the specification limits.' },
      ],
    },
    seeAlso: ['descriptive', 'distfit'],
  },
  {
    id: 'cluster',
    area: 'procedures',
    title: 'Cluster analysis',
    summary: 'Hierarchical grouping with a dendrogram and cluster profiles.',
    tutorial: {
      goal: 'Find groups of similar observations across several numeric variables.',
      steps: [
        'Select at least two numeric variables.',
        'Choose the linkage and the number of clusters.',
        'Run it and read the dendrogram, the cluster means and the profiles.',
      ],
      expected: 'A dendrogram, cluster sizes, cluster means and standardized profiles.',
    },
    advanced: {
      assumptions: ['Variables are on comparable scales, or standardisation is enabled.'],
      whenToUse: ['Segmentation, exploratory typologies, finding natural groups.'],
      whenNotToUse: ['Testing whether groups exist; clustering has no p-value for that.'],
      reading: [
        'The height of a merge is the distance between the groups being joined.',
        'Standardized profiles show which variables characterise each cluster.',
      ],
      pitfalls: [
        'Different linkages or cuts produce different clusters.',
        'Very small clusters may be outliers rather than real groups.',
      ],
      charts: ['Dendrogram', 'Cluster profiles', 'Cluster sizes'],
      glossary: [
        { term: 'Linkage', definition: 'The rule that measures the distance between two clusters.' },
        { term: 'Dendrogram', definition: 'A tree showing the order and height of merges.' },
      ],
    },
    seeAlso: ['multivariate', 'partition'],
  },
  {
    id: 'discriminant',
    area: 'procedures',
    title: 'Discriminant / MANOVA',
    summary: 'Separate known groups and test their multivariate mean difference.',
    tutorial: {
      goal: 'Check whether groups differ on several numeric variables together.',
      steps: [
        'Select the grouping column and at least one numeric predictor.',
        'Run it and read Wilks lambda, the univariate tests and the canonical plot.',
        'Check the confusion matrix to see how well the groups classify.',
      ],
      expected: 'MANOVA table, discriminant coefficients, canonical scatter and profile plot.',
    },
    advanced: {
      assumptions: ['Independent observations, similar group covariances, continuous predictors.'],
      whenToUse: ['Known groups, classification rules, multivariate group comparison.'],
      whenNotToUse: ['Discovery of unknown groups (use clustering) or more variables than cases.'],
      reading: [
        'A small Wilks lambda and a small p indicate group separation.',
        'Canonical axes are the directions that best separate the groups.',
        'Training accuracy is optimistic: validate on a separate sample.',
      ],
      pitfalls: [
        'Unbalanced groups can dominate accuracy.',
        'Collinear predictors make the covariance matrix singular.',
      ],
      charts: ['Canonical scatter', 'Group profiles', 'Coefficient heatmap'],
      glossary: [
        { term: 'Wilks lambda', definition: 'A multivariate test statistic close to zero when groups differ.' },
        { term: 'Canonical function', definition: 'A linear combination of variables that maximises group separation.' },
      ],
    },
    seeAlso: ['multivariate', 'anova'],
  },
  {
    id: 'doe',
    area: 'procedures',
    title: 'Response surface (DOE)',
    summary: 'Quadratic surface and contour plot for two continuous factors.',
    tutorial: {
      goal: 'Find the combination of two factors that optimises a response.',
      steps: [
        'Select the numeric response and two numeric factors.',
        'Choose a linear or quadratic model.',
        'Run it and read the surface, the contours and the stationary point.',
      ],
      expected: 'A projected surface, contour lines, model coefficients and a stationary point.',
    },
    advanced: {
      assumptions: ['The response is continuous; factors are numeric; residuals are independent.'],
      whenToUse: ['Process optimisation, curvature and interaction between two factors.'],
      whenNotToUse: ['Causal claims without an experimental design, replication and randomisation.'],
      reading: [
        'Contour lines connect factor combinations with the same predicted response.',
        'A saddle point is not an optimum: it rises in one direction and falls in the other.',
      ],
      pitfalls: [
        'The surface is valid only inside the observed factor range.',
        'A quadratic fit does not replace a designed experiment.',
      ],
      charts: ['Response surface', 'Contour map', 'Model coefficients'],
      glossary: [
        { term: 'Stationary point', definition: 'Where the gradient of the surface is zero.' },
        { term: 'Contour', definition: 'A line of constant predicted response.' },
      ],
    },
    seeAlso: ['factorial', 'regression'],
  },
  {
    id: 'proportions',
    area: 'procedures',
    title: 'Proportions & rates',
    summary: 'One- and two-sample tests for proportions and Poisson rates.',
    tutorial: {
      goal: 'Decide whether a proportion or an event rate differs from a target or between two groups.',
      dataset: 'two_groups_binary.csv',
      steps: [
        'Choose one or two proportions, or one or two Poisson rates.',
        'Select the binary outcome (or the count column) and the group column for the two-sample modes.',
        'Pick the success level, the null value and the exposure per row when needed.',
        'Run it and read the exact test, the interval and the effect size.',
      ],
      expected: 'A table with successes, trials, estimate, exact p and interval, plus the difference or rate ratio when there are two groups.',
    },
    advanced: {
      assumptions: [
        'Observations are independent within and between groups.',
        'Poisson counts are integer events with a known exposure and variance equal to the mean.',
      ],
      whenToUse: ['Comparing conversion rates, defect rates, incidence or event counts per unit of exposure.'],
      whenNotToUse: ['Repeated measures or clustered data: the independence assumption is violated.'],
      reading: [
        'The exact p-value is the reference with small counts; the asymptotic p is a normal approximation.',
        'The Wilson interval is more stable than the Wald interval; Clopper–Pearson guarantees nominal coverage.',
        'The risk ratio and the odds ratio do not replace the absolute difference.',
      ],
      pitfalls: [
        'A large odds ratio can hide a tiny absolute difference when events are rare.',
        'The exposure must be declared: the same count over different exposure gives different rates.',
      ],
      charts: ['Interval plot'],
      glossary: [
        { term: 'Exact p-value', definition: 'Probability of every outcome at least as unlikely as the observed one under the null.' },
        { term: 'Rate ratio', definition: 'Ratio between two event rates; 1 means equal rates.' },
      ],
    },
    seeAlso: ['chisquare', 'ttest'],
  },
  {
    id: 'variances',
    area: 'procedures',
    title: 'Variances',
    summary: 'One variance, the F test and Bartlett/Levene for equality of spreads.',
    tutorial: {
      goal: 'Check whether a variance differs from a target or between groups.',
      dataset: 'plantgrowth.csv',
      steps: [
        'Choose one variance or two or more variances.',
        'Select the numeric variable and, for two or more, the group column.',
        'Enter the null variance for the one-sample test.',
        'Run it and compare F, Bartlett and Levene before choosing a test for the means.',
      ],
      expected: 'A variance table with an exact interval, and F/Bartlett/Levene p-values when there are groups.',
    },
    advanced: {
      assumptions: [
        'Observations are independent and, for the chi-square and F intervals, normally distributed.',
        'Levene on medians is more robust but still needs independent groups.',
      ],
      whenToUse: ['Checking homoscedasticity before a t-test or ANOVA, or comparing process spread.'],
      whenNotToUse: ['With very small groups the tests have little power; prefer Welch procedures regardless.'],
      reading: [
        'The F test covers two groups; with more groups use Bartlett or Levene.',
        'Bartlett is powerful under normality but distorted by outliers and heavy tails.',
        'Levene on medians reduces the influence of extremes and is the safer default.',
      ],
      pitfalls: [
        'A non-significant test does not prove equal variances: look at the interval and the boxes.',
        'Variance is on the squared scale: report the standard deviation for interpretability.',
      ],
      charts: ['Box plot', 'Interval plot'],
      glossary: [
        { term: 'Homoscedasticity', definition: 'Equality of variances across groups, an assumption of pooled t and ANOVA.' },
        { term: 'Levene test', definition: 'ANOVA on absolute deviations from a group centre; the median version is Brown–Forsythe.' },
      ],
    },
    seeAlso: ['ttest', 'anova'],
  },
];
