# Griglia dati — stato dei lavori

> Checkpoint al commit `ff508b7` (`main`, allineato a `origin/main`).
> Documento di handoff: cosa è stato costruito, quali invarianti non rompere,
> cosa resta. L'analisi e il backlog completo sono in
> [`DATA-EDITING-ANALYSIS.md`](DATA-EDITING-ANALYSIS.md).

## 1. Sintesi

La griglia non è più solo un editor di celle. Ora è **identity-safe**:

- ogni colonna ha un `id` stabile;
- insert/delete/move/duplicate/split/merge rimappano i parametri;
- le variabili rimosse o trasformate invalidano il ruolo, non vengono
  sostituite in silenzio;
- New/Import resettano parametri e output;
- ogni modifica della griglia ha una revisione, usata per il badge `stale`;
- un Variable Inspector espone metadati e statistiche;
- il Setup mostra il contesto dati e può assegnare la colonna focalizzata al
  ruolo primario;
- il filtro può essere view-only o influire sulle analisi.

Restano fuori i blocchi più costosi: formule persistenti, virtualizzazione,
codici missing e suite UI automatica.

## 2. Cosa è stato completato

| Area | Stato |
|---|---|
| Identità stabile delle colonne | Fatto |
| Remap su insert/delete/move/duplicate/split/merge | Fatto |
| Invalidazione ruoli su delete/split/merge | Fatto |
| Undo/redo con riconciliazione per id | Fatto |
| Reset su New/Import overwrite | Fatto |
| Revisione dati + stale output | Fatto |
| Filtro analysis-aware | Fatto |
| Variable Inspector | Fatto |
| Contesto dati nel Setup + Data peek | Fatto |
| Colonna focalizzata → ruolo primario | Fatto |
| Fill right | Fatto |
| Test unitari column ops/remap | Fatto |
| Formule persistenti | Rinviato |
| Virtualizzazione | Rinviato |
| Missing code per colonna | Rinviato |
| Playwright in CI | Rinviato |

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
| Rename | invariati | invariati | stale (etichette) |
| Cambio tipo | invariati | invariati | stale, **validazione ruolo non automatica** |
| New / Import overwrite | tutte nuove | reset | reset + `datasetId` + output svuotati |
| Import append/merge | invariati / nuovi in coda | invariati | stale |
| Undo/redo | per id | riconciliati per id | invalidati restano `-1` |
| Filter | invariati | invariati | firma filtro, stale |

### 3.3 Dataset replacement

`New` e `Import overwrite` passano da `replaceDataset`:

- resettano i parametri con `defaultParamsForGrid(width)`;
- generano un nuovo `datasetId`;
- svuotano l'output;
- resettano validation, selection, inspector, focused column e modalità filtro.

L'output vecchio non viene conservato: apparteneva a un altro dataset.

### 3.4 Stale

- `useGridHistory` espone `revision`, incrementata su commit/undo/redo/reset.
- Ogni run salva `dataRevision`, `datasetId` e `filterSignature` nella card
  (solo in sessione).
- Una card è `stale` se revision, dataset o firma del filtro non coincidono.
- Gli output ripristinati da `.lzs` non hanno questi campi e non vengono
  marcati stale.
- Cambiare i parametri non marca la card stale.

### 3.5 Ruoli invalidi

- `remapParams` restituisce `{ params, invalidated }`.
- Il Setup calcola `roleErrors` per l'analisi attiva con
  `validateAnalysisColumnRefs`.
- Se ci sono errori: banner “Reselect variables”, Run disabilitato, e
  `useAnalysisRun` blocca comunque il run.
- I select con valore `-1` possono mostrare la prima opzione per come funziona
  il DOM: il banner è la fonte di verità finché l'utente non riseleziona.

### 3.6 Filtro

- `filterAffectsAnalysis = false` (default): le analisi usano tutte le righe.
- `true`: `analysisGrid` contiene solo le righe che passano il filtro.
- Il Setup mostra `Rows 10/20` e “analysis filter”.
- La firma del filtro entra nello stale; la modalità non è persistita.

