# Piano — ASSISTANT unificato (dati + analisi)

Repo `lazstatjs-pro`, base `main`, v0.31.0. Stato: **F0–F2 implementate; F3 aperta**.
Piano precedente: `docs/plans/2026-11-09-assistant-minitab-piano.md`.

## 1. Decisione di prodotto

Un solo **ASSISTANT**, con due domini specializzati dal contesto:

| Contesto | Dominio | Cosa fa |
| --- | --- | --- |
| Tab DATA | Dati | tipo, pulizia, trasformazione, import/export |
| Tab ANALISI | Analisi | scelta, precompilazione, lancio, Report Card |
| Vista a tutta pagina | Analisi | stessa struttura, più spazio; assorbe il wizard e mostra il flowchart |

Nome visibile: **Assistant** (italiano: **Assistente**). Id analisi: `assistant`.
Il vecchio id `wizard` resta come alias di compatibilità, non come seconda UI.

Principi:

1. **Una struttura, non due pannelli.** Shell, stato, breadcrumb, card e i18n sono condivisi; cambiano solo le foglie.
2. **Nessun motore nuovo.** Il dominio dati comanda operazioni già esistenti; il dominio analisi riusa `recommendWizard`, `assignRole`, `runAnalysisWith`.
3. **Compatibilità prima della pulizia.** Progetti, run-report e link di help salvati non devono rompersi.
4. **Il dominio dati diagnostica, non elenca comandi.** Il valore aggiunto è “ecco il problema, ecco il fix a un clic”.
5. **Il flowchart è una vista dell'albero.** Nessuna logica parallela: il disegno legge gli stessi nodi e gli stessi passi.
6. **La catena è una sequenza di foglie, non una foglia multipla.** Ogni passo resta una procedura con il suo output.

## 2. Stato attuale verificato

- `AssistantPanel` è renderizzato solo dentro il ramo `activeTab === 'data'` (`src/App.tsx`); il tab Analisi non lo vede.
- Il wizard è un'analisi separata: entry nel registry, `params.wizard`, ruoli, runner, `paramsSnapshot`, tipo chart, topic di help, `meta.analysis.wizard.*`, test, golden e sample.
- `DEFAULT_SETTINGS.activeAnalysis` è `'wizard'`; al boot l'id è validato contro `ANALYSIS_TABS` e, se manca, ricade sul default.
- Il rerun usa `ANALYSIS_RUNNERS[analysisId]`: un output salvato con `analysisId: 'wizard'` non sarebbe più rieseguibile se l'id sparisse.
- Esistono due tassonomie: `WizardGoal` (`describe`, `compare`, `associate`, `predict`, `survive`, `forecast`, `plan`) e l'albero Assistant (`describe`, `compare`, `associate`, `predict`, `time`, `plan`, `missing`). L'albero copre già tutti i goal del wizard.
- Il “Non lo so” chiama il kernel con `goal: 'compare'` fisso (`src/ui/assistant/recommend.ts`): unificare serve anche a togliere questo limite.
- Il dominio dati dispone già di: `updateColType`, `updateColumnLevels`, `updateColumnRecode`, missing code via `onColumnMeta`, `validateValue`/`countInvalidCells`/`findInvalid`, struttura colonne e righe, fill/sort/clear, `ImportWizard`, `ExportDialog`.

## 3. Architettura target

### 3.1 Layering

```
src/ui/assistant/
  tree.ts                 # domini, nodi, radici, validatori (dato puro)
  apply.ts                # procedure leaf -> ProjectParams
  data.ts                 # diagnosi dati + azioni disponibili
  recommend.ts            # kernel -> leaf, per qualunque goal
  card.ts                 # card assunti + card qualità
  flow.ts                 # layout puro del flowchart (nodi, archi, colonne)
  useAssistant.ts         # stato shell, localStorage v2
  AssistantPanel.tsx      # pannello docked (Data + Analisi)
  AssistantFlow.tsx       # flowchart progressivo (DOM + SVG)
  AssistantWorkspace.tsx  # vista a tutta pagina (assorbe il wizard)
  AssistantReportCard.tsx # render condiviso delle due card
```

`tree.ts` resta dato puro; `data.ts` importa solo barrel pubblici (`stats/wizard`, `grid/types`). Nessuna dipendenza nuova da `stats/kernels` o `stats/tables` dentro `ui/`.

### 3.2 Modello dei nodi

```ts
type AssistantDomain = 'data' | 'analysis';
type AssistantRoleKind = 'continuous' | 'binary' | 'categorical' | 'group' | 'count' | 'event' | 'any';

type AssistantNode = AssistantQuestion | ProcedureLeaf | DataLeaf;

interface AssistantOption {
  id: string;
  label: MessageKey;
  /** Una frase: quando scegliere questa risposta. */
  help: MessageKey;
  next: string;
}

interface AssistantQuestion {
  kind: 'question'; id: string; prompt: MessageKey;
  help: { definition: MessageKey; example: MessageKey }; // obbligatorio
  options: readonly AssistantOption[];
}

interface AssistantRoleHint {
  roleKey: string;
  from: 'outcome' | 'group' | 'second';
  /** Tipo atteso dalla foglia, non solo dal ruolo dell'analisi. */
  kind: AssistantRoleKind;
  /** Colonne minime per questo ruolo (default 1; 2 per correlazione/accordo). */
  min?: number;
  /** Se vero, l'assenza non blocca: il ruolo resta facoltativo. */
  optional?: boolean;
}

type AssistantValueRule = 'binary' | 'event01' | 'count' | 'ordinal' | 'groupLevels';

interface AssistantDataContract {
  /** Ruoli colonna; vuoto solo con `manual` esplicito. */
  roles: AssistantRoleHint[];
  /** Righe minime per un run sensato (default 1). */
  minRows?: number;
  /** Completezza richiesta: righe intere o coppie appaiate. */
  complete?: 'rows' | 'pairs';
  /** Regole sui valori, oltre al tipo della colonna. */
  values?: AssistantValueRule[];
  /** Nessuna colonna: conteggi o input manuali. */
  manual?: 'counts' | 'inputs';
}

interface ProcedureLeaf {
  kind: 'leaf'; domain: 'analysis';
  analysisId: string; variant?: MessageKey;
  /** Obbligatorio per ogni foglia, anche per le tabelle manuali. */
  contract: AssistantDataContract;
  checks: MessageKey[];
  help: MessageKey;
  preset?: { ttest?: 'ind' | 'dep'; anova?: 'oneway'; variances?: 'two'; proportions?: 'twoProp' };
  alternative?: string;
}

interface DataLeaf {
  kind: 'leaf'; domain: 'data';
  action: DataActionId;          // solo azioni esistenti
  checks: MessageKey[];          // cosa osserva la card qualità
  help: MessageKey;              // cosa fa e cosa serve
  requires?: 'column' | 'selection' | 'none';
}
```

Radici: `ASSISTANT_ROOTS = { data: 'd1', analysis: 'a1' }`.
Il validatore prova entrambi i domini: edge esistenti, nessun ciclo, nodi raggiungibili, `analysisId` in `ANALYSIS_IDS`, contratto presente su ogni foglia, ruoli reali, tipi attesi e `min`, `manual` solo con ruoli vuoti, `DataActionId` nell'elenco chiuso, help su domanda/opzione/foglia, chiavi i18n presenti nelle sei lingue.

### 3.3 Dominio dati v1

Sviluppo orizzontale, da sinistra a destra: ogni colonna è una domanda, ogni ramo un'opzione. Il dominio si chiude con il passaggio all'analisi.

Elenco chiuso delle azioni (solo funzioni già presenti):

```ts
type DataActionId =
  | 'openImport' | 'openExport' | 'saveProject'
  | 'inspectTypes' | 'declareMissing' | 'findInvalid'
  | 'inspectColumns'
  | 'addColumn' | 'duplicateColumn' | 'deleteColumn' | 'moveColumn' | 'addRow'
  | 'sortRows' | 'fillDown' | 'fillRight' | 'clearRange'
  | 'setColumnType' | 'recodeLevels' | 'declareMissingCodes'
  | 'handoffAnalysis';
```

Schema delle domande:

| Nodo | Domanda | Opzioni → nodo successivo |
| --- | --- | --- |
| `d1` | Cosa vuoi fare con i dati? | import/export → `d2`; controllare la qualità → `d3`; cambiare la struttura → `d4`; trasformare una colonna → `d5`; passare all'analisi → `h1` |
| `d2` | Importare o esportare? | importare un file → `L-import`; esportare i dati → `L-export`; salvare il progetto → `L-save`; indietro → `d1` |
| `d3` | Cosa vuoi controllare? | tipi delle colonne → `L-types`; valori mancanti → `L-missing`; celle non valide → `L-invalid`; colonne vuote/costanti/ID → `L-columns`; indietro → `d1` |
| `d4` | Cosa vuoi cambiare? | colonne → `d4a`; righe → `d4b`; un intervallo → `L-clear`; indietro → `d1` |
| `d4a` | Sulla struttura delle colonne? | aggiungi → `L-add-column`; duplica → `L-duplicate-column`; elimina → `L-delete-column`; sposta → `L-move-column`; indietro → `d4` |
| `d4b` | Sulle righe? | aggiungi riga → `L-add-row`; ordina → `L-sort`; riempi in basso → `L-fill-down`; riempi a destra → `L-fill-right`; indietro → `d4` |
| `d5` | Che trasformazione? | cambia tipo → `L-column-type`; ricodifica livelli → `L-recode`; dichiara codici mancanti → `L-missing-codes`; indietro → `d1` |
| `h1` | I dati sono pronti? | passa all'Assistente analisi → `L-handoff`; resta sui dati → `d1` |

Foglie e funzioni:

| Foglia | Cosa fa | Funzione esistente |
| --- | --- | --- |
| `L-import` | apre l'import | `ImportWizard` |
| `L-export` | apre l'export | `ExportDialog` |
| `L-save` | salva il progetto | `saveProjectFile` |
| `L-types` | diagnostica i tipi e propone il tipo corretto per colonna | `updateColType`, `validateValue` |
| `L-missing` | conta i mancanti e dichiara i codici | `missingCellCount`, `onColumnMeta` |
| `L-invalid` | elenca e raggiunge le celle non valide | `countInvalidCells`, `findInvalid` |
| `L-columns` | segnala colonne vuote, costanti o con un solo valore | `profileColumns`, `distinctColumnValues` |
| `L-add-column` / `L-duplicate-column` / `L-delete-column` / `L-move-column` | struttura delle colonne (sposta: sinistra/destra) | `addColumn`, `duplicateColumn`, `deleteColumn`, `moveColumn` |
| `L-add-row` | aggiunge una riga | `addRow` |
| `L-sort` | ordina per colonna (ASC/DESC) | `sortByColumn` |
| `L-fill-down` / `L-fill-right` | riempie la selezione | `fillDownRange`, `fillRightRange` |
| `L-clear` | cancella l'intervallo selezionato | `clearRange` |
| `L-column-type` | imposta il tipo della colonna | `updateColType` |
| `L-recode` | ricodifica i livelli | `updateColumnRecode` |
| `L-missing-codes` | dichiara i codici mancanti | `onColumnMeta` |
| `L-handoff` | passa all'Assistente analisi | transizione di dominio |

Diagnosi calcolate con funzioni esistenti: colonne vuote/costanti, celle non valide, mancanti, colonne ID, livelli eccessivi. Le righe duplicate compaiono solo nella card qualità come conteggio informativo, senza foglia né azione: non esiste una deduplica e un vicolo cieco sarebbe peggio di un'informazione. Ogni riga della diagnosi ha al massimo un'azione; se l'azione non esiste, la diagnosi è informativa e non promette un fix.

Azioni distruttive o che cambiano il tipo (`updateColType`, elimina colonna, svuota intervallo, riempi) mostrano un'anteprima e chiedono conferma; l'undo della griglia resta disponibile. Nessuna conversione parte da un clic sulla card senza conferma.

Card qualità: `ok` nessun rilievo; `warn` mancanti o colonne costanti; `fail` celle non valide o tipi incoerenti; `info` import/export. Stesso contratto `AssistantCardSpec`, soglie proprie.

Le foglie che richiedono un parametro d'azione (colonna, direzione, ordine, intervallo) mostrano il controllo minimo prima di eseguire; nessuna azione indovina il target. Se manca la selezione, la foglia porta al data editor senza applicare nulla.

### 3.4 Dominio analisi

Stesso sviluppo orizzontale. L'albero conserva 7 obiettivi e 20 foglie; lo schema esplicito è:

| Nodo | Domanda | Opzioni → nodo successivo |
| --- | --- | --- |
| `a1` | Qual è il tuo obiettivo? | descrivere → `a2`; confrontare → `a3`; associare → `a4`; prevedere → `a5`; tempo → `a6`; pianificare → `L-samplesize`; dati mancanti → `L-mi` |
| `a1b` | Non lo so: cosa vedi nel foglio? | numeri e gruppi → `a3a`; solo numeri → `a2`; categorie → `a4` |
| `a2` | Cosa vuoi descrivere? | riassunto → `L-descriptive`; distribuzione → `L-distfit` |
| `a3` | Cosa confronti? | medie → `a3a`; dispersione → `L-variances`; proporzioni → `L-proportions` |
| `a3a` | Che disegno? | due colonne (formato largo) → `L-ttest-ind`; misure appaiate → `L-ttest-paired`; colonna gruppo (formato lungo) o più gruppi → `L-anova` |
| `a4` | Cosa associ? | due numeriche → `L-correlation`; due categoriche → `a4a`; accordo → `L-agreement` |
| `a4a` | Che tabella? | 2×2 → `L-chisquare`; R×C → `L-contingency` |
| `a5` | Che esito? | continuo → `L-regression`; binario → `L-logistic`; conteggi → `L-countreg`; ordinale → `L-ordinal` |
| `a6` | Che tipo di tempo? | serie → `L-timeseries`; sopravvivenza → `a6a` |
| `a6a` | Cosa vuoi stimare? | curve e log-rank → `L-survival`; hazard ratio → `L-cox` |

“Non lo so” non è un'ottava opzione: è un'azione sotto la domanda. Alla radice apre `a1b`; nelle sotto-domande propone una foglia con una motivazione e due scelte (“Usa questa procedura” / “Continua a scegliere”), senza saltare la domanda. Se i dati sono incompleti, il footer porta al data editor.

Chi quadrato e contingenza non leggono le colonne del foglio: la foglia con `manual: 'counts'` spiega che i conteggi vanno inseriti nella tabella della procedura e non mostra un finto prefill.

Le foglie sono le 20 procedure già presenti (`descriptive`, `distfit`, `ttest`, `anova`, `variances`, `proportions`, `correlation`, `chisquare`, `contingency`, `agreement`, `regression`, `logistic`, `countreg`, `ordinal`, `timeseries`, `survival`, `cox`, `samplesize`, `mi`, più la variante appaiata). Il formato lungo con due livelli va su ANOVA: il t-test del repo legge due colonne continue, non esito + gruppo. Cambia il comportamento:

- **Applica**: se l'analisi attiva è già quella della foglia, compila i parametri e resta sul tab; altrimenti il pulsante diventa “Apri <procedura>” e cambia scheda.
- **Esegui**: targettizza sempre la foglia, passa al tab Analisi, produce il run-report con marker `assistant` e card.
- **Non lo so**: alla radice apre `a1b` (forma dei dati); nelle sotto-domande resta il goal dell'antenato, non è più `compare` fisso.

La vista a tutta pagina (`assistant`) mostra lo stesso albero e le stesse azioni, senza il form del wizard e senza un secondo run-report di raccomandazione.

### 3.5 Shell condiviso

