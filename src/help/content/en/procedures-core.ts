import type { HelpTopic } from '../types';

/** Procedure chapters: description, comparison of means and regression models. */
export const coreTopics: HelpTopic[] = [
  {
    id: 'descriptive',
    area: 'procedures',
    title: 'Descriptive statistics',
    summary: 'Mean, spread, quantiles, missing values and normality checks for every variable.',
    tutorial: {
      goal: 'Summarise the numeric variables of a study before choosing a test.',
      dataset: 'score-groups.csv',
      steps: [
        'Open Descriptive from the Descriptive family.',
        'Select the numeric variables (Score, Age) and keep the confidence level at 95%.',
        'Press Run analysis and read the row of each variable.',
        'Check the missing column and the normality test before comparing groups.',
      ],
      expected: 'One row per variable with N, mean, standard deviation, median, quartiles, min and max, plus the normality outcome.',
    },
    advanced: {
      assumptions: ['Mean and standard deviation require a quantitative variable.'],
      whenToUse: [
        'Always, as a first step: it shows the shape of the data and the odd values.',
        'To decide between parametric and non-parametric tests.',
      ],
      whenNotToUse: ['With categorical variables: use frequencies, not the mean.'],
      reading: [
        'A mean far from the median suggests skewness or extreme values.',
        'Normality tests are indicative: with large N they are over-sensitive, with small N underpowered.',
      ],
      pitfalls: [
        'Never report the standard deviation as a standard error: they are different quantities.',
        'A single outlier can dominate mean and standard deviation.',
      ],
      glossary: [
        { term: 'Standard deviation', definition: 'Average spread of values around the mean, in the same unit as the data.' },
        { term: 'Quantile', definition: 'The value below which a given percentage of observations falls.' },
      ],
    },
    seeAlso: ['distfit', 'ttest'],
  },
  {
    id: 'distfit',
    area: 'procedures',
    title: 'Distribution fit',
    summary: 'Compare the observed distribution with theoretical families and pick the best.',
    tutorial: {
      goal: 'Find out which theoretical distribution describes a variable best.',
      dataset: 'score-groups.csv',
      steps: [
        'Open the procedure and select the numeric variable.',
        'Tick the distributions to compare (normal, lognormal, gamma, Weibull…).',
        'Run it and read the goodness-of-fit table.',
        'Run again with only the best distribution to get the comparison chart.',
      ],
      expected: 'The distribution with the best criterion is highlighted; the chart overlays the theoretical density and the observed histogram.',
    },
    advanced: {
      assumptions: ['Observations must be independent.'],
      whenToUse: ['To choose a family before modelling times, counts or amounts.'],
      whenNotToUse: ['With fewer than a few dozen cases the families are hard to tell apart.'],
      reading: [
        'Lower AIC/BIC means a better fit.',
        'A goodness-of-fit p-value does not prove normality: it only measures evidence against it.',
      ],
      pitfalls: ['Choosing the distribution from the data and then testing it on the same data overstates the fit.'],
      glossary: [
        { term: 'AIC', definition: 'A criterion rewarding fit and penalising the number of parameters.' },
        { term: 'Lognormal', definition: 'A distribution whose logarithm is normal; typical of amounts and times.' },
      ],
    },
    seeAlso: ['descriptive', 'parametric'],
  },
  {
    id: 'ttest',
    area: 'procedures',
    title: 'T-Test',
    summary: 'Compare two means or two paired measurements, with a non-parametric alternative.',
    tutorial: {
      goal: 'Check whether the mean score differs between two independent groups.',
      dataset: 'score-groups.csv',
      steps: [
        'Open T-Test and set Test type = Independent samples.',
        'Variable 1 = Score, Variable 2 = Group.',
        'Keep Variances on Welch unless you know they are equal.',
        'Run it and read the difference, confidence interval and p-value.',
      ],
      expected: 'Two descriptive rows, the t-test with degrees of freedom, the difference with its CI and the reading report.',
    },
    advanced: {
      assumptions: [
        'Independent observations; for the paired test, a link between the two measures of the same subject.',
        'With small N, normality or at least no strong skewness.',
      ],
      whenToUse: ['Two groups or two time points, numeric outcome.'],
      whenNotToUse: ['More than two groups (use ANOVA) or a categorical outcome.'],
      reading: [
        'The p-value answers “how compatible is this with no difference”, not the probability that the null is true.',
        'The confidence interval also shows how large the difference might be: judge practical relevance.',
      ],
      pitfalls: [
        'Comparing many pairs without correction inflates false positives.',
        'A non-significant result does not prove equality: look at the interval.',
      ],
      glossary: [
        { term: 'Welch', definition: 'The t-test variant that does not assume equal variances.' },
        { term: "Cohen's d", definition: 'Effect size expressed in standard deviation units.' },
      ],
    },
    seeAlso: ['anova', 'nonparamrm', 'tost'],
  },
  {
    id: 'anova',
    area: 'procedures',
    title: 'One-way ANOVA',
    summary: 'Compare the means of two or more groups with post-hoc tests and Kruskal-Wallis.',
    tutorial: {
      goal: 'Know whether the mean score changes across three treatment groups.',
      dataset: 'score-groups.csv',
      steps: [
        'Open ANOVA, set Dependent variable = Score and Group variable = Group.',
        'Keep Post-hoc = Holm and enable the non-parametric alternative.',
        'Run it and check the main table, then the post-hoc comparisons.',
      ],
      expected: 'ANOVA table with F, degrees of freedom and p; post-hoc differences with CIs; Kruskal-Wallis as a check.',
    },
    advanced: {
      assumptions: ['Independence, normal residuals, similar variances across groups.'],
      whenToUse: ['One between-subject factor with three or more levels.'],
      whenNotToUse: ['Repeated measures (use repeated-measures ANOVA) or two groups (the t-test is equivalent).'],
      reading: [
        'A significant p says at least one mean differs: the post-hoc says which.',
        'A significant Levene suggests unequal variances: prefer Welch or Kruskal-Wallis.',
      ],
      pitfalls: [
        'Choose the post-hoc test before looking at the data, not after.',
        'Re-running ANOVA on subgroups chosen after the fact inflates false positives.',
      ],
      glossary: [
        { term: 'Post-hoc', definition: 'Pairwise comparisons run after a significant global test.' },
        { term: 'Holm', definition: 'A p-value correction controlling the family-wise error without being too conservative.' },
      ],
    },
    seeAlso: ['factorial', 'ancova', 'nonparamrm'],
  },
  {
    id: 'factorial',
    area: 'procedures',
    title: 'Factorial ANOVA',
    summary: 'Two between-subject factors, main effects and their interaction.',
    tutorial: {
      goal: 'Check whether a treatment effect depends on the participants’ sex.',
      dataset: 'score-groups.csv',
      steps: [
        'Select the dependent variable and the two factors (Factor A, Factor B).',
        'Enable “Include A × B interaction”.',
        'Run it and read the effects table: A, B and A × B.',
        'If the interaction is significant, discuss cell means rather than main effects alone.',
      ],
      expected: 'One row per effect with F, degrees of freedom, p and effect size, plus the cell means.',
    },
    advanced: {
      assumptions: ['Independence, normal residuals, similar variances in the cells.'],
      whenToUse: ['Two categorical between-subject factors with enough cases per cell.'],
      whenNotToUse: ['Cells with very few cases make the interaction unstable.'],
      reading: [
        'A significant main effect in the presence of a significant interaction must be read with care.',
        'Cell means show the direction of the interaction.',
      ],
      pitfalls: ['In unbalanced designs the order of the terms changes the results: check the sums-of-squares type.'],
      glossary: [
        { term: 'Interaction', definition: 'When the effect of one factor changes across levels of the other.' },
        { term: 'Main effect', definition: 'The average effect of one factor ignoring the other.' },
      ],
    },
    seeAlso: ['anova', 'mixedanova'],
  },
  {
    id: 'ancova',
    area: 'procedures',
    title: 'ANCOVA',
    summary: 'Compare groups while adjusting for continuous covariates, with adjusted means.',
    tutorial: {
      goal: 'Compare groups while accounting for participants’ age.',
      dataset: 'score-groups.csv',
      steps: [
        'Choose the dependent variable, the group factor and at least one covariate.',
        'Run it and check the homogeneity-of-slopes test.',
        'Read the adjusted means with confidence intervals and the Holm comparisons.',
      ],
      expected: 'Group effect adjusted for covariates, adjusted means and slope diagnostics.',
    },
    advanced: {
      assumptions: [
        'A linear relation between covariate and outcome within each group.',
        'Homogeneous slopes: if the test is significant, classic ANCOVA is not appropriate.',
      ],
      whenToUse: ['Groups unbalanced on a continuous variable that influences the outcome.'],
      whenNotToUse: ['A covariate measured after treatment: you risk adjusting away the effect.'],
      reading: ['Report the adjusted means, not the raw ones.'],
      pitfalls: ['A covariate correlated with the group makes the interpretation fragile.'],
      glossary: [
        { term: 'Adjusted means', definition: 'Means estimated as if all groups had the same average covariate value.' },
        { term: 'Homogeneous slopes', definition: 'The covariate-outcome relation has the same slope in every group.' },
      ],
    },
    seeAlso: ['anova', 'regression'],
  },
  {
    id: 'repeatedanova',
    area: 'procedures',
    title: 'Repeated-measures ANOVA',
    summary: 'Compare conditions measured on the same subjects, with sphericity corrections.',
    tutorial: {
      goal: 'Compare three measurements taken on the same participants.',
      dataset: 'score-groups.csv',
      steps: [
        'Organise the data in wide format: one row per subject, one column per condition.',
        'Select the condition columns (at least three).',
        'Run it and check Mauchly and the Greenhouse–Geisser or Huynh–Feldt corrections.',
        'If the global test is significant, read the corrected pairwise comparisons.',
      ],
      expected: 'Within-subject table with F, sphericity and corrected p, plus post-hoc comparisons.',
    },
    advanced: {
      assumptions: ['Sphericity: the differences between conditions have equal variability.'],
      whenToUse: ['The same units measured on three or more occasions.'],
      whenNotToUse: ['Many missing data: a mixed model is better.'],
      reading: [
        'If Mauchly is significant, use the corrected degrees of freedom.',
        'The correction changes degrees of freedom, not the means.',
      ],
      pitfalls: ['A wrong column order compares the wrong conditions.'],
      glossary: [
        { term: 'Sphericity', definition: 'The assumption that variances of differences between conditions are equal.' },
        { term: 'Greenhouse–Geisser', definition: 'A conservative degrees-of-freedom correction when sphericity is violated.' },
      ],
    },
    seeAlso: ['mixedanova', 'nonparamrm'],
  },
  {
    id: 'mixedanova',
    area: 'procedures',
    title: 'Mixed ANOVA',
    summary: 'One between-subject factor and within-subject conditions, with their interaction.',
    tutorial: {
      goal: 'Compare the trajectory of two groups over three time points.',
      dataset: 'score-groups.csv',
      steps: [
        'Prepare wide format: one row per subject and one column per time point.',
        'Set the between-subject group and the within-subject condition columns.',
        'Run it and read the time, group and time × group effects.',
      ],
      expected: 'Three effect rows with corrected p-values and means per group and time.',
    },
    advanced: {
      assumptions: ['Sphericity within subjects, normal residuals, independence between subjects.'],
      whenToUse: ['Longitudinal design with a comparison group.'],
      whenNotToUse: ['Very small groups or structural missing data.'],
      reading: ['A significant interaction means the groups change differently over time.'],
      pitfalls: ['Mixing wide and long formats produces wrong columns and meaningless results.'],
      glossary: [
        { term: 'Between subjects', definition: 'A factor whose levels are assigned to different units.' },
        { term: 'Within subjects', definition: 'A factor measured repeatedly on the same unit.' },
      ],
    },
    seeAlso: ['repeatedanova', 'lmm'],
  },
  {
    id: 'nonparamrm',
    area: 'procedures',
    title: 'Non-parametric tests for repeated measures',
    summary: 'Friedman, McNemar, Cochran Q and Jonckheere–Terpstra.',
    tutorial: {
      goal: 'Compare three conditions without assuming normality.',
      dataset: 'score-groups.csv',
      steps: [
        'Pick the test for your design: Friedman for ranked conditions, McNemar for two paired binary measures.',
        'Select the columns or variables it needs.',
        'Run it and read the statistic with its p-value and, for Friedman, the Nemenyi post-hoc.',
      ],
      expected: 'Statistic, degrees of freedom and p; for Friedman the pairwise comparisons with rank differences.',
    },
    advanced: {
      assumptions: ['Paired observations; Cochran Q needs a binary outcome.'],
      whenToUse: ['Small samples, ordinal outcomes or strongly skewed distributions.'],
      whenNotToUse: ['Large continuous samples with a regular distribution: parametric tests are more powerful.'],
      reading: ['A significant p means at least one condition differs; the post-hoc says which.'],
      pitfalls: ['Ranks lose magnitude information: report medians too.'],
      glossary: [
        { term: 'Friedman', definition: 'The non-parametric alternative to repeated-measures ANOVA.' },
        { term: 'McNemar', definition: 'A test for two paired binary measures.' },
      ],
    },
    seeAlso: ['repeatedanova', 'ttest'],
  },
  {
    id: 'tost',
    area: 'procedures',
    title: 'Equivalence (TOST)',
    summary: 'Show that two treatments are equivalent within a margin fixed in advance.',
    tutorial: {
      goal: 'Show that a generic drug is equivalent to the reference within ±0.5.',
      dataset: 'score-groups.csv',
      steps: [
        'Choose the design (two groups or paired measures).',
        'Set the equivalence margin (e.g. 0.5) before looking at the data.',
        'Run it and read the two one-sided tests and the confidence interval.',
      ],
      expected: 'Two one-sided p-values and an equivalence conclusion only when the whole interval sits inside the margin.',
    },
    advanced: {
      assumptions: ['The same as the corresponding t-test; the margin must be clinically justified.'],
      whenToUse: ['Bioequivalence, non-inferiority and comparison of two versions of an instrument.'],
      whenNotToUse: ['To “prove” absence of a difference without a pre-specified margin.'],
      reading: ['Equivalence requires the entire interval to stay inside ±margin.'],
      pitfalls: ['Choosing the margin after seeing the data invalidates the procedure.'],
      glossary: [
        { term: 'TOST', definition: 'Two One-Sided Tests that together assess equivalence.' },
        { term: 'Margin', definition: 'The largest difference considered clinically acceptable.' },
      ],
    },
    seeAlso: ['ttest', 'samplesize'],
  },
  {
    id: 'correlation',
    area: 'procedures',
    title: 'Correlation',
    summary: 'Pearson, Spearman and Kendall with confidence intervals and a matrix.',
    tutorial: {
      goal: 'Measure the association between two continuous variables.',
      dataset: 'score-groups.csv',
      steps: [
        'Select two or more variables.',
        'Pick the primary method: Pearson for linear relations, Spearman with outliers or ranks.',
        'Run it and read coefficient, CI and p; the matrix shows every pair.',
      ],
      expected: 'Coefficient with confidence interval, p-value and a correlation matrix with ones on the diagonal.',
    },
    advanced: {
      assumptions: ['Pearson: linear relation and no dominant outliers. Spearman: monotonic relation only.'],
      whenToUse: ['Exploring associations before a model, or checking collinearity.'],
      whenNotToUse: ['For causal inference: correlation does not identify direction.'],
      reading: [
        'The sign gives the direction, the absolute value the strength.',
        'With many variables uncorrected p-values are too many: interpret cautiously.',
      ],
      pitfalls: ['A strong correlation can vanish or reverse inside subgroups (Simpson’s paradox).'],
      glossary: [
        { term: 'Pearson r', definition: 'A measure of linear association between two quantitative variables.' },
        { term: 'Spearman ρ', definition: 'A rank correlation, robust to outliers.' },
      ],
    },
    seeAlso: ['regression', 'multivariate'],
  },
  {
    id: 'regression',
    area: 'procedures',
    title: 'Linear regression',
    summary: 'Least squares with diagnostics, robust standard errors and Theil-Sen.',
    tutorial: {
      goal: 'Estimate how much the score changes as age increases.',
      dataset: 'score-groups.csv',
      steps: [
        'Dependent variable = Score, independents = Age.',
        'Keep OLS and, under Advanced, enable robust standard errors if you suspect heteroscedasticity.',
        'Run it and read coefficient, standard error, CI and R².',
        'Check the residual diagnostic charts.',
      ],
      expected: 'Coefficient table with CIs, goodness-of-fit statistics and residual diagnostics.',
    },
    advanced: {
      assumptions: [
        'Linearity, independent errors, homoscedasticity, normal residuals (for tests).',
        'No extreme collinearity between predictors.',
      ],
      whenToUse: ['Continuous outcome and an approximately linear relation.'],
      whenNotToUse: ['Binary outcome (logistic), counts (Poisson/NB), censored times (survival).'],
      reading: [
        'A coefficient is the expected change in the outcome for one more unit of the predictor, other things equal.',
        'R² describes explained variability, not the causal quality of the model.',
      ],
      pitfalls: [
        'Extrapolating outside the observed range of the predictors.',
        'Reading a coefficient in a model with interaction as an average effect.',
      ],
      glossary: [
        { term: 'HC3', definition: 'A robust standard-error estimator valid under heteroscedasticity.' },
        { term: 'Theil-Sen', definition: 'A robust line based on the median of pairwise slopes.' },
      ],
    },
    seeAlso: ['correlation', 'logistic', 'ancova'],
  },
  {
    id: 'logistic',
    area: 'procedures',
    title: 'Logistic regression',
    summary: 'Binary outcome with odds ratios, cutoff analysis and a Firth option.',
    tutorial: {
      goal: 'Estimate the effect of age on the probability of an event.',
      dataset: 'score-groups.csv',
      steps: [
        'Choose Outcome (0/1) and the predictors.',
        'Run it and read the odds ratios with confidence intervals.',
        'Look at the classification table and the suggested cutoff.',
        'Enable Firth with few events or separation.',
      ],
      expected: 'Coefficients, odds ratios with CIs, discrimination measures and a classification table.',
    },
    advanced: {
      assumptions: ['Independent observations; logit linear in the predictors.'],
      whenToUse: ['Dichotomous outcome (yes/no, alive/dead, success/failure).'],
      whenNotToUse: ['Ordered outcome with more than two categories (use ordinal logistic).'],
      reading: [
        'Odds ratio 1 = no association; 2 = doubled odds, not doubled probability.',
        'With rare events the odds ratio approximates the relative risk.',
      ],
      pitfalls: [
        'Few events per parameter make estimates unstable.',
        'The cutoff maximising accuracy is not necessarily the clinically useful one.',
      ],
      glossary: [
        { term: 'Odds', definition: 'The ratio between the probability that an event happens and that it does not.' },
        { term: 'Firth', definition: 'A penalised correction reducing bias with rare events.' },
      ],
    },
    seeAlso: ['regression', 'ordinal', 'chisquare'],
  },
  {
    id: 'countreg',
    area: 'procedures',
    title: 'Count regression',
    summary: 'Poisson and negative binomial models for count outcomes.',
    tutorial: {
      goal: 'Model the number of events as a function of a predictor.',
      dataset: 'score-groups.csv',
      steps: [
        'Choose the count outcome and the predictors.',
        'Start with Poisson; if the estimated dispersion is well above 1, switch to negative binomial.',
        'Run it and read the rate ratios with CIs.',
      ],
      expected: 'Coefficients, rate ratios, an overdispersion test and goodness of fit.',
    },
    advanced: {
      assumptions: ['Non-negative counts; for Poisson, mean equals variance.'],
      whenToUse: ['Number of events, calls or defects per unit.'],
      whenNotToUse: ['Counts with many structural zeros: consider zero-inflated models.'],
      reading: ['A rate ratio of 1.2 means an expected 20% increase in the number of events.'],
      pitfalls: ['Linear regression on small counts produces negative predictions.'],
      glossary: [
        { term: 'Overdispersion', definition: 'Variance larger than the mean, typical of real count data.' },
        { term: 'NB2', definition: 'Negative binomial with variance quadratic in the mean.' },
      ],
    },
    seeAlso: ['logistic', 'regression'],
  },
  {
    id: 'ordinal',
    area: 'procedures',
    title: 'Ordinal logistic regression',
    summary: 'Cumulative logit model for ordered outcomes.',
    tutorial: {
      goal: 'Study how a predictor shifts satisfaction across ordered levels.',
      dataset: 'score-groups.csv',
      steps: [
        'Choose the ordinal outcome (at least three ordered categories).',
        'Select the predictors and check the level order in the column.',
        'Run it and read the cumulative odds ratios with CIs.',
      ],
      expected: 'Coefficients with cumulative odds ratios and a test of the proportional-odds assumption.',
    },
    advanced: {
      assumptions: ['Proportional odds: the predictor effect is the same across all cut points.'],
      whenToUse: ['Likert scales, severity in ordered classes.'],
      whenNotToUse: ['Unordered categories: use multinomial or chi-square.'],
      reading: ['The cumulative odds ratio describes the probability of being in a higher category or above.'],
      pitfalls: ['If proportionality fails you need different models, not a simple reading of the ORs.'],
      glossary: [
        { term: 'Cumulative logit', definition: 'A model comparing each category with all higher ones.' },
        { term: 'Proportionality', definition: 'The assumption that predictor effects do not change across cut points.' },
      ],
    },
    seeAlso: ['logistic', 'contingency'],
  },
  {
    id: 'lmm',
    area: 'procedures',
    title: 'Linear mixed model (LMM)',
    summary: 'Random intercept for repeated measures or grouped subjects.',
    tutorial: {
      goal: 'Analyse repeated measures while accounting for within-subject correlation.',
      dataset: 'score-groups.csv',
      steps: [
        'Choose the outcome, the fixed predictors and the subject or cluster column.',
        'Run it and read the fixed coefficients with CIs.',
        'Compare the residual variance with the random-intercept variance.',
      ],
      expected: 'Fixed effects with standard errors, random variance estimate and fit criteria.',
    },
    advanced: {
      assumptions: ['Approximately normal residuals; correct covariance structure.'],
      whenToUse: ['Longitudinal data, clusters, repeated measures with missing data.'],
      whenNotToUse: ['Few clusters: variance estimates are unstable.'],
      reading: ['Fixed coefficients read like a regression, but the errors account for grouping.'],
      pitfalls: ['Treating repeated measures as independent underestimates standard errors.'],
      glossary: [
        { term: 'Fixed effect', definition: 'An average effect valid for the population.' },
        { term: 'Random effect', definition: 'Variation between units (subjects or clusters).' },
      ],
    },
    seeAlso: ['gee', 'repeatedanova'],
  },
];
