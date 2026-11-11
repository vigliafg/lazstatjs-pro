# Piano — Motore CLI completo per LazStats

**Data:** 2026-11-11
**Repository:** `lazstatjs-pro`
**Versione di riferimento:** `0.32.0`
**Stato:** piano di progettazione; nessuna implementazione inclusa.

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
| `E_RUN` | runner che restituisce `ok:false` | 2 |
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

Rigenera report/grafici da un envelope già prodotto.

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

---

## 9. Output

### 9.1 Envelope JSON

Forma proposta:

```json
{
  "schemaVersion": 1,
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
- `result` è esattamente `AnalysisRunResult`, senza transformazioni lossy;
- gli errori hanno `{ "error": { "code", "message", "details?" } }`.

### 9.2 JSON su stdout

- Con `--format json` e senza `--out`, l’envelope va su stdout e nient’altro.
- Log, progresso e warning diagnostici vanno su stderr.
- Con `--out file.json`, l’envelope va nel file e stdout resta vuoto (salvo `--quiet=false`).
- Con errori in `--json`, l’oggetto errore va su stdout e l’exit code è coerente.

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
- il rendering avviene solo nel processo CLI, non nel server MCP se non richiesto.

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
- `result`: envelope, hash, assenza timestamp, `ok:false`.
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
