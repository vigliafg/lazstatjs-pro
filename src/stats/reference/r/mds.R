# Reference fixtures — classical and non-metric MDS.
# Run: Rscript src/stats/reference/r/mds.R
suppressMessages({ library(jsonlite); library(MASS) })

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/mds.json"

fit_case <- function(name, data, k) {
  d <- dist(data)
  classical <- cmdscale(d, k = k, eig = TRUE)
  iso <- isoMDS(d, k = k, trace = FALSE)
  list(
    name = name,
    data = data,
    k = k,
    dissimilarities = as.matrix(d),
    eigenvalues = unname(classical$eig),
    classical = unname(classical$points),
    iso = unname(iso$points),
    isoStress = unname(iso$stress)
  )
}

us <- datasets::USArrests[1:12, c("Murder", "Assault", "UrbanPop", "Rape")]
cases <- list(
  fit_case("usarrests-subset", us, 2),
  fit_case("usarrests-three-dimensions", us, 3)
)

payload <- list(
  source = "R stats::cmdscale and MASS::isoMDS",
  generatedBy = "src/stats/reference/r/mds.R",
  cases = cases
)
writeLines(toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE), output)
