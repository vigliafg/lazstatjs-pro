import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Wave 9 procedures: survey, machine learning, text, choice, Bayes, meta and spatial. */
export const w9Topics: HelpTopic[] = [
  procedureTopic({
    id: 'survey',
    title: 'Survey (complex samples)',
    summary: 'Design-based means, totals, proportions and regression with weights, strata and clusters.',
    goal: 'Estimate a population quantity from a sample that was not drawn at random, using its weights and design.',
    steps: [
      'Choose the variable and the estimator: mean, total, proportion or weighted regression.',
      'In the advanced section set the weight, stratum and cluster columns when the design has them.',
      'Run and read the estimate, its standard error, the confidence interval and the design effect.',
    ],
    expected: 'A design table, the estimates with design-based intervals and, for regression, the weighted coefficients.',
    whenToUse: [
      'When the sample has unequal inclusion probabilities or was collected in strata and clusters.',
      'When a raw mean would be biased because some groups are over- or under-represented.',
    ],
    reading: [
      'A design effect above 1 means the design is less efficient than a simple random sample of the same weighted size.',
      'Stratification usually lowers the variance; clustering usually raises it because nearby units resemble each other.',
      'The degrees of freedom come from the number of primary units, not from the number of rows.',
    ],
    pitfalls: [
      'Treating sampling weights as frequency weights: the estimate changes, the standard error is wrong.',
      'Ignoring a cluster column and pretending that every row is independent.',
      'Reporting a design-based interval from a stratum with a single primary unit.',
    ],
    charts: ['Estimate and confidence interval.', 'Forest plot of the weighted regression coefficients.'],
    glossary: [
      { term: 'Sampling weight', definition: 'How many population units each observed row represents.' },
      { term: 'Primary sampling unit', definition: 'The first-stage unit selected inside a stratum, usually a cluster.' },
      { term: 'Design effect', definition: 'Ratio between the design variance and the variance of a simple random sample.' },
    ],
    seeAlso: ['descriptive', 'regression'],
  }),
  procedureTopic({
    id: 'ml',
    title: 'Machine Learning',
    summary: 'Random forest, gradient boosting and a one-hidden-layer neural network for regression and classification.',
    goal: 'Predict a numeric outcome or a class from several predictors without imposing a linear or parametric form.',
    steps: [
      'Select the outcome and whether the task is regression or classification.',
      'Choose random forest, gradient boosting or neural network.',
      'Set trees, minimum node size, shrinkage or hidden units, and keep a fixed seed for reproducibility.',
    ],
    expected: 'Fit measures, variable importance for the tree models, predictions and residual charts.',
    whenToUse: [
      'When the relation is non-linear or involves interactions that a regression would miss.',
      'When prediction is the goal and the model does not need interpretable coefficients.',
    ],
    reading: [
      'Compare the internal R² with the out-of-bag R²: a large gap indicates overfitting.',
      'Importance measures how much each predictor reduces the error inside the trees; it is not a causal effect.',
      'A neural network with one hidden layer is flexible but does not report variable importance.',
    ],
    pitfalls: [
      'Choosing the model on the same data used to report its performance.',
      'Using a very small sample: trees and networks memorise noise quickly.',
      'Reading variable importance as proof that a predictor causes the outcome.',
    ],
    charts: ['Observed versus predicted values.', 'Residuals against predictions.', 'Variable importance.'],
    glossary: [
      { term: 'Out-of-bag', definition: 'Rows left out of a bootstrap sample, used as an internal test set.' },
      { term: 'Shrinkage', definition: 'The fraction of each boosting tree added to the prediction.' },
    ],
    seeAlso: ['regression', 'partition'],
  }),
  procedureTopic({
    id: 'text',
    title: 'Text Mining',
    summary: 'Term frequencies, TF-IDF, document similarity and an LDA topic model.',
    goal: 'Describe a corpus of short texts and find the terms and topics that distinguish the documents.',
    steps: [
      'Select the column that contains the text and, optionally, a group label.',
      'Choose frequencies, TF-IDF, document similarity or topics.',
      'Set the vocabulary size, the minimum document frequency and the number of topics.',
    ],
    expected: 'A term table, a document-term view, a similarity matrix or a table of topics with their top terms.',
    whenToUse: [
      'When the data contain open-ended answers, comments, titles or short documents.',
      'When you need an exploratory map of vocabulary before reading the texts one by one.',
    ],
    reading: [
      'TF-IDF downweights terms that appear in almost every document, so distinctive words emerge.',
      'Cosine similarity near 1 means two documents share vocabulary and weights; near 0 means they do not overlap.',
      'Topics are mixtures: a document can load on several topics, and the weights sum to one.',
    ],
    pitfalls: [
      'Forgetting that stopwords depend on the language and on the cleaning choices.',
      'Reading the number of topics as a discovered truth instead of a modelling choice.',
      'Comparing corpora collected with different filters or lengths.',
    ],
    charts: ['Most frequent terms.', 'Topic prevalence.', 'Document-topic heatmap or similarity heatmap.'],
    glossary: [
      { term: 'Token', definition: 'A word or short sequence produced by splitting and cleaning the text.' },
      { term: 'TF-IDF', definition: 'Term frequency weighted by how rare the term is across documents.' },
      { term: 'Topic', definition: 'A distribution over terms learned from the co-occurrence patterns.' },
    ],
    seeAlso: ['descriptive', 'cluster'],
  }),
  procedureTopic({
    id: 'choice',
    title: 'Choice / MaxDiff',
    summary: 'Conditional logit for choice sets and best-worst scores for MaxDiff experiments.',
    goal: 'Explain which attributes drive the choice between alternatives, or rank items from best-worst tasks.',
    steps: [
      'For a choice experiment, select the set, alternative, chosen indicator and the attributes that vary across alternatives.',
      'For MaxDiff, select the block, item, best and worst indicator columns.',
      'Run and read the coefficients, the predicted shares or the MaxDiff ranking.',
    ],
    expected: 'A coefficient table with standard errors, observed and predicted shares, or a MaxDiff score table.',
    whenToUse: [
      'When respondents choose one alternative from a set and the attributes differ across alternatives.',
      'When a best-worst task ranks many items without asking for a full ranking.',
    ],
    reading: [
      'A positive coefficient means that attribute increases the probability of choosing that alternative.',
      'The conditional logit uses only variation within a choice set: attributes constant inside a set cancel out.',
      'McFadden R² compares the model with a null model that assigns equal probability to every alternative.',
    ],
    pitfalls: [
      'Including attributes that do not vary inside the sets: they are not identified.',
      'Leaving sets without a chosen alternative or with more than one choice.',
      'Ignoring the independence from irrelevant alternatives assumption when a new alternative is introduced.',
    ],
    charts: ['Forest plot of the conditional-logit coefficients.', 'Observed and predicted shares.', 'MaxDiff scores and preference intervals.'],
    glossary: [
      { term: 'Choice set', definition: 'The group of alternatives shown together to a respondent.' },
      { term: 'MaxDiff', definition: 'A task that asks for the best and the worst item in each block.' },
    ],
    seeAlso: ['conjoint', 'logistic'],
  }),
  procedureTopic({
    id: 'bayes',
    title: 'Bayesian Analysis',
    summary: 'Posterior summaries and MCMC diagnostics for conjugate models and Gaussian regression.',
    goal: 'Combine the likelihood with a prior and describe the parameter by its posterior distribution.',
    steps: [
      'Choose the model: normal mean, binomial proportion, Poisson rate, linear regression or hierarchical normal.',
      'Select the outcome and, for regression, the predictors.',
      'Set a prior, the number of iterations, the burn-in and the number of chains.',
    ],
    expected: 'A posterior table with mean, median, central interval, HDI, Rhat and ESS, plus a histogram and an interval chart.',
    whenToUse: [
      'When prior information or a small sample makes a posterior summary more natural than a p-value.',
      'When you want the full uncertainty of a parameter, not only a point estimate.',
    ],
    reading: [
      'The 95% HDI is the shortest interval that contains 95% of the posterior mass.',
      'Rhat near 1 and a high ESS mean the chains mixed; Rhat above 1.05 asks for more iterations.',
      'The credible interval is not a confidence interval: it describes the posterior, given the model and prior.',
    ],
    pitfalls: [
      'Using a vague prior with very few observations and then reading the result as objective.',
      'Reporting estimates from chains that did not converge.',
      'Forgetting that the conclusion is conditional on the chosen model.',
    ],
    charts: ['Posterior histogram.', 'Posterior intervals with HDI.', 'Joint posterior of two regression parameters.'],
    glossary: [
      { term: 'Prior', definition: 'The distribution of the parameter before seeing the data.' },
      { term: 'Posterior', definition: 'The updated distribution after combining prior and likelihood.' },
      { term: 'HDI', definition: 'Highest-density interval: the shortest interval holding the requested posterior mass.' },
    ],
    seeAlso: ['regression', 'samplesize'],
  }),
  procedureTopic({
    id: 'meta',
    title: 'Meta-Analysis',
    summary: 'Fixed- and random-effects pooling with heterogeneity, forest and funnel plots.',
    goal: 'Combine the effect sizes of several studies and quantify how much they disagree.',
    steps: [
      'Select the effect-size column and its standard-error column; optionally select a study label.',
      'Choose DerSimonian–Laird, REML or fixed effects for the between-study variance.',
      'Run and read the pooled effect, Q, I², τ², the prediction interval and Egger’s test.',
    ],
    expected: 'A pooled table, a heterogeneity table, the study table, a forest plot and a funnel plot.',
    whenToUse: [
      'When several studies estimate the same effect and you need a summary with its uncertainty.',
      'When the question is how consistent the evidence is across studies, not only the average.',
    ],
    reading: [
      'I² is the share of total variability due to heterogeneity; above 50% is usually called substantial.',
      'The random-effects estimate is wider when τ² is large; the fixed-effect estimate ignores between-study variance.',
      'The prediction interval describes where a new study’s effect would fall, not the precision of the mean.',
    ],
    pitfalls: [
      'Pooling effects measured on different scales without converting them first.',
      'Reading Egger’s test as proof of publication bias: it is asymmetric evidence, not a verdict.',
      'Running a random-effects model with two or three studies and trusting τ².',
    ],
    charts: ['Forest plot of studies and pooled effect.', 'Funnel plot.', 'Study weights.'],
    glossary: [
      { term: 'τ²', definition: 'The variance of the true effects across studies.' },
      { term: 'I²', definition: 'The percentage of total variability attributed to heterogeneity.' },
      { term: 'Funnel plot', definition: 'Effect against precision, used to look for asymmetry.' },
    ],
    seeAlso: ['regression', 'samplesize'],
  }),
  procedureTopic({
    id: 'spatial',
    title: 'Spatial Statistics',
    summary: 'Moran and Geary tests, local indicators and a spatial lag model on coordinates.',
    goal: 'Check whether nearby units resemble each other more than a random arrangement would, and model the spatial dependence.',
    steps: [
      'Select the numeric variable and the two coordinate columns.',
      'Choose Moran’s I, Geary’s C, local indicators or the spatial lag model.',
      'Set the number of nearest neighbours and the permutations; for the SAR model add the predictors.',
    ],
    expected: 'A global autocorrelation table, a map, local indicators and, for SAR, the lag coefficient and the regression table.',
    whenToUse: [
      'When observations are georeferenced and proximity may create dependence.',
      'When you need to find local clusters or outliers before modelling.',
    ],
    reading: [
      'Moran’s I above its expected value indicates positive autocorrelation; below indicates negative autocorrelation.',
      'Permutation p-values do not rely on normality but depend on the number of permutations.',
      'LISA quadrants HH and LL are clusters; HL and LH are units that disagree with their neighbours.',
    ],
    pitfalls: [
      'Treating the weights matrix as given: a different k or distance threshold changes the results.',
      'Reading spatial autocorrelation as a causal effect of neighbours.',
      'Comparing Moran’s I across regions with different sizes and densities without saying so.',
    ],
    charts: ['Map of values or LISA clusters.', 'Local indicators.', 'SAR coefficients.'],
    glossary: [
      { term: 'Moran’s I', definition: 'A global measure of similarity between nearby values.' },
      { term: 'LISA', definition: 'Local indicator of spatial association, one value per unit.' },
      { term: 'Spatial lag', definition: 'A model where the outcome depends on the weighted outcomes of neighbours.' },
    ],
    seeAlso: ['correlation', 'regression'],
  }),
];
