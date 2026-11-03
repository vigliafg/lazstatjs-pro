#!/usr/bin/env Rscript
#
# Reference fixture for single-sampling acceptance plans.
#
# Base R probability functions: pbinom() for an infinite lot and phyper() for
# a finite lot. AQL and LTPD are found with uniroot(), AOQL with optimize().
#
# Run from the repository root:
#   Rscript src/stats/reference/r/acceptance.R

suppressPackageStartupMessages(library(jsonlite))

plan <- function(n, c, lot = 0) {
  pa <- function(p) {
    if (lot > n) {
      k <- round(p * lot)
      return(phyper(c, k, lot - k, n))
    }
    pbinom(c, n, p)
  }
  fraction <- if (lot > n) (lot - n) / lot else 1
  aoq <- function(p) pa(p) * p * fraction

  aql <- uniroot(function(p) pa(p) - 0.95, c(1e-8, 1 - 1e-8), tol = 1e-12)$root
  ltpd <- uniroot(function(p) pa(p) - 0.10, c(1e-8, 1 - 1e-8), tol = 1e-12)$root
  maximum <- optimize(aoq, c(0, 0.8), maximum = TRUE, tol = 1e-12)

  grid <- seq(0, min(0.6, max(0.08, 3 * (c + 1) / n)), length.out = 61)
  list(
    n = n,
    c = c,
    lot = lot,
    aql = aql,
    ltpd = ltpd,
    alpha = 1 - pa(aql),
    beta = pa(ltpd),
    aoql = maximum$objective,
    aoqlP = maximum$maximum,
    curve = data.frame(
      p = grid,
      pa = vapply(grid, pa, numeric(1)),
      aoq = vapply(grid, aoq, numeric(1)),
      ati = if (lot > n) n + (1 - vapply(grid, pa, numeric(1))) * (lot - n) else n
    )
  )
}

result <- list(
  source = "Base R pbinom/phyper with uniroot and optimize",
  plans = list(
    binomial = plan(50, 2, 0),
    hypergeometric = plan(20, 1, 200)
  )
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/acceptance.json"
)
