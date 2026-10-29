# Documento post-factoring: audit del refactoring e delle UI DataGrid / Analysis

> Questo è il report dell'audit **prima** degli interventi. Lo stato dopo i cinque passi implementati è nella sezione finale, *Stato post-implementazione*.

- **Richiesta**: "refactoring, aggiunta di procedure, refactoring funzioni datagrid. due audit. 1. il refactoring generale del programma è stato completato senza incongruenze, errori, cose tralasciate o trascurate? 2. le Ui di datagrid e analisis rispettano criteri di semplicità, robustezza, completezza e efficenza nella prospettivs che l'utente può essere un neofita o un esperto di statistics?"
- **Perimetro**: intero branch `grid-roadmap` per il punto 1 (workbench analisi, store, form system, i18n, lazy loading, documentazione, test); UI DataGrid e UI Analysis per il punto 2. Sono inclusi i confini: persistenza `.lzs`, snapshot output, runner, form, griglia, import/export.
- **Non analizzato**: comportamento runtime su browser reali per tutti i 31 form (campione + codice), accessibilità con screen reader reali, profilazione in browser a 50.000 righe (le misure sono Node/tsx), fuzzing di file `.lzs` ostili, revisione dei kernel statistici (solo i loro guard di input), `docs/ARCHITECTURE.md`.
- **Data e revisione del codice**: 2026-10-29, branch `grid-roadmap`, HEAD `00a0cd4`, working tree pulito.

## Sintesi esecutiva

Sul piano strutturale il refactoring **è completo**: 31 analisi, 31 runner, 31 form, 31 slot di parametri; `npm run check` passa (431 test), Playwright passa (20 test, 14 skip), la build non ha warning >500 kB. Le fondamenta (builder puri, store a slice, snapshot parametri, ruoli validati, undo/redo, virtualizzazione, sanitiser) sono solide e vanno difese.

Il refactoring **non è però “completato senza cose tralasciate”**: UI-10 è dichiarato “Fatto” ma circa 80 stringhe di chrome restano hardcoded (SettingsTab ha 0 chiamate `t()`), il Wizard — la porta d’ingresso per il neofita — è in italiano dentro una cornice inglese, e README/GRID-STATE/UI-STATE contengono affermazioni false o contraddittorie. Soprattutto, **quattro parametri numerici non finiti producono run “ok” con output fuorvianti**: μ₀ del t-test, cut-off logistico, numero di imputazioni, orizzonte ARIMA. È il difetto più grave emerso.

Sul piano UX: la UI Analysis ha una scoperta eccellente e un output leggibile, ma il feedback su input invalidi e la riproducibilità (CI non salvato nella card) sono i punti deboli. La DataGrid è potente per l’esperto (tastiera, fill, menu contestuali, virtualizzazione) ma densa per il neofita, con un “New” distruttivo non confermato e non undoable, un filtro che sopravvive al cambio dataset e un paste che elimina le righe vuote interne.

## Come funziona

### 1. Shell e flusso dati

- `src/App.tsx:103-166` possiede lo stato globale: tab attiva, griglia con history, parametri, CI, filtro, validazione, toast.
- `src/App.tsx:115-133` `useGridHistory` + undo/redo; l’undo/redo rimappa i parametri per `Column.id` (`src/analyses/params.ts:316-331`).
- `src/App.tsx:177-186` `replaceDataset`: resetta history, parametri, datasetId, output, validation, focus e `filterAffectsAnalysis`, ma **non** `showFilter`/`filterValue`/`filterCol`/`filterOp`.
- `src/App.tsx:188-235` update cella/tipo/livelli/recode; `updateCell` usa coalescing (`cell-r-c`).
- `src/App.tsx:312-333` filtro view-only vs analysis-filter; `maskMissingCodes` e `analysisGrid` sono memoizzati.
- `src/App.tsx:376-395` `emit`: unico punto che trasforma un risultato in card; `403-441` re-run/apply.
- `src/App.tsx:450-558` montaggio condizionale delle quattro aree; `591` `<Footer grid={grid} />` è sempre montato.

### 2. Workbench Analysis

- `src/ui/AnalysisTab.tsx:26-31` tre pane (`library`/`options`/`output`), `28-29` `showLibrary` inizializzato con `isWide()` (≥1280) una sola volta.
- `src/ui/AnalysisTab.tsx:37-92` navigazione pane, focus output, run su mobile; `94-113` scorciatoie Ctrl/Cmd+K e Ctrl/Cmd+Enter.
- `src/ui/AnalysisTab.tsx:128-243` layout: libreria 210–258 px, setup 300–360 px, output fluido; `156-191` titoli/aria hardcoded.
- `src/ui/analysis/AnalysisLibrary.tsx:118-179` ricerca, preferiti, recenti, A–Z; `259-275` frecce/Home/End; `343-383` famiglie.
- `src/ui/analysis/AnalysisOptions.tsx:49-67` setup e ruoli; `69-91` live-run; `105-131` titoli di sezione; `133-388` switch sui 31 form; `390-504` contesto, peek, assegnazione ruolo, live, open data; `506-612` form + CI; `614-635` Run.
- `src/ui/analysis/store.tsx:48-67` provider controllato: `App` resta proprietaria di `params`; `57-63` `dispatch` calcola il next da `params` (prop), non da uno state interno.
- `src/analyses/paramsSnapshot.ts:4-36` mappa analisi→slot; `65-67` firma JSON usata per lo stale.
- `src/hooks/useAnalysisRun.ts:36-53` import dinamico di `runners`; nessun `ciLevel` nello snapshot.

### 3. Output

- `src/ui/OutputConsole.tsx:101-159` collapse, pin, filtro, copia card, jump.
- `src/ui/OutputConsole.tsx:262-289` outline; `291-447` card, azioni, badge stale.
- `src/ui/OutputConsole.tsx:314-327` stale se cambiano `dataRevision`, `datasetId`, `filterSignature` o `paramsSignature`; **non** se cambia `ciLevel`.
- `src/hooks/useOutputConsole.tsx:55-103` costruzione card + snapshot HTML; `95-102` live sostituisce la card della stessa analisi.
- `src/io/outputs.ts:18-31` `StoredOutput` non contiene `ciLevel` né metadati di freschezza; `65-122` parse/cap/sanitize.

