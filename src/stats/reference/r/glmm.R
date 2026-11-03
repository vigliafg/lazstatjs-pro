# Reference fixtures — GLMM with Laplace approximation.
#
# Generates ../fixtures/glmm.json from lme4 for the families and links covered
# by src/stats/kernels/glmm.ts:
#
#   1. lme4::sleepstudy  Reaction ~ Days + (Days | Subject)   gaussian, ML
#   2. lme4::sleepstudy  Reaction ~ Days + (1 | Subject)      gaussian, ML
#   3. MASS::birthwt     low ~ age + lwt + (1 | race)         binomial
#   4. MASS::quine       Days ~ Age_num + (1 | Eth)           poisson
#
# `lmer(..., REML = FALSE)` is used so the reference log-likelihood is the ML
# one, and `glmer(..., nAGQ = 1)` so both sides use Laplace.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/glmm.R
#
# The output is committed so `npm test` never needs R. Re-run it only when the
# datasets or the expected model change; review the diff before committing.

suppressMessages({
  library(lme4)
  library(MASS)
  library(jsonlite)
})

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/glmm.json"

# Variance components in the same layout as GlmmResult$random.
varianceParts <- function(model) {
  table <- as.data.frame(VarCorr(model))
  group <- table[table$grp != "Residual", , drop = FALSE]
  residual <- table[table$grp == "Residual", , drop = FALSE]
  interceptRow <- group[group$var1 == "(Intercept)" & is.na(group$var2), , drop = FALSE]
  slopeRow <- group[group$var1 != "(Intercept)" & is.na(group$var2), , drop = FALSE]
  covarianceRow <- group[!is.na(group$var2), , drop = FALSE]
  list(
    interceptVariance = unname(interceptRow$vcov[1]),
    slopeVariance = if (nrow(slopeRow) > 0) unname(slopeRow$vcov[1]) else 0,
    covariance = if (nrow(covarianceRow) > 0) unname(covarianceRow$vcov[1]) else 0,
    correlation = if (nrow(covarianceRow) > 0) unname(covarianceRow$sdcor[1]) else 0,
    residualVariance = if (nrow(residual) > 0) unname(residual$vcov[1]) else NA
  )
}

# BLUPs plus their conditional standard errors (sqrt(diag(H_g^-1))).
randomEffects <- function(model, randomSlope) {
  conditional <- ranef(model, condVar = TRUE)
  effects <- conditional[[1]]
  posterior <- attr(effects, "postVar")
  labels <- rownames(effects)
  lapply(seq_len(nrow(effects)), function(index) {
    list(
      group = labels[index],
      intercept = unname(effects[index, 1]),
      interceptSe = unname(sqrt(posterior[1, 1, index])),
      slope = if (randomSlope) unname(effects[index, 2]) else 0,
      slopeSe = if (randomSlope) unname(sqrt(posterior[2, 2, index])) else 0
    )
  })
}

case <- function(model, name, family, link, randomSlope, y, x, slope, groups) {
  coefficients <- summary(model)$coefficients
  terms <- rownames(coefficients)
  # `vcov(..., use.hessian = FALSE)` is lme4's RX-based conditional covariance.
  # glmm.ts follows the same definition (Hessian of the Laplace likelihood with
  # respect to beta at fixed variance parameters), so this is the comparable SE.
  standardErrors <- suppressWarnings(sqrt(diag(vcov(model, use.hessian = FALSE))))
  parts <- varianceParts(model)
  list(
    name = name,
    family = family,
    link = link,
    randomSlope = randomSlope,
    y = y,
    x = lapply(seq_len(nrow(x)), function(row) as.list(unname(x[row, ]))),
    slope = slope,
    groups = as.character(groups),
    coefficients = lapply(seq_along(terms), function(index) {
      list(
        term = terms[index],
        beta = unname(coefficients[index, 1]),
        se = unname(standardErrors[index])
      )
    }),
    random = parts,
    logLik = unname(as.numeric(logLik(model))),
    aic = unname(AIC(model)),
    bic = unname(BIC(model)),
    fitted = round(unname(fitted(model)), 10),
    randomEffects = randomEffects(model, randomSlope)
  )
}

# Nelder-Mead with a large budget: the default optimisers stop a few 1e-5 away
# from the optimum on these flat surfaces, which shows up in the BLUPs.
control <- lmerControl(optimizer = "Nelder_Mead", optCtrl = list(maxfun = 1e5))

data(sleepstudy, package = "lme4")
sleepSlope <- lmer(
  Reaction ~ Days + (Days | Subject),
  data = sleepstudy, REML = FALSE, control = control
)
sleepIntercept <- lmer(
  Reaction ~ Days + (1 | Subject),
  data = sleepstudy, REML = FALSE, control = control
)

data(birthwt, package = "MASS")
birthwt$race <- factor(birthwt$race)
# bobyqa (lme4's default) stops on this flat surface with max|grad| = 0.0076,
# about 0.005 away from the reported intercept; Nelder_Mead reaches the optimum
# that the Laplace kernel also finds.
birthControl <- glmerControl(optimizer = "Nelder_Mead", optCtrl = list(maxfun = 1e5))
birthModel <- suppressWarnings(glmer(
  low ~ age + lwt + (1 | race),
  data = birthwt,
  family = binomial,
  nAGQ = 1,
  control = birthControl
))

data(quine, package = "MASS")
quine$Age_num <- as.numeric(quine$Age)
quineModel <- suppressWarnings(glmer(
  Days ~ Age_num + (1 | Eth),
  data = quine,
  family = poisson,
  nAGQ = 1,
  control = glmerControl(optimizer = "Nelder_Mead", optCtrl = list(maxfun = 1e5))
))

cases <- list(
  case(
    sleepSlope, "sleepstudy-days-slope", "gaussian", "identity", TRUE,
    sleepstudy$Reaction, matrix(sleepstudy$Days, ncol = 1), sleepstudy$Days, sleepstudy$Subject
  ),
  case(
    sleepIntercept, "sleepstudy-intercept", "gaussian", "identity", FALSE,
    sleepstudy$Reaction, matrix(sleepstudy$Days, ncol = 1), rep(0, nrow(sleepstudy)), sleepstudy$Subject
  ),
  case(
    birthModel, "birthwt-binomial", "binomial", "logit", FALSE,
    birthwt$low, cbind(birthwt$age, birthwt$lwt), rep(0, nrow(birthwt)), birthwt$race
  ),
  case(
    quineModel, "quine-poisson", "poisson", "log", FALSE,
    quine$Days, matrix(quine$Age_num, ncol = 1), rep(0, nrow(quine)), quine$Eth
  )
)

write_json(
  list(
    source = "lme4::lmer (REML = FALSE) and lme4::glmer (nAGQ = 1)",
    generatedBy = "src/stats/reference/r/glmm.R",
    cases = cases
  ),
  output,
  auto_unbox = TRUE,
  pretty = TRUE,
  digits = NA,
  na = "null"
)
