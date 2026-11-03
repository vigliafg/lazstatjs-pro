# Reference fixtures — k-means clustering.
# Run: Rscript src/stats/reference/r/cluster.R
suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/cluster.json"

seed_centers <- function(x, k) {
  centers <- matrix(as.numeric(x[1, ]), nrow = 1)
  while (nrow(centers) < k) {
    d <- numeric(nrow(x))
    for (i in seq_len(nrow(x))) {
      diffs <- sweep(centers, 2, as.numeric(x[i, ]), "-")
      d[i] <- min(sqrt(rowSums(diffs^2)))
    }
    centers <- rbind(centers, as.numeric(x[which.max(d), ]))
  }
  centers
}

fit_case <- function(name, data, k, standardize) {
  x <- do.call(rbind, data)
  if (standardize) x <- scale(x)
  start <- seed_centers(x, k)
  fit <- kmeans(x, centers = start, iter.max = 100, algorithm = "Lloyd")
  list(
    name = name,
    data = data,
    k = k,
    standardize = standardize,
    start = unname(start),
    centers = unname(fit$centers),
    sizes = unname(fit$size),
    withinss = unname(fit$withinss),
    totwithinss = unname(fit$tot.withinss),
    assignment = unname(fit$cluster) - 1L
  )
}

cases <- list(
  fit_case(
    "two-groups",
    list(c(1, 1), c(1.2, 0.9), c(0.8, 1.1), c(5, 5), c(5.2, 4.8), c(4.9, 5.1)),
    2, FALSE
  ),
  fit_case(
    "three-groups-standardized",
    list(c(1, 10), c(1.4, 10.5), c(0.8, 9.5), c(5, 5), c(5.3, 5.2), c(4.8, 4.7),
         c(10, 1), c(10.4, 1.2), c(9.7, 0.9)),
    3, TRUE
  ),
  fit_case(
    "four-groups",
    list(c(0, 0), c(0.2, 0.1), c(0, 0.2), c(4, 4), c(4.2, 3.9), c(3.9, 4.1),
         c(0, 4), c(0.1, 4.2), c(4, 0), c(4.1, 0.1)),
    4, FALSE
  )
)

payload <- list(
  source = "R stats::kmeans (Lloyd, deterministic starts)",
  generatedBy = "src/stats/reference/r/cluster.R",
  cases = cases
)
writeLines(toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE), output)
