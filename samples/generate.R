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
  c("descriptive", "distfit", "correlation", "multivariate", "wizard", "partition", "cluster", "discriminant", "canonical"),
  list(
    example("descriptive", list(variables = c("Sepal_Length", "Sepal_Width", "Petal_Length", "Petal_Width"))),
    example("descriptive", list(variables = "Species"), mode = "frequency"),
    example("distfit", list(variable = "Sepal_Length")),
    example("correlation", list(variables = c("Sepal_Length", "Sepal_Width", "Petal_Length", "Petal_Width"))),
    example("multivariate", list(variables = c("Sepal_Length", "Sepal_Width", "Petal_Length", "Petal_Width"))),
    example("wizard", list(outcome = "Sepal_Length", group = "Species")),
    example("partition", list(response = "Sepal_Length", predictors = c("Sepal_Width", "Petal_Length", "Petal_Width"))),
    example("cluster", list(variables = c("Sepal_Length", "Sepal_Width", "Petal_Length", "Petal_Width"))),
    example("canonical", list(x = c("Sepal_Length", "Sepal_Width"), y = c("Petal_Length", "Petal_Width"))),
    example("discriminant", list(group = "Species", predictors = c("Sepal_Length", "Sepal_Width", "Petal_Length", "Petal_Width")))
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
  c("anova", "descriptive", "wizard", "quality", "variances"),
  list(
    example("anova", list(dependent = "weight", group = "group")),
    example("anova", list(dependent = "weight", group = "group"), mode = "median"),
    example("variances", list(variable = "weight", group = "group"), mode = "two"),
    example("variances", list(variable = "weight"), mode = "one"),
    example("descriptive", list(variables = "weight")),
    example("wizard", list(outcome = "weight", group = "group")),
    example("quality", list(variable = "weight", group = "group")),
    example("quality", list(variable = "weight"), mode = "tolerance"),
    example("quality", list(variable = "weight"), mode = "cusum")
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
  c("factorial", "anova", "ancova", "quality"),
  list(
    example("factorial", list(response = "Length", factorA = "Supplement", factorB = "Dose")),
    example("anova", list(dependent = "Length", group = "Supplement")),
    example("ancova", list(response = "Length", factor = "Supplement", covariates = "Dose_num")),
    example("quality", list(variable = "Length", group = "Supplement"))
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
    example("ttest", list(var1 = "Extra_1", var2 = "Extra_2"), type = "sign"),
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
  c("regression", "correlation", "descriptive", "partition", "cluster", "discriminant", "doe"),
  list(
    example("regression", list(dependent = "mpg", predictors = c("wt", "hp", "disp"))),
    example("correlation", list(variables = c("mpg", "wt", "hp", "disp"))),
    example("descriptive", list(variables = c("mpg", "wt", "hp"))),
    example("descriptive", list(variables = c("mpg", "wt", "hp")), mode = "outliers"),
    example("partition", list(response = "mpg", predictors = c("wt", "hp", "disp"))),
    example("cluster", list(variables = c("mpg", "wt", "hp", "disp"))),
    example("discriminant", list(group = "am", predictors = c("mpg", "wt", "hp", "disp"))),
    example("doe", list(response = "mpg", factorA = "hp", factorB = "wt"))
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
  c("multivariate", "correlation", "descriptive", "mds"),
  list(
    example("multivariate", list(variables = c("Murder", "Assault", "UrbanPop", "Rape"))),
    example("mds", list(variables = c("Murder", "Assault", "UrbanPop", "Rape"))),
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

## Wave 5: latent-variable and preference datasets -------------------------
set.seed(20261105)

n_sem <- 320
sem_f1 <- rnorm(n_sem)
sem_f2 <- 0.45 * sem_f1 + sqrt(1 - 0.45^2) * rnorm(n_sem)
sem_demo <- data.frame(
  Verbal1 = round(0.82 * sem_f1 + rnorm(n_sem, 0, 0.55), 2),
  Verbal2 = round(0.74 * sem_f1 + rnorm(n_sem, 0, 0.65), 2),
  Verbal3 = round(0.69 * sem_f1 + rnorm(n_sem, 0, 0.72), 2),
  Math1 = round(0.79 * sem_f2 + rnorm(n_sem, 0, 0.60), 2),
  Math2 = round(0.71 * sem_f2 + rnorm(n_sem, 0, 0.68), 2),
  Math3 = round(0.66 * sem_f2 + rnorm(n_sem, 0, 0.75), 2)
)
write_dataset(
  "multivariate", "sem_demo", sem_demo,
  "Two correlated latent abilities",
  "Synthetic, seeded with set.seed(20261105)",
  c("sem", "multivariate", "correlation"),
  list(
    example("sem", list(indicators = c("Verbal1", "Verbal2", "Verbal3", "Math1", "Math2", "Math3"))),
    example("multivariate", list(variables = c("Verbal1", "Verbal2", "Verbal3", "Math1", "Math2", "Math3"))),
    example("correlation", list(variables = c("Verbal1", "Verbal2", "Verbal3", "Math1", "Math2", "Math3")))
  ),
  "Six indicators generated from two correlated factors, for CFA and a two-factor structural model."
)

n_latent <- 450
latent_classes <- sample(1:3, n_latent, replace = TRUE, prob = c(0.35, 0.40, 0.25))
latent_probs <- list(
  c(0.75, 0.20, 0.05),
  c(0.15, 0.25, 0.60),
  c(0.30, 0.40, 0.30)
)
latent_demo <- data.frame(
  Item1 = factor(sapply(latent_classes, function(cl) sample(c("Basso", "Medio", "Alto"), 1, prob = latent_probs[[1]]))),
  Item2 = factor(sapply(latent_classes, function(cl) sample(c("Basso", "Medio", "Alto"), 1, prob = latent_probs[[2]]))),
  Item3 = factor(sapply(latent_classes, function(cl) sample(c("Basso", "Medio", "Alto"), 1, prob = latent_probs[[3]]))),
  Item4 = factor(sapply(latent_classes, function(cl) sample(c("Basso", "Medio", "Alto"), 1, prob = latent_probs[[2]])))
)
write_dataset(
  "multivariate", "latent_demo", latent_demo,
  "Three latent response profiles",
  "Synthetic, seeded with set.seed(20261105)",
  c("latentclass", "descriptive"),
  list(
    example("latentclass", list(indicators = c("Item1", "Item2", "Item3", "Item4"))),
    example("descriptive", list(variables = c("Item1", "Item2", "Item3", "Item4")), mode = "frequency")
  ),
  "Four categorical indicators drawn from three classes with distinct response probabilities."
)

n_irt <- 600
irt_theta <- rnorm(n_irt)
irt_a <- c(1.35, 1.10, 0.95, 1.20, 0.85, 1.05)
irt_b <- c(-1.4, -0.9, -0.3, 0.35, 0.9, 1.45)
irt_demo <- as.data.frame(
  sapply(seq_along(irt_b), function(j) rbinom(n_irt, 1, plogis(irt_a[j] * (irt_theta - irt_b[j]))))
)
names(irt_demo) <- paste0("Item", 1:6)
write_dataset(
  "multivariate", "irt_demo", irt_demo,
  "Binary responses to six items",
  "Synthetic 2PL, seeded with set.seed(20261105)",
  c("irt", "descriptive"),
  list(
    example("irt", list(items = c("Item1", "Item2", "Item3", "Item4", "Item5", "Item6"))),
    example("descriptive", list(variables = c("Item1", "Item2", "Item3", "Item4", "Item5", "Item6")))
  ),
  "Six dichotomous items with a range of difficulties, generated from a two-parameter logistic model."
)

conjoint_demo <- expand.grid(
  Brand = c("Alfa", "Beta", "Gamma"),
  Price = c("Basso", "Medio", "Alto"),
  Warranty = c("1 anno", "3 anni"),
  stringsAsFactors = FALSE
)
conjoint_demo$Rating <- round(
  5 +
    c(Alfa = 0.8, Beta = -0.5, Gamma = -0.3)[conjoint_demo$Brand] +
    c(Basso = 1.2, Medio = 0.1, Alto = -1.3)[conjoint_demo$Price] +
    c("1 anno" = -0.6, "3 anni" = 0.6)[conjoint_demo$Warranty] +
    rnorm(nrow(conjoint_demo), 0, 0.25),
  1
)
write_dataset(
  "multivariate", "conjoint_demo", conjoint_demo,
  "Conjoint profiles with ratings",
  "Synthetic, seeded with set.seed(20261105)",
  c("conjoint", "descriptive"),
  list(
    example("conjoint", list(attributes = c("Brand", "Price", "Warranty"), rating = "Rating")),
    example("descriptive", list(variables = "Rating"))
  ),
  "Full factorial design of three attributes with a rating that follows additive part-worth utilities."
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
    example("descriptive", list(variables = "Ozone"), mode = "runs"),
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
## Proportions and rates
## ---------------------------------------------------------------------------

set.seed(20261103)
n_groups <- 120
two_groups_binary <- data.frame(
  Group = rep(c("Control", "Treatment"), each = n_groups / 2),
  Outcome = c(
    ifelse(runif(n_groups / 2) < 0.30, "Yes", "No"),
    ifelse(runif(n_groups / 2) < 0.45, "Yes", "No")
  ),
  Events = c(
    rpois(n_groups / 2, lambda = 1.2),
    rpois(n_groups / 2, lambda = 2.0)
  )
)
write_dataset(
  "compare", "two_groups_binary", two_groups_binary,
  "Two independent groups with a binary outcome and event counts",
  "Synthetic, seeded with set.seed(20261103)",
  c("proportions", "distfit", "descriptive"),
  list(
    example("proportions", list(outcome = "Outcome"), mode = "oneProp", successLevel = "Yes", nullP = 0.5),
    example("proportions", list(outcome = "Outcome", group = "Group"), mode = "twoProp", successLevel = "Yes"),
    example("proportions", list(count = "Events", group = "Group"), mode = "twoRate", exposure = 1),
    example("distfit", list(variable = "Events", group = "Group"), mode = "ks"),
    example("descriptive", list(variables = "Events"))
  ),
  "120 subjects: Control has a lower success proportion and a lower event rate than Treatment."
)

## ---------------------------------------------------------------------------
## Categorical goodness of fit
## ---------------------------------------------------------------------------

gof_data <- data.frame(
  Category = rep(c("A", "B", "C", "D", "E"), times = c(30, 20, 25, 15, 10))
)
write_dataset(
  "categorical", "categorical_gof", gof_data,
  "Five categories with unequal observed frequencies",
  "Synthetic, fixed counts",
  c("chisquare"),
  list(
    example("chisquare", list(variable = "Category"), mode = "gof")
  ),
  "100 observations in five categories, designed to show a goodness-of-fit test against equal shares."
)

## ---------------------------------------------------------------------------
## Advanced regression (W3)
## ---------------------------------------------------------------------------

set.seed(20261103)

iv_n <- 220
iv_z1 <- rnorm(iv_n)
iv_z2 <- rbinom(iv_n, 1, 0.45)
iv_w <- rnorm(iv_n)
iv_u <- rnorm(iv_n)
iv_x <- 0.9 * iv_z1 + 0.6 * iv_z2 + 0.4 * iv_w + 0.7 * iv_u + rnorm(iv_n, sd = 0.5)
iv_y <- 1.2 + 0.7 * iv_x + 0.5 * iv_w + 0.8 * iv_u + rnorm(iv_n, sd = 0.6)
iv_demo <- data.frame(
  Y = round(iv_y, 6),
  X = round(iv_x, 6),
  Z1 = round(iv_z1, 6),
  Z2 = iv_z2,
  W = round(iv_w, 6)
)
write_dataset(
  "regression", "iv_demo", iv_demo,
  "Instrumental-variables demo",
  "Simulated (samples/generate.R, seed 20261103)",
  c("iv", "regression", "descriptive", "correlation"),
  list(
    example("iv", list(dependent = "Y", endogenous = "X", instruments = c("Z1", "Z2"), exogenous = "W")),
    example("regression", list(dependent = "Y", predictors = c("W", "X"))),
    example("descriptive", list(variables = c("Y", "X", "W"))),
    example("correlation", list(variables = c("Y", "X", "Z1", "W")))
  ),
  "220 observations with an endogenous regressor X, two excluded instruments and one exogenous control."
)

panel_entities <- 30
panel_periods <- 10
panel_demo <- do.call(rbind, lapply(seq_len(panel_entities), function(i) {
  effect <- rnorm(1)
  time <- seq_len(panel_periods)
  x1 <- 0.4 * time + 0.3 * effect + rnorm(panel_periods, sd = 0.5)
  x2 <- rnorm(panel_periods)
  y <- 1.0 + 0.8 * x1 - 0.35 * x2 + effect + rnorm(panel_periods, sd = 0.6)
  data.frame(ID = i, Time = time, Y = round(y, 6), X1 = round(x1, 6), X2 = round(x2, 6))
}))
write_dataset(
  "regression", "panel_demo", panel_demo,
  "Balanced panel demo",
  "Simulated (samples/generate.R, seed 20261103)",
  c("panel", "regression", "descriptive", "correlation"),
  list(
    example("panel", list(dependent = "Y", predictors = c("X1", "X2"), entity = "ID", time = "Time")),
    example("regression", list(dependent = "Y", predictors = c("X1", "X2"))),
    example("descriptive", list(variables = c("Y", "X1", "X2"))),
    example("correlation", list(variables = c("Y", "X1", "X2")))
  ),
  "30 entities observed for 10 periods, with a persistent entity effect and two time-varying predictors."
)

selection_n <- 450
selection_education <- round(rnorm(selection_n, 12, 2.2), 6)
selection_experience <- round(rnorm(selection_n, 10, 4), 6)
selection_kids <- rpois(selection_n, 1.8)
selection_latent <- -5 + 0.4 * selection_education + 0.15 * selection_experience +
  rnorm(selection_n, sd = 1.9)
selection_wage <- pmax(0, selection_latent)
selection_index <- -1 + 0.14 * selection_education + 0.05 * selection_experience -
  0.55 * selection_kids + rnorm(selection_n)
selection_selected <- as.integer(selection_index > 0)
selection_demo <- data.frame(
  Wage = round(selection_wage, 6),
  Wage_obs = round(ifelse(selection_selected == 1, selection_wage, 0), 6),
  Selected = selection_selected,
  Education = selection_education,
  Experience = selection_experience,
  Kids = selection_kids
)
write_dataset(
  "regression", "selection_demo", selection_demo,
  "Tobit and Heckman selection demo",
  "Simulated (samples/generate.R, seed 20261103)",
  c("selection", "regression", "descriptive", "correlation"),
  list(
    example("selection", list(dependent = "Wage", predictors = c("Education", "Experience"))),
    example("selection", list(dependent = "Wage_obs", predictors = c("Education", "Experience"), selection = "Selected", selectionPredictors = c("Education", "Experience", "Kids")), mode = "heckman"),
    example("regression", list(dependent = "Wage", predictors = c("Education", "Experience"))),
    example("descriptive", list(variables = c("Wage", "Wage_obs", "Education", "Experience"))),
    example("correlation", list(variables = c("Wage", "Education", "Experience")))
  ),
  "450 observations with a lower-censored wage for Tobit and a 0/1 selection indicator with the Kids exclusion restriction for Heckman."
)

treatment_n <- 600
treatment_age <- round(rnorm(treatment_n, 45, 12), 6)
treatment_score <- round(rnorm(treatment_n, 100, 15), 6)
treatment_sex <- rbinom(treatment_n, 1, 0.5)
treatment_age_z <- (treatment_age - mean(treatment_age)) / sd(treatment_age)
treatment_score_z <- (treatment_score - mean(treatment_score)) / sd(treatment_score)
treatment_ps <- plogis(-0.4 + 0.8 * treatment_age_z + 0.7 * treatment_score_z + 0.35 * treatment_sex)
treatment <- rbinom(treatment_n, 1, treatment_ps)
treatment_outcome <- 2 + 2.1 * treatment + 0.5 * treatment_age_z + 0.8 * treatment_score_z +
  0.3 * treatment_sex + rnorm(treatment_n, sd = 0.8)
treatment_demo <- data.frame(
  Treatment = treatment,
  Outcome = round(treatment_outcome, 6),
  Age = treatment_age,
  Score = treatment_score,
  Sex = treatment_sex
)
write_dataset(
  "regression", "treatment_demo", treatment_demo,
  "Propensity-score demo",
  "Simulated (samples/generate.R, seed 20261103)",
  c("propensity", "regression", "descriptive", "correlation"),
  list(
    example("propensity", list(treatment = "Treatment", outcome = "Outcome", covariates = c("Age", "Score", "Sex"))),
    example("regression", list(dependent = "Outcome", predictors = c("Treatment", "Age", "Score"))),
    example("descriptive", list(variables = c("Outcome", "Age", "Score"))),
    example("correlation", list(variables = c("Outcome", "Age", "Score")))
  ),
  "600 observations with a binary treatment assigned by a known propensity score and a continuous outcome."
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

# Fail before writing so a broken index never reaches the repository. The same
# invariants are re-checked in TypeScript by src/io/sampleManifest.ts.
validate_manifest <- function(manifest) {
  ids <- vapply(manifest$datasets, function(dataset) dataset$id, character(1))
  if (anyDuplicated(ids)) stop("duplicate dataset id: ", ids[anyDuplicated(ids)])
  dirs <- vapply(manifest$datasets, function(dataset) dataset$dir, character(1))
  if (anyDuplicated(dirs)) stop("duplicate dataset directory: ", dirs[anyDuplicated(dirs)])

  for (dataset in manifest$datasets) {
    if (nchar(dataset$title) == 0) stop(dataset$id, ": empty title")
    if (nchar(dataset$source) == 0) stop(dataset$id, ": empty source")
    if (dataset$rows <= 0) stop(dataset$id, ": no rows")
    if (length(dataset$columns) == 0) stop(dataset$id, ": no columns")
    if (anyDuplicated(unlist(dataset$columns))) stop(dataset$id, ": duplicate columns")
    if (dataset$dir != file.path(dataset$family, dataset$id)) {
      stop(dataset$id, ": dir must be <family>/<id>")
    }
    if (length(dataset$procedures) == 0) stop(dataset$id, ": no procedure")
    if (length(dataset$examples) == 0) stop(dataset$id, ": no example")

    for (example in dataset$examples) {
      if (!(example$analysis %in% dataset$procedures)) {
        stop(dataset$id, ": example refers to undeclared procedure ", example$analysis)
      }
      columns <- unlist(example$columns)
      unknown <- setdiff(columns, unlist(dataset$columns))
      if (length(unknown) > 0) {
        stop(dataset$id, ": example refers to unknown columns ", paste(unknown, collapse = ", "))
      }
    }
  }
}

validate_manifest(manifest)

writeLines(
  toJSON(manifest, auto_unbox = TRUE, pretty = TRUE, digits = NA),
  "manifest.json",
  useBytes = TRUE
)

cat(sprintf("Wrote %d datasets in %d formats under %s\n", length(datasets), length(FORMATS), root))
