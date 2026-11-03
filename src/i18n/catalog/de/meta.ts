/** German messages — registry metadata (labels and one-line descriptions). */
import type { metaMessages as enMeta } from '../en/meta';

export const metaMessages: Record<keyof typeof enMeta, string> = {
  'meta.family.guided.label': 'Geführt',
  'meta.family.guided.description': 'Von der Frage ausgehen',
  'meta.family.descriptive.label': 'Deskriptiv',
  'meta.family.descriptive.description': 'Zusammenfassungen und Verteilungen',
  'meta.family.compare.label': 'Gruppen vergleichen',
  'meta.family.compare.description':
    'Unterschiede zwischen Gruppen und Messungen',
  'meta.family.regression.label': 'Regression',
  'meta.family.regression.description': 'Zusammenhänge, Ergebnisse und Modelle',
  'meta.family.multivariate.label': 'Multivariat',
  'meta.family.multivariate.description': 'Mehrere Variablen gleichzeitig',
  'meta.family.categorical.label': 'Kategorial',
  'meta.family.categorical.description':
    'Tabellen, Assoziation und Übereinstimmung',
  'meta.family.survival.label': 'Überleben',
  'meta.family.survival.description': 'Zeit bis zu einem Ereignis',
  'meta.family.timeseries.label': 'Zeitreihe',
  'meta.family.timeseries.description': 'Trend, Saisonalität und Prognosen',
  'meta.family.missing.label': 'Fehlende Daten',
  'meta.family.missing.description': 'Imputation und Pooling',
  'meta.family.design.label': 'Design & Power',
  'meta.family.design.description': 'Stichprobengröße, Power und Resampling',
  'meta.analysis.wizard.label': 'Assistent',
  'meta.analysis.wizard.description':
    'Beginnen Sie bei Ihrem Ziel und lassen Sie die Datenform das passende Verfahren vorschlagen.',
  'meta.analysis.descriptive.label': 'Deskriptiv',
  'meta.analysis.descriptive.description':
    'Mittelwerte, Streuung, Quantile und Zusammenfassungen pro Variable.',
  'meta.analysis.distfit.label': 'Verteilungsanpassung',
  'meta.analysis.distfit.description':
    'Eine beobachtete Verteilung mit theoretischen Familien vergleichen.',
  'meta.analysis.ttest.label': 'T-Test',
  'meta.analysis.ttest.description':
    'Zwei Mittelwerte oder gepaarte Messungen vergleichen.',
  'meta.analysis.anova.label': 'ANOVA',
  'meta.analysis.anova.description':
    'Mittelwerte zwischen Gruppen mit Post-hoc-Tests vergleichen.',
  'meta.analysis.factorial.label': 'Faktorielle ANOVA',
  'meta.analysis.factorial.description':
    'Zwei Zwischen-Personen-Faktoren und ihre Interaktion.',
  'meta.analysis.ancova.label': 'ANCOVA',
  'meta.analysis.ancova.description':
    'Gruppen vergleichen und dabei für kontinuierliche Kovariaten adjustieren.',
  'meta.analysis.repeatedanova.label': 'Messwiederholungs-ANOVA',
  'meta.analysis.repeatedanova.description':
    'Wiederholte Messungen an denselben Personen.',
  'meta.analysis.mixedanova.label': 'Gemischte ANOVA',
  'meta.analysis.mixedanova.description':
    'Ein Zwischen-Personen-Faktor und Innerhalb-Personen-Bedingungen.',
  'meta.analysis.nonparamrm.label': 'Nicht parametrisch (RM)',
  'meta.analysis.nonparamrm.description':
    'Friedman, McNemar, Cochran Q und Jonckheere.',
  'meta.analysis.tost.label': 'Äquivalenz (TOST)',
  'meta.analysis.tost.description':
    'Äquivalenz oder Nichtunterlegenheit mit TOST prüfen.',
  'meta.analysis.regression.label': 'Regression',
  'meta.analysis.regression.description':
    'Kleinste Quadrate mit robusten Optionen.',
  'meta.analysis.correlation.label': 'Korrelation',
  'meta.analysis.correlation.description':
    'Pearson-, Spearman- und Kendall-Zusammenhänge zwischen Variablen.',
  'meta.analysis.logistic.label': 'Logistische Regression',
  'meta.analysis.logistic.description':
    'Binäres Ergebnis mit Odds Ratios und Grenzwertanalyse.',
  'meta.analysis.countreg.label': 'Zählregression',
  'meta.analysis.countreg.description':
    'Poisson- und negative Binomialmodelle für Zähler.',
  'meta.analysis.ordinal.label': 'Ordinale Logistik',
  'meta.analysis.ordinal.description':
    'Kumulatives Logit für geordnete Ergebnisse.',
  'meta.analysis.lmm.label': 'Gemischtes Modell (LMM)',
  'meta.analysis.lmm.description': 'Lineares gemischtes Modell mit zufälligem Achsenabschnitt.',
  'meta.analysis.glmm.label': 'GLMM',
  'meta.analysis.glmm.description': 'Verallgemeinertes lineares gemischtes Modell mit zufälligem Achsenabschnitt und Steigung.',
  'meta.analysis.gee.label': 'GEE',
  'meta.analysis.gee.description':
    'Marginale Effekte mit clustergerobusten Standardfehlern.',
  'meta.analysis.multivariate.label': 'Multivariat',
  'meta.analysis.multivariate.description':
    'PCA, Cronbachs Alpha und explorative Faktorenanalyse.',
  'meta.analysis.chisquare.label': 'Chi-Quadrat (χ²)',
  'meta.analysis.chisquare.description':
    '2×2-Assoziation mit exaktem Test nach Fisher.',
  'meta.analysis.loglinear.label': 'Log-linear',
  'meta.analysis.loglinear.description': 'Poisson-Log-linear-Modell für zweidimensionale Tabellen.',
  'meta.analysis.contingency.label': 'Kontingenz (R×C)',
  'meta.analysis.contingency.description':
    'R×C-Tabellen mit Assoziationsmaßen.',
  'meta.analysis.agreement.label': 'Übereinstimmung',
  'meta.analysis.agreement.description': 'ICC, Bland–Altman und Cohen’s Kappa.',
  'meta.analysis.survival.label': 'Überleben (KM)',
  'meta.analysis.survival.description':
    'Kaplan–Meier-Kurven und Log-Rank-Tests.',
  'meta.analysis.cox.label': 'Cox (PH)',
  'meta.analysis.cox.description':
    'Proportional-Hazards-Modell und Hazard Ratios.',
  'meta.analysis.stratcox.label': 'Geschichtetes Cox',
  'meta.analysis.stratcox.description':
    'Cox-Modell mit eigener Basislinie pro Schicht.',
  'meta.analysis.tdcox.label': 'Zeitabhängiges Cox',
  'meta.analysis.tdcox.description':
    'Zeitvariable Kovariaten im Start-Stopp-Format.',
  'meta.analysis.parametric.label': 'Parametrisches Überleben',
  'meta.analysis.parametric.description':
    'Weibull- und exponentielle beschleunigte Ausfallzeit.',
  'meta.analysis.timeseries.label': 'Zeitreihe',
  'meta.analysis.timeseries.description': 'ARIMA/SARIMA, Trend und Prognose.',
  'meta.analysis.mi.label': 'Fehlende Daten (MI)',
  'meta.analysis.mi.description': 'Multiple Imputation mit Rubin-Pooling.',
  'meta.analysis.samplesize.label': 'Stichprobengröße / Power',
  'meta.analysis.samplesize.description':
    'Stichprobengröße und Power für gängige Designs.',
  'meta.analysis.resampling.label': 'Resampling',
  'meta.analysis.resampling.description':
    'Permutations- und Bootstrap-Inferenz.',
  'meta.analysis.partition.label': 'Partition',
  'meta.analysis.partition.description':
    'Regressionsbaum mit Teilungsregeln, Blattbericht und Variablenbedeutung.',
  'meta.analysis.quality.label': 'Qualität (SPC)',
  'meta.analysis.quality.description':
    'Regelkarten, Prozessfähigkeit, Pareto und Variabilität.',
  'meta.analysis.cluster.label': 'Clusteranalyse',
  'meta.analysis.cluster.description':
    'Hierarchisches Clustering mit Dendrogramm und Clusterprofilen.',
  'meta.analysis.discriminant.label': 'Diskriminanz / MANOVA',
  'meta.analysis.discriminant.description':
    'Lineare Diskriminanzfunktionen, kanonisches Diagramm und einfaktorielle MANOVA.',
  'meta.analysis.doe.label': 'Responsefläche (DOE)',
  'meta.analysis.doe.description':
    'Quadratische Responsefläche mit Konturplot und stationärem Punkt.',
  'meta.family.ml.label': 'Maschinelles Lernen',
  'meta.family.ml.description': 'Vorhersage, Klassifikation und Text',
  'meta.family.advanced.label': 'Fortgeschritten & Bayesianisch',
  'meta.family.advanced.description': 'Metaanalyse, bayesianische und räumliche Modelle',
  'meta.analysis.proportions.label': 'Anteile und Raten',
  'meta.analysis.proportions.description': 'Ein- und Zweistichprobentests für Anteile und Poisson-Raten.',
  'meta.analysis.variances.label': 'Varianzen',
  'meta.analysis.variances.description': 'Eine Varianz, F-Test, Bartlett und Levene für die Gleichheit der Varianzen.',
  'meta.analysis.glm.label': 'Verallgemeinertes lineares Modell (GLM)',
  'meta.analysis.glm.description': 'Verallgemeinerte lineare Modelle mit Gauß-, Binomial-, Poisson- und Gamma-Familie.',
  'meta.analysis.quantile.label': 'Quantilsregression',
  'meta.analysis.quantile.description': 'Regression auf ein bedingtes Quantil statt auf den Mittelwert.',
  'meta.analysis.nonlinear.label': 'Nichtlineare Regression',
  'meta.analysis.nonlinear.description': 'Exponentielle, logistische, Gompertz-, Potenz- und Michaelis–Menten-Kurven.',
  'meta.analysis.multinomial.label': 'Multinomiale Logistik',
  'meta.analysis.multinomial.description': 'Nominales Ergebnis mit mehr als zwei Klassen.',
  'meta.analysis.pls.label': 'PLS-Regression',
  'meta.analysis.pls.description': 'Partielle kleinste Quadrate für viele korrelierte Prädiktoren.',
  'meta.analysis.mars.label': 'GAM / MARS',
  'meta.analysis.mars.description': 'Adaptive Splines mit Hinge-Funktionen und automatischer Knotenwahl.',
  'meta.analysis.iv.label': 'Instrumentalvariablen',
  'meta.analysis.iv.description': 'Zweistufige kleinste Quadrate mit ausgeschlossenen Instrumenten und Diagnostik.',
  'meta.analysis.panel.label': 'Paneldatenmodell',
  'meta.analysis.panel.description': 'Feste und zufällige Effekte für Längsschnitt-Einheiten.',
  'meta.analysis.selection.label': 'Tobit / Selektion',
  'meta.analysis.selection.description': 'Zensierte Regression und Heckman-Selektion in zwei Schritten.',
  'meta.analysis.mediation.label': 'Mediation',
  'meta.analysis.mediation.description': 'Indirekte, direkte und totale Effekte mit Bootstrap-Intervallen.',
  'meta.analysis.propensity.label': 'Propensity Score',
  'meta.analysis.propensity.description': 'Matching und Gewichtung für beobachtete Behandlungseffekte.',
  'meta.analysis.canonical.label': 'Kanonische Korrelation',
  'meta.analysis.canonical.description': 'Kanonische Funktionen zwischen zwei Blöcken numerischer Variablen.',
  'meta.analysis.mds.label': 'Multidimensionale Skalierung',
  'meta.analysis.mds.description': 'Klassische und nicht metrische MDS-Karten mit Stress und Koordinaten.',
  'meta.analysis.correspondence.label': 'Korrespondenzanalyse',
  'meta.analysis.correspondence.description': 'Zeilen- und Spaltenkoordinaten, Inertia und Residuen einer Zweiweg-Tabelle.',
  'meta.analysis.sem.label': 'SEM / CFA',
  'meta.analysis.sem.description': 'Konfirmatorische Faktorenanalyse und Zwei-Faktor-Strukturmodell.',
  'meta.analysis.latentclass.label': 'Latente Klassen',
  'meta.analysis.latentclass.description': 'Latente Klassenanalyse als endliche Mischung für kategoriale Indikatoren.',
  'meta.analysis.irt.label': 'Item-Response-Theorie',
  'meta.analysis.irt.description': '2PL- und Rasch-Modelle mit Fähigkeiten und Information.',
  'meta.analysis.conjoint.label': 'Conjoint-Analyse',
  'meta.analysis.conjoint.description': 'Teilnutzen und Attributwichtigkeit aus Profilen.',
  'meta.analysis.competing.label': 'Wettbewerbsrisiken',
  'meta.analysis.competing.description': 'Fine–Gray-Subverteilungsrisiken und kumulative Inzidenz.',
  'meta.analysis.recurrent.label': 'Rezidivierende Ereignisse',
  'meta.analysis.recurrent.description': 'Andersen–Gill- und Wei–Lin–Weissfeld-Modelle für wiederholte Ereignisse.',
  'meta.analysis.alt.label': 'Beschleunigte Lebensdauertests',
  'meta.analysis.alt.description': 'Arrhenius- und Inverse-Power-Modelle mit Belastungsvariable.',
  'meta.analysis.reliability.label': 'Zuverlässigkeitswachstum & RBD',
  'meta.analysis.reliability.description': 'Crow–AMSAA-Wachstumskurven und Reihen-/Parallel-Blockschaltbilder.',
  'meta.analysis.var.label': 'VAR / VECM',
  'meta.analysis.var.description': 'Vektorautoregressionen, Granger-Kausalität und Fehlerkorrektur.',
  'meta.analysis.garch.label': 'GARCH',
  'meta.analysis.garch.description': 'Bedingte Volatilität mit einem GARCH(1,1)-Modell.',
  'meta.analysis.statespace.label': 'State-Space & Markov',
  'meta.analysis.statespace.description': 'Kalman-Filter, Smoother und Markov-Switching mit zwei Regimen.',
};
