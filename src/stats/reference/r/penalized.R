# Reference fixtures — ridge, LASSO and elastic net.
#
# Generates ../fixtures/penalized.json from glmnet with standardized
# predictors and an unpenalized intercept, matching
# src/stats/kernels/penalized.ts.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/penalized.R

suppressMessages(library(jsonlite))
suppressMessages(library(glmnet))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/penalized.json"

data(mtcars)
x <- as.matrix(mtcars[, c("wt", "hp", "disp")])
y <- mtcars$mpg

case <- function(penalty, alpha, lambda) {
  fit <- glmnet(
    x,
    y,
    family = "gaussian",
    alpha = alpha,
    lambda = lambda,
    standardize = TRUE,
    intercept = TRUE,
    thresh = 1e-12
  )
  list(
    name = paste(penalty, "lambda", lambda),
    penalty = penalty,
    alpha = alpha,
    lambda = lambda,
    coefficients = as.numeric(as.matrix(coef(fit))[-1, 1]),
    intercept = as.numeric(as.matrix(coef(fit))[1, 1]),
    df = as.numeric(fit$df),
    r2 = as.numeric(1 - deviance(fit) / sum((y - mean(y))^2))
  )
}

fixture <- list(
  source = "R glmnet(standardize = TRUE, intercept = TRUE)",
  generatedBy = "src/stats/reference/r/penalized.R",
  y = y,
  x = lapply(seq_len(ncol(x)), function(column) as.numeric(x[, column])),
  cases = list(
    case("ridge", 0, 1),
    case("ridge", 0, 0.1),
    case("lasso", 1, 0.5),
    case("lasso", 1, 0.05),
    case("elasticnet", 0.5, 0.2)
  )
)

writeLines(toJSON(fixture, auto_unbox = TRUE, digits = 15, pretty = TRUE), output)
