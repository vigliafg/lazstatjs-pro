#!/usr/bin/env Rscript
#
# Reference fixture for the Gage R&R kernel.
#
# The crossed design is balanced, so the variance components can be written
# directly from the ANOVA mean squares. Base R only: aov() for the sums of
# squares and the F tests.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/msa.R

suppressPackageStartupMessages(library(jsonlite))

## ---------------------------------------------------------------------------
## Data: 4 parts x 3 operators x 2 replicates, balanced by construction
## ---------------------------------------------------------------------------
part <- rep(rep(1:4, each = 2), times = 3)
operator <- rep(LETTERS[1:3], each = 8)
replicate <- rep(1:2, times = 12)
value <- c(
  10.1, 10.2, 10.4, 10.3, 10.0, 10.1, 10.2, 10.3,
  10.2, 10.1, 10.5, 10.3, 10.1, 10.0, 10.2, 10.4,
  10.0, 10.2, 10.3, 10.2, 9.9, 10.1, 10.4, 10.2
)
data <- data.frame(part = factor(part), operator = factor(operator), value = value)

## ---------------------------------------------------------------------------
## ANOVA and variance components
## ---------------------------------------------------------------------------
fit <- aov(value ~ part * operator, data = data)
tab <- summary(fit)[[1]]
ms <- tab[, "Mean Sq"]
df <- tab[, "Df"]
ss <- tab[, "Sum Sq"]
p <- tab[, "Pr(>F)"]

parts <- nlevels(data$part)
operators <- nlevels(data$operator)
replicates <- nrow(data) / (parts * operators)

mse <- ms[4]
msInt <- ms[3]
msOp <- ms[2]
msPart <- ms[1]

repeatability <- mse
interaction <- max(0, (msInt - mse) / replicates)
reproducibility <- max(0, (msOp - msInt) / (parts * replicates) + interaction / operators)
partVar <- max(0, (msPart - msInt) / (operators * replicates))
grr <- repeatability + reproducibility
total <- grr + partVar

## The operator F test uses the interaction as the error term.
fOperator <- msOp / msInt
pOperator <- pf(fOperator, df[2], df[3], lower.tail = FALSE)
fInteraction <- msInt / mse
pInteraction <- pf(fInteraction, df[3], df[4], lower.tail = FALSE)

result <- list(
  source = "Base R aov(value ~ part * operator)",
  data = list(
    part = as.character(data$part),
    operator = as.character(data$operator),
    value = data$value
  ),
  anova = list(
    df = as.numeric(df),
    ss = as.numeric(ss),
    ms = as.numeric(ms),
    fOperator = fOperator,
    pOperator = pOperator,
    fInteraction = fInteraction,
    pInteraction = pInteraction
  ),
  components = list(
    parts = parts,
    operators = operators,
    replicates = replicates,
    repeatability = repeatability,
    reproducibility = reproducibility,
    interaction = interaction,
    part = partVar,
    grr = grr,
    total = total,
    pctContribution = 100 * grr / total,
    pctStudyVariation = 100 * sqrt(grr / total),
    ndc = 1.41 * sqrt(partVar / grr)
  )
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/msa.json"
)
