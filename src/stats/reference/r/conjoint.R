# Reference fixtures — additive conjoint analysis.
# Run: Rscript src/stats/reference/r/conjoint.R
suppressMessages({ library(jsonlite); library(conjoint) })

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/conjoint.json"

data <- read.csv("samples/multivariate/conjoint_demo/data.csv", stringsAsFactors = FALSE)
attributes <- c("Brand", "Price", "Warranty")
for (name in attributes) data[[name]] <- factor(data[[name]], levels = unique(data[[name]]))

fit_case <- function(name) {
  options(contrasts = c("contr.sum", "contr.poly"))
  model <- lm(Rating ~ Brand + Price + Warranty, data = data)
  coefficient_table <- summary(model)$coefficients
  coefficients <- lapply(seq_len(nrow(coefficient_table)), function(i) {
    list(
      term = rownames(coefficient_table)[i],
      estimate = unname(coefficient_table[i, 1]),
      se = unname(coefficient_table[i, 2]),
      t = unname(coefficient_table[i, 3]),
      p = unname(coefficient_table[i, 4])
    )
  })
  # Part-worths: estimated effects plus the omitted level recovered as -sum.
  utilities <- list()
  importance <- numeric(length(attributes))
  for (j in seq_along(attributes)) {
    attribute <- attributes[j]
    levels <- levels(data[[attribute]])
    terms <- paste0(attribute, seq_len(length(levels) - 1))
    effects <- vapply(terms, function(term) unname(coef(model)[term]), numeric(1))
    all <- c(effects, -sum(effects))
    for (k in seq_along(levels)) {
      utilities[[length(utilities) + 1]] <- list(
        attribute = attribute,
        level = levels[k],
        utility = unname(all[k])
      )
    }
    importance[j] <- max(all) - min(all)
  }
  importance <- 100 * importance / sum(importance)
  list(
    name = name,
    attributes = attributes,
    levels = lapply(attributes, function(attribute) levels(data[[attribute]])),
    coefficients = coefficients,
    utilities = utilities,
    importance = unname(importance),
    r2 = unname(summary(model)$r.squared),
    adjR2 = unname(summary(model)$adj.r.squared),
    rmse = unname(sqrt(sum(residuals(model)^2) / df.residual(model))),
    f = unname(summary(model)$fstatistic[1]),
    fP = unname(pf(summary(model)$fstatistic[1], summary(model)$fstatistic[2], summary(model)$fstatistic[3], lower.tail = FALSE)),
    intercept = unname(coef(model)[1])
  )
}

payload <- list(
  source = "R conjoint::caUtilities model (lm, contr.sum)",
  generatedBy = "src/stats/reference/r/conjoint.R",
  cases = list(fit_case("profile-ratings"))
)
writeLines(toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE, na = "null"), output)
