# Chiusura dei rilievi UI residui

- **Richiesta**: "leggete i rilievi che sono stati appena stsmpati, rianalizzateli per tenere presente il momento attuale, poi producede un piano dettagliato per sanare tutti i rilievi sull'interfaccia rimanenti"
- **Obiettivo**: chiudere tutti i rilievi UI ancora aperti dopo i cinque passi post-audit, senza toccare i kernel statistici e senza cambiare `PROJECT_VERSION` per campi opzionali.
- **Criteri di successo**:
  - R8, R9, R10, R11, R12, R15, R16, R17, R4 residuo e R18 chiusi con almeno un test che fallisce prima e passa dopo.
  - Toolbar DataGrid con gerarchia leggibile; nuova categoria aggiungibile dalla cella.
  - `npm run check` verde, Playwright verde, build senza chunk >500 kB.
  - Nessuna regressione sui 31 form, sui flussi già coperti e sul formato `.lzs`.
- **Non-obiettivi**:
  - Riscrivere kernel, tabelle, report o il motore statistico.
  - R13 (righe ragged: non riproducibile), R19 (doppio dispatch: non UI), R20 (test i18n già chiuso).
  - Redesign grafico completo, nuove procedure, worker per i kernel.
- **Assunzioni**:
  - R18 è incluso: la freschezza dopo reload va chiusa, non solo documentata.
  - R4 residuo è incluso; il budget è 30 ms/tasto a 50k×10 con 1 formula **indipendente** dalla cella modificata, con fallback documentato per le formule dipendenti.
  - La UI resta inglese; catalogo, help/report e messaggi di dominio restano fuori perimetro i18n.
  - `filterSignature` resta session-only: il filtro non viene ripristinato al reload, quindi non è una base affidabile per la staleness. Il limite viene documentato e testato.

## Vincoli dal repository

- `src/analyses/` non può importare `src/ui/` (`.dependency-cruiser.cjs`); i form possono importare `components/`, `grid/`, `i18n`.
- `src/grid/` non conosce `ui/`, `analyses/`, `hooks/`, `io/`.
- File sotto 700 righe, salvo eccezioni statiche in `scripts/check-file-size.mjs` (`helpContent`, `arima`, `i18n`).
- `App.tsx` è a 620 righe: le nuove responsabilità vanno in hook, non inline.
- Test: `npm run check` (lint + unit + depcruise + madge + file-size), `npm run test:e2e`, `npm run build`.
- Non cambiare `PROJECT_VERSION` per campi opzionali; i progetti vecchi devono restare leggibili.

## Stato attuale verificato

