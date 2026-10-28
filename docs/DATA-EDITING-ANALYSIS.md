# Data grid e analisi — stato, relazione e direzione

> Analisi svolta al commit `fb48e17` (`main`).
> Questo documento risponde a due domande:
> 1. come si relaziona oggi la griglia dati alla sezione analisi, visivamente e
>    operativamente;
> 2. quale modello di inserimento/editing conviene adottare, confrontando i
>    programmi statistici più popolari con il nostro.

## 1. Sintesi esecutiva

La griglia è un buon editor di dati. Il problema non è la griglia: è il
**ponte** tra griglia e analisi.

Oggi la relazione è di tipo **snapshot, non linked**:

- l'analisi legge la griglia al momento del Run;
- i parametri sono **indici di colonna**;
- il filtro è **solo visivo**;
- le modifiche ai dati non invalidano l'output;
- la selezione della griglia non arriva all'analisi.

Visivamente i due mondi sono separati da un cambio di tab. Operativamente sono
separati da uno snapshot. Questo è sicuro finché i dati non cambiano, ma diventa
fragile appena l'utente inserisce, elimina o sposta colonne: **i parametri
possono puntare a un'altra variabile senza alcun avviso**.

La raccomandazione è evolvere l'attuale griglia unica con un **ponte esplicito**
dati↔analisi, non costruire subito un modello multi-tabella.

## 2. Inventario della scheda Data

### 2.1 Cosa c'è

| Area | Funzioni |
|---|---|
| **Griglia** | Celle editabili, colonne tipizzate, nomi modificabili, selezione a intervallo, copia/incolla TSV, fill down, clear range |
| **Tipi** | `num`, `int`, `dec`, `cat`, `str`, `id`, `bol`, `dat`, `dtm`, `tim`, `alp`, `chr` |
| **Metadati** | Nome, tipo, livelli categoria (`code` + `label`), reference level |
| **Livelli** | Editor con lettura dai dati, aggiunta/rimozione, ordine, label, reference, ricode con merge/clear |
| **Clean** | Find/replace (regex, case, colonna), trim, drop empty rows, drop duplicates, fill missing (mean/median/mode/value) |
| **Transform** | Sort, recode old=new, split, merge, compute one-shot |
| **Validazione** | Regex per tipo, Validate, Auto-fix, conteggio invalid, jump to first |
| **Vista** | Freeze prima colonna, filtro righe view-only, sort, conteggi |
| **Storia** | Undo/redo con coalescing delle editazioni di cella |
| **IO** | Import CSV/TSV/JSON/Excel, Smart Import, export CSV/TSV/pipe/JSON/SPSS/XLSX |
| **Progetto** | `.lzs`, autosave, griglia + preferenze + parametri + output |

### 2.2 Cosa manca o è debole

- Nessuna **vista variabili** dedicata: i metadati stanno nell'header e nel
  modale dei livelli.
- Nessuna **label/descrizione** di variabile oltre al nome.
- Nessun **codice di missing** esplicito: la cella vuota è l'unico missing.
- Nessuna **formula persistente**: `Compute` è un'operazione one-shot.
- Nessun **fill handle** o editing multi-cella in stile Excel.
- Nessuna **virtualizzazione**: la griglia renderizza tutte le righe visibili
  del filtro.
- Nessun **remap dei parametri** quando si inserisce/elimina/sposta una colonna.
- Nessun **collegamento visivo** tra una colonna e le analisi che la usano.
- Il filtro è view-only e non persistito.
- La selezione è locale a `DataGrid` e non è leggibile dall'esterno.

## 3. Come si relaziona la griglia alla sezione analisi

### 3.1 Visivamente

Oggi la relazione è **sequenziale e mutuamente esclusiva**:

```
┌ DATA (schermo intero) ─────────────────────────────┐
│ toolbar · griglia · selezione · stato              │
└────────────────────────────────────────────────────┘
             ⇅ cambio tab (perde il contesto visivo)
┌ ANALYSIS ──────────────────────────────────────────┐
│ Library │ Setup │ Output                            │
│         │ 20 × 4 │ card · tabelle · report          │
└────────────────────────────────────────────────────┘
```

- Non si vedono mai insieme griglia e output.
- Nel Setup l'unico segnale dei dati è il footer `20 × 4` e i nomi nei select.
- Non ci sono anteprima righe, N per variabile, missing, filtro attivo o nome
  del dataset.
- Le card di output mostrano i nomi delle colonne nel titolo, ma non il ruolo
  (`Y`, `Group`, `Time`, `Event`) né la versione dei dati.
- Il pulsante `Data` nell'output porta alla griglia; dalla griglia non c'è un
  percorso inverso verso l'analisi che usa una colonna.
- Su mobile il cambio è ancora più netto: `Data` è un tab principale, `Analysis`
  ha tre pannelli propri.

Questo non è di per sé sbagliato: nessun programma statistico popolare mostra
griglia e risultati completi nella stessa schermata come modalità primaria.
SPSS, Stata, Minitab e SAS usano finestre/tab separati; JASP e jamovi usano tab
diversi; Prism usa fogli collegati. La differenza è che quegli strumenti hanno
un **ponte** forte: dizionario variabili, selezione, casi, aggiornamento o
snapshot dichiarato.

### 3.2 Operativamente

| Aspetto | Comportamento attuale | Conseguenza |
|---|---|---|
| **Sorgente** | `GridData` unica in `App` | Semplicità, ma un solo dataset per progetto |
| **Passaggio all'analisi** | `useAnalysisRun` passa `grid`, `params`, `ciLevel` al builder | L'analisi è uno snapshot del Run |
| **Riferimento alle colonne** | Indici numerici in `ProjectParams` | Insert/delete/move possono cambiare il significato |
| **Filtro** | `RowFilter` usato solo da `DataGrid` | Le analisi usano **tutte** le righe; l'etichetta lo dice, ma è controintuitivo |
| **Selezione** | `sel` locale a `DataGrid` | Nessun "usa la selezione come ruolo/filtro" |
| **Modifica celle** | Aggiorna `GridData` e la history | L'output resta com'era; nessun badge stale |
| **Livelli/recode** | Aggiornano la colonna | Gli output già prodotti non cambiano |
| **Tipo colonna** | Cambia validazione e group eligibility | I parametri possono diventare invalidi senza avviso |
| **Undo/redo** | Solo griglia | Non ripristina output o parametri |
| **Persistenza** | Griglia + parametri + output | Al reload gli indici vengono clampati, non rimappati |
| **Setup jump** | Dalla card alla procedura | Non porta alla colonna né ai dati che l'hanno prodotta |

### 3.3 Il difetto più grave: indici posizionali

Esempio:

1. ANOVA con `Dependent = Score_Post` (indice 1) e `Group = Group` (indice 2).
2. L'utente elimina `Score_Pre` (indice 0).
3. Gli indici scorrono: `Score_Post` diventa 0, `Group` diventa 1, `Age`
   diventa 2.
4. I parametri restano `dep = 1`, `grp = 2`: ora puntano a `Group` e `Age`.

L'analisi parte, produce numeri plausibili e nessuno segnala che le variabili
sono cambiate. Lo stesso accade con **Insert column left** e **Move column**.
Questo è un problema di integrità dei dati, non di estetica: va corretto prima
di qualsiasi altra evoluzione della griglia.

### 3.4 Il secondo difetto: filtro view-only

Il filtro mostra `20 / 20 rows` e la scritta:

> view only — analyses still use all rows

È onesto, ma è un'eccezione rispetto al modello mentale di SPSS (`Select Cases`),
JASP e jamovi, dove un filtro è spesso la selezione che l'analisi usa. Un utente
che filtra `Group = 1` e lancia ANOVA si aspetta il gruppo 1, non tutti i dati.

