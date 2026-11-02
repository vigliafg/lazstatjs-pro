# Reference fixtures — binary probit regression.
#
# Generates ../fixtures/probit.json from R's glm(binomial(link = "probit"))
# for the link-aware fit in src/stats/kernels/logistic.ts.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/probit.R

suppressMessages(library(jsonlite))
suppressMessages(library(MASS))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/probit.json"

case <- function(name, data, formula, y, predictors) {
  model <- glm(formula, family = binomial(link = "probit"), data = data)
  coefficients <- summary(model)$coefficients
  list(
    name = name,
    y = y,
    predictors = predictors,
    coefficients = lapply(seq_len(nrow(coefficients)), function(index) {
      list(
        beta = unname(coefficients[index, 1]),
        se = unname(coefficients[index, 2])
      )
    }),
    logLik = unname(as.numeric(logLik(model))),
    aic = unname(AIC(model)),
    nullDeviance = unname(model$null.deviance),
    deviance = unname(deviance(model))
  )
}

data(birthwt)
birthwt <- birthwt

fixture <- list(
  source = "R glm(binomial(link = \"probit\"))",
  generatedBy = "src/stats/reference/r/probit.R",
  cases = list(
    case(
      "birthwt low ~ age + lwt + race",
      birthwt,
      low ~ age + lwt + race,
      birthwt$low,
      list(birthwt$age, birthwt$lwt, birthwt$race)
    ),
    case(
      "birthwt low ~ lwt",
      birthwt,
      low ~ lwt,
      birthwt$low,
      list(birthwt$lwt)
    )
  )
)

writeLines(toJSON(fixture, auto_unbox = TRUE, digits = 15, pretty = TRUE), output)