- **R8** — lo stato vuoto di `OutputConsole` copre solo `outputs.length === 0`; il filtro è applicato inline e non ha stato vuoto (`src/ui/OutputConsole.tsx:294-308`).
- **R9** — l'effetto live esce su `roleErrors` senza azzerare `livePending`; le dipendenze includono l'intero `params` (`src/ui/analysis/AnalysisOptions.tsx:69-91`). Il runner è asincrono (import dinamico) e non ha token di generazione (`src/hooks/useAnalysisRun.ts:37-59`).
- **R10** — il select CI ha `aria-label`, ma `Field` non passa mai `htmlFor` (`src/components/FormFields.tsx:25-46`); la row header è un `<td>` (`src/grid/DataGrid.tsx:309-317`); le celle testo non hanno nome (`:393-394`); il fill handle è uno `<span role="button">` senza `tabIndex`/key handler (`:450-468`).
- **R11** — `validateRoleTypes` è type-based (`src/analyses/roles.ts:606-634`); `isNumericColumn`/`numericColumnIndexes` sono value-based (`src/analyses/shared/columns.ts:15-21`). Molti form continui mostrano tutte le colonne (`logistic/Form.tsx:26,40-55`, `regression/Form.tsx:25-35`, `correlation/Form.tsx:19-30`, `ttest/Form.tsx:32-45`, `factorial/Form.tsx:38`, `ancova/Form.tsx:34`).
- **R12** — `stratcox` controlla solo lo stratum, non time/event tra le covariate (`src/analyses/stratcox/run.tsx:18-28`); il form disabilita ma non deseleziona (`src/analyses/stratcox/Form.tsx:44-57`).
- **R15** — `showLibrary` è inizializzato una volta con `isWide()` (`src/ui/AnalysisTab.tsx:17-18,28-29`).
- **R16** — `freezeFirstCol`, inspector, `selRange` e `focusCell` vivono in `DataWorkspace`, smontato quando la tab Data non è attiva (`src/ui/DataWorkspace.tsx:65-71`, `src/App.tsx:473`). La selezione vera (`sel`/`anchor`) è interna a `DataGrid` (`src/grid/DataGrid.tsx:49-50`).
- **R17** — `visibleRows` e `missingCells` sono già memoizzati (`src/grid/DataGrid.tsx:39-45`, `src/ui/analysis/AnalysisOptions.tsx:93-106`); resta il live con deps sull'intero `params`.
- **R4 residuo** — `useGridHistory.commit` fa ricalcolo formule + `sameGrid` completo + `clone(prev)` a ogni commit (`src/grid/useGridHistory.ts:72-95`); `recalculateFormulas` ricopia tutte le righe (`src/grid/formulas.ts:82-101`). Benchmark 50k×10, 1 formula: ~39 ms recalc + ~9 ms clone + ~3,6 ms confronto.
- **R18** — `StoredOutput` non ha `dataRevision`/`datasetId`; `createProjectSnapshot` scarta anche `ciLevel` (`src/io/outputs.ts:22-44`, `src/io/project/index.ts:28-39`); `useProjectSession` non passa identità/revisione (`src/hooks/useProjectSession.ts:23-34`); `useGridHistory` parte da revision 0 (`src/grid/useGridHistory.ts:55-57`).
- **Attriti DataGrid** — toolbar con ~20 azioni in una riga (`src/ui/DataTab.tsx:162-273`); cella `cat` come `<select>` senza un'azione per aggiungere un livello (`src/grid/DataGrid.tsx:338-388`).
- **Baseline**: 446 test, 24 e2e passed / 18 skipped, build pulita (HEAD `9e651ab`).

## Approccio

Correzione incrementale, un rilievo per passo, con test rosso nel passo stesso (niente front-loading). Le scelte trasversali:

1. **Non allargare la validazione dei ruoli.** `validateRoleTypes` resta type-based; i form usano una lista type-based coerente (`continuousColumnIndexes`). I guard value-based restano nei runner.
2. **Non sollevare stato inutilmente.** `DataWorkspace` resta montata e nascosta; `DataGrid` riceve una `resetKey` per il cambio dataset.
3. **R18 con identità + revisione**, non con hash del contenuto: copre reload/apertura e modifiche gestite dall'app; un `.lzs` modificato esternamente con gli stessi metadati non è rilevato (limite documentato).
4. **R4 prima il fast-path, poi il clone.** Il clone si tocca solo se il benchmark lo richiede, con guard di immutabilità permanente.
5. **R8 una sola semantica**: filtro invalido → reset a “All analyses”; lo stato vuoto filtrato resta difensivo, non il comportamento atteso.

## Passi

1. **R8 — filtro output e stato vuoto** — file: `src/ui/OutputConsole.tsx`, `src/i18n.ts`, nuovo helper puro `src/ui/analysis/outputSelection.ts`.
   - `visibleOutputs` memoizzato; se `filterId` non è più tra le analisi presenti, reset a `all`.
   - Stato difensivo “No results for this filter” + “Show all” solo se `outputs.length > 0` e `visibleOutputs.length === 0`.
   - Test: unit su `outputSelection`; e2e: due analisi, rimuovi l'ultima card dell'analisi filtrata → torna “All analyses” e l'altra card è visibile. Rischio S.

