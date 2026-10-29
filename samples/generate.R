#!/usr/bin/env Rscript
#
# Regenerate the sample datasets used by the LazStats tests and by manual
# functional checks.
#
# Every dataset is written in five formats (CSV, SPSS .sav, Stata .dta,
# Excel .xlsx and JSON) so the same data can exercise the text, binary and
# workbook import paths. The manifest is the single index consumed by
# `src/io/samples.test.ts`.
#
# Usage:
#   Rscript samples/generate.R
#
# Requires: haven, writexl, jsonlite, MASS, survival (all available from CRAN;
# MASS and survival ship with R).

suppressPackageStartupMessages({
  library(haven)
  library(writexl)
  library(jsonlite)
  library(MASS)
  library(survival)
})

script_arg <- grep("^--file=", commandArgs(FALSE), value = TRUE)
root <- if (length(script_arg) == 1) {
  normalizePath(dirname(sub("^--file=", "", script_arg)))
} else {
  normalizePath("samples")
}
setwd(root)

FORMATS <- c("csv", "sav", "dta", "xlsx", "json")
datasets <- list()

example <- function(analysis, columns, ...) {
  out <- list(analysis = analysis, columns = columns)
  options <- list(...)
  if (length(options) > 0) out$options <- options
  out
}

write_dataset <- function(family, id, data, title, source, procedures, examples, notes) {
  directory <- file.path(family, id)
  dir.create(directory, recursive = TRUE, showWarnings = FALSE)

  write.csv(
    data,
    file.path(directory, "data.csv"),
    row.names = FALSE,
    na = "",
    fileEncoding = "UTF-8"
  )
  write_sav(data, file.path(directory, "data.sav"))
  write_dta(data, file.path(directory, "data.dta"), version = 14)
  write_xlsx(setNames(list(data), "Data"), file.path(directory, "data.xlsx"))
  writeLines(
    toJSON(data, dataframe = "rows", na = "null", auto_unbox = TRUE, digits = NA, pretty = TRUE),
    file.path(directory, "data.json"),
    useBytes = TRUE
  )

  datasets[[length(datasets) + 1]] <<- list(
    id = id,
    title = title,
    family = family,
    dir = directory,
    source = source,
    rows = nrow(data),
    columns = as.list(names(data)),
    formats = as.list(FORMATS),
    procedures = as.list(procedures),
    examples = examples,
    notes = notes
  )
}

## ---------------------------------------------------------------------------
## Descriptive
## ---------------------------------------------------------------------------

iris_data <- datasets::iris
names(iris_data) <- c("Sepal_Length", "Sepal_Width", "Petal_Length", "Petal_Width", "Species")
write_dataset(
  "descriptive", "iris", iris_data,
  "Iris measurements",
  "datasets::iris (R)",
  c("descriptive", "distfit", "correlation", "multivariate", "wizard"),
  list(
    example("descriptive", list(variables = c("Sepal_Length", "Sepal_Width", "Petal_Length", "Petal_Width"))),
    example("distfit", list(variable = "Sepal_Length")),
    example("correlation", list(variables = c("Sepal_Length", "Sepal_Width", "Petal_Length", "Petal_Width"))),
    example("multivariate", list(variables = c("Sepal_Length", "Sepal_Width", "Petal_Length", "Petal_Width"))),
    example("wizard", list(outcome = "Sepal_Length", group = "Species"))
  ),
  "The canonical classification dataset: four continuous flower measurements and a three-level species label."
)

faithful_data <- datasets::faithful
names(faithful_data) <- c("Eruptions", "Waiting")
write_dataset(
  "descriptive", "faithful", faithful_data,
  "Old Faithful eruption lengths",
  "datasets::faithful (R)",
  c("descriptive", "distfit"),
  list(
    example("descriptive", list(variables = c("Eruptions", "Waiting"))),
    example("distfit", list(variable = "Eruptions"))
  ),
  "Two continuous measurements from 272 eruptions, useful for distribution fitting and summary statistics."
)

