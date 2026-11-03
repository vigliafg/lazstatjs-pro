import type { HelpTopic } from './types';

/** Wave 2 procedures: GLM, quantile, nonlinear and multinomial regression. */
export const w2Topics: HelpTopic[] = [
  {
    id: 'glm',
    area: 'procedures',
    title: 'Generalized linear model (GLM)',
    summary: 'Gaussian, binomial, Poisson and Gamma families with a choice of link.',
    tutorial: {
      goal: 'Estimate how a score changes with age when the outcome is not a plain continuous mean.',
      dataset: 'score-groups.csv',
      steps: [
        'Dependent variable = Score, independents = Age.',
        'Choose the family: Gaussian for a continuous score, binomial for 0/1, Poisson for counts, Gamma for positive skewed amounts.',
        'Pick a link consistent with the family: identity, log, logit, probit or inverse.',
        'Run it and read the coefficients on the link scale together with deviance and AIC.',
      ],
      expected: 'Coefficient table on the link scale, goodness of fit (deviance, AIC), residuals and, with one predictor, the profile of the estimated mean.',
    },
    advanced: {
      assumptions: [
        'Independent observations and a response whose variance follows the chosen family.',
        'The link maps the expected value to a linear predictor: the linear part must be correct.',
        'Binomial needs a 0/1 response, Poisson non-negative counts, Gamma strictly positive values.',
      ],
      whenToUse: [
        'Continuous but skewed or heteroscedastic outcome, typically Gamma with a log link.',
        'Binary outcome when you need a probit link or a family outside the classic logistic menu.',
        'Counts when you want to compare a Poisson log link with deviance diagnostics.',
      ],
      whenNotToUse: [
        'Binary outcome that fits the dedicated logistic procedure with odds ratios and cutoff analysis.',
        'Counts with overdispersion: negative binomial in Count regression is usually better.',
        'Repeated or clustered measures: use mixed models or GEE.',
      ],
      reading: [
        'Coefficients live on the link scale: with a log link exp(β) is a multiplicative ratio, with a logit link it is an odds ratio.',
        'A residual deviance far larger than its degrees of freedom signals overdispersion, especially for Poisson and binomial.',
        'AIC compares models on the same response and family; it is not an absolute measure of fit.',
      ],
      pitfalls: [
        'Reading a log-link coefficient as an additive change in the outcome.',
        'Keeping the Gaussian family with a 0/1 or count response just because the model runs.',
        'Choosing a probit link and then interpreting the coefficients as odds ratios.',
      ],
      charts: [
        'Observed vs fitted values: points close to the diagonal indicate good calibration.',
        'Residuals against fitted values: a funnel or a curve reveals the wrong family or link.',
        'Estimated mean profile: with a single predictor, the fitted curve over the observed range.',
      ],
      glossary: [
        { term: 'Link', definition: 'The function that maps the expected value to the linear predictor.' },
        { term: 'Deviance', definition: 'A goodness-of-fit measure; smaller is better and comparable between nested models.' },
        { term: 'Overdispersion', definition: 'Variance larger than the family assumes, which inflates standard errors.' },
      ],
    },
    seeAlso: ['regression', 'logistic', 'countreg'],
  },
  {
    id: 'quantile',
    area: 'procedures',
    title: 'Quantile regression',
    summary: 'Model a conditional quantile (τ) instead of the mean, robust to outliers.',
    tutorial: {
      goal: 'See whether age shifts the median score, not only the average.',
      dataset: 'score-groups.csv',
      steps: [
        'Dependent variable = Score, independents = Age.',
        'Set τ: 0.5 is the median, 0.1 and 0.9 describe the lower and upper tails.',
        'Run it and read the coefficient of each predictor at that quantile.',
        'Repeat with another τ and compare the two fitted lines.',
      ],
      expected: 'Coefficients, standard errors and CIs for the chosen quantile; with one predictor, the fitted quantile line and the residual plot.',
    },
    advanced: {
      assumptions: [
        'Independent observations; at the chosen τ the conditional quantile is linear in the predictors.',
        'No requirement of normal residuals or constant variance.',
      ],
      whenToUse: [
        'Skewed outcomes, outliers, or interest in the tails (income, latency, scores).',
        'When the effect of a predictor may differ across the distribution.',
      ],
      whenNotToUse: [
        'When you need a single average effect and the mean is the target.',
        'With very small samples: each tail quantile uses few effective observations.',
      ],
      reading: [
        'The coefficient is the change in the τ-quantile for one more unit of the predictor.',
        'Different slopes across τ mean the predictor acts differently on the centre and on the tails.',
        'Standard errors come from quantile (sandwich-type) theory; with few cases the intervals are wide.',
      ],
      pitfalls: [
        'Reading a median coefficient as an average effect: the mean can lie elsewhere.',
        'Fitted quantile lines that cross (τ1 < τ2 but the line of τ1 above that of τ2) suggest a misspecified model.',
      ],
      charts: [
        'Quantile line: observations with the fitted τ line; the slope is the quantile effect.',
        'Residuals against fitted quantiles: structure means the linear quantile model is wrong.',
      ],
      glossary: [
        { term: 'Quantile τ', definition: 'The value below which a proportion τ of the conditional distribution lies.' },
        { term: 'Median regression', definition: 'Quantile regression at τ = 0.5, robust to extreme observations.' },
      ],
    },
    seeAlso: ['regression', 'nonparamrm', 'lmm'],
  },
  {
    id: 'nonlinear',
    area: 'procedures',
    title: 'Nonlinear regression',
    summary: 'Exponential, logistic, Gompertz, power and Michaelis–Menten curves fitted by least squares.',
    tutorial: {
      goal: 'Fit a curve that rises quickly and then levels off, and read its parameters.',
      dataset: 'score-groups.csv',
      steps: [
        'Dependent variable = Score, predictor = Time.',
        'Choose the shape: exponential, logistic, Gompertz, power or Michaelis–Menten.',
        'Run it and check that the fit converged, then read the parameters with their CIs.',
        'Inspect the curve and the residuals; try another shape if the pattern is systematic.',
      ],
      expected: 'Parameter table with SE, t, p and CI, R², RMSE, the fitted curve and the residual plot.',
    },
    advanced: {
      assumptions: [
        'The chosen functional form is correct; residuals are independent and roughly homoscedastic.',
        'The predictor range covers the part of the curve you want to describe.',
        'Enough distinct predictor values to identify every parameter.',
      ],
      whenToUse: [
        'Growth, decay, saturation and dose–response shapes that a straight line cannot describe.',
        'When the parameters have a meaning: asymptote, rate, half-saturation.',
      ],
      whenNotToUse: [
        'When a transformation makes the relation linear and interpretable, such as log–log for a power law.',
        'With few points or a narrow predictor range: the parameters are weakly identified.',
      ],
      reading: [
        'Exponential y = a·exp(b·x): b > 0 is growth, b < 0 is decay.',
        'Logistic L/(1+exp(−k(x−x0))): L is the upper asymptote, k the steepness, x0 the inflection point.',
        'Gompertz a·exp(−b·exp(−c·x)): asymmetric growth that approaches the asymptote more slowly.',
        'Power a·x^b: b is the exponent; Michaelis–Menten vmax·x/(km+x): km is the half-saturation value.',
      ],
      pitfalls: [
        'Comparing R² across different curves without checking the residual pattern.',
        'Trusting a converged fit with wide or implausible parameter intervals.',
        'Extrapolating beyond the observed predictor range, especially for exponential growth.',
      ],
      charts: [
        'Estimated curve: observations with the fitted curve superimposed.',
        'Residuals against fitted values: systematic arcs mean the chosen curve is wrong.',
      ],
      glossary: [
        { term: 'Asymptote', definition: 'The value the curve approaches as the predictor grows.' },
        { term: 'Half-saturation', definition: 'The predictor value at which the response reaches half of its maximum (km).' },
      ],
    },
    seeAlso: ['regression', 'glm', 'countreg'],
  },
  {
    id: 'multinomial',
    area: 'procedures',
    title: 'Multinomial logistic regression',
    summary: 'Nominal outcome with three or more classes, each compared with a reference class.',
    tutorial: {
      goal: 'Estimate how predictors change the probability of belonging to each class of a nominal outcome.',
      steps: [
        'Outcome = the categorical column with at least three classes, for example low/medium/high.',
        'Select the numeric predictors.',
        'Run it and read one coefficient block per class against the reference class.',
        'Check the overall accuracy and the per-class accuracy before trusting the classification.',
      ],
      expected: 'Coefficients and relative risk ratios with CIs for each class versus the reference, overall accuracy and a classification table.',
    },
    advanced: {
      assumptions: [
        'Independent observations; the log-odds of each class versus the reference are linear in the predictors.',
        'Independence of irrelevant alternatives: adding or removing a class should not change the others.',
        'Each class has enough observations for the number of parameters.',
      ],
      whenToUse: [
        'Nominal outcome with more than two unordered categories, such as transport mode or product choice.',
        'When you want class-specific effects rather than a single binary contrast.',
      ],
      whenNotToUse: [
        'Ordered classes: ordinal logistic is more parsimonious.',
        'Binary outcome: use logistic regression.',
        'Very rare classes: the estimates are unstable.',
      ],
      reading: [
        'Each class is compared with the reference class: exp(β) is a relative risk ratio, not a probability.',
        'A ratio above 1 means the predictor increases the odds of that class relative to the reference.',
        'Overall accuracy can be high simply because one class dominates: read the per-class accuracy too.',
      ],
      pitfalls: [
        'Interpreting relative risk ratios as probabilities or as risk ratios.',
        'Changing the reference class and expecting the same numbers: the comparison changes.',
        'Using multinomial regression when the classes are ordered.',
      ],
      charts: [
        'Predicted class distribution: each bar counts how many observations the model assigns to that class.',
        'Accuracy by class: percentage correctly classified in each class, with overall accuracy as a reference line.',
      ],
      glossary: [
        { term: 'Reference class', definition: 'The class against which every other class is compared.' },
        { term: 'Relative risk ratio', definition: 'The multiplicative change in the odds of a class versus the reference for one more unit of the predictor.' },
        { term: 'Softmax', definition: 'The function that turns class scores into probabilities summing to one.' },
      ],
    },
    seeAlso: ['logistic', 'multivariate', 'ordinal'],
  },
];
