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
      ],
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
];
