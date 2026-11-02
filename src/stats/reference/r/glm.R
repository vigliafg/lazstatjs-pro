# Reference fixtures — GLM.
#
# Generates ../fixtures/glm.json from R's glm() for the families and links
# covered by src/stats/kernels/glm.ts.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/glm.R
#
# The output is committed so `npm test` never needs R. Re-run it only when the
# datasets or the expected model change; review the diff before committing.

suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/glm.json"

fit <- function(name, family, link, y, x, kernelFamily = family) {
  data <- data.frame(y = y, x = x)
  familyObject <- switch(
    family,
    gaussian = gaussian(link = link),
    binomial = binomial(link = link),
    poisson = poisson(link = link),
    Gamma = Gamma(link = link)
  )
  model <- glm(
    y ~ x,
    family = familyObject,
    data = data,
    control = glm.control(epsilon = 1e-14, maxit = 100)
  )
  coefficients <- summary(model)$coefficients
  list(
    name = name,
    family = kernelFamily,
    link = link,
    y = y,
    x = lapply(x, function(value) list(value)),
    coefficients = lapply(seq_len(nrow(coefficients)), function(index) {
      list(
        beta = unname(coefficients[index, 1]),
        se = unname(coefficients[index, 2])
      )
    }),
    deviance = unname(deviance(model)),
    nullDeviance = unname(model$null.deviance),
    logLik = unname(as.numeric(logLik(model))),
    aic = unname(AIC(model)),
    dispersion = unname(summary(model)$dispersion)
  )
}

cases <- list(
  fit(
    "gaussian-identity", "gaussian", "identity",
    c(2.1, 3.9, 6.2, 7.8, 10.1),
    c(1, 2, 3, 4, 5)
  ),
  fit(
    "binomial-logit", "binomial", "logit",
    c(0, 0, 0, 1, 0, 1, 1, 1, 1, 1),
    c(-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5)
  ),
  fit(
    "binomial-probit", "binomial", "probit",
    c(0, 0, 0, 1, 0, 1, 1, 1, 1, 1),
    c(-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5)
  ),
  fit(
    "poisson-log", "poisson", "log",
    c(1, 2, 2, 4, 3, 6, 7, 9),
    c(0, 1, 2, 3, 4, 5, 6, 7)
  ),
  fit(
    "gamma-log", "Gamma", "log",
    c(0.8, 1.2, 1.9, 2.4, 3.5, 4.1),
    c(1, 2, 3, 4, 5, 6),
    kernelFamily = "gamma"
  )
)

write_json(
  list(
    source = "R glm()",
    generatedBy = "src/stats/reference/r/glm.R",
    cases = cases
  ),
  output,
  auto_unbox = TRUE,
  pretty = TRUE,
  digits = NA
)