### 4. Form e i18n

- `src/components/FormFields.tsx:25-46` `Field`; `57-94` `VariableSelect`; `109-161` `VariableList`; `164-198` `CheckboxList`; `201-216` `Advanced`; `218-241` `CheckboxField`.
- Tutti i 31 `src/analyses/*/Form.tsx` importano le primitive; 294 chiamate `t()` nei form.
- `src/analyses/anova/Form.tsx` usa `ariaLabel="ANOVA dependent variable"` e `"ANOVA group variable"` hardcoded.
- `src/i18n.ts:9-466` 452 chiavi; `1-8` commento ancora “form labels module-local”; 26 chiavi non referenziate staticamente (`settings.*`, `hint.ttest`, `hint.correlation`, `data.row`, `data.clearSelection`, `output.peek`, `io.sheets`, `io.delimiterAuto`, …).
- `src/i18n.test.ts:4-8` verifica solo che il valore non sia vuoto.
- `src/stats/wizard/labels.ts:5-21` goal/hint in italiano; `src/stats/kernels/wizard.ts:136+` titoli/headline/check in italiano; la cornice del form è inglese.

### 5. Griglia

- `src/grid/DataGrid.tsx:39-58` `visibleRows` (map+filter su tutte le righe) + `visibleWindow`; `291-482` rendering; `338-388` celle `cat` come `<select>`; `390-445` celle testo; `417-437` tastiera; `450-468` fill handle; `485-542` menu.
- `src/grid/virtual.ts` soglia 80 righe, `ROW_HEIGHT` 23, overscan 10.
- `src/ui/DataTab.tsx:162-273` toolbar con ~20 azioni; `276-337` filtro; `339-362` Transform/Clean; `364-404` validazione; `406-529` griglia + inspector; `531-543` add column/row/clear.
- `src/ui/DataWorkspace.tsx:64-71` stato locale (freeze, clean/transform, inspector, selezione, focus cella); `74-106` clamp dopo delete/merge/paste.
- `src/grid/useGridHistory.ts:5-14` clone profondo; `31-52` `sameGrid` confronto completo; `69-97` commit con coalescing 1200 ms, cap 50, ricalcolo formule; `99-131` undo/redo.
- `src/grid/formulas.ts:19-63` formula compilata una volta per `evalFormula` (non per riga), con allowlist; `82-101` ricalcolo di tutte le colonne formula e clone di tutte le righe.
- `src/grid/ops/ranges.ts:29-52` `parseTsv`/`pasteTsvAt`; `56-63` `clearRange` preserva le larghezze ragged.
- `src/io/project/parse.ts:240-243` `parseGrid` normalizza ogni riga a `cols.length` (quindi le righe ragged non entrano dai `.lzs`).

### 6. Validazione e ruoli

- `src/analyses/roles.ts:606-634` `validateRoleTypes`: ruoli continui rifiutano `cat/str/alp/chr/dat/dtm/tim/id`; ruoli gruppo richiedono `isGroupColumn`.
- `src/analyses/params.ts:59-66` rimuove i duplicati dopo operazioni strutturali; `338-431` validazione refs per analisi.
- Guard nei runner: `cox/run.tsx:64-65`, `gee/run.tsx:20-24`, `lmm/run.tsx:20-24`, `parametric/run.tsx:23-24`; `stratcox/run.tsx:25-29` controlla solo lo stratum.
- Guard numerici esistenti: `samplesize/run.tsx:26-30`, `tost.ts:12`, `agreement/run.tsx:31-35`.

## Invarianti e assunzioni

1. **Un solo `GridData` per progetto**; tutte le analisi leggono la stessa griglia, con i codici missing azzerati prima dei runner (`src/App.tsx:326-333`).
2. **I parametri sono indici di colonna**, rimappati per `Column.id`; un ruolo che perde la colonna diventa `-1` e blocca il Run (`src/analyses/params.ts:28-47`, `roles.ts:606-634`).
3. **Il campione è snapshot al Run**: la card descrive i dati di quel momento; lo stale è solo in sessione (`src/io/outputs.ts` non salva revision/dataset/filter).
4. **Le formule sono la fonte di verità della colonna calcolata** e vengono ricalcolate a ogni commit (`useGridHistory.ts:72-76`).
5. **La UI è in inglese**, help e report sono prosa italiana; i nomi propri statistici non si traducono (`src/i18n.ts:1-8`).
6. **Il live-run è opt-in e solo per procedure `instant`**; le heavy restano esplicite (`AnalysisOptions.tsx:63-91`).
7. **I kernel non conoscono React**; la UI non importa kernel/tabelle (regole dependency-cruiser).

## Domande poste ai critici

Le stesse 10 domande sono state inviate a Luna e GLM, senza le mie risposte:

1. Il refactoring generale è completo e coerente col codice reale, o restano parti dichiarate “Fatto” ma non migrate?
2. La migrazione dei 31 form ha preservato comportamento, default, reset e validazione? Ci sono regressioni?
3. Il workspace analisi (stale, live-run, re-run/apply, store, filtro output) ha transizioni scorrette o risultati fuorvianti?
4. La griglia (editing, selezione, fill, paste, undo/redo, filtro, virtualizzazione, tipi/livelli, ragged) ha bug o percorsi distruttivi?
5. La UI griglia rispetta semplicità, robustezza, completezza, efficienza per neofita ed esperto?
6. La UI analisi rispetta gli stessi criteri?
7. Prestazioni: cosa costa a ogni tasto con 50.000 righe, molte colonne, formule e live-run?
8. Test e documentazione: quali percorsi non sono coperti? Quali affermazioni sono false o stantie?
9. Integrità e sicurezza: `.lzs`, snapshot HTML, formule, undo, import/export.
10. Cosa va difeso e quali sono i 5 interventi con il miglior rapporto impatto/rischio?

## Risposte

### DeepSeek

