import type { HelpTopic } from './types';

/** Wave 4 procedures: log-linear models for two-way tables. */
export const w4Topics: HelpTopic[] = [
  {
    id: 'loglinear',
    area: 'procedures',
    title: 'Log-linear model for two-way tables',
    summary: 'Poisson model for the counts of a two-way table: independence or saturated interaction.',
    tutorial: {
      goal: 'Decide whether the row and column categories of a two-way table are associated, and quantify the association.',
      steps: [
        'Choose the row and column labels and enter the observed counts, cell by cell.',
        'Start with the independence model: it estimates row and column main effects only.',
        'Run it and read G², its degrees of freedom and the p-value.',
        'If the independence model does not fit, switch to the saturated model to see how far the cells move from independence.',
        'Inspect the coefficients on the log scale and exp(β) as multiplicative factors.',
        'For a 2×2 table, read the interaction exponent as the odds ratio with its confidence interval.',
      ],
      expected:
        'A fit table with G², df, p, null deviance and AIC; a coefficient table with β, SE, z, p, exp(β) and CI; expected counts and standardised residuals; a heatmap of the residuals and observed-versus-expected bars.',
    },
    advanced: {
      assumptions: [
        'Counts are independent observations, one per cell, and each unit falls in exactly one cell.',
        'The expected count of every cell is positive; the Poisson variance equals the mean.',
        'The log of the expected count is a linear function of the row and column effects, and of their interaction in the saturated model.',
        'With small expected counts the χ² approximation of G² is fragile.',
      ],
      whenToUse: [
        'Two categorical variables cross-tabulated, when you want a model-based test of independence.',
        'When you need expected counts, residuals and a coefficient-level reading of the association.',
        'To compare the independence model with the saturated model for a 2×2 table and obtain the odds ratio.',
      ],
      whenNotToUse: [
        'Three or more categorical factors: higher-order interactions are needed and this page covers only two-way tables.',
        'Very sparse tables with many zero cells: exact or penalised methods are safer.',
      ],
      reading: [
        'G² is the likelihood-ratio statistic: large values relative to its degrees of freedom mean the expected counts under the model are far from the observed ones.',
        'In a two-way table the independence model has (R−1)(C−1) residual degrees of freedom; the saturated model has none and reproduces the data exactly.',
        'Coefficients are on the log scale: exp(β) is the factor by which the expected count changes when the category changes, holding the other factor fixed.',
        'For a 2×2 table the interaction coefficient is the log odds ratio; exp(β) = 1 means independence.',
      ],
      pitfalls: [
        'Reading a coefficient p-value as a test of the whole model: start from G² and the residual df.',
        'Interpreting association as causation: the row/column order is arbitrary and the model does not say which variable drives the other.',
        'Ignoring small expected counts: the G² p-value can be anti-conservative.',
        'Using the saturated model as evidence: it always fits and has no test.',
      ],
      charts: [
        'Heatmap of standardised residuals, with cells far from zero highlighted.',
        'Observed versus expected bars by cell, to see where the model misses.',
      ],
      glossary: [
        { term: 'G²', definition: 'Likelihood-ratio statistic comparing observed counts with the model expected counts.' },
        { term: 'Saturated model', definition: 'A model with one parameter per cell; it reproduces the data and has zero residual df.' },
        { term: 'Odds ratio', definition: 'Ratio of the odds in one group to the odds in the other; exp(interaction) in a 2×2 log-linear model.' },
      ],
    },
    seeAlso: ['contingency', 'chisquare'],
  },
];
