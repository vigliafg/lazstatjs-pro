# Analisi: salvataggio e caricamento dei preset nell’editor dei grafici

- **Richiesta**: «salvataggio e caricamento dei preset nell'editor dei geafici. studiate la funziinalità.»
- **Perimetro**: preset incorporati dell’editor, default globali dei grafici, opzioni per-card, persistenza nel progetto e in autosave, schema/normalizzazione, UI dell’editor e delle impostazioni, test.
- **Non analizzato**: temi dell’interfaccia, `outputAppearance`, preset dei parametri statistici (solo distinzione), sincronizzazione cloud, export/import di file, report template.
- **Data e revisione del codice**: 2026-10-31, commit `55b0c6f`.
- **Stato**: studio di fattibilità/design; nessuna modifica al codice.
- **Assunzione**: per «preset» si intende una configurazione di stile del grafico salvata con un nome e riapplicabile. I tre preset incorporati (`default`, `minimal`, `print`) sono il caso base; i preset nominati sono la funzionalità da studiare.

## Sintesi esecutiva

Oggi l’editor espone **solo tre preset incorporati** e non esiste una libreria di preset nominati. Il selettore è una patch parziale sulle opzioni correnti: non è idempotente e non torna indietro. Il caso confermato è `Print light` → `Default`: tema chiaro e palette mono restano attivi perché `PRESET_OPTIONS.default` è vuoto e `applyPreset` fa uno spread sulle opzioni correnti, non su una baseline.

La soluzione più semplice e coerente con il repository è:

1. **v1: preset nominati di 20 opzioni comuni di stile** (le 21 di `COMMON_KEYS` meno il marcatore `preset`), senza annotazioni e senza opzioni specifiche del tipo di grafico;
2. persistenza in **`ProjectSettings.chartPresets?`**, quindi dentro `.lzs` e autosave;
3. caricamento come **sostituzione atomica delle 20 chiavi di stile** in una sola chiamata a `applyDraft`, con un solo undo;
4. salvataggio/caricamento nella quick bar dell’editor; rinomina/eliminazione in Impostazioni → Grafici;
5. nessuna estensione del campo `preset`, che resta il marcatore dei tre preset incorporati.

Le opzioni specifiche per tipo (fit, band, display, error, ecc.) e le annotazioni restano fuori dalla v1. Un preset per-kind è una v2 separata, da fare solo se l’uso lo richiede.

## Come funziona

### 1. Preset incorporati

- `CommonChartOptions.preset` è una union chiusa `'default' | 'minimal' | 'print'` (`src/stats/charts.ts:48-50`).
- `PRESET_OPTIONS` contiene patch parziali: `default: {}`, `minimal` spegne griglia, legenda, sottotitolo e nota; `print` imposta tema chiaro, palette mono, `gridY` e opacità (`src/charts/defaults.ts:251-269`).
- `applyPreset` fa `{ ...options, preset, ...PRESET_OPTIONS[preset] }` (`src/charts/defaults.ts:280-283`). Non riparte da `COMMON_DEFAULTS`, quindi i valori non toccati dalla patch restano quelli precedenti.
- Il selettore è la feature `general.preset` (`src/charts/features.ts:116-123`); il setter chiama `applyPreset` (`src/charts/features.ts:42-48`).
- La feature è nella quick bar, non nel pannello oggetti: `QUICK_FEATURES` include `general.preset` (`src/components/charts/ChartGeneralToolbar.tsx:11-17`).

**Conseguenza confermata**: i preset incorporati sono cumulativi, non assoluti. Dopo `Print light`, scegliere `Default` non ripristina tema e palette. Lo stesso vale per `Minimal` → `Print`: le opzioni spente da `Minimal` restano spente.

### 2. Default globali dei nuovi grafici

- `ChartDefaults = CommonChartOptions` (`src/charts/defaults.ts:9`) e contiene solo le opzioni comuni.
- `ChartDefaultsEditor` modifica i default globali, non una libreria di preset nominati (`src/components/charts/ChartDefaultsEditor.tsx:24-52`).
- I default sono in `ProjectSettings.chartDefaults` (`src/io/project/types.ts:342-343`), con default in `DEFAULT_SETTINGS` (`src/io/project/types.ts:555-566`) e normalizzazione in `parseSettings` (`src/io/project/parse.ts:542`).
- Sono applicati in modo run-scoped con `withChartDefaults` (`src/charts/defaults.ts:40-49`) e arrivano ai runner anche dal worker (`src/hooks/useAnalysisRun.ts:79`, `src/analyses/worker/heavy.worker.ts:42`).
- Il testo dell’interfaccia è esplicito: «Default style for new charts. Existing cards keep their own options» (`src/i18n/catalog/en/shell.ts:55-57`).

