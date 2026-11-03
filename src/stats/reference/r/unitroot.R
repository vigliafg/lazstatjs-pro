#!/usr/bin/env Rscript
#
# Reference fixture for the unit-root kernel.
#
# KPSS: tseries::kpss.test (level and trend, short truncation lag).
# PP:   urca::ur.pp(type = "Z-tau", model = "constant", lags = "short").
# ADF:  tseries::adf.test; the fixture stores the lag length R uses
#       (k = trunc((n - 1)^(1/3))) so the kernel can match the same regression.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/unitroot.R

suppressPackageStartupMessages({
  library(jsonlite)
  library(tseries)
  library(urca)
})

level <- as.numeric(datasets::AirPassengers)
difference <- diff(level)

analyse <- function(x) {
  n <- length(x)
  k <- trunc((n - 1)^(1/3))
  adf <- tseries::adf.test(x, k = k)
  kpss_level <- tseries::kpss.test(x, null = "Level")
  kpss_trend <- tseries::kpss.test(x, null = "Trend")
  pp <- urca::ur.pp(x, type = "Z-tau", model = "constant", lags = "short")
  list(
    adf = list(stat = unname(adf$statistic), p = unname(adf$p.value), lags = k),
    kpssLevel = list(
      stat = unname(kpss_level$statistic),
      p = unname(kpss_level$p.value),
      lags = unname(kpss_level$parameter)
    ),
    kpssTrend = list(
      stat = unname(kpss_trend$statistic),
      p = unname(kpss_trend$p.value),
      lags = unname(kpss_trend$parameter)
    ),
    pp = list(
      stat = unname(pp@teststat),
      lags = unname(pp@lag),
      cv5 = unname(pp@cval[1, "5pct"])
    )
  )
}

result <- list(
  source = "tseries::adf.test, tseries::kpss.test, urca::ur.pp",
  level = level,
  difference = difference,
  levelTests = analyse(level),
  differenceTests = analyse(difference)
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/unitroot.json"
)
