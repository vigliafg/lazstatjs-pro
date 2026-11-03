# Reference fixtures — multinomial logistic regression.
#
# Generates ../fixtures/multinomial.json from R's nnet::multinom() for the
# softmax model implemented by src/stats/kernels/multinomial.ts.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/multinomial.R
#
# The output is committed so `npm test` never needs R. Re-run it only when the
# models change; review the diff before committing.
#
# Parameterisation: nnet::multinom() uses the first factor level as the
# reference class and reports one coefficient row per remaining level. This
# matches the kernel contract (referenceClass = 0), so no re-coding is needed.
#
# Note on iris: the full-data specifications with `Sepal.Length + Sepal.Width`
# and with all four measurements are *quasi-completely separated* (setosa is
# linearly separable and the likelihood keeps increasing as the coefficients
# grow). nnet reports convergence = 1 for them and the estimates are not
# identifiable, so they cannot be used as reference numbers. The two iris cases
# below use the sepal measurements one at a time, where the classes overlap and
# the maximum-likelihood estimate is finite. The multi-predictor cases use a
# fixed synthetic three-class design instead.
#
# `reltol = 1e-16` asks nnet to iterate until its relative log-likelihood change
# is numerically exhausted, so the reference numbers agree with an independent
# Newton fit to roughly 1e-6 rather than nnet's default 1e-8 stopping point.

suppressMessages({
  library(nnet)
  library(jsonlite)
})

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/multinomial.json"

fit_case <- function(name, formula, data, response) {
  levels <- levels(data[[response]])
  model <- multinom(
    formula,
    data = data,
    trace = FALSE,
    maxit = 2000,
    reltol = 1e-16,
    Hess = TRUE
  )
  if (model$convergence != 0) {
    stop(sprintf("%s: nnet did not converge", name))
  }

  coefficients <- coef(model)
  standardErrors <- summary(model)$standard.errors
  probabilities <- fitted(model)
  y <- as.integer(data[[response]]) - 1L
  predicted <- apply(probabilities, 1L, which.max) - 1L
  design <- model.matrix(formula, data)
  design <- design[, colnames(coefficients), drop = FALSE]

  list(
    name = name,
    classes = levels,
    referenceClass = 0L,
    y = y,
    x = unname(design),
    coefficients = unname(coefficients),
    standardErrors = unname(standardErrors),
    logLik = as.numeric(logLik(model)),
    deviance = unname(deviance(model)),
    aic = unname(AIC(model)),
    fitted = unname(probabilities),
    predicted = predicted,
    accuracy = mean(predicted == y)
  )
}

# --- iris: two stable single-predictor specifications ----------------------
irisCases <- list(
  fit_case(
    "iris-sepal-length", Species ~ Sepal.Length, iris, "Species"
  ),
  fit_case(
    "iris-sepal-width", Species ~ Sepal.Width, iris, "Species"
  )
)

# --- synthetic three-class design with overlapping classes -----------------
set.seed(20261103)
n <- 240
x1 <- rnorm(n)
x2 <- rnorm(n)
x3 <- rnorm(n)
x4 <- rnorm(n)

eta1 <- 0.9 * x1 - 0.6 * x2 + 0.3 * x3
eta2 <- -0.5 * x1 + 0.8 * x2 - 0.4 * x3 + 0.5 * x4
probabilities <- cbind(1, exp(eta1), exp(eta2))
probabilities <- probabilities / rowSums(probabilities)
labels <- apply(probabilities, 1L, function(row) sample.int(3L, 1L, prob = row)) - 1L

synthetic <- data.frame(
  y = factor(labels, levels = 0:2),
  x1 = x1,
  x2 = x2,
  x3 = x3,
  x4 = x4
)
stopifnot(all(table(synthetic$y) > 0))

syntheticCases <- list(
  fit_case("synthetic-two-predictors", y ~ x1 + x2, synthetic, "y"),
  fit_case("synthetic-four-predictors", y ~ x1 + x2 + x3 + x4, synthetic, "y")
)

write_json(
  list(
    source = "R nnet::multinom()",
    generatedBy = "src/stats/reference/r/multinomial.R",
    cases = c(irisCases, syntheticCases)
  ),
  output,
  auto_unbox = TRUE,
  pretty = TRUE,
  digits = NA
)