I default globali non sono una libreria di preset: sono un unico insieme di valori per i grafici futuri.

### 3. Opzioni per-card

- `AnalysisChart.options` è il modello per-card (`src/stats/charts.ts:270-283`).
- `mergeOptions` applica factory < default globali < opzioni per-card, forza il `kind` e normalizza le annotazioni (`src/charts/defaults.ts:230-245`).
- `parseChartModel` usa `mergeOptions` e scarta il chart se supera `MAX_CHART_MODEL_CHARS` (`src/charts/schema.ts:117-147`).
- Il chart editor ha draft, history e undo (`src/components/charts/ChartEditorDialog.tsx:58-84`); il Reset torna alle opzioni iniziali della card (`:174-177`), mentre `resetSection` resetta le feature specifiche (`:180-198`).
- `updateOutputChart` sostituisce le opzioni della card senza rieseguire l’analisi (`src/hooks/useOutputConsole.tsx:155-173`).

### 4. Persistenza

- `createProjectSnapshot` sparge `settings` nel progetto (`src/io/project/index.ts:14-32`).
- `parseProject` usa `parseSettings` (`src/io/project/index.ts:75-95`); `parseSettings` costruisce un oggetto nuovo e ignora i campi sconosciuti (`src/io/project/parse.ts:524-545`).
- L’autosave usa localStorage con un budget di circa 4 MB (`src/io/project/types.ts:24`, `src/io/project/index.ts:107-133`).
- Preferenze applicative in localStorage esistono già per l’IO (`src/io/prefs.ts:36-52`), ma non c’è una libreria di preset grafici.

### 5. Preset di analisi, non di grafico

Esiste un sistema separato di preset dei **parametri statistici**: `AnalysisPreset` e `presetsFor` (`src/ui/analysis/presets.ts:1-104`), usato in `AnalysisOptions.tsx:354-372`. Non ha nulla a che vedere con lo stile del grafico e non va confuso con i preset dell’editor.

## Invarianti e assunzioni

- Le annotazioni sono per-card (`src/stats/charts.ts:70-75`) e non devono entrare in un preset.
- Il `kind` del grafico è fisso per card; le opzioni specifiche sono discriminate per tipo (`src/stats/charts.ts:77-264`).
- `setSpecific` scarta le opzioni specifiche se il `kind` non coincide (`src/charts/features.ts:51-54`).
- `commonOptionsOf` estrae solo le chiavi comuni da qualunque `ChartOptions` (`src/charts/defaults.ts:77-83`).
- `normalizeChartDefaults` valida e normalizza le stesse chiavi comuni, scartando valori sconosciuti (`src/charts/defaults.ts:85-127`).
- Il campo `preset` è un marcatore a tre valori, non un identificatore libero.
- Il progetto deve restare caricabile anche con preset manomessi o di versioni future.

## Domande poste ai critici

Le domande sono state identiche per entrambi i critici:

1. Che cosa deve contenere un preset salvato dall’editor: solo opzioni comuni, anche le opzioni specifiche del tipo di grafico, o entrambe? Le annotazioni vanno incluse o escluse? Titolo/note vanno inclusi?
2. Dove va persistito un preset: `ProjectSettings` (quindi `.lzs` e autosave), localStorage applicativo, file JSON esportabile, o più di uno? Quali conseguenze per condivisione, backup e migrazione?
3. Come deve comportarsi il caricamento rispetto alle opzioni correnti, ai default globali e al campo `preset` incorporato? Merge parziale, sostituzione, reset? Come si evita l’effetto «sticky» attuale per cui Print → Default lascia tema chiaro e palette mono?
4. Che relazione deve avere un preset con il tipo di grafico (`kind`)? Preset per-kind, universali, o entrambi? Cosa fare se un preset contiene opzioni non valide per il grafico corrente?
5. Che relazione deve avere con `chartDefaults` e con il pulsante Reset dell’editor? Salvare un preset deve modificare i default globali? Caricare un preset deve essere annullabile con un solo undo?
6. UI: dove mettere salva/carica/gestisci (barra rapida, pannello proprietà, Impostazioni → Grafici)? Servono rinomina, sovrascrittura, eliminazione, «imposta come default», import/export? Qual è il flusso minimo?
7. Schema e validazione: come normalizzare preset importati o manomessi? Limiti di numero, nome, dimensione, id, duplicati? Serve una versione dello schema o basta un campo opzionale?
8. Migrazione e compatibilità: progetti vecchi senza preset, preset con opzioni non più esistenti, cambio di enum/kind, preset creati in una versione futura. Cosa deve succedere senza perdere il progetto?
9. Test e criteri di accettazione: quali test unitari/e2e/visivi rendono verificabile il salvataggio, il caricamento, la compatibilità e l’export?
10. Qual è la v1 minima e cosa è YAGNI (libreria condivisa, sync cloud, preset di analisi, preset di annotazioni, template di report)?

