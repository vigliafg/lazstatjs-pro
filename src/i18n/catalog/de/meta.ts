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
  'meta.analysis.lmm.description':
    'Lineares gemischtes Modell mit zufälligem Achsenabschnitt.',
  'meta.analysis.gee.label': 'GEE',
  'meta.analysis.gee.description':
    'Marginale Effekte mit clustergerobusten Standardfehlern.',
  'meta.analysis.multivariate.label': 'Multivariat',
  'meta.analysis.multivariate.description':
    'PCA, Cronbachs Alpha und explorative Faktorenanalyse.',
  'meta.analysis.chisquare.label': 'Chi-Quadrat (χ²)',
  'meta.analysis.chisquare.description':
    '2×2-Assoziation mit exaktem Test nach Fisher.',
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
};
