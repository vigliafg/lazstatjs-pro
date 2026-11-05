# QA visiva a campione — grafici delle nuove procedure

**Data**: 2026-11-04
**Branch**: `grafici-procedure` (HEAD `a6b08e3`)
**Perimetro**: i 29 modelli `AnalysisChart` aggiunti rispetto a `origin/main` (321 → 349)
**Campione**: 10 grafici estratti senza reimmissione, seed `20261104` (mulberry32)
**Pipeline**: builder reale su fixture dei test → `buildVegaSpec` → Vega-Lite `compile` → `vega-embed` in Chrome → PNG

## Campione e esito

| # | Grafico | Kind | Esito |
|---|---|---|---|
| 1 | `pls-loadings` | heatmap | ⚠️ etichette illeggibili sulle celle chiare |
| 2 | `alt-life-stress` | scatter | ✅ corretto |
| 3 | `multinomial-confusion` | heatmap | ⚠️ etichette illeggibili sulle celle a valore basso |
| 4 | `survey-deff` | bar | ✅ corretto (barra unica molto larga: noto, estetico) |
| 5 | `doe-alias` | heatmap | ⚠️ etichette illeggibili sulle celle `0.00` |
| 6 | `gof-contribution` | pareto | ❌ cumulata disallineata, ordine perso |
| 7 | `nested-variance` | bar | ✅ corretto (`Outer = 0` è il troncamento a 0 della stima) |
| 8 | `latentclass-entropy` | bar | ✅ corretto |
| 9 | `cluster-silhouette` | bar | ✅ corretto |
| 10 | `exact-observed-expected` | bar | ✅ corretto |

Controlli automatici: 10/10 SVG prodotti, 0 errori Vega-Embed, 0 `NaN`/`Infinity`/`undefined`
nel testo, marks da 29 a 76 per grafico.

## Rilievi

1. **Contrasto etichette heatmap (3/3 heatmap del campione).** Il layer di testo in
   `src/charts/vega/layers.ts` (`heatmapLayers`) usa sempre `theme.text`
   (`#e2e8f0` nel tema scuro): sulle celle chiare (valore ≈ 0 su scala divergente,
   o conteggi bassi su scala `blues`) l'etichetta sparisce. Colpisce `pls-loadings`,
   `multinomial-confusion`, `doe-alias` e in generale tutte le heatmap con celle
   vicine allo zero.
2. **Pareto con cumulata disallineata (`gof-contribution`).** `paretoLayers`
   (`src/charts/vega/advancedLayers.ts`) condivide il canale `x` fra barre e linea,
   ma la linea usa `field: 'x'` mentre le barre usano `field: 'category'` con un
   `sort` esplicito in ordine decrescente. Vega-Lite unisce i domini e scarta il
   sort (`Domains that should be unioned has conflicting sort properties. Sort will
   be set to true`): le categorie finiscono in ordine alfabetico e i punti della
   cumulata su posizioni sbagliate (misurato: `A=40` due volte, `B=100` al secondo
   posto, `E=80` all'ultimo). Anche l'ordine decrescente delle barre è perso.
   Lo stesso percorso `x:` è usato da `descriptive/freq-cumulative`
   (`src/analyses/descriptive/run.tsx`), quindi il difetto riguarda entrambi i
   Pareto, non solo quello campionato.
3. **Nota statistica assente su `nested-variance`.** Il componente esterno è
   troncato a 0 da `Math.max(0, …)` in `src/stats/kernels/nestedAnova.ts`: valori
   `0.00` non sono un errore, ma il grafico non lo dichiara.

Nessun titolo tagliato, nessuna legenda mancante, nessuna sovrapposizione di testi
oltre ai punti già noti (tick nominali ruotati a 90°, barre a larghezza piena con
una o due categorie).

## Tempi (job completo, warm)

| Fase | Tempo |
|---|---|
| Estrazione campione (diff inventario `origin/main` → HEAD, PRNG) | < 1 s |
| Builder + `buildVegaSpec` per 10 grafici | 94 ms |
| Render Vega + 10 screenshot PNG (Chrome headless) | 2 814 ms |
| **Totale end-to-end** | **4.34 s** (user 4.11 s, sys 0.51 s, RSS max 211 MB) |

Artefatti: `*.png` (uno per grafico), `report.json` (metriche SVG per card).