### 3.5 Il terzo difetto: nessuna provenienza

La card dice cosa è stato calcolato, non **su quali dati**. Mancano:

- versione/hash della griglia;
- filtro attivo al momento del Run;
- N usato dall'analisi;
- ruoli delle colonne;
- parametri storici.

Senza questi dati, "Setup" riapre la procedura ma non può ripristinare la
configurazione che ha prodotto quella card.

## 4. Cosa fanno i programmi popolari

| Programma | Superficie dati | Metadati | Relazione con l'analisi | Aggiornamento output | Lezione |
|---|---|---|---|---|---|
| **SPSS** | Data View + Variable View | Tipo, label, value labels, missing, measure | Dialoghi che scelgono variabili dal dizionario; `Select Cases` | Output separato, snapshot | Il dizionario variabili è un cittadino di prima classe |
| **JASP** | Spreadsheet unico | Tipo e label inline | Analisi nel pannello destro; selezione da dropdown | Le analisi tendono a ricalcolarsi | Basso attrito, ma dati e risultati restano separati |
| **jamovi** | Spreadsheet + computed variables | Tipo, label, formula | Tab Data / Analyses; opzioni a sinistra, risultati a destra | Analisi aggiornate, computed variables | La variabile calcolata è di prima classe |
| **Stata** | Data Editor + Variables Manager | Tipo, label, value labels, missing | Comandi e dialoghi; variabili nel dizionario | Results separati | Metadati e riproducibilità |
| **SAS** | Tabelle e librerie | Tipi, label, formati | Task e code generation | Results/log separati | Separazione dati/metadati |
| **Minitab** | Worksheet | Tipo, label, formato | Dialoghi; colonne come unità | Session/Output separati | Modello column-centric |
| **Prism** | Più tabelle per forma (XY, column, grouped, contingency, survival) | Tipi impliciti nella tabella | Analisi collegata a una tabella | Aggiornamento collegato | La forma del dato è parte del contratto |
| **Excel** | Griglia libera | Nessun metadato statistico | Nessuna | Nessuno | Paste/fill/formule sono irrinunciabili |

### Pattern ricorrenti

1. **Nessuno mostra griglia e risultati completi affiancati come modalità
   primaria.** La separazione visiva è normale; il ponte è altrove.
2. **I tool data-heavy investono in un dizionario variabili** (SPSS, Stata);
   quelli leggeri lo tengono inline (JASP, jamovi). Noi siamo nel mezzo: inline,
   ma troppo povero.
3. **Gli output sono snapshot o linked.** SPSS/Minitab: snapshot, ma l'utente lo
   sa. JASP/jamovi/Prism: linked o ricalcolati. Noi siamo snapshot senza
   segnale di staleness: il peggio dei due mondi.
4. **Il filtro è parte della semantica dell'analisi** nei tool che lo offrono
   come selezione casi. Il nostro è esplicitamente view-only.
5. **La forma del dato conta.** Prism la rende esplicita; noi abbiamo una sola
   griglia wide e lasciamo all'utente il reshape per start-stop, wide/long, ecc.

## 5. Diagnosi

### 5.1 Cosa funziona

- La griglia è già ricca: tipi, livelli, ricode, clean, transform, validazione,
  undo, paste, filtro, freeze, import/export.
- La separazione dati/analisi tiene la UI leggibile e il workbench pulito.
- La griglia è la fonte di verità: un solo `GridData` rende ragionamento e
  persistenza semplici.
- I livelli sono condivisi tra griglia e analisi, quindi label e reference non
  vengono duplicati.
- L'output snapshot è robusto e compatibile.

### 5.2 Cosa manca

- Identità stabile delle colonne e remap dei parametri.
- Un dizionario variabili consultabile durante l'analisi.
- Un contesto dati visibile nel Setup.
- Una semantica esplicita del filtro.
- Un segnale di staleness e una provenienza dell'output.
- Un ponte selezione → ruolo.
- Una formula persistente per le colonne calcolate.
- Missing code e report delle esclusioni.
- Test di integrazione griglia↔analisi.

