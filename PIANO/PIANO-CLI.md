# Piano — Motore CLI completo per LazStats

**Data:** 2026-11-12
**Repository:** `lazstatjs-pro`
**Versione di riferimento:** `0.32.0`
**Stato:** implementato — engine e CLI completi; gate CLI verde (lint, test, guard, build e smoke).

---

## 1. Scopo

Realizzare una CLI chiamata `lazstats` che esegua il motore statistico dell’app desktop senza aprire Electron, Vite o il browser.

La CLI deve:

1. usare gli stessi 72 runner puri dell’interfaccia;
2. accettare dataset reali e progetti `.lzs`;
3. restituire risultati serializzabili, report, tabelle e grafici;
4. funzionare in pipeline e in batch;
5. essere abbastanza stabile da diventare la base del server MCP stdio.

Non è una seconda applicazione statistica: è un adattatore sottile sopra un motore condiviso.

---

## 2. Fattibilità verificata

### 2.1 Conteggi reali

| Elemento | Conteggio | Note |
|---|---:|---|
| Runner puri in `ANALYSIS_RUNNERS` | 72 | `src/analyses/runners.ts` |
| Voci in `ANALYSIS_ALL` | 73 | include `assistant` e `wizard` |
| Schede visibili in `ANALYSIS_TABS` | 72 | include `assistant` |
| Famiglie | 12 | `ANALYSIS_FAMILIES` |
| Tipi di grafico | 32 | `CHART_KINDS` in `src/stats/charts.ts` |
| Analisi heavy | 32 | `HEAVY_ANALYSIS_IDS` |

`assistant` è una voce di interfaccia, non un runner statistico. `wizard` è il wizard legacy, nascosto dalla libreria ma ancora eseguibile. Di conseguenza:

- il catalogo completo comprende **72 runner eseguibili**;
- l’elenco predefinito ne mostra **71** (le procedure statistiche visibili);
- `assistant` va escluso dal catalogo eseguibile;
- `wizard` va mostrato solo con `--all` o `includeHidden`, perché serve a riprodurre report salvati.

### 2.2 Verifiche eseguite

- Il registro completo si importa con `node --import tsx` senza DOM.
- `descriptive` su `samples/descriptive/iris/data.csv` restituisce 4 tabelle.
- `buildVegaSpec` + `vega-lite.compile` + `vega.View(...).toSVG()` produce SVG in Node.
- Un grafico `bar` reale del runner descrittivo produce un SVG valido di 8.593 byte.
- `@modelcontextprotocol/server` e `@modelcontextprotocol/client` sono disponibili in versione 2.4.0, ma non sono ancora installati.

### 2.3 Cosa resta da verificare in implementazione

- compatibilità Node di `@irbisadm/statfmt` per SPSS/Stata;
- comportamento di `xlsx` e dei loader con file di grandi dimensioni;
- tempo di avvio del bundle completo dei 72 runner;
- disponibilità e stabilità dei font nel rendering SVG headless;
- differenze di path handling tra Linux, macOS e Windows.

---

## 3. Non-obiettivi

- Non aggiungere nuove procedure statistiche.
- Non duplicare formule o tabelle già presenti in `src/stats/`.
- Non mantenere una seconda lista di analisi.
- Non usare la CLI per modificare il progetto `.lzs` in questa fase.
- Non generare PNG con dipendenze native nella prima versione: l’SVG è il formato grafico primario.
- Non integrare AI, rete o chiamate remote.
- Non sostituire l’interfaccia desktop.

---

## 4. Architettura condivisa

### 4.1 Nuovo livello `src/engine/`

```text
src/
  engine/
    catalog.ts        catalogo runner + metadati + chiavi dei parametri
    params.ts         default, parse, binding nomi→indici, validazione
    dataset.ts        caricamento dati e costruzione Dataset
    project.ts        parsing .lzs senza localStorage
    run.ts            esecuzione con locale, chart defaults e worker
    render/
      table.ts        tabelle Markdown/HTML
      report.ts       ReportSpec → HTML/Markdown
      chart.ts        AnalysisChart → SVG
      html.ts         documento HTML self-contained
      xlsx.ts         workbook risultati
    result.ts         RunEnvelope e serializzazione
    errors.ts         errori tipizzati
    index.ts          API pubblica
  cli/
    main.ts           entry point, shebang
    args.ts           parsing argomenti
    commands/         un file per comando
    io.ts             stdout/stderr/file
```

La CLI importa solo `src/engine/`; non importa React, Electron, Vite o componenti UI.

### 4.2 Regole di dipendenza

```text
cli  -> engine -> analyses, stats, grid, io, charts
mcp  -> engine
engine -X-> ui, components, hooks, electron
analyses/stats -X-> engine, cli, mcp
```

Aggiungere le regole a `.dependency-cruiser.cjs`:

- `cli` e `mcp` non possono importare direttamente `analyses` o `stats`;
- `engine` non può importare `ui`, `components`, `hooks` o `electron`;
- nessun ciclo;
- nessun import di `react`, `react-dom` o `electron` dentro `engine`.

### 4.3 Perché un engine separato

Oggi `runners.ts` è già puro e testato in Node, ma è mescolato al codice applicativo. L’engine:

- rende esplicito il contratto;
- impedisce che la CLI dipenda da dettagli UI;
- permette a CLI e MCP di condividere loader, parametri, errori e renderer;
- evita che il server MCP lanci un processo CLI per ogni richiesta.

---

## 5. Contratto dell’engine

### 5.1 Esecuzione

```ts
type RunAnalysisInput = {
  analysisId: string;
  grid: Dataset;
  params: ProjectParams;
  ciLevel: 90 | 95 | 99;
  reportLocale?: Locale;
  chartDefaults?: ChartDefaults;
  chartStyles?: ChartStylePatches;
  signal?: AbortSignal;
  timeoutMs?: number;
};

type RunAnalysisOutput = {
  result: AnalysisRunResult;
  elapsedMs: number;
};
```

L’engine chiama il runner con:

```ts
withChartStyles(chartStyles, () =>
  withChartDefaults(chartDefaults, () =>
    withReportLocale(reportLocale ?? 'it', () =>
      runner({ grid, params, ciLevel })
    )
  )
);
```

`AnalysisRunResult` resta il contratto esistente:

- `ok: true` con `title`, `tables`, `report`, `charts`, `panels`, `warnings`, `callout`;
- `ok: false` con `reason`.

### 5.2 Catalogo

`catalog.ts` deve derivare i metadati da:

- `ANALYSIS_RUNNERS` per l’elenco eseguibile;
- `ANALYSIS_ALL`, `ANALYSIS_TABS`, `analysisMeta` per label, famiglia, descrizione, costo;
- `analysisParamsKey` e `analysisParamsOf` per la fetta di `ProjectParams`;
- `HEAVY_ANALYSIS_IDS` per il dispatch ai worker.