## ---------------------------------------------------------------------------
## Compare groups
## ---------------------------------------------------------------------------

plant_growth <- datasets::PlantGrowth
names(plant_growth) <- c("weight", "group")
write_dataset(
  "compare", "plantgrowth", plant_growth,
  "Plant growth by treatment",
  "datasets::PlantGrowth (R)",
  c("anova", "descriptive", "wizard"),
  list(
    example("anova", list(dependent = "weight", group = "group")),
    example("descriptive", list(variables = "weight")),
    example("wizard", list(outcome = "weight", group = "group"))
  ),
  "One factor with three levels (ctrl, trt1, trt2) and a continuous weight outcome."
)

control_weight <- plant_growth$weight[plant_growth$group == "ctrl"]
treated_weight <- plant_growth$weight[plant_growth$group == "trt1"]
plant_growth_wide <- data.frame(Control = control_weight, Treatment = treated_weight)
write_dataset(
  "compare", "plantgrowth_wide", plant_growth_wide,
  "Plant growth, two groups wide",
  "datasets::PlantGrowth (R), ctrl and trt1 subset",
  c("ttest", "tost"),
  list(
    example("ttest", list(var1 = "Control", var2 = "Treatment"), type = "ind"),
    example("tost", list(var1 = "Control", var2 = "Treatment"))
  ),
  "Ten control and ten treated plants in two columns, the shape expected by the independent T-Test and TOST."
)

tooth_growth <- datasets::ToothGrowth
tooth_data <- data.frame(
  Length = tooth_growth$len,
  Supplement = factor(tooth_growth$supp),
  Dose = factor(tooth_growth$dose, levels = c(0.5, 1, 2), labels = c("Low", "Medium", "High")),
  Dose_num = tooth_growth$dose
)
write_dataset(
  "compare", "toothgrowth", tooth_data,
  "Tooth growth by supplement and dose",
  "datasets::ToothGrowth (R)",
  c("factorial", "anova", "ancova"),
  list(
    example("factorial", list(response = "Length", factorA = "Supplement", factorB = "Dose")),
    example("anova", list(dependent = "Length", group = "Supplement")),
    example("ancova", list(response = "Length", factor = "Supplement", covariates = "Dose_num"))
  ),
  "A two-factor design (supplement x dose) with the numeric dose kept as a covariate in Dose_num."
)

sleep_data <- datasets::sleep
sleep_wide <- reshape(sleep_data, idvar = "ID", timevar = "group", direction = "wide")
sleep_wide <- data.frame(
  Subject = sleep_wide$ID,
  Extra_1 = sleep_wide$extra.1,
  Extra_2 = sleep_wide$extra.2
)
write_dataset(
  "compare", "sleep_wide", sleep_wide,
  "Sleep gain, paired measurements",
  "datasets::sleep (R)",
  c("ttest", "tost", "nonparamrm"),
  list(
    example("ttest", list(var1 = "Extra_1", var2 = "Extra_2"), type = "dep"),
    example("tost", list(var1 = "Extra_1", var2 = "Extra_2")),
    example("nonparamrm", list(left = "Extra_1", right = "Extra_2"))
  ),
  "Ten subjects measured under two conditions, reshaped wide so paired tests compare Extra_1 with Extra_2."
)

set.seed(20261030)
n_matched <- 60
before <- rbinom(n_matched, 1, 0.45)
after <- ifelse(runif(n_matched) < 0.35, 1 - before, before)
follow_up <- ifelse(runif(n_matched) < 0.25, 1 - after, after)
matched_binary <- data.frame(
  Subject = seq_len(n_matched),
  Before = before,
  After = after,
  Follow_up = follow_up
)
write_dataset(
  "compare", "matched_binary", matched_binary,
  "Matched binary outcomes",
  "Synthetic, seeded with set.seed(20261030)",
  c("nonparamrm"),
  list(
    example("nonparamrm", list(left = "Before", right = "After"), mode = "mcnemar"),
    example("nonparamrm", list(selected = c("Before", "After", "Follow_up")), mode = "cochran")
  ),
  "Three paired 0/1 measurements on 60 subjects, for McNemar and Cochran Q."
)

