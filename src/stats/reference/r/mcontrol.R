#!/usr/bin/env Rscript
#
# Reference fixture for the Hotelling T² control chart.
#
# Base R only: group means, pooled within-subgroup covariance, solve() and
# qf(). The data are fixed so the fixture can be compared point by point.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/mcontrol.R

suppressPackageStartupMessages(library(jsonlite))

## ---------------------------------------------------------------------------
## Data: 10 subgroups of 3 observations on two correlated variables
## ---------------------------------------------------------------------------
set.seed(20261105)
base <- cbind(
  rnorm(10, mean = 10, sd = 0.4),
  rnorm(10, mean = 5, sd = 0.3)
)
base[8, ] <- base[8, ] + c(2.5, 1.8)
rows <- matrix(0, nrow = 30, ncol = 2)
for (g in 1:10) {
  for (r in 1:3) {
    rows[(g - 1) * 3 + r, ] <- base[g, ] + c(rnorm(1, sd = 0.15), rnorm(1, sd = 0.12))
  }
}

m <- 10
n <- 3
p <- 2
alpha <- 0.05
means <- t(vapply(1:m, function(g) colMeans(rows[((g - 1) * n + 1):(g * n), , drop = FALSE]), numeric(p)))
center <- colMeans(means)
S <- matrix(0, p, p)
for (g in 1:m) {
  block <- rows[((g - 1) * n + 1):(g * n), , drop = FALSE]
  for (i in 1:n) {
    delta <- block[i, ] - center
    S <- S + tcrossprod(delta)
  }
}
S <- S / (m * (n - 1))
Sinv <- solve(S)
t2 <- vapply(
  1:m,
  function(g) {
    delta <- means[g, ] - center
    as.numeric(n * t(delta) %*% Sinv %*% delta)
  },
  numeric(1)
)
df2 <- m * n - m - p + 1
factor <- p * (m - 1) * (n - 1) / df2
critical <- qf(1 - alpha, p, df2)
ucl <- factor * critical

result <- list(
  source = "Base R solve() and qf() on the pooled within-subgroup covariance",
  data = rows,
  alpha = alpha,
  subgroup = n,
  variables = c("Length", "Width"),
  center = center,
  covariance = S,
  t2 = t2,
  df1 = p,
  df2 = df2,
  critical = critical,
  ucl = ucl
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/mcontrol.json"
)
