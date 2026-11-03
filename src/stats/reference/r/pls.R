# Reference fixtures — PLS1 regression.
#
# Generates ../fixtures/pls.json from pls::plsr(method = "oscorespls") for the
# cases covered by src/stats/kernels/pls.ts.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/pls.R
#
# The output is committed so `npm test` never needs R. Re-run it only when the
# dataset or the expected model changes; review the diff before committing.
#
# The model is mpg ~ wt + hp + disp + qsec on mtcars, centred but NOT scaled
# (`scale = FALSE`). The kernel always centres the data too, so the comparison
# is exact up to floating-point order.
#
# R² is the cumulative training R² returned by pls::R2(estimate = "train",
# intercept = FALSE): for `a` components it is 1 - SSE_a / SST with
# SST = var(mpg) * (n - 1), i.e. the standard coefficient of determination.
# The fixture stores both that cumulative value and its per-component
# increment (`r2`), which is what the kernel exposes.

suppressMessages(library(pls))
suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/pls.json"

data(mtcars)
y <- mtcars$mpg
X <- as.matrix(mtcars[, c("wt", "hp", "disp", "qsec")])

fit <- plsr(
  mpg ~ wt + hp + disp + qsec,
  data = mtcars,
  ncomp = ncol(X),
  method = "oscorespls",
  scale = FALSE,
  validation = "none"
)

case <- function(name, components) {
  cumulativeR2 <- as.numeric(
    R2(fit, estimate = "train", ncomp = seq_len(components), intercept = FALSE)$val
  )
  incremented <- diff(c(0, cumulativeR2))
  xIncremental <- explvar(fit)[seq_len(components)] / 100
  scores <- fit$scores[, seq_len(components), drop = FALSE]
  loadings <- fit$loadings[, seq_len(components), drop = FALSE]
  weights <- fit$loading.weights[, seq_len(components), drop = FALSE]

  list(
    name = paste0("mtcars-k", components),
    components = components,
    coefficients = as.numeric(coef(fit, ncomp = components, intercept = TRUE)),
    # `fitted(fit, ncomp = k)` returns every component, so select the requested
    # model explicitly (predict() honours ncomp).
    fitted = as.numeric(predict(fit, ncomp = components)),
    scores = lapply(seq_len(nrow(scores)), function(row) as.numeric(scores[row, ])),
    loadings = lapply(seq_len(nrow(loadings)), function(row) as.numeric(loadings[row, ])),
    weights = lapply(seq_len(nrow(weights)), function(row) as.numeric(weights[row, ])),
    r2 = incremented,
    cumulativeR2 = cumulativeR2,
    xVariance = xIncremental,
    cumulativeXVariance = cumsum(xIncremental)
  )
}

write_json(
  list(
    source = "R pls::plsr(method = \"oscorespls\", scale = FALSE)",
    generatedBy = "src/stats/reference/r/pls.R",
    response = "mpg",
    predictors = colnames(X),
    y = y,
    x = lapply(seq_len(nrow(X)), function(row) as.numeric(X[row, ])),
    cases = list(case("mtcars-k2", 2), case("mtcars-k4", 4))
  ),
  output,
  auto_unbox = TRUE,
  pretty = TRUE,
  digits = NA
)
