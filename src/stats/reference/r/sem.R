# Reference fixtures — confirmatory factor analysis / two-factor SEM.
# Run: Rscript src/stats/reference/r/sem.R
suppressMessages({ library(jsonlite); library(lavaan) })

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/sem.json"

data <- read.csv("samples/multivariate/sem_demo/data.csv")
data <- scale(data)

fit_case <- function(name, structural) {
  syntax <- if (structural) {
    'F1 =~ Verbal1 + Verbal2 + Verbal3
     F2 =~ Math1 + Math2 + Math3
     F2 ~ F1'
  } else {
    'F1 =~ Verbal1 + Verbal2 + Verbal3
     F2 =~ Math1 + Math2 + Math3'
  }
  fit <- sem(syntax, data = data, std.lv = TRUE)
  pe <- parameterEstimates(fit, standardized = TRUE)
  loadings <- pe[pe$op == "=~", c("lhs", "rhs", "est", "se", "z", "pvalue", "std.all")]
  uniqueness <- pe[pe$op == "~~" & pe$lhs == pe$rhs & pe$lhs %in% c("Verbal1","Verbal2","Verbal3","Math1","Math2","Math3"),
                    c("lhs", "est", "se")]
  factors <- pe[pe$op == "~~" & pe$lhs != pe$rhs & pe$lhs %in% c("F1","F2") & pe$rhs %in% c("F1","F2"),
                c("lhs", "rhs", "est", "std.all", "se")]
  path <- pe[pe$op == "~", c("lhs", "rhs", "est", "std.all", "se", "z", "pvalue")]
  measures <- fitMeasures(fit, c("chisq", "df", "pvalue", "cfi", "tli", "rmsea", "srmr", "aic", "bic"))
  list(
    name = name,
    structural = structural,
    n = nrow(data),
    loadings = lapply(seq_len(nrow(loadings)), function(i) as.list(loadings[i, ])),
    uniqueness = lapply(seq_len(nrow(uniqueness)), function(i) as.list(uniqueness[i, ])),
    factors = lapply(seq_len(nrow(factors)), function(i) as.list(factors[i, ])),
    path = if (nrow(path) > 0) as.list(path[1, ]) else NULL,
    fit = as.list(measures)
  )
}

cases <- list(fit_case("two-factor-cfa", FALSE), fit_case("two-factor-structural", TRUE))
payload <- list(
  source = "R lavaan::sem (std.lv = TRUE, factor variances fixed to 1)",
  generatedBy = "src/stats/reference/r/sem.R",
  cases = cases
)
writeLines(toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE, na = "null"), output)
