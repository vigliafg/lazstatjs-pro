#!/usr/bin/env Rscript
#
# Reference fixture for the state-space kernel.
#
# Both models are implemented from the recursions with base R only:
#   - local level/linear trend: Kalman filter + RTS smoother, Gaussian MLE;
#   - two-regime Markov-switching AR(1): Hamilton filter + Kim smoother.
# The parameter transformations and starting values mirror the TypeScript
# kernel so the two optimisers see the same likelihood surface.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/statespace.R

suppressPackageStartupMessages(library(jsonlite))

## ---------------------------------------------------------------------------
## Data
## ---------------------------------------------------------------------------
set.seed(20261103)

nLocal <- 140
level <- numeric(nLocal)
trend <- numeric(nLocal)
level[1] <- 10
trend[1] <- 0.05
for (t in 2:nLocal) {
  trend[t] <- trend[t - 1] + rnorm(1, sd = 0.01)
  level[t] <- level[t - 1] + trend[t - 1] + rnorm(1, sd = 0.15)
}
localData <- level + rnorm(nLocal, sd = 0.5)

nMarkov <- 300
transition <- matrix(c(0.95, 0.05, 0.10, 0.90), nrow = 2, byrow = TRUE)
means <- c(-1, 2)
sds <- c(0.5, 1.2)
phi <- 0.4
states <- integer(nMarkov)
markovData <- numeric(nMarkov)
states[1] <- 1
markovData[1] <- means[1] + rnorm(1, sd = sds[1])
for (t in 2:nMarkov) {
  states[t] <- if (runif(1) < transition[states[t - 1], states[t - 1]]) states[t - 1] else 3 - states[t - 1]
  markovData[t] <- means[states[t]] + phi * markovData[t - 1] + rnorm(1, sd = sds[states[t]])
}

## ---------------------------------------------------------------------------
## Local level / linear trend
## ---------------------------------------------------------------------------
localFilter <- function(y, obs, lvl, trd, trend = TRUE) {
  dim <- if (trend) 2 else 1
  T <- if (trend) matrix(c(1, 1, 0, 1), 2, 2, byrow = TRUE) else matrix(1)
  Q <- if (trend) diag(c(lvl, trd)) else matrix(lvl)
  Z <- if (trend) matrix(c(1, 0), 1, 2) else matrix(1)
  H <- obs
  a <- if (trend) c(y[1], 0) else y[1]
  P <- diag(rep(H * 1e3, dim))
  n <- length(y)
  filtered <- vector("list", n)
  predicted <- vector("list", n)
  residuals <- numeric(n)
  variances <- numeric(n)
  logLik <- 0
  for (t in 1:n) {
    if (t > 1) {
      a <- as.numeric(T %*% a)
      P <- T %*% P %*% t(T) + Q
    }
    predicted[[t]] <- P
    forecast <- as.numeric(Z %*% a)
    F <- as.numeric(Z %*% P %*% t(Z) + H)
    residual <- y[t] - forecast
    residuals[t] <- residual
    variances[t] <- F
    if (t > 1) logLik <- logLik - 0.5 * (log(2 * pi) + log(F) + residual^2 / F)
    K <- P %*% t(Z) / F
    a <- a + as.numeric(K) * residual
    P <- P - K %*% Z %*% P
    filtered[[t]] <- list(a = a, P = P)
  }
  list(logLik = logLik, filtered = filtered, predicted = predicted, residuals = residuals, variances = variances, T = T, Q = Q)
}

smoothed <- function(result, trend = TRUE) {
  n <- length(result$filtered)
  T <- result$T
  a <- vector("list", n)
  P <- vector("list", n)
  a[[n]] <- result$filtered[[n]]$a
  P[[n]] <- result$filtered[[n]]$P
  for (t in (n - 1):1) {
    J <- result$filtered[[t]]$P %*% t(T) %*% solve(result$predicted[[t + 1]])
    a[[t]] <- result$filtered[[t]]$a + as.numeric(J %*% (a[[t + 1]] - T %*% result$filtered[[t]]$a))
    P[[t]] <- result$filtered[[t]]$P + J %*% (P[[t + 1]] - result$predicted[[t + 1]]) %*% t(J)
  }
  list(a = a, P = P)
}

localObjective <- function(par) {
  if (any(!is.finite(par)) || any(par > 30)) return(1e15)
  result <- localFilter(localData, exp(par[1]), exp(par[2]), exp(par[3]), TRUE)
  if (!is.finite(result$logLik)) return(1e15)
  -result$logLik
}

sampleVariance <- var(localData)
localStarts <- list(
  c(log(sampleVariance * 0.2), log(sampleVariance * 0.01), log(sampleVariance * 0.001)),
  c(log(sampleVariance * 0.5), log(sampleVariance * 0.05), log(sampleVariance * 0.005)),
  c(log(sampleVariance * 0.1), log(sampleVariance * 0.1), log(sampleVariance * 0.01))
)
localFits <- lapply(localStarts, function(start) {
  optim(start, localObjective, method = "BFGS", control = list(maxit = 2000, reltol = 1e-12))
})
localBest <- localFits[[which.min(sapply(localFits, function(fit) fit$value))]]
localPar <- exp(localBest$par)
localResult <- localFilter(localData, localPar[1], localPar[2], localPar[3], TRUE)
localSmooth <- smoothed(localResult, TRUE)
localLogLik <- localResult$logLik

