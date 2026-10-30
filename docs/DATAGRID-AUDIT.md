# Audit Data Grid — import/export, operazioni e tipi

Data: 2026-10-29. Perimetro: toolbar Data, `ImportWizard`, `ExportDialog`,
operazioni pure in `src/grid/ops/`, `DataGrid`, `OperationsBar` con
`OperationPopover`, `VariableInspector`, `LevelsEditor`. Aggiornamento
2026-10-30: i pannelli inline Transform/Clean sono sostituiti da una barra
dedicata con un trigger e un pannello per comando (`Cancel`/`Run`).

## Copertura

### Unit test

- `src/grid/audit.test.ts` — nuova suite di audit (19 test):
  validazione tipi, missing, duplicate, split/merge, righe/colonne, formule,
  grouping, recode.
- Suite esistenti: `ops.test.ts`, `levels.test.ts`, `missing.test.ts`,
  `columnOps.test.ts`, `formulas.test.ts`, `virtual.test.ts`.
- `npm test`: **555 test, tutti verdi**.
- `npm run test:e2e`: **80 passati, 66 skip** (desktop + mobile).

### End-to-end

Nuova suite `e2e/datagrid.spec.ts` (14 test desktop):

| Test | Cosa verifica |
|---|---|
| CSV preview | rilevamento `;`/decimal comma, conteggio righe, override tipo, merge columns |
| append rows | import per nome senza toccare le righe esistenti |
| invalid JSON | errore nel preview e Import disabilitato |
| export CSV/JSON/XLSX | download reale, contenuto, celle numeriche |
| split | nuova colonna, valori sinistra/destra |
| merge | colonna fusa testuale, colonna destra rimossa |
| recode | mapping e conteggio celle |
| insert/delete column | menu contestuale, conferma delete |
| insert/delete row | menu contestuale, shift delle righe |
| type validation | cella invalida, Validate, cambio tipo |
| missing code | codice dichiarato dall'inspector |
| export filtrato | checkbox “solo righe del filtro analisi” e CSV ridotto |
| split all | split in N parti |
| group picker | `cat` offerta, `id` esclusa |

Fixture: `e2e/fixtures/preview-semicolon.csv`, `grid-rows.tsv`,
`invalid.json`. Gli attributi `data-import`, `data-transform`, `data-export`
rendono stabili i selettori senza dipendere dal testo.

## Import/export dal Data Grid

### Import

- Il pulsante **Import** apre il file picker (`DataTab`).
- CSV “semplici” passano dal fast path; file ambigui (separatore, JSON, tab,
  header incerto) aprono il wizard.
- Il wizard mostra:
  - nome file, tipo (CSV/JSON/Excel/SPSS/Stata), sheet per Excel;
  - delimitatore rilevato, header, decimali;
  - prime 10 righe, tipi inferiti e override per colonna;
  - errori di parsing e conteggi (`empty skipped`, header duplicati, BOM).
- Le modalità sono **overwrite**, **append rows**, **merge columns**.
  - overwrite resetta parametri/dataset/output e chiede conferma se ci sono
    risultati;
  - append rows allinea per posizione se la larghezza coincide, altrimenti per
    nome;
  - merge columns aggiunge le colonne mancanti e riempie per nome.

### Export

- **Export** apre `ExportDialog` (ora con `role="dialog"`).
- Formati: CSV, TSV, pipe, JSON, SPSS CSV + `.sps`, XLSX.
- Opzioni: delimitatore, separatore decimale, header, drop empty rows.
- L’export usa sempre l’intera griglia: il filtro di visualizzazione/analisi non
  viene applicato.
- JSON non applica il separatore decimale locale; XLSX converte in numerico i
  tipi `int/num/dec`, inclusa la virgola decimale.

## Operazioni

### Split

- Divide al **primo** separatore: `a;b;c` → `a` + `b;c`.
- Conserva id/metadata della colonna sinistra, crea id nuovo per la destra.
- **Rimuove la formula** dalla colonna originale: altrimenti il ricalcolo
  sovrascriverebbe la parte sinistra al commit successivo.
- Separatore vuoto o indice fuori range: no-op.

### Merge

- Unisce due colonne in `lo`, elimina `hi`, conserva l’id di `lo`.
- Produce una colonna `str`, perché il valore è una concatenazione.
- Azzera formula, livelli, reference, missing e label: erano metadati della
  vecchia variabile, non del testo fuso.
- Ignora i separatori per celle vuote (`A` + vuoto → `A`, non `A_`).
- Indici invertiti funzionano; `a === b` e fuori range sono no-op.

### Join

