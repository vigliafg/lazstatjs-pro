#!/usr/bin/env Rscript
#
# Reference fixture for the Holt–Winters kernel.
#
# Source: stats::HoltWinters (R base), which is the canonical implementation of
# the additive and multiplicative recursions. Forecast::hw with
# initial = "simple" is not used because recent versions route through ETS.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/holtwinters.R

suppressPackageStartupMessages(library(jsonlite))

x <- as.numeric(datasets::AirPassengers)
result <- list(
  source = "stats::HoltWinters (R)",
  data = x,
  period = 12L,
  models = list()
)

for (seasonal in c("additive", "multiplicative")) {
  fit <- stats::HoltWinters(ts(x, frequency = 12), seasonal = seasonal)
  result$models[[seasonal]] <- list(
    seasonal = seasonal,
    alpha = unname(fit$alpha),
    beta = unname(fit$beta),
    gamma = unname(fit$gamma),
    sse = unname(fit$SSE),
    level = unname(fit$coef[1]),
    trend = unname(fit$coef[2]),
    seasonalFinal = unname(fit$coef[-(1:2)]),
    forecast = unname(as.numeric(predict(fit, 12)))
  )
}

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/holtwinters.json"
)
