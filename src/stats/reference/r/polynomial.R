# Reference fixtures — polynomial regression.
#
# Generates ../fixtures/polynomial.json from R's lm() with the raw polynomial
# basis, matching src/stats/kernels/polynomial.ts.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/polynomial.R

suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/polynomial.json"

data(mtcars)

case <- function(name, x, y, degree) {
  model <- lm(y ~ poly(x, degree, raw = TRUE))
  coefficients <- summary(model)$coefficients
  list(
    name = name,
    x = x,
    y = y,
    degree = degree,
    coefficients = lapply(seq_len(nrow(coefficients)), function(index) {
      list(
        degree = index - 1,
        beta = unname(coefficients[index, 1]),
        se = unname(coefficients[index, 2])
      )
    }),
    r2 = unname(summary(model)$r.squared),
    adjR2 = unname(summary(model)$adj.r.squared),
    f = unname(summary(model)$fstatistic[1]),
    pF = unname(pf(
      summary(model)$fstatistic[1],
      summary(model)$fstatistic[2],
      summary(model)$fstatistic[3],
      lower.tail = FALSE
    )),
    sse = unname(deviance(model)),
    rmse = unname(sqrt(summary(model)$sigma^2)),
    aic = unname(length(y) * log(deviance(model) / length(y)) + 2 * (degree + 1)),
    bic = unname(length(y) * log(deviance(model) / length(y)) + log(length(y)) * (degree + 1))
  )
}

fixture <- list(
  source = "R lm() with poly(x, degree, raw = TRUE)",
  generatedBy = "src/stats/reference/r/polynomial.R",
  cases = list(
    case("mtcars mpg ~ wt, degree 2", mtcars$wt, mtcars$mpg, 2),
    case("mtcars mpg ~ hp, degree 3", mtcars$hp, mtcars$mpg, 3)
  )
)

writeLines(toJSON(fixture, auto_unbox = TRUE, digits = 15, pretty = TRUE), output)