## Risposte

### DeepSeek

**Q1 — Contenuto.** v1: le 20 chiavi comuni di stile (le 21 di `COMMON_KEYS` meno `preset`), tramite `commonOptionsOf` (`src/charts/defaults.ts:77-83`). Escludo `preset` dal payload (è il marcatore incorporato), le annotazioni (per-card, `src/stats/charts.ts:70-75`) e le opzioni specifiche (kind-specific, `src/stats/charts.ts:77-264`). I testi di titolo/sottotitolo/nota non sono in `ChartOptions`: sono campi di `AnalysisChart` (`src/stats/charts.ts:270-283`), quindi non possono finire nel preset; i booleani `showTitle`/`showSubtitle`/`showNote` restano, perché sono stile.

**Q2 — Persistenza.** `ProjectSettings.chartPresets?: ChartPreset[]` per la v1: viaggia con `.lzs` e autosave, riusa `parseSettings` (`src/io/project/parse.ts:524-545`) e la posizione già occupata da `chartDefaults` (`src/io/project/types.ts:342-343`). Una libreria in localStorage è una v2 per il riuso tra progetti; l’export/import JSON è una v2 per la condivisione.

**Q3 — Caricamento.** Sostituzione atomica delle 20 chiavi di stile del preset, con `kind` e annotazioni preservati, in una sola chiamata a `applyDraft` (`src/components/charts/ChartEditorDialog.tsx:77-84`). Per i preset incorporati, `applyPreset` va corretto applicando prima `COMMON_DEFAULTS`: `{ ...options, ...COMMON_DEFAULTS, ...PRESET_OPTIONS[preset], preset }` (`src/charts/defaults.ts:251-283`). Questo rende `Default` una vera baseline e elimina lo sticky, senza toccare le opzioni specifiche.

**Q4 — Tipo di grafico.** v1: preset **universali di sole opzioni comuni**, quindi applicabili a ogni kind. Le opzioni specifiche restano quelle della card. Un preset per-kind è una v2: richiede `kind`, una UI filtrata e una validazione per tipo (`setSpecific`, `src/charts/features.ts:51-54`; `mergeOptions`, `src/charts/defaults.ts:230-245`).

**Q5 — Default globali e Reset.** Salvare o caricare un preset non deve modificare `chartDefaults` (`ChartDefaultsEditor.tsx:19-23`, `src/i18n/catalog/en/shell.ts:55-57`). Il Reset resta «opzioni iniziali della card» (`ChartEditorDialog.tsx:174-177`). Il caricamento è un’unica modifica undoabile; «imposta come default per i nuovi grafici» è un’azione separata, opzionale, che usa `commonOptionsOf` e il setter esistente.

**Q6 — UI.** Flusso minimo: nella quick bar, accanto al preset incorporato, un select «Preset» con gruppi «Incorporati» e «I miei preset», più un’azione «Salva preset corrente…»; un piccolo dialog per nome e conferma sovrascrittura. La gestione (rinomina/elimina) va in Impostazioni → Grafici, riusando la sezione esistente (`src/ui/SettingsTab.tsx:281-285`) e `ChartDefaultsEditor` (`src/components/charts/ChartDefaultsEditor.tsx:24-52`). `ChartControls` oggi conosce solo checkbox/select/number/range (`src/charts/features.ts:11`): il controllo preset custom richiede un piccolo componente dedicato nella toolbar, non una nuova feature type.

**Q7 — Schema e validazione.** `ChartPreset { id, name, options }`, con `options` = 20 chiavi comuni (senza `preset`). Normalizzatore dedicato che riusa `normalizeChartDefaults` (`src/charts/defaults.ts:85-127`) e poi rimuove `preset`; nome 1–48 caratteri, id 1–48, massimo 20 preset, massimo 20 KB totali, id unici e nomi case-insensitive unici. Un campo opzionale in `ProjectSettings` è sufficiente; non serve una `schemaVersion` per ogni preset nella v1. Se in futuro il formato cambia in modo incompatibile, si aggiunge una versione nelle impostazioni del progetto.