chick_weight <- datasets::ChickWeight
chick_weight$Diet <- factor(chick_weight$Diet, levels = 1:4, labels = paste("Diet", 1:4))
chick_wide <- reshape(
  chick_weight,
  idvar = c("Chick", "Diet"),
  timevar = "Time",
  direction = "wide",
  v.names = "weight"
)
chick_wide <- chick_wide[complete.cases(chick_wide), ]
chick_wide <- chick_wide[, c("Chick", "Diet", "weight.0", "weight.4", "weight.8", "weight.12", "weight.16", "weight.20")]
names(chick_wide) <- c("Chick", "Diet", "Weight_0", "Weight_4", "Weight_8", "Weight_12", "Weight_16", "Weight_20")
write_dataset(
  "compare", "chickweight_wide", chick_wide,
  "Chick weight over time, wide",
  "datasets::ChickWeight (R), complete cases and six time points",
  c("repeatedanova", "mixedanova", "nonparamrm"),
  list(
    example("repeatedanova", list(conditions = c("Weight_0", "Weight_4", "Weight_8", "Weight_12", "Weight_16", "Weight_20"))),
    example("mixedanova", list(group = "Diet", conditions = c("Weight_0", "Weight_4", "Weight_8", "Weight_12", "Weight_16", "Weight_20"))),
    example("nonparamrm", list(selected = c("Weight_0", "Weight_4", "Weight_8", "Weight_12", "Weight_16", "Weight_20")))
  ),
  "45 chicks with complete follow-up at six time points, split across four diets."
)

## ---------------------------------------------------------------------------
## Regression
## ---------------------------------------------------------------------------

mtcars_data <- datasets::mtcars
mtcars_sample <- data.frame(
  Car = rownames(mtcars_data),
  mpg = mtcars_data$mpg,
  cyl = mtcars_data$cyl,
  disp = mtcars_data$disp,
  hp = mtcars_data$hp,
  drat = mtcars_data$drat,
  wt = mtcars_data$wt,
  qsec = mtcars_data$qsec,
  vs = mtcars_data$vs,
  am = mtcars_data$am,
  gear = mtcars_data$gear,
  carb = mtcars_data$carb
)
write_dataset(
  "regression", "mtcars", mtcars_sample,
  "Motor Trend car road tests",
  "datasets::mtcars (R)",
  c("regression", "correlation", "descriptive"),
  list(
    example("regression", list(dependent = "mpg", predictors = c("wt", "hp", "disp"))),
    example("correlation", list(variables = c("mpg", "wt", "hp", "disp"))),
    example("descriptive", list(variables = c("mpg", "wt", "hp")))
  ),
  "The classic 32-car dataset: continuous performance and design measures plus binary and count codes."
)

birthwt_data <- MASS::birthwt
birthwt_sample <- data.frame(
  Low = birthwt_data$low,
  Age = birthwt_data$age,
  Lwt = birthwt_data$lwt,
  Race = factor(birthwt_data$race, levels = 1:3, labels = c("White", "Black", "Other")),
  Smoke = birthwt_data$smoke,
  Ptl = birthwt_data$ptl,
  Ht = birthwt_data$ht,
  Ui = birthwt_data$ui,
  Ftv = birthwt_data$ftv,
  Bwt = birthwt_data$bwt
)
write_dataset(
  "regression", "birthwt", birthwt_sample,
  "Low birth weight risk factors",
  "MASS::birthwt (R)",
  c("logistic", "regression", "descriptive"),
  list(
    example("logistic", list(outcome = "Low", predictors = c("Age", "Lwt", "Smoke", "Ptl", "Ht", "Ui", "Bwt"))),
    example("regression", list(dependent = "Bwt", predictors = c("Age", "Lwt", "Smoke"))),
    example("descriptive", list(variables = c("Age", "Lwt", "Bwt")))
  ),
  "189 births with a binary low-weight outcome and a mix of continuous and binary risk factors."
)

