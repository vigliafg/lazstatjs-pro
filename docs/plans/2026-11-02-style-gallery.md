# Galleria degli stili nel chart editor

- **Richiesta**: «una fascia orizzontale sotto il viewport del chart editor:
  galleria degli stili. Per ogni tipo di grafico e procedura si può scegliere lo
  stile da generare/inserire/modificare nel report; il Q-Q precedente e quello
  ispirato a JMP fanno parte della galleria, uno è il default; più grafici
  possono essere embedded nel report uno sotto l'altro».
- **Data**: 2026-11-02.
- **Stato**: implementato (v1).

## Che cos'è uno stile

Uno stile è un **insieme completo delle opzioni specifiche di un tipo di
grafico**: `display` del box, asse e intervallo del Q-Q, sovrapposizioni
dell'istogramma, fit/banda dello scatter, raggruppamento delle barre, e così
via. Non contiene tema, palette, titoli, annotazioni o dati: cambiare stile non
deve mai toccare l'aspetto condiviso né il contenuto della card. L'unica opzione
comune ammessa è il tratteggio delle linee quando fa parte dell'aspetto (retta
di riferimento del Q-Q classico). I preset nominati restano l'altra cosa: stile
comune, universale, salvato dall'utente.

Il catalogo è in `src/charts/styles.ts`. Ogni tipo con varianti dichiara uno e
un solo stile `isDefault`, che **riproduce le opzioni di fabbrica**: le
procedure continuano a emettere il default senza modifiche e un test lo
verifica (`src/charts/styles.test.ts`). I tipi senza varianti non mostrano la
fascia.

### Q-Q, il caso di partenza

| id | etichetta | opzioni | default |
|---|---|---|---|
| `probability` | Probabilità | intervallo a curve tratteggiate, probabilità in basso e z in alto, riferimento continuo | sì |
| `classic` | Classico | banda sfumata, asse z, riferimento tratteggiato | no |

## Stili salvati dall'utente

Dal 2026-11-02 la galleria ha anche un pulsante **Salva stile…**: salva le
opzioni specifiche del tipo correnti (tutte, non solo quelle modificate) con un
nome, nel progetto (`ProjectSettings.chartStyles`). Regole:

- nome 1–48 caratteri, unico **per tipo** (stesso nome e stesso tipo
  sovrascrive, come i preset nominati);
- massimo 40 stili e 20 KB in totale; id generato con prefisso `u-`;
- le opzioni sono validate contro le chiavi note del tipo (`factoryOptions`):
  chiavi scomparse, tipi sbagliati e opzioni comuni vengono scartati;
- gli stili utente stanno in coda ai built-in e restano modificabili/eliminabili
  da **Impostazioni → Grafici** (rinomina ed eliminazione);
- al caricamento di un progetto manomesso o vecchio gli stili non validi sono
  scartati senza perdere il progetto.

## Stili prima del run

Ogni tipo con varianti ha uno **stile predefinito** usato dai nuovi grafici:

- `ProjectSettings.chartStyleDefaults[kind]` è il default globale, scelto in
  **Impostazioni → Grafici**;
- `ProjectSettings.chartStyleOverrides[analysisId][kind]` è l'override della
  singola procedura, scelto nella configurazione del run (sezione *Stili dei
  grafici*, accanto a *Grafici*);
- l'override vince sul globale; un id mancante o eliminato ricade sul default
  built-in, senza errori.

L'applicazione è run-scoped (`withChartStyles`, gemello di `withChartDefaults`)
e l'ordine di merge è **fabbrica < default comuni < stile del tipo < opzioni
della card**. Le opzioni statistiche che il runner passa esplicitamente vincono
sempre: uno stile non può cambiare il modello di una procedura, solo la sua
presentazione.

I tipi che una procedura può produrre sono dichiarati in
`src/charts/analysisKinds.ts`; un test verifica che ogni `kind` emesso dai
runner sia elencato e che ogni procedura del registro abbia la sua lista.

## Interfaccia

La fascia (`ChartStyleGallery`) sta sotto l'anteprima, dentro il viewport
dell'editor, anche nel layout mobile:

- una tile per stile, con **miniatura live** del grafico corrente in quello stile
  (Vega in scala ridotta, dati reali della card, `data-no-export`);
- badge *Predefinito* sullo stile emesso dalle procedure;
- **clic sulla tile**: applica lo stile alla bozza, un solo passo di undo;
- **`+` sulla tile**: inserisce nel run-report una copia della card con quello
  stile, sotto le altre, senza rieseguire l'analisi (`appendChartCopy`, cap
  `MAX_CHARTS_PER_OUTPUT`). Il titolo della copia porta il nome dello stile.

## Perché non tocca il motore

- Applicare uno stile è `applyChartStyle(options, style)`: spread delle sole
  chiavi possedute, `kind` e `annotations` intatti.
- `matchingChartStyle` confronta le stesse chiavi: la tile selezionata è quella
  che la card sta effettivamente usando.
- L'inserimento passa da `insertOutputChart` → `appendChartCopy`, che assegna un
  id univoco e lascia immutati i modelli esistenti; `session.charts` e
  `entry.charts` restano allineati, quindi autosave e `.lzs` non cambiano.
- Le miniature sono `[data-no-export]`: l'export PNG della card continua a
  produrre solo il grafico.

## Copertura

Stili dichiarati per: qq, box, histogram, scatter, bar, line, interval, dot,
ecdf, survival, forest, heatmap, missingness, risk, power, bootstrap, scree,
score, bland. Le etichette riusano le chiavi esistenti delle opzioni; le uniche
stringhe nuove sono `chart.style.gallery`, `chart.style.classic`,
`chart.style.addToReport` (6 lingue).

## Test

- `src/charts/styles.test.ts`: id unici, un solo default, default = opzioni di
  fabbrica, chiavi valide, `kind`/annotazioni preservati, matching.
- `src/charts/vega/buildSpec.test.ts`: ogni stile di ogni tipo compila senza
  warning (il caso forest log ha corretto un warning preesistente su `zero`).
- `src/charts/schema.test.ts`: `appendChartCopy` (id nuovo, immutabilità, cap).
- `e2e/chart-styles.spec.ts`: fascia visibile, default selezionato, cambio
  stile, inserimento della copia, indipendenza della card originale, quattro
  stili del box.

## Non incluso

- Stili condivisi tra progetti (vivono nel progetto, come i preset nominati).
- Stili applicati retroattivamente alle card esistenti: solo i nuovi run.
- Riordino/eliminazione dei grafici inseriti dal report (si usa la card).
- Stili per le tipologie senza varianti (`residual`, `mosaic`, `acf`).
