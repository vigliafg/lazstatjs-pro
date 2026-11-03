# Reference fixtures — correspondence analysis.
# Run: Rscript src/stats/reference/r/correspondence.R
suppressMessages({ library(jsonlite); library(ca) })

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/correspondence.json"

fit_case <- function(name, table, rows, cols) {
  dimnames(table) <- list(rows, cols)
  fit <- ca(table)
  list(
    name = name,
    observed = unname(table),
    rows = rows,
    cols = cols,
    sv = as.list(unname(fit$sv)),
    inertia = as.list(unname(fit$sv^2)),
    totalInertia = sum(fit$sv^2),
    chi2 = sum(table) * sum(fit$sv^2),
    df = (nrow(table) - 1) * (ncol(table) - 1),
    rowcoord = unname(fit$rowcoord),
    colcoord = unname(fit$colcoord)
  )
}

t1 <- matrix(c(20, 10, 5, 12, 18, 8, 9, 7, 22), nrow = 3, byrow = TRUE)
t2 <- matrix(c(30, 12, 8, 4, 10, 25, 15, 6), nrow = 2, byrow = TRUE)
cases <- list(
  fit_case("three-by-three", t1, c("Basso", "Medio", "Alto"), c("Sì", "No", "Incerto")),
  fit_case("two-by-four", t2, c("Trattamento", "Controllo"), c("Molto basso", "Basso", "Alto", "Molto alto"))
)

payload <- list(
  source = "R ca::ca",
  generatedBy = "src/stats/reference/r/correspondence.R",
  cases = cases
)
writeLines(toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE), output)
