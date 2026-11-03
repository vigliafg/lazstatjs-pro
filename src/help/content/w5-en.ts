import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Wave 5 procedures: multivariate structure, latent variables and preferences. */
export const w5Topics: HelpTopic[] = [
  procedureTopic({
    id: 'canonical',
    title: 'Canonical correlation',
    summary: 'Find the linear combinations of two variable blocks that correlate most strongly.',
    goal: 'Measure how two groups of numeric variables are related and which variables drive the relation.',
    steps: [
      'Put the predictor variables in block X and the outcome variables in block Y.',
      'Run the analysis and read the first canonical correlation: it is the strongest link between the blocks.',
      'Check Wilks lambda, the χ² test and the p-value before interpreting later functions.',
      'Use the structure correlations to see which variables contribute to each canonical score.',
    ],
    expected:
      'A table of canonical functions with correlations, eigenvalues, Wilks lambda and tests; standardised coefficients and structure correlations; a scatterplot of the first pair of canonical scores.',
    whenToUse: [
      'When both sides of the question are sets of continuous variables and you want one summary of their association.',
      'When a regression with several outcomes would otherwise need one model per outcome.',
      'To screen which variables in each block carry the relationship.',
    ],
    assumptions: [
      'The two blocks are measured on the same rows and the rows are independent.',
      'Relationships are approximately linear within each block.',
      'With many variables and few rows the coefficients become unstable.',
    ],
    whenNotToUse: [
      'When one side is a single categorical outcome: use regression, logistic regression or discriminant analysis.',
      'When the goal is prediction rather than description: use a regression model with validation.',
    ],
    reading: [
      'The canonical correlation is the Pearson correlation between the two canonical scores; its square is the shared variance for that pair.',
      'Wilks lambda tests all functions together; the χ² approximation is fragile in small samples.',
      'A coefficient is the weight in the linear combination, while a structure correlation is the simple correlation with the score.',
      'Later functions are independent of the first and are often harder to interpret.',
    ],
    pitfalls: [
      'Reading coefficients without checking collinearity: unstable weights can flip sign.',
      'Treating a significant first function as proof of a causal direction.',
      'Interpreting functions beyond the first without checking their test and effect size.',
    ],
    charts: ['Scatterplot of the first pair of canonical scores.', 'Bars of structure correlations for the first function.'],
    glossary: [
      { term: 'Canonical score', definition: 'A linear combination of one variable block built to correlate with a score from the other block.' },
      { term: 'Wilks lambda', definition: 'A multivariate test statistic that combines the canonical roots.' },
    ],
    seeAlso: ['multivariate', 'correlation'],
  }),
  procedureTopic({
    id: 'mds',
    title: 'Multidimensional scaling',
    summary: 'Place observations on a low-dimensional map that preserves their distances.',
    goal: 'See the similarity structure of a set of observations without assuming a particular measurement model.',
    steps: [
      'Select the numeric variables that define similarity.',
      'Choose two or three dimensions and classical or non-metric scaling.',
      'Run the analysis and read stress: lower values mean a more faithful map.',
      'Look for clusters and extremes on the map and check them against the coordinate table.',
    ],
    expected:
      'A map of the observations, a stress value, the coordinate table, the pairwise distances and a scree plot of the classical eigenvalues.',
    whenToUse: [
      'When you want an exploratory picture of similarities among observations.',
      'To check whether a distance matrix has a simple low-dimensional structure.',
      'As a complement to clustering or PCA when the raw variables are hard to interpret.',
    ],
    assumptions: [
      'The dissimilarities are meaningful and measured on a comparable scale.',
      'Classical MDS assumes Euclidean distances; non-metric MDS only uses the order of the dissimilarities.',
      'The map is defined up to rotation and reflection.',
    ],
    whenNotToUse: [
      'When the distances are not meaningful or are dominated by one variable with a different unit.',
      'When you need a hypothesis test: MDS is descriptive.',
    ],
    reading: [
      'Nearby points are similar; the axes themselves have no intrinsic meaning.',
      'Stress is a badness-of-fit index: below about 0.1 is usually good, but it also falls with few points.',
      'The classical eigenvalues show how much each dimension contributes.',
      'Non-metric MDS keeps only the rank order of the dissimilarities, so it is more flexible but less literal.',
    ],
    pitfalls: [
      'Interpreting the direction of an axis as a real variable.',
      'Comparing stress across data sets with different numbers of points.',
      'Ignoring the variable scales: standardise them when units differ.',
    ],
    charts: ['Scatterplot of the first two MDS dimensions.', 'Scree plot of the classical eigenvalues.'],
    glossary: [
      { term: 'Stress', definition: 'A measure of how badly the map distances reproduce the original dissimilarities.' },
      { term: 'Dissimilarity', definition: 'A non-negative number expressing how different two observations are.' },
    ],
    seeAlso: ['multivariate', 'cluster'],
  }),
  procedureTopic({
    id: 'correspondence',
    title: 'Correspondence analysis',
    summary: 'Map the rows and columns of a two-way table into a shared space.',
    goal: 'Describe which row and column categories attract or repel each other relative to independence.',
    steps: [
      'Enter the row and column labels and the counts of the two-way table.',
      'Run the analysis and read the inertia of the first axes.',
      'Inspect the row/column map and the standardised residuals together.',
      'Use contributions and cos² to decide which categories build each axis.',
    ],
    expected:
      'An inertia table with χ² and degrees of freedom; coordinates, masses, contributions and cos² for rows and columns; a heatmap of standardised residuals.',
    whenToUse: [
      'When a contingency table is large and a single association statistic hides its structure.',
      'To visualise which categories are responsible for the association.',
      'As an exploratory step before log-linear modelling.',
    ],
    assumptions: [
      'Counts are non-negative and the table has at least two rows and two columns.',
      'The row and column totals are positive.',
      'The analysis is descriptive; the χ² approximation needs adequate expected counts.',
    ],
    whenNotToUse: [
      'With many zero cells or very small expected counts: exact or penalised methods are safer.',
      'When you need a causal explanation of the association.',
    ],
    reading: [
      'Total inertia is the χ² divided by the total count; each axis captures a share of it.',
      'A row and a column close together are more frequent than independence predicts.',
      'Contributions show which categories build an axis; cos² shows how well the axis represents a category.',
      'Residuals show the cells that drive the association.',
    ],
    pitfalls: [
      'Reading the map as a test: the χ² test and the map answer different questions.',
      'Ignoring small expected counts.',
      'Interpreting a category far from the origin without checking its mass and cos².',
    ],
    charts: ['Row/column map for the first two axes.', 'Heatmap of standardised residuals.'],
    glossary: [
      { term: 'Inertia', definition: 'The part of table variability explained by the axes; total inertia equals χ² divided by n.' },
      { term: 'Mass', definition: 'The share of the total count carried by a row or column category.' },
    ],
    seeAlso: ['contingency', 'loglinear'],
  }),
  procedureTopic({
    id: 'sem',
    title: 'SEM / CFA',
    summary: 'Fit a confirmatory factor model or a two-factor structural model to observed indicators.',
    goal: 'Test whether a measurement model with latent factors reproduces the covariance among the indicators.',
    steps: [
      'Select the numeric indicators and assign each one to a latent factor.',
      'Choose the number of factors and, if wanted, regress the second factor on the first.',
      'Run the analysis and read χ², CFI, TLI, RMSEA and SRMR before the loadings.',
      'Check the standardised loadings and the residual covariance matrix for local misfit.',
    ],
    expected:
      'A fit table, standardised loadings with standard errors, uniquenesses, factor correlations or the structural path, and a residual covariance heatmap.',
    whenToUse: [
      'When theory specifies which indicators belong to which latent construct.',
      'To test a measurement model before using factor scores in further models.',
      'To compare a correlated-factor model with a structural path between two factors.',
    ],
    assumptions: [
      'The indicators are continuous or approximately continuous and the sample is large enough.',
      'Each factor has at least two indicators and the model is identified.',
      'The maximum-likelihood test assumes multivariate normality.',
    ],
    whenNotToUse: [
      'For exploratory factor analysis with no assignment of indicators: use the Multivariate procedure.',
      'With very small samples or many parameters relative to the number of rows.',
    ],
    reading: [
      'χ² tests exact fit and is sensitive to sample size; CFI/TLI above 0.95 and RMSEA below 0.06 are conventional thresholds.',
      'A standardised loading is the correlation between the indicator and its factor.',
      'R² is the share of an indicator’s variance explained by the factor.',
      'A structural path is a regression between latent factors, not between observed variables.',
    ],
    pitfalls: [
      'Treating good fit as proof that the model is true.',
      'Adding paths to improve fit without a theoretical reason.',
      'Ignoring local misfit shown by large residual covariances.',
    ],
    charts: ['Bars of factor loadings by factor.', 'Heatmap of residual covariances.'],
    glossary: [
      { term: 'CFA', definition: 'Confirmatory factor analysis: a measurement model with pre-assigned indicators.' },
      { term: 'Standardised loading', definition: 'The correlation between an indicator and its latent factor.' },
    ],
    seeAlso: ['multivariate', 'cluster'],
  }),
  procedureTopic({
    id: 'latentclass',
    title: 'Latent class analysis',
    summary: 'Group rows into unobserved classes using categorical indicators.',
    goal: 'Find response profiles that recur across the categorical indicators and classify the rows into them.',
    steps: [
      'Select at least two categorical indicators with observed levels.',
      'Choose the number of classes and the maximum number of EM iterations.',
      'Run the analysis and compare AIC/BIC with models using different class counts.',
      'Read the class proportions, the conditional response probabilities and the entropy.',
    ],
    expected:
      'A fit table, class proportions, conditional probabilities for every level and class, posterior classifications, and class-profile charts.',
    whenToUse: [
      'When the population is suspected to contain subgroups with different response patterns.',
      'To build a typology from survey or diagnostic items.',
      'To compare competing class solutions with information criteria.',
    ],
    assumptions: [
      'Indicators are categorical and measured on the same rows.',
      'Conditional independence holds within each class.',
      'The number of classes is a modelling choice, not a fixed truth.',
    ],
    whenNotToUse: [
      'With continuous indicators: use factor analysis or SEM.',
      'With very small samples or classes that contain only a handful of rows.',
    ],
    reading: [
      'Class proportions give the size of each profile.',
      'Conditional probabilities show which responses distinguish one class from another.',
      'BIC penalises complexity more strongly than AIC; lower is better.',
      'Entropy near 1 means clear assignment; values below about 0.6 mean overlapping classes.',
    ],
    pitfalls: [
      'Choosing the number of classes only by fit without checking interpretability.',
      'Treating classes as real types rather than useful summaries.',
      'Ignoring local maxima: rerun with more starts when the solution is unstable.',
    ],
    charts: ['Bars of class proportions.', 'Line profiles of conditional response probabilities.'],
    glossary: [
      { term: 'Entropy', definition: 'A 0–1 measure of how clearly rows are assigned to classes.' },
      { term: 'Conditional probability', definition: 'The probability of a level given membership in a class.' },
    ],
    seeAlso: ['multivariate', 'mi'],
  }),
  procedureTopic({
    id: 'irt',
    title: 'Item response theory',
    summary: 'Fit a 2PL or Rasch model to binary items and score ability.',
    goal: 'Describe how binary items behave along a latent ability scale and estimate each person’s ability.',
    steps: [
      'Select at least two items coded 0/1.',
      'Choose 2PL for free discrimination or Rasch for unit discrimination.',
      'Run the analysis and read item discriminations and difficulties.',
      'Check the test information curve and the ability scores with their standard errors.',
    ],
    expected:
      'An item table with discrimination, difficulty and standard errors; a fit table with reliability; ability scores; an item information curve.',
    whenToUse: [
      'When a set of binary items measures a single latent trait.',
      'To evaluate item difficulty and discrimination before building a scale.',
      'To score respondents on a common ability metric.',
    ],
    assumptions: [
      'Unidimensionality: one latent trait explains the item responses.',
      'Local independence: responses are independent given ability.',
      'The item characteristic curves follow the chosen logistic model.',
    ],
    whenNotToUse: [
      'With multidimensional traits or items that measure different constructs.',
      'With very small samples or items with no variation.',
    ],
    reading: [
      'Difficulty b is the ability level with a 50% chance of a correct response.',
      'Discrimination a is the slope: higher values mean the item separates nearby ability levels better.',
      'The test information curve shows where the test measures most precisely.',
      'Reliability is high when ability scores vary more than their measurement error.',
    ],
    pitfalls: [
      'Ignoring multidimensionality and forcing all items onto one trait.',
      'Reading item difficulty as item quality.',
      'Using ability scores from a model with poor fit without checking the curves.',
    ],
    charts: ['Bars of item difficulties.', 'Test information curve along the ability scale.'],
    glossary: [
      { term: '2PL', definition: 'Two-parameter logistic model with free discrimination and difficulty.' },
      { term: 'Rasch', definition: 'A logistic model with discrimination fixed to one.' },
    ],
    seeAlso: ['multivariate', 'descriptive'],
  }),
  procedureTopic({
    id: 'conjoint',
    title: 'Conjoint analysis',
    summary: 'Estimate part-worth utilities of attribute levels from profile ratings.',
    goal: 'Understand which product or service attributes drive preference and which levels are preferred.',
    steps: [
      'Select the categorical attributes and the numeric rating column.',
      'Run the analysis and read the part-worth utilities for every level.',
      'Compare attribute importance as the range of utilities within each attribute.',
      'Check R² and the residual error before relying on the ranking.',
    ],
    expected:
      'A utility table by attribute and level, an importance table, model fit (R², RMSE) and bar charts of utilities and importance.',
    whenToUse: [
      'When respondents rate or rank complete profiles described by several attributes.',
      'To quantify the relative importance of product features.',
      'To compare preferred levels within and across attributes.',
    ],
    assumptions: [
      'Preferences are additive across attributes.',
      'The profiles cover the attribute levels adequately.',
      'The rating scale is used consistently across profiles.',
    ],
    whenNotToUse: [
      'When attributes interact strongly: the additive model will miss the interaction.',
      'With too few profiles to estimate all level effects.',
    ],
    reading: [
      'A positive utility means the level is preferred to the attribute average.',
      'Importance is the attribute’s utility range divided by the sum of all ranges.',
      'R² measures how well the additive model reproduces the ratings.',
      'The intercept is the average rating of the profiles.',
    ],
    pitfalls: [
      'Interpreting utilities as absolute liking rather than relative to the attribute.',
      'Ignoring interactions that the additive model cannot represent.',
      'Comparing importance across studies with different attribute sets.',
    ],
    charts: ['Bars of part-worth utilities by attribute.', 'Bars of attribute importance.'],
    glossary: [
      { term: 'Part-worth utility', definition: 'The contribution of one attribute level to the overall preference.' },
      { term: 'Importance', definition: 'The share of the total utility range attributed to an attribute.' },
    ],
    seeAlso: ['multivariate', 'regression'],
  }),
];