**Q8 — Migrazione.** Progetti vecchi: campo assente → `[]`, nessun errore. Preset malformato: si scarta il singolo preset, non il progetto. Chiavi sconosciute o valori fuori enum: `normalizeChartDefaults` li riporta ai default. Preset di versione futura: le chiavi note si caricano, quelle ignote si scartano; il progetto resta apribile. `parseProject` accetta già v1/v2/v3 (`src/io/project/index.ts:67-73`); un campo opzionale non richiede un bump.

**Q9 — Test.** Unit: normalizzazione, 20 chiavi, duplicati, limiti, esclusione di annotazioni/opzioni specifiche, transizioni `print` → `default` e `minimal` → `print`, round-trip progetto e legacy. Component/E2E: salva, cambia opzioni, carica, un solo undo, sovrascrittura, rinomina, elimina, reload, secondo grafico, mobile. Visual: menu/dialog preset e grafico dopo il caricamento. Criteri: un undo, annotazioni intatte, opzioni specifiche intatte, `chartDefaults` intatti, progetto ricaricabile.

**Q10 — V1 e YAGNI.** V1: preset nominati di stile comune, salva/carica/rinomina/elimina, persistenza nel progetto, un undo. YAGNI: preset per-kind, preset di annotazioni, import/export JSON, libreria globale/localStorage, sync cloud, categorie/tag, riordino manuale, applicazione automatica alle card esistenti, template di report, preset di analisi.

### Luna

Luna accetta la direzione ma chiede una baseline esplicita per i preset e una separazione netta tra preset nominati e campo `preset`.

- **Q1**: v1 con opzioni comuni; specifiche solo con elenco esplicito; escludere annotazioni e testi reali di titolo/nota.
- **Q2**: una sola fonte in v1, `ProjectSettings` per portabilità e autosave; localStorage come alternativa per il riuso tra progetti. La priorità va decisa.
- **Q3**: sostituzione atomica dei campi posseduti dal preset, non merge superficiale sui valori correnti; baseline da definire. Il caso `print` → `default` è un bug confermato.
- **Q4**: preset comuni universali; se includono opzioni specifiche, vanno vincolati al `kind` o applicati solo nella parte comune con un messaggio.
- **Q5**: salvare/caricare non deve toccare `chartDefaults`; un solo undo; Reset distinto.
- **Q6**: salva/carica nell’editor; gestione completa in Impostazioni se la libreria è condivisa; flusso minimo salva/carica/sovrascrivi/elimina.
- **Q7**: record separati con id/nome/ambito/opzioni, validazione difensiva, limiti e regola sui duplicati.
- **Q8**: campo opzionale, fallback a libreria vuota, scarto del singolo preset malformato.
- **Q9**: test su normalizzazione, duplicati, limiti, kind incompatibile, transizioni `print` → `default`, round-trip `.lzs` e legacy, un solo undo.
- **Q10**: v1 di preset comuni nominati; rinviare cloud, template di report, preset di analisi e annotazioni.

Rilievi principali: sticky dei preset incorporati (MAJOR), annotazioni copiabili (MAJOR), validazione semantica delle opzioni specifiche importate (MAJOR), ambiguità del campo `preset` (MAJOR), limite autosave (MAJOR), test mancanti (`applyPreset`) e undo unico (MINOR).

Verdetto: `APPROVE_WITH_CHANGES`.

### GLM

GLM spinge per la soluzione più corta: riusare `commonOptionsOf` come definizione del preset, `normalizeChartDefaults` come validatore e `applyDraft` come unico punto di applicazione. GLM ragiona sulle 21 chiavi di `COMMON_KEYS`; la riconciliazione esclude `preset`, quindi il payload effettivo scende a 20.

- **Q1**: solo le 21 chiavi comuni (20 nel payload riconciliato); `commonOptionsOf` esiste già; annotazioni escluse.
- **Q2**: nuovo campo in `ProjectSettings`, non localStorage; `chartDefaults` solo per «imposta come default».
- **Q3**: merge parziale con un solo undo; il bug sticky è reale; la correzione naturale è uno snapshot completo delle 21 chiavi, non una patch.
- **Q4**: preset universali, non per-kind; `mergeOptions` e i guard run-time proteggono già.
- **Q5**: due livelli separati; applicare un preset sostituisce le 21 chiavi comuni; un solo `applyDraft`; «salva come default» è un’azione separata.
- **Q6**: «Salva come preset…» nella quick bar; gestione in Impostazioni → Grafici riusando `ChartDefaultsEditor`; niente nuova dialog; import/export in v2.
- **Q7**: riusare `normalizeChartDefaults`; nome max 32, max 20 preset, id max 32, dedupe; `schemaVersion` opzionale o project version.
- **Q8**: `chartPresets?` con default `[]`; normalizzare e scartare i singoli preset malformati; il campo `preset` resta decorativo.
- **Q9**: test su salva/ricarica, tutte le 21 chiavi, un undo, preset malformato, legacy, preset custom fuori da `PRESET_OPTIONS`.
- **Q10**: v1 = lista `ChartPreset { id, name, options: CommonChartOptions }` + salva/carica/elimina/rinomina + eventuale «imposta come default». YAGNI: per-kind, annotazioni, import/export, cloud, categorie, ordinamento, estensione di `applyPreset`.

