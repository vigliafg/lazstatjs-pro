import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Wave 6 procedures (compact fr edition). */
export const w6Topics: HelpTopic[] = [
  procedureTopic({
    id: "competing", title: "Risques concurrents", summary: "Estime l’incidence cumulée d’une cause pendant que les autres causes rivalisent pour le même temps.",
    goal: "Mesurer la fréquence d’une cause précise lorsque les sujets peuvent sortir pour d’autres causes.",
    steps: ["Choisir le temps et l’événement avec les codes des causes (0 = censuré).", "Saisir le code de la cause d’intérêt.", "Sélectionner les covariables et lancer le modèle de Fine–Gray.", "Lire la courbe d’incidence cumulée et les rapports de sous-distribution."],
    expected: "Synthèse des événements et causes, coefficients de Fine–Gray avec sHR et courbe d’incidence cumulée au profil moyen.",
    whenToUse: ["Quand un événement a plusieurs causes mutuellement exclusives et non indépendantes.", "Quand on veut la probabilité d’une cause dans le temps."],
    assumptions: ["Les causes sont exhaustives et exclusives ; la censure est non informative.", "Les rapports de sous-distribution sont constants dans le temps."],
    reading: ["La CIF est la probabilité de la cause choisie avant t en présence des autres causes.", "Kaplan–Meier traite les causes concurrentes comme des censures et ne donne pas la CIF."],
    pitfalls: ["Lire la CIF comme 1 − survie de la cause choisie.", "Choisir la cause après avoir vu les résultats."],
    charts: ["Courbe d’incidence cumulée de la cause choisie.", "Forest plot des rapports de sous-distribution."],
  }),
  procedureTopic({
    id: "recurrent", title: "Événements récurrents", summary: "Modélise les événements répétés par sujet avec Andersen–Gill ou Wei–Lin–Weissfeld et des erreurs robustes.",
    goal: "Estimer l’effet des covariables sur le taux d’événements répétés sans supposer l’indépendance des événements d’un même sujet.",
    steps: ["Choisir l’identifiant du sujet et les colonnes début, fin et événement au format début-fin.", "Choisir Andersen–Gill pour le processus global ou Wei–Lin–Weissfeld par numéro d’événement.", "Ajouter les covariables et lancer.", "Lire les rapports de risque et les intervalles robustes."],
    expected: "Synthèse des sujets et épisodes, rapports de risque avec erreurs groupées et tests globaux.",
    whenToUse: ["Quand un même sujet peut vivre l’événement plusieurs fois : rechutes, pannes, admissions.", "Quand les événements d’un sujet sont corrélés."],
    assumptions: ["Censure non informative et intervalles début-fin cohérents.", "AG suppose un effet commun ; WLW une baseline par numéro d’événement."],
    reading: ["AG garde le sujet dans le risque après chaque événement et utilise le temps calendaire.", "WLW utilise le temps depuis l’événement précédent et une strate par numéro."],
    pitfalls: ["Traiter chaque ligne comme un sujet indépendant.", "Confondre temps calendaire et temps entre événements."],
    charts: ["Forest plot des rapports de risque robustes."],
  }),
  procedureTopic({
    id: "alt", title: "Essais de durée accélérée", summary: "Relie la durée à une variable de contrainte par un AFT de Weibull et fournit un facteur d’accélération.",
    goal: "Estimer la durée à la contrainte d’usage à partir d’essais à contraintes plus élevées.",
    steps: ["Choisir le temps, l’événement et la colonne de contrainte.", "Choisir la relation : Arrhenius (1/contrainte), puissance inverse (log contrainte) ou exponentielle (contrainte).", "Saisir la contrainte d’usage et les covariables éventuelles.", "Lancer et lire le facteur d’accélération et les rapports de temps."],
    expected: "Synthèse AFT de Weibull avec facteur d’accélération, rapports de temps et diagramme en barres du facteur.",
    whenToUse: ["Quand les composants sont testés à des contraintes supérieures aux conditions d’usage.", "Quand le mécanisme de défaillance reste le même."],
    assumptions: ["La loi de Weibull décrit les temps et le mécanisme ne change pas.", "La contrainte est mesurée sans erreur et les niveaux sont bien séparés."],
    reading: ["Le facteur compare la durée à la contrainte d’usage avec celle à la plus basse contrainte observée.", "Le rapport de temps porte sur une unité de la contrainte transformée."],
    pitfalls: ["Extrapoler loin au-delà de la plage testée sans justification physique.", "Lire le rapport de temps comme s’il portait sur la contrainte brute."],
    charts: ["Forest plot des rapports de temps.", "Diagramme en barres du facteur d’accélération."],
  }),
  procedureTopic({
    id: "reliability", title: "Croissance de fiabilité et RBD", summary: "Suit une courbe de croissance Crow–AMSAA ou combine les fiabilités des composants dans un schéma série/parallèle.",
    goal: "Voir si un système réparable progresse, ou calculer la fiabilité d’un système à partir de ses composants.",
    steps: ["Choisir croissance pour les défaillances cumulées, ou RBD pour combiner les fiabilités.", "Pour la croissance, choisir le temps et les défaillances cumulées puis lancer.", "Pour le RBD, saisir la fiabilité de chaque composant et regrouper les composants parallèles dans le même étage.", "Lire les paramètres ou la fiabilité du système et repérer l’étage le plus faible."],
    expected: "Croissance : β, λ, MTBF cumulé et instantané et graphique observé/ajusté. RBD : fiabilité par étage et du système.",
    whenToUse: ["Quand un système réparable est amélioré et que l’on veut vérifier la baisse des défaillances.", "Quand la fiabilité du système doit être dérivée des composants."],
    assumptions: ["Croissance : processus de Poisson non homogène à intensité en loi de puissance et corrections cumulatives.", "RBD : composants indépendants et fiabilités connues sans incertitude."],
    reading: ["β < 1 indique un taux de défaillance décroissant ; β = 1 est un processus de Poisson homogène.", "En série la fiabilité est le produit des étages ; en parallèle 1 − Π(1 − r)."],
    pitfalls: ["Lire la courbe de croissance comme une prévision au-delà du temps observé.", "Oublier qu’un seul étage en série arrête le système."],
    charts: ["Défaillances cumulées observées et ajustées (croissance).", "Fiabilité par étage (RBD)."],
  }),
];
