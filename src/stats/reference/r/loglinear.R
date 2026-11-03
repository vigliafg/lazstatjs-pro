# Reference fixtures — Poisson log-linear model for two-way tables.
#
# Generates ../fixtures/loglinear.json from R's glm(family = poisson) for the
# specifications implemented by src/stats/kernels/loglinear.ts:
#
#   independence : count ~ row + col
#   saturated    : count ~ row * col
#
# The parameterisation is treatment coding with the first row/column level as
# the baseline, which matches the kernel's design matrix.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/loglinear.R
#
# The output is committed so `npm test` never needs R. Re-run it only when the
# tables or the expected model change; review the diff before committing.

suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/loglinear.json"
z <- qnorm(0.975)

fit_case <- function(name, row_labels, col_labels, observed, model) {
  frame <- expand.grid(
    col = factor(col_labels, levels = col_labels),
    row = factor(row_labels, levels = row_labels)
  )
  frame$count <- as.vector(t(observed))

  formula <- if (model == "saturated") count ~ row * col else count ~ row + col
  fit <- glm(formula, family = poisson(link = "log"), data = frame)

  coefficient_table <- summary(fit)$coefficients
  beta <- unname(coefficient_table[, 1])
  se <- unname(coefficient_table[, 2])
  df <- unname(fit$df.residual)
  deviance_value <- unname(deviance(fit))
  p_value <- if (df > 0) pchisq(deviance_value, df, lower.tail = FALSE) else NA_real_
  expected <- matrix(unname(fitted(fit)), nrow = length(row_labels), byrow = TRUE)

  result <- list(
    name = name,
    rows = row_labels,
    cols = col_labels,
    observed = observed,
    model = model,
    coefficients = lapply(seq_along(beta), function(index) {
      list(beta = beta[index], se = se[index])
    }),
    deviance = deviance_value,
    df = df,
    p = p_value,
    nullDeviance = unname(fit$null.deviance),
    logLik = unname(as.numeric(logLik(fit))),
    aic = unname(AIC(fit)),
    expected = expected
  )

  if (model == "saturated" && length(row_labels) == 2 && length(col_labels) == 2) {
    interaction <- which(grepl(":", rownames(coefficient_table)))
    estimate <- beta[interaction]
    standard_error <- se[interaction]
    result$oddsRatio <- list(
      oddsRatio = exp(estimate),
      lo = exp(estimate - z * standard_error),
      hi = exp(estimate + z * standard_error)
    )
  }
  result
}

cases <- list(
  fit_case(
    "three-by-three-independence",
    c("Low", "Medium", "High"),
    c("Yes", "No", "Undecided"),
    matrix(c(20, 15, 10, 25, 30, 12, 18, 22, 28), nrow = 3, byrow = TRUE),
    "independence"
  ),
  fit_case(
    "three-by-three-saturated",
    c("Low", "Medium", "High"),
    c("Yes", "No", "Undecided"),
    matrix(c(20, 15, 10, 25, 30, 12, 18, 22, 28), nrow = 3, byrow = TRUE),
    "saturated"
  ),
  fit_case(
    "two-by-two-independence",
    c("Treatment", "Control"),
    c("Improved", "Unchanged"),
    matrix(c(42, 18, 21, 34), nrow = 2, byrow = TRUE),
    "independence"
  ),
  fit_case(
    "two-by-two-saturated",
    c("Treatment", "Control"),
    c("Improved", "Unchanged"),
    matrix(c(42, 18, 21, 34), nrow = 2, byrow = TRUE),
    "saturated"
  )
)

payload <- list(
  source = "R glm(family = poisson)",
  generatedBy = "src/stats/reference/r/loglinear.R",
  cases = cases
)

writeLines(
  toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE, na = "null"),
  output
)
