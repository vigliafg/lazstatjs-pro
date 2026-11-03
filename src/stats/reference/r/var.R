#!/usr/bin/env Rscript
#
# Reference fixture for the VAR/VECM kernel.
#
# The independent implementation uses base R only: one lm() per equation for
# the VAR, chol() for orthogonalisation, and the Engle–Granger two-step with
# lm() plus tseries::adf.test for the VECM. The vars package is not required.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/var.R

suppressPackageStartupMessages({
  library(jsonlite)
  library(tseries)
})

## ---------------------------------------------------------------------------
## Data
## ---------------------------------------------------------------------------
set.seed(20261103)

# Stationary VAR(2), two variables, with correlated innovations.
varData <- matrix(0, nrow = 400, ncol = 2)
b1 <- matrix(c(0.5, 0.1, 0.2, 0.4), nrow = 2, byrow = TRUE)
b2 <- matrix(c(0.1, -0.1, 0.0, 0.2), nrow = 2, byrow = TRUE)
intercept <- c(1, 2)
sigma <- matrix(c(1, 0.3, 0.3, 1), nrow = 2)
cholSigma <- t(chol(sigma))
for (t in 1:400) {
  shock <- as.numeric(cholSigma %*% rnorm(2))
  if (t <= 2) {
    value <- intercept + shock
  } else {
    value <- intercept + b1 %*% varData[t - 1, ] + b2 %*% varData[t - 2, ] + shock
  }
  varData[t, ] <- value
}
varData <- varData[201:400, ]
colnames(varData) <- c("y1", "y2")

# Cointegrated pair: y1 = 2 y2 + stationary AR(1) error.
cointegrationData <- matrix(0, nrow = 150, ncol = 2)
errorState <- 0
for (t in 1:150) {
  errorState <- 0.6 * errorState + rnorm(1)
  y2 <- 0.05 * t + rnorm(1)
  cointegrationData[t, ] <- c(2 * y2 + errorState, y2)
}
colnames(cointegrationData) <- c("y1", "y2")

## ---------------------------------------------------------------------------
## VAR(2) by equation-wise OLS
## ---------------------------------------------------------------------------
p <- 2
k <- ncol(varData)
n <- nrow(varData)
design <- cbind(1, do.call(cbind, lapply(1:p, function(lag) varData[(p + 1 - lag):(n - lag), , drop = FALSE])))
y <- varData[(p + 1):n, , drop = FALSE]
T <- nrow(design)

coefficients <- vector("list", k)
residuals <- matrix(0, nrow = T, ncol = k)
for (j in 1:k) {
  fit <- lm(y[, j] ~ design - 1)
  coefficients[[j]] <- unname(coef(fit))
  residuals[, j] <- residuals(fit)
}

sigmaHat <- crossprod(residuals) / T
logLik <- -0.5 * T * (k * log(2 * pi) + log(det(sigmaHat)) + k)
parameters <- k * (1 + k * p)
aic <- -2 * logLik + 2 * parameters
bic <- -2 * logLik + log(T) * parameters

# Coefficient matrices B_l, each k x k.
bMatrices <- lapply(1:p, function(lag) {
  out <- matrix(0, nrow = k, ncol = k)
  for (j in 1:k) {
    out[j, ] <- coefficients[[j]][1 + ((lag - 1) * k + 1):((lag - 1) * k + k)]
  }
  out
})

# Orthogonalised IRF: Phi_0 = I, Theta_h = Phi_h %*% t(chol(sigma)).
horizon <- 6
phi <- list(diag(k))
for (h in 1:horizon) {
  current <- matrix(0, nrow = k, ncol = k)
  for (lag in 1:min(h, p)) current <- current + bMatrices[[lag]] %*% phi[[h - lag + 1]]
  phi[[h + 1]] <- current
}
irf <- lapply(0:horizon, function(h) phi[[h + 1]] %*% t(chol(sigmaHat)))

fevd <- list()
for (variable in 1:k) {
  cumulative <- matrix(0, nrow = k, ncol = horizon + 1)
  for (shock in 1:k) {
    cumulative[shock, ] <- cumsum(sapply(0:horizon, function(h) irf[[h + 1]][variable, shock]^2))
  }
  for (shock in 1:k) {
    for (h in 0:horizon) {
      total <- sum(cumulative[, h + 1])
      fevd[[length(fevd) + 1]] <- list(
        variable = colnames(varData)[variable],
        shock = colnames(varData)[shock],
        horizon = h,
        share = cumulative[shock, h + 1] / total
      )
    }
  }
}

# Granger F tests: unrestricted equation vs the same equation without the
# lags of the candidate cause.
granger <- list()
for (cause in 1:k) {
  for (effect in 1:k) {
    if (cause == effect) next
    full <- lm(y[, effect] ~ design - 1)
    keep <- c(1, which(rep(1:k, p) != cause) + 1)
    reduced <- lm(y[, effect] ~ design[, keep] - 1)
    test <- anova(reduced, full)
    granger[[length(granger) + 1]] <- list(
      cause = colnames(varData)[cause],
      effect = colnames(varData)[effect],
      f = unname(test$`F`[2]),
      df1 = unname(test$Df[2]),
      df2 = unname(test$Res.Df[2]),
      p = unname(test$`Pr(>F)`[2])
    )
  }
}

## ---------------------------------------------------------------------------
## VECM (Engle–Granger), two lags in differences
## ---------------------------------------------------------------------------
vecmP <- 2
coint <- lm(cointegrationData[, 1] ~ cointegrationData[, 2])
beta <- unname(coef(coint))
error <- residuals(coint)
adf <- adf.test(error, k = trunc((length(error) - 1)^(1/3)))

diffData <- diff(cointegrationData)
target <- diffData[(vecmP):nrow(diffData), , drop = FALSE]
designEcm <- cbind(
  1,
  error[2:(nrow(cointegrationData) - 1)],
  diffData[1:(nrow(diffData) - 1), , drop = FALSE]
)
vecmCoef <- vector("list", k)
vecmResiduals <- matrix(0, nrow = nrow(target), ncol = k)
for (j in 1:k) {
  fit <- lm(target[, j] ~ designEcm - 1)
  vecmCoef[[j]] <- unname(coef(fit))
  vecmResiduals[, j] <- residuals(fit)
}
vecmSigma <- crossprod(vecmResiduals) / nrow(target)
vecmLogLik <- -0.5 * nrow(target) * (k * log(2 * pi) + log(det(vecmSigma)) + k)
vecmParameters <- k * ncol(designEcm)
vecmAic <- -2 * vecmLogLik + 2 * vecmParameters
vecmBic <- -2 * vecmLogLik + log(nrow(target)) * vecmParameters

result <- list(
  source = "base R lm() VAR/VECM + tseries::adf.test",
  var = list(
    names = colnames(varData),
    data = unname(varData),
    lags = p,
    coefficients = coefficients,
    sigma = unname(sigmaHat),
    logLik = logLik,
    aic = aic,
    bic = bic,
    irf = lapply(irf, function(matrix) unname(matrix)),
    fevd = fevd,
    granger = granger
  ),
  vecm = list(
    names = colnames(cointegrationData),
    data = unname(cointegrationData),
    lags = vecmP,
    beta = beta,
    adf = list(stat = unname(adf$statistic), p = unname(adf$p.value), lags = adf$parameter),
    coefficients = vecmCoef,
    residuals = unname(vecmResiduals),
    logLik = vecmLogLik,
    aic = vecmAic,
    bic = vecmBic
  )
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/var.json"
)
