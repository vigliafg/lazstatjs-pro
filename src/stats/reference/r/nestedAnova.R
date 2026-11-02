# Reference fixtures — nested ANOVA.
#
# Generates ../fixtures/nestedAnova.json from R's aov(). The outer factor is
# tested against the inner-factor mean square, so the outer F is recomputed
# from the table instead of read from the default (non-nested) tests.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/nestedAnova.R

suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/nestedAnova.json"

nestedCase <- function(name, y, outer, inner) {
  data <- data.frame(y = y, outer = factor(outer), inner = factor(inner))
  table <- summary(aov(y ~ outer + inner, data = data))[[1]]
  ss <- table[["Sum Sq"]]
  df <- table[["Df"]]
  ms <- ss / df
  fOuter <- ms[1] / ms[2]
  fInner <- ms[2] / ms[3]
  list(
    name = name,
    y = y,
    outerLevels = outer,
    innerLevels = inner,
    outer = list(
      ss = unname(ss[1]),
      df = unname(df[1]),
      ms = unname(ms[1]),
      f = unname(fOuter),
      p = unname(pf(fOuter, df[1], df[2], lower.tail = FALSE))
    ),
    inner = list(
      ss = unname(ss[2]),
      df = unname(df[2]),
      ms = unname(ms[2]),
      f = unname(fInner),
      p = unname(pf(fInner, df[2], df[3], lower.tail = FALSE))
    ),
    error = list(ss = unname(ss[3]), df = unname(df[3]), ms = unname(ms[3]))
  )
}

fixture <- list(
  source = "R aov(y ~ outer + inner) with the nested outer F recomputed",
  generatedBy = "src/stats/reference/r/nestedAnova.R",
  cases = list(
    nestedCase(
      "balanced 3 x 2",
      c(10, 12, 14, 16, 11, 13, 15, 17, 12, 14, 16, 18),
      rep(c("A", "B", "C"), each = 4),
      rep(c("A1", "A1", "A2", "A2", "B1", "B1", "B2", "B2", "C1", "C1", "C2", "C2"))
    ),
    nestedCase(
      "unbalanced cells",
      c(5.1, 4.8, 5.4, 6.2, 6.0, 5.7, 5.9, 6.4, 6.1, 6.6, 6.3, 7.0, 6.8, 7.2),
      c("A", "A", "A", "A", "A", "B", "B", "B", "B", "B", "C", "C", "C", "C"),
      c("A1", "A1", "A1", "A2", "A2", "B1", "B1", "B2", "B2", "B2", "C1", "C1", "C2", "C2")
    )
  )
)

writeLines(toJSON(fixture, auto_unbox = TRUE, digits = 15, pretty = TRUE), output)
