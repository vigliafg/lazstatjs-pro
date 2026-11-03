# Reference fixtures — MANCOVA.
#
# Generates ../fixtures/mancova.json from car::Anova(type = "II") on iris.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/mancova.R

suppressMessages(library(jsonlite))
suppressMessages(library(car))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/mancova.json"

data(iris)

response <- cbind(iris$Sepal.Length, iris$Petal.Length)
model <- lm(response ~ Petal.Width + Species, data = iris)
hypothesis <- linearHypothesis(
  model,
  c("Speciesversicolor = 0", "Speciesvirginica = 0"),
  test = "Wilks"
)

# car prints the Wilks row; parse it so the fixture keeps car's own F and df.
lines <- capture.output(print(hypothesis))
row <- grep("^Wilks", lines, value = TRUE)[1]
parts <- strsplit(trimws(row), "\\s+")[[1]]
lambda <- as.numeric(parts[3])
f <- as.numeric(parts[4])
df1 <- as.numeric(parts[5])
df2 <- as.numeric(parts[6])

univariate <- lapply(c("Sepal.Length", "Petal.Length"), function(name) {
  fit <- Anova(lm(as.formula(paste(name, "~ Petal.Width + Species")), data = iris), type = "II")
  species <- fit["Species", ]
  list(
    variable = name,
    f = unname(species[["F value"]]),
    df1 = unname(species[["Df"]]),
    df2 = unname(fit["Residuals", "Df"]),
    p = unname(species[["Pr(>F)"]])
  )
})

fixture <- list(
  source = "R car::Anova(type = II, test.statistic = Wilks) on iris",
  generatedBy = "src/stats/reference/r/mancova.R",
  ys = lapply(seq_len(nrow(response)), function(index) as.numeric(response[index, ])),
  labels = as.character(iris$Species),
  covariates = lapply(seq_len(nrow(iris)), function(index) list(as.numeric(iris$Petal.Width[index]))),
  variableNames = c("Sepal.Length", "Petal.Length"),
  covariateNames = list("Petal.Width"),
  wilks = list(
    lambda = lambda,
    f = f,
    df1 = df1,
    df2 = df2,
    p = pf(f, df1, df2, lower.tail = FALSE)
  ),
  univariate = univariate
)

writeLines(toJSON(fixture, auto_unbox = TRUE, digits = 15, pretty = TRUE), output)
