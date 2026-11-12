# Guida agente — CLI

Questa pagina descrive il contratto operativo della CLI. Il catalogo completo è in [`riferimento.md`](riferimento.md), generato da `src/cli/spec.ts`.

## Flusso minimo

```bash
lazstats analyses --json
lazstats schema descriptive --json
lazstats inspect data.csv --json
lazstats run --data data.csv --analysis descriptive --json
```

Non inventare id, nomi di colonna o chiavi di ruolo. `analyses` fornisce gli id, `schema` fornisce `roles`, `fields`, `defaultParams` e `exampleSet`, `inspect` fornisce i nomi reali delle colonne.

## Sorgenti

`run` accetta esattamente una sorgente:

- `--data <file>` richiede `--analysis <id>`.
- `--project <file.lzs>` usa l'analisi attiva salvata; `--analysis` è opzionale.

`project run <file.lzs>` è equivalente a `run --project <file.lzs>`. `project inspect` è read-only.

## Parametri

La precedenza è:

1. base del progetto (`--project`, se presente);
2. `--params <json>` oppure `--params-file <file>`;
3. `--set chiave=valore` ripetuti, nell'ordine della riga di comando.

`--params` e `--params-file` sono alternativi. `--set` accetta:

- una chiave di ruolo, per esempio `descVars=Score`;
- una chiave prefissata dal `paramsKey`, per esempio `reg.y=Score`;
- liste separate da virgola (`descVars=Score,Age`) o `@indice` per una colonna per posizione.

I nomi delle colonne sono normalizzati (maiuscole/minuscole e punteggiatura non contano); un nome ambiguo viene rifiutato. Usa `schema` per il tipo atteso e `inspect` per verificare che le colonne esistano.

## Output

Il formato predefinito di `run` è `json`. L'envelope di successo contiene:

```json
{
  "schemaVersion": 1,
  "status": "ok",
  "engine": { "name": "lazstats", "version": "0.32.0", "runners": 72, "chartKinds": 32 },
  "analysis": { "id": "descriptive", "label": "Descriptive", "family": "descriptive" },
  "input": { "source": "...", "format": "csv", "sha256": "...", "rows": 150, "columns": 5 },
  "params": {},
  "ciLevel": 95,
  "reportLocale": "it",
  "result": { "ok": true, "tables": [], "report": {}, "charts": [] },
  "warnings": [],
  "artifacts": []
}
```

Un rifiuto usa `status: "rejected"` o `"error"`, contiene `error.code`, `error.kind`, `error.stage`, `error.message` e, se richiesta, `diagnostics`. Non viene mai prodotto un risultato finto.

`--format` accetta `json`, `md`, `html`, `xlsx`, `svg`. XLSX e SVG richiedono `--out`; SVG scrive una directory con un file per grafico. `--charts svg` è il default per HTML/SVG.

## Batch

`batch` legge un oggetto `{ "jobs": [...] }` o un array. Ogni job ha:

```json
{
  "id": "descriptive-iris",
  "data": "data.csv",
  "analysis": "descriptive",
  "set": { "descVars": ["Score", "Age"] },
  "ciLevel": 95,
  "params": {},
  "timeout": 120
}
```

`id` deve essere unico e sicuro come nome di directory. `data` e `project` sono alternativi. Ogni job scrive `<out>/<id>/result.json` o `failure.json`.

## Exit code

| Codice | Significato |
| --- | --- |
| 0 | Successo |
| 2 | Argomenti, analisi, parametri o run rifiutato |
| 3 | Errore dataset/progetto/file |
| 4 | Errore interno |
| 5 | Timeout |

## Recupero dagli errori

- `E_PARAMS/column_not_found` o `ambiguous_column`: reinspecta il dataset e usa un nome più preciso o `@indice`.
- `E_PARAMS/unknown_parameter`: rileggi `schema` e usa una chiave di `fields`/`roles`.
- `E_ANALYSIS/unknown_analysis`: usa un id di `analyses`; `assistant` non è una procedura CLI.
- `E_DATA/file_not_found`: controlla il path e il formato.
- `E_ARGS/missing_parameter`: leggi `lazstats help <comando>`; per XLSX/SVG aggiungi `--out`.
- `E_TIMEOUT`: aumenta `--timeout` o riduci il dataset.

Per diagnosi più dettagliate usa `--diagnostics full` e `--verbose`; i valori delle celle non vengono inclusi nella diagnostica.