## 6. Opzioni di architettura

### A. Evolvere la griglia unica + ponte esplicito (raccomandata)

Una sola griglia, ma con:

- `Column.id` stabile e remap dei parametri su insert/delete/move;
- **Variable Inspector** a drawer (tipo, label, descrizione, livelli,
  reference, missing code, ruolo);
- **Data context bar** in Analysis (righe, colonne, filtro, missing, dataset);
- **Data peek** richiudibile nel Setup;
- **selezione → ruolo** dalla griglia o dal data peek;
- **stale/provenienza** nelle card;
- filtro con scelta esplicita `view only` / `filter analyses`;
- computed columns persistenti in una fase successiva.

**Pro:** preserva i 31 runner, il formato `.lzs`, i form e il workbench; è
incrementale; risolve i difetti reali.
**Contro:** non risolve la forma del dato (multi-tabella); il Variable Inspector
resta un secondo livello, non una vista primaria.
**Rischio:** medio, soprattutto per il remap dei parametri.

### B. Modello SPSS-like: Data View + Variable View

Una tabella dati e una tabella metadati separata; i dialoghi di analisi leggono
il dizionario.

**Pro:** scala su molti dataset e molte variabili; dizionario esplicito;
familiare a chi usa SPSS.
**Contro:** seconda superficie da mantenere; più clicks; non risolve da sola
stale/filtro/indici; può essere sovradimensionato per dataset da 4–30 colonne.
**Rischio:** medio.

Il Variable Inspector di A può dare l'80% del beneficio senza una seconda
modalità a schermo intero. B ha senso solo se il target è un pubblico SPSS-like
con molti metadati.

### C. Modello Prism-like: più tabelle collegate

Tabelle diverse per forma del dato; ogni analisi è collegata a una tabella.

**Pro:** modella correttamente XY, column, grouped, contingency, survival;
aggiornamento collegato; progetto più espressivo.
**Contro:** cambia il modello dati (`GridData` → più tabelle), il formato
`.lzs`, l'import, i 31 runner e la provenienza degli output. È un progetto a sé.
**Rischio:** alto.

Da considerare solo se il requisito "più tabelle per progetto" è esplicito. Oggi
non lo è: tutte le analisi leggono un solo `GridData`.

## 7. Raccomandazione

**A, con il Variable Inspector come drawer e il ponte dati↔analisi esplicito.**
Tenere una sola griglia per ora. Rimandare C a una decisione architetturale
successiva, se mai servirà.

La priorità non è aggiungere altre funzioni alla griglia: è rendere **sicuro e
visibile** il passaggio dati→analisi.

### 7.1 Modello target

```
┌ DATA ──────────────────────────────────────────────┐
│ toolbar · griglia · Variable Inspector (drawer)     │
│ selezione → "Usa come Y / X / Group"                │
└─────────────────────────────────────────────────────┘
             ⇅ contesto preservato, non solo tab
┌ ANALYSIS ───────────────────────────────────────────┐
│ Library │ Setup + Data context │ Output             │
│         │ 20 righe · 4 colonne │ card + provenienza │
│         │ filtro: view only    │ stale / re-run     │
│         │ [Data peek]          │                    │
└─────────────────────────────────────────────────────┘
```

### 7.2 Regole

- **Identità**: una colonna ha un id stabile; i parametri non si rompono su
  insert/delete/move.
- **Contesto**: il Setup mostra sempre righe, colonne, filtro e missing.
- **Selezione**: una colonna selezionata può diventare un ruolo con un'azione
  esplicita.
- **Filtro**: view-only o analysis-filter, scelto e mostrato.
- **Staleness**: ogni modifica di dati/parametri marca le card come stale.
- **Provenienza**: ogni card conserva analisi, parametri, N, filtro e versione
  dati.
