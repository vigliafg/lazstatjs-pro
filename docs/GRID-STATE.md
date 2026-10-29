# Griglia dati — stato dei lavori

> Ultimo blocco completato: P0/P1/P2/P3 del backlog (validazione tipo/ruolo,
> assegnazione a tutti i ruoli, missing code, Playwright, formule persistenti,
> virtualizzazione, label nei picker).
> Documento di handoff: cosa è stato costruito, quali invarianti non rompere,
> cosa resta. L'analisi e il backlog completo sono in
> [`DATA-EDITING-ANALYSIS.md`](DATA-EDITING-ANALYSIS.md).

## 1. Sintesi

La griglia non è più solo un editor di celle. Ora è **identity-safe** e
**analysis-aware**:

- ogni colonna ha un `id` stabile;
- insert/delete/move/duplicate/split/merge rimappano i parametri;
- le variabili rimosse, trasformate o con un tipo incompatibile invalidano il
  ruolo, non vengono sostituite in silenzio;
- ogni ruolo di ogni analisi è assegnabile dalla colonna focalizzata;
- New/Import resettano parametri e output;
- ogni modifica della griglia ha una revisione, usata per il badge `stale`;
- un Variable Inspector espone metadati, formula, missing code e statistiche;
- i codici missing dichiarati sono esclusi da tutte le analisi;
- le colonne calcolate possono avere una formula persistente e si aggiornano a
  ogni edit;
- le tabelle grandi renderizzano solo le righe visibili;
- i picker delle analisi mostrano la label della variabile quando presente;
- smoke test Playwright coprono i flussi principali su desktop e mobile.

## 2. Cosa è stato completato

| Area | Stato |
|---|---|
| Identità stabile delle colonne | Fatto |
| Remap su insert/delete/move/duplicate/split/merge | Fatto |
| Invalidazione ruoli su delete/split/merge | Fatto |
| Validazione tipo/ruolo (continuo vs gruppo) | Fatto |
| Undo/redo con riconciliazione per id | Fatto |
| Reset su New/Import overwrite | Fatto |
| Revisione dati + stale output | Fatto |
| Filtro analysis-aware | Fatto |
| Variable Inspector | Fatto |
| Contesto dati nel Setup + Data peek | Fatto |
| Colonna focalizzata → ruolo primario | Fatto |
| Colonna focalizzata → qualsiasi ruolo | Fatto |
| Fill right + fill handle + Ctrl+D / Ctrl+R | Fatto |
| Editing multi-cella | Fatto |
| Test unitari column ops/remap/formule/missing | Fatto |
| Missing code per colonna | Fatto |
| Formule persistenti con ricalcolo | Fatto |
| Virtualizzazione righe | Fatto |
| Label nei picker delle analisi | Fatto |
| Playwright desktop/mobile in CI | Fatto |

## 3. Regole operative

### 3.1 Identità

- `Column.id` è opzionale nel tipo per compatibilità, ma viene creato per ogni
  colonna nuova e assegnato alle colonne dei progetti vecchi in `parseGrid`.
- Insert/delete/move non cambiano l'id delle colonne esistenti.
- Split conserva l'id della colonna originale (parte sinistra) e crea un id per
  la nuova colonna.
- Merge conserva l'id della colonna `lo` e rimuove `hi`.
- Duplicate crea un id nuovo.
- Compute e paste che aggiungono colonne creano id nuovi.

### 3.2 Effetto delle operazioni

| Operazione | Indici | Ruoli | Azione |
|---|---|---|---|
| Edit cella, paste, fill, clear, find/replace, trim, coerce, missing | invariati | invariati | `dataRevision++`, stale |
| Sort, add/insert/delete row, drop empty/duplicate | invariati | invariati | `dataRevision++`, stale |
| Add column end, compute, paste che aggiunge colonne | nuovi in coda | invariati | stale |
| Insert column at i | `>= i` → `+1` | remap | remap |
| Duplicate column i | `>= i+1` → `+1` | remap | remap |
| Move column i→j | permutazione | remap | remap |
| Delete column i | `> i` → `-1`; `i` sparisce | ruolo su `i` → `-1` | invalidazione |
| Split column i | nuova a `i+1`; `>= i+1` → `+1`; `i` resta | ruolo su `i` → `-1` | invalidazione |
| Merge columns a,b | `hi` sparisce; `lo` fusa; `> hi` → `-1` | ruoli su `a`/`b` → `-1` | invalidazione |
| Recode values/levels | invariati | invariati | stale, **validazione tipo non automatica** |
| Rename | invariati | invariati | stale; le formule seguono il nome |
| Cambio tipo | invariati | ruolo incompatibile → errore | stale + Run bloccato |
| New / Import overwrite | tutte nuove | reset | reset + `datasetId` + output svuotati |
| Import append/merge | invariati / nuovi in coda | invariati | stale |
| Undo/redo | per id | riconciliati per id | invalidati restano `-1` |
| Filter | invariati | invariati | firma filtro, stale |
| Formula edit | invariati | invariati | ricalcolo + stale |

