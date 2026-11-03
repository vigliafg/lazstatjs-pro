# Reference fixtures — panel models (FE / RE).
#
# Generates ../fixtures/panel.json from plm for the kernel
# `src/stats/kernels/panel.ts`:
#
#   fe <- plm(Y ~ X1 + X2, data = panel, model = "within")
#   re <- plm(Y ~ X1 + X2, data = panel, model = "random", random.method = "swar")
#   phtest(fe, re)
#   vcovHC(fe, method = "arellano", type = "HC1", cluster = "group")
#
# Run from the repository root:
#   Rscript src/stats/reference/r/panel.R
#
# The output is committed so `npm test` never needs R. Re-run it only when the
# dataset or the expected model changes; review the diff before committing.
#
# Call verified against plm 2.6.7: the cluster-robust covariance of the within
# model is
#
#   V = N/(N - K) (Xw'Xw)^-1 [ sum_g Xg'ug ug'Xg ] (Xw'Xw)^-1
#
# where K = 2 is the number of regressors (plm:::omega multiplies the residuals
# by sqrt(length(residuals)/(nT - k)), i.e. N/(N - K) here — not G/(G - 1)) and
# the groups are entities (`cluster = "group"`).
#
# Definitions reproduced here and documented in the kernel header:
#
# - sigma2_e = SSR_within / (N - G - K), sigma2_b = SSR_between / (G - K - 1),
#   sigma2_u = max(0, sigma2_b - sigma2_e / Tbar), Tbar = G / sum(1/T_i)
#   (harmonic mean; equal to T on a balanced panel). These are exactly plm's
#   Swamy–Arora components (`ercomp(re)$sigma2`).
# - theta_i = 1 - sqrt(sigma2_e / (T_i sigma2_u + sigma2_e)).
# - Random-effects standard errors: plm scales the covariance (X*'X*)^-1 by the
#   residual variance of the quasi-demeaned regression, SSR*/(N - K - 1), not by
#   sigma2_e. Both estimate the same GLS dispersion asymptotically; the kernel
#   follows plm (`re.dispersion`) so the numbers coincide. `re.seSigmaE` below
#   stores the alternative sigma2_e scaling to document the difference.
# - R^2: plm reports the within R^2 for the within model (identical to the
#   kernel's `r2Within`) and the R^2 of the quasi-demeaned regression for random
#   effects (a different quantity, not compared). Within/between/overall are
#   therefore computed explicitly:
#     within  = 1 - SSR_w / sum((y - ybar_i)^2)
#     between = 1 - sum_i (ybar_i - a - xbar_i'b)^2 / sum_i (ybar_i - ybar)^2,
#               a = RE intercept for the RE model and mean_i(ybar_i - xbar_i'b)
#               for the FE model
#     overall = 1 - sum((y - yhat)^2) / sum((y - ybar)^2)
# - Hausman: phtest's statistic is abs(d' [V_FE - V_RE]^-1 d) using the
#   classical covariances of the two models. `valid` records whether that
#   difference is positive definite; on panel_demo it is not (the sample has a
#   strong time trend and the individual-effects model is misspecified), so the
#   kernel reports the absolute value and flags the test as invalid.

suppressMessages(library(plm))
suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/panel.json"
input <- if (length(args) >= 2) args[2] else "samples/regression/panel_demo/data.csv"

