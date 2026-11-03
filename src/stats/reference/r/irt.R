# Reference fixtures — 2PL and Rasch IRT.
# Run: Rscript src/stats/reference/r/irt.R
suppressMessages({ library(jsonlite); library(mirt) })

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/irt.json"

data <- read.csv("samples/multivariate/irt_demo/data.csv")

fit_case <- function(name, model) {
  fit <- mirt(data, 1, itemtype = model, quadpts = 21, SE = TRUE, verbose = FALSE)
  items <- coef(fit, IRTpars = TRUE, simplify = TRUE)$items
  a <- unname(items[, "a"])
  b <- unname(items[, "b"])
  list(
    name = name,
    model = model,
    data = unname(as.matrix(data)),
    a = a,
    b = b,
    logLik = unname(as.numeric(logLik(fit))),
    aic = unname(AIC(fit)),
    bic = unname(BIC(fit))
  )
}

cases <- list(fit_case("two-parameter", "2PL"), fit_case("rasch", "Rasch"))
payload <- list(
  source = "R mirt::mirt (quadpts = 21)",
  generatedBy = "src/stats/reference/r/irt.R",
  cases = cases
)
writeLines(toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE, na = "null"), output)
