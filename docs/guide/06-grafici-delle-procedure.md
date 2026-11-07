# 06 — Grafici delle procedure

**Cosa copre.** I grafici che ogni procedura produce, come sono costruiti e
perché non sono decorazioni.

## Indice

- [Il catalogo](#il-catalogo)
- [Un grafico, non un'immagine](#un-grafico-non-unimmagine)
- [Quali grafici, per quale procedura](#quali-grafici-per-quale-procedura)
- [Grafici composti](#grafici-composti)

## Il catalogo

`CHART_KINDS` in `src/stats/charts.ts` elenca 32 tipi di grafico. Ogni tipo ha
un aspetto predefinito (`src/charts/defaults.ts`), un insieme di proprietà
modificabili (`src/charts/features.ts`) e uno o più costruttori nei kit
condivisi (`src/charts/kits/`). Un tipo nuovo si aggiunge solo se ha un uso
statistico chiaro e uno spec compilabile.

## Un grafico, non un'immagine

Un grafico della procedura è un `AnalysisChart`: `id`, `kind`, `title`,
`subtitle?`, `note?`, dati già pronti (`data`), nomi leggibili dei campi
(`fields`), statistiche di supporto (`stats?`) e opzioni. Non contiene React:
l'adapter `buildVegaSpec` (`src/charts/vega/`) traduce il modello in Vega-Lite,
e lo stesso modello alimenta editor, export e test.

La `note` spiega come leggere il grafico (per esempio cosa rappresenta il
segmento di un forest plot). Non ripete i numeri, che stanno nelle tabelle.

## Quali grafici, per quale procedura

La scelta non è arbitraria: ogni procedura produce i grafici che servono a
leggere il suo risultato (residui per un modello, intervalli per una stima,
superficie per un disegno sperimentale). La mappa completa è in
`docs/analysis/2026-11-04-mappa-procedure-grafici.md`; l'inventario per
procedura in `docs/analysis/2026-11-03-inventario-grafici-72-procedure.md`.

Il test `src/analyses/chartsCoverage.test.ts` compila con Vega-Lite i grafici
delle procedure coperte, e `buildSpec.test.ts` garantisce che ogni tipo
produca uno spec valido: un grafico che non compila non arriva all'utente.

## Grafici composti

Alcune analisi aggiungono pannelli (`panels`) dopo i grafici singoli: sono
card che mettono insieme più viste dello stesso risultato (per esempio
superficie e curve di livello). Restano nello stesso run-report.

**Cosa non copre.** La modifica interattiva del grafico: [07](07-chart-editor.md).

**Fonti nel codice.** `src/stats/charts.ts`, `src/charts/`,
`src/charts/vega/buildSpec.ts`, `src/analyses/*/run.tsx`.

**Vedi anche.** [`docs/CHART-ENGINE.md`](../CHART-ENGINE.md),
[`docs/analysis/2026-11-02-confronto-grafici-jmp.md`](../analysis/2026-11-02-confronto-grafici-jmp.md).
