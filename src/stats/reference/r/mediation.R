# Reference fixtures — mediation.
#
# Generates ../fixtures/mediation.json from lavaan::sem() for the cases covered
# by src/stats/kernels/mediation.ts.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/mediation.R
#
# The output is committed so `npm test` never needs R. Re-run it only when the
# datasets or the expected model change; review the diff before committing.
#
# `se = "standard"` is lavaan's delta-method standard error for both the
# regression parameters and the defined quantities (indirect, total, prop).
# Recent lavaan releases no longer accept `se = "delta"` as a literal option;
# "standard" is the delta method that older documentation called "delta".
#
# The percentile bootstrap in the TypeScript kernel is deliberately NOT
# compared point by point with R: the two implementations use different PRNGs,
# so only the point estimates and delta-method standard errors are stored here.

suppressMessages(library(lavaan))
suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/mediation.json"

# `covariates` is a named list of columns; the model adds them to both
# equations. The predictor is always X, the mediator M and the outcome Y.
fit <- function(name, outcome, predictor, mediator, covariates = list()) {
  data <- data.frame(Y = outcome, X = predictor, M = mediator)
  covariateNames <- names(covariates)
  for (covariate in covariateNames) data[[covariate]] <- covariates[[covariate]]

  covariateTerms <- if (length(covariateNames) > 0) {
    paste("+", paste(covariateNames, collapse = " + "))
  } else {
    ""
  }
  model <- paste(
    paste("M ~ a*X", covariateTerms),
    paste("Y ~ b*M + cp*X", covariateTerms),
    "indirect := a*b",
    "total := cp + a*b",
    "prop := indirect/total",
    sep = "\n"
  )

  semFit <- sem(model, data = data, se = "standard")
  estimates <- parameterEstimates(semFit, ci = FALSE)
  estimateOf <- function(label) {
    row <- estimates[estimates$label == label, ]
    list(estimate = unname(row$est[1]), se = unname(row$se[1]))
  }

  # The total-effect path is the coefficient of X in the outcome-only
  # regression, not the lavaan defined parameter: the kernel fits that model
  # separately and the test checks that the two routes agree.
  totalFit <- lm(reformulate(c("X", covariateNames), response = "Y"), data = data)
  totalCoefficient <- summary(totalFit)$coefficients
  cTotalRow <- which(rownames(totalCoefficient) == "X")

  list(
    name = name,
    outcome = outcome,
    predictor = predictor,
    mediator = mediator,
    covariates = unname(covariates),
    paths = list(
      a = estimateOf("a"),
      b = estimateOf("b"),
      cPrime = estimateOf("cp"),
      cTotal = list(
        estimate = unname(totalCoefficient[cTotalRow, 1]),
        se = unname(totalCoefficient[cTotalRow, 2]) *
          sqrt((nrow(data) - totalFit$rank) / nrow(data))
      )
    ),
    effects = list(
      indirect = estimateOf("indirect"),
      direct = estimateOf("cp"),
      total = estimateOf("total"),
      proportion = estimateOf("prop")
    )
  )
}

mt <- mtcars

cases <- list(
  fit(
    "mtcars-mpg-hp-wt",
    outcome = mt$mpg,
    predictor = mt$hp,
    mediator = mt$wt
  ),
  fit(
    "mtcars-mpg-hp-wt-qsec",
    outcome = mt$mpg,
    predictor = mt$hp,
    mediator = mt$wt,
    covariates = list(qsec = mt$qsec)
  ),
  fit(
    "mtcars-mpg-hp-wt-cyl-qsec",
    outcome = mt$mpg,
    predictor = mt$hp,
    mediator = mt$wt,
    covariates = list(cyl = mt$cyl, qsec = mt$qsec)
  )
)

write_json(
  list(
    source = "R lavaan::sem() with delta-method standard errors (se = \"standard\")",
    generatedBy = "src/stats/reference/r/mediation.R",
    cases = cases
  ),
  output,
  auto_unbox = TRUE,
  pretty = TRUE,
  digits = NA
)
