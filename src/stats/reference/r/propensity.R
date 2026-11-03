# Reference fixtures — propensity score (nearest matching and IPW).
#
# Generates ../fixtures/propensity.json from MatchIt and base R for the kernel
# in src/stats/kernels/propensity.ts.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/propensity.R
#
# The fixture is committed so the test suite never needs R. Re-run it only when
# the sample or the expected model changes; review the diff before committing.
#
# Notes on the two references:
# - nearest matching reproduces MatchIt::matchit(..., replace = TRUE) with a
#   caliper in SD of the propensity score (std.caliper = TRUE). The ATT and its
#   SE are taken from lm(Outcome ~ Treatment, data = match.data(m),
#   weights = weights), as in the MatchIt documentation. The kernel keeps the
#   paired-difference SE instead, so the reference test compares the ATT and
#   the standardized mean differences, not the nearest-neighbour SE.
# - IPW is base R: fitted probabilities from glm(), ATT weights
#   (1 for treated, e / (1 - e) for controls) and the WLS regression of the
#   outcome on the treatment indicator.

suppressMessages(library(MatchIt))
suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/propensity.json"
data_path <- if (length(args) >= 2) args[2] else "samples/regression/treatment_demo/data.csv"

d <- read.csv(data_path)
covariates <- c("Age", "Score", "Sex")
treatment <- d$Treatment
outcome <- d$Outcome
n <- nrow(d)
level <- 95
critical <- qnorm(1 - (1 - level / 100) / 2)
treated_index <- which(treatment == 1)
control_index <- which(treatment == 0)

ps <- fitted(glm(Treatment ~ Age + Score + Sex, family = binomial, data = d))
common_support <- list(
  lo = max(min(ps[treated_index]), min(ps[control_index])),
  hi = min(max(ps[treated_index]), max(ps[control_index]))
)

coefficient_rows <- function(model) {
  coefficients <- summary(model)$coefficients
  lapply(seq_len(nrow(coefficients)), function(index) {
    beta <- unname(coefficients[index, 1])
    se <- unname(coefficients[index, 2])
    z <- beta / se
    list(
      term = rownames(coefficients)[index],
      beta = beta,
      se = se,
      z = z,
      p = 2 * pnorm(-abs(z)),
      lo = beta - critical * se,
      hi = beta + critical * se
    )
  })
}

att_block <- function(estimate, se) {
  z <- estimate / se
  list(
    estimate = estimate,
    se = se,
    z = z,
    p = 2 * pnorm(-abs(z)),
    lo = estimate - critical * se,
    hi = estimate + critical * se
  )
}

pooled_sd <- function(variable) {
  values <- d[[variable]]
  sqrt((var(values[treatment == 1]) + var(values[treatment == 0])) / 2)
}

weighted_mean <- function(values, weights) sum(values * weights) / sum(weights)

input_block <- function() {
  X <- as.matrix(d[, covariates])
  list(
    treatment = treatment,
    outcome = outcome,
    covariates = lapply(seq_len(n), function(index) as.numeric(X[index, ])),
    names = covariates,
    method = NULL,
    caliper = NULL,
    ratio = NULL,
    level = level
  )
}

# --- Nearest-neighbour matching -------------------------------------------
m <- matchit(
  Treatment ~ Age + Score + Sex,
  data = d,
  method = "nearest",
  distance = "glm",
  link = "logit",
  caliper = 0.2,
  std.caliper = TRUE,
  ratio = 1,
  replace = TRUE
)
match_matrix <- m$match.matrix
matched_treated_rows <- as.integer(rownames(match_matrix))
matched_control_rows <- as.integer(match_matrix[, 1])
keep <- !is.na(matched_control_rows)
matched_treated_rows <- matched_treated_rows[keep]
matched_control_rows <- matched_control_rows[keep]

matched_data <- match.data(m)
matching_model <- lm(Outcome ~ Treatment, data = matched_data, weights = weights)
matching_att <- att_block(
  unname(coef(matching_model)[2]),
  unname(summary(matching_model)$coefficients[2, 2])
)

