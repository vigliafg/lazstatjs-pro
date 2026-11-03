#!/usr/bin/env Rscript
#
# Reference fixture for the hierarchical normal model.
#
# lme4 gives the maximum-likelihood random-intercept fit; the Bayesian
# posterior means shrink the group means in the same direction, so the
# comparison is on the centre of the posterior, not on its tails.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/bayesHierW9.R

suppressPackageStartupMessages({
  library(lme4)
  library(jsonlite)
})

set.seed(20261116)
groups <- 6
per_group <- 8
group_effect <- c(-2.4, -1.2, -0.3, 0.6, 1.5, 2.8)
data <- data.frame(
  Group = rep(sprintf("G%d", 1:groups), each = per_group),
  Y = round(10 + rep(group_effect, each = per_group) + rnorm(groups * per_group, 0, 1.1), 4)
)

fit <- lmer(Y ~ 1 + (1 | Group), data = data, REML = FALSE)
variance <- as.data.frame(VarCorr(fit))
sigma <- attr(VarCorr(fit), "sc")
tau <- sqrt(variance$vcov[variance$grp == "Group"])
mu <- as.numeric(fixef(fit))
conditional <- mu + as.numeric(ranef(fit)$Group[, 1])

result <- list(
  source = "lme4::lmer(Y ~ 1 + (1 | Group))",
  data = data,
  mu = mu,
  sigma = sigma,
  tau = tau,
  groups = sprintf("G%d", 1:groups),
  groupMeans = conditional
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/bayesHierW9.json"
)