- Il pannello sale al livello shell: visibile nei tab DATA e ANALISI, nascosto in Help e Settings.
- Larghezza 280–520 px, rail 44 px, drawer sotto 1024 px: comportamento attuale.
- Su ANALISI il pannello parte **collassato** sotto i 1280 px, per non schiacciare libreria/opzioni/output; la scelta esplicita dell'utente vince sempre.
- Un solo stato: `lazstat.assistant.v2` con `{ open, width, paths: { data, analysis } }`. Migrazione da v1 (leaf/width/open) alla prima apertura.
- Il dominio segue il tab attivo; le transizioni esplicite possono cambiare solo il dominio (“Torna ai dati”, stesso tab) oppure dominio e tab (“Passa all'analisi”, “Apri il foglio dati”).

### 3.6 Vista a tutta pagina e alias

- Registry: `{ id: 'assistant', label: 'Assistant', family: 'guided' }`.
- `AssistantWorkspace` sostituisce `WizardForm` nel ramo `assistant`; il pulsante Run generico è nascosto perché l'esecuzione passa dalle foglie.
- Alias `wizard → assistant` per: `activeAnalysis` in lettura, `analysisLabel`, topic di help, link di help.
- Il runner `wizard` resta **nascosto** una release per rieseguire i run-report storici; non compare nella libreria.
- `params.wizard` resta letto e scritto dallo schema 3; serve solo a inizializzare la vista quando un progetto salvato lo contiene.

### 3.7 Flowchart progressivo

Minitab mostra un diagramma che si completa domanda dopo domanda. Lo replichiamo come **vista dello stesso albero**, non come secondo motore:

- `flow.ts` calcola il layout **orizzontale, da sinistra a destra**: colonne = profondità, righe = nodi; include il percorso risposto, la domanda corrente con le sue opzioni e le foglie raggiungibili al passo successivo. Il resto dell'albero resta fuori: un grafo completo con 20 foglie sarebbe illeggibile e inutilizzabile a 320 px.
- `AssistantFlow.tsx` disegna i nodi come box DOM (testo, wrapping, focus, click) e gli archi come SVG sotto di essi. Percorso scelto in evidenza, alternative attenuate, nodo corrente in accento, foglia con “Applica/Esegui”.
- Il diagramma è **progressivo**: cliccare un nodo già risposto tronca il percorso a quel punto (stessa semantica di `back`, ma puntuale). Serve un `goTo(index)` in `useAssistant`.
- Le transizioni di dominio sono nodi speciali: dal fondo del percorso dati parte un arco tratteggiato verso “Analisi”; nell'analisi un nodo “Dati” a sinistra riporta al dominio dati. Non sono foglie statistiche e non producono output.
- A11y: i nodi sono `<button>` reali; l'SVG è `aria-hidden`; breadcrumb e testo della domanda restano l'alternativa accessibile. Nessun drag, nessun canvas.
- Larghezza: scroll orizzontale sotto i 900 px; nel pannello docked v1 resta il breadcrumb compatto, il flowchart vive nella vista a tutta pagina.
- Lingue: etichette su due righe con `title` completo; il layout non dipende dal testo (niente misurazione canvas).

#### Resa grafica

- Nodi da 160–200 px, due righe di testo, 11–12 px; colonne a 220–260 px; gap verticale 12–16 px. Massimo tre colonne visibili (percorso, domanda corrente, foglie successive), il resto in scroll orizzontale.
- Stati visivi: risposto (bordo pieno e check), corrente (bordo accento e focus), disponibile (neutro), alternativa (tratteggio, opacità 60%), foglia (card con nome procedura, ruoli richiesti, “Applica/Esegui”), foglia in catena (badge con l'ordine).
- Catena: le foglie scelte possono stare su rami diversi e non si disegnano archi tra loro; la striscia “Catena” sotto il diagramma è l'unica rappresentazione dell'ordine.
- Archi bezier o ortogonali con angoli arrotondati: solidi sul percorso scelto, tratteggiati sulle alternative e sulle transizioni di dominio. Il grafo è progressivo, quindi non servono algoritmi di minimizzazione degli incroci.
- Sfondo a griglia leggera, colori dai token del tema chiaro/scuro, niente ombre pesanti; transizione del percorso 150 ms, disattivata con `prefers-reduced-motion`.
- Niente zoom o minimappa in v1; un solo pulsante “adatta alla larghezza”. Sotto 900 px il diagramma scorre in orizzontale; nel pannello resta il breadcrumb.

### 3.8 Transizioni tra domini e tab

| Da | Comando | Dominio | Tab |
| --- | --- | --- | --- |
| Dati, foglia `L-handoff` | Passa all'Assistente analisi | analisi | ANALISI |
| Dati, footer | Passa all'analisi | analisi | ANALISI |
| Analisi, footer | Torna ai dati | dati | invariato |
| Analisi, footer | Apri il foglio dati | dati | DATA |
| Breadcrumb | Dati / Analisi | cambia | invariato |
| Foglia analisi, riparazione | Apri editor dati | dati | DATA, colonna in focus |

Il percorso di ciascun dominio resta in `paths.data` / `paths.analysis`: cambiare dominio non azzera le risposte. La riparazione porta al data editor e “Torna all'analisi” ripristina la foglia.

### 3.9 Catena di foglie (run multipli)

- **Una foglia = una procedura.** Non esiste selezione multipla dentro la foglia: “Applica” ed “Esegui” hanno un solo target e il Report Card un solo output.
- **Selezione di più foglie = catena ordinata.** L'utente aggiunge foglie alla catena dall'ordine che vuole; ogni voce è una procedura con i suoi ruoli. Il flowchart mostra le foglie scelte con un badge numerico, la striscia “Catena” mostra l'ordine e permette rimozione e spostamento.
- **Esecuzione sequenziale.** Ogni passo memorizza il proprio snapshot di parametri quando viene aggiunto; l'esecuzione usa lo snapshot, non i parametri mutati dal passo precedente. La forma visibile non cambia durante la catena e torna allo stato iniziale alla fine. Ogni passo produce il proprio run-report e Report Card, accodati nel session-report. In v1 non c'è un output combinato.
- **Duplicati e ripresa.** La stessa foglia con lo stesso snapshot non può comparire due volte; la stessa procedura con colonne diverse è ammessa (es. due regressioni su esiti diversi). Ogni passo ha un id proprio. Se un passo fallisce durante il run, “Riprova dal passo fallito” riparte da lì senza duplicare i completati. “Esegui” singolo e “Esegui catena” restano distinti.
- **Comandi.** Sulla foglia: “Aggiungi alla catena”, “Esegui” (singola). Sulla striscia: “Esegui catena (n)”, rimuovi, sposta su/giù, svuota. Cap 8 passi per non espellere i run precedenti dal limite di 20 output.
- **Fallimento.** Il preflight di §3.12 valida tutti i passi prima di partire: se uno è invalido, nessun run parte e si parla di “passo da risolvere”. Se invece il run fallisce durante l'esecuzione, la catena si ferma a quel passo e i run completati restano. Nessun rollback.
- **Metadati.** `AssistantRunMeta.chain?: { id, index, total }`, opzionale e retro-compatibile; il parse degli output lo rilegge, così la sessione può raggruppare i passi.
- **Colonne cambiate.** Se l'utente modifica il foglio dopo aver aggiunto i passi, gli snapshot vengono rimappati per `column.id`; se una colonna non esiste più, il passo è invalido e il preflight lo segnala. Non si eseguono snapshot con indici sbagliati.
- **Stato.** La catena vive in `lazstat.assistant.v2` (`chains.analysis`), non nel progetto.
- **Fuori v1:** catene di azioni dati, bundle di procedure dentro una foglia, esecuzione parallela.

### 3.10 Coerenza del workflow

#### Invarianti

1. Ogni domanda ha almeno due risposte, un aiuto e un'uscita (“Torna indietro”; alla radice “Chiudi”).
2. Ogni foglia ha un'azione (procedura o azione dati) e un ritorno; nessuna foglia informativa senza un next step.
3. Ogni foglia, comprese quelle `manual`, dichiara un contratto dati; ogni ruolo è `assigned`, `needsChoice`, `unavailable`, `typeMismatch` o `valueMismatch`, e “Esegui” è disabilitato finché esiste un problema. Percorso e riparazione sono definiti in §3.12.
4. Ogni nodo è raggiungibile, senza cicli; ogni passaggio conserva il percorso e “Torna indietro” non azzera le altre risposte.
5. Il validatore prova gli invarianti e `check-locale` prova che ogni aiuto esista nelle sei lingue.

#### Contratti delle foglie

| Foglia | Ruoli minimi | Tipo atteso | Note |
| --- | --- | --- | --- |
| `descriptive` | `vars` ≥ 1 | continuous | può aggiungere altre variabili |
| `distfit` | `variable` + `group` opzionale | continuous + group | il gruppo non blocca |
| `variances` | `variable` + `group` | continuous + group | preset due gruppi |
| `proportions` | `variable` + `group` | binary + group | preset due proporzioni |
| `ttest-ind` | `var1` + `var2` | continuous ×2 | solo formato largo |
| `ttest-paired` | `var1` + `var2` | continuous ×2 | coppie complete |
| `anova` | `dep` + `grp` | continuous + group | anche due livelli |
| `correlation` | `vars` ≥ 2 | continuous ×2 | due hint sullo stesso ruolo |
| `chisquare` | — | tabella manuale | nessun prefill dal foglio |
| `contingency` | — | tabella manuale | nessun prefill dal foglio |
| `agreement` | `columns` ≥ 2 | continuous ×2 | stesse unità; kappa su codici numerici |
| `regression` | `dep` + `indeps` ≥ 1 | continuous | |
| `logistic` | `outcome` + `predictors` ≥ 1 | binary + any | esito binario, non continuo |
| `countreg` | `dep` + `indeps` ≥ 1 | count + any | conteggi |
| `ordinal` | `dep` + `indeps` ≥ 1 | ordinal + any | categorie ordinate |
| `timeseries` | `variable` | continuous | righe in ordine |
| `survival` | `time` + `event` + `group` opzionale | continuous + event + group | evento 0/1; gruppo per log-rank |
| `cox` | `time` + `event` + `covariates` ≥ 1 | continuous + event + any | |
| `samplesize` | — | input manuali | nessun dato richiesto |
| `mi` | `variables` ≥ 1 + `outcome` | any | predittori opzionali |

I ruoli `optional` non bloccano: se mancano, la foglia funziona senza. `complete: 'pairs'` richiede coppie complete (t-test appaiato); `complete: 'rows'` è il default per correlazione, regressione e modelli. La matrice di riparazione per tutte le foglie è in §3.12.

#### Incongruenze trovate e correzioni

| # | Problema | Correzione |
| --- | --- | --- |
| 1 | “Gruppi indipendenti” puntava a `ttest`, che legge due colonne continue; il formato lungo con colonna gruppo non funziona | domanda sul formato: largo → `ttest`, lungo → `anova` anche con due livelli |
| 2 | La logistica poteva ricevere un esito continuo: `from: outcome` preferisce le colonne continue | `kind: 'binary'` sulla foglia; `apply` sceglie solo il tipo atteso |
| 3 | Sopravvivenza/Cox potevano ricevere un gruppo multi-livello come evento | `kind: 'event'`; se manca una colonna 0/1, la foglia la chiede |
| 4 | Correlazione e accordo precompilavano una sola variabile | `min: 2` e secondo hint sullo stesso ruolo |
| 5 | `chisquare` e `contingency` non leggono colonne: sono tabelle di conteggi | foglia `manual: 'counts'`: spiega i conteggi, niente finto prefill |
| 6 | Varianze e proporzioni potevano partire in modalità a un campione | preset a due gruppi o sotto-domanda esplicita |
| 7 | La foglia “righe duplicate” non aveva alcuna azione | fuori dall'albero v1; resta informativa nella card qualità |
| 8 | La diagnosi “colonne vuote/costanti/ID” non offriva un fix | azioni: elimina colonna o imposta tipo `id`; altrimenti solo card |
| 9 | Diverse foglie dati richiedono una colonna o una selezione che non veniva chiesta | `requires: 'column' \| 'selection'` e picker nella foglia |
| 10 | Griglia vuota: qualità, struttura e handoff non avevano uscita | con zero colonne restano solo import e aggiungi colonna; handoff disabilitato con messaggio |
| 11 | “Non lo so” alla radice non ha un goal per il kernel | mini-controllo della forma dei dati (numeriche, gruppi) prima di proporre un ramo |
| 12 | La catena applicava i passi ai parametri mutati dal passo precedente | snapshot per passo all'aggiunta; la forma visibile non viene toccata |
| 13 | “I dati sono pronti?” poteva passare all'analisi con rilievi aperti | passa con avviso esplicito; la card qualità resta consultabile |
| 14 | Dal dominio dati non c'era una scorciatoia stabile verso l'analisi | footer “Passa all'analisi” sempre presente |

#### Percorsi end-to-end da testare

1. **Solo dati:** import → tipo corretto → mancanti dichiarati → export.
2. **Dati → analisi:** qualità → handoff → confronto medie → applica → esegui → card.
3. **Analisi senza ruoli:** foglia regression → manca un predittore → “Vai ai dati” → torna → applica.
4. **Catena:** descriptive → correlation → regression; ordine, un passo fallito, ripresa, session-report.
5. **Griglia vuota:** import come unica uscita; foglia analisi con “Nessun dato”.
6. **Uscite:** indietro da ogni domanda, chiusura pannello, cambio tab, percorso conservato.

### 3.11 Aiuto contestuale [?]

- Un solo `[?]` per ogni tornata di domande, in alto a destra. Apre un pannello con: cosa chiede la domanda (definizione), un esempio, “Le risposte” con una frase per ogni opzione, cosa fa “Non lo so” e cosa fa “Torna indietro”.
- Sulla foglia spiega: procedura, colonne richieste, cosa fanno “Applica” ed “Esegui”, cosa controllerà la card.
- Campi: `AssistantQuestion.help` (definizione + esempio), `AssistantOption.help` (una frase), `AssistantLeaf.help` (procedura). Il validatore rifiuta un nodo senza aiuto; `check-locale` verifica le sei lingue.
- A11y: `aria-expanded`, `aria-controls`, pannello con `role="dialog"` o `role="region"`, chiusura con Escape, focus che torna al `[?]`; niente tooltip solo hover.
- “Non lo so” ha lo stesso trattamento dell'aiuto: alla radice porta a `a1b`; nelle sotto-domande apre una proposta con la foglia suggerita, il motivo e “Usa questa procedura” / “Continua a scegliere”. Non apre direttamente una foglia senza conferma.
- Copy breve: una frase per opzione, massimo due per la definizione. Il costo vero è la traduzione, non il componente.

### 3.12 Ruolo mancante o incompatibile

#### Cosa succede oggi

`applyAssistantLeaf` parte dai parametri correnti e, se non trova una colonna compatibile, **lascia il ruolo com'era**. `assignments` legge i parametri, non l'esito della ricerca: un indice vecchio o fuori intervallo può apparire come assegnato (badge vuoto), `missing` resta vuoto e `validateRoleTypes` ignora gli indici fuori intervallo. Il pannello disabilita “Esegui” solo per i problemi di tipo, non per i ruoli mancanti; il run viene bloccato più tardi da `validateAnalysisColumnRefs` con un toast generico. In pratica l'utente può vedere una foglia “pronta”, premere Esegui e non ottenere né output né una spiegazione nel punto in cui si trova.

Casi peggiori: la logistica senza esito binario non viene nemmeno rilevata, perché `pickColumn` con `kind: 'any'` sceglie la prima colonna continua; la correlazione con una sola variabile non segnala il minimo di due; l'evento di sopravvivenza può essere un gruppo multi-livello. Sono errori silenziosi, non solo messaggi mancanti.

#### Non due eccezioni: un contratto per ogni foglia

La verifica non è una regola di ANOVA o regressione. **Ogni** foglia di analisi dichiara un `AssistantDataContract`; `validateLeafReadiness(leaf, grid, params)` è l'unico punto di controllo e vale per tutte le 20 procedure. Non esistono rami `if (analysisId === ...)`.

Il controllo gira:

1. quando la foglia viene mostrata;
2. prima di “Applica”, “Esegui” e “Aggiungi alla catena”;
3. nel preflight della catena;
4. nella raccomandazione e nella vista a tutta pagina.

Le foglie a tabella manuale (`chisquare`, `contingency`) e `samplesize` hanno `manual: 'counts' | 'inputs'`: non cercano colonne, ma dichiarano comunque il contratto e non possono essere trattate come “senza requisiti”. Le foglie del dominio dati usano lo stesso schema con `requires`: colonna o selezione mancante → focus della colonna o selezione nel data editor.

- **Ruoli opzionali.** `optional: true` (gruppo di distfit, gruppo di sopravvivenza) non produce un issue se manca; la foglia funziona senza.
- **Ordinale.** Non esiste un `ColType` ordinale: è una colonna categorica con `levels` dichiarati e ordinati. Se i livelli mancano o non sono ordinati, `valueMismatch` porta al LevelsEditor, non a una conversione di tipo.
- **Griglia di analisi.** La readiness usa `analysisGrid` (filtro righe + codici mancanti mascherati), non la griglia intera: altrimenti `minRows` e le regole 0/1 passano su righe che il run esclude. `grid` resta la sorgente per colonne e tipi.
- **Minimo e candidate.** Per ogni hint, `apply` risolve fino a `min` colonne distinte, filtrando per tipo e regola di valore; se non bastano, `unavailable`. Le candidate di un esito binario non includono una colonna continua.
- **Ritorno.** `lazstat.assistant.v2` salva anche `repairReturn` (leaf, percorso, dominio): “Apri editor dati” e “Torna all'analisi” non dipendono dalla memoria della chat.

#### Cinque stati, non uno

| Stato | Significato | Azione |
| --- | --- | --- |
| `assigned` | Colonna compatibile risolta e valori validi | nessuna; “Esegui” abilitato |
| `needsChoice` | Esistono colonne compatibili, ma nessuna è scelta | select inline delle candidate + “Usa questa colonna” |
| `unavailable` | Nel foglio non esiste una colonna del tipo richiesto | “Apri editor dati”, “Aggiungi colonna”, “Scegli un'altra analisi” |
| `typeMismatch` | Una colonna è assegnata, ma il tipo non è compatibile | “Converti tipo”, select delle candidate, “Apri editor dati” |
| `valueMismatch` | Il tipo è giusto, ma i valori non rispettano la regola (0/1, conteggi, ordinale, livelli) | “Correggi valori”, “Apri editor dati” |

`minRows` è un sesto motivo, a livello di foglia: “Servono almeno N righe complete” → “Apri editor dati” / “Importa”.

#### Percorso e riparazione

Ogni problema è un `AssistantIssue`:

```ts
type AssistantRepair =
  | { kind: 'focus-column'; column: number }
  | { kind: 'add-column'; type: ColType }
  | { kind: 'convert-type'; column: number; type: ColType }
  | { kind: 'edit-values'; column: number; rule: AssistantValueRule }
  | { kind: 'import' }
  | { kind: 'open-form' };

interface AssistantIssue {
  leafId: string;
  roleKey?: string;
  status: 'needsChoice' | 'unavailable' | 'typeMismatch' | 'valueMismatch' | 'tooFewRows';
  expected: MessageKey;
  found?: string;
  column: number | null;
  candidates: number[];
  repair: AssistantRepair[];
}
```

Il percorso non è un campo dell'issue: si ricava da `assistant.steps` + foglia, così è sempre coerente con il breadcrumb e con il flowchart. In testa alla foglia si legge:

> **Percorso:** Analisi › Confrontare › Medie › ANOVA
> **Problema:** manca la variabile di gruppo.
> **Cosa serve:** una colonna con pochi valori ripetuti (es. `Trattamento`: A/B/C).

Nella catena: “Catena · passo 2 di 3 · Analisi › … › ANOVA”. Nella vista a tutta pagina lo stesso percorso è evidenziato nel flowchart.

Riparazioni, tutte esplicite:

| Azione | Cosa fa davvero |
| --- | --- |
| **Apri editor dati** | passa al tab DATA, mette a fuoco la colonna colpevole e conserva il percorso Assistant |
| **Aggiungi colonna** | aggiunge una colonna in coda e la mette a fuoco; nome e tipo si scelgono nel data editor |
| **Converti tipo** | mette a fuoco la colonna e apre il controllo del tipo; nessuna conversione silenziosa |
| **Correggi valori** | mette a fuoco la colonna e mostra la regola (0/1, conteggi, ordinale, livelli) |
| **Importa** | apre l'import quando la griglia è vuota |
| **Apri modulo** | secondaria: apre la procedura per una scelta manuale, non sostituisce la riparazione dei dati |

Dopo la modifica, “Torna all'analisi” ripristina la foglia e riesegue il controllo: se il ruolo è risolto, “Esegui” si abilita senza cambiare percorso.

#### Matrice completa delle 20 foglie

| Foglia | Contratto | Se manca o è errato | Riparazione |
| --- | --- | --- | --- |
| `descriptive` | `vars` ≥ 1 continuo | nessuna colonna numerica | aggiungi/converti numerica |
| `distfit` | `variable` continuo + `group` opzionale | nessuna numerica | aggiungi/converti numerica |
| `variances` | `variable` continuo + `group` | manca il gruppo o la variabile | aggiungi gruppo / numerica |
| `proportions` | `variable` binaria + `group` | esito non binario o gruppo assente | correggi livelli / aggiungi gruppo |
| `ttest-ind` | `var1` + `var2` continui | manca la seconda colonna | aggiungi/converti; se il gruppo è in colonna → ANOVA |
| `ttest-paired` | `var1` + `var2` continui, coppie complete | manca la seconda misura | aggiungi/converti; se non appaiate → t-test indipendente |
| `anova` | `dep` continuo + `grp` | manca il gruppo o l'esito | aggiungi gruppo / numerica |
| `correlation` | `vars` ≥ 2 continui | una sola numerica | aggiungi/converti la seconda |
| `chisquare` | `manual: 'counts'` | conteggi non inseriti | apri la tabella dei conteggi |
| `contingency` | `manual: 'counts'` | conteggi non inseriti | apri la tabella dei conteggi |
| `agreement` | `columns` ≥ 2 continue, stessa unità | manca la seconda misura | aggiungi/converti |
| `regression` | `dep` continuo + `indeps` ≥ 1 | manca l'esito o un predittore | aggiungi/converti numerica |
| `logistic` | `outcome` binario + `predictors` ≥ 1 | esito continuo o multi-livello | correggi valori/livelli; predittore |
| `countreg` | `dep` conteggio + `indeps` ≥ 1 | esito non intero/non negativo | correggi valori; predittore |
| `ordinal` | `dep` ordinale + `indeps` ≥ 1 | esito non ordinato | correggi livelli; predittore |
| `timeseries` | `variable` continuo, righe in ordine | manca la serie o l'ordine | aggiungi/converti; ordina righe |
| `survival` | `time` continuo + `event` 0/1 + `group` opzionale | evento assente o multi-livello | aggiungi 0/1 / correggi valori |
| `cox` | `time` + `event` 0/1 + `covariates` ≥ 1 | evento o covariata mancanti | aggiungi 0/1 / numerica |
| `samplesize` | `manual: 'inputs'` | input non inseriti | apri il modulo |
| `mi` | `variables` ≥ 1 + `outcome` | nessuna colonna o esito assente | importa/aggiungi; scegli esito |

#### Anche le domande mostrano lo stato del ramo

Il controllo non compare solo alla foglia. Per ogni opzione, l'Assistant calcola lo stato del sottoalbero che porta alle foglie raggiungibili:

- se il ramo è eseguibile, nessun badge;
- se porta a una foglia con un problema, badge “dati da preparare” con il percorso breve (“Confrontare › Medie › ANOVA”) e il primo requisito mancante;
- il badge non blocca la scelta: l'utente può entrare e vedere cosa serve, oppure tornare indietro;
- alla radice e nel dominio dati lo stesso badge segnala “importa prima i dati” o “serve una colonna numerica”.

Così la verifica è sistematica per tutte le domande, non solo per le due foglie che hanno fatto da esempio.

#### Ponte e catena

- `resolveAssistantLeaf` restituisce per ogni ruolo `status`, `resolvedColumn` e `candidates`; `assignments` non legge più i parametri come prova di assegnazione.
- I parametri di base servono solo per le opzioni della procedura; i ruoli non risolti non ereditano un indice vecchio. `apply` scrive solo le colonne risolte e non tocca le altre opzioni.
- `validateRoleTypes` segnala anche gli indici fuori intervallo come `unavailable`, non li salta.
- La catena fa un preflight di tutti i passi prima di partire: se il passo 2 non ha la variabile di gruppo, nessun passo parte e il messaggio dice “Passo 2 di 3: manca la variabile di gruppo”, con “Risolvi passo” e “Rimuovi passo”. Niente run parziali da una catena già invalida.
- La vista a tutta pagina usa gli stessi stati, lo stesso percorso e le stesse riparazioni del pannello.

#### Test

- **Tabella, non casi spot**: per ogni foglia della tree, il test verifica che il contratto esista, che ogni ruolo produca `unavailable` senza candidate, che un tipo sbagliato produca `typeMismatch`, che i valori fuori regola producano `valueMismatch` e che `canRun` sia falso. Una matrice copre tutte le 20 foglie.
- **Percorso**: l'issue espone gli stessi label del breadcrumb; nella catena include l'indice del passo.
- **Riparazione**: ogni `AssistantRepair` punta al tab DATA, alla colonna o al tipo giusto; dopo il ritorno la foglia rivaluta e si abilita.
- **e2e**: ANOVA senza gruppo, regressione senza dipendente, logistica senza esito binario, correlazione con una variabile, evento multi-livello, griglia vuota; badge del ramo; “Apri editor dati” e ritorno; catena con passo invalido e preflight.

## 4. Flusso utente

**Data.** L'utente apre il tab DATA: il pannello propone “Cosa vuoi fare con i dati?”. Sceglie “controlla i tipi”; la card elenca le colonne con celle non valide e il tipo suggerito; un clic applica `updateColType`. Import ed export sono foglie dirette. L'ultima domanda, “I dati sono pronti?”, porta a “Passa all'Assistente analisi”: cambia dominio e tab, lasciando memorizzato il percorso dati.

**Analisi.** L'utente apre il tab ANALISI: il pannello mostra l'albero delle procedure. Se la scheda corrente è già quella scelta, “Applica” compila i ruoli in place; “Esegui” lancia e produce il run-report con il Report Card. Se la scheda è un'altra, il pulsante dice “Apri ANOVA” e cambia scheda senza sorprese. In fondo restano due ritorni: “Torna ai dati” cambia solo dominio, “Apri il foglio dati” porta al tab DATA; il percorso di analisi resta memorizzato. Più foglie possono essere aggiunte alla catena: “Esegui catena” le esegue in ordine e ogni passo aggiunge un run-report al session-report, con il proprio Report Card.

**Vista a tutta pagina.** Chi vuole spazio apre Assistant dalla libreria: stesso albero, stesso ponte, stessa card, in un'area larga. Il flowchart mostra il percorso completato e le alternative: cliccare una domanda già risposta riavvolge il percorso, cliccare un'opzione lo estende. È il successore del tab wizard, non un secondo prodotto.

## 5. Fasi

Ogni fase si chiude con test mirati; il gate completo (`npm run check`, `npm run test:samples`, `check-locale`) si esegue a fine ondata.

### F0 — Nome visibile (0,5 giornata)

- Etichetta `meta.analysis.wizard.*` → Assistant/Assistente nelle sei lingue.
- Id `wizard` invariato; nessuna migrazione.
- Test: `check-locale`; snapshot testuali e2e aggiornati.

### F1 — Modello a due domini (1,5 giornata)

- `AssistantDomain`, `ProcedureLeaf`, `DataLeaf`, `AssistantRoleKind`, radici, `DataActionId`.
- Help obbligatorio su domanda, opzione e foglia; `min`/`optional`/`complete` per ruolo; `requires` per le foglie dati.
- Validatore esteso: help, ritorni, nessun vicolo cieco, tipi attesi, min colonne, raggiungibilità.
- `tree.test.ts`: entrambi i domini, edge/ruoli/azioni/chiavi, invarianti di 3.10.
- Nessuna UI nuova.

> **Stato F0–F1 (2026-11-09)**
> - F0: etichetta **Assistant** (italiano **Assistente**) nelle sei lingue; id `wizard` invariato.
> - F1: domini e radici `d1`/`a1`; contratti per le 20 foglie; `min`/`optional`/`complete`/`values`/`manual`; `requires` e `DataActionId`; validatore esteso a help, ritorni, raggiungibilità, ruoli, azioni e chiavi.
> - Help: campo obbligatorio su domanda, opzione e foglia. Il testo specifico di opzioni e foglie è per ora un fallback generico; F5 lo specializza. Il modello e il validatore sono pronti.
> - Test mirati: `npm run lint`, tree/apply/i18n 18/18, `test:samples` 7/7, `check-locale` 6/6. Gate completo: verde (1441/1441 test; depcruise, madge, filesize, docs:links).
> - Il dominio dati è un albero minimo che F3 espande; nessuna UI nuova.

### F2 — Shell condiviso (1 giornata)

- Pannello fuori dal ramo DATA; visibile su DATA e ANALISI.
- Dominio dal tab attivo; collapse di default su ANALISI sotto 1280 px.
- `lazstat.assistant.v2` con migrazione da v1.
- e2e: pannello su entrambi i tab, drawer, reload, larghezza.

> **Stato F2 (2026-11-09)**
> - Shell fuori dal ramo DATA: pannello su DATA e ANALISI, dominio dal tab attivo e percorsi separati.
> - `lazstat.assistant.v2`: `open` per dominio, `width` globale, `paths.data`/`paths.analysis`; migrazione v1→analysis.
> - ANALISI parte chiusa sotto 1280 px; l’apertura scelta resta salvata per dominio.
> - Test: lint, 22 test mirati, `e2e/assistant.spec.ts` 8/8 desktop (8 mobile skip), filesize/docs. Gate completo: verde (1445/1445 test; depcruise, madge, filesize, docs:links).
> - Il dominio dati in F2 mostra domanda/help; le azioni arrivano in F3.

### F3 — Dominio dati v1 (2 giornate)

- `data.ts`: albero completo (`d1`–`L-handoff`), diagnosi e action map verso le funzioni esistenti.
- Help per ogni domanda e opzione; `requires` con picker per le foglie che lavorano su una colonna o selezione.
- Guardia griglia vuota: solo import e aggiungi colonna; handoff disabilitato con messaggio.
- UI: elenco diagnosi, fix a un clic, card qualità; foglie import/export.
- Unit: diagnosi su griglie sintetiche, picker senza selezione; e2e: tipo errato corretto, missing dichiarato, export aperto, griglia vuota.

> **Stato F3 (2026-11-09)**
> - `src/ui/assistant/data.ts`: albero completo (8 domande, 20 foglie, `d1`–`data-handoff`), `DataActionParams`, `inspectData` e `dataActionBlocked`; `tree.ts` importa `DATA_TREE` e non duplica più azioni o foglie.
> - Help su ogni domanda, opzione e foglia nelle sei lingue; picker di colonna, tipo, codici, mapping, direzione e spostamento. Le opzioni di ritorno sono dichiarate `back: true`, così il validatore non le segnala come cicli.
> - Guardia griglia vuota: consentiti solo import e aggiungi colonna, handoff disabilitato con messaggio; card qualità con fix a un clic (invalid → validazione, missing → inspector sulla colonna, altro → inspector).
> - `useDataActions` collega le 20 azioni a import/export/salvataggio, validazione, colonne (duplica, elimina con conferma, sposta), righe (aggiungi, ordina, fill down/right, clear con conferma), tipo, recode, codici mancanti e handoff. La selezione è esposta da `DataWorkspace` ad `App`; nessun secondo modello dati.
> - Test mirati: lint, `data.test.ts` 8/8, `tree.test.ts` 5/5, App a 782 righe (eccezione invariata). E2e F3 in `e2e/assistant.spec.ts`: export aperto, missing codes dichiarati, tipo errato corretto, sort, griglia vuota; 13/13 desktop.
> - Gate completo F3: verde (1453/1453 test; depcruise, madge, filesize, docs:links).

### F4 — Vista a tutta pagina e assorbimento wizard (1,5 giornate)

- `assistant` nel registry; `AssistantWorkspace`; ramo `wizard` nascosto e alias.
- Default `activeAnalysis: 'assistant'`; migrazione in lettura.
- Help topic `assistant`; alias `wizard`.
- e2e: apertura dalla libreria, applica/esegui dalla vista, progetto salvato con `wizard` che apre Assistant.

> **Stato F4 (2026-11-09)**
> - Registry: `assistant` visibile e default di `activeAnalysis`; `wizard` resta in `ANALYSIS_ALL` ma fuori da `ANALYSIS_TABS`, così la libreria non lo mostra e i run-report storici restano rieseguibili.
> - `AssistantWorkspace` sostituisce il pannello di setup quando l'analisi attiva è `assistant`: albero e foglie condivisi con il pannello (`AssistantViews`), nessun run-report di raccomandazione e nessun pulsante Run generico; Apply/Run passano dalle foglie e aprono la procedura reale.
> - Migrazione in lettura `wizard → assistant` in `parseSettings`; alias `wizard`/`guided` per il topic di help, la cui pagina ora si chiama `assistant` nelle sei lingue.
> - Test: lint, 87 test mirati, e2e Assistant 17/17 desktop (apertura dalla libreria, Apply/Run dalla vista, progetto salvato con `wizard`), filesize (App 782). Gate completo: verde (1455/1455 test; depcruise, madge, filesize, docs:links).

### F5 — Flowchart e aiuto contestuale (1,5 giornata)

- `flow.ts` + unit test di layout; `AssistantFlow.tsx` nella vista a tutta pagina.
- `goTo(index)` in `useAssistant`, con test di troncamento del percorso.
- `AssistantHelp.tsx`: un `[?]` per tornata e per foglia, pannello con definizione, esempio, aiuto di ogni opzione, “Non lo so” e “Torna indietro”.
- e2e: flowchart visibile, stati visivi, badge di catena, click su un'opzione, click su un nodo già risposto, foglia con azioni; `[?]` apribile e chiudibile con Escape su ogni tornata.
- A11y: focus, ordine di tabulazione, SVG `aria-hidden`, focus che torna al `[?]`.

> **Stato F5 (2026-11-09)**
> - `flow.ts` calcola il layout progressivo (percorso risposto, nodo corrente, opzioni successive; i ritorni `back` restano fuori dal grafo). `AssistantFlow` disegna nodi DOM reali e archi in SVG `aria-hidden`, con stati `answered`/`current`/`available`; un nodo disponibile risponde, un nodo già risposto tronca il percorso.
> - `useAssistant.goTo(index)` con `truncatePath` puro, coperto da test; il pannello docked riusa lo stesso stato.
> - `AssistantHelp`: pannello contestuale con definizione, esempio e aiuto di ogni opzione per le domande; aiuto e controlli per le foglie; “Non lo so”, “Torna indietro”, chiusura con Escape e focus che torna al `[?]`.
> - Test: 4 test di layout + 1 di troncamento (35 unit Assistant), e2e Assistant 21/21 desktop (flowchart, stati, click su opzione, troncamento, aiuto con Escape, foglia con azioni). Gate completo: verde (1460/1460 test; depcruise, madge, filesize, docs:links).

### F6 — Catena di foglie (2 giornate)

- Stato `chains.analysis` in `useAssistant`: aggiungi, rimuovi, sposta, svuota; cap 8.
- “Aggiungi alla catena” sulla foglia, badge sul flowchart, striscia Catena con “Esegui catena (n)”.
- Esecuzione sequenziale dagli snapshot dei passi; la forma visibile non cambia e torna allo stato iniziale alla fine; stop al primo errore con il passo fallito nel messaggio.
- Stessa foglia con stesso snapshot rifiutata; stessa procedura con colonne diverse ammessa. Preflight totale prima del primo run; “Riprova dal passo fallito” solo per errori di runtime, senza duplicare i completati.
- `AssistantRunMeta.chain` opzionale e parse in `parseStoredOutputs`; nessun bump di `PROJECT_VERSION`.
- Test: 3 passi producono 3 run-report nell'ordine; rimozione e riordino; errore al passo 2; ripresa; ordine indipendente dai parametri correnti; stessa foglia con colonne diverse; rimappatura dopo modifica colonne; reload conserva la catena; cap.

> **Stato F6 (2026-11-09)**
> - `chain.ts`: modello puro della catena (cap 8, dedupe per foglia + snapshot dei parametri, riordino, rimozione) e preflight totale che verifica ruoli, problemi di tipo e riferimenti alle colonne prima del primo run.
> - `useAssistant` conserva `chains` nello stato v2; `useAssistantChain` esegue i passi in sequenza lasciando intatta la forma visibile, si ferma al primo errore di runtime e permette di riprendere dal passo fallito senza duplicare i completati.
> - UI: “Aggiungi alla catena” sulla foglia (solo vista a tutta pagina), badge numerati sul flowchart, striscia Catena con riordino, rimozione, svuotamento, “Esegui catena (n)” e “Riprova dal passo i”. Nuove chiavi i18n in tutte e 6 le lingue.
> - `AssistantRunMeta.chain` (`{ index, total }`) opzionale, con parse difensivo in `parseStoredOutputs`.
> - Test: 7 unit della catena, +1 su `useAssistant`, +2 sul parse degli output; e2e Assistant 23/23 desktop (aggiunta, badge, riordino, rimozione, svuotamento, catena eseguita con un run-report per passo). Gate completo: verde (1470/1470 test).

### F7 — Coerenza end-to-end e uscite (2 giornate)

- Contratti per tutte le 20 foglie (`binary`, `event`, `count`, `ordinal`, `manual`), `min: 2` per correlazione/accordo, preset due gruppi per varianze/proporzioni.
- `validateLeafReadiness` unico, con cinque stati, `minRows`/`complete`, ruoli `optional`, percorso e riparazioni verso il data editor; usa `analysisGrid`.
- Domanda formato per le medie: largo → `ttest`, lungo → `anova`; foglie `manual` per chi quadrato, contingenza e sample size.
- “Non lo so” alla radice → mini-controllo della forma dei dati; badge “dati da preparare” sulle opzioni; handoff con avviso se restano rilievi.
- Footer “Passa all'analisi” sempre presente nel dominio dati.
- e2e dei sei percorsi di 3.10; test tabellare su tutte le foglie; e2e delle riparazioni.

> **Stato F7 (2026-11-09)**
> - `readiness.ts`: validatore unico con cinque stati (`ready`, `empty`, `missing-roles`, `type-mismatch`, `rules`), `minRows`/`complete`, ruoli `optional`, regole sui valori e riparazioni verso l’editor dati; `optionIsPrepared` alimenta il badge “dati da preparare”.
> - Domanda formato per le medie: largo → t-test, lungo → ANOVA; le foglie `manual` (chi quadro, contingenza, sample size) sono pronte senza colonne.
> - La foglia mostra lo stato di prontezza e “Correggi nell’editor dati” (apre DATA e porta il focus sulla colonna); il footer “Passa all’analisi” è sempre presente nel dominio dati.
> - `chainPreflight` usa lo stesso validatore, così la catena si ferma se un passo non è pronto.
> - Test: 4 unit tabellari sulla prontezza (20 foglie, griglia vuota, coppie incomplete, badge); e2e Assistant 26/26 desktop (formato lungo → ANOVA, regola violata + riparazione, footer dati→analisi). Gate completo: verde (1474/1474 test).

### F8 — Raccomandazione unificata (0,5 giornata)

- `recommendLeafForGrid(grid, goal, level)`; goal dalla posizione nell'albero.
- Test: ogni goal del kernel mappa su una foglia reale o su un messaggio esplicito.

> **Stato F8 (2026-11-09)**
> - `recommendLeafForGrid(grid, goal, level)` restituisce `{ leafId, message }`: una foglia reale quando il kernel la mappa, altrimenti un messaggio esplicito (`assistant.recommend.none`) o quello dei dati vuoti (`assistant.recommend.empty`).
> - `goalForAnswers` deriva il goal del kernel dalla risposta radice del percorso (describe, compare, associate, predict, time → survive/forecast, plan); pannello e vista usano lo stesso punto di ingresso.
> - “Non lo so” non è più un no-op silenzioso: apre la foglia consigliata o mostra il motivo per cui non può consigliarne una.
> - Test: 3 unit (tutti i 7 goal del kernel, mapping dalla radice, griglia vuota) ed e2e “Not sure” che apre una foglia. Gate completo: verde (1477/1477 test).

### F9 — Pulizia compatibilità (1 giornata, release successiva)

- Rimozione di `params.wizard`, ruoli wizard, runner legacy, `meta.analysis.wizard.*`, topic alias.
- Migrazione esplicita di `activeAnalysis` e degli output storici.
- Solo dopo che F4 è stata rilasciata e i progetti salvati sono stati riaperti almeno una volta.

Stima complessiva: 12–14 giornate.

## 6. Compatibilità e migrazione

| Superficie | Oggi | Transizione | Fine |
| --- | --- | --- | --- |
| `activeAnalysis` | `'wizard'` default | alias in lettura, default `'assistant'` | solo `'assistant'` |
| `params.wizard` | schema 3 | letto per inizializzare la vista | rimosso con migrazione |
| Output `analysisId: 'wizard'` | rerun nativo | runner legacy nascosto | rerun disabilitato o riapertura |
| Help | topic `wizard` | alias → `assistant` | topic unico |
| i18n | `meta.analysis.wizard.*` | etichetta Assistant, chiavi conservate | chiavi rimosse |
| Test/sample | id `wizard` | restano finché esiste il runner | aggiornati alla rimozione |

Nessun bump di `PROJECT_VERSION` in F0–F8: lo stato dell'Assistant e la catena restano locali, i parametri restano nello schema 3. Un eventuale salvataggio del percorso nel progetto è una decisione separata (versione 4).

- Normalizzare `wizard → assistant` **prima** del controllo su `ANALYSIS_TABS`, altrimenti un progetto salvato ricade sul default.
- `params.wizard`: mappa `outcome`/`group`/`second` sulla foglia consigliata; non inventare un percorso nuovo.
- Storage v2: migra `answers` v1 in `paths.analysis` e aggiunge `repairReturn`; catene con leaf id sconosciuti vengono scartate con avviso.
- `assistant` non ha runner: `RunControl` nascosto e guardia in `runAnalysis` per non lanciare l'id sbagliato.

## 7. Test e accettazione

- **Unit**: validatore due domini, contratto su ogni foglia, help su ogni domanda/opzione/foglia, nessun vicolo cieco, tipi attesi, min/optional/complete, cinque stati, percorso, `AssistantRepair`, diagnosi dati, apply in-place, mapping kernel→foglia (analysisId coerente), migrazione v1→v2, layout flowchart, catena (ordine, snapshot, duplicati, cap, preflight, errore runtime).
- **Matrice**: per tutte le 20 foglie, un caso senza candidate, uno con tipo errato e uno con valori fuori regola; `canRun` falso e riparazione attesa. Casi dedicati: ruolo opzionale assente, coppie incomplete, ordinale senza livelli, MI senza esito, `analysisGrid` filtrata.
- **e2e**: pannello su DATA e ANALISI; collapse di default su ANALISI; apply stessa/altra analisi; run con card; `[?]` su ogni tornata e chiusura con Escape; badge “dati da preparare” sul ramo; ANOVA senza gruppo, regressione senza dipendente, logistica senza esito binario, correlazione con una variabile, evento multi-livello; formato lungo → ANOVA; griglia vuota; “Apri editor dati” e ritorno; vista a tutta pagina; flowchart progressivo; transizioni dati→analisi e analisi→dati; catena di due/tre foglie con ordine, preflight, errore e reload; fix dati; drawer; reload.
- **i18n**: nessuna stringa in chiaro; `check-locale` verde per it/de/es/fr/pt-PT.
- **Compatibilità**: progetto con `activeAnalysis: 'wizard'` apre Assistant; run-report storico si apre; help `wizard` non è 404.
- **Gate**: `npm run check`, `npm run test:samples`, e2e desktop. Mobile fuori v1.

Criterio di accettazione: una sola superficie guidata per dominio, zero progetti salvati che si aprono male, nessun secondo report di raccomandazione.

## 8. Rischi e mitigazioni

1. **Scope creep del dominio dati** → v1 solo diagnosi e azioni esistenti; niente deduplica o formule nuove senza una fase dedicata.
2. **Spazio nel tab ANALISI** → rail di default sotto 1280 px; drawer sotto 1024 px.
3. **Progetti e output storici** → alias `wizard`, runner legacy, test di riapertura.
4. **Due radici confuse** → dominio dal tab, passaggio esplicito, breadcrumb con il nome del dominio.
5. **Card in lingua UI invece che report** → domanda aperta, non blocca F0–F3.
6. **Duplicazione della raccomandazione** → un solo kernel; la vista a tutta pagina non produce un secondo report.
7. **Flowchart illeggibile** → solo percorso e opzioni correnti, nodi a due righe, scroll orizzontale, nessun grafo completo.
8. **Doppia navigazione (albero e diagramma)** → stesse azioni e stesso stato; il diagramma non introduce un secondo percorso.
9. **Ciclo dati↔analisi** → ogni dominio ha il suo percorso e il breadcrumb dice dove sei; i ritorni non perdono le risposte.
10. **Foglia multipla percepita** → la foglia dichiara “una procedura”; la catena e il session-report rendono esplicita la sequenza.
11. **Catena interrotta o troppo lunga** → stop al primo errore, cap 8, i run completati restano nel session-report.
12. **Ruoli in conflitto tra passi** → ogni passo usa il proprio snapshot; il controllo pre-run segnala il passo, non l'intera catena.
13. **Carico cognitivo delle domande** → al massimo sette opzioni per tornata, “Non lo so” fuori dall'elenco, etichette brevi, un solo `[?]`, esempio concreto.
14. **Aiuto non tradotto o obsoleto** → help e opzioni nella stessa fonte, `check-locale` bloccante, revisione del copy a ogni modifica dell'albero.
15. **Formato lungo ingannevole** → la domanda sul formato è obbligatoria prima di `ttest`; il formato lungo porta ad ANOVA, non a un t-test forzato.
16. **Analisi a tabella manuale percepite come precompilate** → la foglia dice esplicitamente “inserisci i conteggi” e non mostra colonne del foglio.
17. **Riparazioni distruttive** → anteprima, conferma e undo per tipo, elimina, svuota e riempi.
18. **Badge su ogni opzione** → calcolo memoizzato per `grid`/`params`; mostra solo i rami bloccati, senza layout shift.
19. **Stima ottimistica** → F1/F6/F7 includono contratti, traduzioni e test; range 12–14.
20. **Stessa procedura in catena** → ammessa con snapshot diverso, bloccata solo se identica.

## 9. Decisioni aperte

1. Italiano “Assistente” o brand “Assistant” in tutte le lingue.
2. Lista chiusa delle azioni dati v1 (approvare prima di F3).
3. La vista a tutta pagina mostra solo il dominio analisi o anche quello dati.
4. Percorso Assistant nel progetto (schema 4) o solo `localStorage`.
5. Rerun dei vecchi run-report wizard: runner legacy o riapertura nella vista.
6. Flowchart solo nella vista a tutta pagina o anche nel pannello (default: solo vista).
7. Il passaggio dati→analisi cambia tab o solo dominio (default: cambia entrambi).
8. La catena si ferma al primo errore o continua (default: si ferma).
9. Catena persistita in localStorage o solo nella sessione (default: localStorage).
10. Le azioni dati possono entrare nella catena o restano immediate (default: immediate).
11. Formato lungo per due gruppi: routing ad ANOVA (default) o nuova modalità del t-test.
12. Chi quadrato e contingenza restano a tabella manuale (default v1) o ricevono una crosstab da colonne in una fase successiva.
13. “Non lo so” alla radice: mini-controllo della forma dei dati (default) o passaggio diretto all'Assistente dati.
14. Profondità dell'aiuto: definizione + esempio + tutte le opzioni (default) o solo definizione.
15. Stessa foglia in catena: ammessa con snapshot diverso (default) o sempre bloccata.
16. “Non lo so” nelle sotto-domande: proposta con conferma (default) o salto diretto alla foglia.
17. Azioni dati distruttive: anteprima + conferma + undo (default) o conferma semplice.

## 10. Fuori perimetro

Nuove procedure statistiche, nuova modalità t-test per il formato lungo, crosstab da colonne, deduplica righe, editor di formule, suggerimenti LLM, export Word/PowerPoint in stile Minitab, grafo completo dell'albero, bundle di procedure dentro una foglia (v2), catene di azioni dati, esecuzione parallela. L'Assistant resta deterministico e documentato.
