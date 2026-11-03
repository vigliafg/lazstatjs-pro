# Reference fixtures — ANOM (analysis of means).
#
# Generates ../fixtures/anom.json from R's aov() plus the decision-line
# formula. The critical value uses the Bonferroni-t bound, the same documented
# approximation used by src/stats/kernels/anom.ts.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/anom.R

suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/anom.json"

anomCase <- function(name, y, group, alpha = 0.05) {
  data <- data.frame(y = y, group = factor(group))
  table <- summary(aov(y ~ group, data = data))[[1]]
  ssWithin <- table[["Sum Sq"]][2]
  dfWithin <- table[["Df"]][2]
  msWithin <- ssWithin / dfWithin
  k <- nlevels(data$group)
  nTotal <- length(y)
  grandMean <- mean(y)
  h <- qt(1 - alpha / (2 * k), dfWithin)
  groups <- lapply(levels(data$group), function(label) {
    values <- y[group == label]
    n <- length(values)
    halfWidth <- h * sqrt(msWithin * (1 / n - 1 / nTotal))
    list(
      group = label,
      n = n,
      mean = mean(values),
      lower = grandMean - halfWidth,
      upper = grandMean + halfWidth,
      outside = mean(values) < grandMean - halfWidth || mean(values) > grandMean + halfWidth
    )
  })
  list(
    name = name,
    y = y,
    group = group,
    alpha = alpha,
    grandMean = grandMean,
    msWithin = msWithin,
    dfWithin = dfWithin,
    k = k,
    h = h,
    groups = groups
  )
}

data(PlantGrowth)

fixture <- list(
  source = "R aov() plus the Bonferroni-t ANOM decision lines",
  generatedBy = "src/stats/reference/r/anom.R",
  cases = list(
    anomCase(
      "PlantGrowth weight by group",
      PlantGrowth$weight,
      as.character(PlantGrowth$group)
    )
  )
)

writeLines(toJSON(fixture, auto_unbox = TRUE, digits = 15, pretty = TRUE), output)