Nessun elenco di procedure va copiato nella CLI.

### 5.3 Errori

Ogni errore deve avere un codice stabile:

| Codice | Significato | Exit code |
|---|---|---:|
| `E_ARGS` | argomenti mancanti o incompatibili | 2 |
| `E_ANALYSIS` | analisi sconosciuta o non eseguibile | 2 |
| `E_PARAMS` | parametri non validi | 2 |
| `E_DATA` | file illeggibile, formato non supportato, limiti superati | 3 |
| `E_RUN` | rifiuto statistico del runner (`ok:false`); il messaggio esatto è preservato | 2 |
| `E_INTERNAL` | eccezione non gestita | 4 |
| `E_TIMEOUT` | timeout o annullamento | 5 |

In `--json` gli errori devono essere un oggetto serializzabile; lo stack trace appare solo con `--verbose`.

---

## 6. Comandi

### 6.1 `lazstats analyses`

Elenca i runner disponibili. Senza `--all` mostra le 71 procedure statistiche visibili; con `--all` aggiunge il wizard legacy e arriva a 72.

```bash
lazstats analyses
lazstats analyses --json
lazstats analyses --family regression
lazstats analyses --all
```

Opzioni:

- `--json`: output macchina;
- `--family <id>`: filtra per famiglia;
- `--all`: include `wizard`;
- `--verbose`: mostra parametri obbligatori e costo.

Output umano:

```text
descriptive       Descriptive            descriptive   instant
ttest             T-Test                 compare       instant
cox               Cox (PH)               survival      heavy
...
```

`assistant` non compare: non è eseguibile.

### 6.2 `lazstats schema <analysisId>`

Mostra il contratto dei parametri.

```bash
lazstats schema ttest
lazstats schema regression --json
```

Deve includere:

- id, label, famiglia, descrizione;
- `paramsKey` (per esempio `ttest` o `reg`);
- default della fetta;
- campi modificabili;
- ruoli colonna attesi (`dep`, `indeps`, `group`, ...);
- esempio minimo di `--set`;
- se l’analisi è `heavy`.

Il catalogo dei ruoli non esiste ancora come dato machine-readable: va aggiunto in `src/engine/schema.ts` come tabella esplicita, riusando i messaggi e le validazioni di `validateAnalysisColumnRefs`.

### 6.3 `lazstats inspect <file>`

Ispeziona un dataset senza eseguire analisi.

```bash
lazstats inspect samples/descriptive/iris/data.csv
lazstats inspect dati.xlsx --sheet Data
lazstats inspect dati.sav --json
```

Output:

- formato rilevato;
- righe e colonne;
- nome, tipo, label, missing, livelli e riferimento per colonna;
- prime N righe (default 5);
- hash del file;
- eventuali righe/colonne scartate.

Opzioni:

- `--sheet <nome|indice>`;
- `--delimiter auto|,|;|\t|pipe`;
- `--header` / `--no-header`;
- `--decimal-comma`;
- `--types "Name:num,Group:cat"`;
- `--missing "Name=-9,NA"`;
- `--max-rows <n>`;
- `--rows <n>` per l’anteprima;
- `--json`.

### 6.4 `lazstats run`

Esegue una procedura su un dataset o un progetto.

```bash
lazstats run \
  --data samples/compare/plantgrowth/data.csv \
  --analysis anova \
  --set anova.dep=weight \
  --set anova.grp=group \
  --ci 95
```

```bash
lazstats run \
  --project studio.lzs \
  --analysis descriptive \
  --format html \
  --out report.html
```

Opzioni principali:

- `--data <file>` oppure `--project <file.lzs>`, mutuamente esclusivi;
- `--analysis <id>` obbligatorio con `--data`; con `--project` può ereditare `settings.activeAnalysis` se è un runner valido;
- `--params <json>` oppure `--params-file <file>`;
- `--set <slice.key=value>` ripetibile;
- `--ci 90|95|99` (default 95);
- `--report-locale <locale>` (default `it`);
- `--format json|md|html|xlsx|svg` (default `json`);
- `--out <path>`: file o directory;
- `--charts none|svg` (default `svg` per HTML, `none` per JSON);
- `--include-data` per includere i dati nell’envelope;
- `--diagnostics none|summary|full` per il dettaglio della diagnostica dei rifiuti (default `summary`);
- `--include-row-numbers` per aggiungere un campione di numeri di riga problematici (mai i valori);
- `--timings` per aggiungere i tempi;
- `--timeout <secondi>`;
- `--workers auto|0|N`;
- `--quiet`, `--verbose`.

Con `--project`:

- la griglia, i metadati delle colonne, i livelli, i missing e i parametri vengono da `parseProject`;
- `outputs` salvati non vengono rieseguiti;
- `--set` può sovrascrivere la fetta dell’analisi scelta;
- il progetto non viene mai riscritto.

### 6.5 `lazstats batch`

Esegue più job da un file JSON.

```bash
lazstats batch --jobs jobs.json --out risultati --concurrency 2
```

Formato:

```json
{
  "jobs": [
    {
      "id": "iris-descriptive",
      "data": "samples/descriptive/iris/data.csv",
      "analysis": "descriptive",
      "set": { "descVars": "Sepal.Length,Sepal.Width" },
      "ciLevel": 95
    },
    {
      "id": "plant-anova",
      "data": "samples/compare/plantgrowth/data.csv",
      "analysis": "anova",
      "set": { "anova.dep": "weight", "anova.grp": "group" }
    }
  ]
}
```

Regole:

- accetta anche un array semplice di job;
- `id` deve essere univoco e sicuro come nome file;
- `--continue-on-error` continua e produce un riepilogo;
- senza il flag, il primo errore interrompe il batch;
- ogni job scrive `result.json` e gli eventuali file nella propria directory;
- il riepilogo finale è JSON su stdout.

### 6.6 `lazstats project inspect <file.lzs>`

Mostra:

- versione del progetto;
- data di salvataggio;
- righe/colonne;
- dataset id e revisione;
- analisi attiva;
- chiavi dei parametri presenti;
- numero di output salvati;
- eventuali campi ignorati o migrati.

Non esegue analisi e non modifica il file.

### 6.7 `lazstats project run <file.lzs>`

Alias esplicito di `run --project`; utile per script.

### 6.8 `lazstats render --result <file.json>`

Rigenera report/grafici da un envelope già prodotto. Accetta solo `status:"ok"`; un envelope `rejected` o `error` produce `E_ARGS` e nessun file.

```bash
lazstats render --result iris.json --format html --out iris.html
lazstats render --result iris.json --format svg --out charts/
```

