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
  c("regression", "correlation", "descriptive", "partition", "cluster",
    "discriminant", "doe", "glm", "quantile", "nonlinear", "multinomial",
    "glmm", "pls", "mars", "mediation"),
  list(
    example("regression", list(dependent = "mpg", predictors = c("wt", "hp", "disp"))),
    example("correlation", list(variables = c("mpg", "wt", "hp", "disp"))),
    example("descriptive", list(variables = c("mpg", "wt", "hp"))),
    example("descriptive", list(variables = c("mpg", "wt", "hp")), mode = "outliers"),
    example("partition", list(response = "mpg", predictors = c("wt", "hp", "disp"))),
    example("cluster", list(variables = c("mpg", "wt", "hp", "disp"))),
    example("discriminant", list(group = "am", predictors = c("mpg", "wt", "hp", "disp"))),
    example("doe", list(response = "mpg", factorA = "hp", factorB = "wt")),
    example("glm", list(dependent = "mpg", predictors = c("wt", "hp")), family = "gaussian"),
    example("quantile", list(dependent = "mpg", predictors = c("wt", "hp")), tau = 0.5),
    example("nonlinear", list(dependent = "mpg", predictor = "hp"), model = "exponential"),
    example("multinomial", list(outcome = "cyl", predictors = c("wt"))),
    example("glmm", list(outcome = "mpg", predictors = c("wt", "hp"), group = "cyl")),
    example("pls", list(dependent = "mpg", predictors = c("wt", "hp", "disp"))),
    example("mars", list(dependent = "mpg", predictors = c("wt", "hp", "disp"))),
    example("mediation", list(outcome = "mpg", predictor = "hp", mediator = "wt"))
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
    example("proportions", list(variable = "Events", group = "Group"), mode = "twoRate", exposure = 1),
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
    example("selection", list(dependent = "Wage_obs", predictors = c("Education", "Experience"), selection = "Selected", selectIndeps = c("Education", "Experience", "Kids")), mode = "heckman"),
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
## Wave 6: survival and reliability
## ---------------------------------------------------------------------------
set.seed(20261106)

n_comp <- 280
comp_age <- round(rnorm(n_comp, 63, 10), 1)
comp_sex <- sample(c("F", "M"), n_comp, replace = TRUE)
comp_center <- sample(c("Nord", "Centro", "Sud"), n_comp, replace = TRUE, prob = c(0.4, 0.35, 0.25))
comp_rate <- exp(-4.4 + 0.018 * comp_age + 0.20 * (comp_sex == "M"))
comp_time <- rexp(n_comp, rate = comp_rate)
comp_cause <- sample(0:3, n_comp, replace = TRUE, prob = c(0.18, 0.47, 0.25, 0.10))
competing_demo <- data.frame(
  Time = round(comp_time, 3),
  Cause = comp_cause,
  Age = comp_age,
  Sex = comp_sex,
  Center = comp_center
)
write_dataset(
  "survival", "competing_demo", competing_demo,
  "Competing risks by cause",
  "Synthetic, seeded with set.seed(20261106)",
  c("competing", "descriptive"),
  list(
    example("competing", list(time = "Time", event = "Cause", covariates = c("Age", "Sex"))),
    example("descriptive", list(variables = c("Time", "Age")))
  ),
  "280 subjects with three competing causes and administrative censoring coded as zero."
)

n_recurrent <- 150
rec_treatment <- sample(c("Standard", "Nuovo"), n_recurrent, replace = TRUE)
rec_age <- round(rnorm(n_recurrent, 58, 12), 1)
rec_rows <- vector("list", 0)
for (subject in seq_len(n_recurrent)) {
  rate <- exp(-2.8 + 0.018 * rec_age[subject] - 0.25 * (rec_treatment[subject] == "Nuovo"))
  events <- rpois(1, 2.2) + 1
  gaps <- rexp(events, rate = rate)
  times <- cumsum(gaps)
  censor_time <- 4 + rexp(1, rate = 0.3)
  previous <- 0
  for (event_index in seq_len(events)) {
    if (times[event_index] > censor_time) break
    rec_rows[[length(rec_rows) + 1]] <- data.frame(
      Id = subject, Start = round(previous, 3), Stop = round(times[event_index], 3),
      Event = 1, Treatment = rec_treatment[subject], Age = rec_age[subject]
    )
    previous <- times[event_index]
  }
  if (previous < censor_time) {
    rec_rows[[length(rec_rows) + 1]] <- data.frame(
      Id = subject, Start = round(previous, 3), Stop = round(censor_time, 3),
      Event = 0, Treatment = rec_treatment[subject], Age = rec_age[subject]
    )
  }
}
recurrent_demo <- do.call(rbind, rec_rows)
write_dataset(
  "survival", "recurrent_demo", recurrent_demo,
  "Recurrent events in a clinical cohort",
  "Synthetic, seeded with set.seed(20261106)",
  c("recurrent", "descriptive"),
  list(
    example("recurrent", list(subject = "Id", start = "Start", stop = "Stop", event = "Event", covariates = c("Age", "Treatment")), model = "ag"),
    example("descriptive", list(variables = c("Stop", "Age")))
  ),
  "150 subjects with repeated events in start-stop format and a binary treatment."
)

n_alt <- 180
alt_stress <- sample(c(0.8, 1.0, 1.3, 1.8, 2.4), n_alt, replace = TRUE)
alt_temperature <- round(rnorm(n_alt, 65, 7), 1)
alt_mu <- 6.4 - 0.62 * log(alt_stress) + 0.010 * alt_temperature
alt_time <- exp(alt_mu + 0.42 * rnorm(n_alt))
alt_censor <- exp(7.6 + rnorm(n_alt, 0, 0.2))
alt_event <- ifelse(alt_time <= alt_censor, 1, 0)
alt_demo <- data.frame(
  Time = round(pmin(alt_time, alt_censor), 3),
  Event = alt_event,
  Stress = alt_stress,
  Temperature = alt_temperature,
  Batch = sample(c("A", "B", "C"), n_alt, replace = TRUE)
)
write_dataset(
  "survival", "alt_demo", alt_demo,
  "Accelerated life test",
  "Synthetic Weibull AFT, seeded with set.seed(20261106)",
  c("alt", "parametric", "descriptive"),
  list(
    example("alt", list(time = "Time", event = "Event", stress = "Stress", covariates = "Temperature"), model = "inversePower", useStress = 0.7),
    example("parametric", list(time = "Time", event = "Event", predictors = c("Stress", "Temperature"))),
    example("descriptive", list(variables = c("Time", "Stress", "Temperature")))
  ),
  "180 units tested at five stress levels, with temperature as a secondary covariate."
)

reliability_failures <- c(12, 28, 41, 63, 88, 101, 140, 176, 199, 245,
                          287, 321, 380, 412, 455, 510, 548, 602, 666, 720)
reliability_demo <- data.frame(
  Time = reliability_failures,
  Failures = seq_along(reliability_failures)
)
write_dataset(
  "survival", "reliability_demo", reliability_demo,
  "Reliability growth failures",
  "Synthetic Crow–AMSAA process, seeded with set.seed(20261106)",
  c("reliability", "descriptive"),
  list(
    example("reliability", list(time = "Time", failures = "Failures"), mode = "growth"),
    example("reliability", list(time = "Time"), mode = "rbd"),
    example("descriptive", list(variables = "Time"))
  ),
  "Twenty cumulative failure times from a repairable system with a decreasing failure rate."
)

## Legacy categorical datasets kept for the categorical procedures.
legacy_stratified <- read.csv("categorical/stratified_2x2/data.csv", stringsAsFactors = FALSE)
write_dataset(
  "categorical", "stratified_2x2", legacy_stratified,
  "Binary outcome in three strata",
  "Synthetic, seeded with set.seed(20261103)",
  c("descriptive"),
  list(
    example("descriptive", list(variables = c("Stratum", "Exposure", "Outcome")), mode = "frequency")
  ),
  "Three strata of 100 rows each with a binary exposure and a binary outcome: the counts can be entered in the Mantel-Haenszel table."
)

legacy_ordinal <- read.csv("categorical/ordinal_table/data.csv", stringsAsFactors = FALSE)
write_dataset(
  "categorical", "ordinal_table", legacy_ordinal,
  "Binary response across an ordered dose",
  "Synthetic, seeded with set.seed(20261103)",
  c("descriptive"),
  list(
    example("descriptive", list(variables = c("Dose", "Response")), mode = "frequency")
  ),
  "Four ordered dose levels with an increasing response proportion: the 4×2 counts feed the Cochran-Armitage trend test."
)

legacy_categorical <- read.csv("categorical/categorical_table/data.csv", stringsAsFactors = FALSE)
write_dataset(
  "categorical", "categorical_table", legacy_categorical,
  "Two categorical variables with missing codes",
  "Synthetic, seeded with set.seed(20261103)",
  c("mi", "descriptive"),
  list(
    example("mi", list(variables = c("Treatment", "Severity"), predictors = "Age"), model = "categorical", imputations = 5, iterations = 5),
    example("descriptive", list(variables = c("Treatment", "Severity", "Age")), mode = "frequency")
  ),
  "160 rows with a binary treatment, a three-level severity and a numeric age; 12 treatment and 10 severity codes are missing for the categorical imputation."
)

## ---------------------------------------------------------------------------
## Wave 8: MSA, acceptance sampling and DOE samples
## ---------------------------------------------------------------------------

set.seed(20261106)
msa_parts <- 10
msa_operators <- c("A", "B", "C")
msa_replicates <- 3
msa_part_effect <- rnorm(msa_parts, sd = 1.0)
msa_operator_effect <- c(A = 0, B = 0.25, C = -0.15)
msa_rows <- list()
for (part in 1:msa_parts) {
  for (operator in msa_operators) {
    for (replicate in 1:msa_replicates) {
      interaction <- rnorm(1, sd = 0.15)
      measurement <- 20 + msa_part_effect[part] + msa_operator_effect[[operator]] +
        interaction + rnorm(1, sd = 0.35)
      width <- 10 + 0.5 * msa_part_effect[part] + 0.2 * msa_operator_effect[[operator]] +
        rnorm(1, sd = 0.4)
      msa_rows[[length(msa_rows) + 1]] <- data.frame(
        Part = sprintf("P%02d", part),
        Operator = operator,
        Replicate = replicate,
        Measurement = round(measurement, 3),
        Width = round(width, 3)
      )
    }
  }
}
msa_sample <- do.call(rbind, msa_rows)
write_dataset(
  "design", "msa_demo", msa_sample,
  "Gage R&R crossed study",
  "Synthetic, seeded with set.seed(20261106)",
  c("quality"),
  list(
    example("quality", list(variable = "Measurement", part = "Part", operator = "Operator", variables = c("Measurement", "Width")), mode = "msa"),
    example("quality", list(variables = c("Measurement", "Width")), mode = "mcontrol", subgroup = 3)
  ),
  "90 rows: 10 parts measured by 3 operators with 3 replicates; Measurement has a part effect around 1.0 and a repeatability SD around 0.35, Width is a second correlated characteristic for the T² chart."
)

set.seed(20261107)
acceptance_sample <- data.frame(
  Lot = sprintf("L%03d", 1:30),
  Inspected = rep(50, 30),
  Defectives = rbinom(30, 50, 0.04)
)
write_dataset(
  "design", "acceptance_demo", acceptance_sample,
  "Acceptance sampling lots",
  "Synthetic, seeded with set.seed(20261107)",
  c("quality"),
  list(example("quality", list(variable = "Defectives"), mode = "acceptance", planN = 50, planC = 2, lotSize = 500)),
  "30 lots of 50 inspected units with about 4% defectives; the acceptance mode uses the plan parameters, the data document the historical inspection."
)

set.seed(20261108)
doe_codes <- expand.grid(A = c(-1, 1), B = c(-1, 1), C = c(-1, 1))
doe_center <- data.frame(A = rep(0, 3), B = rep(0, 3), C = rep(0, 3))
doe_sample <- rbind(doe_codes, doe_center)
doe_sample$Y <- round(
  30 + 2.0 * doe_sample$A + 1.2 * doe_sample$B - 0.8 * doe_sample$C +
    0.9 * doe_sample$A * doe_sample$B - 1.5 * doe_sample$A^2 - 1.1 * doe_sample$B^2 +
    rnorm(nrow(doe_sample), sd = 0.4),
  3
)
write_dataset(
  "design", "doe_demo", doe_sample,
  "Two-factor response surface with a third factor",
  "Synthetic, seeded with set.seed(20261108)",
  c("doe"),
  list(
    example("doe", list(response = "Y", factorA = "A", factorB = "B"), mode = "surface", model = "linear"),
    example("doe", list(response = "Y", factorA = "A", factorB = "B"), mode = "design", designType = "ccd", factors = 3, centerPoints = 3)
  ),
  "11 runs: a 2^3 factorial plus three centre points; Y follows a quadratic surface in A and B with a linear effect of C."
)

## ---------------------------------------------------------------------------
## Manifest
## ---------------------------------------------------------------------------

# Fail before writing so a broken index never reaches the repository. The same
# invariants are re-checked in TypeScript by src/io/sampleManifest.ts.

## ---------------------------------------------------------------------------
## Wave 7: VAR, GARCH and state-space samples
## ---------------------------------------------------------------------------

set.seed(20261104)
var_n <- 400
var_sim <- matrix(0, nrow = var_n, ncol = 2)
var_b1 <- matrix(c(0.5, 0.1, 0.2, 0.4), 2, 2, byrow = TRUE)
var_b2 <- matrix(c(0.1, -0.1, 0, 0.2), 2, 2, byrow = TRUE)
var_chol <- t(chol(matrix(c(1, 0.3, 0.3, 1), 2, 2)))
for (t in 1:var_n) {
  shock <- as.numeric(var_chol %*% rnorm(2))
  var_sim[t, ] <- if (t <= 2) c(1, 2) + shock else c(1, 2) + var_b1 %*% var_sim[t - 1, ] + var_b2 %*% var_sim[t - 2, ] + shock
}
var_sample <- data.frame(y1 = var_sim[201:400, 1], y2 = var_sim[201:400, 2])
write_dataset(
  "timeseries", "var_demo", var_sample,
  "Bivariate VAR(2) with correlated innovations",
  "Synthetic, seeded with set.seed(20261104)",
  c("var"),
  list(example("var", list(variables = c("y1", "y2")), mode = "var", lags = 0, horizon = 12)),
  "200 observations of a stable bivariate VAR(2) with a 0.3 residual correlation; Granger causality runs from y1 to y2."
)

garch_n <- 500
garch_omega <- 0.05
garch_alpha <- 0.1
garch_beta <- 0.85
garch_eps <- numeric(garch_n)
garch_var <- numeric(garch_n)
garch_var[1] <- garch_omega / (1 - garch_alpha - garch_beta)
for (t in 1:garch_n) {
  if (t > 1) garch_var[t] <- garch_omega + garch_alpha * garch_eps[t - 1]^2 + garch_beta * garch_var[t - 1]
  garch_eps[t] <- rnorm(1, sd = sqrt(garch_var[t]))
}
garch_sample <- data.frame(Return = 0.02 + garch_eps)
write_dataset(
  "timeseries", "garch_demo", garch_sample,
  "GARCH(1,1) returns",
  "Synthetic, seeded with set.seed(20261104)",
  c("garch"),
  list(example("garch", list(variable = "Return"), horizon = 10)),
  "500 returns with conditional variance omega = 0.05, alpha = 0.10, beta = 0.85: clear volatility clustering."
)

ss_n <- 300
ss_level <- numeric(ss_n)
ss_slope <- numeric(ss_n)
ss_level[1] <- 10
ss_slope[1] <- 0.02
for (t in 2:ss_n) {
  ss_slope[t] <- ss_slope[t - 1] + rnorm(1, sd = 0.01)
  ss_level[t] <- ss_level[t - 1] + ss_slope[t - 1] + rnorm(1, sd = 0.12)
}
ss_local <- ss_level + rnorm(ss_n, sd = 0.4)
ss_transition <- matrix(c(0.96, 0.04, 0.08, 0.92), 2, 2, byrow = TRUE)
ss_states <- integer(ss_n)
ss_markov <- numeric(ss_n)
ss_states[1] <- 1
ss_markov[1] <- -1 + rnorm(1, sd = 0.5)
for (t in 2:ss_n) {
  ss_states[t] <- if (runif(1) < ss_transition[ss_states[t - 1], ss_states[t - 1]]) ss_states[t - 1] else 3 - ss_states[t - 1]
  ss_mu <- if (ss_states[t] == 1) -1 else 2
  ss_sd <- if (ss_states[t] == 1) 0.5 else 1.1
  ss_markov[t] <- ss_mu + 0.4 * ss_markov[t - 1] + rnorm(1, sd = ss_sd)
}
statespace_sample <- data.frame(Local = ss_local, Markov = ss_markov)
write_dataset(
  "timeseries", "statespace_demo", statespace_sample,
  "Local trend and two-regime Markov series",
  "Synthetic, seeded with set.seed(20261104)",
  c("statespace"),
  list(
    example("statespace", list(variable = "Local"), mode = "local", trend = TRUE, horizon = 10),
    example("statespace", list(variable = "Markov"), mode = "markov", horizon = 10)
  ),
  "300 observations: Local is a noisy local linear trend; Markov alternates a low-volatility regime around -1 and a high-volatility regime around 2."
)

## ---------------------------------------------------------------------------
## Wave 9: survey, machine learning, text, choice, meta, Bayes and spatial
## ---------------------------------------------------------------------------

set.seed(20261110)
survey_strata <- rep(sprintf("S%d", 1:6), each = 20)
survey_cluster <- rep(sprintf("C%02d", 1:24), each = 5)
survey_weight <- round(runif(120, 0.5, 2.0), 3)
survey_age <- round(rnorm(120, 44, 12))
survey_income <- round(1800 + 42 * survey_age + 350 * as.integer(sub("S", "", survey_strata)) +
  rnorm(120, 0, 420))
survey_employed <- rbinom(120, 1, plogis(-3 + 0.06 * survey_age))
survey_demo <- data.frame(
  Stratum = survey_strata,
  Cluster = survey_cluster,
  Weight = survey_weight,
  Income = survey_income,
  Age = survey_age,
  Employed = survey_employed
)
write_dataset(
  "design", "survey_demo", survey_demo,
  "Stratified cluster sample of income",
  "Synthetic, seeded with set.seed(20261110)",
  c("survey", "descriptive"),
  list(
    example("survey", list(variable = "Income", weight = "Weight", strata = "Stratum", cluster = "Cluster"), mode = "mean"),
    example("survey", list(category = "Employed"), mode = "proportion", successLevel = "1"),
    example("survey", list(variable = "Income", predictors = "Age", weight = "Weight", strata = "Stratum", cluster = "Cluster"), mode = "regression")
  ),
  "120 rows in six strata with four clusters each; Income depends on age and stratum, Employed is a binary outcome."
)

ml_x1 <- round(runif(160, -2, 2), 3)
ml_x2 <- round(rnorm(160), 3)
ml_x3 <- round(runif(160, 0, 3), 3)
ml_y <- round(3 + 2 * ml_x1 + 2 * sin(2 * ml_x2) + 0.6 * ml_x2 * ml_x3 + rnorm(160, 0, 0.7), 3)
ml_demo <- data.frame(X1 = ml_x1, X2 = ml_x2, X3 = ml_x3, Y = ml_y)
write_dataset(
  "ml", "ml_demo", ml_demo,
  "Non-linear regression with interactions",
  "Synthetic, seeded with set.seed(20261110)",
  c("ml", "descriptive"),
  list(
    example("ml", list(outcome = "Y", predictors = c("X1", "X2", "X3")), mode = "rf", trees = 200, seed = 20261110),
    example("ml", list(outcome = "Y", predictors = c("X1", "X2", "X3")), mode = "boosting", trees = 200, shrinkage = 0.05, seed = 20261110)
  ),
  "160 rows: Y is a non-linear function of X1, X2 and the interaction X2*X3, plus Gaussian noise."
)

text_topics <- list(
  c("model", "data", "regression", "estimate", "sample", "variable"),
  c("patient", "treatment", "clinical", "trial", "dose", "outcome"),
  c("market", "price", "customer", "demand", "product", "sales")
)
text_documents <- character(36)
text_labels <- character(36)
for (index in 1:36) {
  topic <- ((index - 1) %% 3) + 1
  words <- sample(text_topics[[topic]], 12, replace = TRUE)
  text_documents[index] <- paste(words, collapse = " ")
  text_labels[index] <- sprintf("Topic %d", topic)
}
text_demo <- data.frame(Document = sprintf("Doc%02d", 1:36), Text = text_documents, Group = text_labels)
write_dataset(
  "text", "text_demo", text_demo,
  "Three-topic short-text corpus",
  "Synthetic, seeded with set.seed(20261110)",
  c("text", "descriptive"),
  list(
    example("text", list(text = "Text"), mode = "frequency", maxTerms = 20, minDocFreq = 1, stopwords = FALSE),
    example("text", list(text = "Text", group = "Group"), mode = "topics", topics = 3, iterations = 300, seed = 20261110, stopwords = FALSE)
  ),
  "36 short documents generated from three vocabularies; Group records the generating topic."
)

choice_rows <- list()
for (set_index in 1:90) {
  prices <- sample(c(1, 2, 3), 3, replace = FALSE)
  quality <- sample(c(1, 2, 3), 3, replace = FALSE)
  utility <- -0.8 * prices + 0.9 * quality + rnorm(3, 0, 0.3)
  chosen <- which.max(utility)
  for (alternative in 1:3) {
    choice_rows[[length(choice_rows) + 1]] <- data.frame(
      Respondent = sprintf("R%02d", ((set_index - 1) %% 30) + 1),
      Set = sprintf("Set%02d", set_index),
      Alternative = LETTERS[alternative],
      Price = prices[alternative],
      Quality = quality[alternative],
      Chosen = as.integer(alternative == chosen)
    )
  }
}
choice_demo <- do.call(rbind, choice_rows)
write_dataset(
  "design", "choice_demo", choice_demo,
  "Discrete choice experiment with price and quality",
  "Synthetic, seeded with set.seed(20261110)",
  c("choice", "descriptive"),
  list(
    example("choice", list(set = "Set", alternative = "Alternative", chosen = "Chosen", attributes = c("Price", "Quality")), mode = "choice")
  ),
  "90 choice sets of three alternatives; the chosen alternative follows a utility with a negative price effect and a positive quality effect."
)

maxdiff_rows <- list()
items <- sprintf("Item%02d", 1:12)
for (block in 1:80) {
  shown <- sample(items, 4)
  utility <- seq_along(items)[match(shown, items)] + rnorm(4, 0, 1.5)
  for (item_index in seq_along(shown)) {
    maxdiff_rows[[length(maxdiff_rows) + 1]] <- data.frame(
      Block = sprintf("B%02d", block),
      Item = shown[item_index],
      Best = as.integer(item_index == which.max(utility)),
      Worst = as.integer(item_index == which.min(utility))
    )
  }
}
maxdiff_demo <- do.call(rbind, maxdiff_rows)
write_dataset(
  "design", "maxdiff_demo", maxdiff_demo,
  "MaxDiff best-worst blocks",
  "Synthetic, seeded with set.seed(20261110)",
  c("choice", "descriptive"),
  list(
    example("choice", list(set = "Block", alternative = "Item", best = "Best", worst = "Worst"), mode = "maxdiff")
  ),
  "80 blocks of four items; each block marks one best and one worst item."
)

meta_studies <- data.frame(
  Study = sprintf("Study %02d", 1:9),
  Effect = round(c(0.18, 0.24, 0.31, 0.12, 0.42, 0.27, 0.09, 0.35, 0.21), 3),
  SE = round(c(0.08, 0.10, 0.09, 0.12, 0.15, 0.07, 0.11, 0.13, 0.09), 3)
)
write_dataset(
  "design", "meta_demo", meta_studies,
  "Nine studies with effect sizes and standard errors",
  "Synthetic, seeded with set.seed(20261110)",
  c("meta", "descriptive"),
  list(
    example("meta", list(effect = "Effect", se = "SE", study = "Study"), method = "DL", egger = TRUE)
  ),
  "Nine studies with small positive effects and heterogeneous standard errors."
)

bayes_demo <- data.frame(
  Score = round(50 + 0.4 * survey_age[1:80] + 3 * rep(c(0, 1), 40) + rnorm(80, 0, 5), 2),
  Age = survey_age[1:80],
  Treatment = rep(c(0, 1), 40)
)
write_dataset(
  "design", "bayes_demo", bayes_demo,
  "Score with age and a binary treatment",
  "Synthetic, seeded with set.seed(20261110)",
  c("bayes", "descriptive"),
  list(
    example("bayes", list(outcome = "Score"), mode = "normal", priorMean = 50, priorSd = 20, iterations = 4000, burnin = 1000, chains = 2, seed = 20261110),
    example("bayes", list(outcome = "Score", predictors = c("Age", "Treatment")), mode = "regression", priorMean = 0, priorSd = 20, iterations = 4000, burnin = 1000, chains = 2, seed = 20261110)
  ),
  "80 rows: Score increases with age and with the binary treatment, with Gaussian noise."
)

spatial_grid <- expand.grid(X = 1:12, Y = 1:12)
spatial_noise <- as.numeric(arima.sim(list(order = c(1, 0, 0), ar = 0.6), n = nrow(spatial_grid))) * 1.5
spatial_demo <- data.frame(
  Region = sprintf("G%03d", 1:nrow(spatial_grid)),
  X = spatial_grid$X,
  Y = spatial_grid$Y,
  Crime = round(10 + 0.5 * spatial_grid$X + 0.3 * spatial_grid$Y + spatial_noise, 2),
  Income = round(40 - 0.8 * spatial_grid$X + rnorm(nrow(spatial_grid), 0, 2), 2)
)
write_dataset(
  "design", "spatial_demo", spatial_demo,
  "Regular grid with spatial autocorrelation",
  "Synthetic, seeded with set.seed(20261110)",
  c("spatial", "descriptive"),
  list(
    example("spatial", list(variable = "Crime", x = "X", y = "Y"), mode = "moran", k = 4, permutations = 999, seed = 20261110),
    example("spatial", list(variable = "Crime", predictors = "Income", x = "X", y = "Y"), mode = "sar", k = 4, permutations = 999, seed = 20261110)
  ),
  "144 cells of a 12x12 grid; Crime follows a gradient plus spatially autocorrelated noise, Income is a predictor."
)

manifest <- list(
  version = 1,
  generatedBy = "samples/generate.R",
  formats = FORMATS,
  datasets = datasets
)

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
