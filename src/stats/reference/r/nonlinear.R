# Reference fixtures — nonlinear regression.
#
# Generates ../fixtures/nonlinear.json for the five model families covered by
# src/stats/kernels/nonlinear.ts.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/nonlinear.R
#
# The output is committed so `npm test` never needs R. Re-run it only when the
# datasets or the expected model change; review the diff before committing.
#
# Notes on the parameterisation (it mirrors the kernel exactly):
#   exponential  y = a * exp(b * x)
#   logistic     y = L / (1 + exp(-k * (x - x0)))   (k = 1 / scale)
#   gompertz     y = a * exp(-b * exp(-c * x))
#   power        y = a * x^b
#   michaelis    y = vmax * x / (km + x)
#
# nls() supplies the starting values and the fit, but its relative-offset
# stopping rule (tol = 1e-6, forced because tighter values never converge with
# numerical derivatives) can leave the parameters ~1e-5 away from the true
# least-squares optimum on flat surfaces. The fit is therefore polished with a
# few BFGS restarts using an analytic gradient; a final check with `optim`
# brings the estimates to the actual minimum. Standard errors come from R's
# `numericDeriv` Jacobian, so they stay independent of the kernel's analytic
# derivatives.
#
# The 95% intervals are the t-based intervals
# `estimate +/- qt(0.975, df) * se`, i.e. the same convention as the kernel;
# they are not R's profile-likelihood intervals.

suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/nonlinear.json"

modelValue <- function(model, p, x) {
  switch(
    model,
    exponential = p[1] * exp(p[2] * x),
    logistic = p[1] / (1 + exp(-p[2] * (x - p[3]))),
    gompertz = p[1] * exp(-p[2] * exp(-p[3] * x)),
    power = p[1] * x^p[2],
    michaelis = p[1] * x / (p[2] + x)
  )
}

# Analytic derivatives, used only to polish the nls() fit.
modelJacobian <- function(model, p, x) {
  switch(
    model,
    exponential = cbind(
      exp(p[2] * x),
      p[1] * x * exp(p[2] * x)
    ),
    logistic = {
      s <- 1 / (1 + exp(-p[2] * (x - p[3])))
      slope <- s * (1 - s)
      cbind(s, p[1] * slope * (x - p[3]), -p[1] * p[2] * slope)
    },
    gompertz = {
      decay <- exp(-p[3] * x)
      exponential <- exp(-p[2] * decay)
      cbind(
        exponential,
        -p[1] * decay * exponential,
        p[1] * p[2] * x * decay * exponential
      )
    },
    power = cbind(
      x^p[2],
      p[1] * x^p[2] * log(x)
    ),
    michaelis = {
      denominator <- p[2] + x
      cbind(x / denominator, -p[1] * x / denominator^2)
    }
  )
}

residualsOf <- function(model, p, x, y) y - modelValue(model, p, x)

sumOfSquares <- function(model, p, x, y) sum(residualsOf(model, p, x, y)^2)

gradientOf <- function(model, p, x, y) {
  jacobian <- modelJacobian(model, p, x)
  as.vector(-2 * crossprod(jacobian, residualsOf(model, p, x, y)))
}