quine_data <- MASS::quine
quine_sample <- data.frame(
  Days = quine_data$Days,
  Age = factor(quine_data$Age),
  Age_num = as.integer(quine_data$Age) - 1,
  Sex = quine_data$Sex,
  Sex_male = as.integer(quine_data$Sex == "M"),
  Lrn = quine_data$Lrn,
  Lrn_SL = as.integer(quine_data$Lrn == "SL"),
  Eth = quine_data$Eth
)
write_dataset(
  "regression", "quine", quine_sample,
  "School absence counts",
  "MASS::quine (R)",
  c("countreg", "descriptive"),
  list(
    example("countreg", list(dependent = "Days", predictors = c("Age_num", "Sex_male", "Lrn_SL"))),
    example("descriptive", list(variables = c("Days", "Age_num")))
  ),
  "146 children with school absence counts; the factor versions are kept next to numeric dummy codes for count models."
)

housing_data <- MASS::housing
housing_rows <- housing_data[rep(seq_len(nrow(housing_data)), housing_data$Freq), ]
housing_sample <- data.frame(
  Sat = housing_rows$Sat,
  Sat_num = as.integer(housing_rows$Sat),
  Infl = housing_rows$Infl,
  Infl_num = as.integer(housing_rows$Infl),
  Type = housing_rows$Type,
  Cont = housing_rows$Cont,
  Cont_num = as.integer(housing_rows$Cont) - 1
)
write_dataset(
  "regression", "housing", housing_sample,
  "Housing satisfaction, expanded",
  "MASS::housing (R), rows expanded by Freq",
  c("ordinal", "descriptive"),
  list(
    example("ordinal", list(outcome = "Sat_num", predictors = c("Infl_num", "Cont_num"))),
    example("descriptive", list(variables = c("Sat_num", "Infl_num")))
  ),
  "Satisfaction (Low/Medium/High) with numeric ordered codes; the original Freq weights are expanded to one row per response."
)

chick_long <- subset(
  chick_weight,
  Chick %in% unlist(lapply(split(chick_weight$Chick, chick_weight$Diet), function(x) head(unique(x), 2)))
)
chick_long <- data.frame(
  Weight = chick_long$weight,
  Time = chick_long$Time,
  Chick = chick_long$Chick,
  Diet = factor(chick_long$Diet, levels = paste("Diet", 1:4))
)
write_dataset(
  "regression", "chickweight_long", chick_long,
  "Chick weight, longitudinal",
  "datasets::ChickWeight (R), two chicks per diet",
  c("lmm", "gee", "descriptive"),
  list(
    example("lmm", list(dependent = "Weight", predictors = "Time", group = "Chick")),
    example("gee", list(dependent = "Weight", predictors = "Time", cluster = "Chick")),
    example("descriptive", list(variables = c("Weight", "Time")))
  ),
  "96 repeated observations on eight chicks (two per diet), with a small enough Chick code to be a grouping variable."
)

## ---------------------------------------------------------------------------
## Multivariate
## ---------------------------------------------------------------------------

usarrests_data <- datasets::USArrests
usarrests_sample <- data.frame(
  State = rownames(usarrests_data),
  Murder = usarrests_data$Murder,
  Assault = usarrests_data$Assault,
  UrbanPop = usarrests_data$UrbanPop,
  Rape = usarrests_data$Rape
)
write_dataset(
  "multivariate", "usarrests", usarrests_sample,
  "US arrests by state",
  "datasets::USArrests (R)",
  c("multivariate", "correlation", "descriptive"),
  list(
    example("multivariate", list(variables = c("Murder", "Assault", "UrbanPop", "Rape"))),
    example("correlation", list(variables = c("Murder", "Assault", "UrbanPop", "Rape")))
  ),
  "Four standardised crime measures on 50 states, commonly used for PCA and factor analysis."
)