## 4. File chiave

| File | Ruolo |
|---|---|
| `src/grid/types.ts` | `Column.id`, `label`, `description`, livelli |
| `src/grid/columnOps.ts` | Mappa indici per insert/delete/move/split/merge/map/reset |
| `src/analyses/params.ts` | Remap, invalidazione, validazione, ruolo primario |
| `src/hooks/useColumnOperations.ts` | Handler strutturali della griglia |
| `src/grid/useGridHistory.ts` | Revisione e undo/redo che restituiscono la griglia |
| `src/grid/VariableInspector.tsx` | Drawer metadati e statistiche |
| `src/ui/DataTab.tsx` | Layout griglia + inspector, filtro, fill right |
| `src/ui/analysis/AnalysisOptions.tsx` | Context bar, Data peek, focused column, banner ruoli |
| `src/hooks/useOutputConsole.tsx` | Meta `dataRevision`/`datasetId`/`filterSignature` |
| `src/ui/OutputConsole.tsx` | Badge stale |
| `src/hooks/useImportExport.ts` | Import overwrite → `replaceDataset` |
| `src/grid/ops.ts` | Operazioni pure; 700 righe, al limite del guard |

## 5. Verifica

- `npm run check`: **399 test verdi**, dependency-cruiser, madge e file-size
  guard ok.
- `npm run build`: ok (resta il warning Vite >500 kB).
- Smoke manuale Playwright:
  - delete/split/merge con banner e Run bloccato;
  - undo di un move con parametri ripristinati per id;
  - inspector desktop e mobile;
  - Data peek;
  - analysis filter con N ridotto nell'output;
  - New/Import overwrite con output svuotato;
  - stale badge dopo edit;
  - assegnazione della colonna focalizzata al ruolo primario.

## 6. Limiti noti

1. **Cambio tipo non validato contro il ruolo.** Un gruppo può diventare
   continuo e restare selezionato: i dati sono stale, ma il ruolo non viene
   invalidato automaticamente.
2. **Label non usata nei picker delle analisi.** Label e description sono nel
   progetto, nell'inspector e nel Data peek, ma i form mostrano ancora `name`.
3. **Missing code assente.** La cella vuota è l'unico missing; mancano codici
   per colonna e report delle esclusioni.
4. **Stale solo in sessione.** Dopo reload le card ripristinate non hanno
   revision/dataset/filter e non vengono marcate.
5. **Parametri non contano per lo stale.** Cambiare un parametro non invalida
   la card; cambia solo dati, dataset o filtro.
6. **Invalidati non recuperati dall'undo.** Undo riporta la colonna, ma il
   ruolo resta `-1` e va riselezionato.
7. **Formule one-shot.** `Compute` crea una colonna statica; non c'è refresh.
8. **Nessuna virtualizzazione.** Dataset grandi renderizzano tutte le righe
   visibili.
9. **Nessuna suite Playwright committata.** Gli smoke sono manuali.
10. **App e ops a 699/700 righe.** Il prossimo blocco deve splittare prima di
    aggiungere codice.

## 7. Prossimi passi

| Priorità | Intervento | Perché |
|---|---|---|
| **P0** | Validazione tipo/ruolo (gruppo vs continuo) | Chiude il buco lasciato dal cambio tipo |
| **P0** | Assegnazione a tutti i ruoli, non solo al primario | Completa DE-2 |
| **P1** | Missing code per colonna + report esclusioni | Completa DE-3 |
| **P1** | Playwright in CI | Protegge i flussi appena costruiti |
| **P2** | Formule persistenti | DE-5 |
| **P2** | Virtualizzazione righe | DE-6 |
| **P3** | Label nei picker delle analisi | Rende utile il metadato |

Prima di DE-5/DE-6 conviene splittare `App.tsx` e `grid/ops.ts`, entrambi al
limite di 700 righe.

## 8. Come riprendere

```bash
npm install
npm run dev
npm run check
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