Rilievi principali: sticky come BLOCKER, estensione di `applyPreset` ai preset custom come BLOCKER (romperebbe la union), chiavi comuni enumerate tre volte (MAJOR), test `applyPreset` assenti (MAJOR), campo `preset` nel payload custom e documentazione default/preset (MINOR).

Verdetto: `APPROVE_WITH_CHANGES`.

## Rilievi

| # | Rilievo | Chi | Severità | Stato | Evidenza | Correzione | Test |
|---|---|---|---|---|---|---|---|
| 1 | `Print light` → `Default` lascia tema chiaro e palette mono: i preset incorporati sono patch cumulative, non snapshot | Luna, GLM | BLOCKER | `CONFERMATO` | `src/charts/defaults.ts:251-269,280-283` | Applicare `COMMON_DEFAULTS` prima della patch: `{ ...options, ...COMMON_DEFAULTS, ...PRESET_OPTIONS[preset], preset }` | Test `applyPreset` su tutte le transizioni |
| 2 | Estendere `applyPreset` ai preset custom romperebbe la union `CommonChartOptions['preset']` | GLM | BLOCKER | `CONFERMATO` (design) | `src/stats/charts.ts:48-50`; `src/charts/defaults.ts:105,251-283`; `src/charts/features.ts:42-48` | I preset custom restano fuori da `preset`: sono un’azione sul draft | Test di tipo/compilazione e test UI: il selettore incorporato non cambia |
| 3 | Salvare l’intero `ChartOptions` copierebbe le annotazioni per-card | Luna | MAJOR | `CONFERMATO` (se si salva tutto) | `src/stats/charts.ts:70-75`; `src/charts/defaults.ts:77-83` | Usare `commonOptionsOf` e rimuovere `preset`; niente `annotations` | Test: il preset non contiene `annotations` né chiavi specifiche |
| 4 | Le opzioni specifiche importate non hanno una validazione semantica completa | Luna | MAJOR | `SOSPETTO` (solo v2 per-kind) | `src/charts/schema.ts:117-147`; `src/charts/defaults.ts:230-245`; `src/charts/features.ts:51-54` | v1 common-only; se si aggiungono preset per-kind, validare con `mergeOptions(kind, options)` e filtrare per tipo | Esperimento: importare un preset con `fit`/`band` su un bar e verificare che non raggiungano il renderer |
| 5 | Il campo `preset` è ambiguo rispetto a un preset nominato | Luna, GLM | MAJOR | `CONFERMATO` (design) | `src/stats/charts.ts:48-50`; `src/charts/features.ts:115-123` | Tenere separati preset incorporati e preset nominati; mostrare il nome custom nell’editor, non nel campo `preset` | Test UI: caricare un custom non cambia il select incorporato |
| 6 | Una libreria senza limiti può far fallire l’autosave | Luna | MAJOR | `SOSPETTO` (se non limitata) | `src/io/project/types.ts:24`; `src/io/project/index.ts:119-133` | Cap: 20 preset, 20 KB totali, nome 48 caratteri; mostrare l’errore di salvataggio | Test: 21° preset rifiutato; round-trip al limite |
| 7 | Le 21 chiavi comuni sono enumerate tre volte (`COMMON_KEYS`, `commonKeys`, `normalizeChartDefaults`) | GLM | MAJOR | `CONFERMATO` (debito) | `src/charts/defaults.ts:53-75`; `src/components/charts/ChartEditorDialog.tsx:425-448`; `src/charts/defaults.ts:105-125` | Derivare le liste da `COMMON_KEYS`; non aggiungere una quarta enumerazione | Test: ogni chiave comune è coperta da normalizzazione e preset |
| 8 | Nessun test copre `applyPreset`/`PRESET_OPTIONS` | Luna, GLM | MAJOR | `CONFERMATO` (gap di test) | `src/charts/defaults.test.ts`; `src/charts/features.test.ts` | Aggiungere test comportamentali prima di estendere i preset | Test `print` → `default`, `minimal` → `print`, valori iniziali |
| 9 | Caricare un preset campo per campo creerebbe una voce di history per campo | Luna | MINOR | `CONFERMATO` (design) | `src/components/charts/ChartEditorDialog.tsx:77-84` | Applicare il preset con una sola chiamata a `applyDraft` | Test: un solo Undo ripristina tutte le chiavi |
| 10 | Un preset custom che include `preset: 'minimal'` confonde l’utente | GLM | MINOR | `CONFERMATO` (design) | `src/charts/defaults.ts:53-75`; `src/stats/charts.ts:48-50` | Escludere `preset` dal payload del preset custom; non mapparlo sul selettore incorporato | Test: il payload non contiene `preset` |
| 11 | Il testo «Default style for new charts» non distingue default globale e preset nominato | GLM | MINOR | `CONFERMATO` | `src/i18n/catalog/en/shell.ts:55-57` | Aggiornare il testo e aggiungere un’etichetta «Preset salvati» nella sezione | Revisione i18n + test di rendering |
| 12 | Persistenza: progetto vs localStorage | Luna, GLM | — | Concordi su `ProjectSettings` per la v1 | `src/io/project/types.ts:328-348`; `src/io/prefs.ts:36-52` | `chartPresets?: ChartPreset[]` nel progetto; localStorage solo v2 | Test legacy e round-trip |
| 13 | UI: dove salvare/caricare | Luna, GLM | — | Decisione: quick bar + Impostazioni | `src/components/charts/ChartGeneralToolbar.tsx:11-17`; `src/ui/SettingsTab.tsx:281-285` | Salva/carica nella quick bar; gestione in Impostazioni | E2E desktop/mobile |
| 14 | Scope: universale vs per-kind | Luna, GLM | — | Decisione: v1 universale common-only; v2 per-kind | `src/charts/features.ts:51-54`; `src/charts/defaults.ts:230-245` | Non includere opzioni specifiche nella v1 | Test: preset applicabile a due kind diversi |

