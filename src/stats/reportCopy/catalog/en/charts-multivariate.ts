/**
 * Chart titles for the categorical and multivariate families. Kept in a
 * separate module so the main chart catalog stays within the file-size guard.
 */
export const categoricalMultivariateChartCopy: Record<string, string> = {
  "Mosaico della contingenza":
    "Contingency mosaic",
  "Ampiezza per totali di riga, larghezza per distribuzione condizionata":
    "Height by row totals, width by conditional distribution",
  "L’area di ogni cella è proporzionale alla frequenza; il colore mostra il residuo standardizzato.":
    "Each cell area is proportional to its frequency; colour shows the standardized residual.",
  "Residui di associazione":
    "Association residuals",
  "Barre sopra o sotto lo zero":
    "Bars above or below zero",
  "La barra è il residuo standardizzato: sopra lo zero la cella è più frequente dell’atteso, sotto lo zero meno frequente.":
    "The bar is the standardized residual: above zero the cell is more frequent than expected, below zero less frequent.",
  "Direzione":
    "Direction",
  "Sopra l’atteso":
    "Above expected",
  "Sotto l’atteso":
    "Below expected",
  "Autovalori osservati":
    "Observed eigenvalues",
  "Soglia casuale":
    "Random threshold",
  "Carichi fattoriali":
    "Factor loadings",
  "{s1} fattori":
    "{s1} factors",
  "Carichi alti sulla stessa colonna indicano item che misurano la stessa dimensione; il colore mostra segno e intensità.":
    "High loadings on the same column indicate items measuring the same dimension; colour shows sign and strength.",
  "Analisi parallela":
    "Parallel analysis",
  "Autovalori osservati vs soglia generata":
    "Observed eigenvalues vs simulated threshold",
  "Una componente è trattenuta quando il suo autovalore supera la soglia casuale; la linea mostra il confronto direttamente.":
    "A component is retained when its eigenvalue exceeds the random threshold; the line shows the comparison directly.",
  "Varianza spiegata dai fattori":
    "Variance explained by the factors",
  "Le barre sommano la quota di varianza spiegata da ogni fattore dopo la rotazione.":
    "The bars show the share of variance explained by each factor after rotation.",
  "Comunalità":
    "Communalities",
  "Quota di varianza spiegata per variabile":
    "Share of variance explained per variable",
  "Una comunalità bassa indica che il fattore comune spiega poco di quella variabile; valori alti indicano una buona rappresentazione.":
    "A low communality means the common factors explain little of that variable; high values indicate a good representation.",
  "Carichi delle componenti":
    "Component loadings",
  "{s1} componenti":
    "{s1} components",
  "Un carico alto indica che la variabile contribuisce soprattutto a quella componente; il colore mostra segno e intensità.":
    "A high loading means the variable contributes mostly to that component; colour shows sign and strength.",
  "Biplot delle componenti":
    "Component biplot",
  "I punti sono i casi; le frecce sono i vettori delle variabili. Frecce vicine indicano variabili correlate, frecce opposte variabili inversamente correlate.":
    "Points are cases; arrows are variable vectors. Nearby arrows indicate correlated variables, opposite arrows inversely correlated variables.",
  "Correlazioni item-totale":
    "Item-total correlations",
  "Alpha = {s1}":
    "Alpha = {s1}",
  "La correlazione item-totale misura quanto ogni item è coerente con il punteggio complessivo; valori bassi suggeriscono un item poco omogeneo.":
    "The item-total correlation measures how consistent each item is with the total score; low values suggest a heterogeneous item.",
  "Item":
    "Item",
  "Correlazione item-totale":
    "Item-total correlation",
  "Alpha se l’item è eliminato":
    "Alpha if item deleted",
  "La linea tratteggiata è l’alpha totale: una barra sopra la linea indica che eliminare quell’item aumenterebbe l’affidabilità.":
    "The dashed line is total alpha: a bar above the line means deleting that item would increase reliability.",
  "Alpha senza l’item":
    "Alpha without the item",
  "Correlazioni tra item":
    "Inter-item correlations",
  "Matrice delle correlazioni tra gli item della scala":
    "Correlation matrix of the scale items",
  "Correlazioni alte e omogenee tra gli item sostengono l’ipotesi di una dimensione comune; valori negativi o molto diversi vanno esaminati.":
    "High, homogeneous inter-item correlations support a common dimension; negative or very different values need scrutiny.",
  "Fattore":
    "Factor",
  "Autovalore":
    "Eigenvalue",
};
