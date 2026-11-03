# Reference fixtures — Andersen–Gill and Wei–Lin–Weissfeld recurrent events.
# Run: Rscript src/stats/reference/r/recurrent.R
suppressMessages(library(jsonlite))
suppressMessages(library(survival))

args <- commandArgs(trailingOnly = TRUE)
output <- if (length(args) >= 1) args[1] else "src/stats/reference/fixtures/recurrent.json"

set.seed(20261107)
subjects <- 90
x <- rnorm(subjects)
z <- rnorm(subjects)
rows <- list()
for (subject in seq_len(subjects)) {
  events <- rpois(1, 2.4) + 1
  gaps <- rexp(events, rate = exp(0.35 * x[subject] - 0.20 * z[subject]))
  times <- cumsum(gaps)
  censor_time <- 4 + rexp(1, rate = 0.25)
  previous <- 0
  for (event_index in seq_len(events)) {
    if (times[event_index] > censor_time) {
      break
    }
    rows[[length(rows) + 1]] <- data.frame(
      id = subject, start = previous, stop = times[event_index],
      event = 1, x = x[subject], z = z[subject]
    )
    previous <- times[event_index]
  }
  if (previous < censor_time) {
    rows[[length(rows) + 1]] <- data.frame(
      id = subject, start = previous, stop = censor_time,
      event = 0, x = x[subject], z = z[subject]
    )
  }
}
long <- do.call(rbind, rows)

ag <- coxph(Surv(start, stop, event) ~ x + z + cluster(id),
            data = long, ties = "breslow")

# Wei–Lin–Weissfeld: one stratum per event number, gap time from the previous event.
wlw_rows <- list()
for (subject in sort(unique(long$id))) {
  subset <- long[long$id == subject, ]
  subset <- subset[order(subset$stop), ]
  previous <- 0
  event_number <- 1
  for (row_index in seq_len(nrow(subset))) {
    row <- subset[row_index, ]
    gap <- row$stop - previous
    if (gap > 0) {
      wlw_rows[[length(wlw_rows) + 1]] <- data.frame(
        id = subject, gap = gap, event = row$event, k = event_number,
        x = row$x, z = row$z
      )
    }
    previous <- row$stop
    if (row$event == 1) event_number <- event_number + 1
  }
}
wlw <- do.call(rbind, wlw_rows)
wlw_fit <- coxph(Surv(gap, event) ~ x + z + strata(k) + cluster(id),
                 data = wlw, ties = "breslow")

extract <- function(fit) {
  list(
    coef = unname(coef(fit)),
    se = unname(sqrt(diag(vcov(fit)))),
    logLik = as.numeric(fit$loglik[2]),
    events = fit$nevent,
    subjects = length(unique(fit$cluster))
  )
}

payload <- list(
  source = "R survival::coxph with cluster-robust variance",
  generatedBy = "src/stats/reference/r/recurrent.R",
  data = list(
    id = long$id, start = long$start, stop = long$stop, event = long$event,
    x = long$x, z = long$z
  ),
  ag = extract(ag),
  wlw = extract(wlw_fit)
)

writeLines(toJSON(payload, auto_unbox = TRUE, digits = NA, pretty = TRUE), output)