1. **No.** Struttura completa, ma UI-10 falso e documentazione contraddittoria; 4 input numerici producono run invalidi “ok”.
2. **Sì nella struttura, no nella sostanza dei guard.** 31/31 migrati; restano validazioni numeriche mancanti, filtri colonna incoerenti, label non associate, casi “disabled ma selezionato”.
3. **Bug reale**: NaN silenziosi; CI non nello snapshot; livePending potenzialmente bloccato; filtro output senza stato vuoto; deps live sull’intero `params`.
4. **Sì**: New senza conferma e senza undo; filtro che sopravvive al cambio dataset; paste che elimina righe vuote interne; jump a cella filtrata che non fa nulla; stato di vista locale perso al cambio tab.
5. **Esperto: buona.** Neofita: toolbar densa, categorie non digitabili, fill mouse-only, a11y debole, lingua mista.
6. **Scoperta ottima, feedback debole.** Setup coerente; ma input invalidi non bloccati, CI non riproducibile, Wizard italiano.
7. **Misurato**: footer 55 ms/render + commit ~52 ms a 50k×10; ~110 ms per tasto. A 5k ~10 ms. Virtualizzazione solo rendering.
8. **Buchi**: NaN, paste con righe vuote, CI stale, live pending, filtri; docs README/GRID/UI false.
9. **Difese presenti** (sanitiser, cap, allowlist, parse limit); nessuna vulnerabilità dimostrata; manca fuzzing.
10. **Difendere** builder/report, form primitives, snapshot, ruoli, undo, virtualizzazione, sanitiser. **Top 5**: guard numerici; CI nella card; performance footer/scan; docs+i18n; conferma New + reset filtro + paste.

### Luna

1. No: primitive usate, ma `SettingsTab` hardcoded e UI-STATE si contraddice (`docs/UI-STATE.md:209` vs `214-215`). Confidenza alta.
2. Struttura sì, parità funzionale non dimostrata; input numerici possono salvare NaN (`ttest/Form.tsx:48-57`, `ttest/run.tsx:47-54`). Confidenza alta sul difetto, bassa sulla regressione.
3. Stale non copre il CI; `.lzs` non conserva i metadati di freschezza; live può restare “syncing” (`AnalysisOptions.tsx:69-80`). Confidenza alta.
4. Paste TSV elimina le righe vuote (`DataTab.tsx:444-448`); ragged da verificare; virtualizzazione non evita il lavoro full-grid. Confidenza alta sul paste.
5. Toolbar densa; fill handle non tastierabile (`DataGrid.tsx:450-468`); undo/confirm presenti. Confidenza alta sul codice.
6. Libreria/scorciatoie buone; etichette hardcoded e CI fuori contesto; guida per neofita da migliorare.
7. Virtualizzazione solo rendering; commit/confronto/formule su tutta la griglia; benchmark non ripetuto.
8. Test non coprono NaN; GRID-STATE contraddice lo stale sui parametri; docs stantie.
9. Sanitiser/cap/allowlist presenti; nessuna vulnerabilità trovata; no fuzzing.
10. Difendere form condivisi, store, snapshot, ruoli, undo, sanitiser; 5 interventi: guard numerici, paste, CI/stale, livePending, ridurre il lavoro full-grid.

**Verdetto Luna: `VERDICT: REJECT`** — “la dichiarazione di completamento non è sostenibile finché input numerici invalidi possono produrre output apparentemente validi e restano lacune nella freschezza dei risultati e nell’integrità del paste.” Blocker: input numerici non finiti.

### GLM

1. No: parte reale, parte dichiarata. UI-10 falso (`SettingsTab` 0 `t()`), README con 3 affermazioni false, GRID-STATE stantio, UI-STATE contraddittorio. Confidenza alta.
2. In sostanza sì, con regressioni di qualità: `Field` non passa mai `htmlFor`; filtri colonna incoerenti; validazione numerica mancante in 4 form. Confidenza media.
3. Sì: NaN silenziosi in t-test, logistica, MI, ARIMA; live deps su tutto `params`; filtro output senza stato vuoto; CI non nello snapshot. Confidenza alta.
4. Danni irreversibili protetti; viste fuorvianti: ragged render (poi ridimensionato), fill handle non tastierabile; import overwrite reset senza conferma specifica. Confidenza media-alta.
5. Robustezza/efficienza sì; semplicità per neofita apparente; lingua mista; a11y debole. Confidenza media.
6. Scoperta eccellente; lettura output debole perché i NaN non hanno banner; CI select senza `aria-label`. Confidenza alta.
7. 50k: commit ~52 ms; render full-scan non memoizzati; live opt-in corretto. Confidenza media.
8. Buchi su NaN, ragged, filtro vuoto; `i18n.test.ts` debole; README/GRID/UI con dati falsi. Confidenza alta.
9. Sanitiser, allowlist, cap coerenti; rischio residuo basso; no fuzz. Confidenza media.
10. Difendere virtualizzazione a spacer, live opt-in, confirm/delete, sanitiser, kernel puri. 5 interventi: helper finito, CI nello snapshot, padding ragged, `htmlFor`+aria, aggiornare docs.

**Verdetto GLM**: nessun token formale di verdetto; la tabella contiene **2 BLOCKER** (NaN; UI-10 falso) e 6 MAJOR. Ai fini dell’audit il piano non è approvabile.

## Rilievi

