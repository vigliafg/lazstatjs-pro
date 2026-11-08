# 07 — Chart editor

**Cosa copre.** Cosa si può cambiare di un grafico, cosa resta fissato dalla
procedura e dove finiscono le modifiche.

## Indice

- [Il principio](#il-principio)
- [Il catalogo delle proprietà](#il-catalogo-delle-proprietà)
- [Dove si modifica](#dove-si-modifica)
- [Assi, zoom e pan](#assi-zoom-e-pan)
- [Esportazione](#esportazione)
- [Punti di forza](#punti-di-forza)

## Il principio

Il grafico nasce dai dati e dal risultato dell'analisi: l'editor non permette di
cambiare i numeri, solo di leggerli meglio. Titolo, sottotitolo, note, assi,
legenda, colori, ordinamento, etichette, linee di riferimento e annotazioni sono
modificabili; il tipo di grafico e i dati no.

È una scelta di sostanza: un grafico modificabile nei valori sarebbe un secondo
modo di calcolare, e quindi un secondo modo di sbagliare.

## Il catalogo delle proprietà

Ogni tipo di grafico dichiara quali proprietà ha e come si chiamano. Da questo
elenco nascono il pannello delle proprietà e i relativi controlli, quindi
aggiungere una proprietà significa aggiungerla in un punto solo, non scrivere un
controllo a mano per ogni tipo di grafico.

Sopra le proprietà singole ci sono quattro strumenti che fanno risparmiare
tempo:

- **preset**: combinazioni rapide e riconoscibili, per ripartire da una vista
  nota;
- **stili**: tavolozze, caratteri, griglie e temi;
- **annotazioni**: testi e riferimenti ancorati al grafico;
- **valori predefiniti per tipo**: quello che l'utente vede appena il grafico
  compare.

## Dove si modifica

Il pannello delle proprietà e la galleria degli stili stanno nella scheda del
grafico. Le modifiche valgono per quel grafico di quel run e non toccano la
procedura: un nuovo run riparte dai valori predefiniti, a meno che l'utente non
abbia salvato uno stile o un preset da riusare.

## Assi, zoom e pan

La sezione **Asse** dell'editor governa la lettura dei numeri, non i numeri:

- **tick**: quanti valori mostrare (da 2 a 50, oppure automatico);
- **limiti**: minimo e massimo fissi per l'asse, per confrontare grafici con
  scale diverse;
- **scala**: automatica, lineare, logaritmica o radice quadrata;
- **formato delle etichette**: decimale, percentuale o notazione compatta.

Con **Zoom e pan** attivo la rotella restringe il dominio e il trascinamento lo
sposta; il pulsante **Azzera zoom** riporta la finestra iniziale. Con il
collegamento per righe attivo la superficie del pennello copre il grafico: la
rotella continua a zoomare, il trascinamento semplice seleziona e
**Shift+trascinamento** sposta la vista; il cursore diventa una mano appena
premi Shift.

Tutto vale per quella scheda e quel run: non cambia i dati né i risultati
statistici. Limiti e scala restano il modo corretto per confrontare due grafici
senza ingrandirli a mano.

## Esportazione

Un grafico si esporta come immagine o come SVG con le stesse opzioni viste a
schermo. Il run-report e il session-report includono i grafici nell'ordine in
cui compaiono, quindi il documento esportato conserva la sequenza con cui il
risultato è stato letto.

## Punti di forza

- **Si può migliorare la lettura senza toccare i numeri.** Chi vuole un grafico
  più chiaro ha tutti gli strumenti per farlo, e nessuno per alterare il
  risultato.
- **L'idea è un elenco di proprietà condiviso.** Ogni tipo di grafico dichiara
  cosa offre, e l'interfaccia si costruisce da quell'elenco: comportamento
  uniforme e meno occasioni di errore.
- **Semplice per chi vuole solo esportare, profondo per chi vuole rifinire.** Un
  preset o uno stile bastano a due clic; chi lavora sui dettagli trova assi,
  legende, annotazioni e colori uno per uno.

**Cosa non copre.** La costruzione del grafico:
[06](06-grafici-delle-procedure.md).

**Fonti nel codice.** `src/charts/features.ts`, `src/charts/defaults.ts`,
`src/charts/presets.ts`, `src/charts/styles.ts`,
`src/ui/analysis/ChartStyles.tsx`, `src/io/chartExport.ts`.

**Vedi anche.** [`docs/CHART-EDITOR-AUDIT.md`](../CHART-EDITOR-AUDIT.md),
[`docs/analysis/2026-10-31-property-panel-editor.md`](../analysis/2026-10-31-property-panel-editor.md)
