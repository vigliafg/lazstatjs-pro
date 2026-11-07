# 07 — Chart editor

**Cosa copre.** Cosa l'utente può cambiare di un grafico, cosa resta fissato
dalla procedura e dove finiscono le modifiche.

## Indice

- [Il principio](#il-principio)
- [Il registro delle proprietà](#il-registro-delle-proprietà)
- [Dove si modifica](#dove-si-modifica)
- [Esportazione](#esportazione)

## Il principio

Il grafico nasce dai dati e dal risultato statistico: l'editor non permette di
cambiare i numeri, solo di leggerli meglio. Titolo, sottotitolo, note, assi,
legenda, colori, ordinamento, etichette, riferimento e annotazioni sono
modificabili; il tipo di grafico e i dati no.

## Il registro delle proprietà

`src/charts/features.ts` dichiara, per ogni tipo di grafico, quali proprietà
esistono e come si chiamano. Da quel registro nascono il pannello proprietà e
i controlli: aggiungere una proprietà significa aggiungerla lì e nel modello
del grafico, non scrivere un controllo a mano per ogni tipo.

Sopra le proprietà singole ci sono:

- **preset** (`src/charts/presets.ts`): combinazioni rapide e riconoscibili;
- **stili** (`src/charts/styles.ts`): tavolozze, font, griglie, temi;
- **annotazioni**: testi e riferimenti ancorati al grafico;
- **default per tipo** (`src/charts/defaults.ts`): cosa vede l'utente appena
  il grafico compare.

## Dove si modifica

Il pannello proprietà e la galleria stili stanno nella scheda del grafico
(`src/ui/analysis/ChartStyles.tsx`). Le modifiche sono per grafico del run e
non toccano la procedura: un nuovo run riparte dai default, a meno che
l'utente non abbia salvato uno stile o un preset.

## Esportazione

Un grafico si esporta come immagine o SVG con le stesse opzioni viste a
schermo (`chartExport.ts`); il run-report e il session-report includono i
grafici nell'ordine in cui compaiono.

**Cosa non copre.** La costruzione dello spec: [06](06-grafici-delle-procedure.md).

**Fonti nel codice.** `src/charts/features.ts`, `src/charts/defaults.ts`,
`src/charts/presets.ts`, `src/charts/styles.ts`,
`src/ui/analysis/ChartStyles.tsx`, `src/io/chartExport.ts`.

**Vedi anche.** [`docs/CHART-EDITOR-AUDIT.md`](../CHART-EDITOR-AUDIT.md),
[`docs/analysis/2026-10-31-property-panel-editor.md`](../analysis/2026-10-31-property-panel-editor.md).
