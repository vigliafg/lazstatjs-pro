# Reference fixtures — Tobit type-I and Heckman two-step.
#
# Generates ../fixtures/tobit.json from:
# - Tobit:  AER::tobit(Wage ~ Education + Experience, left = 0)  (ML)
# - Heckman: base R two-step probit + OLS on the selected sample   (no
#   sampleSelection package: it is not installed and must not be added).
#
# Run from the repository root:
#   Rscript src/stats/reference/r/tobit.R
#
# The output is committed so `npm test` never needs R. Re-run it only when the
# dataset or the expected model changes; review the diff before committing.
#
# The bundled sample `samples/regression/selection_demo/data.csv` is the
# primary input. The script validates it before fitting: the sample is only
# usable when it actually contains lower-censored wages and both selected and
# non-selected rows. When it does not (the committed sample has all
# Selected = 1 and no Wage = 0), the script falls back to a deterministic
# simulated dataset with the same columns and records that choice in
# `dataSource`. This keeps the fixture reproducible without touching the
# sample files, which are owned elsewhere.
#
# Heckman variance (Murphy–Topel / Greene correction for the first stage).
# With W = [1, x, lambda], A = W'W, e = y - W theta, theta_lambda = delta and
# L_i = d lambda_i / d gamma = -lambda_i (eta_i + lambda_i) z_i (z includes the
# intercept), the kernel uses
#
#   Var(theta) = A^-1 [ sigma^2 A + C I_gamma^-1 C' ] A^-1
#   C          = sum_{selected} (e_i e_lambda' - theta_lambda w_i) L_i'
#   I_gamma    = Z' diag(phi_i^2 / (Phi_i (1 - Phi_i))) Z   (all rows)
#
# which is the same expression implemented in src/stats/kernels/tobit.ts.
# The uncorrected OLS standard errors are stored too (`seOls`), so the
# reference test can show the size of the first-stage correction.

suppressMessages(library(AER))
suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/tobit.json"
input <- if (length(args) >= 2) args[2] else "samples/regression/selection_demo/data.csv"

required <- c("Wage", "Wage_obs", "Selected", "Education", "Experience", "Kids")

data_source <- input
data <- read.csv(input, stringsAsFactors = FALSE)
usable <- all(required %in% names(data)) &&
  nrow(data) >= 50 &&
  sum(data$Wage <= 0) >= 10 &&
  sum(data$Wage > 0) >= 10 &&
  all(data$Selected %in% c(0, 1)) &&
  sum(data$Selected == 1) >= 20 &&
  sum(data$Selected == 0) >= 20

if (!usable) {
  # Deterministic fallback with the contracted columns. Coefficients are chosen
  # so that roughly a third of the wages are censored at zero and both
  # selection groups are well populated.
  set.seed(20261103)
  n <- 450
  education <- round(rnorm(n, 12, 2.2), 6)
  experience <- round(rnorm(n, 10, 4), 6)
  kids <- rpois(n, 1.8)
  latent <- -5.2 + 0.42 * education + 0.16 * experience + rnorm(n, sd = 1.9)
  wage <- round(pmax(0, latent), 6)
  index <- -1.1 + 0.14 * education + 0.05 * experience - 0.55 * kids + rnorm(n, sd = 1)
  selected <- as.integer(index > 0)
  data <- data.frame(
    Wage = wage,
    Wage_obs = round(ifelse(selected == 1, wage, 0), 6),
    Selected = selected,
    Education = education,
    Experience = experience,
    Kids = kids
  )
  data_source <- paste0(
    input,
    " (unusable: no censored wage or no non-selected rows; ",
    "deterministic fallback generated in this script, seed 20261103)"
  )
  warning(
    "samples/regression/selection_demo/data.csv has no usable censoring/selection: ",
    "the fixture uses the deterministic fallback dataset"
  )
}

# ---------------------------------------------------------------------------
# Tobit type-I: AER::tobit
# ---------------------------------------------------------------------------

tobit_model <- tobit(Wage ~ Education + Experience, left = 0, data = data)
tobit_summary <- summary(tobit_model)
tobit_coef <- tobit_summary$coefficients
log_scale_se <- unname(tobit_coef["Log(scale)", "Std. Error"])
tobit_sigma <- unname(tobit_model$scale)
tobit_sigma_se <- unname(tobit_sigma * log_scale_se)
tobit_vcov <- vcov(tobit_model)
tobit_terms <- c("(Intercept)", "Education", "Experience")
tobit_beta <- unname(coef(tobit_model)[tobit_terms])
tobit_se <- sqrt(diag(tobit_vcov)[tobit_terms])

