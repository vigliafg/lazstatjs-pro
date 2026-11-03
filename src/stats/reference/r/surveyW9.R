#!/usr/bin/env Rscript
#
# Reference fixture for the design-based survey kernel.
#
# The survey package computes the same Taylor linearisation variance with the
# PSUs aggregated inside each stratum. The sample has two strata and three
# PSUs per stratum, so the design degrees of freedom are four.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/surveyW9.R

suppressPackageStartupMessages({
  library(survey)
  library(jsonlite)
})

data <- data.frame(
  stratum = rep(c("A", "B"), each = 6),
  psu = c("A1", "A1", "A2", "A2", "A3", "A3", "B1", "B1", "B2", "B2", "B3", "B3"),
  weight = c(1.2, 0.8, 1.1, 0.9, 1.4, 1.0, 0.7, 1.3, 1.0, 1.2, 0.8, 1.1),
  y = c(10, 12, 13, 15, 14, 16, 20, 22, 21, 23, 24, 26),
  age = c(30, 34, 40, 44, 50, 54, 32, 36, 42, 46, 52, 56),
  employed = c(1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1)
)

design <- svydesign(ids = ~psu, strata = ~stratum, weights = ~weight, data = data, nest = TRUE)

mean_estimate <- svymean(~y, design)
total_estimate <- svytotal(~y, design)
proportion_estimate <- svymean(~I(employed == 1), design)
regression <- svyglm(y ~ age, design = design)

result <- list(
  source = "survey::svydesign + svymean/svytotal/svyglm",
  data = data,
  mean = list(
    estimate = as.numeric(coef(mean_estimate)),
    se = as.numeric(SE(mean_estimate)),
    df = degf(design)
  ),
  total = list(
    estimate = as.numeric(coef(total_estimate)),
    se = as.numeric(SE(total_estimate)),
    df = degf(design)
  ),
  proportion = list(
    estimate = as.numeric(coef(proportion_estimate))[2],
    se = as.numeric(SE(proportion_estimate))[2],
    df = degf(design)
  ),
  regression = list(
    term = names(coef(regression)),
    estimate = as.numeric(coef(regression)),
    se = as.numeric(SE(regression)),
    df = degf(design)
  )
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/surveyW9.json"
)