attitude_data <- datasets::attitude
write_dataset(
  "multivariate", "attitude", attitude_data,
  "Employee attitude survey",
  "datasets::attitude (R)",
  c("multivariate", "correlation", "descriptive"),
  list(
    example("multivariate", list(variables = c("rating", "complaints", "privileges", "learning", "raises", "critical", "advance"))),
    example("correlation", list(variables = c("rating", "complaints", "privileges", "learning", "raises", "critical", "advance")))
  ),
  "Seven survey items on 30 departments, useful for Cronbach's alpha and exploratory factor analysis."
)

## ---------------------------------------------------------------------------
## Categorical
## ---------------------------------------------------------------------------

set.seed(20261029)
n_raters <- 60
latent <- sample(1:5, n_raters, replace = TRUE)
rater_a <- pmin(5, pmax(1, latent + sample(-1:1, n_raters, replace = TRUE)))
rater_b <- pmin(5, pmax(1, latent + sample(-1:1, n_raters, replace = TRUE)))
method_a <- round(rnorm(n_raters, mean = 50, sd = 10), 1)
method_b <- round(method_a + rnorm(n_raters, mean = 2, sd = 4), 1)
agreement_sample <- data.frame(
  Subject = seq_len(n_raters),
  Rater_A = rater_a,
  Rater_B = rater_b,
  Method_A = method_a,
  Method_B = method_b
)
write_dataset(
  "categorical", "agreement_ratings", agreement_sample,
  "Agreement between raters and methods",
  "Synthetic, seeded with set.seed(20261029)",
  c("agreement"),
  list(
    example("agreement", list(columns = c("Method_A", "Method_B")), mode = "icc"),
    example("agreement", list(columns = c("Method_A", "Method_B")), mode = "bland"),
    example("agreement", list(columns = c("Rater_A", "Rater_B")), mode = "kappa", weight = "none")
  ),
  "Synthetic paired ratings on a five-point scale plus two continuous methods; covers ICC, Bland-Altman and kappa."
)

## ---------------------------------------------------------------------------
## Survival
## ---------------------------------------------------------------------------

lung_data <- survival::lung
lung_sample <- data.frame(
  Time = lung_data$time,
  Event = as.integer(lung_data$status == 2),
  Status = lung_data$status,
  Age = lung_data$age,
  Sex = lung_data$sex,
  Sex_male = as.integer(lung_data$sex == 1),
  Ph_ecog = lung_data$ph.ecog,
  Ph_karno = lung_data$ph.karno,
  Pat_karno = lung_data$pat.karno,
  Meal_cal = lung_data$meal.cal,
  Wt_loss = lung_data$wt.loss
)
write_dataset(
  "survival", "lung", lung_sample,
  "Lung cancer survival",
  "survival::lung (R)",
  c("survival", "cox", "stratcox", "parametric", "descriptive"),
  list(
    example("survival", list(time = "Time", event = "Event", group = "Sex")),
    example("cox", list(time = "Time", event = "Event", covariates = c("Age", "Sex_male", "Ph_ecog"))),
    example("stratcox", list(time = "Time", event = "Event", covariates = c("Age", "Ph_ecog"), stratum = "Sex")),
    example("parametric", list(time = "Time", event = "Event", predictors = c("Age", "Sex_male", "Ph_ecog")))
  ),
  "228 patients with censoring, a 0/1 Event column and complete-case covariates for Cox models."
)