Non esiste un’operazione di **join tra dataset/tabelle**. L’unica operazione
di combinazione è **merge columns** (concatenazione orizzontale) e
**append rows/merge columns** in import. Un join SQL-like richiederebbe un
modello multi-tabella, oggi fuori perimetro.

### Recode

- `Recode` nella barra operazioni usa `recodeColumnValues`, non il vecchio
  `recodeColumn`: aggiorna livelli, reference, tipo (`cat` se i nuovi codici
  non rispettano il tipo) e riporta celle ricodificate/fuse/svuotate.
- Il livello con etichetta duplicata non fonde gruppi: `setColumnLevels`
  deduplica le label.
- Le formule di una colonna ricodificata vengono ricalcolate al commit; se la
  formula è la fonte del valore, la ricodifica non è persistente. È un limite
  noto delle colonne calcolate.

## Errori di input e preview

- `validateValue` marca le celle non valide; `Validate` apre il pannello con
  conteggi e salto alla prima cella.
- I tipi `num`/`dec` ora rifiutano i valori composti solo da punteggiatura
  (`.`, `,`, `-`) e accettano `.5`/`,5`.
- `ImportWizard` mostra l’errore di parsing e disabilita Import; il file non
  viene applicato.
- Il fast path non mostra il preview: è una scelta di prodotto per i CSV
  semplici. Se il rilevamento non è confidente, si passa dal wizard.
- L’import non blocca valori invalidi per il tipo scelto: li importa e la
  validazione li evidenzia. `Auto-fix` li corregge quando possibile.

## Tipi e metadati

- `COL_TYPES` copre num, int, dec, cat, str, id, bol, dat, dtm, tim, alp, chr.
- `cat`/`bol` sono sempre variabili di gruppo; `id` mai; `int/num` con 2–12
  codici interi sono gruppi; text/date con 2–12 livelli sono gruppi.
- I livelli dichiarati rendono una colonna di gruppo anche con un solo codice.
- `duplicateColumn` copia label, description, livelli, reference, missing e
  formula (id nuovo).
- `insertColumnAt`/`addColumnEnd` creano id e nomi unici.
- `deleteColumn` non elimina l’ultima colonna e non ripulisce le formule che
  citano la colonna eliminata: il ricalcolo mantiene gli ultimi valori.

## Righe e colonne

- Insert row/column clampa la posizione.
- Delete row/column protegge l’ultima riga/colonna.
- I menu contestuali offrono insert above/below, insert left/right, duplicate,
  move e delete; delete chiede conferma.
- Copy/paste/fill usano gli indici originali anche con filtro e virtualizzazione.

## Correzioni applicate

1. `num`/`dec` accettavano `.`, `,`, `-` come validi.
2. `fillMissing` ignorava i codici missing dichiarati.
3. `duplicateColumn` perdeva label, livelli, reference, missing e formula.
4. Split conservava la formula e il ricalcolo sovrascriveva la parte sinistra.
5. Merge conservava tipo/formula/metadati della colonna `lo` e produceva
   numeri/categorie invalide da testo concatenato.
6. Merge inseriva un separatore anche tra celle vuote.
7. Il comando Recode usava `recodeColumn` e non aggiornava
   livelli/reference/tipo.
8. `ExportDialog` non aveva un ruolo dialog per test/accessibilità.
9. Recode rimuove la formula persistente della colonna, altrimenti il
   ricalcolo successivo annullerebbe la ricodifica.
10. Delete/merge rimuovono le formule delle altre colonne che citano le
    colonne eliminate/ fuse, conservando gli ultimi valori ma evitando
    ricalcoli silenziosi su riferimenti rotti.
11. Aggiunto **Split all** (`splitColumnAll`) per separare ogni occorrenza in
    colonne distinte.
12. L’export può limitarsi alle righe del filtro analisi, con checkbox
    esplicita.
13. Il wizard di import mostra il mapping per append/merge: colonne abbinate,
    nuove, oppure allineamento per posizione.
14. `removeEmptyRows` considera vuote anche le righe fatte solo di missing
    code dichiarati.

## Limiti noti

- Join tra dataset assente (solo merge columns/append rows).
- Il comando **Split** resta “prima occorrenza”; per separare tutte le parti
  c’è **Split all**.
- La validazione non blocca il typing: segnala e corregge con Auto-fix.
- Il cambio tipo non converte i valori: la validazione li evidenzia.
- L’import veloce non mostra il preview per i CSV semplici.
- Le colonne formula non vengono ricostruite su split/merge/delete: la
  formula viene rimossa; i valori restano quelli correnti.

## Comandi

```bash
node --import tsx --test src/grid/audit.test.ts
npm test
npx playwright test e2e/datagrid.spec.ts --project=desktop
npm run check
npm run test:e2e
```
