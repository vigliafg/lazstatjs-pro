# Reference fixtures — latent class analysis.
# Run: Rscript src/stats/reference/r/latentclass.R
suppressMessages({ library(jsonlite); library(poLCA) })

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/latentclass.json"

data <- read.csv("samples/multivariate/latent_demo/data.csv", stringsAsFactors = FALSE)
for (name in names(data)) data[[name]] <- factor(data[[name]], levels = c("Basso", "Medio", "Alto"))

fit_case <- function(name, classes) {
  set.seed(20261105)
  fit <- poLCA(
    as.formula(paste("cbind(", paste(names(data), collapse = ","), ") ~ 1")),
    data = data,
    nclass = classes,
    nrep = 50,
    maxiter = 2000,
    verbose = FALSE
  )
  order <- order(fit$P, decreasing = TRUE)
  posterior <- fit$posterior[, order, drop = FALSE]
  entropy <- 1 + sum(ifelse(posterior > 0, posterior * log(posterior), 0)) /
    (nrow(data) * log(classes))
  probabilities <- lapply(seq_along(fit$probs), function(i) {
    matrix <- fit$probs[[i]][order, , drop = FALSE]
    list(variable = names(fit$probs)[i], probabilities = unname(matrix))
  })
  list(
    name = name,
    classes = classes,
    n = nrow(data),
    proportions = unname(fit$P[order]),
    probabilities = probabilities,
    logLik = unname(fit$llik),
    aic = unname(fit$aic),
    bic = unname(fit$bic),
    entropy = entropy
  )
}

cases <- list(fit_case("two-classes", 2), fit_case("three-classes", 3))
payload <- list(
  source = "R poLCA::poLCA",
  generatedBy = "src/stats/reference/r/latentclass.R",
  cases = cases
)
writeLines(toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE, na = "null"), output)