2. **R9 + R17 — live-run senza race** — file: `src/ui/analysis/AnalysisOptions.tsx`, `src/hooks/useAnalysisRun.ts`.
   - Token di generazione (`liveSeq` ref): incrementato su nuovo run, cambio parametri, Live off, cambio analisi e cleanup.
   - `runAnalysisLive(isCurrent?)` e `run(..., {isCurrent})`: il runner può completare, ma `emit` pubblica solo se il token è ancora corrente; il pending si azzera solo per il run corrente (e in `finally`).
   - `runAnalysisLive` letto da un ref aggiornato a ogni render; deps dell'effetto su `analysisParamsSignature(activeAnalysis, params)` + grid/CI/filtro/roleErrors, non sull'intero `params`.
   - Test: e2e live + ruolo invalido (niente “syncing” bloccato); e2e cambio parametro durante un run differito (vince l'ultimo); cambio Live off/analisi non pubblica il run vecchio. Rischio M.

3. **R10 — accessibilità** — file: `src/components/FormFields.tsx`, `src/grid/DataGrid.tsx`.
   - `Field`: `htmlFor` esplicito; `VariableSelect` genera `useId`, collega label e select; `VariableList`/`CheckboxList` usano `fieldset`/`legend`.
   - `DataGrid`: `scope="col"` sulle header, row header `<th scope="row">`, celle con `aria-label` “colonna · riga”, `aria-selected`; fill handle focusabile (`tabIndex=0`, meglio `<button type="button">`) con `Enter` = fill down e `Shift+Enter` = fill right, `aria-keyshortcuts`.
   - Test: click sulla label “Test type” porta il focus al select; `toHaveAccessibleName` su una cella; Tab raggiunge il fill handle e Enter/Shift+Enter riempiono; nessun `axe` sweep globale. Rischio M.

4. **R11 + R12 — coerenza ruoli** — file: `src/grid/types.ts`, `src/analyses/roles.ts`, `src/analyses/shared/columns.ts`, form continui, `src/analyses/stratcox/run.tsx`, `src/analyses/stratcox/Form.tsx`.
   - Una sola regola di tipo: `isContinuousColumn(col)` in `grid/types.ts` (stessa lista di `validateRoleTypes`); `roles.ts` la usa; `continuousColumnIndexes(grid)` in `shared/columns.ts` per form/default.
   - `validateRoleTypes` resta type-only: nessuna soglia “≥2 valori” e nessun blocco nuovo sui run.
   - Sostituire `variableOptions(grid.cols)`/`VariableList cols` con le opzioni continue nei ruoli `continuous`; lasciare `any` e `group` come sono. Verifica con grep di tutti i call site e test della matrice per ogni `ColType` (incluso `bol`).
   - Default: controllare `repeatedanova`, `multivariate`, `nonparamrm`, `ancova`; toccare solo quelli che oggi possono proporre una colonna `cat`.
   - `stratcox`: guard `covariates.includes(time/event)` nel runner; il form rimuove time/event dai covariati al cambio ruolo.
   - Test: unit `columns`/`roles`; `stratcox/run.test` con time tra le covariate e un'altra covariata valida; e2e: predittore categorico assente dalla lista logistica; time=X deseleziona e Run bloccato. Rischio M/L.

5. **R15 + R16 — layout e stato di vista** — file: `src/ui/AnalysisTab.tsx`, nuovo `src/hooks/useMediaQuery.ts`, `src/App.tsx`, `src/ui/DataWorkspace.tsx`, `src/grid/DataGrid.tsx`.
   - `useMediaQuery` per `isWide` e `isNarrow`; `showLibrary` segue il default responsive finché l'utente non lo tocca; una scelta esplicita sopravvive al resize.
   - `DataWorkspace` resta montata e nascosta con CSS quando la tab non è Data; `App` cambia solo il wrapper.
   - `DataWorkspace` riceve `datasetId` e, al cambio, azzera `focusCell`, `selRange`, `inspectorCol` e `showInspector`; `DataGrid` riceve `resetKey` e azzera `sel`/`anchor`/`fillDrag`/editing.
   - Test: resize stretto→largo; freeze e inspector sopravvivono al cambio tab; selezione reale (`aria-selected`) sopravvive; New/Import/Open con dataset di pari dimensioni azzerano la selezione. Rischio M.

6. **R4 residuo — commit a 50k** — file: `src/grid/useGridHistory.ts`, `src/grid/formulas.ts`, `scripts/bench-grid.mjs`.
   - Prima benchmark Node + misura browser: edit con formula indipendente, edit con formula dipendente, edit strutturale.
   - `commit` accetta `changedCell`/`changedCol`; `updateCell` li passa. `recalculateFormulas(grid, changedCol?)` calcola il set di colonne referenziate dal testo delle formule (memo su `cols`) e salta il rebuild se la colonna modificata non è referenziata.
   - Il `clone(prev)` si rimuove solo se il benchmark mostra che serve, con test permanente che gli snapshot di history non cambiano dopo edit/undo/redo/metadati.
   - Budget: 30 ms/tasto a 50k×10 con 1 formula indipendente; il caso dipendente viene misurato e documentato separatamente. Rischio M/L.

7. **R18 — freschezza persistita** — file: `src/io/outputs.ts`, `src/io/project/index.ts`, `src/io/project/types.ts`, `src/hooks/useProjectSession.ts`, `src/App.tsx`, `src/grid/useGridHistory.ts`.
   - `StoredOutput` aggiunge `dataRevision?` e `datasetId?`; `createProjectSnapshot` persiste `dataRevision`, `datasetId` e `ciLevel` (oggi scarta il CI); `parseStoredOutputs` li valida.
   - `ProjectSnapshot`/`ProjectInput` hanno `datasetId?` e `dataRevision?` opzionali; `parseProject` li legge; `useProjectSession` li passa.
   - `useGridHistory(initial, initialRevision = 0)`; `setWithoutHistory(next, revision)` ripristina la revisione esatta; `restoreProject` imposta datasetId e revisione; il boot da autosave parte dalla revisione salvata; `New/Import` generano un nuovo datasetId e revision 0.
   - `filterSignature` resta session-only e viene documentato: al reload il filtro non è ripristinato, quindi non si usa per la staleness. Se il prodotto vorrà card analysis-filter stale dopo reload, servirà persistere anche lo stato del filtro (fuori scope).
   - Test: round-trip `.lzs` e autosave; reload senza modifiche → nessuna stale; edit dopo reload → stale; file legacy senza campi → nessuna stale; New/Import → dataset nuovo. Rischio M.

8. **DataGrid UX** — file: `src/ui/DataTab.tsx`, `src/grid/DataGrid.tsx`, `src/grid/LevelsEditor.tsx`, `src/i18n.ts`.
   - Toolbar in 2–3 gruppi con etichette/separatori (File/Edit/View/Tools), senza nuovo componente architetturale; a `<1280 px` le azioni secondarie vanno in un `<details>` “Tools” raggiungibile da tastiera.
   - Cella `cat`: un piccolo pulsante “Add level” accanto alla select apre `LevelsEditor` sulla colonna; il livello viene aggiunto ai metadati, la cella resta vuota, il focus torna alla cella. Nessun sentinel che possa collidere con un codice reale.
   - Test: toolbar a 1024/1280, overflow da tastiera; aggiunta livello con focus restituito e cella non riassegnata. Rischio S/M. Se l'apertura del dialog supera ~30 righe, resta un follow-up esplicito.

9. **Chiusura** — aggiornare `docs/POST-REFACTORING.md` (stato dei rilievi), `docs/UI-STATE.md`, `docs/GRID-STATE.md` (R18, test, e2e, limiti), conteggi; verificare file-size e build. Rischio S.

**Totale: L.** Ordine: R8/R9 sono indipendenti e rendono subito verificabile lo stato; R10/R11 toccano i controlli; R15/R16 lo stato di vista; R4/R18 i percorsi profondi; R8 UX chiude l'attrito; l'ultimo passo allinea i documenti.

## Alternative considerate

- **R18 con hash del contenuto** invece di `datasetId` + `dataRevision`: più robusto per file modificati esternamente, ma richiede di calcolare una firma a ogni run/salvataggio e di gestire collisioni/formati. Scartato: identità + revisione coprono i casi dell'app; il limite esterno è documentato.
- **R16 con lifting di 5 stati in App**: preserva il mount ma aggiunge 80–120 righe di props drilling e avvicina `App.tsx` al guard. Scelta: mount nascosto + reset key.
- **R11 con `validateRoleTypes` value-based**: unirebbe validazione e form, ma cambierebbe il blocco dei run su colonne con pochi valori. Scartato: validazione type-only, form type-based; i guard value-based restano nei runner.
- **R4 rimuovendo subito il clone**: risparmia ~9 ms ma non risolve i ~39 ms di ricalcolo; inoltre `setGrid = commit` è globale. Scelta: fast-path prima, clone solo se necessario.
- **R10 con `aria-label` ovunque**: più veloce ma non associa le label visibili; scartato in favore di `htmlFor`/fieldset e test del click.
- **R8 con reset immediato e nessuno stato vuoto**: il filtro invalido non è più selezionabile; lo stato vuoto resta solo difensivo.

## Riconciliazione del Concilio

### Primo giro

| # | rilievo | chi | severità | decisione | motivo |
|---|---------|-----|----------|-----------|--------|
| C1 | R18 non include `useProjectSession`, `filterSignature`, `ciLevel`, revisione esatta | Luna | BLOCKER | accettato | Il flusso di persistenza va chiuso end-to-end; `createProjectSnapshot` scarta anche il CI |
| C2 | R16 solleva `selRange` ma non la selezione vera (`sel`/`anchor`) | Luna | MAJOR | accettato | La selezione è interna a `DataGrid`; serve `resetKey` e mount nascosto |
| C3 | R11 “≥2 valori” esclude colonne valide e ignora i missing | Luna | MAJOR | accettato parzialmente | Validazione type-only; form type-based; niente soglia universale |
| C4 | R12 test unico non distingue form e runner | Luna | MAJOR | accettato | Test separati, con altra covariata valida |
| C5 | R9 può pubblicare un run vecchio e azzerare il pending nuovo | Luna | MAJOR | accettato | Token di generazione e invalidazione su cambio parametri/Live off/analisi |
| C6 | R4 togliere il clone non basta; manca misura browser | Luna | MAJOR | accettato | Fast-path prima; benchmark browser; budget per caso |
| C7 | R10 `htmlFor`/useId può essere cosmetico; fill non definito | Luna | MAJOR | accettato | Id concreto, test del click, tabIndex e tasti espliciti |
| C8 | R8 reset e stato vuoto si contraddicono | Luna | MINOR | accettato | Reset del filtro invalido; empty state solo difensivo |
| C9 | R15 il resize può sovrascrivere la scelta utente | Luna | MINOR | accettato | Preferenza esplicita conservata |
| C10 | UX “Add level” non definisce assegnazione/focus/sentinel | Luna | MINOR | accettato | Pulsante dedicato, nessun sentinel, focus restituito |
| C11 | Helper ruoli già esistente; matrice inutile | GLM | BLOCKER | accettato parzialmente | Niente matrice: `continuousColumnIndexes` type-based, riuso dei call site |
| C12 | `validateRoleTypes` value-based crea run-blocking | GLM | BLOCKER | accettato | Resta type-only; nessuna soglia |
| C13 | R16 lifting è il mezzo più costoso | GLM | MAJOR | accettato | Mount nascosto + reset key |
| C14 | R4 ordine clone/fast-path invertito | GLM | MAJOR | accettato | Fast-path prima; clone dopo |
| C15 | Step 0 front-loading | GLM | MAJOR | accettato | Test rosso dentro ogni passo |
| C16 | R18 può scendere a 4 file; `parse.ts` non serve | GLM | MINOR | accettato parzialmente | 6 file inclusa `useProjectSession`; niente `parse.ts` |
| C17 | R15 due meccanismi per lo stesso break-point | GLM | MINOR | accettato | Un solo `useMediaQuery` |
| C18 | Step 8 è scope creep senza rilievo numerato | GLM | MINOR | accettato parzialmente | Toolbar minimale; “Add level” piccolo, altrimenti follow-up |
| C19 | Test “nessun controllo senza nome” globale fragile | GLM | MINOR | accettato | Assert puntuali |
| C20 | Budget R4 doppio (<30 e <50 ms) | GLM | MINOR | accettato | Budget unico 30 ms; caso dipendente documentato |

### Secondo giro

| # | rilievo | chi | severità | decisione | motivo |
|---|---------|-----|----------|-----------|--------|
| C21 | R18 con filtro analysis: salvare la firma senza ripristinare il filtro è inutile | Luna/GLM | MAJOR | accettato | Non persistere `filterSignature`; documentare il limite; test dedicato |
| C22 | R16 reset incompleto: `selRange`/`focusCell`/`inspectorCol` | Luna/GLM | MAJOR | accettato | Reset in `DataWorkspace` su `datasetId` |
| C23 | Fill handle non focusabile senza `tabIndex` | Luna | MAJOR | accettato | `tabIndex=0` o `<button>` + test Tab |
| C24 | Token live va invalidato anche su cambio analisi/Live off | Luna | MAJOR | accettato | Incluso nel passo 2 |
| C25 | R4 deve misurare formula dipendente e indipendente | Luna | MAJOR | accettato | Due benchmark, budget sul caso indipendente |
| C26 | Regola tipo condivisa e test per ogni `ColType`, incluso `bol` | Luna | MINOR | accettato | `isContinuousColumn` in `grid/types` |
| C27 | Default R11 non enumerati | GLM | MINOR | accettato | Verifica con grep; toccare solo quelli che scelgono `cat` |
| C28 | Fast-path R4 richiede `opts.changedCol` e set colonne da testo formula | GLM | MINOR | accettato | Esplicitato nel passo 6 |
| C29 | `filterSignature` da rimuovere dalla persistenza | GLM | MINOR | accettato | Vedi C21 |
| C30 | “Add level” forse follow-up | GLM | MINOR | accettato | Passo 8 con timebox; altrimenti follow-up |

## Verdetto dei critici

- **Luna (v2)**: `APPROVE_WITH_CHANGES` — nessun blocker; restano 5 major su filtro analysis, reset selezione, fill handle, invalidazione live e benchmark dipendente.
- **GLM (v2)**: `APPROVE_WITH_CHANGES` — nessun blocker; restano solo minors su `filterSignature`, default R11, reset `DataWorkspace`, plumbing `changedCol` e scope “Add level”.

Il piano finale recepisce tutte le condizioni; non è stato fatto un terzo giro di approvazione.

## Rischi e mitigazioni

- **R18 / compatibilità `.lzs`**: campi opzionali, nessun cambio `PROJECT_VERSION`; test con file legacy e round-trip; se il file è modificato esternamente con gli stessi metadati, il limite è documentato.
- **R11 / 31 form**: introdurre `continuousColumnIndexes` prima dei form, testare la matrice dei tipi e fare grep dei call site; `validateRoleTypes` non cambia.
- **R4 / history**: il clone non si tocca senza test di immutabilità permanente; il fast-path deve ignorare le colonne non referenziate, non solo “sperare” che il clone basti.
- **R9 / run sovrapposti**: il token deve invalidare anche i run pendenti al cambio analisi/Live off; test con runner differito.
- **R10 / a11y cosmetica**: testare il click sulla label e il focus del fill handle, non solo il nome accessibile.
- **R16 / mount nascosto**: il `DataGrid` nascosto non deve continuare a misurare un viewport 0; il `ResizeObserver` esistente va verificato al ritorno sulla tab.
- **File-size**: `App.tsx` a 620 righe; nuove responsabilità in hook, non inline.

## Test e verifica

- **Unit**: `outputSelection`, `useGridHistory` (revisione iniziale/immutabilità), `formulas` (dipendenze), `columns`/`roles` (matrice ColType), `outputs`/`project` (round-trip e legacy), `stratcox/run`.
- **E2E**: R8 (reset filtro), R9 (live + ruolo invalido + cambio parametri), R10 (label click, cella, fill handle), R12 (time=X, predittore categorico), R15 (resize), R16 (selezione/freeze tra tab, New/Import), R18 (reload senza stale, edit dopo reload), UX (toolbar, Add level).
- **Comandi**: `npm run check`, `npm run test:e2e`, `npm run build`; benchmark `node scripts/bench-grid.mjs`.
- **Misura R4**: 5k e 50k, formula indipendente e dipendente; riportare i numeri nel report.

## Criteri di accettazione

- R8: rimosso l'ultimo risultato dell'analisi filtrata, il filtro torna a “All analyses” e le altre card sono visibili; lo stato vuoto difensivo non è il percorso atteso.
- R9: nessun “syncing…” permanente; un run vecchio non pubblica dopo un cambio parametri, Live off o cambio analisi.
- R10: label cliccabile che porta il focus; celle con nome; fill handle raggiungibile con Tab e attivabile con Enter/Shift+Enter.
- R11/R12: nessuna colonna incompatibile selezionabile nei ruoli continui; `validateRoleTypes` invariato; Stratified Cox rifiuta time/event anche con un'altra covariata valida.
- R15/R16: libreria visibile dopo resize a ≥1280; freeze/inspector/selezione sopravvivono al cambio tab; New/Import/Open azzerano la selezione.
- R4: 50k×10 con 1 formula indipendente ≤30 ms/tasto; caso dipendente e strutturale documentato.
- R18: reload senza modifiche → nessuna stale; modifica dopo reload → stale; file legacy → nessuna stale.
- UX: toolbar leggibile a 1024/1280 e azioni raggiungibili da tastiera; “Add level” aggiunge il livello e restituisce il focus alla cella.
- `npm run check`, `npm run test:e2e`, `npm run build` verdi; nessun chunk >500 kB.

## Domande aperte / condizioni per l'assenso

1. **Filtro analysis dopo reload**: il piano non persiste lo stato del filtro e quindi non marca stale le card prodotte con filtro analysis. Se il prodotto vuole quel comportamento, va aggiunto un passo di persistenza del filtro (fuori scope).
2. **“Add level”**: se l'apertura di `LevelsEditor` dalla cella supera ~30 righe, il passo 8 diventa un follow-up separato; la toolbar resta nel piano.
3. **R4 dipendente**: il budget di 30 ms vale per la formula indipendente; il caso dipendente viene misurato e documentato, non promesso.

## Stato di implementazione (2026-10-29)

Tutti gli otto passi sono stati implementati.

- **R8** — `outputSelection.ts`, reset del filtro invalido, stato vuoto difensivo; test unit + e2e.
- **R9/R17** — `liveGate.ts`, token di generazione, runner da ref, deps sulla firma dello slice; test unit + e2e.
- **R10** — `Field` associa i controlli raw, `VariableSelect` con id, liste come fieldset, celle con nome, header con scope, fill handle con Tab/Enter; test e2e.
- **R11/R12** — `isContinuousColumn`, `continuousColumnIndexes`, form continui aggiornati, `validateRoleTypes` invariato; guard e deselezione Stratified Cox; test unit + e2e.
- **R15/R16** — `useMediaQuery`, `DataWorkspace` montata e nascosta, reset su `datasetId` e `resetKey`; test e2e.
- **R4** — fast-path `changedCell`/`changedCol`; benchmark `npm run bench:grid`; test formule.
- **R18** — persistenza `dataRevision`/`datasetId`/`ciLevel`, revisione iniziale, reload stale; `filterSignature` resta session-only e documentato.
- **UX** — toolbar con gruppi File/Edit/Tools/View e “Add level” dalla cella; test e2e.

Verifica: `npm run check` 461 test; Playwright 34 passed/26 skipped; build senza chunk >500 kB. Limiti residui: filtro analysis non persistito, R13 non riproducibile, R19 da verificare, formula dipendente ~37,5 ms a 50k.
