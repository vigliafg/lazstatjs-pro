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
        'Choose the mode: control chart, capability, Pareto or variability.',
        'Select the numeric variable (or the category for Pareto).',
        'Set specification limits and the subgroup size when needed.',
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
      ],
      pitfalls: [
        'Control limits are not specification limits.',
        'Capability assumes normality and a stable process.',
      ],
      charts: ['Control chart', 'Capability histogram', 'Pareto chart', 'Variability box plot'],
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
];