Serve a cambiare formato senza ricalcolare, e permette di ispezionare un risultato conservato.

---

## 7. Input e dataset

### 7.1 Formati

| Estensione | Loader previsto |
|---|---|
| `.csv`, `.tsv`, `.txt`, `.pipe` | `readDelimitedTable` |
| `.json` | `readJsonTable` |
| `.xlsx`, `.xls` | `readXlsxSheets` + scelta foglio |
| `.sav`, `.dta` | `readStatFile` |
| `.lzs` | `parseProject` |

Il formato può essere forzato con `--format-input`.

### 7.2 Costruzione del `Dataset`

Da `ImportTable`:

```ts
const grid: Dataset = {
  cols: table.names.map((name, i) => ({
    name,
    type: table.types[i],
    ...(table.meta?.[i]?.label ? { label: table.meta[i].label } : {}),
    ...(table.meta?.[i]?.levels ? { levels: table.meta[i].levels } : {}),
    ...(table.meta?.[i]?.missing ? { missing: table.meta[i].missing } : {}),
  })),
  rows: table.rows,
};
```

Regole:

- usare i tipi inferiti da `toImportTable`;
- rispettare `MAX_ROWS = 50000` e `MAX_COLS = 500`;
- preservare label, livelli, riferimento e missing dei file statistici;
- non introdurre un secondo parser CSV;
- per i file `.lzs` usare `parseProject` e la griglia già normalizzata;
- gli errori di parsing diventano `E_DATA` con messaggio leggibile.

### 7.3 Tipi e missing

- `--types` applica override per nome colonna, non per indice.
- `--missing` accetta codici globali o per colonna.
- I codici missing vengono conservati in `Column.missing`; i runner li trattano già tramite la semantica del Dataset.
- I livelli dichiarati non vanno inventati: se il file non li contiene, si usano i valori osservati.

---

## 8. Parametri

### 8.1 Sorgenti

In ordine di precedenza:

1. `DEFAULT_PARAMS`;
2. `--params` / `--params-file`;
3. `--set`;
4. override espliciti (`--ci`, `--report-locale`).

Il parsing usa `parseParams(value, grid.cols.length)`, che normalizza enum, indici, clamp e campi mancanti. Non va scritto un parser parallelo.

### 8.2 `--params`

Accetta:

- un oggetto `ProjectParams` completo;
- una fetta parziale, per esempio `{ "ttest": { "var1": 0, "var2": 1 } }`;
- un file `.json`.

Gli indici sono zero-based e compatibili con `.lzs`.

### 8.3 `--set`

Sintassi:

```text
--set <slice>.<field>=<valore>
```

Esempi:

```bash
--set ttest.var1=Sepal.Length
--set reg.indeps=Sepal.Length,Sepal.Width
--set anova.useNonParam=false
--set descVars=Sepal.Length,Sepal.Width
--set descVars=@0,@2
```

Regole:

- un valore stringa viene risolto prima contro i nomi delle colonne, case-insensitive;
- `@n` forza l’indice zero-based;
- un numero puro viene interpretato secondo il tipo del campo, non come indice, per evitare ambiguità;
- i campi array accettano valori separati da virgola;
- i booleani accettano `true/false`, `1/0`, `yes/no`;
- un nome di colonna inesistente produce `E_PARAMS` con l'elenco dei nomi disponibili;
- `--set` va applicato dopo `parseParams`, così i default e i clamp sono già noti.

Per `descriptive`, il campo speciale è `descVars` (array) più `descMode`; per le altre analisi si usa la chiave restituita da `analysisParamsKey`.

### 8.4 Validazione

Prima del run:

1. verificare che l’analisi esista in `ANALYSIS_RUNNERS`;
2. chiamare `validateAnalysisColumnRefs(id, params, width)`;
3. se ci sono errori, restituire `E_PARAMS`;
4. eseguire il runner;
5. se il runner restituisce `ok:false`, restituire `E_RUN` con il motivo.

I messaggi dei runner sono già pensati per l’utente e non vanno riscritti nella CLI.

### 8.5 Rifiuto: semantica completa ed esatta

#### 8.5.1 Definizione

Un **rifiuto** è un esito tipizzato, non un'eccezione e non un run-report vuoto. Significa che la richiesta è stata letta e validata, ma il motore non può produrre un run-report statisticamente valido. Un rifiuto:

- non produce tabelle, report, grafici o panel;
- non produce un `result` con `ok:true`;
- non viene ritentato automaticamente;
- non attiva fallback su un'altra analisi o su parametri diversi;
- conserva il motivo esatto restituito dal runner;
- è distinguibile da un errore di lettura, da un errore di parametri e da un errore interno.

Un **warning**, invece, è un problema non bloccante: il run-report viene prodotto con `ok:true` e `warnings` popolato. Un warning non è un rifiuto.

#### 8.5.2 Ordine di valutazione

Gli stage sono valutati in quest'ordine. Il primo fallimento interrompe la richiesta: non si prosegue e non si produce un risultato parziale.

| Ordine | Stage | Esempi | Codice | Exit | Run-report |
|---:|---|---|---|---:|---|
| 1 | `args` | `--data` e `--project` insieme; `--analysis` mancante con `--data`; `--ci` non valido | `E_ARGS` | 2 | no |
| 2 | `analysis` | id sconosciuto; `assistant`; runner non disponibile | `E_ANALYSIS` | 2 | no |
| 3 | `load` | file assente; formato errato; foglio mancante; limiti superati; `.lzs` corrotto | `E_DATA` | 3 | no |
| 4 | `params` | JSON malformato; valore fuori dominio; nome colonna inesistente o ambiguo | `E_PARAMS` | 2 | no |
| 5 | `preflight` | indice colonna fuori intervallo; colonna obbligatoria non selezionata | `E_PARAMS` | 2 | no |
| 6 | `execute` | runner che restituisce `ok:false` | `E_RUN` | 2 | no |
| 7 | `render` | envelope non `ok`; grafico richiesto ma assente | `E_ARGS` o `E_RUN` | 2 | no |
| — | eccezione non gestita | bug, errore di memoria, errore imprevisto | `E_INTERNAL` | 4 | no |
| — | timeout/annullamento | timeout del run o annullamento del worker | `E_TIMEOUT` | 5 | no |

La distinzione importante è questa:

- `E_DATA` significa che **non è stato possibile costruire un dataset valido**;
- `E_PARAMS` significa che **il dataset è valido ma la richiesta non lo è**;
- `E_RUN` significa che **dataset e parametri sono formalmente validi, ma la procedura rifiuta di produrre un risultato** per un motivo statistico o di dominio;
- `E_INTERNAL` è un bug o un guasto, non un rifiuto statistico.

