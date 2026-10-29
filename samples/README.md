# Sample datasets

This folder holds the datasets used by the end-to-end tests and by manual
functional checks. They are deliberately **small, classic and easy to
recognise**, so a failed test points at the procedure rather than at an
unfamiliar workbook.

The datasets are grouped by the analysis family they primarily exercise:

```
samples/
  descriptive/     summaries, distribution fit, correlation, PCA
  compare/         t-test, ANOVA, factorial, repeated/mixed ANOVA, TOST
  regression/      OLS, logistic, count, ordinal, LMM, GEE
  multivariate/    PCA, factor analysis, Cronbach's alpha
  categorical/     agreement (ICC, Bland-Altman, kappa)
  survival/        Kaplan-Meier, Cox, stratified/time-dependent Cox, AFT
  timeseries/      ARIMA/SARIMA and forecasting
  missing/         multiple imputation
  design/          permutation and bootstrap
```

Every dataset is written in **five formats** with the same contents:

| File | Import path |
| --- | --- |
| `data.csv` | CSV (comma, header, empty cell = missing) |
| `data.sav` | SPSS, with variable/value labels where the source has them |
| `data.dta` | Stata (version 14) |
| `data.xlsx` | Excel workbook with a `Data` sheet |
| `data.json` | Array of records, `null` = missing |

`manifest.json` is the machine-readable index: title, source, row/column
counts, formats, analysis ids and ready-to-use column mappings. The unit test
`src/io/samples.test.ts` parses every file in every format and checks the
manifest against the real data.

## Datasets

| Dataset | Family | Rows × cols | Procedures | Notes |
| --- | --- | --- | --- | --- |
| `iris` | descriptive | 150 × 5 | descriptive, distfit, correlation, multivariate, wizard | Four flower measurements and a three-level species label. |
| `faithful` | descriptive | 272 × 2 | descriptive, distfit | Eruption length and waiting time. |
| `plantgrowth` | compare | 30 × 2 | anova, descriptive, wizard | One factor with three treatment levels. |
| `plantgrowth_wide` | compare | 10 × 2 | ttest, tost | Control and treated plants in two columns. |
| `toothgrowth` | compare | 60 × 4 | factorial, anova, ancova | Supplement × dose, with a numeric dose for ANCOVA. |
| `sleep_wide` | compare | 10 × 3 | ttest, tost, nonparamrm | Paired sleep gain in wide form. |
| `matched_binary` | compare | 60 × 4 | nonparamrm | Three paired 0/1 measurements for McNemar and Cochran Q. |
| `chickweight_wide` | compare | 45 × 8 | repeatedanova, mixedanova, nonparamrm | Six repeated weights and four diets. |
| `mtcars` | regression | 32 × 12 | regression, correlation, descriptive | Classic car performance measures. |
| `birthwt` | regression | 189 × 10 | logistic, regression, descriptive | Binary low-birth-weight outcome and risk factors. |
| `quine` | regression | 146 × 8 | countreg, descriptive | School absence counts with numeric dummy codes. |
| `housing` | regression | 1681 × 7 | ordinal, descriptive | Satisfaction codes, expanded from the original frequency table. |
| `chickweight_long` | regression | 96 × 4 | lmm, gee, descriptive | Eight chicks, two per diet, twelve repeated observations each. |
| `usarrests` | multivariate | 50 × 5 | multivariate, correlation, descriptive | Four crime measures by state. |
| `attitude` | multivariate | 30 × 7 | multivariate, correlation, descriptive | Seven survey items for alpha and EFA. |
| `agreement_ratings` | categorical | 60 × 5 | agreement | Synthetic paired ratings plus two continuous methods. |
| `lung` | survival | 228 × 11 | survival, cox, stratcox, parametric | Censoring, a 0/1 event column and complete-case covariates. |
| `heart` | survival | 172 × 8 | tdcox, survival | Start-stop format for time-dependent Cox. |
| `airpassengers` | timeseries | 144 × 4 | timeseries, descriptive | Monthly series with 12-month seasonality. |
| `airquality` | missing | 153 × 6 | mi, descriptive, correlation | Genuine missing values in Ozone and Solar_R. |
| `resampling_two_groups` | design | 20 × 2 | resampling, descriptive | Long form of the two plant-growth groups. |

## Procedures without a dataset

`chisquare` and `contingency` take a **manual count table**, and `samplesize`
takes design parameters. They do not read the grid, so they need no sample
dataset. The `categorical` folder therefore contains the agreement sample,
which is data-driven.

## Using a sample

From the UI, press **Import** and choose any `data.*` file. From Playwright:

```ts
await page.locator('input[type="file"][accept*=".csv"]')
  .setInputFiles(path.resolve('samples/compare/plantgrowth/data.csv'));
```

From a unit test, read `samples/manifest.json` and use the `dir` field:

```ts
const table = readDelimitedTable(text, { delimiter: ',', hasHeader: true });
```

The manifest `examples` array lists the column setup for each procedure, for
example:

```json
{
  "analysis": "cox",
  "columns": {
    "time": "Time",
    "event": "Event",
    "covariates": ["Age", "Sex_male", "Ph_ecog"]
  }
}
```

## Regenerating

All files are generated by `samples/generate.R` from packages that ship with R
or are available on CRAN:

```bash
Rscript samples/generate.R
```

Requires `haven`, `writexl`, `jsonlite`, `MASS` and `survival`. The synthetic
datasets (`agreement_ratings`, `matched_binary`) use fixed seeds, so
regeneration is reproducible.

Validate the committed files with:

```bash
npm run test:samples
```

## Provenance and licensing

The datasets come from the R `datasets`, `MASS` and `survival` packages, or
are documented subsets/reshapes of them. They are included for testing and
teaching, with the original variable names and values. See the `source` field
in `manifest.json` for the exact origin of each file. R itself is distributed
under GPL-2/GPL-3; the data files here are derived data, not R code.