- **Metadati**: il Variable Inspector è la fonte per label, livelli, reference,
  missing e ruolo.
- **Forma**: una sola griglia; il reshape resta un'operazione esplicita.

## 8. Blocchi di implementazione

| ID | Blocco | Contenuto | Dipendenze | Rischio |
|---|---|---|---|---|
| **DE-0** | Integrità colonne | `Column.id` stabile; remap dei parametri su insert/delete/move; test | — | Medio |
| **DE-1** | Variable Inspector | Drawer con tipo, label, descrizione, livelli, reference, missing, ruolo | DE-0 | Basso/medio |
| **DE-2** | Ponte dati↔analisi | Context bar, Data peek, selezione→ruolo, jump ruolo→colonna | DE-0, DE-1 | Medio |
| **DE-3** | Filtro e missing | Scelta view-only/analysis-filter, conteggio esclusi, missing code, N per analisi | DE-2 | Medio |
| **DE-4** | Editing UX | Paste Excel, fill handle, editing multi-cella, undo grouping, keyboard | — | Medio |
| **DE-5** | Computed columns | Formula persistente, dipendenze, refresh, rinomina | DE-0 | Medio/alto |
| **DE-6** | Grandi dati e mobile | Virtualizzazione, paste a blocchi, touch editing | DE-4 | Medio |
| **DE-7** | Test | Unit su remap/filtro/missing; smoke UI; regressioni | DE-0..DE-6 | Basso |

### Ordine consigliato

1. **DE-0** — senza questo, ogni insert/delete può falsare un'analisi.
2. **DE-1** — il dizionario variabili sblocca il resto.
3. **DE-2** — il ponte visivo/operativo.
4. **DE-3** — semantica filtro e missing.
5. **DE-4 / DE-5** — produttività editing.
6. **DE-6 / DE-7** — scala e protezione.

## 9. Criteri di accettazione

- Inserire, eliminare o spostare una colonna **non cambia** il significato di
  alcun parametro di analisi.
- Il Setup mostra righe, colonne, filtro attivo e missing senza cambiare tab.
- Una colonna selezionata può essere assegnata a un ruolo in **≤ 2 azioni**.
- Dopo una modifica ai dati, le card che dipendono da quei dati sono **stale**
  entro un render.
- Il filtro dichiara se influisce sull'analisi; l'N dell'output è coerente.
- Il Variable Inspector mostra tutti i metadati usati dai runner.
- I progetti `.lzs` vecchi continuano a caricarsi; i nuovi campi sono opzionali.
- Test unitari su remap, filtro, missing; smoke UI su desktop e mobile.

## 10. Decisioni aperte

1. **Una griglia o più tabelle?** Raccomandazione: una griglia ora, multi-tabella
   solo se diventa un requisito di prodotto.
2. **Variable View**: drawer (raccomandato) o tab separata in stile SPSS?
3. **Filtro**: default view-only (compatibile) o default analysis-filter?
   Raccomandazione: scelta esplicita, default view-only, badge ben visibile.
4. **Colonne calcolate**: one-shot (oggi) o formula persistente? Raccomandazione:
   formula persistente in DE-5.
5. **Missing**: cella vuota o codici per colonna? Raccomandazione: codici
   opzionali, con report delle esclusioni.
6. **Mobile**: editing completo o quick edit? Raccomandazione: editing completo
   semplificato, non solo read-only.
7. **Lingua**: la scheda Data è in inglese; l'help e i report sono misti. Va
   deciso prima di aggiungere nuovo testo.

## 11. Prossimo passo

Se la direzione A è confermata, il primo blocco è **DE-0**:

- aggiungere un identificatore stabile alla colonna;
- rimappare tutti i parametri che contengono indici (inclusi `-1`, liste e
  riferimenti) su insert/delete/move;
- coprire il remap con test;
- mantenere la compatibilità `.lzs`.

Solo dopo: Variable Inspector e ponte dati↔analisi.
