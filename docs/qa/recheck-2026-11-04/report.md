# Riverifica delle 51 card rimaste (2026-11-04)

Dopo i fix A–G restavano 51 card da ricontrollare: quelle segnalate dalla QA
estesa e quelle il cui aspetto cambia per effetto delle correzioni. Metodo
identico alla QA precedente, con il codice attuale.

## Metodo

- Runner reali (`ANALYSIS_RUNNERS`) su dati reali di `samples/` (CSV letti da
  `samples/manifest.json`), nessuna spec finta.
- Ruoli delle procedure assegnati con `analysisRoles`/`assignRole`; modalità
  esplorate per le procedure che ne hanno una (regressione lineare/polinomiale/
  selezione/penalizzata, serie storiche, stato-spazio, contingenza, qualità,
  spaziale, descrittive, testo, ML, MI).
- Spec costruite con `buildVegaSpec` (codice attuale), compilate con la
  Vega-Lite del progetto e rese in SVG con Vega (renderer `none`), poi
  fotografate in Chrome.
- Metriche automatiche per card: mark disegnati, testi, etichette con 4+
  decimali, warning di compilazione.

## Copertura

| Voce | Valore |
| --- | --- |
| Card da ricontrollare | 51 |
| Card ricostruite e rese | **44** |
| Card non ricostruite | 7 |
| Card vuote | 0 |
| Warning Vega-Lite | 0 |
| Etichette con 4+ decimali | 0 (dopo i fix) |

Artefatti: `sheet-01..05.html` (fogli 3×3), `review-*.png` (schermate in due
metà per foglio), `metrics.json` (metriche e motivi dei fallimenti).

Tutte le 44 card sono state guardate a piena risoluzione. Le uniche anomalie
visive sono i due difetti qui sotto, entrambi corretti nell'ondata successiva;
per il resto barre, linee, heatmap, box, istogrammi e legende risultano
leggibili e coerenti con i dati.

## Esiti dei fix

- **Grafici vuoti (C)**: tutte e cinque le card prima vuote ora disegnano dati
  (`glm-residuals`, `glmm-residual-fitted`, `iv-residuals`,
  `polynomial-residuals`, `penalized-coefficients-chart`).
- **Pareto (B)**: `freq-cumulative` ha barre in ordine decrescente e cumulata
  monotona che segue le barre.
- **Colore delle linee multi-serie (G)**: 20 card ora hanno una linea per serie
  (IRF del VAR a 4 colori, GARCH con DS condizionale, stato-spazio, densità
  spettrale, CUSUM, percorso dei coefficienti, residui misti, ecc.), con legenda
  coerente.
- **Inchiostro delle heatmap (A)**: etichette leggibili su celle chiare e
  sature in `doe-alias`, `multinomial-confusion`, `contingency-exact-residuals`,
  `correspondence-residual-heatmap`, `loglinear-residuals`,
  `text-document-topics`, `mi-categorical-missingness-matrix` (questa non
  ricostruita, vedi sotto).
- **Assi minuscoli (E)**: nessuna etichetta con 6+ decimali nelle card
  ricostruite (`canonical-loadings`, `glmm-random-effects`, `lmm-random-*`,
  `mars-residuals`, `nonlinear-residuals`, `quantile-residuals`,
  `propensity-att`, `selection-coefficients`, `sign-*`, `cusum-chart`, ...).
- **Etichette barre (F)**: `choice-shares` ed `exact-observed-expected` hanno le
  etichette fuori dalle barre, centrate e leggibili.

## Difetti trovati (corretti)

### 1. `text-similarity`: legenda su un dominio degenere

La matrice disegna tutte le coppie dei primi 20 documenti, ma quando i documenti
sono identici ogni coseno vale 1: il dominio della scala colore collassa su un
punto e la legenda stampa `1.000000` per entrambi gli estremi (aria-label
«values from 1.000000 to 1.000000»), oltre a mostrare i valori con sei decimali.

Corretto nel motore, non nel runner:

- `colorDomain` (`src/charts/vega/encoding.ts`) allarga il dominio a zero quando
  le celle condividono un solo valore (`[0, 1]` per una scala sequenziale,
  simmetrica `[-m, m]` per una divergente), così la legenda resta una scala di
  grandezza anche su una matrice piatta;
- la legenda del colore usa `format: '.4~g'`, quindi niente più `1.000000`:
  la card ora legge `0 … 1`.

### 2. Barre con una o due categorie che occupano tutto il grafico

`penalized-coefficients-chart`, `selection-coefficients` e
`canonical-loadings` hanno 1–2 categorie: la banda cresce con la card e la
barra diventa un blocco pieno. Prima erano vuote (fix C), quindi il difetto si
vede solo ora con i dati.

Corretto con `barThickness` (`src/charts/vega/encoding.ts`): la barra non supera
120 px, la larghezza che ha una card con quattro-cinque categorie; le barre con
molte categorie restano automatiche e quelle raggruppate (con `xOffset`)
mantengono la propria banda. La card con un solo predittore mostra ora una
colonna centrata con la sua barra d'errore.

## Card non ricostruite (7)

| Card | Motivo |
| --- | --- |
| `sem-residuals`, `sem-loadings`, `sem-fit` | il SEM non si stima sui dataset dei sample: «ogni fattore richiede almeno due indicatori e matrice di covarianza definita positiva» |
| `ml-confusion` | nessun dataset dei sample produce classi utilizzabili per la matrice |
| `ks-diff` | il test a due campioni non trova la coppia di variabili richiesta |
| `hw-series` | Holt–Winters richiede una serie con periodicità sufficiente |
| `mi-categorical-missingness-matrix` | il dataset di esempio non ha valori mancanti categorici |

Questi sette richiedono una fixture dedicata (come nella QA precedente), non
bastano i sample esistenti.
