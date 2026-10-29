# Architettura — LazStats Pro

Obiettivo: un'analisi si aggiunge o si modifica toccando pochi file, senza
duplicare calcolo, form, report e persistenza. Le regole sono verificate da
`npm run guard` (dentro `npm run check`).

## Strati

```
src/
  grid/         modello dati: celle, colonne, livelli, operazioni, history;
                `Dataset` è la vista readonly usata dalle analisi
  stats/        motore numerico e prosa dei report (nessun React):
                kernels/ numeri puri, tables/ TableSpec, reports/ ReportSpec
  charts/       modello grafico puro + adapter Vega-Lite (nessun React)
  analyses/     una cartella per analisi: Form.tsx + run.tsx (+ defaults.ts)
                e helper condivisi in analyses/shared/
  components/   componenti riusabili (tabelle, report, card grafico) senza schermate
  io/           import/export, progetto .lzs, formattazione dei file
  hooks/        stato e orchestrazione (console, sessione, import/export)
  ui/           shell e schede: compone analyses, hooks e components
  help/         contenuto statico della guida
```

Le frecce puntano solo verso il basso: `ui -> analyses/hooks -> io/stats/grid`.
Le regole attuali (`.dependency-cruiser.cjs`) vietano:

- cicli tra moduli;
- `stats/` verso `ui/`, `analyses/`, `hooks/`, `io/`, `components/`;
- `stats/kernels/` verso `stats/tables/` e `stats/reports/`;
- `stats/tables/` verso `stats/reports/`;
- `stats/reports/` verso `stats/kernels/` (la prosa legge solo le tabelle);
- `ui/` verso `stats/kernels/` e `stats/tables/`;
- `hooks/` e `io/` verso `stats/kernels/` e `stats/tables/` (passano dai barrel);
- `grid/` verso `ui/`, `analyses/`, `hooks/`, `io/`;
- `components/` verso `ui/`, `analyses/`, `hooks/`;
- `io/` verso `ui/`, `analyses/`, `hooks/`;
- `analyses/` verso `ui/`;
- `charts/` verso `ui/`, `analyses/`, `hooks/`, `components/`, `io/`.

Le eccezioni di dimensione sono in `scripts/check-file-size.mjs`: un file sopra
700 righe va spezzato o aggiunto con una motivazione. Le eccezioni non possono
crescere in silenzio.

## Contratto di un'analisi

Tutte le analisi passano dallo stesso punto:

```ts
// src/analyses/<id>/run.tsx
buildOutput({ grid, params, ciLevel }): AnalysisRunResult
// grid è un Dataset in sola lettura
// ok: { ok: true, title, tables, report, charts, header?, warnings?, callout? }
// no: { ok: false, reason }
```

`src/analyses/runners.ts` mappa `id -> buildOutput`; `useAnalysisRun` chiama il
runner attivo e `App.emit` appende alla console (o mostra il motivo del rifiuto).
Nessun pannello espone `forwardRef` o chiama la console direttamente.

## Grafici

`AnalysisChart` vive in `src/stats/charts.ts`: dati già aggregati, etichette,
statistiche derivate e `ChartOptions` (unione discriminata per `kind`). Il
runner non importa React e non costruisce SVG. `src/charts/vega/buildSpec.ts`
compila il modello in Vega-Lite; `src/components/charts/VegaChart.tsx` monta
`vega-embed` con renderer SVG e `data-chart-state` per gli export asincroni.
L'editor (`ChartEditorDialog`) lavora su una copia delle opzioni e committa solo
con Done; la persistenza salva i modelli, non un'immagine. Dettagli, feature e
limiti in [`docs/CHART-ENGINE.md`](docs/CHART-ENGINE.md).

## Aggiungere un'analisi

Checklist minima:

1. **Form** — `src/analyses/<id>/Form.tsx`, controllato:
   riceve `params` e il setter, non tiene stato proprio.
