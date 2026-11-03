#!/usr/bin/env Rscript
#
# Reference fixture for the DOE design builder.
#
# FrF2, DoE.base and rsm are not installed in this environment, so the
# independent implementation uses only expand.grid() and explicit generators.
# The matrices are identical to the packages for the designs covered here.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/doeDesign.R

suppressPackageStartupMessages(library(jsonlite))

full <- function(factors) {
  grid <- expand.grid(rep(list(c(-1, 1)), factors))
  names(grid) <- LETTERS[1:factors]
  grid
}

half <- function(factors) {
  base <- full(factors - 1)
  base[[LETTERS[factors]]] <- apply(base, 1, prod)
  base
}

ccd <- function(factors) {
  alpha <- (2^factors)^(1 / 4)
  corners <- full(factors)
  axial <- matrix(0, nrow = 2 * factors, ncol = factors)
  for (j in 1:factors) {
    axial[2 * j - 1, j] <- -alpha
    axial[2 * j, j] <- alpha
  }
  out <- rbind(as.matrix(corners), axial)
  colnames(out) <- LETTERS[1:factors]
  out
}

boxBehnken <- function(factors) {
  pairs <- combn(factors, 2)
  out <- matrix(0, nrow = 4 * ncol(pairs), ncol = factors)
  row <- 1
  for (k in 1:ncol(pairs)) {
    a <- pairs[1, k]
    b <- pairs[2, k]
    for (left in c(-1, 1)) {
      for (right in c(-1, 1)) {
        out[row, a] <- left
        out[row, b] <- right
        row <- row + 1
      }
    }
  }
  colnames(out) <- LETTERS[1:factors]
  out
}

result <- list(
  source = "Base R expand.grid() with explicit defining generators",
  full3 = list(matrix = as.matrix(full(3)), center = 2),
  half4 = list(matrix = as.matrix(half(4)), generator = "D = ABC"),
  ccd3 = list(matrix = ccd(3), alpha = (2^3)^(1 / 4), center = 4),
  boxBehnken3 = list(matrix = boxBehnken(3), center = 3)
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/doeDesign.json"
)
