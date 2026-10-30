# Toolbar unica delle operazioni dati (Transform + Clean)

- **Richiesta**:
  - «piani di modifica alla UI datagrid. la sezione che riguarda le operazioni sui dati:» (messaggio interrotto dopo i due punti)
  - «l pannello trasform e il pannello clean  attualmente presentano un unica riga per inserimento  tutti i parametri di trasformazione/clean profucendo un approccio affollato e confuso. ci devono essere bottoni per ogni operszione din trasformazione. ogni bottone apre la sua finestra dropdown costituita dalls zona superiore per inyrodurre i parametri e da due bottoni in basso: cancel e run. i bottoni del pannelo trssform e quelli del pannello clean vanno messi nella stessa toolbar (con separatore verticale). presentatemi un piano per attuare correttamente questa modifica»
- **Obiettivo**: sostituire le due righe inline di parametri con una barra dedicata di bottoni, uno per operazione, ognuno con un dropdown ancorato (parametri + Cancel/Run).
- **Criteri di successo**:
  - nessuna riga inline di parametri; i toggle `Clean`/`Transform` spariscono dalla toolbar principale;
  - **11 trigger** in una barra dedicata: 6 Transform (Sort, Recode, Split, Split all, Merge, Compute) + separatore verticale + 5 Clean (Find/Replace, Fill missing, Trim, Drop empty, Drop duplicates);
  - ogni trigger è **icona + etichetta**, con l'etichetta visibile solo da `xl` (1280 px) in su e solo icona sotto, come `SessionReportToolbar.tsx:63-127`; `aria-label` = etichetta, hint descrittivo in `aria-describedby`, tooltip DOM colorato con i token del tema;
  - ogni trigger apre un dropdown con intestazione (nome + hint), corpo parametri e footer `Cancel` e `Run`;
  - `Cancel`, `Escape` e click esterno scartano senza modificare la griglia; `Run` applica **un solo** passo di undo, chiude e mostra il toast esistente;
  - comportamento, messaggi e attributi `data-transform` dei controlli restano gli stessi;
  - icone, etichette e tooltip usano solo token semantici e restano leggibili in **tutte** le 10 interfacce (5 scure, 5 chiare) con contrasto AA;
  - `npm run check`, `npm run guard` e `npm run test:e2e` verdi; i18n allineata su 6 locale senza chiavi orfane.
- **Non-obiettivi**:
  - nuove operazioni dati (niente join, niente nuove trasformazioni);
  - modifiche alle operazioni pure in `src/grid/ops/`;
  - redesign della toolbar principale oltre la rimozione dei due toggle;
  - modifiche a `LevelsEditor`/recode dagli header o dall'inspector;
  - layout mobile dedicato (la barra va a capo come la toolbar esistente);
  - memoria dei parametri tra un'apertura e l'altra.
