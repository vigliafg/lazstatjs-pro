# Roadmap — procedure avanzate

Stato delle procedure di priorità 1 e 2. Le priorità 3 (SEM, meta-analisi,
Bayes, DOE, serie temporali avanzate, ecc.) sono fuori perimetro.

## Priorità 1 — essenziali

- [x] **FDR / Benjamini–Hochberg**: kernel `stats/kernels/multiple.ts`,
      opzione post-hoc ANOVA e Dunn.
- [x] **GLM (conteggi)**: Poisson e binomiale negativa NB2, IRR, dispersione,
      LR, AIC/BIC. Restano logistico ordinale e Firth.
- [ ] **Modelli misti**: LMM/GLMM, GEE.
- [x] **EFA + omega**: principal-axis factoring, parallel analysis, varimax,
      comunalità/unicità e omega totale; modalità EFA nella scheda Multivariate.
- [ ] **Dati mancanti**: imputazione multipla, FIML.
- [x] **Errori standard robusti**: HC1/HC3 nella regressione, con tabella
      dedicata e test contro un riferimento sandwich.
- [x] **Accordo**: ICC(1,1)/(2,1)/(3,1), Bland–Altman con bias/LoA e
      regressione del bias, Cohen/Fleiss kappa con pesi lineari o quadratici.
- [x] **TOST / non-inferiorità**: nuova scheda Equivalence (TOST) con disegno
      one-sample, paired e due gruppi indipendenti.

## Priorità 2 — estensioni attese

- [ ] **ANOVA mista** between-within, contrasti e medie marginali.
- [ ] **Sopravvivenza estesa**: Cox stratificato, covariate tempo-dipendenti,
      sopravvivenza parametrica.
- [ ] **Bootstrap e permutazione** come inferenza trasversale.
- [ ] **Potenza estesa**: mixed, survival, equivalenza.

## Priorità 3 — fuori perimetro

SEM/CFA, IRT, meta-analisi, Bayes, causal inference avanzata, panel/IV/DiD,
VAR/GARCH, rischi competitivi, DOE/SPC/MSA, machine learning, spaziale.
