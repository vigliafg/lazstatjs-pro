# Guida agente — MCP

Questa guida descrive come usare il server senza indovinare. La versione runtime è disponibile anche su `lazstats://help`; il contratto generato è in [`riferimento.md`](riferimento.md).

## Flusso

1. `engine_info` per capacità, limiti, versione e topic di help.
2. `list_analyses` per scegliere un id eseguibile.
3. `describe_analysis` per ruoli, campi, default ed `exampleSet`.
4. `inspect_dataset` per nomi colonna, tipi, livelli e codici mancanti.
5. `run_analysis` con una sola sorgente; conserva il `resultId`.
6. `get_result` per altre tabelle/pagine e `render_chart` per i grafici.
7. `validate_project` prima di eseguire un progetto `.lzs`, se vuoi confermarne il contenuto.

Non inventare id, nomi di colonna, chiavi di ruolo o `chartId`. Se un tool rifiuta, leggi `structuredContent.error` e la diagnostica.

Se l'host non espone risorse o prompt, chiedi la guida con `engine_info` e `{ "help": true }`; per un solo argomento usa `{ "topic": "errors" }` (o `workflow`, `data`, `run`, `results`, `charts`, `projects`, `paths`, `limits`).

## Sorgenti

`run_analysis` accetta esattamente una tra:

- `dataPath`: file dentro la root MCP;
- `projectPath`: progetto `.lzs` dentro la root MCP;
- `data`: tabella JSON inline, massimo 1 MiB e 2000 righe.

`inspect_dataset` accetta esattamente una tra `path`/`dataPath` oppure `data`.

Con `dataPath` o `data` serve `analysisId`. Con `projectPath` è opzionale: senza, viene usata l'analisi attiva salvata. `assistant` non è eseguibile.

## Parametri

`params` è un oggetto parziale di `ProjectParams`; `set` accetta chiavi di ruolo o `paramsKey.ruolo` e liste come array o stringhe separate da virgola. La precedenza è base del progetto, `params`, poi `set`.

`ciLevel` accetta 0–100: i valori maggiori di 1 vengono divisi per 100. Il default è 0.95 per i dataset e il valore del progetto per i progetti. `reportLocale` default `it`, oppure la lingua del progetto.

`include` seleziona `summary`, `tables`, `report`, `charts`; il default è `summary`, `tables`, `report`. Aggiungi `charts` se ti servono gli id dei grafici.

`timeoutMs` va da 100 a 600000 (default 120000). `workers` accetta `auto`, `0` o un intero 0–64.

## ResultId e cache

Solo i run riusciti producono un `resultId`. La cache è in memoria, LRU, con TTL di 10 minuti, massimo 20 risultati e 20 MB. Un risultato troppo grande può avere `resultId: null`.

`get_result` legge `summary`, `tables`, `report`, `charts` o `all`; con `tableId` legge una tabella e con `offset`/`limit` pagina (limite 200). Un id scaduto produce `E_RESULT_EXPIRED`: riesegui l'analisi.

`render_chart` richiede `resultId` e `chartId`; `format` è `svg` (default) o `spec` per la specifica Vega-Lite compilata.

## Progetti

`validate_project` è read-only e riporta versione/migrazione, forma, analisi attiva, chiavi dei parametri, output salvati e SHA-256. `run_analysis` con `projectPath` usa griglia, parametri, CI e lingua salvati; `params` e `set` possono sovrascriverli.

## Errori

| Codice | Recupero |
| --- | --- |
| `E_ARGS` | Rileggi lo schema del tool; fornisci una sola sorgente e id validi |
| `E_ANALYSIS` | Usa un id di `list_analyses` |
| `E_PARAMS` | Reinspecta colonne e ruoli; usa nomi esatti |
| `E_DATA` | Controlla path dentro la root, formato e limiti |
| `E_RUN` | Leggi la diagnostica, correggi dati/parametri e riesegui |
| `E_TIMEOUT` | Aumenta `timeoutMs` o riduci il dataset |
| `E_CANCELLED` | Ripeti solo se il risultato serve ancora |
| `E_BUSY` | Attendi un run attivo e riprova |
| `E_RESULT_EXPIRED` | Riesegui per ottenere un nuovo `resultId` |
| `E_INTERNAL` | Riprova una volta, poi riporta messaggio e stage |

Dettaglio completo in [`errori.md`](errori.md). La configurazione host è in [`integrazione.md`](integrazione.md).