### 3.3 Dataset replacement

`New` e `Import overwrite` passano da `replaceDataset`:

- resettano i parametri con `defaultParamsForGrid(width)`;
- generano un nuovo `datasetId`;
- svuotano l'output;
- resettano validation, selection, inspector, focused column e modalità filtro.

L'output vecchio non viene conservato: apparteneva a un altro dataset.

### 3.4 Stale

- `useGridHistory` espone `revision`, incrementata su commit/undo/redo e
  ripristinata esattamente quando si apre un progetto.
- Ogni run salva `dataRevision`, `datasetId` e `ciLevel` nella card; revision e
  dataset sono persistiti nel progetto, la firma del filtro resta di sessione.
- Una card è `stale` se revision, dataset, firma del filtro, firma dei
  parametri o livello di confidenza non coincidono.
- Dopo reload un progetto non modificato non produce card stale; una modifica
  successiva incrementa la revision e le marca. I file legacy senza metadati
  restano non stale, come prima.
- La firma del filtro non è persistita: un filtro analysis non riapplicato non
  può essere confrontato dopo reload (limite noto).

### 3.5 Ruoli invalidi

- `remapParams` restituisce `{ params, invalidated }`.
- `validateAnalysisColumnRefs` controlla che gli indici esistano;
  `validateRoleTypes` controlla che il tipo della colonna sia compatibile:
  - ruoli **continui**: rifiutano `cat`, `str`, `alp`, `chr`, `dat`, `dtm`,
    `tim`, `id`;
  - ruoli **gruppo**: richiedono `isGroupColumn` (categorie dichiarate,
    `bol`, oppure codici con 2–12 livelli).
- Se ci sono errori: banner “Reselect variables”, Run disabilitato, e
  `useAnalysisRun` blocca comunque il run.
- I select con valore `-1` possono mostrare la prima opzione per come funziona
  il DOM: il banner è la fonte di verità finché l'utente non riseleziona.
- `roles.ts` descrive ogni ruolo con getter/setter; il primo è il primario.
  Il Setup permette di assegnare la colonna focalizzata a un ruolo qualsiasi
  (select + Assign); il Data peek mostra la mappa ruolo → colonna.

### 3.6 Filtro

- `filterAffectsAnalysis = false` (default): le analisi usano tutte le righe.
- `true`: `analysisGrid` contiene solo le righe che passano il filtro.
- Il Setup mostra `Rows 10/20` e “analysis filter”.
- La firma del filtro entra nello stale; la modalità non è persistita.

### 3.7 Missing code

- `Column.missing?: string[]` contiene i codici dichiarati (es. `-9`, `NA`),
  modificabili dal Variable Inspector.
- `maskMissingCodes` azzera le celle con un codice dichiarato **prima** di
  passarli alle analisi: tutti i runner continuano a trattare `''` come
  missing, senza modifiche ai kernel.
- Il conteggio "Missing" nel Setup e nell'inspector include vuoti e codici;
  il badge `Codes N` mostra quante celle sono state escluse dai codici.
- La validazione di cella ignora i codici dichiarati.
- I codici sono opzionali nel progetto: i file vecchi si caricano invariati.

### 3.8 Formule persistenti

- `Column.formula?: string` conserva l'espressione (nomi di colonna, numeri,
  `+ - * / % ^`, parentesi).
- `recalculateFormulas` gira dentro `useGridHistory.commit`: ogni edit,
  paste, fill, recode o rename aggiorna le colonne calcolate prima di salvare
  la revisione; i valori delle celle restano la fonte per export e reload.
- Le colonne sono valutate da sinistra a destra: una formula può usare una
  colonna calcolata precedente.
- Una formula che non compila (colonna referenziata cancellata) conserva i
  valori precedenti invece di svuotare la colonna; l'undo ripristina il
  riferimento.
- `renameColumn` riscrive i riferimenti nelle formule.
- `Compute` nel pannello Transform crea una formula persistente quando la
  casella `formula` è selezionata (default) e una colonna one-shot altrimenti.

### 3.9 Virtualizzazione

- `visibleWindow` calcola la finestra di righe da montare (altezza fissa
  23 px, overscan 10, soglia 80 righe).
- Sopra la soglia la tabella usa due righe-spacer: le larghezze delle colonne
  restano naturali (niente posizionamento assoluto).
- Il focus programmatico (validate → jump) porta prima la riga nella finestra.
- Selezione, copy/paste e fill continuano a lavorare sugli indici originali.

## 4. File chiave

