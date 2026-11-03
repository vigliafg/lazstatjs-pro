# Documento di avvenuta implementazione — grafici delle procedure

**Piano:** `docs/plans/2026-11-03-grafici-procedure-piano.md` (fasi F0.1 → F11.3)
**Esito:** piano concluso, nessuna fase aperta
**Data:** 3 novembre 2026
**Branch:** `grafici-procedure`, pubblicato su `origin`
**HEAD:** `b6bd944` (base di confronto `origin/main` = `e499c65`, 44 commit, tutti con scope `(charts)`)

Documenti collegati: `docs/plans/2026-11-03-grafici-procedure-stato.md` (stato e
registro decisioni), `docs/RELEASE-CHARTS-2026-11-03.md` (note di release),
`docs/analysis/2026-11-03-inventario-grafici-72-procedure.md` (inventario
rigenerato), `docs/CHART-ENGINE.md` (contratti del motore e convenzioni JMP),
`docs/PROJECT-STATUS.md` (stato del progetto).

---

## 1. Esito in sintesi

- **71 procedure su 72** hanno almeno un grafico; il `wizard` resta senza per
  scelta, documentata.
- **349 modelli `AnalysisChart`** e **33 kind** distinti, contati
  dall'inventario rigenerato con `npm run chart:inventory` (non a mano).
- Grafici con **note statistiche in 6 lingue**: it (sorgente), en, fr, es, de,
  pt-PT.
- **Guide help 71/71**: le 18 procedure che avevano grafici ma nessuna guida
  sono state coperte in tutte le lingue.
- Editor per card, galleria degli stili e tre varianti **JMP opt-in**
  (`jmp-ratio`, `jmp-km`, `jmp-connected`) più il box JMP dei confronti tra
  gruppi; i default dei kind non sono cambiati.
- Nessun grafico inventato: dove il kernel non espone il dato (β(t) del
  `tdcox`, CIF impilate, scomposizione MSA per operatore) il grafico è stato
  rinviato e annotato tra i limiti.

## 2. Cosa è stato implementato

| Blocco | Fasi | Contenuto |
|---|---|---|
| Guardrail e inventario | F0.1 | `scripts/chart-inventory.mjs`, script `chart:inventory`, inventario per analisi e per kind, guardrail di dimensione file |
| Copertura per famiglia | F1.1–F3.3, F5–F9.3b | grafici mancanti nelle famiglie Descriptive, Quality, Regression, Multivariate, Categorical, Survival, Time series, Design & power, Missing data, ML, Advanced |
| Convenzioni di lettura | F10.1–F10.3 | forest a rapporto su scala log, curve KM, serie con marker, frequenze e pesi ordinati, box JMP (baffi 10–90, media con IC, jitter) |
| Internazionalizzazione | F11.1a–b | cataloghi grafici fr/es/de/pt-PT allineati all'inglese (136 voci per lingua), placeholder verificati |
| Help e manuale | F11.2 | guide per 18 procedure in 6 lingue, inventario rigenerato, sezione «Convenzioni JMP» in `docs/CHART-ENGINE.md` |
| Gate e release | F11.3 | gate completo, note di release, `PROJECT-STATUS.md` riallineato |

Fuori piano, come manutenzione richiesta a valle:

- `charts-extra.ts` di fr/es/de/pt-PT diviso in due parti più un file di note
  (31 voci tradotte: ADF/KPSS, ANOM, ANOVA gerarchica, canonical, ICC).
- `src/stats/reportCopy/catalog/en/charts.ts` diviso in `charts-part-a.ts` e
  `charts-part-b.ts`, con contenuto verificato identico a prima
  (`deepStrictEqual`, 977 chiavi).
- Eccezioni di dimensione scese da 14 a **9** in `scripts/check-file-size.mjs`.

## 3. Verifiche eseguite

| Comando | Esito |
|---|---|
| `npm run check` | 1356 test, 0 fail; dependency-cruiser, madge e filesize verdi (1176 file, 9 eccezioni) |
| `npm run test:samples` | 7 test, 0 fail |
| `node --import tsx scripts/check-locale.mjs <locale>` | exit 0 su it, en, fr, es, de, pt-PT |
| `npx playwright test e2e/chart-editor.spec.ts e2e/chart-styles.spec.ts --project=desktop` | 12 passati, 3 skipped, 0 fail |
| `npm run help:build` | 0 |
| `npm run lint` (`tsc --noEmit`) | 0 |
| `npm run build` | web + Electron verdi |

## 4. Verifica di rendering (controllo manuale)

Pipeline usata: runner reale → `buildVegaSpec` → `compile` di Vega-Lite →
`View` di Vega → SVG, poi rasterizzazione con Chrome per l'ispezione visiva.
Criterio automatico: SVG prodotto, almeno 3 elementi grafici, nessun `NaN` o
`Infinity`.

| Grafico | Kind | Esito visivo |
|---|---|---|
| `alt-life-stress` | scatter | corretto: punti, retta tratteggiata, assi `Vita (log10)` × `Stress trasformato` |
| `spatial-variogram` | line | corretto: 5 classi, semivarianza monotona, legenda |
| `bayes-ppc` | line | corretto: curva predittiva e verticale dell'osservato dentro la distribuzione |
| `canonical-scores` | scatter | corretto: nuvola sui punteggi canonici |
| `reliability-rbd` | bar | valori corretti (0.99 / 0.80); barre molto larghe con due categorie |
| `canonical-corr` | bar | barra unica 0.20; tick `F1` ruotato di 90°, leggibile ma poco elegante |
| `spatial-map` | scatter | corretto: punti e legenda sopra/sotto la media |
| `bayes-posterior-density` | histogram | corretto: 600 valori dopo burn-in, asse `μ` |
| `bayes-interval` | interval | corretto: un intervallo su `μ`; tick ruotato e asse poco sfruttato con un solo parametro |
| `alt-acceleration` | bar | vuoto nel primo tentativo perché il fixture estrapolava (`useStress = 1` → fattore `1.17e-15`); con `useStress = 50` barra a 1.61 e 36 elementi |

