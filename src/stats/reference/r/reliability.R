# Reference fixtures — reliability growth and block diagrams.
# Run: Rscript src/stats/reference/r/reliability.R
suppressMessages(library(jsonlite))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/reliability.json"

# Crow–AMSAA growth: failure times from a repairable system.
failure_times <- c(12, 28, 41, 63, 88, 101, 140, 176, 199, 245,
                   287, 321, 380, 412, 455, 510, 548, 602, 666, 720)
times <- failure_times
failures <- seq_along(failure_times)
n <- length(times)
last_time <- max(times)

loglik <- function(beta) {
  lambda <- n / last_time^beta
  previous_time <- 0
  previous_count <- 0
  total <- -lambda * last_time^beta
  for (index in seq_along(times)) {
    count <- failures[index] - previous_count
    if (count > 0) {
      increment <- times[index]^beta - previous_time^beta
      total <- total + count * log(lambda * increment)
    }
    previous_time <- times[index]
    previous_count <- failures[index]
  }
  total
}

fit <- optim(0.8, loglik, method = "Brent", lower = 1e-6, upper = 5,
             control = list(fnscale = -1, reltol = 1e-14))
beta <- fit$par
lambda <- n / last_time^beta

stages <- list(c(0.95, 0.90), c(0.99), c(0.92, 0.93, 0.97))
stage_reliability <- vapply(stages, function(values) {
  1 - prod(1 - values)
}, numeric(1))
system <- prod(stage_reliability)

payload <- list(
  source = "Crow–AMSAA maximum likelihood and closed-form RBD",
  generatedBy = "src/stats/reference/r/reliability.R",
  data = list(time = times, failures = failures),
  beta = beta,
  lambda = lambda,
  logLik = fit$value,
  mtbfCumulative = last_time / n,
  mtbfInstantaneous = 1 / (lambda * beta * last_time^(beta - 1)),
  stages = stages,
  stageReliability = unname(stage_reliability),
  system = system
)

writeLines(toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE), output)