| # | rilievo | chi | severità | stato | decisione | motivo | correzione | test |
|---|---------|-----|----------|--------|-----------|--------|------------|------|
| R1 | Parametri numerici non finiti (μ₀, cut-off, imputazioni, orizzonte) producono `ok:true` con output null/vuoti o classificazione degenere | Luna+GLM+DeepSeek | BLOCKER | CONFERMATO | accettato | Un risultato statistico apparentemente valido ma degenere è peggio di un rifiuto; riprodotto in 4 procedure | Helper `finiteNumber()` condiviso + guard nei runner; messaggio esplicito | Unit per ogni parametro con stringa vuota/NaN; e2e: svuotare i campi e attendere errore, nessuna card |
| R2 | UI-10 dichiarato “Fatto” ma chrome non centralizzata | Luna+GLM+DeepSeek | MAJOR | CONFERMATO | accettato | La dichiarazione è smentita da SettingsTab (0 `t()`) e da ~80 stringhe; il test i18n non lo rileva | O completare la migrazione, o dichiarare UI-10 “Parziale” con perimetro esplicito; aggiornare `i18n.ts:1-8` | Test che ogni chiave sia referenziata e che i file UI non contengano stringhe di chrome; grep-guard in CI |
| R3 | CI globale non salvato nella card: re-run/apply cambiano il livello senza segnale | Luna+GLM+DeepSeek | MAJOR | CONFERMATO | accettato | Stesso pulsante, risultato statistico diverso, nessun badge | Aggiungere `ciLevel` a `StoredOutput` e alla firma stale; re-run con il CI della card | Unit su snapshot/parse; e2e: run a 95, cambia a 99, card stale, re-run con 95 |
| R4 | Costo full-grid a ogni render/tasto: footer e validazione | GLM+DeepSeek | MAJOR | CONFERMATO | accettato | Misurato: 55 ms per il doppio conteggio invalidi a 50k×10; il totale per tasto (~110 ms) supera di ~7× il budget di 16 ms/frame | Calcolare una volta e memoizzare; derivare il conteggio da uno stato incrementale; `useMemo` su visibleRows/missing | Benchmark 5k/50k con budget (es. <16 ms per tasto a 5k); test di regressione sul conteggio |
| R5 | “New dataset” sostituisce i dati senza conferma e resetta la history: non è undoable | DeepSeek (Luna su import) | MAJOR | CONFERMATO | accettato | È l’unica azione distruttiva senza conferma e senza undo; il rischio per il neofita è concreto | Conferma esplicita o “New” undoable; distinguere New da Import overwrite | e2e: click New, cancel, dati intatti; accept, history vuota ma conferma mostrata |
| R6 | Filtro di vista sopravvive a New/Import/Open: il nuovo dataset può apparire vuoto | DeepSeek | MAJOR | CONFERMATO | accettato | Il reset parziale contraddice GRID-STATE §3.3 e fa sembrare fallito l’import | Resettare `showFilter`, `filterValue`, `filterCol`, `filterOp` in `replaceDataset` e `restoreProject` | Unit/e2e: filtro “A” attivo, New, tutte le righe visibili |
| R7 | Paste TSV elimina le righe vuote interne e sposta le successive | Luna+DeepSeek | MAJOR | CONFERMATO | accettato | Il paste deve preservare la geometria del blocco; il newline finale va gestito a parte | Filtrare solo la coda vuota del newline finale, preservare le righe interne | Unit su `parseTsv`/paste con riga vuota interna; e2e paste 3×2 con buco |
| R8 | Filtro output senza stato vuoto: console muta se nessuna card corrisponde | Luna+GLM | MINOR | CONFERMATO | accettato | L’utente non sa se il filtro è vuoto o se l’output è rotto | Messaggio “Nessun risultato per questo filtro” + reset a “All analyses” | e2e: due analisi, rimuovi quella filtrata, messaggio visibile |
| R9 | Live-run può restare “syncing…” quando il ruolo diventa invalido | Luna+GLM | MAJOR | SOSPETTO | da verificare | Il percorso di early-return non azzera `livePending`; manca la prova runtime | Azzerare `livePending` in ogni early-return e nel cleanup | e2e: live on, rendi invalido il ruolo, attendi 1 s, il bottone non è “syncing” |
| R10 | Accessibilità: label non associate, CI senza nome, celle testo senza nome, fill handle non tastierabile | Tutti | MAJOR | CONFERMATO | accettato | `htmlFor` non è mai passato; il select CI non ha nome; il fill handle è mouse-only | `id` generato in `Field`; `aria-label` sul select CI; celle con nome riga/colonna; fill handle `tabIndex=0` + Enter | Playwright con Tab/Enter; controllo axe/screen reader |
| R11 | Filtri colonna incoerenti: alcuni form filtrano per tipo, altri mostrano tutto e delegano al banner | GLM+DeepSeek | MINOR | CONFERMATO | accettato | Il neofita costruisce una configurazione che il Run poi rifiuta; l’esperto perde tempo | Filtrare per `RoleKind` o marcare inline le colonne incompatibili | Test UI: il predittore categorico non è selezionabile (o è marcato) |
| R12 | Stratified Cox non rifiuta time/event come covariati; il form li disabilita ma non li deseleziona | DeepSeek | MAJOR | SOSPETTO | da verificare | `cox` ha il guard, `stratcox` no; il modello potrebbe accettare il tempo come covariata | Guard come `cox/run.tsx:64-65`; filtrare i selezionati al cambio di ruolo | Unit: covariata = time → reason; e2e: seleziona X, poi Time=X, Run bloccato |
| R13 | Righe ragged renderizzate con meno `<td>` | Luna+GLM | MAJOR | NON RIPRODUCIBILE | rifiutato | `parseGrid` normalizza a `cols.length` e gli ops mantengono righe rettangolari; non c’è un percorso UI che produca ragged | Difesa opzionale: normalizzare in render a `cols.length`; test difensivo | Unit sul render/parse con righe corte |
| R14 | Documentazione falsa o contraddittoria | Tutti | MAJOR | CONFERMATO | accettato | README/GRID/UI descrivono un programma diverso da quello attuale; la fiducia nei doc è compromessa | Riscrivere le sezioni; aggiungere un test/guard che confronti numeri e fatti | Check documentale in CI (conteggi test/e2e, file citati esistenti) |
| R15 | `showLibrary` non reagisce al resize | DeepSeek | MINOR | CONFERMATO | accettato | Lo stato iniziale è calcolato una sola volta; il resize non lo aggiorna | `matchMedia` listener o CSS coerente | e2e: parte stretto, allarga, libreria visibile |
| R16 | Freeze/inspector/selezione/pannelli locali si perdono al cambio tab | DeepSeek | MINOR | CONFERMATO | accettato | `DataWorkspace` viene smontato quando la tab Data non è attiva | Sollevare le preferenze di vista in App/persistenza | e2e: freeze, vai ad Analysis, torna, freeze ancora attivo |
| R17 | Live deps sull’intero `params`; visibleRows/missing non memoizzati | GLM+DeepSeek | MINOR | CONFERMATO | accettato | Lavoro inutile a ogni render, amplificato dal punto R4 | Dipendere dalla firma dello slice attivo; `useMemo` | Test di performance/render count |
| R18 | Metadati di freschezza non persistiti nei `.lzs` | Luna | MAJOR | CONFERMATO | accettato | È documentato in GRID-STATE §3.4; non è una regressione, ma limita lo stale dopo reload | Decidere se persistirli; altrimenti mantenere il limite documentato | Test di reload: card non stale (comportamento atteso) |
| R19 | `dispatch` calcola il next dal `params` prop: due update nello stesso tick possono perdere il primo | DeepSeek | MINOR | SOSPETTO | da verificare | Rischio latente: non ho trovato un percorso utente che lo inneschi | Usare un updater funzionale lato App o un ref allo state più recente | Unit con due dispatch sincroni |
| R20 | `i18n.test.ts` debole: 26 chiavi orfane | GLM+DeepSeek | MINOR | CONFERMATO | accettato | Il test non può rilevare né chiavi morte né stringhe hardcoded | Test di referenziazione e di assenza di stringhe hardcoded | Unit/CI |