Conclusioni del controllo: nessun `NaN`, nessun titolo tagliato, nessuna
legenda mancante, nessuna sovrapposizione di testi. Restano due punti estetici
noti, non errori: rotazione a 90° delle etichette nominali corte e larghezza
piena delle barre quando le categorie sono una o due.

## 5. Limiti dichiarati

- `tdcox` senza grafico β(t): il kernel restituisce β costanti.
- `competing` senza CIF impilate: il modello è stimato per una causa alla volta.
- Actual by Predicted con banda solo per `k = 1`.
- MSA senza scomposizione della varianza per operatore.
- `surface` senza scelta mesh/contour nell'editor.
- `meta-forest` in scala lineare: `MetaParams` non dichiara la misura.
- Heatmap dei loadings in scala divergente, perché i carichi hanno segno.
- Nove eccezioni di dimensione restano su file di dominio (`types.ts`,
  `params.ts`, `parse.ts`, `roles.ts`, `arima.ts`, `cox.ts`, `App.tsx`,
  `registry.ts`, `features.ts`).

## 6. Riproduzione dei controlli

```bash
npm run check
npm run test:samples
for l in it en fr es de pt-PT; do node --import tsx scripts/check-locale.mjs "$l"; done
npx playwright test e2e/chart-editor.spec.ts e2e/chart-styles.spec.ts --project=desktop
npm run build
```

## 7. Storia del branch

Tutti i commit da `origin/main` a `b6bd944`:

- `b6bd944 docs(charts): allinea la dashboard per famiglia allo stato reale`
- `1687016 refactor(charts): dividi en/charts per rientrare nel limite di 700 righe`
- `8b467d8 fix(charts): split dei cataloghi e note di canonical, ANOM e ICC`
- `e08e462 docs(charts): F11.3 gate finale, note di release e stato del progetto`
- `452b1b5 docs(charts): F11.2 guide help, inventario e convenzioni JMP`
- `c336ce5 feat(charts): F11.1b cataloghi grafici in tedesco e portoghese`
- `be60fc6 feat(charts): F11.1a cataloghi grafici in francese e spagnolo`
- `d92651c docs(charts): registra il gate verde dell'ondata O10`
- `6731949 feat(charts): F10.3 box stile JMP per i confronti tra gruppi`
- `8d771b5 fix(charts): F10.2 frequenze e pesi ordinati dal valore più alto`
- `a43de23 feat(charts): F10.1 forest a rapporto, curve KM e serie con marker`
- `af1cc4e docs(charts): registra il gate verde dell'ondata O9`
- `4fa51dc feat(charts): F9.3b variogramma sperimentale spaziale`
- `96b610e feat(charts): F9.3a controllo predittivo bayesiano e funnel`
- `db0b58a fix(charts): F9.2b note di text, kind dichiarati e guide ML`
- `e5f03bc feat(charts): F9.2a effetto del disegno survey`
- `a90dcd5 feat(charts): F9.1 matrice di alias del disegno DOE`
- `6d9c3d0 docs(charts): chiusura ondata O8 con gate verde`
- `7c32d9c feat(charts): F8.2 Q-Q dei residui GARCH`
- `5371a3b feat(charts): F8.1 Holt-Winters, radici unitarie e spettrale`
- `bdf371f docs(charts): nota di ripresa con commit e prossima fase`
- `67ecc38 feat(charts): F7.3a life-stress plot e verifica parametriche`
- `a7260fa feat(charts): F7.1–F7.2 sopravvivenza, rischi competitivi e foreste su scala log`
- `8cff79a feat(charts): F6.1 osservati e attesi nel test esatto`
- `bcddd85 docs(charts): inventario a 342 modelli dopo le ondate O3-O5`
- `ed8af2a feat(charts): F5.3 guide di PCA, EFA e alpha`
- `c4d6a88 feat(charts): F5.2b curve caratteristiche degli item`
- `941bd4d feat(charts): F5.2a adeguamento SEM e certezza delle classi latenti`
- `bc5fb05 feat(charts): F5.1 silhouette, scatter dei cluster e correlazioni canoniche`
- `79bc433 fix(charts): QA visiva, scatter da series e cumulata del Pareto`
- `ca6bdb0 feat(charts): F4.4 verifica stili JMP della regressione`
- `649f36c feat(charts): F4.3 foreste su scala log e link dichiarato`
- `00311e9 feat(charts): F4.2 confusione, primo stadio e loadings PLS`
- `a18779d feat(charts): F4.1 coefficienti del modello selezionato`
- `0ad64ef feat(charts): F3.3 guide caterpillar per LMM, GLMM e GEE`
- `fcf587f feat(charts): F3.2 mediane Mood, componenti gerarchiche e contributi GOF`
- `8a6e033 feat(charts): F3.1 forest varianze, mediana e KS`
- `df67183 feat(charts): F2.2 profilo parte per operatore`
- `5e31b9d feat(charts): F2.1 Pareto e strip outlier`
- `ce7d1de feat(charts): F1.2 TOST a intervallo`
- `e3f05b6 feat(charts): F1.1b funzione cumulata media nei recurrent`
- `0f2dde8 feat(charts): F1.1a medie di cella nel factorial`
- `b649a08 feat(charts): F0.2 tre varianti JMP forest, sopravvivenza e linea`
- `2be26aa feat(charts): F0.1 inventario grafici e guardrail su sub-runner`
