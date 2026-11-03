# Reference fixtures — wave 6 survival models.
# Run: Rscript src/stats/reference/r/survival-w6.R
suppressMessages(library(jsonlite))
suppressMessages(library(survival))
suppressMessages(library(cmprsk))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/survival-w6.json"

data(lung)
lung <- na.omit(lung[, c("time", "status", "age", "sex", "ph.ecog", "inst")])
lung <- lung[seq_len(min(120, nrow(lung))), ]
lung$event <- ifelse(lung$status == 2, 1, 0)

# --- Actuarial life table ---------------------------------------------------
life_table <- function(time, event, k = 6) {
  max_time <- max(time)
  width <- max_time / k
  rows <- list()
  survival <- 1
  greenwood <- 0
  for (index in seq_len(k)) {
    start <- (index - 1) * width
    end <- if (index == k) max_time else index * width
    in_interval <- if (index == k) time >= start & time <= end else time >= start & time < end
    at_risk <- sum(time >= start)
    events <- sum(in_interval & event == 1)
    censored <- sum(in_interval & event == 0)
    effective <- at_risk - censored / 2
    q <- if (effective > 0) min(1, events / effective) else 0
    p <- 1 - q
    if (effective > 0) {
      survival <- survival * p
      greenwood <- greenwood + events / max(1, effective * (effective - events))
    }
    rows[[index]] <- list(
      start = start, end = end, atRisk = at_risk, events = events,
      censored = censored, effective = effective, q = q, p = p,
      survival = survival, se = survival * sqrt(greenwood)
    )
  }
  rows
}

# --- Turnbull interval-censored NPMLE --------------------------------------
# Left-censored and interval-censored observations with a unique NPMLE:
# the support intervals do not overlap in a way that leaves the mass free.
turn_lower <- c(0, 0, 0, 3, 4, 5, 6)
turn_upper <- c(2, 2, 3, 4, 5, 6, 7)
turn_fit <- survfit(Surv(turn_lower, turn_upper, type = "interval2") ~ 1)
turn <- list(
  lower = turn_lower,
  upper = turn_upper,
  # survfit reports the midpoint of each Turnbull interval; the survival after
  # the interval is the value to compare with the kernel's step function.
  time = turn_fit$time,
  surv = turn_fit$surv
)

# --- Parametric AFT families ------------------------------------------------
parametric <- function(distribution) {
  fit <- survreg(Surv(time, event) ~ age + sex, data = lung, dist = distribution)
  list(
    coef = unname(coef(fit)),
    scale = fit$scale,
    logLik = fit$loglik[2]
  )
}

# --- Gompertz proportional hazards -----------------------------------------
gompertz_loglik <- function(par) {
  alpha <- par[1]
  beta <- par[2:3]
  log_gamma <- par[4]
  gamma <- exp(log_gamma)
  eta <- alpha + beta[1] * lung$age + beta[2] * lung$sex
  a <- exp(eta)
  event <- lung$event
  sum(event * (eta + gamma * lung$time) -
        (a / gamma) * (exp(gamma * lung$time) - 1))
}
gompertz_fit <- optim(c(log(1 / mean(lung$time)), 0, 0, log(1 / max(lung$time))),
                      gompertz_loglik, method = "BFGS",
                      control = list(fnscale = -1, maxit = 5000, reltol = 1e-12))
gompertz <- list(
  par = unname(gompertz_fit$par),
  logLik = gompertz_fit$value,
  convergence = gompertz_fit$convergence
)

# --- Shared gamma frailty Cox ----------------------------------------------
frailty_fit <- coxph(
  Surv(time, event) ~ age + sex + frailty(inst, distribution = "gamma"),
  data = lung,
  ties = "breslow"
)
frailty <- list(
  coef = unname(coef(frailty_fit)),
  se = unname(sqrt(diag(vcov(frailty_fit)))),
  theta = as.numeric(frailty_fit$history[[1]]$theta),
  logLik = as.numeric(frailty_fit$loglik[2])
)

payload <- list(
  source = "R survival::survfit, survreg, coxph; cmprsk::crr",
  generatedBy = "src/stats/reference/r/survival-w6.R",
  data = list(
    time = lung$time, event = lung$event, age = lung$age,
    sex = lung$sex, group = lung$inst
  ),
  life = list(intervals = 6, rows = life_table(lung$time, lung$event, 6)),
  turnbull = turn,
  parametric = list(
    weibull = parametric("weibull"),
    lognormal = parametric("lognormal"),
    loglogistic = parametric("loglogistic"),
    gompertz = gompertz
  ),
  frailty = frailty
)

writeLines(toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE), output)