`E_RUN` usa l'exit code 2, non 3, perché l'input è stato letto correttamente: è la procedura che rifiuta di produrre un run-report. Questa distinzione permette a uno script di separare un file illeggibile da un'analisi non applicabile.

#### 8.5.3 Forma esatta del rifiuto

In `--json`, un rifiuto ha questa forma:

```json
{
  "schemaVersion": 1,
  "status": "rejected",
  "engine": {
    "name": "lazstats",
    "version": "0.32.0",
    "runners": 72,
    "chartKinds": 32
  },
  "analysis": {
    "id": "logistic",
    "label": "Logistic Regression",
    "family": "regression"
  },
  "input": {
    "source": "dati.csv",
    "format": "csv",
    "sha256": "...",
    "rows": 120,
    "columns": 6
  },
  "params": {},
  "error": {
    "code": "E_RUN",
    "kind": "invalid_binary",
    "stage": "execute",
    "message": "The outcome needs exactly two distinct values (for example 0/1 or yes/no)",
    "details": {
      "analysisId": "logistic",
      "column": "outcome",
      "levels": 3
    },
    "retryable": false,
    "hint": "Use a binary outcome or a different analysis."
  },
  "result": {
    "ok": false,
    "reason": "The outcome needs exactly two distinct values (for example 0/1 or yes/no)"
  },
  "warnings": [],
  "artifacts": []
}
```

Regole vincolanti:

1. `status` è `ok`, `rejected` o `error`:
   - `ok`: esiste un run-report completo;
   - `rejected`: la richiesta è valida, ma `E_PARAMS` o `E_RUN` impediscono il run-report;
   - `error`: `E_ARGS`, `E_ANALYSIS`, `E_DATA`, `E_INTERNAL` o `E_TIMEOUT`.
2. Per `E_RUN`, `error.message` è **identico** a `result.reason`: nessun prefisso, suffisso, traduzione o riscrittura.
3. `result` è presente solo se il runner è stato eseguito e ha restituito `ok:false`.
4. `warnings` è sempre un array; in un rifiuto è vuoto salvo warning prodotti prima del rifiuto, che vanno comunque riportati senza trasformarli in errore.
5. `artifacts` è sempre `[]`: nessun file di tabella, report o grafico viene creato.
6. `details` contiene solo valori deterministici noti al motore: nomi di colonna, conteggi, livelli, parametri. Non contiene celle, token o segreti.
7. `hint` è un suggerimento aggiuntivo e non sostituisce `message`.
8. `retryable` è `false` per un rifiuto statistico: ripetere la stessa richiesta senza cambiare dati o parametri produce lo stesso esito.

Per brevità, gli esempi di §8.5.3 e §8.5.5 omettono il blocco `diagnostics`, definito in §8.5.8; il contratto completo di un rifiuto lo include.

#### 8.5.4 Classificazione dei rifiuti statistici

`kind` è una classificazione **aggiuntiva** rispetto al messaggio. Non sostituisce mai il `reason` del runner. Se il motore non può classificare il rifiuto in modo deterministico, usa `other`; non indovina.

| `kind` | Condizione tipica | Esempio di `details` |
|---|---|---|
| `not_enough_rows` | il dataset ha meno righe del minimo della procedura | `required`, `observed` |
| `not_enough_complete_cases` | dopo la rimozione dei missing restano troppo poche righe | `required`, `observed`, `columns`, `missing` |
| `empty_dataset` | nessuna riga utile | `rows: 0` |
| `missing_required_column` | una colonna richiesta non è presente o non è selezionata | `column`, `parameter` |
| `invalid_column_type` | la colonna non è numerica, categorica o binaria come richiesto | `column`, `expectedType`, `actualType` |
| `same_column_conflict` | la stessa colonna è usata in due ruoli incompatibili | `column`, `roles` |
| `not_enough_groups` | il gruppo ha meno livelli del minimo | `required`, `observed` |
| `empty_group` | un gruppo non ha osservazioni valide | `groups`, `emptyGroups` |
| `invalid_binary` | outcome/evento non ha esattamente due valori | `column`, `levels` |
| `insufficient_levels` | una categorica ha troppi/pochi livelli per la procedura | `column`, `required`, `observed` |
| `constant_variable` | una variabile selezionata ha varianza nulla | `columns` |
| `collinearity` | la matrice di disegno è singolare o quasi singolare | `columns` |
| `domain_violation` | tempi negativi, valori non positivi, probabilità fuori dominio | `column`, `rule` |
| `too_few_events` | gli eventi di sopravvivenza sono insufficienti | `required`, `observed` |
| `no_convergence` | l'ottimizzatore non converge | `iterations`, `tolerance` |
| `unsupported_configuration` | combinazione di opzioni non supportata | `parameter`, `value` |
| `other` | rifiuto non classificabile con certezza | `rawReason` |

Per `E_PARAMS`, `kind` ammette:

| `kind` | Condizione |
|---|---|
| `missing_parameter` | manca una selezione obbligatoria |
| `unknown_parameter` | `--set` usa una chiave inesistente |
| `column_not_found` | il nome di colonna non esiste |
| `ambiguous_column` | il nome corrisponde a più colonne |
| `column_out_of_range` | l'indice è minore di 0 o maggiore della larghezza |
| `invalid_value` | valore fuori dominio o non convertibile |
| `invalid_json` | `--params` non è JSON valido |
| `incompatible_columns` | la stessa colonna è usata in ruoli incompatibili già in preflight |
| `invalid_ci` | livello di confidenza diverso da 90/95/99 |

Per `E_DATA`, `kind` ammette:

| `kind` | Condizione |
|---|---|
| `file_not_found` | path inesistente |
| `unsupported_format` | estensione o formato non supportato |
| `parse_error` | file non parsabile o righe incoerenti |
| `missing_sheet` | foglio XLSX richiesto assente |
| `limit_exceeded` | righe, colonne, byte o celle oltre il limite |
| `empty_file` | nessuna riga o nessuna colonna utile |
| `invalid_project` | `.lzs` non valido o incompatibile |
| `type_conversion_error` | un override di tipo non è applicabile |

La classificazione non deve essere dedotta da una traduzione o da una regex fragile sul messaggio. Se il runner non fornisce un codice strutturato, il motore usa `other` e conserva il messaggio originale. Una classificazione sbagliata è peggio di `other`.

#### 8.5.5 Esempi di rifiuto

Dati insufficienti dopo i missing:

```json
{
  "status": "rejected",
  "error": {
    "code": "E_RUN",
    "kind": "not_enough_complete_cases",
    "stage": "execute",
    "message": "Not enough complete rows: the outcome and all predictors must be numeric and present",
    "details": {
      "analysisId": "logistic",
      "required": 3,
      "observed": 2,
      "columns": ["outcome", "predictor"],
      "missing": { "outcome": 1, "predictor": 2 }
    },
    "retryable": false
  },
  "result": {
    "ok": false,
    "reason": "Not enough complete rows: the outcome and all predictors must be numeric and present"
  },
  "artifacts": []
}
```

Parametro di colonna fuori intervallo, già in preflight:

```json
{
  "status": "rejected",
  "error": {
    "code": "E_PARAMS",
    "kind": "column_out_of_range",
    "stage": "preflight",
    "message": "Regression: predictors",
    "details": {
      "parameter": "reg.indeps",
      "index": 8,
      "columns": 5
    },
    "retryable": false
  },
  "artifacts": []
}
```

In questo secondo caso `result` è assente: il runner non è mai stato eseguito.

#### 8.5.6 Comportamento su file e batch

- Con `--format json` e senza `--out`, l'envelope di rifiuto va su stdout e non viene scritto nulla su disco.
- Con `--out <file>` e rifiuto, si scrive `<file>.failure.json` e **non** si crea il file di risultato richiesto.
- Con `--out <directory>` e rifiuto, si scrive `<directory>/failure.json`.
- Con `--format html`, `md`, `xlsx` o `svg` e rifiuto, non si crea alcun artefatto del formato richiesto; vale solo l'envelope di fallimento.
- Nel batch, ogni job fallito scrive `failure.json` nella propria directory e non scrive `result.json`.
- Il riepilogo del batch contiene `status`, `error.code`, `error.kind` e `error.message` per ogni job.
- Senza `--continue-on-error`, il primo rifiuto interrompe il batch e l'exit code è quello del rifiuto.
- Con `--continue-on-error`, il batch prosegue e l'exit code finale è determinato dalla precedenza: `E_INTERNAL` (4) > `E_TIMEOUT` (5) > `E_DATA` (3) > `E_ARGS`/`E_ANALYSIS`/`E_PARAMS`/`E_RUN` (2) > successo (0).

#### 8.5.7 `render` e risultati conservati

`lazstats render --result` accetta solo un envelope con `status:"ok"`. Se l'envelope è `rejected` o `error`, il comando restituisce `E_ARGS` e non crea file. In particolare:

- non tenta di ricostruire un risultato mancante;
- non ignora le tabelle assenti;
- non renderizza un grafico parziale;
- conserva il riferimento al `failure` originale nel messaggio.

#### 8.5.8 Diagnostica dettagliata del dataset

Il rifiuto può e deve essere più dettagliato del solo `reason`. La diagnostica è un blocco **additivo** rispetto a `error`: non cambia il codice, non cambia il messaggio esatto e non trasforma il rifiuto in un risultato. Serve a rispondere a tre domande:

1. che cosa, esattamente, non va nel dataset?
2. quante righe e colonne sono coinvolte?
3. che cosa può fare l'utente o l'agente per correggere l'input?

La diagnostica viene calcolata dal motore sul dataset e sulle colonne selezionate, prima o durante il run. Non viene inventata dalla CLI e non viene dedotta dal testo del messaggio. È un blocco dei rifiuti e degli errori: non viene emessa per un run con `status:"ok"`.

##### Livelli

- `--diagnostics none`: nessun blocco `diagnostics`.
- `--diagnostics summary` (default): conteggi aggregati, `checks` falliti, `problems` e `suggestions`; niente distribuzioni complete.
- `--diagnostics full`: aggiunge il profilo per colonna, i livelli osservati e i dettagli dei controlli; resta soggetto al limite di 64 KB.

##### Forma

```json
{
  "diagnostics": {
    "schemaVersion": 1,
    "level": "full",
    "dataset": {
      "rowsTotal": 120,
      "rowsUsed": 120,
      "completeCases": 118,
      "requiredColumns": 3,
      "droppedRows": 2,
      "dropReasons": {
        "missing": 2,
        "type": 0,
        "empty": 0,
        "outOfRange": 0
      },
      "duplicateColumns": [],
      "parseWarnings": 0
    },
    "columns": [
      {
        "name": "outcome",
        "index": 0,
        "role": "outcome",
        "type": "cat",
        "total": 120,
        "valid": 119,
        "missing": 1,
        "distinct": 3,
        "constant": false,
        "levels": [
          { "value": "low", "n": 40 },
          { "value": "mid", "n": 41 },
          { "value": "high", "n": 38 }
        ]
      },
      {
        "name": "predictor",
        "index": 1,
        "role": "predictor",
        "type": "num",
        "total": 120,
        "valid": 118,
        "missing": 2,
        "distinct": 87,
        "min": 1.2,
        "max": 9.8,
        "constant": false
      }
    ],
    "checks": [
      {
        "id": "outcome.binary",
        "status": "failed",
        "severity": "error",
        "message": "The outcome needs exactly two distinct values (for example 0/1 or yes/no)",
        "details": { "observed": 3, "required": 2 }
      },
      {
        "id": "analysis.complete_cases",
        "status": "failed",
        "severity": "error",
        "message": "Not enough complete rows: the outcome and all predictors must be numeric and present",
        "details": { "observed": 118, "required": 120 }
      }
    ],
    "problems": [
      {
        "kind": "invalid_binary",
        "columns": ["outcome"],
        "observed": 3,
        "required": 2
      }
    ],
    "suggestions": [
      {
        "action": "select_binary_outcome",
        "message": "Choose a binary outcome or use multinomial regression."
      }
    ],
    "rowNumbers": [],
    "truncated": false
  }
}
```

##### Contenuto minimo obbligatorio

Anche con `--diagnostics summary`, un rifiuto deve riportare:

- `dataset.rowsTotal`, `rowsUsed`, `completeCases`, `requiredColumns`;
- `dropReasons` con i conteggi di righe perse per missing, tipo, vuote e fuori dominio;
- i `checks` falliti con `id`, `status`, `severity`, `message` e `details`;
- i `problems` normalizzati, con `kind`, colonne coinvolte e, se applicabile, `observed`/`required`/`deficit`;
- le `suggestions` correttive, senza applicarle automaticamente;
- `truncated` per indicare se il blocco è stato tagliato.

Campi per colonna, disponibili in `full`:

- `name`, `index`, `role`, `type`;
- `total`, `valid`, `missing`, `distinct`;
- `min`, `max` per le numeriche;
- `levels` con valore e conteggio per le categoriche;
- `constant`, `nonFinite`, `negative`, `zero` quando pertinenti.

Campi per il dataset, disponibili in `full`:

- `groups`: colonna, livelli, numerosità per gruppo, gruppi vuoti o singleton;
- `outcome`: valori distinti, conteggi per classe, classe minoritaria;
- `survival`: eventi, censurati, tempi negativi, tempi zero;
- `design`: righe, parametri, rango, numero di condizione, colonne costanti o aliasate.

