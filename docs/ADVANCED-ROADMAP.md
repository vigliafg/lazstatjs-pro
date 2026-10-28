# Roadmap — procedure avanzate

Stato delle procedure di priorità 1 e 2. Le priorità 3 (SEM, meta-analisi,
Bayes, DOE, serie temporali avanzate, ecc.) sono fuori perimetro.

## Priorità 1 — essenziali

- [x] **FDR / Benjamini–Hochberg**: kernel `stats/kernels/multiple.ts`,
      opzione post-hoc ANOVA e Dunn.
- [x] **GLM (conteggi)**: Poisson e binomiale negativa NB2, IRR, dispersione,
      LR, AIC/BIC.
- [x] **Logistico ordinale**: odds proporzionali con link logit, OR, soglie e
      LR; validato contro `ordinal::clm`.
- [x] **Firth logistico**: penalizzazione di Jeffreys per la separazione,
      validata contro brglm2.
- [x] **Modelli misti (random intercept)**: LMM con intercetta casuale via REML,
      ICC e varianze; validato contro lme4.
- [x] **GEE**: gaussiana/binomiale, independence/exchangeable, SE robusti per
      cluster; validato contro geepack. Restano slope casuali e GLMM.
- [x] **EFA + omega**: principal-axis factoring, parallel analysis, varimax,
      comunalità/unicità e omega totale; modalità EFA nella scheda Multivariate.
- [x] **Dati mancanti (MI numerica)**: MICE con regressione a catene, pooling
      di Rubin per media/SD, FMI e regressione lineare pooled. Restano FIML e
      modelli non lineari.
- [x] **Errori standard robusti**: HC1/HC3 nella regressione, con tabella
      dedicata e test contro un riferimento sandwich.
- [x] **Accordo**: ICC(1,1)/(2,1)/(3,1), Bland–Altman con bias/LoA e
      regressione del bias, Cohen/Fleiss kappa con pesi lineari o quadratici.
- [x] **TOST / non-inferiorità**: nuova scheda Equivalence (TOST) con disegno
      one-sample, paired e due gruppi indipendenti.

## Priorità 2 — estensioni attese

- [x] **ANOVA mista (split-plot)**: un fattore between, condizioni within,
      interazione e medie cella; Mauchly/GG, contrasti Holm, EM means non pesate;
      validata contro aov/emmeans.
- [x] **Sopravvivenza parametrica**: Weibull ed esponenziale AFT, time ratio e
      CI; validata contro survival::survreg.
- [x] **Cox stratificato**: baseline per strato e coefficienti condivisi,
      validato contro coxph(strata).
- [x] **Cox tempo-dipendente**: formato start-stop, validato contro
      coxph(Surv(start, stop, event)).
- [x] **Bootstrap e permutazione**: scheda Resampling per la differenza tra
      due gruppi (media/mediana, p di permutazione, CI bootstrap). Resta
      l'integrazione nelle altre procedure.
- [x] **Potenza estesa (TOST e survival)**: numerosità per equivalenza TOST e
      per log-rank con hazard ratio e tasso di eventi. Resta la potenza per
      modelli misti.

## Priorità 3 — fuori perimetro

SEM/CFA, IRT, meta-analisi, Bayes, causal inference avanzata, panel/IV/DiD,
VAR/GARCH, rischi competitivi, DOE/SPC/MSA, machine learning, spaziale.
