# 06 — Grafici delle procedure

**Cosa copre.** I grafici che ogni procedura produce, come nascono e perché non
sono decorazioni.

## Indice

- [Il catalogo](#il-catalogo)
- [Un grafico, non un'immagine](#un-grafico-non-unimmagine)
- [Quali grafici, per quale procedura](#quali-grafici-per-quale-procedura)
- [Grafici composti](#grafici-composti)
- [Punti di forza](#punti-di-forza)

## Il catalogo

I tipi di grafico disponibili sono 32. Ognuno ha un aspetto predefinito, un
insieme di proprietà modificabili e uno o più costruttori condivisi con gli
altri tipi. Un tipo nuovo si aggiunge solo se ha un uso statistico chiaro e se
il grafico che ne risulta si può costruire davvero: il catalogo non cresce per
completezza apparente.

## Un grafico, non un'immagine

Un grafico della procedura non è un disegno: è un oggetto con un'identità, un
titolo, una nota, i dati già pronti, i nomi leggibili dei campi e le
impostazioni scelte. Non contiene elementi dell'interfaccia: viene tradotto in
un formato di disegno solo al momento di mostrarlo.

Lo stesso oggetto alimenta la visualizzazione, l'editor, l'esportazione e i
test. Un grafico che non si riesce a costruire non arriva all'utente: il
controllo avviene prima, non davanti agli occhi di chi sta lavorando.

La nota che accompagna il grafico spiega come leggerlo — per esempio cosa
rappresenta un segmento in un grafico di intervalli — e non ripete i numeri, che
stanno nelle tabelle.

## Quali grafici, per quale procedura

La scelta non è arbitraria. Ogni procedura produce i grafici che servono a
leggere il proprio risultato: i residui per un modello, gli intervalli per una
stima, la superficie per un disegno sperimentale. La mappa completa è
documentata in `docs/analysis/`, con un inventario per procedura e un confronto
con i programmi classici.

I controlli automatici costruiscono i grafici delle procedure coperte e
verificano che ogni tipo produca un risultato valido: la copertura è misurata,
non dichiarata.

## Grafici composti

Alcune analisi aggiungono pannelli dopo i grafici singoli: sono card che mettono
insieme più viste dello stesso risultato, per esempio una superficie e le sue
curve di livello. Restano nello stesso run-report, perché raccontano un unico
esito.

## Punti di forza

- **Il grafico giusto arriva già pronto.** L'utente non deve scegliere un tipo e
  costruirlo: la procedura sa quali viste servono per leggere il proprio
  risultato.
- **L'idea è separare il contenuto dalla resa.** Il grafico descrive cosa
  mostrare; la traduzione in disegno avviene dopo, quindi schermo, export e test
  vedono la stessa cosa.
- **Utile a ogni livello.** Chi ha poca esperienza trova una nota che spiega
  come leggere il grafico; chi ne ha molta ritrova i grafici diagnostici attesi,
  con la possibilità di intervenire nei dettagli nel chart editor.

**Cosa non copre.** La modifica interattiva del grafico: [07](07-chart-editor.md).

**Fonti nel codice.** `src/stats/charts.ts`, `src/charts/`,
`src/charts/vega/buildSpec.ts`, `src/analyses/*/run.tsx`.

**Vedi anche.** [`docs/CHART-ENGINE.md`](../CHART-ENGINE.md),
[`docs/analysis/2026-11-02-confronto-grafici-jmp.md`](../analysis/2026-11-02-confronto-grafici-jmp.md).