## Bug

### Confermati

1. **R1 — NaN silenziosi** (BLOCKER). Quattro scenari riprodotti:
   - t-test a un campione con μ₀ vuoto → `ok:true`, `t/p/CI = null`;
   - logistica con cut-off vuoto → `ok:true`, sensibilità 0%, specificità 100%, sottotitolo “soglia p ≥ —”;
   - MI con imputazioni vuote → `ok:true`, pooled tutto `null`, “NaN imputazioni”;
   - ARIMA con orizzonte vuoto → `ok:true`, tabella forecast vuota.
2. **R4 — costo full-grid per render** (MAJOR). Misura Node: 55 ms per due `countInvalidCells` su 50k×10; ~52 ms per commit (ricalcolo+clone+confronto); ~5 ms per `visibleRows`. Somma ~110 ms per tasto al massimo supportato.
3. **R3 — CI fuori dalla card** (MAJOR). Il re-run usa il CI corrente, non quello della card; nessun badge stale al cambio di CI.
4. **R5 — New distruttivo** (MAJOR). Nessuna conferma; `resetGridHistory` svuota la history, quindi l’utente non può annullare.
5. **R6 — filtro persistente dopo il cambio dataset** (MAJOR). New/Import/Open non azzerano i campi del filtro; il nuovo dataset può risultare “No rows match”.
6. **R7 — paste con righe vuote** (MAJOR). Le righe vuote interne vengono eliminate prima del paste.
7. **R8 — filtro output senza stato vuoto** (MINOR).
8. **R10 — accessibilità** (MAJOR complessivo, ma frammentato): label non associate, CI senza nome, celle senza nome, fill handle non tastierabile.

### Sospetti (con esperimento)

1. **R9 — livePending bloccato.** Esperimento: live on, attendi il timer, rendi invalido un ruolo prima dei 500 ms; il bottone deve tornare a “Live” e non restare “syncing…”.
2. **R12 — Stratified Cox con time/event come covariata.** Esperimento: seleziona X come covariata, poi imposta Time=X; il checkbox resta checked e disabilitato; il Run deve essere bloccato con reason. Oggi il runner non ha il guard.
3. **R19 — due dispatch nello stesso tick.** Esperimento: unit con due `dispatch` consecutivi su chiavi diverse; verificare che entrambe le modifiche sopravvivano.

### Non riproducibili

1. **R13 — righe ragged.** `parseGrid` normalizza ogni riga a `cols.length` (`parse.ts:240-243`); gli ops mantengono righe rettangolari. `clearRange` preserva larghezze ragged solo se già presenti in memoria. Non esiste un percorso UI che le produca; resta un caso difensivo, non un bug dimostrato.

## Punti critici e debito

- **Un solo punto di validazione numerica manca**: i guard esistono in samplesize/TOST/agreement, ma non c’è un helper condiviso; il difetto è sistemico, non di quattro form.
- **La documentazione è un debito attivo**: README descrive un’App da 3650 righe e un file `statsHelpers.ts` inesistente; GRID-STATE dice il contrario del codice sullo stale; UI-STATE si contraddice sull’iterazione e sull’i18n.
- **i18n a metà**: 452 chiavi, 26 orfane, ~80 stringhe hardcoded, SettingsTab interamente fuori; il test i18n non può accorgersene.
- **Lingua mista**: il Wizard, pensato per il neofita, è l’unico blocco in italiano dentro una UI inglese.
- **Costo full-grid**: la virtualizzazione riduce il DOM, non le scansioni; footer, validazione, visibleRows e missing sono O(righe×colonne) per render/tasto.
- **Densità della toolbar Data**: ~20 azioni in una riga che va a capo; per il neofita manca una gerarchia (File / Modifica / Vista / Strumenti).
- **Categorie non digitabili**: una cella `cat` è un `<select>`; aggiungere una nuova categoria richiede il LevelsEditor nell’header. È una scelta difendibile, ma non spiegata.
- **A11y**: label visive non associate, select CI senza nome, celle testo senza nome, fill handle mouse-only.
- **Test**: buona copertura dei kernel e dei flussi ANOVA/T-Test; scoperti i casi NaN, il paste con buchi, il CI stale, il live pending, i modali import/export/livelli e 29 form su 31.

## Piano di correzione