## Bug

### Confermati

**B1 — I preset incorporati non sono reversibili.**

Scenario: aprire l’editor di un grafico, selezionare `Print light`, poi `Default`. Atteso: tema scuro, palette default, griglia/legenda ai valori factory. Reale: tema chiaro, palette mono, `gridOpacity` 0.25 restano attivi; `showLegend`/`showSubtitle`/`showNote` restano spenti se prima era stato scelto `Minimal`.

Evidenza: `applyPreset` fa `{ ...options, preset, ...PRESET_OPTIONS[preset] }` (`src/charts/defaults.ts:280-283`); `PRESET_OPTIONS.default` è `{}` (`:255`); `Minimal` e `Print` contengono solo alcune chiavi (`:256-268`). Riproduzione eseguita con `factoryOptions('bar')`: dopo `print` → `default` il risultato ha `theme: 'light'`, `palette: 'mono'`, `gridOpacity: 0.25`; dopo `minimal` → `print` restano `showLegend: false`, `showSubtitle: false`, `showNote: false`.

Correzione: applicare una baseline completa prima della patch. La soluzione minima è `{ ...options, ...COMMON_DEFAULTS, ...PRESET_OPTIONS[preset], preset }`. In alternativa, rendere `PRESET_OPTIONS` completo per tutte le 21 chiavi; la baseline esplicita è più corta e non duplica i valori.

### Sospetti (con esperimento)

- **S1 — Preset per-kind con opzioni specifiche**: non è un bug della v1 common-only, ma se in v2 si salvano opzioni specifiche, un preset importato con `fit`/`band`/`display` non validi per il kind potrebbe essere ignorato o produrre uno stato incoerente. Esperimento: creare un preset da uno scatter, importarlo su un bar e verificare che `mergeOptions`/`setSpecific` non lo applichino; decidere se nasconderlo o mostrare un avviso.
- **S2 — Libreria senza limiti**: se non si introducono cap, 200 preset da 20 KB possono superare il budget di autosave e far fallire il salvataggio. Esperimento: serializzare 200 preset e misurare `saveAutosaveText`; la mitigazione prevista è il cap a 20 preset/20 KB.
- **S3 — Condivisione di un `.lzs` con preset**: un progetto condiviso porta con sé i preset nominati; chi lo apre vede stili pensati per un altro utente. Non è un bug tecnico, ma una scelta di prodotto da validare. Esperimento: aprire lo stesso `.lzs` in due profili e decidere se i preset sono progetto o libreria globale.