fitCase <- function(name, model, x, y, start) {
  data <- data.frame(x = x, y = y)
  formula <- switch(
    model,
    exponential = y ~ a * exp(b * x),
    logistic = y ~ L / (1 + exp(-k * (x - x0))),
    gompertz = y ~ a * exp(-b * exp(-c * x)),
    power = y ~ a * x^b,
    michaelis = y ~ vmax * x / (km + x)
  )
  fit <- nls(
    formula,
    data = data,
    start = start,
    control = nls.control(maxiter = 500, tol = 1e-6, minFactor = 1e-12)
  )

  # Polish the fit with BFGS restarts; on the flattest surfaces a single run
  # still leaves a tiny gradient, while starting from the raw data-driven
  # values can reach a slightly lower minimum than the nls() stopping point.
  # Keep the best of both candidate starts.
  polish <- function(initial) {
    parameters <- unname(initial)
    for (restart in seq_len(3)) {
      polished <- optim(
        parameters,
        function(p) sumOfSquares(model, p, x, y),
        gr = function(p) gradientOf(model, p, x, y),
        method = "BFGS",
        control = list(reltol = 1e-16, maxit = 10000)
      )
      parameters <- polished$par
    }
    parameters
  }
  candidates <- list(unname(coef(fit)), unname(unlist(start)))
  parameters <- NULL
  for (candidate in candidates) {
    polished <- polish(candidate)
    if (is.null(parameters) || sumOfSquares(model, polished, x, y) < sumOfSquares(model, parameters, x, y)) {
      parameters <- polished
    }
  }
  names(parameters) <- names(coef(fit))

  # Residual Jacobian from R's numericDeriv (independent of the kernel).
  residualFunction <- function(p) residualsOf(model, p, x, y)
  p <- parameters
  jacobian <- attr(numericDeriv(quote(residualFunction(p)), "p"), "gradient")
  df <- length(y) - length(parameters)
  covariance <- solve(crossprod(jacobian)) * sumOfSquares(model, parameters, x, y) / df
  standardErrors <- sqrt(diag(covariance))
  names(standardErrors) <- names(parameters)
  critical <- qt(0.975, df)

  sse <- sumOfSquares(model, parameters, x, y)
  sst <- sum((y - mean(y))^2)
  r2 <- 1 - sse / sst
  adjR2 <- 1 - (1 - r2) * (length(y) - 1) / df

  list(
    name = name,
    model = model,
    x = x,
    y = y,
    start = as.list(start),
    parameters = lapply(names(parameters), function(parameter) {
      estimate <- unname(parameters[[parameter]])
      se <- unname(standardErrors[[parameter]])
      t <- estimate / se
      list(
        name = parameter,
        estimate = estimate,
        se = se,
        t = t,
        p = 2 * pt(-abs(t), df),
        ciLo = estimate - critical * se,
        ciHi = estimate + critical * se
      )
    }),
    fitted = unname(modelValue(model, parameters, x)),
    residuals = unname(residualsOf(model, parameters, x, y)),
    sse = sse,
    r2 = r2,
    adjR2 = adjR2,
    rmse = sqrt(sse / df),
    n = length(y),
    df = df
  )
}

# exponential — Indometh subject 1: concentration decays with time.
indometh <- subset(Indometh, Subject == 1)
indometh <- indometh[order(indometh$time), ]
exponentialStart <- {
  line <- lm(log(conc) ~ time, data = indometh)
  list(a = unname(exp(coef(line)[1])), b = unname(coef(line)[2]))
}

# logistic — faithful waiting time saturates with eruption length. SSlogis uses
# Asym / (1 + exp((xmid - x) / scal)); convert scal to k = 1 / scal.
logisticInitial <- getInitial(
  waiting ~ SSlogis(eruptions, Asym, xmid, scal),
  data = faithful
)
logisticStart <- list(
  L = unname(logisticInitial[["Asym"]]),
  k = unname(1 / logisticInitial[["scal"]]),
  x0 = unname(logisticInitial[["xmid"]])
)

# gompertz — Orange tree 1 growth. SSgompertz is Asym * exp(-b2 * b3^x), so
# b = b2 and c = -log(b3).
orange <- subset(Orange, Tree == "1")
gompertzInitial <- getInitial(
  circumference ~ SSgompertz(age, Asym, b2, b3),
  data = orange
)
gompertzStart <- list(
  a = unname(gompertzInitial[["Asym"]]),
  b = unname(gompertzInitial[["b2"]]),
  c = unname(-log(gompertzInitial[["b3"]]))
)

# power — mtcars fuel economy against weight (log-log start).
powerStart <- {
  line <- lm(log(mpg) ~ log(wt), data = mtcars)
  list(a = unname(exp(coef(line)[1])), b = unname(coef(line)[2]))
}

# michaelis — Puromycin treated: reaction rate against concentration.
puromycin <- subset(Puromycin, state == "treated")
michaelisInitial <- getInitial(rate ~ SSmicmen(conc, Vm, K), data = puromycin)
michaelisStart <- list(
  vmax = unname(michaelisInitial[["Vm"]]),
  km = unname(michaelisInitial[["K"]])
)

cases <- list(
  fitCase(
    "exponential-indometh", "exponential",
    indometh$time, indometh$conc, exponentialStart
  ),
  fitCase(
    "logistic-faithful", "logistic",
    faithful$eruptions, faithful$waiting, logisticStart
  ),
  fitCase(
    "gompertz-orange", "gompertz",
    orange$age, orange$circumference, gompertzStart
  ),
  fitCase(
    "power-mtcars", "power",
    mtcars$wt, mtcars$mpg, powerStart
  ),
  fitCase(
    "michaelis-puromycin", "michaelis",
    puromycin$conc, puromycin$rate, michaelisStart
  )
)

write_json(
  list(
    source = "R nls() refined with optim(method = \"BFGS\")",
    generatedBy = "src/stats/reference/r/nonlinear.R",
    cases = cases
  ),
  output,
  auto_unbox = TRUE,
  pretty = TRUE,
  digits = NA
)
