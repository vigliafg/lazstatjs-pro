# Roadmap — procedure avanzate

Stato delle procedure di priorità 1 e 2. Le priorità 3 (SEM, meta-analisi,
Bayes, DOE, serie temporali avanzate, ecc.) sono fuori perimetro.

## Priorità 1 — essenziali

- [x] **FDR / Benjamini–Hochberg**: kernel `stats/kernels/multiple.ts`,
      opzione post-hoc ANOVA e Dunn.
- [ ] **GLM**: Poisson, negativo binomiale, logistico ordinale, Firth.
- [ ] **Modelli misti**: LMM/GLMM, GEE.
- [ ] **EFA + omega**: rotazioni, parallel analysis, affidabilità omega.
- [ ] **Dati mancanti**: imputazione multipla, FIML.
- [ ] **Errori standard robusti**: HC1/HC3 e cluster-robust nella regressione.
- [ ] **Accordo**: ICC, Bland–Altman, kappa di Cohen/Fleiss/pesata.
- [ ] **TOST / non-inferiorità**.

## Priorità 2 — estensioni attese

- [ ] **ANOVA mista** between-within, contrasti e medie marginali.
- [ ] **Sopravvivenza estesa**: Cox stratificato, covariate tempo-dipendenti,
      sopravvivenza parametrica.
- [ ] **Bootstrap e permutazione** come inferenza trasversale.
- [ ] **Potenza estesa**: mixed, survival, equivalenza.

## Priorità 3 — fuori perimetro

SEM/CFA, IRT, meta-analisi, Bayes, causal inference avanzata, panel/IV/DiD,
VAR/GARCH, rischi competitivi, DOE/SPC/MSA, machine learning, spaziale.
