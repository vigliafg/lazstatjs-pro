# Reference fixtures — canonical correlation.
# Run: Rscript src/stats/reference/r/canonical.R
suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/canonical.json"

fit_case <- function(name, x, y) {
  fit <- cancor(as.matrix(x), as.matrix(y))
  list(
    name = name,
    x = x,
    y = y,
    correlation = unname(fit$cor),
    xcoef = unname(fit$xcoef),
    ycoef = unname(fit$ycoef),
    xcenter = unname(fit$xcenter),
    ycenter = unname(fit$ycenter)
  )
}

iris_x <- datasets::iris[, c("Sepal.Length", "Sepal.Width")]
iris_y <- datasets::iris[, c("Petal.Length", "Petal.Width")]
set.seed(20261105)
n <- 80
z1 <- rnorm(n); z2 <- 0.5 * z1 + sqrt(1 - 0.5^2) * rnorm(n)
synth_x <- data.frame(X1 = z1 + rnorm(n, 0, 0.6), X2 = 0.8 * z1 + rnorm(n, 0, 0.8),
                      X3 = rnorm(n))
synth_y <- data.frame(Y1 = 0.7 * z1 + 0.4 * z2 + rnorm(n, 0, 0.7),
                      Y2 = 0.6 * z2 + rnorm(n, 0, 0.8))

cases <- list(
  fit_case("iris-blocks", iris_x, iris_y),
  fit_case("synthetic-two-functions", synth_x, synth_y)
)

payload <- list(
  source = "R stats::cancor",
  generatedBy = "src/stats/reference/r/canonical.R",
  cases = cases
)
writeLines(toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE), output)
