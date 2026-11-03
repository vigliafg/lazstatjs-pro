#!/usr/bin/env Rscript
#
# Reference fixture for the spectral kernel.
#
# Periodogram: spectrum(taper = 0, detrend = FALSE, demean = TRUE), which is
# |FFT(x - mean)|^2 / n at the Fourier frequencies.
# AR spectrum: ar(method = "yule-walker", order.max = 20) coefficients and
# prediction variance; the test compares the fitted AR model, not the arbitrary
# normalisation of spec.ar's density.
# Fisher's g: computed from the periodogram with the exact finite-sum p value.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/spectral.R

suppressPackageStartupMessages(library(jsonlite))

x <- as.numeric(datasets::AirPassengers)

periodogram <- spectrum(x, taper = 0, detrend = FALSE, demean = TRUE, plot = FALSE)
m <- length(periodogram$spec)
g <- max(periodogram$spec) / sum(periodogram$spec)
limit <- min(m, floor(1 / g))
p <- 0
for (j in seq_len(limit)) {
  p <- p + (-1)^(j - 1) * choose(m, j) * (1 - j * g)^(m - 1)
}

arfit <- ar(x, method = "yule-walker", order.max = 20, aic = TRUE)

result <- list(
  source = "stats::spectrum, stats::ar, Fisher g (exact finite sum)",
  data = x,
  frequency = periodogram$freq,
  power = periodogram$spec,
  fisher = list(
    g = unname(g),
    p = unname(p),
    frequency = unname(periodogram$freq[which.max(periodogram$spec)])
  ),
  ar = list(
    order = arfit$order,
    coefficients = unname(arfit$ar),
    variance = unname(arfit$var.pred)
  )
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/spectral.json"
)