##### Check diagnostici

Gli identificatori dei check sono stabili e documentati:

| Check | Che cosa verifica |
|---|---|
| `input.parse` | errori di parsing, righe malformate, encoding, delimitatore |
| `input.rows` | righe totali e righe utilizzabili |
| `input.columns` | colonne mancanti, duplicate, senza nome |
| `input.types` | tipo dichiarato o inferito e conversione |
| `columns.missing` | missing per colonna e pattern di incompletezza |
| `columns.constant` | varianza nulla |
| `columns.domain` | valori negativi, non finiti, fuori dominio |
| `analysis.min_rows` | numerosità minima della procedura |
| `analysis.complete_cases` | righe complete rispetto alle colonne richieste |
| `analysis.groups` | numero di gruppi, gruppi vuoti, singleton |
| `analysis.outcome` | numero e distribuzione delle classi |
| `analysis.events` | eventi e censure per la sopravvivenza |
| `analysis.design` | rango, collinearità, colonne costanti |
| `runner.precondition` | precondizione specifica del runner |

Ogni check ha `status` `passed`, `failed` o `skipped` e `severity` `info`, `warning` o `error`. Un check `skipped` non è un fallimento: indica che il controllo non è applicabile a quella procedura.

##### Integrazione con il rifiuto

`diagnostics` è un campo fratello di `error`, non un sostituto:

```json
{
  "status": "rejected",
  "error": {
    "code": "E_RUN",
    "kind": "invalid_binary",
    "stage": "execute",
    "message": "The outcome needs exactly two distinct values (for example 0/1 or yes/no)",
    "details": { "column": "outcome", "levels": 3 },
    "retryable": false
  },
  "diagnostics": {
    "schemaVersion": 1,
    "level": "summary",
    "dataset": { "rowsTotal": 120, "rowsUsed": 120, "completeCases": 118, "requiredColumns": 3 },
    "checks": [],
    "problems": [],
    "suggestions": [],
    "truncated": false
  },
  "result": { "ok": false, "reason": "The outcome needs exactly two distinct values (for example 0/1 or yes/no)" },
  "artifacts": []
}
```

Regole:

- `error.message` resta identico a `result.reason`; la diagnostica non lo sostituisce.
- `error.details` è il riassunto della causa; `diagnostics` è l'evidenza completa.
- La diagnostica non contiene celle, righe di dati, nomi di persone o valori liberi; i livelli categorici sono aggregati e disponibili solo con `full`.
- `rowNumbers` è vuoto salvo `--include-row-numbers`; contiene al massimo 20 numeri di riga, mai i valori.
- Se il blocco supera 64 KB, viene troncato e `truncated` diventa `true`; i check falliti e i conteggi principali restano sempre presenti.
- La diagnostica non è un'istruzione di correzione automatica: le `suggestions` vanno mostrate, non applicate senza consenso.

##### Diagnostica per `E_DATA` e `E_PARAMS`

- Per `E_DATA`, `dataset` contiene i conteggi parziali disponibili, `checks` include `input.parse` o `input.columns`, e `problems` riporta errori di parsing, limiti o colonne duplicate.
- Per `E_PARAMS`, `columns` mostra solo le colonne selezionate e `problems` riporta indici fuori intervallo, nomi ambigui o selezioni mancanti.
- Se il dataset non è stato caricato, `diagnostics` contiene solo `schemaVersion`, `level`, `dataset` con `rowsTotal: 0` e il check di caricamento fallito; non vengono inventati profili di colonna.

#### 8.5.9 Regola per l'Agente

Se l'agente che invoca la CLI riceve un rifiuto, deve:

1. leggere `error.code`, `error.kind`, `error.message` e `diagnostics`;
2. non presentare il rifiuto come un output statistico;
3. non riprovare automaticamente la stessa richiesta;
4. correggere dati o parametri e rifare il run solo se il `kind` o le `suggestions` indicano un'azione correggibile;
5. riportare il `message` esatto all'utente, senza inventare una spiegazione alternativa;
6. usare `diagnostics.checks` e `diagnostics.problems` per spiegare quali colonne o righe sono coinvolte, senza esporre valori delle celle.

---

## 9. Output

### 9.1 Envelope JSON

Forma proposta:

```json
{
  "schemaVersion": 1,
  "status": "ok",
  "engine": {
    "name": "lazstats",
    "version": "0.32.0",
    "runners": 72,
    "chartKinds": 32
  },
  "analysis": {
    "id": "descriptive",
    "label": "Descriptive",
    "family": "descriptive"
  },
  "input": {
    "source": "samples/descriptive/iris/data.csv",
    "format": "csv",
    "sha256": "...",
    "rows": 150,
    "columns": 5
  },
  "params": { "descVars": [0, 1], "descMode": "summary" },
  "ciLevel": 95,
  "reportLocale": "it",
  "result": {
    "ok": true,
    "title": "Descriptive",
    "tables": [],
    "report": null,
    "charts": [],
    "warnings": []
  }
}
```

Regole:

- `schemaVersion` è indipendente da `PROJECT_VERSION`;
- niente timestamp di default; `--timestamps` aggiunge `generatedAt`;
- niente dati completi di default; `--include-data` li aggiunge;
- `sha256` del file o del JSON inline rende riproducibile l’input;
- `status` è `ok` solo in presenza di un run-report completo; `rejected` ed `error` seguono §8.5;
- `diagnostics` è presente nei rifiuti e negli errori; non viene emesso per `status:"ok"`; la sua assenza non è mai l'unica spiegazione di un rifiuto;
- `result` è esattamente `AnalysisRunResult`, senza transformazioni lossy;
- gli errori hanno `{ "error": { "code", "kind", "stage", "message", "details?", "retryable", "hint?" } }`;
- in `rejected`/`error` non esistono tabelle, report o grafici: `artifacts` è vuoto.

### 9.2 JSON su stdout

- Con `--format json` e senza `--out`, l’envelope va su stdout e nient’altro.
- Log, progresso e warning diagnostici vanno su stderr.
- Con `--out file.json`, l’envelope va nel file e stdout resta vuoto (salvo `--quiet=false`).
- Con errori in `--json`, l’envelope di fallimento va su stdout e l’exit code è coerente; non viene prodotto alcun output parziale.
- Con `--out` e fallimento, il file di risultato non viene creato; si applica la regola `<out>.failure.json` di §8.5.6.

### 9.3 Markdown

- una sezione per titolo/header;
- una tabella Markdown per ogni `TableSpec`;
- report come sezioni, bullet e limitazioni;
- grafici omessi o elencati con il nome del file SVG;
- niente HTML nell’output Markdown.

