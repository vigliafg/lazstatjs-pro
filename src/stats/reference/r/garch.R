#!/usr/bin/env Rscript
#
# Reference fixture for the GARCH(1,1) kernel.
#
# The reference uses base R's optim() on the same transformed parameterisation
# (log ω, logit α, logit β with α + β < 1) and the same Gaussian likelihood;
# rugarch is not required.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/garch.R

suppressPackageStartupMessages(library(jsonlite))

set.seed(20261103)
n <- 500
omega <- 0.05
alpha <- 0.10
beta <- 0.85
epsilon <- numeric(n)
sigma2 <- numeric(n)
sigma2[1] <- omega / (1 - alpha - beta)
for (t in 1:n) {
  if (t > 1) sigma2[t] <- omega + alpha * epsilon[t - 1]^2 + beta * sigma2[t - 1]
  epsilon[t] <- rnorm(1, sd = sqrt(sigma2[t]))
}
returns <- 0.02 + epsilon

meanReturn <- mean(returns)
residuals <- returns - meanReturn
sampleVariance <- var(residuals)

decode <- function(parameters) {
  omegaHat <- exp(parameters[1])
  alphaHat <- plogis(parameters[2]) * 0.999
  betaHat <- plogis(parameters[3]) * (0.999 - alphaHat)
  list(omega = omegaHat, alpha = alphaHat, beta = betaHat)
}

negativeLogLik <- function(parameters) {
  model <- decode(parameters)
  variance <- numeric(length(residuals))
  variance[1] <- sampleVariance
  value <- 0
  for (t in seq_along(residuals)) {
    if (t > 1) {
      variance[t] <- model$omega + model$alpha * residuals[t - 1]^2 + model$beta * variance[t - 1]
    }
    if (!is.finite(variance[t]) || variance[t] <= 0) return(1e15)
    value <- value + 0.5 * (log(2 * pi) + log(variance[t]) + residuals[t]^2 / variance[t])
  }
  value
}

start <- c(log(0.1 * sampleVariance), qlogis(0.1), qlogis(0.8))
fit <- optim(start, negativeLogLik, method = "BFGS", control = list(maxit = 2000, reltol = 1e-12))
model <- decode(fit$par)
logLik <- -fit$value
persistence <- model$alpha + model$beta
longRun <- model$omega / (1 - persistence)

lastVariance <- tail(numeric(0), 1)
# Recompute the final conditional variance with the fitted parameters.
variance <- numeric(length(residuals))
variance[1] <- sampleVariance
for (t in 2:length(residuals)) {
  variance[t] <- model$omega + model$alpha * residuals[t - 1]^2 + model$beta * variance[t - 1]
}
nextVariance <- model$omega + model$alpha * tail(residuals, 1)^2 + model$beta * tail(variance, 1)
forecast <- sapply(1:10, function(step) {
  longRun + persistence^(step - 1) * (nextVariance - longRun)
})

result <- list(
  source = "base R optim() GARCH(1,1) Gaussian QML",
  returns = returns,
  omega = unname(model$omega),
  alpha = unname(model$alpha),
  beta = unname(model$beta),
  logLik = unname(logLik),
  persistence = unname(persistence),
  longRunVariance = unname(longRun),
  halfLife = unname(log(0.5) / log(persistence)),
  lastVariance = unname(tail(variance, 1)),
  forecastVariance = unname(forecast)
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/garch.json"
)