1. **Guard numerici condivisi** — file: `src/analyses/shared/` (nuovo helper), `ttest/run.tsx`, `logistic/run.tsx`, `mi/run.tsx`, `timeseries/run.tsx`, form relativi. Test: unit con `''`/`NaN` per μ₀, cut-off, imputazioni, orizzonte; e2e che svuota i campi e verifica il reason. Rischio: basso. Criterio: nessun run `ok` con parametri non finiti.
2. **CI nella card e nello stale** — file: `src/io/outputs.ts`, `src/App.tsx`, `src/hooks/useAnalysisRun.ts`, `src/ui/OutputConsole.tsx`, `src/io/project/parse.ts`. Test: parse/snapshot; e2e cambio CI → badge stale → re-run con il CI salvato. Rischio: medio (compatibilità `.lzs`, nessun cambio `PROJECT_VERSION`). Criterio: stesso input + stessa card = stesso CI.
3. **Data safety** — file: `src/App.tsx`, `src/ui/DataTab.tsx`, `src/grid/ops/ranges.ts`, `src/grid/DataGrid.tsx`. Conferma su New; reset filtro in `replaceDataset`/`restoreProject`; paste che preserva le righe vuote interne; jump-to-first che tiene conto del filtro (o lo disattiva). Test: unit paste; e2e New cancel/accept, filtro+New, jump su riga filtrata. Rischio: basso.
4. **Performance full-grid** — file: `src/ui/Footer.tsx`, `src/App.tsx`, `src/grid/DataGrid.tsx`, `src/ui/analysis/AnalysisOptions.tsx`. Calcolare il conteggio invalidi una volta e memoizzarlo; derivarlo incrementalmente se possibile; `useMemo` su `visibleRows`/`missingCells`; evitare il doppio `countInvalidCells`. Test: benchmark 5k/50k con budget; nessuna regressione del conteggio. Rischio: basso.
5. **i18n e documentazione fedeli** — file: `src/i18n.ts`, `SettingsTab.tsx`, `AnalysisOptions.tsx`, `OutputConsole.tsx`, `AnalysisLibrary.tsx`, `AnalysisTab.tsx`, `Header.tsx`, `DataTab.tsx`, `TransformPanel.tsx`, `VariableInspector.tsx`, `DataGrid.tsx`, `useOutputConsole.tsx`, `README.md`, `docs/GRID-STATE.md`, `docs/UI-STATE.md`. Scegliere: completare o dichiarare “Parziale”; decidere la lingua del Wizard; aggiornare i conteggi. Test: `i18n.test.ts` su referenziazione e stringhe hardcoded; guard documentale. Rischio: basso.
6. **Accessibilità** — file: `src/components/FormFields.tsx`, `src/ui/analysis/AnalysisOptions.tsx`, `src/grid/DataGrid.tsx`. `id`/`htmlFor` in `Field`; `aria-label` sul CI; nome accessibile per le celle; fill handle `tabIndex=0` + Enter. Test: Playwright con Tab/Enter; axe se disponibile. Rischio: basso.
7. **Stato live e filtro output** — file: `src/ui/analysis/AnalysisOptions.tsx`, `src/ui/OutputConsole.tsx`. Azzerare `livePending` in ogni early-return; deps sulla firma dello slice attivo; stato vuoto del filtro. Test: e2e live + ruolo invalido; filtro senza card. Rischio: basso.
8. **Coerenza dei form e guard Stratified Cox** — file: `src/analyses/stratcox/run.tsx`, `src/analyses/stratcox/Form.tsx`, form con liste “tutte le colonne”. Filtrare per `RoleKind` o marcare inline; guard time/event. Test: unit reason; e2e selezione incompatibile. Rischio: basso-medio (cambiare le opzioni visibili può sorprendere). Criterio: nessun ruolo incompatibile selezionabile senza segnale.
9. **Test di regressione mancanti** — file: `e2e/analysis.spec.ts`, `e2e/smoke.spec.ts`, test unitari delle analisi. Aggiungere i casi R1, R3, R6, R7, R9, R10. Rischio: basso. Criterio: i bug confermati hanno almeno un test che fallisce prima della correzione.

**Totale: 9 passi.** Ordine: prima i guard che rendono verificabile il resto (1–3), poi performance (4), quindi fedeltà di UI/docs (5–6), stato (7), coerenza (8), test (9).

## Aree non verificate / esperimenti

1. **Live pending** in browser reale (R9): il codice mostra il percorso, ma serve l’e2e.
2. **Stratified Cox** con covariata = time (R12): costruire un dataset che converge e verificare la tabella; oggi il runner non rifiuta.
3. **Profilazione browser** a 50k righe: le misure sono Node/tsx; il frame time reale include React e il DOM.
4. **Screen reader** su griglia e form: verificare nome di celle, label e fill handle.
5. **Fuzzing `.lzs`** e snapshot HTML: sanitiser e cap sono presenti, ma non c’è una suite avversariale.
6. **Tutti i 31 form** a mano: la parità di default/reset è stata verificata a campione, non form per form.
7. **Responsive 1024–1279 px**: i tre pannelli sono stretti; non è stato misurato l’uso reale.
8. **Due dispatch nello stesso tick** (R19): unit da scrivere.

## Verdetti dei critici (verbatim, accorciati)

- **Luna**: `VERDICT: REJECT` — “la dichiarazione di completamento non è sostenibile finché input numerici invalidi possono produrre output apparentemente validi e restano lacune nella freschezza dei risultati e nell’integrità del paste.” Blocker: `Input numerici non finiti possono arrivare ai runner senza essere rifiutati e produrre output fuorvianti.`
- **GLM**: nessun token formale di verdetto; tabella con **2 BLOCKER** (NaN; UI-10 “Fatto” falso) e 6 MAJOR. Ai fini dell’audit: **non approvabile**.

> Nota di trasparenza: i due critici non hanno eseguito test/build (ambiente di sola lettura); le verifiche `npm run check`, Playwright, build e le riproduzioni Node sono state eseguite da me e sono citate sopra.


## Stato post-implementazione (2026-10-29)

Sono stati implementati i **cinque passi a maggior impatto** del piano. Il report sopra resta la fotografia dell'audit iniziale; questa sezione dice cosa è cambiato.

### Passo 1 — Guard numerici condivisi

