# Reference fixtures — instrumental variables (2SLS).
#
# Generates ../fixtures/iv.json from AER::ivreg() on the bundled sample
# `samples/regression/iv_demo/data.csv`, for both the homoskedastic and the
# HC1 heteroskedasticity-robust variance.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/iv.R
#
# The output is committed so `npm test` never needs R. Re-run it only when the
# dataset or the expected model changes; review the diff before committing.
#
# Definitions used by the kernel and reproduced here:
# - first stage: each endogenous regressor on all instruments (intercept,
#   included exogenous, excluded instruments); F is the partial F of the
#   excluded instruments (AER:::ivdiag).
# - Sargan: n * R^2 from the regression of the 2SLS residuals on all
#   instruments (with intercept); df = #excluded instruments - #endogenous.
# - Wu-Hausman: F comparing OLS of y on X with the augmented regression of y
#   on X and the first-stage fitted endogenous regressors (AER:::ivdiag,
#   classical/not robust variant in both cases).

suppressMessages(library(AER))
suppressMessages(library(sandwich))
suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/iv.json"
input <- if (length(args) >= 2) args[2] else "samples/regression/iv_demo/data.csv"

data <- read.csv(input, stringsAsFactors = FALSE)
model <- ivreg(Y ~ W + X | W + Z1 + Z2, data = data)

x <- model.matrix(model, component = "regressors")
z <- model.matrix(model, component = "instruments")
y <- model.response(model.frame(model))
n <- nrow(x)

matrix_columns <- function(m) lapply(seq_len(ncol(m)), function(j) unname(m[, j]))
coefficient_rows <- function(beta, se) {
  lapply(seq_along(beta), function(index) {
    list(term = names(beta)[index], beta = unname(beta[index]), se = unname(se[index]))
  })
}

# First stage of each endogenous regressor on all instruments.
xnam <- colnames(x)
znam <- colnames(z)
endogenous <- which(!(xnam %in% znam))
excluded <- which(!(znam %in% xnam))
df2 <- n - qr(z)$rank
first_stage <- lapply(endogenous, function(endo) {
  response <- x[, endo]
  fit <- lm.fit(z, response)
  rss1 <- sum(fit$residuals^2)
  fit0 <- lm.fit(z[, -excluded, drop = FALSE], response)
  rss0 <- sum(fit0$residuals^2)
  q <- length(excluded)
  f <- ((rss0 - rss1) / q) / (rss1 / df2)
  covariance <- solve(crossprod(z)) * rss1 / df2
  se <- sqrt(diag(covariance))
  list(
    endog = xnam[endo],
    terms = znam,
    coefficients = coefficient_rows(fit$coefficients, se),
    f = unname(f),
    df1 = q,
    df2 = df2,
    p = unname(pf(f, q, df2, lower.tail = FALSE))
  )
})

diagnostics <- summary(model, diagnostics = TRUE)$diagnostics
sargan_row <- diagnostics["Sargan", ]
wu_row <- diagnostics["Wu-Hausman", ]
sargan <- list(
  statistic = unname(sargan_row[["statistic"]]),
  df = unname(sargan_row[["df1"]]),
  p = unname(sargan_row[["p-value"]])
)
wu_hausman <- list(
  statistic = unname(wu_row[["statistic"]]),
  df1 = unname(wu_row[["df1"]]),
  df2 = unname(wu_row[["df2"]]),
  p = unname(wu_row[["p-value"]])
)

case_of <- function(name, robust) {
  summary_model <- if (robust) {
    summary(model, vcov. = sandwich::vcovHC(model, type = "HC1"))
  } else {
    summary(model)
  }
  coefficients <- summary_model$coefficients
  list(
    name = name,
    robust = robust,
    terms = rownames(coefficients),
    coefficients = lapply(seq_len(nrow(coefficients)), function(index) {
      list(
        term = rownames(coefficients)[index],
        beta = unname(coefficients[index, 1]),
        se = unname(coefficients[index, 2])
      )
    }),
    fitted = unname(fitted(model)),
    residuals = unname(residuals(model)),
    r2 = unname(summary_model$r.squared),
    adjR2 = unname(summary_model$adj.r.squared),
    sigma = unname(summary_model$sigma),
    firstStage = first_stage,
    sargan = sargan,
    wuHausman = wu_hausman
  )
}

cases <- list(
  case_of("iv-2sls-homoskedastic", FALSE),
  case_of("iv-2sls-hc1", TRUE)
)

write_json(
  list(
    source = "AER::ivreg + sandwich::vcovHC",
    generatedBy = "src/stats/reference/r/iv.R",
    dataset = "samples/regression/iv_demo/data.csv",
    formula = "Y ~ W + X | W + Z1 + Z2",
    variables = colnames(data),
    data = list(
      y = unname(y),
      endog = matrix_columns(x[, endogenous, drop = FALSE]),
      instruments = matrix_columns(z[, excluded, drop = FALSE]),
      exog = matrix_columns(x[, setdiff(seq_along(xnam), c(1, endogenous)), drop = FALSE])
    ),
    cases = cases
  ),
  output,
  auto_unbox = TRUE,
  pretty = TRUE,
  digits = NA
)
