#!/usr/bin/env Rscript
#
# Reference fixture for the Bayesian kernel.
#
# The conjugate models have closed-form posteriors; the Gaussian regression is
# compared with the least-squares fit, which is the limit of the Gibbs sampler
# under the vague prior used by the kernel.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/bayesW9.R

suppressPackageStartupMessages(library(jsonlite))

normal_y <- c(10.2, 9.8, 10.5, 10.1, 9.9, 10.3, 10.0, 10.4, 9.7, 10.6)
n <- length(normal_y)
ybar <- mean(normal_y)
s <- sd(normal_y)
scale <- s / sqrt(n)
df <- n - 1

proportion_y <- c(1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1)
successes <- sum(proportion_y)
trials <- length(proportion_y)

rate_y <- c(2, 3, 1, 4, 2, 3, 5, 1, 2, 3)
rate_sum <- sum(rate_y)
rate_n <- length(rate_y)

x <- c(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
regression_y <- c(4.2, 5.1, 6.8, 7.2, 8.9, 9.4, 11.1, 11.8, 12.9, 13.4)
regression <- lm(regression_y ~ x)

result <- list(
  source = "Closed-form conjugate posteriors and lm() for the regression limit",
  normal = list(
    data = normal_y,
    mean = ybar,
    sd = scale * sqrt(df / (df - 2)),
    lo = ybar + qt(0.025, df) * scale,
    hi = ybar + qt(0.975, df) * scale,
    df = df
  ),
  proportion = list(
    data = proportion_y,
    mean = successes / (trials + 2) * 1 + 1 / (trials + 2),
    lo = qbeta(0.025, successes + 1, trials - successes + 1),
    hi = qbeta(0.975, successes + 1, trials - successes + 1)
  ),
  rate = list(
    data = rate_y,
    mean = (rate_sum + 0.5) / rate_n,
    lo = qgamma(0.025, shape = rate_sum + 0.5, rate = rate_n),
    hi = qgamma(0.975, shape = rate_sum + 0.5, rate = rate_n)
  ),
  regression = list(
    x = x,
    y = regression_y,
    coefficients = as.numeric(coef(regression)),
    sigma = summary(regression)$sigma
  )
)

result$proportion$mean <- (successes + 1) / (trials + 2)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/bayesW9.json"
)