panel_case <- function(name, data, index, provenance) {
  panel <- pdata.frame(data, index = index)
  entity <- as.character(data[[index[1]]])
  periods <- as.numeric(data[[index[2]]])
  groups <- unique(entity)
  counts <- as.vector(table(factor(entity, levels = groups)))
  n <- nrow(data)
  G <- length(groups)
  K <- 2

  fe <- plm(Y ~ X1 + X2, data = panel, model = "within")
  re <- plm(Y ~ X1 + X2, data = panel, model = "random", random.method = "swar")
  components <- ercomp(re)
  sigma2e <- unname(components$sigma2["idios"])
  sigma2u <- unname(components$sigma2["id"])
  theta <- unname(as.numeric(components$theta))[1]
  Tbar <- G / sum(1 / counts)

  # Within quantities, recomputed to expose the individual pieces. The groups
  # are rebuilt as a factor with the data-order levels so `tapply` returns the
  # means aligned with `groups` (a character factor would sort "10" before "2").
  grouped <- factor(entity, levels = groups)
  ybar <- as.vector(tapply(data$Y, grouped, mean))
  x1bar <- as.vector(tapply(data$X1, grouped, mean))
  x2bar <- as.vector(tapply(data$X2, grouped, mean))
  ybar_row <- ave(data$Y, grouped)
  x1bar_row <- ave(data$X1, grouped)
  x2bar_row <- ave(data$X2, grouped)
  yw <- data$Y - ybar_row
  xw1 <- data$X1 - x1bar_row
  xw2 <- data$X2 - x2bar_row
  beta_fe_named <- coef(fe)
  beta_fe <- unname(beta_fe_named)
  residual_within <- yw - (beta_fe[1] * xw1 + beta_fe[2] * xw2)
  ssr_within <- sum(residual_within^2)
  sst_within <- sum(yw^2)

  # Between regression on entity means (intercept plus mean regressors).
  between <- solve(crossprod(cbind(1, x1bar, x2bar)), crossprod(cbind(1, x1bar, x2bar), ybar))
  residual_between <- ybar - as.vector(cbind(1, x1bar, x2bar) %*% between)
  sigma2b <- sum(residual_between^2) / (G - K - 1)

  # fixef() gives alpha_i; the full prediction is alpha_i + x_it'beta (fitted(fe)
  # reports only the within part and must not be added to the fixed effect).
  effects_by_entity <- fixef(fe)
  effects_fe <- unname(effects_by_entity[groups])
  fitted_fe <- unname(effects_by_entity[as.character(entity)]) +
    as.vector(cbind(data$X1, data$X2) %*% beta_fe)

  beta_re_named <- coef(re)
  beta_re <- unname(beta_re_named)
  re_fitted <- unname(fitted(re))
  re_residuals <- unname(residuals(re))
  re_dispersion <- sum(re_residuals^2) / (n - K - 1)
  re_vcov <- vcov(re)
  re_se <- sqrt(diag(re_vcov))
  # Alternative classical scaling with sigma2_e (not what plm reports).
  quasi_x <- model.matrix(re)
  re_se_sigma2e <- sqrt(diag(sigma2e * solve(crossprod(quasi_x))))
  re_se_cluster <- sqrt(diag(vcovHC(re, method = "arellano", type = "HC1", cluster = "group")))

  # R^2 (explicit definitions, see the header).
  mean_y <- mean(data$Y)
  mean_ybar <- mean(ybar)
  sst_total <- sum((data$Y - mean_y)^2)
  sst_between <- sum((ybar - mean_ybar)^2)
  fe_intercept <- mean(ybar - (beta_fe[1] * x1bar + beta_fe[2] * x2bar))
  re_between_residual <- ybar - (beta_re[1] + beta_re[2] * x1bar + beta_re[3] * x2bar)
  re_within_residual <- yw - (beta_re[2] * xw1 + beta_re[3] * xw2)
  re_level_residual <- data$Y - (beta_re[1] + beta_re[2] * data$X1 + beta_re[3] * data$X2)

  r2 <- function(ssr, sst) 1 - ssr / sst
  r2_fe <- list(
    within = r2(ssr_within, sst_within),
    between = r2(sum((ybar - fe_intercept - (beta_fe[1] * x1bar + beta_fe[2] * x2bar))^2), sst_between),
    overall = r2(ssr_within, sst_total)
  )
  r2_re <- list(
    within = r2(sum(re_within_residual^2), sst_within),
    between = r2(sum(re_between_residual^2), sst_between),
    overall = r2(sum(re_level_residual^2), sst_total)
  )

  # Hausman (classical covariances, exactly as phtest).
  vcov_fe <- vcov(fe)
  vcov_re <- vcov(re)[-1, -1]
  difference_covariance <- vcov_fe - vcov_re
  valid <- all(eigen(difference_covariance, only.values = TRUE)$values > 0)
  hausman <- phtest(fe, re)
  beta_difference <- beta_fe - beta_re[-1]
  raw_statistic <- as.numeric(t(beta_difference) %*% solve(difference_covariance) %*% beta_difference)

  list(
    name = name,
    provenance = provenance,
    index = index,
    terms = c("X1", "X2"),
    entity = entity,
    time = periods,
    y = unname(data$Y),
    x = unname(as.matrix(data[, c("X1", "X2")])),
    n = n,
    entities = G,
    periods = length(unique(periods)),
    balanced = is.pbalanced(panel),
    tbar = Tbar,
    variance = list(idiosyncratic = sigma2e, entity = sigma2u),
    theta = theta,
    hausman = list(
      statistic = unname(hausman$statistic),
      rawStatistic = raw_statistic,
      df = unname(hausman$parameter),
      p = unname(hausman$p.value),
      valid = valid
    ),
    fe = list(
      terms = names(beta_fe_named),
      coefficients = lapply(seq_along(beta_fe), function(i) {
        list(
          term = names(beta_fe_named)[i],
          beta = unname(beta_fe[i]),
          seCluster = unname(sqrt(diag(vcovHC(fe, method = "arellano", type = "HC1", cluster = "group")))[i]),
          seClassic = unname(sqrt(diag(vcov_fe))[i])
        )
      }),
      fitted = fitted_fe,
      residuals = unname(residuals(fe)),
      entityEffects = effects_fe,
      dfResidual = unname(df.residual(fe)),
      r2 = r2_fe
    ),
    re = list(
      terms = names(beta_re_named),
      coefficients = lapply(seq_along(beta_re), function(i) {
        list(
          term = names(beta_re_named)[i],
          beta = unname(beta_re[i]),
          se = unname(re_se[i]),
          seCluster = unname(re_se_cluster[i])
        )
      }),
      seSigmaE = re_se_sigma2e,
      fitted = re_fitted,
      residuals = re_residuals,
      dispersion = re_dispersion,
      sigma2Within = sigma2e,
      dfResidual = unname(df.residual(re)),
      r2 = r2_re,
      plmR2 = unname(summary(re)$r.squared["rsq"])
    )
  )
}