| File | Ruolo |
|---|---|
| `src/grid/types.ts` | `Column.id/formula/missing`, livelli, `columnLabel`, masking |
| `src/grid/columnOps.ts` | Mappa indici per insert/delete/move/split/merge/map/reset |
| `src/grid/formulas.ts` | Valutazione formule, ricalcolo, rewrite su rename |
| `src/grid/virtual.ts` | Finestra di righe e costanti di virtualizzazione |
| `src/grid/ops/` | Operazioni pure divise in columns/rows/ranges/clean/recode |
| `src/grid/ops.ts` | Re-export della superficie storica + edit cella/filtro/validazione |
| `src/analyses/params.ts` | Remap, invalidazione, validazione indici, ruolo primario |
| `src/analyses/roles.ts` | Ruoli per analisi, assegnazione, validazione tipo/ruolo |
| `src/hooks/useColumnOperations.ts` | Handler strutturali della griglia |
| `src/hooks/useProjectParams.ts` | Stato parametri e `bindParam` estratti da App |
| `src/grid/useGridHistory.ts` | Revisione, undo/redo e ricalcolo formule |
| `src/grid/VariableInspector.tsx` | Drawer metadati, formula, missing, statistiche |
| `src/ui/DataWorkspace.tsx` | Stato di vista della scheda Data e wiring di DataTab |
| `src/ui/DataTab.tsx` | Layout griglia + inspector, filtro, fill right |
| `src/ui/analysis/AnalysisOptions.tsx` | Context bar, Data peek, mappa ruoli, banner |
| `src/hooks/useOutputConsole.tsx` | Meta `dataRevision`/`datasetId`/`filterSignature` |
| `src/ui/OutputConsole.tsx` | Badge stale |
| `src/hooks/useImportExport.ts` | Import overwrite → `replaceDataset` |
| `e2e/smoke.spec.ts` | Smoke Playwright desktop/mobile |
| `playwright.config.ts` | webServer + progetti desktop/mobile |

## 5. Verifica

- `npm run check`: **475 test verdi**, dependency-cruiser, madge e file-size
  guard ok (3 eccezioni statiche: help, arima, dizionario i18n).
- `npm run build`: ok, nessun warning >500 kB.
- `npm run test:e2e`: **42 passed, 34 skipped**, 2 progetti (desktop esegue
  tutti i flussi, mobile quelli compatibili). Coprono:
  - caricamento della griglia seed, edit + undo;
  - missing code dall'inspector;
  - assegnazione a un ruolo non primario;
  - banner “Reselect variables” dopo cambio tipo incompatibile;
  - paste di 500 righe, virtualizzazione e scroll all'ultima riga;
  - formula persistente ricalcolata dopo un edit;
  - fill down da tastiera + undo;
  - overwrite multi-cella;
  - New confermato + reset del filtro;
  - paste con riga vuota interna;
  - jump a una cella nascosta dal filtro.

## 6. Limiti noti

1. **Firma del filtro solo in sessione.** Revision, dataset e CI sono
   persistiti; la firma del filtro no, quindi una card prodotta con filtro
   analysis non viene confrontata dopo reload.
2. **Invalidati non recuperati dall'undo.** Undo riporta la colonna, ma il
   ruolo resta `-1` e va riselezionato.
3. **Formule ricalcolate solo sugli edit.** Un progetto caricato mostra i
   valori salvati finché non si modifica la griglia; nessun ricalcolo
   automatico al load.
4. **Missing code per colonna, non per dataset.** Non esiste un elenco
   globale di codici né un report esportabile delle esclusioni per variabile.
5. **Virtualizzazione a altezza fissa.** Cambiare il padding delle righe
   richiede di aggiornare `ROW_HEIGHT` in `src/grid/virtual.ts`.
6. **Smoke automatici, non suite completa.** I flussi con modali (import,
   export, livelli, ricodifica) restano a verifica manuale.

## 7. Prossimi passi

| Priorità | Intervento | Perché |
|---|---|---|
| **P1** | Recuperare il ruolo invalidato dall'undo per id | Evita di riselezionare dopo un undo |
| **P2** | Report esclusioni per variabile (missing codes) | Rende verificabile l'N delle analisi |
| **P2** | Suite Playwright per import/export/livelli | Copre i modali rimasti manuali |
| **P3** | Altezza riga configurabile | Toglie il vincolo di `ROW_HEIGHT` |

## 8. Come riprendere

```bash
npm install
npm run dev
npm run check
npm run test:e2e
```

Invarianti da non rompere:

- `Column.id` non cambia su move/insert/delete delle altre colonne.
- Split/merge/delete invalidano, non rimappano, il ruolo della variabile
  trasformata.
- New/Import overwrite resettano parametri e svuotano l'output.
- Ogni modifica della griglia deve incrementare `dataRevision`.
- Ogni run deve salvare revision, dataset e firma del filtro.
- I campi nuovi del progetto devono restare opzionali: non cambiare
  `PROJECT_VERSION` per un campo opzionale.
- Le formule si ricalcolano solo dentro `commit`, mai su `setWithoutHistory`.
- I codici missing vengono azzerati solo nella vista passata alle analisi,
  non nella griglia originale.
