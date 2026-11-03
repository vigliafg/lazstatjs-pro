#!/usr/bin/env Rscript
#
# Reference fixture for the conditional logit and MaxDiff scores.
#
# The conditional logit is fitted by direct maximisation of the conditional
# likelihood with optim(); this is independent of the Newton solver in the
# kernel. MaxDiff counts are exact by construction.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/choiceW9.R

suppressPackageStartupMessages(library(jsonlite))

## ---------------------------------------------------------------------------
## Choice data: 24 sets with three alternatives
## ---------------------------------------------------------------------------
set.seed(20261110)
price <- rep(NA_real_, 72)
quality <- rep(NA_real_, 72)
chosen <- rep(0L, 72)
set_id <- rep(sprintf("Set%02d", 1:24), each = 3)
alternative <- rep(LETTERS[1:3], times = 24)
for (set in 1:24) {
  rows <- ((set - 1) * 3 + 1):(set * 3)
  price[rows] <- sample(c(1, 2, 3), 3, replace = FALSE)
  quality[rows] <- sample(c(1, 2, 3), 3, replace = FALSE)
  utility <- -0.7 * price[rows] + 0.9 * quality[rows] + rnorm(3, 0, 0.6)
  chosen[rows[which.max(utility)]] <- 1L
}
choice_data <- data.frame(
  Set = set_id,
  Alternative = alternative,
  Price = price,
  Quality = quality,
  Chosen = chosen
)

conditional_logit <- function(beta) {
  total <- 0
  for (set in unique(choice_data$Set)) {
    rows <- which(choice_data$Set == set)
    x <- cbind(choice_data$Price[rows], choice_data$Quality[rows])
    utility <- as.numeric(x %*% beta)
    utility <- utility - max(utility)
    probability <- exp(utility) / sum(exp(utility))
    total <- total + log(max(1e-12, probability[choice_data$Chosen[rows] == 1]))
  }
  -total
}

fit <- optim(c(0, 0), conditional_logit, method = "BFGS", hessian = TRUE)
se <- sqrt(diag(solve(fit$hessian)))

## ---------------------------------------------------------------------------
## MaxDiff: 20 blocks of four items
## ---------------------------------------------------------------------------
set.seed(20261111)
maxdiff_rows <- list()
for (block in 1:20) {
  items <- sample(sprintf("Item%02d", 1:8), 4)
  utility <- seq_along(items) + rnorm(4, 0, 0.5)
  for (index in seq_along(items)) {
    maxdiff_rows[[length(maxdiff_rows) + 1]] <- data.frame(
      Block = sprintf("B%02d", block),
      Item = items[index],
      Best = as.integer(index == which.max(utility)),
      Worst = as.integer(index == which.min(utility))
    )
  }
}
maxdiff_data <- do.call(rbind, maxdiff_rows)
best <- aggregate(Best ~ Item, maxdiff_data, sum)
worst <- aggregate(Worst ~ Item, maxdiff_data, sum)
maxdiff <- merge(best, worst, by = "Item", all = TRUE)
maxdiff$Best[is.na(maxdiff$Best)] <- 0
maxdiff$Worst[is.na(maxdiff$Worst)] <- 0
maxdiff$score <- maxdiff$Best - maxdiff$Worst
maxdiff$share <- (maxdiff$Best + 0.5) / (maxdiff$Best + maxdiff$Worst + 1)
maxdiff <- maxdiff[order(-maxdiff$score, -maxdiff$share), ]

result <- list(
  source = "Base R optim for the conditional logit; exact MaxDiff counts",
  choice = list(
    data = choice_data,
    coefficients = as.numeric(fit$par),
    se = as.numeric(se),
    logLik = -fit$value,
    rows = nrow(choice_data),
    sets = length(unique(choice_data$Set))
  ),
  maxdiff = list(
    data = maxdiff_data,
    items = maxdiff$Item,
    best = as.integer(maxdiff$Best),
    worst = as.integer(maxdiff$Worst),
    score = as.integer(maxdiff$score),
    share = as.numeric(maxdiff$share)
  )
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/choiceW9.json"
)