- **Assunzioni**:
  - la toolbar unica è una **nuova riga dedicata** sotto la toolbar principale (scelta esplicita dell'utente);
  - Split e Split all restano due bottoni distinti;
  - le icone sono decorative rispetto all'etichetta: sotto `xl` il tooltip personalizzato e l'intestazione del pannello portano il nome dell'operazione, quindi nessuna azione dipende dal solo glifo;
  - i campi ripartono dai default a ogni apertura: `Cancel` e `Escape` equivalgono a "scarta";
  - le operazioni senza parametri (Trim, Drop empty, Drop duplicates) hanno corpo vuoto, solo footer: nessun conteggio dry-run.

## Vincoli dal repository

- **i18n**: il catalogo è tipizzato dall'inglese (`src/i18n/types.ts:6`); le locale attive sono sei (`src/i18n/locales.ts:7`). `src/i18n.test.ts:87-95` fallisce se una chiave `en` non è referenziata nel sorgente con `t('chiave'`; `59-73` richiede tutte le chiavi in tutte le locale con gli stessi placeholder. `scripts/check-locale.mjs:55-60` rifiuta chiavi mancanti o sconosciute. Quindi aggiunte e rimozioni vanno fatte in tutte e sei le locale, e nessuna chiave può restare orfana.
- **Dimensione file**: limite di 700 righe per file in `src/**/*.ts(x)`, test esclusi (`scripts/check-file-size.mjs:11`).
- **Dipendenze**: `src/grid/` non può importare `ui|analyses|hooks|io` (`.dependency-cruiser.cjs:19-24`); i nuovi componenti restano in `src/grid/`. L'import di `i18n` è permesso.
- **e2e**: gli attributi `data-transform` sono il contratto dei selettori (`e2e/datagrid.spec.ts:14`, usato a `140-193`); vanno mantenuti sui controlli.
- **Icone**: `lucide-react` 0.546 è già dipendenza (`package.json:37`); il pattern icona + etichetta nascosta sotto `xl` con `title`/`aria-label` esiste in `src/ui/output/SessionReportToolbar.tsx:63-127` e `src/ui/AnalysisTab.tsx:234`.
- **Temi e contrasto**: l'interfaccia è token-driven; `applyTheme` imposta le variabili `--color-*` su `<html>` e `color-scheme` (`src/theme/runtime.ts:47-58`). Il registro ha 5 temi scuri e 5 chiari (`src/theme/themes.test.ts:44-51`). I test esistenti impongono `text` ≥7 e `text2`/`text3` ≥4.5 su `bg`/`surface`/`surface3`, `accent`/`accent2` ≥4.5 su `bg`/`surface`, `onAccent`/`accent` ≥4.5 (`src/theme/themes.test.ts:65-87`). **`accent` su `surface3` scende a 4.00 in 5 temi su 10**: non va usato per testo o icone sul fondo `surface3` del `tb-btn` attuale.
- **Tooltip**: un `title` nativo è disegnato dal sistema operativo e non può essere colorato né seguire il tema. Per il requisito «tooltip colorate e brillanti in chiaro e scuro» serve un tooltip DOM dentro `OperationTrigger`; non esiste un componente condiviso e non va creato: resta locale al trigger.
- **Undo**: `setGrid` è `gridHistory.commit` (`src/App.tsx:131-134`); un commit è un passo di undo (`src/grid/useGridHistory.ts:69-116`). Il remap dei parametri passa da `onColumnOperation` (`src/hooks/useColumnOperations.ts:30-43`).
- **Pattern UI esistenti**: dropdown assoluto con chiusura su `pointerdown` esterno + `Escape` in `src/ui/output/ExportMenu.tsx:24-88`; menu contestuale `fixed` con clamp viewport in `src/grid/DataGrid.tsx:585-590` e chiusura a `107-121`; stile separatore verticale `h-4 w-px bg-border mx-1` in `src/ui/DataTab.tsx:173,208,228,263`.

## Stato attuale

- Toolbar principale con gruppi File / Modifica / Strumenti / Vista: `src/ui/DataTab.tsx:167-287`. I due toggle sono a `256-261`; i pannelli sono montati inline a `352-375`; le prop di visibilità a `90-92` e `153-155`.
- Stato locale `showClean`/`showTransform`: `src/ui/DataWorkspace.tsx:69-70`, passato a `DataTab` a `170-173`. Non viene resettato al cambio dataset (il reset a `77-82` copre solo selezione e inspector).
- `onApply` del pannello Transform (`src/ui/DataTab.tsx:355-362`): se `next !== grid`, usa `onColumnOperation(next, operation)` quando c'è `operation` (split/merge), altrimenti `setGrid(next)`; poi azzera la validazione e mostra il toast. `onApply` del pannello Clean (`369-373`): `setGrid(next)`, azzera la validazione, toast. Il titolo del toast distingue `toast.transform` da `toast.clean`.
- `src/grid/TransformPanel.tsx` (176 righe): Sort (`53-67`), Recode (`69-98`), Split/Split all/Merge (`100-125`), Compute (`127-173`), clamp degli indici colonna a `31-40`. Attributi `data-transform`: `sort-col`, `sort-dir`, `sort-apply`, `recode-col`, `recode-map`, `recode-apply`, `split-col`, `split-sep`, `split-apply`, `split-all`, `merge-a`, `merge-b`, `merge-sep`, `merge-apply`.
- `src/grid/CleanPanel.tsx` (122 righe): Find/Replace (`41-56`), Fill missing (`58-86`), Trim/Drop empty/Drop duplicates (`88-119`), clamp a `23-28`. Nessun attributo `data-*`.
- Operazioni pure, da riusare senza modifiche: `src/grid/ops/columns.ts:148` `splitColumn`, `:173` `splitColumnAll`, `:200` `mergeColumns`, `:245` `computeColumn`; `src/grid/ops/rows.ts:33` `removeEmptyRows`, `:40` `removeDuplicateRows`, `:55` `fillMissing`, `:100` `sortByColumn`; `src/grid/ops/clean.ts:57` `findReplace`, `:103` `trimGrid`; `src/grid/ops/recode.ts:29` `recodeColumnValues`.
- **Difetto pre-esistente da correggere**: `{kind:'split', at}` sposta di **una** sola posizione gli indici successivi (`src/grid/columnOps.ts:12,36-39,71-72`), ma `splitColumnAll` aggiunge N−1 colonne (`src/grid/ops/columns.ts:173-197`). Il pannello attuale passa la stessa operazione per entrambi (`src/grid/TransformPanel.tsx:109-110`): con Split all i parametri delle analisi sulle colonne a valle puntano alla colonna sbagliata. Il test attuale copre solo lo split singolo (`src/grid/columnOps.test.ts:32-37`).
- e2e: test Transform a `e2e/datagrid.spec.ts:140-193` (split, split all, merge, recode), skippati su mobile (`:142`); test Compute in `e2e/smoke.spec.ts:207-219` che apre con `getByRole('button', {name:'Transform'})` e applica con `Compute`.
- Chiavi i18n coinvolte: `src/i18n/catalog/en/data.ts:60-101`. Con la migrazione diventano orfane `data.transform.splitMerge`, `data.clean.tidy`, `data.clean.apply`. `data.clean.fill` e `data.clean.missing` vengono riusate (trigger e label della strategia); `data.transform` e `data.clean` diventano le `aria-label` dei due gruppi.
- Documentazione che cita i pannelli: `docs/GRID-STATE.md:89,176`, `docs/DATAGRID-AUDIT.md:3-4,73-176`, `docs/UI-STATE.md:323-325`.

## Approccio proposto

Due file piatti in `src/grid/`, senza nuova cartella e senza nuove astrazioni condivise:

1. **`OperationPopover.tsx`** — `OperationTrigger`: bottone `tb-btn` con chip `bg-bg`, icona lucide `h-4 w-4` in `text-accent`, etichetta `text-text` visibile da `xl` (`<span className="hidden xl:inline">`, come `SessionReportToolbar.tsx:82,93,104`); su hover e a pannello aperto il fondo diventa `bg-accent` e icona/etichetta passano a `text-on-accent` (stati `group-hover` + `open`). `aria-label` = etichetta, `aria-haspopup="dialog"`, `aria-expanded`, `data-transform="<id>-open"`. Il `title` nativo **non si usa**: al suo posto un tooltip DOM sempre nel documento (`role="tooltip"`, `id` collegato con `aria-describedby`), visibile su hover e su `focus-visible` quando il pannello è chiuso, con fondo `bg-accent` e testo/hint `text-on-accent` (label in semibold, hint in corpo più piccolo); `pointer-events-none`, `max-w-[16rem]`, ombra, allineato a sinistra per il gruppo Transform e a destra per il gruppo Clean. `OperationPanel`: dropdown `fixed` con `role="dialog"`, `aria-label` = nome dell'operazione, intestazione su `bg-surface` con nome `text-text` e hint `text-text2`, corpo scorrevole e footer `Cancel`/`Run` (`Run` su `bg-accent text-on-accent`). Riusa il ciclo di vita di `ExportMenu` (chiusura su `pointerdown` esterno ed `Escape`); il trigger è dentro il root, quindi non serve il `setTimeout(0)` di `DataGrid`. Posizionamento `fixed` con clamp sul viewport come `DataGrid.tsx:585-590`, così il dropdown non viene tagliato dal contenitore `overflow-hidden` di `DataTab.tsx:166`; `max-height` calcolata sullo spazio residuo sotto il trigger. Focus al primo controllo all'apertura, ritorno al trigger alla chiusura; niente focus trap (il pannello non è modale).
2. **`OperationsBar.tsx`** — `role="toolbar"`, gruppo Transform (`role="group" aria-label={t('data.transform')}`), separatore verticale, gruppo Clean (`role="group" aria-label={t('data.clean')}`). Contiene gli 11 form, portati quasi verbatim dai due pannelli. Ogni operazione ha il proprio stato `open` locale: aprire un secondo trigger chiude il primo grazie al `pointerdown` esterno, senza `openId` condiviso. I campi sono montati solo a pannello aperto, quindi i draft si azzerano a ogni apertura; il clamp degli indici colonna (`TransformPanel.tsx:31-40`, `CleanPanel.tsx:23-28`) viene portato dentro i form.

   Ogni trigger monta la **propria istanza** di `OperationPanel` con il proprio stato dei parametri: non esiste un pannello unico riutilizzato. «Un solo pannello aperto» significa soltanto che aprirne un secondo chiude il primo. Anche Split e Split all, che condividono gli stessi campi, sono due dropdown distinti con stato indipendente; Trim, Drop empty e Drop duplicates hanno il proprio dropdown con corpo vuoto e footer `Cancel`/`Run`.

Mappa icone (tutte presenti in lucide 0.546, verificato): Sort `ArrowUpDown`, Recode `Repeat2`, Split `Scissors`, Split all `ScissorsLineDashed`, Merge `Merge`, Compute `Sigma`, Find/Replace `Replace`, Fill missing `PaintBucket`, Trim `RemoveFormatting`, Drop empty `ListX`, Drop duplicates `CopyX`.

Colori: nessun hex nei nuovi componenti, solo token. Coppie usate e minimo su tutte le 10 interfacce: icona chiusa `accent` su `bg` (5.10), etichetta `text` su `bg` (10.00), hover/open e tooltip `onAccent` su `accent` (≥4.5), pannello `text`/`text2` su `surface` (10.99 / 5.94). `accent` su `surface3` (4.00) resta escluso per testo e icone perché sotto AA: è il motivo del chip `bg-bg` invece del `surface3` di `tb-btn` e del tooltip su fondo accent invece che su `surface3`.

Contratto verso `DataTab`: **nessuna firma nuova**. Si passano due callback con le firme già in uso:

```tsx
onTransformApply: (next, msg, kind?, operation?) => void  // come TransformPanel
onCleanApply: (next, msg) => void                          // come CleanPanel
```

`DataTab` mantiene i due handler esistenti (`355-362`, `369-373`) e cambia solo il punto di mount: `<OperationsBar grid={grid} onTransformApply={…} onCleanApply={…} key={datasetId} />` al posto dei due blocchi condizionali. La `key={datasetId}` chiude il pannello e scarta i draft quando cambia il dataset.

`Run` applica e chiude; `Compute` con errore chiama `onTransformApply(grid, error, 'error')` e **resta aperto** per correggere l'espressione (comportamento attuale). Split/Merge passano ancora `{kind:'split'|'merge', …}` a `onColumnOperation`; per Split all si passa `count` (vedi passo 1) così il remap sposta gli indici della quantità reale di colonne inserite. Le operazioni senza parametri hanno corpo vuoto: solo footer.

i18n: **+3** chiavi shell (`data.operationsBar`, `data.operationsRun`, `data.operationsCancel`) e **+6** hint dove la label del trigger non è autoesplicativa (`data.op.sortHint`, `data.op.recodeHint`, `data.op.splitHint`, `data.op.splitAllHint`, `data.op.mergeHint`, `data.op.computeHint`); **−3** orfane (`data.transform.splitMerge`, `data.clean.tidy`, `data.clean.apply`). `data.clean.fill` viene rititolata «Fill missing» nelle 6 locale e usata come trigger; `data.clean.missing` resta come label della strategia; `data.transform.recode`/`compute` restano le descrizioni dei campi e `recodeAction`/`computeAction` le label dei trigger. Le chiavi hint sono referenziate con `t('...')` letterale, non da una mappa dinamica, così `src/i18n.test.ts:87-95` le riconosce. Bilancio netto: +6 chiavi per locale.

## Passi

1. **Correggere il remap di Split all** — file: `src/grid/columnOps.ts`, `src/grid/TransformPanel.tsx`, `src/grid/columnOps.test.ts`, `src/analyses/params.test.ts`
   - `{ kind: 'split'; at: number; count?: number }` con `count` = colonne aggiunte dopo `at` (default 1); `mapColumnIndex` sposta di `count` gli indici `> at`; `columnCountAfter` somma `count`.
   - Il pannello passa `count = next.cols.length - grid.cols.length` per Split all (e 1 per Split).
   - Test: split con `count: 2` (indici a valle +2), `columnCountAfter`, `remapParams` con una variabile a valle; il test esistente a `columnOps.test.ts:32-37` resta verde.
   - Rischio S. Verifica: `npm test`.

2. **Shell + gruppo Transform completo** — file: `src/grid/OperationPopover.tsx` (nuovo), `src/grid/OperationsBar.tsx` (nuovo), `src/ui/DataTab.tsx`, `src/ui/DataWorkspace.tsx`, `src/i18n/catalog/*/data.ts`, `src/theme/themes.test.ts`, `e2e/datagrid.spec.ts`, `e2e/smoke.spec.ts`
   - Crea trigger/pannello e la barra con Sort, Recode, Split, Split all, Merge, Compute; porta i form e il clamp da `TransformPanel.tsx`; ogni trigger ha icona, etichetta `hidden xl:inline`, hint dove previsto e `data-transform="<id>-open"`; elimina `src/grid/TransformPanel.tsx`, il toggle `Transform` e lo stato `showTransform`. Il gruppo Clean resta com'è (toggle + pannello), così il repo resta verde.
   - i18n: aggiunge `data.operationsBar/Run/Cancel` e i 6 hint Sort/Recode/Split/Split all/Merge/Compute, rimuove `data.transform.splitMerge`; `data.transform` diventa l'`aria-label` del gruppo.
   - e2e: i 4 test Transform aprono il trigger con `[data-transform="<id>-open"]`, compilano i controlli e premono `Run` nel dialog; il test Compute di `smoke.spec.ts` apre `Compute` e applica con `Run`. Nuovi casi: `Cancel` non modifica la griglia, `Escape` e click esterno chiudono, un secondo trigger chiude il primo, un solo `Undo` ripristina, cambio dataset con pannello aperto, a 1024 px il trigger mostra solo l'icona ma conserva tooltip e `aria-label`, tooltip visibile su hover e su focus-visible.
   - Tema: trigger e tooltip usano solo token; nuovo test in `src/theme/themes.test.ts` sulle coppie usate (`accent`/`bg`, `text`/`bg`, `onAccent`/`accent`, `text`/`text2` su `surface`); verifica manuale con un tema chiaro (GitHub Light) e uno scuro (One Dark Pro).
   - Rischio M. Verifica: `npm run lint`, `npm test`, `npx playwright test e2e/datagrid.spec.ts e2e/smoke.spec.ts --project=desktop`.

3. **Gruppo Clean + documentazione** — file: `src/grid/OperationsBar.tsx`, `src/ui/DataTab.tsx`, `src/ui/DataWorkspace.tsx`, `src/i18n/catalog/*/data.ts`, `e2e/datagrid.spec.ts`, `docs/GRID-STATE.md`, `docs/DATAGRID-AUDIT.md`, `docs/UI-STATE.md`
   - Aggiunge Find/Replace, Fill missing, Trim, Drop empty, Drop duplicates alla stessa barra, con la stessa struttura icona + etichetta + hint; elimina `src/grid/CleanPanel.tsx`, il toggle `Clean`, lo stato `showClean` e le prop residue.
   - i18n: rimuove `data.clean.tidy` e `data.clean.apply`, rititola `data.clean.fill`; `data.clean` resta come `aria-label` del gruppo, `data.clean.missing` come label della strategia.
   - e2e nuovi: Find/Replace, Fill missing (media e valore), Trim, Drop empty, Drop duplicates, ognuno con apertura del trigger, asserzione del risultato e un `Undo`; caso "nessuna modifica" per almeno una di esse.
   - Tema: i 5 trigger Clean riusano `OperationTrigger` senza eccezioni di colore; nessun token nuovo.
   - Docs: aggiorna i riferimenti ai pannelli in `GRID-STATE.md` (sezioni Clean/Transform) e `DATAGRID-AUDIT.md`; in `UI-STATE.md` la descrizione dell'editor dati.
   - Rischio M. Verifica: `npm run check`, `npm run guard`, `npm run test:e2e`.

**Totale: M**

## Alternative considerate (e perché scartate)

- **Dieci bottoni dentro la toolbar principale** — scartata: la toolbar ha già ~20 azioni e va a capo (`src/ui/DataTab.tsx:167-287`); l'utente ha scelto una riga dedicata.
- **Due menu raggruppati** (Transform ▸ operazione) — scartata: aggiunge un livello di click e non rispetta «un bottone per ogni operazione».
- **Riscrivere `ExportMenu` come dropdown generico** — scartata: è condiviso da session header e run-report card (`src/ui/output/ExportMenu.tsx:20-23`) e usa `role="menu"`, inadatto a un pannello con form.
- **Cartella `src/grid/operations/` con quattro file** — scartata: i form esistono già e occupano ~300 righe; due file piatti bastano. Se `check-file-size` supera 700 righe, estrarre i due gruppi in `TransformOperations.tsx`/`CleanOperations.tsx` come contingenza.
- **Stato `openId` condiviso** — scartata: il `pointerdown` esterno di ogni pannello chiude già il precedente; lo stato per-operazione evita prop drilling.
- **Conteggio dry-run per Trim/Drop empty/Drop duplicates** — scartata: eseguirebbe una trasformazione completa solo per mostrare un numero; corpo vuoto e footer sono sufficienti.
- **Conservare i draft tra un'apertura e l'altra** — scartata: dopo `Cancel` l'utente si aspetta i default; il clamp resta dentro i form.
- **Solo icone a ogni larghezza** — scartata: 11 glifi astratti (Split/Split all, Trim vs Drop empty/duplicates) e `title` inutilizzabile su touch; l'etichetta da `xl` evita il rebus sui monitor larghi.
- **Icona + etichetta corta sempre visibile** — scartata: recupera meno spazio, che è l'obiettivo della richiesta.
- **11 hint × 6 locale** — scartata: le label esistenti sono già descrittive per Find/Replace, Fill missing, Trim, Drop empty e Drop duplicates; solo sei hint aggiungono informazione reale.

## Riconciliazione del Concilio

| # | rilievo | chi | severità | decisione | motivo |
|---|---------|-----|----------|-----------|--------|
| 1 | Split all può inserire N−1 colonne ma il remap sposta di 1 | Luna | MAJOR | accettato | `columnOps.ts:36-39,71-72` vs `ops/columns.ts:173-197`: difetto reale, già presente in `TransformPanel.tsx:110`. Diventa il passo 1, con `count` e test. |
| 2 | Il contratto `onApply(next,msg,{group,kind,operation})` è superfluo e non formalizza errore/chiusura | GLM, Luna | BLOCKER (GLM) / MAJOR (Luna) | accettato | Si tengono le due firme esistenti (`TransformPanel.tsx:9-14`, `CleanPanel.tsx:9-11`) come due prop. `DataTab:355-373` resta la sola fonte di toast/validazione; Compute resta aperto solo sul proprio `error`. |
| 3 | Un pannello aperto può sopravvivere al cambio dataset con draft stantii | Luna | MAJOR | accettato | `DataWorkspace.tsx:69-82` non resetta i pannelli; `key={datasetId}` sulla barra chiude e azzera. Test e2e dedicato. |
| 4 | Lista i18n incompleta (`data.clean.fill` orfana; testo dry-run non localizzato) | Luna | MAJOR | accettato | Si riusa `data.clean.fill` (rititolata) e `data.clean.missing`; niente dry-run, quindi niente nuova chiave. Orfane effettive: 3, non 4. |
| 5 | Il dry-run duplica lavoro e allocazioni | Luna, GLM | MAJOR | accettato | Rimosso: corpo vuoto per le operazioni senza parametri. |
| 6 | Copertura e2e Clean incompleta | Luna | MAJOR | accettato | Un test per ognuna delle 5 operazioni, più undo e caso "nessuna modifica". |
| 7 | I trigger sono 11, non 10 | Luna | MINOR | accettato | Corretto nei criteri di successo. |
| 8 | Dropdown tagliato dal contenitore `overflow-hidden` | Luna | MINOR | accettato | Posizionamento `fixed` con clamp e `max-height` sul modello `DataGrid.tsx:585-590`. |
| 9 | `Run` chiude e azzera i draft, diversamente dai pannelli attuali | Luna | MINOR | accettato come cambio voluto | È la richiesta (dropdown con Cancel/Run); documentato nei criteri e coperto da un e2e su due operazioni consecutive. |
| 10 | Il passo "Shell + Sort" duplica Sort nei pannelli vecchi | GLM | MAJOR | accettato | Passi ridotti a 3: fix remap, gruppo Transform completo, gruppo Clean. Nessuno stato transiente con lo stesso comando in due posti. |
| 11 | Quattro file in una cartella nuova sono sovradimensionati | GLM | MAJOR | accettato | Due file piatti; split solo se `npm run filesize` lo impone. |
| 12 | `openId` condiviso superfluo | GLM | MAJOR | accettato | Chiusura esterna già garantita; stato `open` per operazione. Luna lo difendeva come protezione, ma l'e2e "un solo pannello aperto" copre il caso. |
| 13 | Doppio schema di attributi (`data-operation` vs `data-transform`) | GLM | MINOR | accettato | I trigger usano `data-transform="<id>-open"`; l'helper e2e resta unico. |
| 14 | Focus management oltre lo standard del repo | GLM | MINOR | parzialmente accettato | Si tiene focus al primo controllo e ritorno al trigger (2 righe); niente focus trap. |
| 15 | Rischio "doppio toggle" fantasma con il pattern ExportMenu | GLM | MINOR | accettato | Trigger dentro il root: nessun `setTimeout`, rischio rimosso. |
| 16 | Il clamp degli indici colonna va preservato | GLM | MINOR | accettato | Portato verbatim nei form (`TransformPanel.tsx:31-40`, `CleanPanel.tsx:23-28`). |
| 17 | "Repo verde a ogni passo" non verificato | Luna | NON VERIFICATO | accettato | Ogni passo ha un gate esplicito (lint/test/e2e/guard) nel piano. |
| 18 | `data.transform.recode`/`compute` potrebbero diventare orfane | Luna | NON VERIFICATO | rifiutato | Restano usate come label dei campi nei rispettivi dropdown. |

Nessun BLOCKER respinto: il BLOCKER GLM sul contratto è stato accettato e ha semplificato il piano. Nessun secondo giro: le due lenti convergono sulle stesse riduzioni; il solo disaccordo (stato condiviso `openId`) è deciso a favore della versione più semplice, con copertura e2e.

## Verdetto dei critici

- **Luna: APPROVE_WITH_CHANGES** — «la struttura è ragionevole, ma prima dell'attuazione vanno risolti la remap di Split all, il ciclo di vita dei draft e le lacune nel contratto, nell'i18n e nei test».
- **GLM: APPROVE_WITH_CHANGES** — «l'obiettivo e l'ordine sono giusti, ma la bozza aggiunge un contratto nuovo, una cartella di 4 file, uno stato condiviso e un dry-run che il repo non chiede: con le sostituzioni proposte si arriva allo stesso criterio di successo in 2 passi e ~2/3 del lavoro».

## Rischi e mitigazioni

- **Barra affollata**: 11 trigger su schermi stretti vanno a capo per 2–3 righe. Mitigazione: bottoni `tb-btn` compatti, separatore sottile, nessuna etichetta di gruppo visibile; verifica e2e desktop e a 1024 px.
- **Limite 700 righe**: `OperationsBar.tsx` somma gli 11 form. Mitigazione: portare i form quasi verbatim (niente markup nuovo) e, se `npm run filesize` protesta, estrarre i due gruppi in due file.
- **Cambio d'uso di Run**: chiude e azzera i draft, mentre oggi i pannelli restano aperti. Mitigazione: comportamento dichiarato nei criteri, test su due operazioni consecutive e su `Cancel`.
- **Regressione nel remap**: `count` tocca un tipo condiviso. Mitigazione: campo opzionale con default 1, test unitari su split singolo e multiplo, `params.test.ts` esteso.
- **Icone ambigue sotto `xl`**: Split/Split all condividono il motivo delle forbici; Trim e Drop empty/duplicates sono astratte. Mitigazione: hint per le quattro operazioni ambigue, intestazione del pannello con nome e hint, controllo visivo alla dimensione reale.
- **Tooltip su touch**: il tooltip DOM non appare senza hover. Mitigazione: aprire il pannello mostra subito nome e hint e `Cancel` non applica nulla; l'accessibilità resta garantita da `aria-label`/`aria-describedby`.
- **Contrasto nei temi chiari**: `accent` su `surface3` scende a 4.00 in 5 temi su 10. Mitigazione: icona accent solo sul chip `bg-bg`, tooltip su fondo `accent` con testo `onAccent`, test di contrasto dedicato su tutte le 10 interfacce.
- **Tooltip personalizzato**: può essere tagliato dal contenitore, sovrapporsi al pannello o confondersi con il trigger accent in hover. Mitigazione: `pointer-events-none`, `max-w-[16rem]`, allineamento start/end per gruppo, `mt-2` e ombra per separarlo dal trigger, nascosto quando il pannello è aperto, nessun `title` nativo per evitare il doppio tooltip.

## Test e verifica

- Dopo ogni passo: `npm run lint`, `npm test` (include `src/i18n.test.ts`).
- Passo 2: `npx playwright test e2e/datagrid.spec.ts e2e/smoke.spec.ts --project=desktop`.
- Passo 3: `npm run check`, `npm run guard`, `npm run test:e2e`.
- Casi coperti: apertura/chiusura, un solo pannello aperto, `Cancel` non modifica, `Escape`/click esterno chiudono, `Run` applica e un solo `Undo` ripristina, Split all con remap a valle, Compute con errore resta aperto, cambio dataset con pannello aperto, ognuna delle 5 operazioni Clean, caso "nessuna modifica".
- Verifica manuale: 1024×768 (solo icona, tooltip e `aria-label` presenti) e 1440×900 (icona + etichetta), barra leggibile, dropdown interamente visibile, focus da tastiera (Invio/Spazio apre, `Escape` chiude e torna al trigger).
- Tema: test di contrasto sulle coppie usate in tutte le 10 interfacce (`src/theme/themes.test.ts`); verifica manuale con GitHub Light e One Dark Pro su barra, hover, focus, tooltip e pannello.

## Criteri di accettazione

- La toolbar principale non ha più i pulsanti `Clean`/`Transform`; sotto c'è una barra con 11 trigger (icona + etichetta da `xl`, solo icona sotto) e un separatore verticale tra i gruppi.
- Nessuna riga inline di parametri: ogni operazione apre il proprio dropdown con footer `Cancel`/`Run`.
- `Cancel`, `Escape` e click esterno non cambiano la griglia; `Run` produce un solo passo di undo.
- Split all rimappa correttamente i parametri delle analisi sulle colonne a valle.
- I 4 test Transform aggiornati e i nuovi test Clean passano; `npm run check`, `npm run guard`, `npm run test:e2e` verdi.
- Le 6 locale hanno le stesse chiavi, nessuna orfana, stessi placeholder; le 6 chiavi hint sono referenziate con `t('...')` letterale.
- In tutte le 10 interfacce (5 scure, 5 chiare) icone, etichette, tooltip e pannello usano solo token e superano AA; nessun colore hardcoded nei nuovi componenti.
- `docs/GRID-STATE.md`, `docs/DATAGRID-AUDIT.md`, `docs/UI-STATE.md` non citano più i pannelli rimossi.

## Domande aperte / condizioni per l'assenso

- Il cambio «Run chiude e azzera i draft» è accettato come parte della richiesta: se si preferisce conservare i parametri tra un'apertura e l'altra, va deciso prima del passo 2 (cambia solo il ciclo di vita dello stato, non la struttura).
- La correzione del remap di Split all è un difetto pre-esistente: se si preferisce tenerla fuori dal perimetro UI, il passo 1 diventa un piano separato e Split all resta esposto con il comportamento attuale. Il Concilio raccomanda di includerla, perché la migrazione tocca lo stesso comando.

## Revisione 2026-10-30

**Richiesta aggiunta dall'utente**: «icone chiare nel significato con tooltip esplicativo al posto dei bottoni testuali per rucuperare spazio?». Scelta confermata: **icona + etichetta visibile da `xl` (1280 px), solo icona sotto**, con tooltip.

**Verdetti del secondo giro**
- **Luna: APPROVE_WITH_CHANGES** — «l'impostazione è solida, ma vanno corretti il rischio di nome accessibile discordante e il flusso E2E; va inoltre resa esplicita la gestione delle chiavi i18n dinamiche».
- **GLM: APPROVE_WITH_CHANGES** — «delta solido, ma 66 stringhe di hint e l'intestazione dei popover sono ridondanti rispetto alle label i18n già presenti e descrittive; con il riuso delle label il piano si accorcia di ~70 stringhe e 11 header senza perdere esplicatività».

**Riconciliazione del delta**

| # | rilievo | chi | severità | decisione | motivo |
|---|---------|-----|----------|-----------|--------|
| 1 | `aria-label={hint}` può sostituire il nome visibile e divergere in traduzione | Luna | MAJOR | accettato | Nome accessibile = etichetta (`aria-label={label}`); l'hint va in `aria-describedby` (`sr-only`). Nella revisione temi il `title` nativo è stato sostituito dal tooltip DOM. Voice control e screen reader restano allineati alla label. |
| 2 | Gli e2e vanno aggiornati come flusso completo, non solo come locator | Luna | MAJOR | accettato | Ogni test fa trigger → campi → `Run`; locator su `[data-transform="<id>-open"]`; casi `Cancel`, Escape, click esterno, undo singolo. |
| 3 | Se gli hint sono risolti da una mappa dinamica, `i18n.test` li vede orfani | Luna | MAJOR | accettato | Chiamate `t('data.op.*Hint')` letterali nei singoli form; nessuna mappa dinamica. |
| 4 | 11 hint × 6 locale sono in gran parte ridondanti | GLM | MAJOR | parzialmente accettato | Solo 6 hint (Sort, Recode, Split, Split all, Merge, Compute): Recode/Compute hanno una label di trigger corta e ricevono un hint conciso; Find/Replace, Fill missing, Trim, Drop empty, Drop duplicates sono autoesplicative. |
| 5 | L'intestazione del pannello duplica la section-label esistente | GLM | MAJOR | parzialmente accettato | Un solo header nel guscio `OperationPanel` (nome + hint), e rimozione delle vecchie section-label condivise (`splitMerge`, `tidy`). Nessuna duplicazione, testo coerente per le 11 operazioni. |
| 6 | Le icone a 14 px possono essere indistinguibili | Luna | MINOR | accettato | Icona `h-4 w-4` (16 px), bottone `h-7` minimo, hint per le quattro ambigue, controllo visivo alla dimensione reale. |
| 7 | `title` non è affidabile su touch e non sempre al focus | Luna | MINOR | accettato | `aria-describedby` per tastiera/screen reader; su touch l'intestazione del pannello mostra subito nome e hint. |
| 8 | `data.clean.fill` "Fill" è un tooltip scarso | GLM | MINOR | accettato | Valore rititolato «Fill missing» nelle 6 locale, nessuna chiave nuova (era già nel piano). |
| 9 | Confermare `xl` e non introdurre varianti | GLM | MINOR | accettato | Stesso snippet `hidden xl:inline` di `SessionReportToolbar.tsx:82,93,104`. |
| 10 | `RemoveFormatting` e `CopyX` sono astratte | GLM | MINOR | accettato | Si tengono; l'hint/l'etichetta porta il peso semantico (`RemoveFormatting` ha etichetta «Trim spaces»). |
| 11 | L'assert e2e su label+hint è superfluo | GLM | MINOR | accettato parzialmente | Si asserisce l'header del pannello (nome) per ogni operazione; l'hint solo in un caso con hint. |
| 12 | Il delta va assorbito nei 3 passi esistenti | GLM | MINOR | accettato | Nessun passo nuovo; icone e hint entrano nel passo 2 (Transform) e nel passo 3 (Clean). |
| 13 | Valutare etichette corte aggiuntive per Recode/Compute | GLM | MINOR | rifiutato | A `xl` l'etichetta è già visibile; sotto `xl` l'hint e il pannello bastano. Due chiavi in più non migliorano l'uso. |

**Modifiche al piano**
- Trigger: da solo testo a icona + etichetta `hidden xl:inline`, `aria-label` = etichetta, `aria-describedby` = hint dove esiste (il `title` nativo è poi stato rimosso nella revisione temi).
- Pannello: header unico con nome + hint al posto delle vecchie section-label.
- i18n: +3 shell e +6 hint, −3 orfane; `data.clean.fill` rititolata. Bilancio **+6 chiavi per locale** (era 0).
- Icone: mappa lucide 0.546 verificata, 11 icone.
- e2e: locator sui trigger, flussi completi, verifica icona-only a 1024 px.
- Rischi: aggiunte le voci su icone ambigue e tooltip su touch.

**Prima: 3 passi → Dopo: 3 passi** (contenuto dei passi 2 e 3 aggiornato, nessun passo nuovo).

## Revisione 2026-10-30 — temi, colori e tooltip

**Richiesta aggiunta dall'utente**: «recepisci anche questo: le icone, testo e tooltip devono essere colorate e brillanti visibili sia con temi chiari e scuri».

**Nota sul processo**: non c'è un terzo giro di critica — il limite è di due giri totali. La decisione è presa sul codice e sui test di contrasto già presenti, che coprono tutti i 10 temi.

**Fatti verificati**
- L'interfaccia è token-driven: `applyTheme` scrive `--color-*` e `color-scheme` su `<html>` (`src/theme/runtime.ts:47-58`); il registro ha 5 temi scuri e 5 chiari (`src/theme/themes.test.ts:44-51`). Il selettore tema è nell'header (`src/ui/Header.tsx:74-90`).
- `themes.test.ts:70-87` impone già `text` ≥7 e `text2`/`text3` ≥4.5 su `bg`/`surface`/`surface3`, `accent`/`accent2` ≥4.5 su `bg`/`surface`, `onAccent`/`accent` ≥4.5.
- **`accent` su `surface3` scende a 4.00** (minimo sui 10 temi) e `accent2` a 4.18: entrambi sotto AA. Sul fondo attuale di `tb-btn` (`bg-surface3`, `src/index.css:76-78`) un'icona accent non sarebbe leggibile in 5 temi su 10.
- Coppie sicure misurate sui token reali: `accent`/`bg` 5.10, `text`/`bg` 10.00, `onAccent`/`accent` ≥4.5, `text`/`text2` su `surface` 10.99 / 5.94. `accent`/`surface3` 4.00 resta sotto AA: escluso per testo e icone.
- Un `title` nativo è renderizzato dal sistema operativo: non può essere colorato, non segue il tema e non appare su touch. Per soddisfare il requisito serve un tooltip DOM.

**Decisioni**
| # | punto | decisione | motivo |
|---|-------|-----------|--------|
| 1 | Icone colorate | Chip `bg-bg` + icona `text-accent`; etichetta `text-text`; hover/open `bg-accent` + `text-on-accent` | `accent` su `surface3` è sotto AA; su `bg` passa in tutti i temi (5.10). L'hover/open usa la coppia già testata `onAccent`/`accent`. |
| 2 | Tooltip colorato | Tooltip DOM locale a `OperationTrigger`, fondo `bg-accent`, testo e hint `text-on-accent`, ombra | È la coppia già testata `onAccent`/`accent` (≥4.5 in tutti i temi); il tooltip è inequivocabilmente colorato e brillante in chiaro e scuro. |
| 3 | Tooltip esplicativo | Sempre nel documento con `role="tooltip"` e `aria-describedby`; visibile su hover e `focus-visible`; nascosto a pannello aperto | Accessibilità e niente doppio tooltip; su touch il pannello mostra nome e hint. |
| 4 | `title` nativo | Rimosso dal trigger | Evita il doppio tooltip e l'impossibilità di tematizzarlo. |
| 5 | Verifica | Nuovo test di contrasto in `themes.test.ts` sulle coppie usate; verifica manuale con GitHub Light e One Dark Pro | Blocca le regressioni di tema senza screenshot fragili. |
| 6 | i18n | Nessuna chiave nuova | I colori non sono testo; restano +3 shell, +6 hint, −3 orfane. |

**Modifiche al piano**
- Criteri di successo e criteri di accettazione: aggiunto il requisito AA su tutte le 10 interfacce e il divieto di hex nei nuovi componenti.
- Vincoli: aggiunta la sezione «Temi e contrasto» con il limite `accent`/`surface3` e la necessità del tooltip DOM.
- Approccio: classi a token per trigger, tooltip e pannello; mappa colori con i minimi misurati; `title` rimosso.
- Passi 2 e 3: aggiunti tooltip, classi tema e test di contrasto; nessun passo nuovo.
- Rischi: aggiunti contrasto nei temi chiari e tooltip personalizzato (clipping/doppio tooltip).
- Test: aggiunta la verifica di tema (un test unitario per tutte le 10 interfacce + manuale chiaro/scuro).

**Prima: 3 passi → Dopo: 3 passi** (nessun passo nuovo; passi 2 e 3 estesi).