### 9.4 HTML

Documento self-contained:

- CSS di stampa riusato da `buildReportDocument`;
- tabelle HTML generate da `TableSpec`;
- report renderizzato da `ReportSpec`;
- SVG inline generati da `buildVegaSpec`;
- nessun React, nessun DOM, nessun `vega-embed`;
- nessuna risorsa remota.

### 9.5 XLSX

- un foglio per tabella;
- foglio `Info` con analisi, input, CI e versione;
- nomi foglio deduplicati e limitati;
- usa `writeWorkbook` di `src/io/xlsx.ts` o un suo estratto puro;
- il foglio dati non viene esportato di default, salvo `--include-data-sheet`.

### 9.6 SVG

Per ogni `AnalysisChart`:

```ts
const spec = compile(buildVegaSpec(chart)).spec;
const svg = await new View(parse(spec), { renderer: 'none' }).toSVG();
```

Regole:

- un file per grafico;
- per i `PanelChart`, un file per child;
- nomi file: `<run>-<chart-id>.svg`, sanitizzati;
- `--charts none` disabilita la generazione;
- nessun PNG nella prima versione;
- i font sono quelli di sistema; il documento HTML dichiara una font-family esplicita;
- il rendering avviene solo nel processo CLI, non nel server MCP se non richiesto;
- se il run è `rejected` o `error`, il renderer non viene eseguito e non crea SVG.

### 9.7 Exit code

| Exit | Significato |
|---:|---|
| 0 | successo |
| 2 | errore di argomenti, parametri o rifiuto statistico |
| 3 | errore di lettura/validazione dati |
| 4 | errore interno |
| 5 | timeout o annullamento |

---

## 10. Prestazioni

### 10.1 Worker

- Usare `HEAVY_ANALYSIS_IDS` come unica lista.
- Le analisi heavy vengono eseguite in `worker_threads`.
- Le analisi instant possono restare nel thread principale.
- Il worker riceve `grid`, `params`, `ciLevel`, `reportLocale`, chart defaults/styles.
- Il risultato è lo stesso `AnalysisRunResult`.
- Annullamento: terminare il worker; i kernel sono sincroni e non hanno punti di interruzione sicuri.
- Timeout: default 120 secondi, configurabile.

### 10.2 Batch

- `--concurrency` default 2.
- Ogni job heavy usa il pool; i job instant possono essere eseguiti in sequenza.
- Coda massima configurabile.
- Ogni job ha un timeout indipendente.
- Il batch produce un riepilogo con stato, durata, exit code e path degli output.

### 10.3 Limiti

- massimo 50.000 righe e 500 colonne, come i reader esistenti;
- massimo 25 MB per SPSS/Stata;
- massimo 100 MB per input testuale, con errore esplicito oltre;
- massimo 24 grafici per output, come il contratto esistente;
- nessuna crescita illimitata della cache.

---

## 11. Sicurezza

- Nessuna rete.
- Nessuna esecuzione di comandi di sistema.
- Nessun `eval` o funzione dinamica.
- Path risolti e verificati; niente path traversal involontario.
- Il comando non modifica i file di input.
- Gli output richiedono un path esplicito; nessuna scrittura implicita nella directory corrente.
- I file `.lzs` sono trattati come input non fidato e passano da `parseProject`.
- I messaggi di errore non includono contenuto delle celle, token o segreti.
- Il rendering SVG non carica URL remoti.
- Le dipendenze native sono opzionali e non necessarie per il percorso principale.

---

## 12. Build e distribuzione

### 12.1 Entry point

`src/cli/main.ts`:

```ts
#!/usr/bin/env node
import { runCli } from './run';
await runCli(process.argv.slice(2));
```

### 12.2 Bundle

Aggiungere `scripts/build-cli.mjs` con esbuild:

- `bundle: true`;
- `platform: 'node'`;
- `format: 'esm'`;
- `target: 'node22'`;
- `outfile: 'dist-cli/lazstats.mjs'`;
- banner con shebang;
- `external`: solo dipendenze con WASM o binari non bundlabili, da verificare (`@irbisadm/statfmt`).

Non usare Vite e non includere Electron.

### 12.3 `package.json`

Aggiungere:

```json
{
  "bin": {
    "lazstats": "dist-cli/lazstats.mjs"
  },
  "scripts": {
    "build:cli": "node scripts/build-cli.mjs",
    "cli": "node --import tsx src/cli/main.ts",
    "test:cli": "node --import tsx --test \"src/cli/**/*.test.ts\""
  }
}
```

Il package resta `private: true` finché non si decide una pubblicazione separata. Per l’uso locale:

```bash
npm run build:cli
npm link
lazstats --help
```

### 12.4 Dipendenze

Nessuna nuova dipendenza per il core CLI: `node:util.parseArgs`, `node:fs`, `node:crypto`, `node:worker_threads`, `vega`, `vega-lite`, `xlsx`, `jstat` sono già disponibili.

`@irbisadm/statfmt` resta opzionale per SPSS/Stata; se non è bundlabile, va esternalizzato e dichiarato come dipendenza.

---

## 13. Test

### 13.1 Unit

- `catalog`: 72 runner totali, 71 visibili di default, `assistant` escluso, `wizard` incluso con `--all`.
- `params`: default, parse, `--set`, mapping nomi→indici, `@indice`, errori.
- `dataset`: CSV, TSV, JSON, XLSX, `.lzs`, tipi, missing, livelli.
- `result`: envelope `ok`/`rejected`/`error`, status, hash, assenza timestamp, `ok:false`, messaggio esatto, `details`, `artifacts` vuoti.
- `diagnostics`: profilo dataset, check falliti, problemi, suggerimenti, `truncated`, assenza di celle e valori liberi.
- `render`: tabella, report, HTML, XLSX, SVG.
- `errors`: codice → exit code.

### 13.2 Golden

- una fixture per famiglia (12 famiglie);
- tutte le 72 runner coperte dal contratto `ANALYSIS_RUNNERS` e dai test esistenti;
- output JSON senza timings/timestamp;
- confronto numerico con tolleranza, non stringa HTML;
- SVG validato come XML e non vuoto.

### 13.3 CLI spawn

Testare il binario costruito con `spawnSync`/`spawn`:

```bash
node dist-cli/lazstats.mjs analyses --json
node dist-cli/lazstats.mjs run --data samples/descriptive/iris/data.csv --analysis descriptive --set descVars=Sepal.Length,Sepal.Width --format json
node dist-cli/lazstats.mjs run --data samples/compare/plantgrowth/data.csv --analysis anova --set anova.dep=weight --set anova.grp=group --format html --out /tmp/report.html
```

Verificare:

