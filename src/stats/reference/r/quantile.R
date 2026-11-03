# Reference fixtures — quantile regression.
#
# Generates ../fixtures/quantile.json from quantreg::rq (method "br") for the
# cases covered by src/stats/kernels/quantile.ts.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/quantile.R
#
# The output is committed so `npm test` never needs R. Re-run it only when the
# datasets or the expected model change; review the diff before committing.
#
# Standard errors come from summary.rq(se = "nid") — Powell's kernel sparsity
# with the Hall–Sheather bandwidth — which is what the kernel implements.

suppressMessages(library(quantreg))
suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/quantile.json"

# `predictors` is a list of columns; the design gains the intercept in R and in
# the kernel, so only the predictor rows are stored.
fit <- function(name, tau, y, predictors) {
  X <- cbind(1, do.call(cbind, predictors))
  data <- data.frame(y = y)
  for (j in seq_along(predictors)) data[[paste0("v", j)]] <- predictors[[j]]

  model <- rq(y ~ ., data = data, tau = tau, method = "br")
  beta <- as.numeric(coef(model))
  residuals <- as.numeric(y - X %*% beta)
  # summary.rq warns about non-positive finite-difference sparsity values but
  # still returns the covariance; keep the warning out of the generator log.
  se <- suppressWarnings(as.numeric(summary(model, se = "nid")$coefficients[, 2]))

  n <- length(y)
  list(
    name = name,
    tau = tau,
    y = y,
    x = lapply(seq_len(n), function(row) as.numeric(X[row, -1])),
    coefficients = lapply(seq_along(beta), function(index) {
      list(beta = unname(beta[index]), se = unname(se[index]))
    }),
    fitted = as.numeric(X %*% beta),
    residuals = residuals,
    objective = sum(ifelse(residuals >= 0, tau * residuals, (tau - 1) * residuals))
  )
}

mt <- mtcars

cases <- list(
  fit("mtcars-wt-hp-tau025", 0.25, mt$mpg, list(mt$wt, mt$hp)),
  fit("mtcars-wt-hp-tau050", 0.50, mt$mpg, list(mt$wt, mt$hp)),
  fit("mtcars-wt-hp-tau075", 0.75, mt$mpg, list(mt$wt, mt$hp)),
  # Minimal case: one predictor, interpolating vertex for the median.
  fit("simple-5-tau025", 0.25, c(2.1, 3.9, 6.2, 7.8, 10.1), list(c(1, 2, 3, 4, 5))),
  fit("simple-5-tau050", 0.50, c(2.1, 3.9, 6.2, 7.8, 10.1), list(c(1, 2, 3, 4, 5))),
  # Discrete response: many tied residuals, a degenerate simplex case.
  fit(
    "ties-tau050", 0.50,
    c(3, 1, 2, 3, 2, 4, 3, 5, 2, 3, 4, 4),
    list(c(1, 0, 1, 2, 1, 3, 2, 4, 0, 1, 3, 4))
  )
)

write_json(
  list(
    source = "R quantreg::rq() (method \"br\", summary se = \"nid\")",
    generatedBy = "src/stats/reference/r/quantile.R",
    cases = cases
  ),
  output,
  auto_unbox = TRUE,
  pretty = TRUE,
  digits = NA
)
