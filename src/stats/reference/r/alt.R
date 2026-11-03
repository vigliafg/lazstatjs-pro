# Reference fixtures — accelerated life testing.
# Run: Rscript src/stats/reference/r/alt.R
suppressMessages(library(jsonlite))
suppressMessages(library(survival))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/alt.json"

set.seed(20261108)
n <- 140
stress <- sample(c(0.8, 1.0, 1.3, 1.8, 2.5), n, replace = TRUE)
temperature <- rnorm(n, 60, 8)
mu <- 6.2 - 0.55 * log(stress) + 0.012 * temperature
sigma <- 0.45
time <- exp(mu + sigma * rnorm(n))
censor <- exp(7.4 + rnorm(n, 0, 0.2))
event <- ifelse(time <= censor, 1, 0)
observed <- pmin(time, censor)

fit <- survreg(Surv(observed, event) ~ log(stress) + temperature, dist = "weibull")
use_stress <- 0.7
reference_stress <- min(stress)
beta_stress <- unname(coef(fit)["log(stress)"])
acceleration <- exp(beta_stress * (log(use_stress) - log(reference_stress)))

payload <- list(
  source = "R survival::survreg Weibull AFT",
  generatedBy = "src/stats/reference/r/alt.R",
  data = list(time = observed, event = event, stress = stress, temperature = temperature),
  model = "inversePower",
  useStress = use_stress,
  referenceStress = reference_stress,
  coef = unname(coef(fit)),
  scale = fit$scale,
  logLik = fit$loglik[2],
  acceleration = acceleration
)

writeLines(toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE), output)