# Forecast from the last smoothed state.
T <- localResult$T
Q <- localResult$Q
Z <- matrix(c(1, 0), 1, 2)
a <- localSmooth$a[[length(localData)]]
P <- localSmooth$P[[length(localData)]]
localForecast <- matrix(0, nrow = 5, ncol = 2)
for (h in 1:5) {
  a <- as.numeric(T %*% a)
  P <- T %*% P %*% t(T) + Q
  localForecast[h, 1] <- as.numeric(Z %*% a)
  localForecast[h, 2] <- as.numeric(Z %*% P %*% t(Z)) + localPar[1]
}

## ---------------------------------------------------------------------------
## Markov switching AR(1)
## ---------------------------------------------------------------------------
stationary <- function(p11, p22) {
  denominator <- 2 - p11 - p22
  first <- if (denominator > 0) (1 - p22) / denominator else 0.5
  c(first, 1 - first)
}

markovFilter <- function(y, mu1, mu2, s1, s2, phi, p11, p22) {
  P <- matrix(c(p11, 1 - p11, 1 - p22, p22), 2, 2, byrow = TRUE)
  state <- stationary(p11, p22)
  n <- length(y)
  filtered <- matrix(0, n - 1, 2)
  predicted <- matrix(0, n - 1, 2)
  logLik <- 0
  for (t in 2:n) {
    forecastMean <- c(mu1 + phi * y[t - 1], mu2 + phi * y[t - 1])
    predictedState <- as.numeric(state %*% P)
    density <- c(dnorm(y[t], forecastMean[1], sqrt(s1)), dnorm(y[t], forecastMean[2], sqrt(s2)))
    joint <- predictedState * density
    total <- sum(joint)
    if (!is.finite(total) || total <= 0) return(list(logLik = -Inf))
    logLik <- logLik + log(total)
    predicted[t - 1, ] <- predictedState
    state <- joint / total
    filtered[t - 1, ] <- state
  }
  list(logLik = logLik, filtered = filtered, predicted = predicted, P = P)
}

kimSmoother <- function(filtered, predicted, P) {
  n <- nrow(filtered)
  smoothed <- matrix(0, n, 2)
  smoothed[n, ] <- filtered[n, ]
  for (t in (n - 1):1) {
    for (regime in 1:2) {
      total <- 0
      for (nextState in 1:2) {
        if (predicted[t + 1, nextState] > 0) {
          total <- total + P[regime, nextState] * smoothed[t + 1, nextState] / predicted[t + 1, nextState]
        }
      }
      smoothed[t, regime] <- filtered[t, regime] * total
    }
    smoothed[t, ] <- smoothed[t, ] / sum(smoothed[t, ])
  }
  smoothed
}

markovObjective <- function(par) {
  if (any(!is.finite(par)) || any(abs(par) > 30)) return(1e15)
  phi <- tanh(par[3])
  p11 <- 1 / (1 + exp(-par[6]))
  p22 <- 1 / (1 + exp(-par[7]))
  result <- markovFilter(markovData, par[1], par[2], exp(par[4]), exp(par[5]), phi, p11, p22)
  if (!is.finite(result$logLik)) return(1e15)
  -result$logLik
}

markovMean <- mean(markovData)
markovVariance <- var(markovData)
markovStarts <- list(
  c(markovMean - sqrt(markovVariance) * 0.5, markovMean + sqrt(markovVariance) * 0.5, 0.3, log(markovVariance * 0.5), log(markovVariance * 1.5), 2.2, 2.2),
  c(markovMean + sqrt(markovVariance) * 0.5, markovMean - sqrt(markovVariance) * 0.5, 0.1, log(markovVariance * 1.5), log(markovVariance * 0.5), 1.5, 2.5),
  c(markovMean - sqrt(markovVariance), markovMean + sqrt(markovVariance), 0.5, log(markovVariance * 0.3), log(markovVariance * 2), 2.5, 1.5)
)
markovFits <- lapply(markovStarts, function(start) {
  optim(start, markovObjective, method = "BFGS", control = list(maxit = 3000, reltol = 1e-12))
})
markovBest <- markovFits[[which.min(sapply(markovFits, function(fit) fit$value))]]
par <- markovBest$par
mPhi <- tanh(par[3])
mP11 <- 1 / (1 + exp(-par[6]))
mP22 <- 1 / (1 + exp(-par[7]))
markovResult <- markovFilter(markovData, par[1], par[2], exp(par[4]), exp(par[5]), mPhi, mP11, mP22)
markovSmooth <- kimSmoother(markovResult$filtered, markovResult$predicted, markovResult$P)

result <- list(
  source = "base R Kalman/RTS and Hamilton/Kim recursions",
  local = list(
    data = localData,
    observationVariance = unname(localPar[1]),
    levelVariance = unname(localPar[2]),
    trendVariance = unname(localPar[3]),
    logLik = unname(localLogLik),
    levels = unname(sapply(localSmooth$a, function(value) value[1])),
    trends = unname(sapply(localSmooth$a, function(value) value[2])),
    forecastMean = unname(localForecast[, 1]),
    forecastVariance = unname(localForecast[, 2])
  ),
  markov = list(
    data = markovData,
    means = unname(par[1:2]),
    variances = unname(exp(par[4:5])),
    phi = unname(mPhi),
    transition = unname(matrix(c(mP11, 1 - mP11, 1 - mP22, mP22), 2, 2, byrow = TRUE)),
    logLik = unname(markovResult$logLik),
    smoothed = unname(markovSmooth),
    forecastMean = unname(sapply(1:5, function(h) {
      state <- markovSmooth[nrow(markovSmooth), ]
      previous <- tail(markovData, 1)
      value <- NA
      for (step in 1:h) {
        nextState <- as.numeric(state %*% markovResult$P)
        value <- sum(nextState * (par[1:2] + mPhi * previous))
        state <- nextState
        previous <- value
      }
      value
    }))
  )
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/statespace.json"
)