### Non riproducibili

Nessuno. Il resto del flusso (per-card, default globali, parse, autosave) è coerente con il modello attuale.

## Punti critici e debito

- **Semantica dei preset incorporati**: patch cumulative vs snapshot. È il debito principale e va corretto prima di aggiungere preset custom, altrimenti l’utente non distingue il bug dei preset incorporati da un comportamento dei preset nominati.
- **Tre enumerazioni delle chiavi comuni**: `COMMON_KEYS`, `commonKeys` nell’editor e le `set(...)` di `normalizeChartDefaults`. Un preset nominato non deve aggiungere la quarta. Va introdotto un unico elenco esportato e testato.
- **Ambiguità `preset` vs preset nominato**: il campo `preset` è una union chiusa e non può rappresentare un preset custom. Non va esteso; va aggiunto uno stato UI separato per il nome del preset custom.
- **Mancanza di test su `applyPreset`**: è un’area già usata dall’interfaccia ma non coperta. Qualsiasi modifica ai preset deve partire da qui.
- **Peso della libreria**: 20 preset × 20 chiavi sono pochi KB, ma il cap va messo per evitare crescita incontrollata e per allinearsi al budget di autosave.
- **Confusione con i preset di analisi**: `src/ui/analysis/presets.ts` è un sistema separato; la UI e la documentazione devono chiamarli in modo diverso (es. «Preset di analisi» vs «Preset del grafico»).

## Piano di correzione (v1)

1. **Correggere la semantica dei preset incorporati** — file: `src/charts/defaults.ts`, `src/charts/defaults.test.ts`.
   - Applicare `COMMON_DEFAULTS` prima di `PRESET_OPTIONS[preset]`.
   - Test: `default` → `print` → `default`, `minimal` → `print`, tutte le 21 chiavi.
   - Rischio: basso; è un cambio di comportamento voluto.
   - Criterio di accettazione: dopo `Default` tema/palette/griglia/legenda tornano ai valori factory; le opzioni specifiche restano invariate.

2. **Definire modello e normalizzatore dei preset nominati** — file: `src/charts/presets.ts`, `src/charts/presets.test.ts`.
   - `ChartPreset { id, name, options }`, `options` = 20 chiavi comuni senza `preset`.
   - `normalizeChartPresets(value)` con cap 20, nome/id 48, dedupe, 20 KB totali; riusa `normalizeChartDefaults`.
   - Test: annotazioni e chiavi specifiche escluse, duplicati, valori invalidi, limiti.
   - Rischio: basso.
   - Criterio: un preset valido round-trippa; uno malformato viene scartato senza errori.

3. **Persistere i preset nel progetto** — file: `src/io/project/types.ts`, `src/io/project/parse.ts`, `src/App.tsx`, `src/ui/SettingsTab.tsx`.
   - `chartPresets?: ChartPreset[]` in `ProjectSettings`, `[]` in `DEFAULT_SETTINGS`, normalizzazione in `parseSettings`, stato/memo/restore in `App.tsx`.
   - Test: progetto legacy senza campo, round-trip, preset malformato.
   - Rischio: medio (plumbing delle impostazioni).
   - Criterio: un progetto con preset si ricarica e li ritrova; un progetto vecchio resta identico.

4. **UI di salvataggio/caricamento nell’editor** — file: `src/components/charts/ChartGeneralToolbar.tsx`, `src/components/charts/ChartEditorDialog.tsx`, nuovo `ChartPresetDialog.tsx`, i18n.
   - Select con gruppi «Incorporati»/«I miei preset», azione «Salva preset corrente…», nome e conferma sovrascrittura.
   - Applicazione con una sola `applyDraft`; nessuna modifica a `chartDefaults`.
   - Test component/e2e: salva, carica, un undo, undo dopo modifiche, mobile.
   - Rischio: medio (quick bar già densa).
   - Criterio: il grafico torna allo stato salvato con un undo; le annotazioni restano.

5. **Gestione in Impostazioni → Grafici** — file: `src/components/charts/ChartDefaultsEditor.tsx` (o nuovo `ChartPresetList.tsx`), `src/ui/SettingsTab.tsx`, i18n.
   - Lista, rinomina, elimina, eventualmente «imposta come default» (separato).
   - Test: rinomina/elimina, duplicati, persistenza.
   - Rischio: basso.
   - Criterio: le operazioni si riflettono nel progetto e non toccano le card esistenti.