demo <- read.csv(input, stringsAsFactors = FALSE)

set.seed(20261102)
G <- 15
T <- 6
entity_effect <- rep(rnorm(G, 0, sqrt(0.4)), each = T)
noise <- rnorm(G * T, 0, sqrt(0.6))
x1 <- rnorm(G * T)
x2 <- rnorm(G * T)
synthetic <- data.frame(
  ID = rep(seq_len(G), each = T),
  Time = rep(seq_len(T), G),
  Y = 1 + 0.8 * x1 - 0.4 * x2 + entity_effect + noise,
  X1 = x1,
  X2 = x2
)

cases <- list(
  panel_case(
    "panel-demo",
    demo,
    c("ID", "Time"),
    "samples/regression/panel_demo/data.csv (30 entities x 10 periods)"
  ),
  panel_case(
    "synthetic-balanced",
    synthetic,
    c("ID", "Time"),
    "set.seed(20261102); G = 15, T = 6, sigma_u^2 = 0.4, sigma_e^2 = 0.6"
  )
)

write_json(
  list(
    source = "plm::plm (within / random swar) + plm::phtest + plm::vcovHC(arellano, HC1, group)",
    generatedBy = "src/stats/reference/r/panel.R",
    formula = "Y ~ X1 + X2",
    cases = cases
  ),
  output,
  auto_unbox = TRUE,
  pretty = TRUE,
  digits = NA
)