- exit code;
- stdout solo JSON quando richiesto;
- stderr per gli errori;
- file prodotti;
- nessun file inatteso;
- rifiuto con `--out`: creazione di `failure.json`, nessun file di risultato e nessun grafico;
- esecuzione da directory diverse.

### 13.4 Batch e worker

- batch di 2–3 job con un successo e un errore;
- `--continue-on-error`;
- `--concurrency 1` vs `2`;
- timeout;
- annullamento;
- nessun deadlock del worker pool.

### 13.5 Comandi di verifica

```bash
npm run lint
npm test
npm run build:cli
npm run test:cli
npm run check
```

Il gate finale deve includere `build:cli` e almeno uno smoke test del binario.

---

## 14. Fasi di implementazione

### Fase 0 — Engine skeleton

- creare `src/engine/`;
- catalog, params, dataset, errors, result;
- test unitari;
- nessuna modifica ai runner.

**Gate:** import in Node, 72 runner, `descriptive` su iris, test verdi.

### Fase 1 — CLI MVP

- `analyses`, `schema`, `inspect`, `run` JSON;
- parsing argomenti;
- output envelope;
- exit code.

**Gate:** esecuzione di almeno una procedura per famiglia; JSON stabile.

### Fase 2 — Output

- Markdown, HTML, XLSX, SVG;
- report e tabelle;
- `render`;
- test di formato.

**Gate:** HTML apribile, SVG valido, XLSX leggibile, nessun DOM.

### Fase 3 — Batch e worker

- `batch`;
- pool heavy;
- timeout/cancellazione;
- `--concurrency`;
- misure di performance.

**Gate:** batch misto, worker, nessun blocco; tempi documentati.

### Fase 4 — Hardening e packaging

- build esbuild, `bin`, `npm link`;
- documentazione;
- cross-platform;
- guardrail dependency-cruiser;
- CI.

**Gate:** `npm run check`, `build:cli`, `test:cli` verdi su Linux/macOS/Windows.

---

## 15. Criteri di accettazione

1. `lazstats analyses --json` elenca 71 procedure visibili; `lazstats analyses --all --json` elenca 72 runner.
2. `lazstats schema` mostra la fetta corretta di `ProjectParams`.
3. `lazstats run` esegue tutte le 72 runner su input compatibili.
4. `inspect` riporta tipi, livelli, missing e hash.
5. `--set` risolve i nomi delle colonne e rifiuta quelli ambigui.
6. JSON, Markdown, HTML, XLSX e SVG sono prodotti senza DOM.
7. Gli errori hanno codici e exit code coerenti.
8. Le analisi heavy non bloccano il processo principale.
9. Il batch rispetta concorrenza, timeout e connessioni.
10. Nessun segreto, rete o comando di sistema.
11. `npm run check` e `npm run build:cli` verdi.
12. Un rifiuto conserva in `error.message` e `result.reason` la stringa esatta del runner.
13. Un rifiuto non produce tabelle, report, grafici o file di risultato; `artifacts` è vuoto.
14. Un rifiuto è distinguibile da `E_DATA`, `E_PARAMS`, `E_INTERNAL` e `E_TIMEOUT` tramite codice, `kind` e stage.
15. Il batch riporta ogni rifiuto nel riepilogo e applica la precedenza degli exit code di §8.5.6.
16. Un rifiuto include `diagnostics` con i check falliti, i problemi e i conteggi di righe/colonne coinvolte.
17. `diagnostics` non contiene celle, righe di dati o valori liberi; `rowNumbers` compare solo con `--include-row-numbers`.
18. `--diagnostics none|summary|full` cambia il dettaglio, non il codice, il messaggio o l'esito del rifiuto.
19. Se la diagnostica supera 64 KB, viene troncata e `truncated` è `true`.

---

## 16. Rischi e mitigazioni

| Rischio | Mitigazione |
|---|---|
| Importare UI accidentalmente | dependency-cruiser + test di import Node |
| Duplicare la lista delle analisi | catalogo derivato da `ANALYSIS_RUNNERS` |
| Rompere i runner | nessuna modifica ai builder; solo wrapper |
| `@irbisadm/statfmt` non funziona in Node | test dedicato; esternalizzare o degradare a CSV/XLSX |
| SVG diverso dal browser | test XML + confronto visivo su fixture |
| Bundle troppo grande | lazy import per famiglie/analisi se necessario |
| Worker non terminano | timeout, terminate, test di cancellazione |
| Output troppo grandi | limiti, `--include`, file su disco |
| Path Windows | test con `path.win32` e CI Windows |
| `.lzs` corrotto | `parseProject` + errori `E_DATA` |

---

## 17. Sequenza commit consigliata

1. `feat(engine): catalogo, parametri e caricamento dataset`
2. `feat(engine): envelope e errori`
3. `feat(cli): comandi analyses, schema e inspect`
4. `feat(cli): comando run e output JSON`
5. `feat(cli): markdown, html, xlsx e svg`
6. `feat(cli): batch e worker`
7. `build(cli): bundle esbuild e bin`
8. `test(cli): smoke e golden`
9. `docs(cli): riferimento comandi`

---

## 18. Decisioni aperte

1. Il nome del binario è `lazstats` o `lazstatjs`?
2. Il package CLI resta privato o diventa un pacchetto separato?
3. Il formato grafico predefinito è SVG o anche PNG?
4. Il batch deve poter riusare un progetto `.lzs` come base comune?
5. Quanto deve essere rigido il limite di 50.000 righe?
6. Il report HTML deve includere i dati o solo i risultati?
7. `wizard` deve essere esposto normalmente o solo come compatibilità?

---

## 19. Riferimenti

- `src/analyses/runners.ts` — 72 runner puri.
- `src/analyses/registry.ts` — 73 voci, 72 schede visibili.
- `src/analyses/types.ts` — `AnalysisRunResult`.
- `src/analyses/params.ts` — validazione dei riferimenti di colonna.
- `src/analyses/paramsSnapshot.ts` — chiavi delle fette di `ProjectParams`.
- `src/io/project/types.ts` — `ProjectParams`, `DEFAULT_PARAMS`, `ProjectSnapshot`.
- `src/io/project/parse.ts` — `parseParams`, `parseProject`.
- `src/io/readers.ts` — CSV/TSV/JSON e costruzione tabella.
- `src/io/xlsx.ts` — lettura e scrittura workbook.
- `src/io/statfiles.ts` — SPSS/Stata.
- `src/stats/charts.ts` — 32 kind e modelli serializzabili.
- `src/charts/vega/buildSpec.ts` — modello → Vega-Lite.
- `src/io/reportExport.ts` — documento HTML.
- `src/io/tableTsv.ts` — formattazione tabelle.
- `src/analyses/worker/heavyIds.ts` — analisi heavy.