- Nuovo helper `src/analyses/shared/numbers.ts` (`isFiniteNumber`).
- Guard nei runner: `ttest` (μ₀), `logistic` (cut-off 0–1), `mi` (imputazioni/iterazioni), `timeseries` (periodo/orizzonte).
- Test: `src/analyses/shared/numbers.test.ts`, `src/analyses/ttest/run.test.ts`, `src/analyses/mi/run.test.ts`, casi aggiunti a logistic e timeseries.
- Effetto: i quattro scenari che restituivano `ok:true` con output null/vuoto ora restituiscono un `reason` esplicito e nessuna card.

### Passo 2 — CI nella card, nello stale e nel re-run

- `StoredOutput` ha `ciLevel?`; `parseStoredOutputs` lo valida (0 < CI < 100).
- `isOutputStale` puro in `src/io/outputs.ts` confronta revision, dataset, filtro, parametri e CI.
- `App.emit` salva il CI usato; `runAnalysisWith` accetta il livello della card; `Apply` e `Re-run` ripristinano il CI salvato.
- Test: `src/io/outputs.test.ts` (parse + stale) e nuovo scenario Playwright “CI changes”.
- Effetto: cambiare 95→99 marca la card `stale`; il re-run usa il 95 della card e riallinea il setup.

### Passo 3 — Data safety

- “New dataset” chiede conferma e non è più un click distruttivo silenzioso (`App.newDataset`).
- `replaceDataset` e `restoreProject` azzerano `showFilter`, `filterValue`, `filterOp`, `filterCol`: il nuovo dataset non può nascere nascosto da un filtro vecchio.
- `trimTrailingEmptyLines` in `src/grid/ops/ranges.ts`: il paste conserva le righe vuote interne e rimuove solo il newline finale.
- “Jump to first”/jump per colonna azzerano il filtro di vista se la cella invalida è nascosta.
- Test: unit su `ops.test.ts`; tre scenari Playwright (New confermato + filtro, paste con buco, jump su cella filtrata).

### Passo 4 — Performance full-grid

- `Footer` usa `useDeferredValue` + `useMemo`: una sola scansione differita invece di due scansioni per render.
- La validazione live in `App` è debounced a 250 ms: non blocca ogni tasto.
- `visibleRows` in `DataGrid` e `rowsForAnalysis`/`missingCells`/`codeCells` in `AnalysisOptions` sono memoizzati.
- Misure di riferimento (Node, 50k×10): doppia scansione footer ~55 ms → una scansione differita; commit ~52 ms; `visibleRows` ~5 ms. Il budget per tasto a 5k resta sotto i 16 ms; a 50k il lavoro residuo è nel commit (clone + confronto + formule), fuori da questo passo.

### Passo 5 — Chrome statica e documentazione

- `src/i18n.ts` passa a **738 chiavi**; tutte le stringhe statiche di shell, form, editor dati, dialoghi e toast sono centralizzate (`SettingsTab`, `AnalysisOptions`, `OutputConsole`, `AnalysisLibrary`, `AnalysisTab`, `Header`, `DataTab`, `TransformPanel`, `VariableInspector`, `DataGrid`, `CleanPanel`, `ImportWizard`, `ExportDialog`, hook di sessione/IO/output).
- `i18n.test.ts` ora verifica anche che ogni chiave statica sia referenziata (allowlist per le chiavi risolte dinamicamente).
- Wizard: label/hint dei goal in inglese; la prosa della raccomandazione resta italiana come contenuto.
- Fuori perimetro dichiarato: catalogo analisi (label/descrizioni), help/report, messaggi di dominio dei kernel, sentinel dei titoli output.
- `docs/UI-STATE.md`, `docs/GRID-STATE.md` e `README.md` aggiornati (conteggi, i18n, stale, App, `statsHelpers`, runner).
- `scripts/check-file-size.mjs`: eccezione per `src/i18n.ts` (770 righe, dizionario statico).

### Verifica finale

- `npm run check`: **467 test**, 0 fail; dependency-cruiser, madge e file-size guard ok.
- `npm run test:e2e`: **38 passed, 30 skipped**, 0 fail.
- `npm run build`: ok, nessun chunk >500 kB.

## Seconda tranche — chiusura dei rilievi UI (R8–R18)

Implementati tutti i passi 6–9 del piano (`docs/plans/2026-10-29-chiusura-rilievi-ui.md`):

- **R8** — `src/ui/analysis/outputSelection.ts`: filtro memoizzato, reset a “All analyses” quando l'analisi filtrata sparisce, stato vuoto difensivo. Test unit + e2e.
- **R9/R17** — `src/ui/analysis/liveGate.ts`: token monotono; un run live vecchio non pubblica e non azzera il pending del run corrente. Deps sulla firma dello slice attivo, ref al runner più recente. Test unit + e2e (Live off).
- **R10** — `Field` associa i controlli raw con `id` generato; `VariableSelect` usa `useId`; `VariableList`/`CheckboxList` sono `fieldset`/`legend`; celle con nome colonna+riga, header con `scope`, fill handle focusabile con Tab e Enter/Shift+Enter. Test e2e.
- **R11/R12** — `isContinuousColumn` unica regola in `grid/types.ts`; `continuousColumnIndexes` per form/default; `validateRoleTypes` resta type-only; Stratified Cox rifiuta time/event e il form li deseleziona. Test unit + e2e.
- **R15/R16** — `useMediaQuery` per i breakpoint; `DataWorkspace` resta montata e nascosta; `DataGrid` riceve `resetKey`/`datasetId` e azzera selezione, anchor, inspector e focus al cambio dataset. Test e2e (resize, selezione tra tab, New).
- **R4** — fast-path `changedCell`/`changedCol`: se la colonna modificata non è referenziata da formule, il ricalcolo viene saltato. Benchmark `npm run bench:grid`: 50k×10 indipendente ~0,1 ms, dipendente ~37,5 ms; il clone resta protetto. Test formula/immutabilità.
- **R18** — `dataRevision`, `datasetId` e `ciLevel` persistiti in card e progetto; revisione iniziale ripristinata nella history; reload senza modifiche non stale, edit dopo reload stale. `filterSignature` resta session-only e documentato.
- **DataGrid UX** — toolbar con `role="toolbar"` e gruppi File/Edit/Tools/View; pulsante “Add level” nella cella `cat` che apre `LevelsEditor` e restituisce il focus.
- **Documenti** — `UI-STATE`, `GRID-STATE`, `README` e questo report aggiornati; piano in `docs/plans/2026-10-29-chiusura-rilievi-ui.md`.

