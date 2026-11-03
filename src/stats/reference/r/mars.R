# Reference fixtures — MARS / GAM-MARS.
#
# Generates ../fixtures/mars.json from R's earth package, matching the
# implementation in src/stats/kernels/mars.ts for the additive (degree = 1)
# case.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/mars.R
#
# The output is committed so `npm test` never needs R. Re-run it only when the
# dataset or the expected model changes; review the diff before committing.
#
# Cases:
#   forward-9    degree 1, nk = nprune = 9,  pmethod = "none"
#   forward-13   degree 1, nk = nprune = 13, pmethod = "none"
#   backward-9   degree 1, nk = nprune = 9,  pmethod = "backward"
#   backward-13  degree 1, nk = nprune = 13, pmethod = "backward"
#
# `nk` limits the number of terms created by the forward pass (intercept
# included); `nprune` is the maximum number kept.  The kernel's `maxTerms`
# plays the role of earth's `nk`, so the fixture always sets nk = nprune.
#
# earth's forward pass places candidate knots at every `minspan`-th ordered
# observation, starting after `endspan` observations (see FindKnot in
# earth/src/earth.c).  For mtcars with 4 predictors and 32 rows the automatic
# values are minspan = 4 and endspan = 9, i.e. the candidate indices are
# 21, 17, 13, 9 (0 based) for every predictor.  The kernel reproduces that
# rule rather than testing every observed value.
#
# GCV is earth's formula
#   Cost = (nTerms + penalty * nKnots) / n,  nKnots = (nTerms - 1) / 2
#   GCV  = RSS / (n * (1 - Cost)^2)
# The simplified `penalty * nTerms / n` form used by some textbooks differs
# for hinge pairs and is not what the reference values below use.

suppressMessages(library(earth))
suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/mars.json"

data(mtcars)
variables <- c("wt", "hp", "disp", "qsec")
x <- as.matrix(mtcars[, variables])
y <- mtcars$mpg

earthFit <- function(maxTerms, prune) {
  pmethod <- if (prune) "backward" else "none"
  earth(
    x = x,
    y = y,
    degree = 1,
    nk = maxTerms,
    nprune = maxTerms,
    pmethod = pmethod,
    penalty = 2,
    trace = 0
  )
}

fixtureCase <- function(name, maxTerms, prune) {
  model <- earthFit(maxTerms, prune)
  selected <- model$selected.terms
  terms <- rownames(model$dirs)[selected]
  coefficients <- as.numeric(model$coefficients[, 1])

  # Selected knots: one row per term, one column per predictor.  A zero means
  # the predictor does not enter that term.  The kernel stores the same
  # information in its hinge list.
  knots <- lapply(seq_along(selected), function(index) {
    cuts <- as.numeric(model$cuts[selected[index], ])
    names(cuts) <- variables
    cuts[cuts != 0]
  })

  list(
    name = name,
    degree = 1,
    maxTerms = maxTerms,
    prune = prune,
    pmethod = if (prune) "backward" else "none",
    penalty = 2,
    terms = as.list(terms),
    coefficients = coefficients,
    knots = knots,
    fitted = as.numeric(model$fitted.values),
    rss = as.numeric(model$rss),
    rsq = as.numeric(model$rsq),
    gcv = as.numeric(model$gcv),
    n = nrow(x),
    p = length(selected)
  )
}

fixture <- list(
  source = "R earth::earth()",
  generatedBy = "src/stats/reference/r/mars.R",
  variables = variables,
  x = lapply(seq_along(variables), function(j) as.numeric(x[, j])),
  y = as.numeric(y),
  cases = list(
    fixtureCase("forward-9", 9, FALSE),
    fixtureCase("forward-13", 13, FALSE),
    fixtureCase("backward-9", 9, TRUE),
    fixtureCase("backward-13", 13, TRUE)
  )
)

write_json(
  fixture,
  output,
  auto_unbox = TRUE,
  pretty = TRUE,
  digits = NA
)