tobit_case <- list(
  name = "tobit-type1",
  lower = 0,
  # `NA` serialises to JSON null (`NULL` would become `{}`).
  upper = NA,
  coefficients = lapply(seq_along(tobit_beta), function(index) {
    list(
      term = tobit_terms[index],
      beta = unname(tobit_beta[index]),
      se = unname(tobit_se[index])
    )
  }),
  sigma = unname(tobit_sigma),
  sigmaSe = unname(tobit_sigma_se),
  logLik = unname(as.numeric(logLik(tobit_model))),
  n = nrow(data),
  nLower = unname(sum(data$Wage <= 0)),
  # The reference model has no right censoring (`right = Inf`).
  nUpper = 0L,
  nUncensored = unname(sum(data$Wage > 0))
)

# ---------------------------------------------------------------------------
# Heckman two-step: probit for selection, OLS with the inverse Mills ratio
# ---------------------------------------------------------------------------

selection_model <- glm(
  Selected ~ Education + Experience + Kids,
  family = binomial("probit"),
  data = data,
  control = glm.control(epsilon = 1e-14, maxit = 100)
)
eta <- predict(selection_model, type = "link")
phi <- dnorm(eta)
pnorm_eta <- pnorm(eta)
imr <- phi / pnorm_eta

selected_rows <- which(data$Selected == 1)
outcome_data <- data.frame(
  Wage_obs = data$Wage_obs[selected_rows],
  Education = data$Education[selected_rows],
  Experience = data$Experience[selected_rows],
  IMR = imr[selected_rows]
)
outcome_model <- lm(Wage_obs ~ Education + Experience + IMR, data = outcome_data)

beta <- coef(outcome_model)
sigma <- summary(outcome_model)$sigma
lambda <- unname(beta["IMR"])
rho <- lambda / sigma

w <- model.matrix(outcome_model)
a <- crossprod(w)
a_inverse <- solve(a)
e <- residuals(outcome_model)
q <- length(coef(selection_model))
z <- model.matrix(selection_model)
weights_information <- phi^2 / (pnorm_eta * (1 - pnorm_eta))
information <- crossprod(z, z * weights_information)
information_inverse <- solve(information)

derivative_lambda <- -imr * (eta + imr)
c_matrix <- matrix(0, nrow = ncol(w), ncol = q)
lambda_position <- which(colnames(w) == "IMR")
for (row in seq_along(selected_rows)) {
  observation <- selected_rows[row]
  score_outcome <- numeric(ncol(w))
  score_outcome[lambda_position] <- e[row]
  score_outcome <- score_outcome - lambda * w[row, ]
  c_matrix <- c_matrix + score_outcome %o% (derivative_lambda[observation] * z[observation, ])
}
covariance <- sigma^2 * a_inverse +
  a_inverse %*% c_matrix %*% information_inverse %*% t(c_matrix) %*% a_inverse
se_corrected <- sqrt(diag(covariance))
se_ols <- sqrt(diag(sigma^2 * a_inverse))

heckman_case <- list(
  name = "heckman-two-step",
  outcomeCoefficients = lapply(seq_along(beta), function(index) {
    list(
      term = names(beta)[index],
      beta = unname(beta[index]),
      se = unname(se_corrected[index]),
      seOls = unname(se_ols[index])
    )
  }),
  selectionCoefficients = lapply(seq_along(coef(selection_model)), function(index) {
    list(
      term = names(coef(selection_model))[index],
      beta = unname(coef(selection_model)[index]),
      se = unname(sqrt(diag(vcov(selection_model)))[index])
    )
  }),
  sigma = unname(sigma),
  rho = unname(rho),
  lambda = lambda,
  lambdaSe = unname(se_corrected[lambda_position]),
  n = nrow(data),
  nSelected = length(selected_rows),
  imr = unname(imr)
)

write_json(
  list(
    source = "AER::tobit + base R two-step probit/OLS",
    generatedBy = "src/stats/reference/r/tobit.R",
    dataset = "samples/regression/selection_demo/data.csv",
    dataSource = data_source,
    formula = list(
      tobit = "Wage ~ Education + Experience (left = 0)",
      heckman = "Wage_obs ~ Education + Experience; Selected ~ Education + Experience + Kids"
    ),
    data = list(
      y = unname(data$Wage),
      yObserved = unname(data$Wage_obs),
      selected = unname(data$Selected),
      x = list(
        Education = unname(data$Education),
        Experience = unname(data$Experience)
      ),
      z = list(
        Education = unname(data$Education),
        Experience = unname(data$Experience),
        Kids = unname(data$Kids)
      )
    ),
    cases = list(
      tobit = tobit_case,
      heckman = heckman_case
    )
  ),
  output,
  auto_unbox = TRUE,
  pretty = TRUE,
  digits = NA
)

cat("Wrote", output, "\n")
cat("Data source:", data_source, "\n")
cat("Tobit: sigma =", tobit_sigma, " logLik =", as.numeric(logLik(tobit_model)), "\n")
cat("Heckman: sigma =", sigma, " rho =", rho, " lambda =", lambda, "\n")