heart_data <- survival::heart
heart_sample <- data.frame(
  Id = heart_data$id,
  Start = heart_data$start,
  Stop = heart_data$stop,
  Event = heart_data$event,
  Age = heart_data$age + 48,
  Year = heart_data$year,
  Surgery = heart_data$surgery,
  Transplant = as.integer(heart_data$transplant) - 1
)
write_dataset(
  "survival", "heart", heart_sample,
  "Heart transplant, start-stop",
  "survival::heart (R), age recentred on 48 years",
  c("tdcox", "survival"),
  list(
    example("tdcox", list(start = "Start", stop = "Stop", event = "Event", covariates = c("Age", "Surgery", "Transplant"))),
    example("survival", list(time = "Stop", event = "Event", group = "Surgery"))
  ),
  "172 patients in start-stop format, the shape required by time-dependent Cox; Age is the original centred value plus 48."
)

## ---------------------------------------------------------------------------
## Time series
## ---------------------------------------------------------------------------

air_passengers <- as.numeric(datasets::AirPassengers)
air_sample <- data.frame(
  Year = rep(1949:1960, each = 12),
  Month = rep(1:12, times = 12),
  Time = seq_along(air_passengers),
  Passengers = air_passengers
)
write_dataset(
  "timeseries", "airpassengers", air_sample,
  "Air passengers, monthly",
  "datasets::AirPassengers (R)",
  c("timeseries", "descriptive"),
  list(
    example("timeseries", list(variable = "Passengers"), period = 12),
    example("descriptive", list(variables = "Passengers"))
  ),
  "144 monthly observations from 1949 to 1960 with a stable 12-month seasonal pattern."
)

## ---------------------------------------------------------------------------
## Missing data
## ---------------------------------------------------------------------------

airquality_data <- datasets::airquality
airquality_sample <- data.frame(
  Ozone = airquality_data$Ozone,
  Solar_R = airquality_data$Solar.R,
  Wind = airquality_data$Wind,
  Temp = airquality_data$Temp,
  Month = airquality_data$Month,
  Day = airquality_data$Day
)
write_dataset(
  "missing", "airquality", airquality_sample,
  "New York air quality",
  "datasets::airquality (R)",
  c("mi", "descriptive", "correlation"),
  list(
    example("mi", list(variables = c("Ozone", "Solar_R", "Wind", "Temp"), outcome = "Ozone", predictors = c("Solar_R", "Wind", "Temp"))),
    example("descriptive", list(variables = c("Ozone", "Solar_R", "Wind", "Temp"))),
    example("correlation", list(variables = c("Ozone", "Solar_R", "Wind", "Temp")))
  ),
  "153 daily observations with genuine missing values in Ozone (37) and Solar_R (7)."
)

## ---------------------------------------------------------------------------
## Design and resampling
## ---------------------------------------------------------------------------

resampling_sample <- data.frame(
  Weight = plant_growth$weight[plant_growth$group %in% c("ctrl", "trt1")],
  Group = ifelse(plant_growth$group[plant_growth$group %in% c("ctrl", "trt1")] == "ctrl", "Control", "Treatment")
)
write_dataset(
  "design", "resampling_two_groups", resampling_sample,
  "Two-group resampling sample",
  "datasets::PlantGrowth (R), ctrl and trt1 subset in long form",
  c("resampling", "descriptive"),
  list(
    example("resampling", list(outcome = "Weight", group = "Group")),
    example("descriptive", list(variables = "Weight"))
  ),
  "The same ten control and ten treated plants as plantgrowth_wide, in long form for permutation and bootstrap inference."
)

## ---------------------------------------------------------------------------
## Manifest
## ---------------------------------------------------------------------------

manifest <- list(
  version = 1,
  generatedBy = "samples/generate.R",
  formats = FORMATS,
  datasets = datasets
)
writeLines(
  toJSON(manifest, auto_unbox = TRUE, pretty = TRUE, digits = NA),
  "manifest.json",
  useBytes = TRUE
)

cat(sprintf("Wrote %d datasets in %d formats under %s\n", length(datasets), length(FORMATS), root))
