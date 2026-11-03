#!/usr/bin/env Rscript
#
# Reference fixture for ARIMAX (regression with ARMA errors).
#
# Source: forecast::Arima(method = "CSS"), which matches the conditional
# least-squares engine. R reports the intercept as the stationary mean of the
# ARMA error process (c / (1 - sum(phi))); the kernel reports c, so the test
# converts it before comparing.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/arimax.R

suppressPackageStartupMessages({
  library(forecast)
  library(jsonlite)
})

data <- na.omit(datasets::airquality[, c("Ozone", "Solar.R")])
y <- as.numeric(data$Ozone)
x <- as.numeric(data$Solar.R)

models <- lapply(list(c(1, 0, 0), c(0, 0, 1)), function(order) {
  fit <- Arima(y, order = order, xreg = x, method = "CSS")
  list(
    order = order,
    coefficients = as.list(coef(fit)),
    sse = sum(residuals(fit)^2),
    forecast = unname(as.numeric(forecast(fit, h = 5, xreg = rep(tail(x, 1), 5))$mean))
  )
})

writeLines(
  toJSON(
    list(
      source = "forecast::Arima (method = CSS)",
      y = y,
      x = x,
      models = models
    ),
    auto_unbox = TRUE,
    digits = NA,
    pretty = TRUE
  ),
  "src/stats/reference/fixtures/arimax.json"
)