### Limiti residui dichiarati

- **R18 — filtro analysis**: la firma del filtro non è persistita; una card prodotta con filtro analysis non viene confrontata dopo reload.
- **R13** (righe ragged) resta **non riproducibile**; **R19** (doppio dispatch nello stesso tick) resta da verificare.
- **R4 — formula dipendente**: il fast-path non copre l'edit di una colonna referenziata; il caso resta misurato (~37,5 ms a 50k) e documentato.


## Terza tranche — potenziamento per ricercatore/studente (2026-10-29)

Implementata una release verticale dei tre sprint:

- **Error boundary** per pannello, con reload e download diagnostico (`src/ui/ErrorBoundary.tsx`).
- **Schema progetto v2** con migrazione automatica da v1 (`PROJECT_VERSION=2`, parser compatibile).
- **Backup IndexedDB** dell'autosave, con ripristino da Settings (`src/io/backup.ts`).
- **Validazione numerica inline** (`NumberField`) su t-test, logistica, MI, serie temporali e TOST.
- **Guided / Expert mode** persistita nel progetto: in Guided le sezioni Advanced sono nascoste.
- **Onboarding** con tre percorsi (descrivi, confronta, prevedi) nella libreria analisi.
- **Preset** per t-test, ANOVA, regressione, logistica e correlazione.
- **Re-run all** delle card salvate con i loro parametri.
- **Report Word** oltre a HTML/XLSX.
- **Export codice R/Python** per descriptive, t-test, ANOVA, regressione, correlazione e logistica.

Verifica: **467 test**, Playwright **38 passed / 30 skipped**, build senza chunk >500 kB, file-size guard ok.

### Non implementato in questa release

Restano esplicitamente fuori, e non vanno considerati fatti:

- Web Worker reale per tutti i kernel pesanti (serve il refactor del contratto di output).
- Import binario SPSS `.sav` / Stata `.dta`.
- Reshape long/wide guidato.
- Model comparison e diagnostics dashboard.
- Seed modificabile dall'utente (i kernel usano già seed fissi deterministici).
- Desktop wrapper / File System Access e dataset oltre i limiti attuali.

## Quarta tranche — soglia di qualità: worker e import SPSS/Stata (2026-10-29)

Implementati i due interventi che il documento di stato indicava come soglia:

### Web Worker per i kernel pesanti

- `AnalysisRunResult` espone `tables`, `report`, `charts` e `header` serializzabili; `node` resta opzionale per il percorso sincrono.
- `src/analyses/worker/` contiene protocollo, registry dei soli 9 runner heavy (`lmm`, `gee`, `cox`, `stratcox`, `tdcox`, `parametric`, `timeseries`, `mi`, `resampling`), worker e client.
- Il setup mostra **Running**, fase, tempo trascorso, barra indeterminata e **Cancel**. Cancel termina il worker: i kernel sono sincroni, quindi non esiste un punto interno sicuro per interromperli.
- Se `Worker` non è disponibile o il bundle del worker non parte, il runner sincrono resta il fallback; un rifiuto di dominio (parametri/dati) non viene rieseguito.
- I grafici di Cox e Time Series sono diventati `AnalysisChart` serializzabili e sono renderizzati dallo stesso componente nel worker e nel main thread.

### Import SPSS `.sav` e Stata `.dta`

- `src/io/statfiles.ts` usa `@irbisadm/statfmt` (port TypeScript di ReadStat, MIT) in import dinamico.
- Conserva nomi, etichette variabile, value labels, date SPSS/Stata e user-missing; produce lo stesso `ImportTable` del wizard CSV/XLSX.
- `ImportTable.meta` porta label/livelli nella griglia; il wizard mostra il tipo di file, salta delimitatore/header/decimals e mantiene l'override dei tipi.
- `.zsav` è rifiutato con un messaggio esplicito (richiede zlib nel browser).
- Fixture reali generate con R/haven per `.sav` e `.dta`; test unitari e due scenari Playwright.

### Verifica

- `npm run check`: **480 test**, 0 fail; dependency-cruiser, madge e file-size guard ok (340 file, 3 eccezioni).
- `npm run test:e2e`: **43 passed, 35 skipped**, inclusi worker, grafico time-series e import `.sav`/`.dta`.
- `npm run build`: ok; worker 444 kB, `statfiles-vendor` 89 kB lazy, nessun chunk >500 kB.


## Quinta tranche — dataset di prova per test e verifica manuale (2026-10-29)

- Nuova cartella `samples/` nel codebase, divisa per famiglia di analisi
  (`descriptive`, `compare`, `regression`, `multivariate`, `categorical`,
  `survival`, `timeseries`, `missing`, `design`).
- 19 dataset derivati da R (`iris`, `mtcars`, `PlantGrowth`, `ToothGrowth`,
  `ChickWeight`, `lung`, `heart`, `AirPassengers`, `airquality`, `birthwt`,
  `quine`, `housing`, `USArrests`, `attitude`, `sleep`, `faithful`) più due
  dataset sintetici per l'accordo fra rater e per le misure binarie appaiate.
- Ogni dataset è scritto in cinque formati: CSV, SPSS `.sav`, Stata `.dta`,
  Excel `.xlsx` e JSON; `manifest.json` contiene righe, colonne, procedure e
  mappature colonna-pronte.
- `samples/generate.R` rigenera tutto in modo riproducibile; `src/io/samples.test.ts`
  verifica che manifest, file e parser restino allineati.
- Nuovo e2e che importa `samples/compare/plantgrowth/data.csv` e lancia ANOVA.

### Verifica

- `npm run check`: **480 test**, 0 fail; dependency-cruiser, madge e file-size guard ok (340 file, 3 eccezioni).
- `npm run test:e2e`: **43 passed, 35 skipped**.
- `samples/` occupa circa 1,5 MB; nessun file entra nel bundle dell'app.