6. **E2E e visual** — file: `e2e/chart-presets.spec.ts`, baseline.
   - Salva un preset da un box, cambia tema/griglia/legenda, carica, verifica; reload; applica a un secondo grafico; mobile.
   - Visual: menu preset e grafico dopo il caricamento.
   - Rischio: basso.
   - Criterio: workflow verde, baseline stabile, nessuna regressione sui grafici senza preset.

**Totale: 6 passi, M.**

## Aree non verificate / esperimenti

- **Priorità progetto vs libreria globale**: il codice non decide se un preset debba seguire il `.lzs` o l’utente tra browser. Esperimento: intervista/uso reale con due progetti e due profili; la v1 raccomanda il progetto, la v2 può aggiungere la libreria globale.
- **Preset per-kind**: non implementati in v1. Esperimento: salvare uno scatter con `fit`/`band`/`pointShape` e verificare quanto spesso serva riapplicarlo a un altro scatter; se l’uso è alto, aggiungere `kind` e validazione per tipo.
- **Import/export JSON**: non in v1. Esperimento: definire un formato versionato e testare preset manomessi; rimandare a una v2.
- **Aspettativa utente su «salvataggio»**: il termine può significare «salva nel progetto» o «salva su file». La v1 copre il progetto; l’export file è una v2 esplicita.
- **Visual baseline**: non ancora creata; va aggiunta insieme all’implementazione.

## Verdetti dei critici (verbatim, ridotti)

- **Luna**: `APPROVE_WITH_CHANGES` — «funzionalità fattibile, ma prima va definita la persistenza e corretta la semantica sticky dei preset incorporati». Blocker: nessuno; major: sticky, annotazioni copiabili, validazione specifiche, ambiguità `preset`, limite autosave; minor: test mancanti e undo unico.
- **GLM**: `APPROVE_WITH_CHANGES` — «schema fattibile con costo molto basso riusando `commonOptionsOf`/`normalizeChartDefaults`/`applyDraft`; però (a) il preset incorporato `default` è già buggy (sticky) e va corretto, (b) i preset custom non vanno dentro `applyPreset`, (c) mancano i test su `applyPreset`». Blocker: sticky e estensione di `applyPreset`; major: chiavi comuni duplicate e test assenti; minor: campo `preset` nel payload e documentazione.

## Conclusione

La funzionalità è fattibile e ha un costo contenuto se resta **common-only** e riusa le funzioni già presenti. La cosa da non fare è estendere il campo `preset`: i preset nominati sono una libreria separata, applicata al draft con una singola transazione. Prima di aggiungerli va corretto il comportamento sticky dei tre preset incorporati, altrimenti la nuova funzione nasce sopra un’ambiguità già visibile all’utente.

La v1 raccomandata è: **preset nominati di stile comune, salvati nel progetto, caricati con un undo, gestiti tra quick bar e Impostazioni → Grafici**. Le opzioni specifiche per tipo, le annotazioni, l’import/export e la libreria globale sono v2.

## Stato di implementazione (2026-10-31)

Implementato:

- `applyPreset` ora applica `COMMON_DEFAULTS` prima della patch: `Print light` → `Default` ripristina tema, palette, griglia e legenda, preservando opzioni specifiche, `kind` e annotazioni (`src/charts/defaults.ts`).
- Modello e normalizzatore `ChartPreset`/`ChartPresetOptions`, limiti (20 preset, 48 caratteri per nome/id, 20 KB), deduplica, applicazione atomica e matching dello stile (`src/charts/presets.ts`, `src/charts/presets.test.ts`).
- Persistenza in `ProjectSettings.chartPresets?`, normalizzazione in `parseSettings`, default `[]`, stato App, ripristino dal progetto e clone nello snapshot (`src/io/project/types.ts`, `src/io/project/parse.ts`, `src/io/project/index.ts`, `src/App.tsx`).
- UI: selettore preset combinato nella quick bar con gruppi «Incorporati»/«I miei preset» e form «Salva preset»; gestione rinomina/elimina in Impostazioni → Grafici (`src/components/charts/ChartPresetPicker.tsx`, `ChartPresetList.tsx`, `ChartPresetsProvider.tsx`).
- Test: unitari su modello, normalizzazione, transizioni dei preset incorporati, round-trip `.lzs` e legacy; E2E desktop/mobile su salvataggio, caricamento, undo, sovrascrittura, rinomina, eliminazione e persistenza; baseline visive `chart-preset-editor.png`, `chart-preset-settings.png`, `chart-preset-mobile.png`.

Verifica eseguita: `npm test` (704 test), `npm run lint`, `npm run guard`, `npm run build`, `npx playwright test` (113 pass, 107 skip) e baseline visive verdi con `VISUAL=1`.