2. **Builder** — `src/analyses/<id>/run.tsx`: numeri, tabelle, grafici e
   `report`, senza console/toast; restituisce `AnalysisRunResult`. I grafici
   sono `AnalysisChart` (modello serializzabile), mai JSX o Victory.
3. **Parametri** — tipo in `ProjectParams` (`src/io/project.ts`), default in
   `DEFAULT_PARAMS`, parsing difensivo in `parseParams` (indici clampati,
   enum validati, campi mancanti = default).
4. **Default grid-aware** — se il vecchio pannello sceglieva colonne in base ai
   dati, metti la scelta in `src/analyses/<id>/defaults.ts` e usala nell'App.
5. **Runner** — aggiungi la voce in `ANALYSIS_RUNNERS` e il test del registro.
6. **Wiring** — stato nell'App, contratto in `src/ui/analysis/types.ts`, render del
   Form in `AnalysisOptions`; famiglia, descrizione, keyword e costo vivono in
   `registry.ts`.
7. **Test** — builder valido + validazioni; parsing `.lzs` con valori fuori
   range; se il calcolo è nuovo, golden test.

Una voce in più è un errore: la lista delle analisi vive solo in
`src/analyses/registry.ts` e nel registro dei runner.

## UI

`src/ui/AnalysisTab.tsx` è il workbench a tre zone: `AnalysisLibrary` (ricerca,
famiglie, recenti), `AnalysisOptions` (CI, form, Run sticky) e `OutputConsole`
(documento a schede, outline, collapse). Sotto `lg` il segmented control mostra
un pannello alla volta; *Focus output* nasconde libreria e setup. Le schede
mantengono il contratto `AnalysisTabProps` per non duplicare i 31 slice di
parametri dentro ogni componente.

Stato, valutazione e backlog: [`docs/UI-STATE.md`](docs/UI-STATE.md).

### Identità delle colonne

Ogni colonna ha un `id` stabile. `src/grid/columnOps.ts` descrive gli effetti
di insert/delete/move/split/merge sugli indici; `src/analyses/params.ts`
rimappa i parametri e invalida i ruoli che perdono la variabile. Gli handler
strutturali vivono in `src/hooks/useColumnOperations.ts`. New/Import overwrite
resettano i parametri e cambiano `datasetId`; ogni modifica della griglia
incrementa `dataRevision`, usata dalle card per il badge `stale`.


## Persistenza `.lzs`

`ProjectSnapshot` contiene griglia, preferenze, impostazioni, parametri e
snapshot HTML della console. I campi aggiunti dopo la versione 1 sono opzionali
nel parser: un file vecchio continua a caricarsi con i default. Non cambiare
`PROJECT_VERSION` per aggiungere un campo; fallo solo per modifiche
incompatibili.

## Test

- `npm test` usa il glob ricorsivo `src/**/*.test.ts`.
- Golden di contratto per le 19 analisi storiche (`UPDATE_GOLDEN=1` per rigenerarli);
  le procedure aggiunte dopo (TOST) hanno test di kernel dedicati.
- Ogni builder ha un test dedicato (caso valido + rifiuti).
- `npm run check` = typecheck + test + guardrail.

## Lingue

`src/i18n/` è l'unico punto delle stringhe di interfaccia:

- `catalog/en/` è la **fonte delle chiavi** (`MessageKey = keyof typeof enMessages`),
  divisa per area (shell, form, data, analysis, output, meta);
- `catalog/it/` è tipato `Record<keyof typeof enMessages, string>`: una chiave
  mancante è un errore di compilazione, una chiave in più pure;
- `catalogFor(locale)` fa fallback su inglese per le lingue non ancora tradotte;
- `t(chiave, parametri)` resta una funzione pura usabile fuori da React;
  `useT()`/`useLocale()` (via `useSyncExternalStore`) fanno ridisegnare l'albero
  al cambio lingua. `ACTIVE_LOCALES` elenca le lingue selezionabili (oggi
  en, it, fr, es, de, pt-PT), `REPORT_LOCALES` quelle con prosa dei report
  tradotta e `PLANNED_LOCALES` le lingue future (vuoto).

