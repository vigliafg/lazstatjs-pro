# Multilingua (UI, report, manuale) e libro di help in due livelli

- **Richiesta**: "1) rendere la UI multilingua en, it, fr, es, de, pt; 2) rendere i report multilingua; 3) inserire un menu di configurazione per scegliere la lingua UI e report; 4) creare un sistema di help multilingua basato su schede HTML+CSS+JavaScript a due livelli (a. tutorial del programma e delle procedure statistiche con esempi semplici tratti da esempi reali, pronto a diventare un libro di statistica; b. descrizione avanzata in termini semplici); 5) collegare l'help alla UI con un menu apposito ma anche attivabile dalla scheda di analisi con finestra popup."
- **Obiettivo**: portare l'applicazione a interfaccia, report e manuale multilingua con una sola sorgente di verità per ogni stringa, un selettore di lingua persistente e un manuale navigabile/stampabile che spieghi ogni procedura in due livelli.
- **Criteri di successo**:
  - ogni stringa di interfaccia proviene da `src/i18n/` e ogni lingua attiva copre il 100% delle chiavi;
  - cambio lingua a runtime senza reload, persistente su `.lzs` e su `localStorage`;
  - ogni procedura del registry ha una scheda del manuale con **entrambi** i livelli in ogni lingua attiva, con un dataset di esempio reale;
  - `npm run check`, `npm run build` e Playwright verdi.
- **Non-obiettivi**:
  - tradurre la prosa statistica dei report in questa prima consegna (vedi *Debito residuo*);
  - cambiare il motore statistico, i kernel o il formato `.lzs` in modo incompatibile;
  - sostituire i grafici Victory o il tema.

## Decisioni di prodotto (approvate)

| Domanda | Decisione |
|---|---|
| "pr" | portoghese europeo, locale `pt-PT` |
| Lingua canonica dei contenuti | inglese (le chiavi nascono in `catalog/en/`) |
| Ordine di consegna | EN+IT completi e verificati, poi ondate FR/ES/DE/PT-PT |
| Manuale | contenuto strutturato → generazione di HTML+CSS+JS statici |
| Numeri statistici | punto decimale invariato (convenzione scientifica, test e golden stabili) |
| Lingua dei report | selettore limitato alle lingue con prosa tradotta (`REPORT_LOCALES`), nessuna lingua "a metà" |
| Card già prodotte | restano nella lingua in cui sono state generate (modello snapshot), `Re-run all` per rigenerarle |

## Vincoli dal repository

- `src/stats/` non importa `ui/`, `analyses/`, `hooks/`, `io/`, `components/`; `components/` non importa `ui/`, `analyses/`, `hooks/`; `io/` e `hooks/` non importano kernel/tabelle; `analyses/` non importa `ui/` (`.dependency-cruiser.cjs`).
- File sotto 700 righe (`scripts/check-file-size.mjs`); eccezioni ammesse solo con motivazione.
- `PROJECT_VERSION` non cambia per campi opzionali: i progetti vecchi devono continuare ad aprirsi.
- `npm run check` = typecheck + unit + depcruise + madge + file-size; `npm run test:e2e`; `npm run build`.
- Il manuale generato sta in `public/help/`: Vite lo copia nel build, quindi la generazione è agganciata a `predev`/`prebuild`/`pretest`.

## Architettura realizzata

### i18n (`src/i18n/`)

```
src/i18n/
  index.ts        t(key, params), translate(locale, key, params), useT(), useLocale(), MESSAGE_KEYS
  locales.ts      Locale, ACTIVE_LOCALES, PLANNED_LOCALES, REPORT_LOCALES, isLocale, etichette
  types.ts        MessageKey = keyof typeof enMessages, MessageParams
  store.ts        locale corrente + persistenza localStorage + document.lang + subscribe
  format.ts       interpolazione {nome}, placeholdersOf, formatDate (Intl)
  catalog/
    index.ts      catalogFor(locale) con fallback su inglese
    en/           fonte delle chiavi: shell, form, data, analysis, output, meta
    it/           Record<keyof typeof enMessages, string>: chiave mancante = errore TS
```

