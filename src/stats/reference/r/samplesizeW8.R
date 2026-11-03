#!/usr/bin/env Rscript
#
# Reference fixture for the power/regression logistic sample-size designs.
#
# Multiple regression uses pwr::pwr.f2.test. pwrss is not installed, so the
# logistic reference is the Hsieh et al. closed form that pwrss implements.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/samplesizeW8.R

suppressPackageStartupMessages({
  library(jsonlite)
  library(pwr)
})

regression <- function(u, f2, alpha, power) {
  fit <- pwr.f2.test(u = u, f2 = f2, sig.level = alpha, power = power)
  list(
    u = u,
    f2 = f2,
    alpha = alpha,
    power = power,
    v = fit$v,
    n = fit$v + u + 1
  )
}

logistic <- function(p, oddsRatio, alpha, power) {
  z <- qnorm(1 - alpha / 2) + qnorm(power)
  n <- z^2 / (p * (1 - p) * log(oddsRatio)^2)
  list(
    p = p,
    oddsRatio = oddsRatio,
    alpha = alpha,
    power = power,
    n = n
  )
}

result <- list(
  source = "pwr::pwr.f2.test and the Hsieh et al. logistic formula",
  regression = list(
    regression(3, 0.15, 0.05, 0.8),
    regression(5, 0.35, 0.01, 0.9),
    regression(2, 0.02, 0.05, 0.8)
  ),
  logistic = list(
    logistic(0.3, 2, 0.05, 0.8),
    logistic(0.5, 1.5, 0.05, 0.9)
  )
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/samplesizeW8.json"
)