`io/project` importa solo `src/i18n/locales.ts` (nessun catalogo), così il
parsing di `.lzs` non trascina il dizionario. `uiLocale`, `reportLocale` e
`helpLocale` sono campi opzionali di `ProjectSettings`: i progetti vecchi si
aprono con i default e `PROJECT_VERSION` non cambia.

### Prosa dei report e etichette delle tabelle

`src/stats/reportCopy/` traduce l'output scritto senza duplicare i builder:

- i builder e le tabelle scrivono la frase italiana come **msgid**
  (`copy('Le medie di {s1} sono diverse: {s2}.', { s1, s2 })`), stile gettext;
- `copy()` risolve il msgid nel catalogo della lingua attiva e, se manca, torna
  all'italiano: una traduzione parziale non produce mai `undefined`;
- `withReportLocale(locale, () => runner(...))` imposta la lingua per la durata
  di una singola esecuzione (`useAnalysisRun`), quindi report e tabelle della
  stessa card sono sempre nella stessa lingua;
- `TRANSLATED_REPORT_LOCALES` elenca le lingue con catalogo completo e
  `REPORT_LOCALES` solo quelle selezionabili in Impostazioni;
- `sourceOf()` riporta un'etichetta tradotta al msgid italiano: i report che
  leggono le righe delle tabelle (`rowLike`, `rowBy`, confronti sui nomi delle
  metriche) continuano a trovare i numeri in ogni lingua;
- `scripts/check-locale.mjs <locale>` valida un'ondata (chiavi UI, pagine del
  manuale, prosa dei report, segnaposto) prima di dichiararla attiva;
- `scripts/normalize-report-copy.mjs <locale>` normalizza un'ondata: rimuove le
  chiavi duplicate che TypeScript rifiuta, ordina e riporta quante stringhe
  restano identiche alla sorgente (sigle, simboli, nomi di metodi);
  `docs/glossary/glossary.md` fissa la terminologia nelle sei lingue.

La lingua dei report si sceglie in Impostazioni ed è persistita nel progetto:
le card già prodotte restano nella lingua in cui sono state generate, `Re-run
all` le rigenera con la lingua corrente.

## Manuale (help)

- contenuto strutturato in `src/help/content/<locale>/` (`areas.ts`,
  `procedures-core.ts`, `procedures-more.ts`, `book.ts`), ordinato da
  `TOPIC_ORDER` in `content/order.ts`;
- `scripts/build-help.mjs` genera `public/help/<locale>/` (HTML, CSS, JS,
  indice, ricerca, `print.html`) ed è agganciato a `predev`/`prebuild`;
  la cartella generata è in `.gitignore`;
- `src/help/book.ts` costruisce gli URL, `HelpPanel` ospita il libro nella scheda
  HELP, `HelpButton` + `HelpDialog` aprono la pagina di una procedura in popup;
- `src/help/content.test.ts` impone la parità tra lingue, la copertura di ogni
  procedura del registry con entrambi i livelli e l'esistenza dei dataset;
- `docs/glossary/glossary.md` è la fonte terminologica per tradurre una nuova
  pagina o un nuovo report.

## Debito noto

- Lo schema `.lzs` è diviso in `io/project/types.ts`, `parse.ts` e `index.ts`.
- Resta una sola eccezione di dimensione motivata: `kernels/arima.ts`
  (kernel numerico compatto).
- La prosa dei report (`src/stats/reports/`) è ancora italiana: il cambio lingua
  dei report richiede i cataloghi `en` (e poi fr/es/de/pt-PT) per ogni procedura.
  Fino ad allora `REPORT_LOCALES` espone solo `it` e Impostazioni lo dichiara.
- Nessun modulo legacy calcola più dentro il table builder: tutti e sei sono
  stati estratti in `stats/kernels/`.
