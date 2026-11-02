# Reference fixtures — variable selection.
#
# Generates ../fixtures/selection.json from leaps::regsubsets (best subsets)
# and stats::step (stepwise, BIC penalty) for src/stats/kernels/selection.ts.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/selection.R

suppressMessages(library(jsonlite))
suppressMessages(library(leaps))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/selection.json"

data(mtcars)
y <- mtcars$mpg
candidates <- c("wt", "hp", "disp")
variableIndex <- function(name) match(name, candidates) - 1

best <- regsubsets(
  mpg ~ wt + hp + disp,
  data = mtcars,
  nbest = 1,
  nvmax = length(candidates),
  method = "exhaustive"
)

n <- nrow(mtcars)
subsets <- lapply(seq_along(candidates), function(size) {
  labels <- names(coef(best, id = size))[-1]
  model <- lm(reformulate(labels, response = "mpg"), data = mtcars)
  sse <- deviance(model)
  p <- size + 1
  list(
    variables = vapply(labels, variableIndex, numeric(1)),
    sse = unname(sse),
    r2 = unname(summary(model)$r.squared),
    adjR2 = unname(summary(model)$adj.r.squared),
    aic = n * log(sse / n) + 2 * p,
    bic = n * log(sse / n) + log(n) * p
  )
})

full <- lm(mpg ~ wt + hp + disp, data = mtcars)
stepped <- step(full, direction = "both", k = log(n), trace = 0)
selected <- attr(terms(stepped), "term.labels")
selectedIndexes <- vapply(selected, variableIndex, numeric(1))
if (length(selectedIndexes) == 0) selectedIndexes <- numeric(0)

fixture <- list(
  source = "R leaps::regsubsets and stats::step (BIC)",
  generatedBy = "src/stats/reference/r/selection.R",
  candidates = candidates,
  y = y,
  predictors = lapply(candidates, function(name) mtcars[[name]]),
  bestSubsets = subsets,
  stepwise = list(
    direction = "both",
    criterion = "bic",
    selected = selectedIndexes,
    sse = unname(deviance(stepped))
  )
)

writeLines(toJSON(fixture, auto_unbox = TRUE, digits = 15, pretty = TRUE), output)
