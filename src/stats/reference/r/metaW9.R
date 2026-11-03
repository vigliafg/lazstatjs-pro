#!/usr/bin/env Rscript
#
# Reference fixture for fixed- and random-effects meta-analysis.
#
# metafor::rma fits the same inverse-variance model; regtest gives Egger's
# weighted regression of the effect on the standard error.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/metaW9.R

suppressPackageStartupMessages({
  library(metafor)
  library(jsonlite)
})

data <- data.frame(
  study = sprintf("Study %02d", 1:9),
  effect = c(0.18, 0.24, 0.31, 0.12, 0.42, 0.27, 0.09, 0.35, 0.21),
  se = c(0.08, 0.10, 0.09, 0.12, 0.15, 0.07, 0.11, 0.13, 0.09)
)

fit <- function(method) {
  rma(yi = data$effect, sei = data$se, method = method)
}

extract <- function(model) {
  list(
    estimate = as.numeric(model$beta[1]),
    se = as.numeric(model$se),
    z = as.numeric(model$zval),
    p = as.numeric(model$pval),
    lo = as.numeric(model$ci.lb),
    hi = as.numeric(model$ci.ub),
    tau2 = as.numeric(model$tau2),
    q = as.numeric(model$QE),
    qDf = as.numeric(model$k - 1),
    qP = as.numeric(model$QEp),
    i2 = as.numeric(model$I2) / 100
  )
}

dl <- fit("DL")
reml <- fit("REML")
fe <- fit("FE")
# Egger's test is the weighted regression of the effect on the standard error;
# metafor::regtest reports the slope test, so the intercept is taken from lm().
egger_model <- lm(effect ~ se, data = data, weights = 1 / se^2)
egger_summary <- summary(egger_model)$coefficients

result <- list(
  source = "metafor::rma + regtest",
  data = data,
  DL = extract(dl),
  REML = extract(reml),
  FE = extract(fe),
  prediction = list(lo = as.numeric(predict(dl)$pi.lb), hi = as.numeric(predict(dl)$pi.ub)),
  egger = list(
    intercept = as.numeric(egger_summary[1, 1]),
    se = as.numeric(egger_summary[1, 2]),
    t = as.numeric(egger_summary[1, 3]),
    p = as.numeric(egger_summary[1, 4])
  )
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/metaW9.json"
)