- `t()` resta una funzione pura (926 call-site storici invariati: l'import `../i18n` risolve `i18n/index.ts`).
- Il cambio lingua ridisegna l'albero tramite `useLocale()` in `App`; `io/project` importa solo `locales.ts`, senza trascinare il dizionario nel parsing.
- `ProjectSettings` ha `uiLocale`, `reportLocale`, `helpLocale` (`auto` = segui la UI), opzionali nel parser.
- Metadata del registry (`meta.family.*`, `meta.analysis.*`) risolti a runtime: etichette, descrizioni, ricerca della libreria e ordinamento A–Z seguono la lingua (la ricerca continua a trovare anche i termini inglesi).

### Manuale (`src/help/`, `scripts/build-help.mjs`)

```
src/help/content/
  types.ts        HelpTopic { tutorial, advanced }, HelpBook, HelpBookUi
  order.ts        TOPIC_ORDER condiviso: le lingue restano allineate
  data/           score-groups.csv (dataset degli esempi, condiviso)
  it/ en/         areas.ts, procedures-core.ts, procedures-more.ts, book.ts
src/help/
  book.ts         bookUrl(locale, topic, livello), topicForAnalysis()
  HelpPanel.tsx   scheda HELP = iframe del libro (indice, ricerca, stampa)
  HelpButton.tsx  pulsante "?" nel pannello di analisi e nelle card di output
  HelpDialog.tsx  popup con deep-link #tutorial / #advanced, chiusura con Esc
src/ui/analysis/AnalysisHeader.tsx
                  blocco titolo del setup (famiglia, badge, nome, scorciatoia manuale)
  helpStore.ts    store del popup (useSyncExternalStore)
  content.test.ts parità tra lingue, copertura del registry, dataset, link
```

- `scripts/build-help.mjs` produce `public/help/<locale>/`: `index.html`, una pagina per scheda, `print.html` (libro intero con salti capitolo), `assets/help.{css,js}`, `search.json`, `data/`. La cartella generata è in `.gitignore`.
- JavaScript del libro: tab A/B con memoria della scelta, hash `#advanced`, ricerca istantanea nell'indice, prev/next, breadcrumb.
- Niente dipendenze: il generatore è Node puro con `tsx` per importare il contenuto tipizzato.

## Piano a fasi e stato

| # | Fase | Deliverable | Gate | Stato |
|---|---|---|---|---|
| 0 | Censimento e glossario | inventario stringhe, decisioni di prodotto | — | ✅ `docs/glossary/glossary.md` |
| 1 | Core i18n reattivo | store, `t` con parametri, cataloghi per area, fallback | parità chiavi/placeholder, orfani | ✅ |
| 2 | UI multilingua | 847 chiavi × 6 lingue, registry, assi dei grafici, export shell | `npm run check` | ✅ |
| 3 | Report locale-aware | prosa e tabelle per procedura, 2003 msgid × 6 lingue | copertura, segnaposto, niente italiano residuo | ✅ |
| 4 | Menu lingue | sezione Impostazioni + selettore header, persistenza | e2e cambio/persistenza | ✅ |
| 5 | Infrastruttura manuale | schema, generatore, ricerca, stampa | build del libro | ✅ |
| 6 | Contenuti manuale | 40 schede × 2 livelli × 6 lingue | copertura registry | ✅ |
| 7 | Integrazione manuale | scheda HELP, popup, deep-link | e2e tab + popup | ✅ |
| 8 | Ondate di traduzione | FR, ES, DE, PT-PT (UI, report, manuale) | parità + revisione | ✅ testi completi; resta la revisione madrelingua |

## Architettura delle traduzioni

### Interfaccia (`src/i18n/`)

`catalog/en/` è la fonte delle chiavi; ogni lingua è un
`Record<keyof typeof enMessages, string>` diviso per area (`shell`, `form`,
`data`, `analysis`, `output`, `meta`) e unito da `catalog/index.ts`.
`catalogFor(locale)` fa fallback sull'inglese per una lingua non ancora
registrata.

### Manuale (`src/help/content/<locale>/`)

Stessi `id` e stesso ordine (`TOPIC_ORDER`) per tutte le lingue; il generatore
`scripts/build-help.mjs` produce `public/help/<locale>/`. `BOOKS` elenca le
edizioni disponibili e `HelpPanel`/`HelpDialog` usano la lingua della guida
(`helpLocale`, con `auto` = segui l'interfaccia).

### Report e tabelle (`src/stats/reportCopy/`)

- i builder scrivono la frase italiana come **msgid** e la avvolgono in
  `copy('… {s1} …', { s1 })`; il catalogo della lingua attiva sostituisce il
  testo, con fallback italiano;
- `withReportLocale()` isola la lingua per una singola esecuzione
  (`useAnalysisRun`), `sourceOf()` riporta un'etichetta tradotta al msgid e
  mantiene validi i lookup dei report (`rowLike`, `rowBy`, nomi delle metriche);
- `scripts/normalize-report-copy.mjs <locale>` normalizza un'ondata (rimuove le
  chiavi duplicate, ordina, segnala quante stringhe restano identiche alla
  sorgente);
- `scripts/check-locale.mjs <locale>` è il gate di un'ondata: chiavi UI,
  pagine del manuale, msgid dei report, segnaposto.

## Stato di avanzamento (verificato)

Branch `wip/sessione-2` (worktree isolato). Commit della prima consegna:

| Commit | Contenuto |
|---|---|
| `b8b2937` | core i18n reattivo, cataloghi EN/IT completi, menu lingua e persistenza |
| `d653946` | etichette del registry e dei grafici localizzate, ricerca bilingue |
| `394ad5a` | rientro nel limite di 700 righe dopo l'i18n delle etichette |
| `190b981` | libro HTML/CSS/JS bilingue a due livelli, scheda + popup, dataset di esempio |
| `2c031dd` | gating della lingua dei report, shell localizzata, documentazione, e2e |
| `e94bc67` | piano e stato di avanzamento nel worktree, estrazione `AnalysisHeader` |
| `096f423` | `reportCopy`, catalogo EN completo, report e tabelle localizzati, `REPORT_LOCALES = it, en` |
| `a50b7e6` | ondata tedesca attiva |
| vedi `git log` | ondate FR, ES, PT-PT, e2e per lingua, documentazione finale |

Verifiche eseguite sullo stato attuale:

- `npm run check`: **481 test**, 0 falliti; depcruise 585 moduli senza
  violazioni; nessun ciclo; file-size ok con **una sola eccezione**
  (`src/stats/kernels/arima.ts`).
- `npm run build`: ok, `dist/help/{it,en,fr,es,de,pt-PT}/*.html` presenti.
- `npx playwright test --project=desktop`: **41 passati, 1 skipped**
  (skip preesistente); `e2e/locale.spec.ts` copre cambio e persistenza della
  lingua, libro nella scheda HELP per ogni ondata, popup con deep-link, card di
  report nella lingua scelta e ondata tedesca end-to-end.

Numeri del contenuto:

- 847 chiavi di interfaccia × 6 lingue (en, it, fr, es, de, pt-PT);
- manuale: 40 schede per lingua (9 d'area + 31 di procedura), ognuna con
  tutorial + avanzato, dataset `score-groups.csv`; 6 edizioni generate;
- report: 2003 msgid unici (prosa + etichette di colonna, `metric`, `measure`,
  `check`) tradotti in 5 lingue oltre alla sorgente italiana;
- 31 procedure + 10 famiglie con metadati localizzati; badge, toast, export e
  interfaccia del libro seguono la lingua scelta.

## Debito residuo

1. **Revisione madrelingua delle ondate.** I testi FR/ES/DE/PT-PT sono completi
   e coerenti col glossario, ma vanno riletti da una persona madrelingua prima
   di considerarli definitivi, soprattutto per la prosa dei report.
2. **Msgid ambigui condivisi.** Alcune etichette valgono in due contesti (es.
   `A` intestazione della life table e livello di un contrasto): per rispettare
   "stessa traduzione per lo stesso msgid" restano identiche. Se serve
   distinguerle, vanno separati i msgid nei rispettivi builder.
3. **Lookup dei report.** Chi aggiunge un lookup su una riga di tabella deve
   usare `rowBy`/`rowLike` o confrontare con `sourceOf(...)`; un confronto
   diretto con una stringa italiana si rompe nelle altre lingue.
4. **Card storiche.** Restano nella lingua in cui sono state prodotte (modello
   snapshot): `Re-run all` le rigenera con la lingua corrente.
5. **Estensioni del manuale**: dataset dedicati alle procedure che oggi riusano
   `score-groups.csv`; link "apri questo esempio nel programma"; e2e per
   famiglia che esegue l'esempio e verifica l'headline del report.

## Come estendere

- **Nuova lingua**: copiare `src/i18n/catalog/en/`, `src/help/content/en/` e
  `src/stats/reportCopy/catalog/en/` nella nuova cartella e tradurre; eseguire
  `node --import tsx scripts/check-locale.mjs <locale>` finché è verde; poi
  registrare la lingua in `ACTIVE_LOCALES`, `catalog/index.ts`, `BOOKS`,
  `REPORT_LOCALES` e `TRANSLATED_REPORT_LOCALES`. `npm run help:build` e
  `npm run check`.
- **Nuova procedura**: aggiungere la voce al registry e la scheda con l'`id`
  corrispondente in `procedures-*.ts` per ogni lingua; `src/help/content.test.ts`
  fallisce finché manca (o non ha entrambi i livelli).
- **Nuovo testo in un report**: scrivere il msgid italiano dentro `copy(...)`,
  eseguire `npm run check` e tradurre la voce nei cataloghi di tutte le lingue;
  il test di copertura elenca esattamente ciò che manca.
