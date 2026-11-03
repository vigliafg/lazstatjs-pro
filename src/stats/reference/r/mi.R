# Reference fixture — categorical multiple imputation (MICE).
#
# Generates ../fixtures/mi.json from mice::mice on a small dataset with two
# binary variables and one three-category variable. The fixture stores the
# completed data proportions pooled over the five imputations.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/mi.R
#
# The output is committed so `npm test` never needs R. Re-run it only when the
# dataset or the expected model changes; review the diff before committing.
#
# mice uses its own RNG and a different chained-equation schedule, so the
# reference test compares the pooled category proportions (tolerance 0.06),
# not the individual imputed values.

suppressMessages(library(mice))
suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/mi.json"

set.seed(20261028)
n <- 80
C <- sample(0:2, n, replace = TRUE)
A <- rbinom(n, 1, plogis(-0.4 + 0.9 * (C == 1) + 1.3 * (C == 2)))
B <- rbinom(n, 1, plogis(0.3 - 0.6 * A + 0.5 * (C == 1)))
D <- rnorm(n, 10 + 2 * A, 2)

rows <- data.frame(A = A, B = B, C = C, D = D)
missA <- sample(n, 10)
missB <- sample(setdiff(seq_len(n), missA), 10)
missC <- sample(setdiff(seq_len(n), c(missA, missB)), 8)
rows$A[missA] <- NA
rows$B[missB] <- NA
rows$C[missC] <- NA

observed <- rows
modelData <- data.frame(
  A = factor(rows$A, levels = c(0, 1)),
  B = factor(rows$B, levels = c(0, 1)),
  C = factor(rows$C, levels = c(0, 1, 2)),
  D = rows$D
)

imputations <- 5
iterations <- 5
imp <- mice(
  modelData,
  m = imputations,
  maxit = iterations,
  method = c("logreg", "logreg", "polyreg", "pmm"),
  seed = 20261028,
  printFlag = FALSE
)
completed <- complete(imp, "long", include = TRUE)

variables <- lapply(c("A", "B", "C"), function(name) {
  levelsOf <- if (name == "C") c(0, 1, 2) else c(0, 1)
  values <- as.integer(as.character(completed[[name]]))
  perImputation <- lapply(seq_len(imputations), function(m) {
    subset <- values[completed$.imp == m]
    vapply(levelsOf, function(level) sum(subset == level) / length(subset), numeric(1))
  })
  pooled <- Reduce(`+`, perImputation) / imputations
  observedValues <- observed[[name]][!is.na(observed[[name]])]
  list(
    name = name,
    categories = levelsOf,
    observed = length(observedValues),
    missing = sum(is.na(observed[[name]])),
    proportions = as.numeric(pooled)
  )
})

rowsAsStrings <- lapply(seq_len(nrow(observed)), function(index) {
  vapply(observed[index, ], function(value) {
    if (is.na(value)) "" else format(value, trim = TRUE, scientific = FALSE)
  }, character(1))
})

fixture <- list(
  source = "mice::mice (logreg / polyreg)",
  generatedBy = "src/stats/reference/r/mi.R",
  seed = 20261028,
  imputations = imputations,
  iterations = iterations,
  rows = rowsAsStrings,
  variables = variables
)

writeLines(toJSON(fixture, auto_unbox = TRUE, pretty = TRUE, digits = 12), output)