matching_summary <- summary(m)
sum_all <- matching_summary$sum.all
sum_matched <- matching_summary$sum.matched
# MatchIt's built-in `Std. Mean Diff.` standardizes by the treated-group SD.
# The kernel standardizes by the pooled full-sample SD (as documented in the
# run report), so the fixture recomputes the SMD from MatchIt's means with that
# common denominator; the comparison then isolates the matching, not the
# standardization convention.
matching_balance <- lapply(covariates, function(variable) {
  list(
    covariate = variable,
    meanTreated = unname(sum_matched[variable, "Means Treated"]),
    meanControlBefore = unname(sum_all[variable, "Means Control"]),
    meanControlAfter = unname(sum_matched[variable, "Means Control"]),
    smdBefore = unname(
      (sum_all[variable, "Means Treated"] - sum_all[variable, "Means Control"]) /
        pooled_sd(variable)
    ),
    smdAfter = unname(
      (sum_matched[variable, "Means Treated"] - sum_matched[variable, "Means Control"]) /
        pooled_sd(variable)
    )
  )
})
control_usage <- table(matched_control_rows)
matching_ess <- sum(control_usage)^2 / sum(control_usage^2)

matching_case <- list(
  name = "nearest",
  method = "nearest",
  caliper = 0.2,
  ratio = 1,
  level = level,
  input = input_block(),
  output = list(
    ps = list(
      coefficients = coefficient_rows(
        glm(Treatment ~ Age + Score + Sex, family = binomial, data = d)
      ),
      fitted = ps
    ),
    balance = matching_balance,
    att = matching_att,
    nTreated = length(treated_index),
    nControl = length(control_index),
    matchedTreated = length(matched_treated_rows),
    matchedControls = length(matched_control_rows),
    droppedTreated = length(treated_index) - length(matched_treated_rows),
    effectiveSampleSize = matching_ess,
    commonSupport = common_support,
    method = "nearest",
    caliper = 0.2,
    ratio = 1
  )
)
matching_case$input$method <- "nearest"
matching_case$input$caliper <- 0.2
matching_case$input$ratio <- 1

# --- Inverse probability weighting ---------------------------------------
ps_model <- glm(Treatment ~ Age + Score + Sex, family = binomial, data = d)
ps_ipw <- fitted(ps_model)
weights_ipw <- ifelse(treatment == 1, 1, ps_ipw / (1 - ps_ipw))
ipw_model <- lm(Outcome ~ Treatment, data = d, weights = weights_ipw)
ipw_att <- att_block(
  unname(coef(ipw_model)[2]),
  unname(summary(ipw_model)$coefficients[2, 2])
)

ipw_balance <- lapply(covariates, function(variable) {
  values <- d[[variable]]
  mean_treated <- mean(values[treatment == 1])
  mean_control_before <- mean(values[treatment == 0])
  mean_control_after <- weighted_mean(values, ifelse(treatment == 1, 0, weights_ipw))
  sd_pooled <- pooled_sd(variable)
  list(
    covariate = variable,
    meanTreated = mean_treated,
    meanControlBefore = mean_control_before,
    meanControlAfter = mean_control_after,
    smdBefore = (mean_treated - mean_control_before) / sd_pooled,
    smdAfter = (mean_treated - mean_control_after) / sd_pooled
  )
})
ipw_ess <- sum(weights_ipw)^2 / sum(weights_ipw^2)

ipw_case <- list(
  name = "ipw",
  method = "ipw",
  caliper = 0.2,
  ratio = 1,
  level = level,
  input = input_block(),
  output = list(
    ps = list(
      coefficients = coefficient_rows(ps_model),
      fitted = ps_ipw
    ),
    balance = ipw_balance,
    att = ipw_att,
    nTreated = length(treated_index),
    nControl = length(control_index),
    matchedTreated = length(treated_index),
    matchedControls = length(control_index),
    droppedTreated = 0,
    effectiveSampleSize = ipw_ess,
    commonSupport = common_support,
    method = "ipw",
    caliper = 0.2,
    ratio = 1
  )
)
ipw_case$input$method <- "ipw"
ipw_case$input$caliper <- 0.2
ipw_case$input$ratio <- 1

write_json(
  list(
    source = "R MatchIt::matchit + lm; base R glm IPW",
    generatedBy = "src/stats/reference/r/propensity.R",
    cases = list(matching_case, ipw_case)
  ),
  output,
  auto_unbox = TRUE,
  pretty = TRUE,
  digits = NA
)
