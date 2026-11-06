import type { HelpTopic } from './types';

/** Wave 3 procedures: generalized linear mixed models. */
export const w3Topics: HelpTopic[] = [
  {
    id: 'glmm',
    area: 'procedures',
    title: 'Generalized linear mixed model (GLMM)',
    summary:
      'Random intercepts and slopes for binary, count and continuous outcomes with a non-Gaussian family.',
    tutorial: {
      goal: 'Estimate the effect of a treatment on a binary or count outcome when observations are clustered (repeated visits, centres, litters) and the clustering cannot be ignored.',
      steps: [
        'Dependent variable: the outcome on its natural scale, for example a 0/1 response or a count per visit.',
        'Family and link: binomial with logit for 0/1, Poisson with log for counts, Gaussian with identity for an approximately normal outcome.',
        'Fixed effects: the predictors whose population-average effect you want, such as treatment, time and their interaction.',
        'Grouping column: the cluster identifier (subject, centre, batch). Every row must carry the level it belongs to.',
        'Random effects: start with a random intercept for the grouping column, then add a random slope for time only if the design has enough clusters and repeated observations.',
        'Run the model and read the fixed coefficients on the link scale, the variance components, the ICC and the conditional modes (BLUPs) per cluster.',
      ],
      expected:
        'A fixed-effects table with standard errors, z values and confidence intervals on the link scale, the random-effects variance components (intercept variance, slope variance, intercept-slope correlation), the residual or dispersion parameter where the family needs one, the ICC, the BLUPs for each level of the grouping column and information criteria (AIC, BIC) for comparing models.',
    },
    advanced: {
      assumptions: [
        'Conditional independence: given its random effects, each observation follows the chosen family and is independent of the others.',
        'The random effects are normally distributed with mean zero and a covariance matrix that is constant across clusters.',
        'Clusters are independent of each other and exchangeable, so no cluster-level variable is missing from the fixed part.',
        'The linear predictor is correctly specified on the link scale: the right link, the right functional form and no important interaction left out.',
        'Enough clusters to estimate a variance: roughly 20–30 levels is a practical minimum for a random intercept, and many more for a random slope.',
      ],
      whenToUse: [
        'Binary, count or skewed outcomes measured repeatedly on the same subjects, where a marginal model would hide the within-subject correlation.',
        'Multicentre or clustered designs in which the cluster effect is a nuisance to be modelled rather than a set of fixed contrasts.',
        'Counts with overdispersion that is explained by clustering rather than by an extra dispersion term.',
        'When you want cluster-specific predictions, that is the BLUP of each subject or centre, alongside the population-average effects.',
      ],
      whenNotToUse: [
        'Continuous, roughly normal outcomes with clustered data: a linear mixed model is simpler and does not need an approximation.',
        'A single binary or count outcome per subject with no clustering: the ordinary logistic or count regression is enough.',
        'Very few clusters (fewer than about ten): variance components are poorly estimated and fixed-effect standard errors are unreliable; consider fixed effects for the cluster or a marginal approach with small-sample corrections.',
        'When you only need population-averaged effects and are willing to model the correlation directly: GEE is more robust to misspecified random effects.',
      ],
      reading: [
        'Fixed coefficients are conditional, cluster-specific effects: with a logit link exp(β) is an odds ratio for a subject whose random effect is held constant, and it is larger in magnitude than the marginal odds ratio from a plain logistic model.',
        'With a log link exp(β) is a rate ratio; with the identity link the coefficient is an additive change in the mean.',
        'The intercept variance σ²ᵤ measures how much the baseline level varies between clusters; the slope variance measures how much the effect of a predictor varies, and the intercept-slope correlation says whether clusters that start higher also change faster.',
        'The ICC is the share of latent-scale variance attributable to the cluster: σ²ᵤ / (σ²ᵤ + π²/3) for logit, σ²ᵤ / (σ²ᵤ + 1) for log, and σ²ᵤ / (σ²ᵤ + σ²) for the Gaussian identity model. It describes clustering, not explained variance.',
        'A BLUP is the estimated deviation of one cluster from the population line, shrunk towards zero in proportion to how little information that cluster carries; it is a prediction, not a tested parameter.',
      'The variance components carry a standard error and a Wald CI on the log scale, and the fixed effects tests report the Wald statistic per term.'],
      pitfalls: [
        'Reading a conditional odds ratio as if it were the marginal one reported by logistic regression, or vice versa, and comparing the two numerically.',
        'Fitting a random slope with only a handful of clusters: the variance collapses to zero or the model fails to converge, and the standard errors become meaningless.',
        'Treating the BLUPs as data in a second-stage analysis; they are shrunken estimates and carry their own uncertainty.',
        'Forgetting that the Laplace approximation is an approximation: with binary data and few observations per cluster the variance components can be biased downwards, so refit with adaptive Gauss-Hermite quadrature or check sensitivity.',
        'Testing a variance component against zero with a plain likelihood-ratio test; the null is on the boundary and the p-value is conservative.',
      ],
      charts: [
        'Observed versus predicted: points coloured by cluster, with the diagonal as reference, showing where the model is calibrated and which clusters sit off the line.',
        'Caterpillar plot of the random effects: BLUPs sorted by size with approximate confidence bars, to spot outlying clusters and the amount of shrinkage.',
        'Residuals versus fitted values: Pearson or randomized quantile residuals against the linear predictor, to reveal a wrong link, remaining curvature or heteroscedasticity.',
      ],
      glossary: [
        {
          term: 'Random intercept',
          definition:
            'A cluster-specific shift of the baseline on the link scale, drawn from a normal distribution whose variance is estimated.',
        },
        {
          term: 'Random slope',
          definition:
            'A cluster-specific deviation in the effect of a predictor, with its own variance and correlation with the intercept.',
        },
        {
          term: 'Variance component',
          definition:
            'An estimated variance or covariance of the random effects, describing variability between clusters.',
        },
        {
          term: 'ICC',
          definition:
            'Intraclass correlation: the proportion of latent-scale variance that lies between clusters.',
        },
        {
          term: 'BLUP',
          definition:
            'Best linear unbiased predictor: the shrunken conditional estimate of a cluster effect.',
        },
        {
          term: 'Laplace approximation',
          definition:
            'A second-order Taylor expansion around the conditional mode of the random effects, used to integrate the likelihood.',
        },
        {
          term: 'Conditional model',
          definition:
            'A model whose coefficients describe a single cluster, as opposed to the marginal, population-averaged model.',
        },
      ],
    },
    seeAlso: ['lmm', 'logistic', 'countreg', 'glm'],
  },
  {
    id: 'pls',
    area: 'procedures',
    title: 'Partial least squares (PLS)',
    summary:
      'Latent components that maximise the covariance with the outcome, built for many correlated predictors.',
    tutorial: {
      goal: 'Predict a continuous outcome from many predictors that are strongly correlated with each other, where ordinary least squares gives unstable or uninterpretable coefficients.',
      steps: [
        'Dependent variable: the continuous outcome to predict.',
        'Predictors: the correlated measurements, such as spectral bands, sensor channels or questionnaire items.',
        'Components: start with two or three and increase while the cross-validated Q² improves.',
        'Cross-validation folds: five is a common choice; set zero to skip Q².',
        'Run the model and read the coefficients, the explained variance per component, the cumulative R² and Q², and the VIP scores.',
      ],
      expected:
        'A coefficient table on the original predictor scale, a component table with R², cumulative R² and Q², a VIP table that flags predictors with VIP above one, and charts of observed versus predicted values and of the fit by component.',
    },
    advanced: {
      whenToUse: [
        'Many predictors with strong collinearity, as in spectroscopy, chemometrics, omics or sensor data.',
        'Prediction is the goal and the individual coefficients are not the target of inference.',
        'The number of predictors is close to or larger than the number of observations.',
        'You want a small number of interpretable latent directions instead of a black-box model.',
      ],
      whenNotToUse: [
        'You need p-values or a causal effect for each predictor: use a regression with a clear design instead.',
        'There are few, weakly correlated predictors: ordinary least squares is simpler and easier to read.',
        'The relationship is strongly nonlinear: a spline or tree-based model may fit better.',
        'You cannot cross-validate because the sample is tiny or the observations are clustered and dependent.',
      ],
      reading: [
        'A coefficient is the change in the outcome per unit of that predictor when the other predictors are held at their observed values through the components; it is not a partial effect in the regression sense.',
        'R² is the share of outcome variance explained in the fitted sample; Q² is the same quantity under cross-validation and is the honest measure of predictive value.',
        'A component explains covariance between the predictors and the outcome, not just variance in the predictors; the cumulative R² shows how many components are useful.',
        'VIP above one marks predictors that contribute more than average to the components; VIP is a screening aid, not a significance test.',
        'Choose the smallest number of components after which Q² stops improving; adding components after that point mostly fits noise.',
      ],
      pitfalls: [
        'Choosing the number of components by R² alone, which always increases and hides overfitting.',
        'Reading a PLS coefficient as if it were an OLS partial slope or a causal effect.',
        'Forgetting to center the predictors, so the first component mostly captures the mean.',
        'Using cross-validation folds that leak information between training and test rows in clustered data.',
        'Reporting VIP as a p-value or as proof that a predictor is important.',
      ],
      charts: [
        'Observed versus predicted values, with the diagonal as the reference and points coloured by residual size.',
        'R² and Q² by number of components, to choose the smallest useful model.',
        'VIP scores by predictor, with the line at one separating the important from the marginal predictors.',
      ],
      glossary: [
        {
          term: 'Component',
          definition:
            'A latent direction in the predictor space chosen to maximise covariance with the outcome.',
        },
        {
          term: 'Weight',
          definition: 'The coefficient that defines a component as a linear combination of the predictors.',
        },
        {
          term: 'Loading',
          definition: 'The correlation between a predictor and a component.',
        },
        {
          term: 'VIP',
          definition:
            'Variable importance in projection: the share of the component-explained outcome variance carried by each predictor.',
        },
        {
          term: 'Q²',
          definition:
            'Cross-validated R²: the share of outcome variance predicted out of sample.',
        },
      ],
    },
    seeAlso: ['regression', 'glm', 'mars'],
  },
  {
    id: 'mars',
    area: 'procedures',
    title: 'GAM / MARS (adaptive splines)',
    summary:
      'Piecewise-linear hinge functions chosen automatically, with optional interactions and GCV pruning.',
    tutorial: {
      goal: 'Fit a flexible nonlinear relationship between a continuous outcome and one or more predictors without specifying the functional form in advance.',
      steps: [
        'Dependent variable: the continuous outcome.',
        'Predictors: the continuous variables whose effect may bend or change direction.',
        'Maximum degree: one for additive effects, two to allow a product of two hinge functions.',
        'Maximum terms: a budget for the basis functions; start around twenty and let pruning reduce it.',
        'Penalty and pruning: keep the default penalty of two and enable GCV pruning unless you need the full forward model.',
        'Run the model and read the selected basis terms, the knot positions, the GCV and R², and the predictor importance.',
      ],
      expected:
        'A table of selected hinge terms with their knots and coefficients, a fit table with RSS, GCV, R² and adjusted R², a predictor-importance table, and charts of observed versus predicted values and of the partial effect of the main predictor.',
    },
    advanced: {
      assumptions: [
        'The effect is continuous and can be approximated by piecewise-linear segments.',
        'Interactions, when enabled, are products of at most two hinge functions.',
        'The errors are independent and have roughly constant variance.',
        'There are enough observations around each knot to estimate the change in slope.',
      ],
      whenToUse: [
        'The shape of the effect is unknown or changes direction across the range of a predictor.',
        'You want an automatic, data-driven alternative to choosing a polynomial degree.',
        'You need to screen many predictors for nonlinear and interaction effects.',
        'Prediction matters more than a single interpretable coefficient.',
      ],
      whenNotToUse: [
        'You need one coefficient per predictor with a clear causal interpretation.',
        'You must extrapolate far beyond the observed range: hinge functions are local and extrapolate linearly.',
        'The sample is very small or the predictors are all categorical.',
        'A simple linear or polynomial model already fits and is easier to communicate.',
      ],
      reading: [
        'Each hinge term is a change of slope at a knot: a positive coefficient means the slope increases after the knot, a negative one means it decreases.',
        'The GCV balances the residual sum of squares against the number of terms; lower is better and it is the criterion used to prune.',
        'The selected terms are the pieces that survived pruning; a predictor with no selected term has no detectable nonlinear contribution.',
        'The partial-effect chart holds the other predictors at their observed values and shows the shape that the model attributes to one predictor.',
        'R² measures in-sample fit; because the terms were selected on the same data, compare models with GCV or a held-out sample.',
      ],
      pitfalls: [
        'Building a very large forward model and forgetting to prune, so the fit follows noise.',
        'Extrapolating beyond the range of the observed knots, where the piecewise-linear shape is arbitrary.',
        'Reading a hinge coefficient as the overall slope of the predictor instead of a local change.',
        'Ignoring interactions when the residual plot still shows structure.',
        'Comparing GCV across models fitted on different numbers of complete rows.',
      ],
      charts: [
        'Observed versus predicted values with the diagonal, to check calibration and spot outliers.',
        'Partial-effect profile of the first predictor, with the other predictors held at their observed values.',
        'Predictor importance, measured by the drop in fit when the predictor is removed from the selected terms.',
      ],
      glossary: [
        {
          term: 'Hinge function',
          definition:
            'A basis function of the form (x − t)+ or (t − x)+ that is zero on one side of the knot t and linear on the other.',
        },
        {
          term: 'Knot',
          definition: 'An observed value of a predictor where the slope of the fitted relationship changes.',
        },
        {
          term: 'GCV',
          definition:
            'Generalised cross-validation: a fit criterion that penalises the number of effective parameters.',
        },
        {
          term: 'Pruning',
          definition:
            'Backward removal of basis terms until the GCV can no longer be improved.',
        },
      ],
    },
    seeAlso: ['regression', 'nonlinear', 'pls'],
  },
  {
    id: 'iv',
    area: 'procedures',
    title: 'Instrumental variables (2SLS)',
    summary:
      'A consistent effect for an endogenous regressor, using instruments that affect it but not the outcome directly.',
    tutorial: {
      goal: 'Estimate the effect of a predictor that is correlated with the error term, because of omitted variables, measurement error or simultaneity.',
      steps: [
        'Outcome: the continuous dependent variable.',
        'Endogenous predictors: the regressors whose effect you want but which are not exogenous.',
        'Instruments: variables that predict the endogenous regressors and act on the outcome only through them.',
        'Exogenous predictors: controls that are already valid instruments for themselves.',
        'Robust standard errors: enable HC1 when the residual variance is not constant.',
        'Run the model and read the structural coefficients, the first-stage partial F, the Sargan overidentification test and the Wu–Hausman endogeneity test.',
      ],
      expected:
        'A structural equation with coefficients, standard errors, t values and confidence intervals, a first-stage table with the excluded instruments and their partial F, a diagnostics table with Sargan and Wu–Hausman, and charts of observed versus predicted values and of the OLS versus 2SLS coefficient.',
    },
    advanced: {
      assumptions: [
        'Relevance: the excluded instruments jointly predict the endogenous regressors after the exogenous controls.',
        'Exclusion: the instruments affect the outcome only through the endogenous regressors, not directly and not through omitted variables.',
        'Independence: the instruments are uncorrelated with the structural error.',
        'Linearity and correct specification of both the structural and the first-stage equations.',
        'With heterogeneous effects, 2SLS estimates a local average treatment effect for the compliers, not the average for everyone.',
      ],
      whenToUse: [
        'Omitted variables that are unobserved but correlated with a regressor.',
        'Measurement error in a key regressor, when a second noisy measure or an instrument is available.',
        'Simultaneity, as in supply and demand or price and quantity.',
        'Natural experiments, randomised encouragement designs and policy instruments.',
      ],
      whenNotToUse: [
        'The instruments are weak: a first-stage F below about ten makes the 2SLS estimate biased and its standard errors unreliable.',
        'The exclusion restriction is not credible: a valid instrument cannot be tested from the data alone.',
        'You need the average treatment effect rather than a local effect, and effects are heterogeneous.',
        'No credible instrument exists: an IV estimate with a bad instrument is worse than an honest OLS with a caveat.',
      ],
      reading: [
        'The 2SLS coefficient is the effect of a one-unit change in the endogenous regressor for the part of the variation that is driven by the instruments.',
        'The first-stage partial F tests whether the excluded instruments add explanatory power; values below ten signal weak instruments.',
        'Sargan tests the overidentifying restrictions when there are more instruments than endogenous regressors; a large p-value is consistent with validity, but it is not proof.',
        'The Wu–Hausman test compares OLS and 2SLS; a small p-value suggests that the regressor is endogenous and that 2SLS is needed.',
        'With one endogenous regressor and one instrument the model is just identified and Sargan cannot be computed.',
      ],
      pitfalls: [
        'Using a weak instrument, which biases 2SLS towards OLS and inflates the standard errors.',
        'Including the outcome or a post-treatment variable among the instruments.',
        'Treating a non-significant Sargan test as proof that the instruments are valid.',
        'Forgetting that the exclusion restriction is an assumption, not a test.',
        'Comparing OLS and 2SLS coefficients without reporting the first stage and the diagnostics.',
      ],
      charts: [
        'Observed versus predicted values from the structural equation.',
        'OLS and 2SLS coefficients for the endogenous regressor side by side, with confidence intervals.',
        'Residuals versus fitted values, to check for remaining structure and heteroscedasticity.',
      ],
      glossary: [
        {
          term: 'Endogenous regressor',
          definition:
            'A predictor correlated with the structural error, so that OLS is biased and inconsistent.',
        },
        {
          term: 'Instrument',
          definition:
            'A variable that predicts the endogenous regressor but affects the outcome only through it.',
        },
        {
          term: 'First stage',
          definition:
            'The regression of each endogenous regressor on the instruments and the exogenous controls.',
        },
        {
          term: 'Sargan test',
          definition:
            'An overidentification test of the joint validity of the instruments when the model is overidentified.',
        },
        {
          term: 'LATE',
          definition:
            'Local average treatment effect: the effect for the compliers whose treatment is shifted by the instrument.',
        },
      ],
    },
    seeAlso: ['regression', 'panel', 'selection'],
  },
  {
    id: 'panel',
    area: 'procedures',
    title: 'Panel model (fixed and random effects)',
    summary:
      'Within-entity fixed effects and GLS random effects for repeated observations on the same units.',
    tutorial: {
      goal: 'Estimate the effect of time-varying predictors while controlling for stable, unobserved differences between entities.',
      steps: [
        'Outcome: the continuous dependent variable measured repeatedly.',
        'Predictors: the time-varying regressors.',
        'Entity: the column that identifies the unit (person, firm, country).',
        'Time: the column that orders the repeated observations within each entity.',
        'Model: fixed effects, random effects, or both to compare them with the Hausman test.',
        'Run the model and read the within coefficients, the variance components, the Hausman test and the entity effects.',
      ],
      expected:
        'A fixed-effects table with within coefficients and cluster-robust standard errors, a random-effects table with GLS coefficients, variance components for the entity and idiosyncratic errors, a Hausman test, and charts of observed versus predicted values and of the entity effects.',
    },
    advanced: {
      assumptions: [
        'Fixed effects allow the unobserved entity effect to be correlated with the predictors; random effects require that it is not.',
        'Strict exogeneity: the idiosyncratic error is uncorrelated with the predictors at every period.',
        'No time-varying omitted variable that is correlated with both the predictors and the outcome.',
        'The entity and time identifiers are consistent and the panel structure is correctly declared.',
        'Serial correlation within an entity is handled by clustered standard errors.',
      ],
      whenToUse: [
        'Longitudinal data with repeated observations on the same units.',
        'You want to remove all stable between-entity confounding, observed or not.',
        'Aggregate panel data, such as countries or firms over years.',
        'You need to compare within and between sources of variation.',
      ],
      whenNotToUse: [
        'The predictor of interest is time-invariant: fixed effects absorb it entirely.',
        'The Hausman test rejects random effects: the random-effects estimate is inconsistent.',
        'There are very few entities, so the variance components and clustered standard errors are unreliable.',
        'The model is dynamic and includes a lagged dependent variable: the standard within estimator is biased.',
      ],
      reading: [
        'A fixed-effects coefficient is the average change within an entity when its predictor changes, so it identifies the effect from within-entity variation only.',
        'A random-effects coefficient is a precision-weighted combination of the within and between variation, and is more efficient when its assumption holds.',
        'The Hausman test compares the two: a small p-value says that the fixed-effects and random-effects estimates differ systematically, favouring fixed effects.',
        'The entity variance component measures how much of the outcome variability is persistent across entities; the idiosyncratic component is the remaining within-entity noise.',
        'R² within, between and overall describe different parts of the variation and should be read together.',
      ],
      pitfalls: [
        'Interpreting a fixed-effects coefficient as a between-entity comparison.',
        'Including a time-invariant predictor in a fixed-effects model and wondering why it is dropped.',
        'Using random effects when the Hausman test rejects them.',
        'Ignoring serial correlation and reporting unclustered standard errors.',
        'Treating a short panel as if it had many entities.',
      ],
      charts: [
        'Observed versus predicted values, to check calibration across the whole panel.',
        'Caterpillar plot of the entity effects, sorted by size, to spot outlying units.',
        'Fixed-effects versus random-effects coefficients with confidence intervals.',
      ],
      glossary: [
        {
          term: 'Within estimator',
          definition:
            'The fixed-effects estimator obtained after subtracting each entity mean, which removes all time-invariant entity effects.',
        },
        {
          term: 'Random effects',
          definition:
            'A GLS estimator that treats the entity effect as a random draw uncorrelated with the predictors.',
        },
        {
          term: 'Hausman test',
          definition:
            'A test comparing fixed and random effects; rejection favours the fixed-effects model.',
        },
        {
          term: 'Variance component',
          definition:
            'The estimated variance of the persistent entity effect or of the idiosyncratic error.',
        },
      ],
    },
    seeAlso: ['regression', 'lmm', 'iv'],
  },
  {
    id: 'selection',
    area: 'procedures',
    title: 'Tobit and Heckman selection',
    summary:
      'Censored regression for limited outcomes and two-step correction for sample selection.',
    tutorial: {
      goal: 'Estimate the effect of predictors when the outcome is observed only above or below a threshold, or only for a selected subgroup.',
      steps: [
        'Model: Tobit for a censored outcome, Heckman for a selected sample.',
        'Outcome: the censored variable for Tobit, or the observed outcome for Heckman.',
        'Predictors: the regressors of the outcome equation.',
        'Censoring limits: the lower and, optionally, the upper threshold for Tobit.',
        'Selection indicator and selection predictors: the 0/1 inclusion variable and the variables that explain inclusion for Heckman; include at least one variable that is not in the outcome equation.',
        'Run the model and read the coefficients, sigma, rho and the inverse Mills ratio coefficient.',
      ],
      expected:
        'For Tobit, latent-scale coefficients with standard errors, sigma, log-likelihood and AIC. For Heckman, an outcome equation, a selection equation, sigma, rho, lambda, the inverse Mills ratio and a Wald test of the selection correction. Charts show observed versus predicted values and the censoring or selection pattern.',
    },
    advanced: {
      assumptions: [
        'Tobit: a latent linear model with normal, homoscedastic errors and a known censoring threshold.',
        'Heckman: a probit selection equation and bivariate normal errors between the selection and outcome equations.',
        'Exclusion restriction: at least one variable affects selection but not the outcome directly.',
        'Correct functional form in both equations and independent observations.',
        'The censoring or selection mechanism is not driven by the outcome itself.',
      ],
      whenToUse: [
        'Wages observed only for people who work, with non-participation as the selection mechanism.',
        'Expenditures or hours with a meaningful lower limit and genuine censoring.',
        'Detection limits in laboratory measurements.',
        'Selection on unobservables that cannot be handled by matching on observed covariates.',
      ],
      whenNotToUse: [
        'The zeros are true outcomes rather than censored values: a two-part or hurdle model is more appropriate.',
        'Selection is believed to depend only on observed covariates: propensity matching is more transparent.',
        'There is no exclusion restriction: Heckman is identified only by the nonlinearity of the inverse Mills ratio and is fragile.',
        'Errors are strongly non-normal or heteroscedastic: the Tobit and Heckman estimates are inconsistent.',
      ],
      reading: [
        'Tobit coefficients are effects on the latent uncensored outcome, not on the observed mean; the marginal effect on the observed mean shrinks with the probability of being uncensored.',
        'Sigma is the standard deviation of the latent error; a large sigma means that censoring is substantial.',
        'In Heckman, rho is the correlation between the selection and outcome errors; a non-zero rho means that selection matters.',
        'Lambda is the coefficient of the inverse Mills ratio in the outcome equation; it is the correction term, not a causal effect.',
        'The selection equation should contain an instrument that predicts inclusion but can be excluded from the outcome equation; without it, identification rests on functional form alone.',
      ],
      pitfalls: [
        'Reading Tobit coefficients as effects on the observed outcome instead of the latent outcome.',
        'Running Heckman without an exclusion restriction and treating the result as robust.',
        'Using ordinary least squares on the selected sample and ignoring the selection bias.',
        'Confusing censoring with truncation: in a censored sample the censored units are observed as zeros, in a truncated sample they are absent.',
        'Believing that the two-step Heckman is maximum likelihood: it is consistent but less efficient, and the standard errors need the correction.',
      ],
      charts: [
        'Observed versus predicted values on the observed scale.',
        'Tobit: latent mean against the observed outcome, with the censoring line.',
        'Heckman: distribution of the inverse Mills ratio and the selection probability by outcome.',
      ],
      glossary: [
        {
          term: 'Censoring',
          definition:
            'The outcome is recorded at a limit rather than at its latent value, as with a wage of zero for non-participants.',
        },
        {
          term: 'Truncation',
          definition:
            'The units outside the limit are not observed at all, unlike censoring where they remain in the sample.',
        },
        {
          term: 'Inverse Mills ratio',
          definition:
            'The ratio of the normal density to the normal survival function at the selection index; it corrects the outcome equation.',
        },
        {
          term: 'Lambda',
          definition:
            'The coefficient of the inverse Mills ratio in the Heckman outcome equation.',
        },
        {
          term: 'Exclusion restriction',
          definition:
            'A variable that affects selection but not the outcome directly, which identifies the selection model.',
        },
      ],
    },
    seeAlso: ['regression', 'iv', 'propensity'],
  },
  {
    id: 'mediation',
    area: 'procedures',
    title: 'Mediation analysis',
    summary:
      'Indirect, direct and total effects of a predictor through a mediator, with Sobel and bootstrap intervals.',
    tutorial: {
      goal: 'Quantify how much of the effect of a predictor on an outcome passes through an intermediate variable.',
      steps: [
        'Outcome: the final continuous response.',
        'Predictor: the exposure or independent variable.',
        'Mediator: the intermediate variable that is assumed to lie on the pathway.',
        'Covariates: optional confounders of the predictor–mediator, predictor–outcome and mediator–outcome relationships.',
        'Bootstrap replicates: 1000 is a reasonable start; set zero to keep only the Sobel and delta intervals.',
        'Run the model and read the a, b and c′ paths, the indirect and total effects, the proportion mediated and the bootstrap confidence interval.',
      ],
      expected:
        'A path table with the a, b and c′ coefficients, an effect table with total, direct and indirect effects, their standard errors and confidence intervals, the proportion mediated, and a chart of the effect sizes and of the bootstrap distribution of the indirect effect.',
    },
    advanced: {
      assumptions: [
        'No unmeasured confounding of the predictor–outcome, predictor–mediator and mediator–outcome relationships.',
        'Temporal order: the predictor precedes the mediator, which precedes the outcome.',
        'The models are linear and correctly specified, without an unmodelled predictor × mediator interaction.',
        'Observations are independent, or the dependence is handled by the design.',
        'The mediator is measured without substantial error.',
      ],
      whenToUse: [
        'Mechanism questions: not only whether X affects Y, but through which pathway.',
        'Process evaluation and clinical or psychological pathways.',
        'You have a credible temporal order and have measured the main confounders.',
        'The indirect effect is the quantity of interest rather than a single regression coefficient.',
      ],
      whenNotToUse: [
        'The data are cross-sectional and the temporal order is only assumed: call it an association, not mediation.',
        'There is an unmeasured mediator–outcome confounder affected by the exposure.',
        'The predictor and the mediator interact: a moderated mediation model is needed.',
        'The total effect is near zero, which makes the proportion mediated unstable and uninterpretable.',
      ],
      reading: [
        'The indirect effect is a × b; the total effect is c′ + a × b; the direct effect is c′.',
        'The proportion mediated is the indirect effect divided by the total effect; it is unstable when the total effect is small and can fall outside 0–1.',
        'The Sobel standard error uses the delta method and is conservative; the percentile bootstrap interval is usually preferred.',
        'A bootstrap interval that excludes zero is evidence of an indirect effect; it is not a Bayesian posterior probability.',
        'With covariates, the paths are adjusted for them, so the effects are conditional on the covariate values.',
      ],
      pitfalls: [
        'Calling a cross-sectional association “mediation” without a credible temporal order.',
        'Ignoring confounding of the mediator–outcome relationship.',
        'Reporting the proportion mediated when the total effect is close to zero.',
        'Using the Sobel test as the only inference when the indirect effect is skewed.',
        'Forgetting to fix the bootstrap seed, so the interval changes at every run.',
      ],
      charts: [
        'Effect sizes for the direct, indirect and total effects, with confidence intervals.',
        'Bootstrap distribution of the indirect effect, with the percentile interval and zero marked.',
        'Path coefficients a, b and c′, to read the mechanism at a glance.',
      ],
      glossary: [
        {
          term: 'Indirect effect',
          definition:
            'The part of the predictor effect that passes through the mediator, estimated as a × b.',
        },
        {
          term: 'Direct effect',
          definition:
            'The part of the predictor effect that does not pass through the mediator, estimated as c′.',
        },
        {
          term: 'Sobel test',
          definition:
            'A delta-method test of the indirect effect that assumes a normal sampling distribution.',
        },
        {
          term: 'Percentile bootstrap',
          definition:
            'An interval from the empirical quantiles of the bootstrap distribution of the indirect effect.',
        },
        {
          term: 'Proportion mediated',
          definition:
            'The indirect effect divided by the total effect; a descriptive ratio, not a test.',
        },
      ],
    },
    seeAlso: ['regression', 'propensity'],
  },
  {
    id: 'propensity',
    area: 'procedures',
    title: 'Propensity score',
    summary:
      'Matching and inverse-probability weighting to estimate treatment effects in observational data.',
    tutorial: {
      goal: 'Compare a treated and an untreated group when treatment was not randomised but the relevant confounders have been measured.',
      steps: [
        'Treatment: the 0/1 indicator of receiving the treatment.',
        'Outcome: the continuous response.',
        'Covariates: the pre-treatment variables that predict both treatment and outcome.',
        'Method: nearest-neighbour matching or inverse-probability weighting.',
        'Caliper and ratio: for matching, the maximum distance in standard deviations of the logit score and the number of controls per treated unit.',
        'Run the model and read the propensity model, the balance table before and after adjustment, the ATT and the number of matched or effective observations.',
      ],
      expected:
        'A propensity-model table, a balance table with standardised mean differences before and after matching or weighting, the ATT with its standard error and confidence interval, the number of matched units or the effective sample size, and charts of the score overlap and of the balance improvement.',
    },
    advanced: {
      assumptions: [
        'Conditional exchangeability: treatment is independent of the potential outcomes given the measured covariates.',
        'Positivity: every treated unit has a positive probability of being untreated and vice versa, so the groups overlap.',
        'The propensity model is correctly specified and includes only pre-treatment covariates.',
        'Stable unit treatment value: one unit’s treatment does not affect another unit’s outcome.',
        'The outcome model, when used for the effect, is correctly specified or the matching is balanced.',
      ],
      whenToUse: [
        'Observational studies where treatment assignment depends on measured confounders.',
        'Programme evaluation and comparative effectiveness research.',
        'You want to make the treated and untreated groups comparable before estimating the effect.',
        'The estimand of interest is the effect on the treated (ATT).',
      ],
      whenNotToUse: [
        'Unmeasured confounding is plausible: matching cannot remove it.',
        'The groups have little overlap, so many treated units have no comparable controls.',
        'A credible instrument is available: instrumental variables target a different, often more credible, effect.',
        'Treatment is time-varying or the covariates are measured after treatment.',
      ],
      reading: [
        'The ATT is the average effect for the treated units, not for the whole population; the ATE requires weighting the whole sample.',
        'A standardised mean difference below 0.1 after adjustment is the usual rule of thumb for good balance.',
        'The caliper discards treated units without a close control; a smaller caliper improves balance but changes the estimand and reduces the sample.',
        'Inverse-probability weighting gives weights 1/e to the treated and 1/(1−e) to the controls; very large weights signal poor overlap.',
        'Always report balance before and after adjustment, not only the treatment effect.',
      ],
      pitfalls: [
        'Judging balance with significance tests instead of standardised differences.',
        'Ignoring common support and extrapolating to treated units with no comparable controls.',
        'Including post-treatment variables or the outcome in the propensity model.',
        'Reporting the ATT as if it were the average treatment effect for everyone.',
        'Using matching without checking the balance of the matched sample.',
      ],
      charts: [
        'Propensity-score overlap between treated and controls, to check common support.',
        'Love plot of standardised mean differences before and after adjustment.',
        'ATT with its confidence interval and the number of matched or effective observations.',
      ],
      glossary: [
        {
          term: 'Propensity score',
          definition:
            'The probability of receiving treatment given the measured covariates.',
        },
        {
          term: 'ATT',
          definition:
            'Average treatment effect on the treated: the effect for the units that actually received the treatment.',
        },
        {
          term: 'Standardised mean difference',
          definition:
            'The difference in means between groups divided by a pooled standard deviation; a scale-free balance measure.',
        },
        {
          term: 'Caliper',
          definition:
            'The maximum allowed distance between a treated unit and its matched control on the propensity-score scale.',
        },
        {
          term: 'Common support',
          definition:
            'The region of propensity scores where both treated and control units are observed.',
        },
      ],
    },
    seeAlso: ['logistic', 'iv', 'regression'],
  },
];
