# Reference fixtures — Fine–Gray competing risks.
# Run: Rscript src/stats/reference/r/competing.R
suppressMessages(library(jsonlite))
suppressMessages(library(cmprsk))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/competing.json"

set.seed(20261106)
n <- 220
x <- rnorm(n)
z <- rnorm(n)
time <- rexp(n, rate = exp(0.55 * x - 0.25 * z))
cause <- sample(c(0, 1, 2, 3), n, replace = TRUE, prob = c(0.18, 0.47, 0.25, 0.10))

fit <- crr(time, cause, cbind(x, z))
means <- c(mean(x), mean(z))
prediction <- predict(fit, cov1 = matrix(means, nrow = 1), time = sort(unique(time[cause == 1])))

payload <- list(
  source = "R cmprsk::crr",
  generatedBy = "src/stats/reference/r/competing.R",
  data = list(time = time, cause = cause, x = x, z = z),
  cause = 1,
  coef = unname(fit$coef),
  se = unname(sqrt(diag(fit$var))),
  logLik = fit$loglik,
  cif = list(
    time = as.numeric(prediction[, 1]),
    value = as.numeric(prediction[, 2])
  )
)

writeLines(toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE), output)
