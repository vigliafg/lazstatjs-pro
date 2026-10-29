# Audit editor dei grafici

Data: 2026-10-29. Perimetro: `ChartEditorDialog`, toolbar generale,
pannello specifico, `VegaChart`, persistenza delle opzioni e layout mobile.

## Copertura end-to-end

La suite è in `e2e/chart-editor.spec.ts` e viene eseguita da `npm run test:e2e`
su desktop e mobile. I grafici di riferimento sono quelli di **ANOVA** (box e
barre) e **regressione lineare semplice** (scatter, box dei residui, Q–Q).

| Area | Cosa viene pilotato |
|---|---|
| Apertura | pulsante *Edit*, click sulla superficie, Enter/Spazio sulla card |
| Toolbar generale | preset, tema, griglia X/Y, palette, titolo, sottotitolo, note, titoli assi, zero baseline, tooltip |
| Stile | opacità griglia, forma/dimensione/opacità punti, spessore/tratteggio linee, dimensione grafico |
| Box ANOVA | punti, outlier, media, etichetta mediana, ordinamento |
| Barre ANOVA | barre d'errore, etichette valori, ordinamento, linea di riferimento, reset sezione |
| Scatter regressione | punti, fit OLS/Theil–Sen/entrambi, banda CI/PI, livello 90/95/99, opacità banda, equazione short/full, R², N |
| Box residui | punti, outlier, media, etichetta mediana, ordinamento |
| Q–Q | linea di riferimento |
| Dialogo | Done, Cancel, Escape, conferma modifiche non salvate, focus trap, Reset, Reset sezione |
| Persistenza | autosave, reload, riapertura con le opzioni salvate |
| Mobile | dialog full-screen, pannello specifico nel disclosure, nessuna duplicazione di id |

### Comandi

```bash
npx playwright test e2e/chart-editor.spec.ts
npm run check
npm run build
npm run test:e2e
```

Risultati dell'ultima esecuzione: **7 test dell'editor passati** (11 skip
normali: piattaforma non applicabile e baseline opt-in), `npm run check`
verde (530 test), build verde, `npm run test:e2e` verde (66 passati, 52
skip). Le due baseline visive passano con `VISUAL=1`.

### Controllo visivo

Le schermate vengono scritte in `test-results/chart-editor-audit/` (cartella
ignorata da git) a ogni esecuzione:

- `anova-box-default`, `anova-box-styled`, `anova-box-specific`;
- `anova-bar-default`, `anova-bar-se`, `anova-bar-sd`, `anova-bar-modified`, `anova-bar-reset`;
- `regression-scatter-default`, `-fit-none`, `-fit-ols`, `-fit-robust`,
  `-fit-both`, `-band-ci`, `-band-ci99`, `-band-pi`, `-annotations`,
  `-reset-section`;
- `regression-residual-box`, `regression-residual-qq`;
- `anova-box-mobile`.

Il controllo visivo ha confermato fit OLS tratteggiato rosso, Theil–Sen verde
continuo, banda PI più larga della CI e allargamento con il livello, etichette
dei valori/mediane, assenza della linea di riferimento Q–Q quando disattivata,
e reset della sezione.

## Difetti trovati e corretti

1. **Id duplicati nel dialog** — il pannello specifico era montato sia
   nell'`aside` desktop sia nel `<details>` mobile. Ogni controllo aveva due
   id uguali, con label ambigue e query DOM instabili. Ora il dialog sceglie un
   solo pannello in base al breakpoint.
2. **Dialog mobile fuori schermo** — il dialog ereditava il layout viewport
   allargato dalla console (tabelle larghe) e finiva oltre il viewport visivo:
   Done e Cancel non erano raggiungibili. Ora usa `100dvw`/`100dvh` e
   `min-w-0`/`min-h-0`.
3. **Reset e Reset sezione sbagliati** — riportavano ai default di fabbrica
   generici, perdendo i default della procedura (per esempio le barre ANOVA
   con IC). Ora tornano alle opzioni iniziali della card.
4. **Legenda offerta sui grafici senza serie** — checkbox e posizione legenda
   erano visibili ma non avevano effetto. Ora sono nascoste quando il grafico
   non ha una serie/colore.
5. **Etichette dei punti senza effetto** — l'opzione aggiungeva solo un
   tooltip. Ora il layer testuale è governato dall'opzione e il controllo è
   nascosto se il modello non contiene etichette.
6. **Equazione short/full identiche** — entrambe mostravano la stessa stringa.
   Ora `short` usa 2 decimali e `full` 3 decimali.
7. **Stile punti ignorato nel boxplot** — forma, dimensione e opacità erano
   fisse. Ora i punti del box usano le opzioni generali.
8. **Nota non aggiornata nel preview** — il checkbox Note non nascondeva la
   nota nel dialog. Ora preview e card usano la stessa opzione.
9. **Sottotitolo dipendente dal titolo** — nascondendo il titolo spariva anche
   il sottotitolo. Ora il sottotitolo resta visibile.
10. **Sottotitolo fantasma nella card** — con `showSubtitle=false` la card lo
    stampava comunque sotto il grafico. Rimosso.
11. **Controlli linea su grafici senza linee** — spessore/tratteggio erano
    offerti anche su barre e box. Ora compaiono solo per i kind che usano
    linee/regole.
12. **Barre d'errore nascoste dalle barre** — nel grafico ANOVA le rule
    dell'intervallo erano disegnate prima delle barre, che le coprivano. Ora
    gli error bar sono sopra le barre e restano visibili.
13. **SE/SD non funzionanti** — la scelta della barra d'errore ignorava
    `se`/`sd` e mostrava sempre la CI. Ora le barre ANOVA espongono `se`/`sd`
    e il layer calcola l'intervallo scelto.
14. **Controlli banda inutili** — livello e opacità erano visibili anche con
    `Band = None`. Ora compaiono solo quando una banda è attiva.
15. **Controllo etichette punti dormiente** — rimosso dal pannello: nessun
    modello scatter attuale contiene etichette per punto. Il campo resta nel
    modello per compatibilità con progetti salvati.
16. **Tooltip linea** — il tooltip non era applicato al mark della linea. Ora
    funziona anche sui line chart.
17. **Card grafico accessibile** — eliminato il `div role="button"` che
    conteneva un `<button>`: il click sulla superficie resta, mentre il
    controllo da tastiera è il pulsante Edit esplicito.
18. **Undo/redo nell'editor** — aggiunti pulsanti Undo/Redo e scorciatoie
    Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z e Ctrl+Y; la cronologia è limitata a 60 stati.
19. **Export PNG diretto** — pulsante PNG nel dialog: rasterizza il preview
    corrente senza chiudere l'editor.
20. **Baseline visive opzionali** — due snapshot Playwright
    (`anova-box-editor`, `regression-scatter-annotations`) con
    `maxDiffPixelRatio: 0.02`, eseguibili con `VISUAL=1`.

## Limiti noti rimasti

- Il grafico in anteprima conserva la larghezza del modello (520/780 px) e su
  mobile richiede scroll orizzontale; non c'è un adattamento responsive del
  singolo grafico.
- La suite copre le procedure richieste; gli altri kind condividono il motore
  ma non hanno ancora una matrice visuale dedicata.
- Le baseline visive sono legate a Chromium/Linux e vanno rigenerate quando
  cambiano font o tema di sistema.
