#!/usr/bin/env Rscript
#
# Reference fixture for Moran, Geary, local indicators and the spatial lag.
#
# The weights are the same row-standardised k-nearest-neighbour matrix built by
# the kernel; spdep and spatialreg then provide the independent statistics.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/spatialW9.R

suppressPackageStartupMessages({
  library(spdep)
  library(spatialreg)
  library(jsonlite)
})

set.seed(20261112)
n <- 30
data <- data.frame(
  X = round(runif(n, 0, 10), 4),
  Y = round(runif(n, 0, 10), 4),
  Covariate = round(rnorm(n), 4)
)
data$Value <- round(2 + 0.8 * data$X + 0.4 * data$Y + 1.2 * data$Covariate + rnorm(n, 0, 0.5), 4)

coords <- as.matrix(data[, c("X", "Y")])
neighbours <- knn2nb(knearneigh(coords, k = 4))
weights <- nb2listw(neighbours, style = "W")

moran <- moran.test(data$Value, weights, randomisation = FALSE)
geary <- geary.test(data$Value, weights, randomisation = FALSE)
local <- localmoran(data$Value, weights)
sar <- lagsarlm(Value ~ Covariate, data = data, listw = weights, type = "lag")

result <- list(
  source = "spdep::moran.test/geary.test/localmoran + spatialreg::lagsarlm",
  data = data,
  k = 4,
  moran = list(
    i = as.numeric(moran$estimate[1]),
    expected = as.numeric(moran$estimate[2]),
    se = sqrt(as.numeric(moran$estimate[3])),
    p = as.numeric(moran$p.value)
  ),
  geary = list(
    c = as.numeric(geary$estimate[1]),
    expected = as.numeric(geary$estimate[2]),
    p = as.numeric(geary$p.value)
  ),
  local = list(
    index = 1:n,
    value = as.numeric(local[, 1]),
    p = as.numeric(local[, 5])
  ),
  sar = list(
    rho = as.numeric(sar$rho),
    coefficients = as.numeric(sar$coefficients),
    se = as.numeric(sqrt(diag(vcov(sar)))),
    logLik = as.numeric(logLik(sar)),
    lr = as.numeric(2 * (logLik(sar) - logLik(lm(Value ~ Covariate, data = data))))
  )
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/spatialW9.json"
)
