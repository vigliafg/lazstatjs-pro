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
| 0 | Censimento e glossario | inventario stringhe, decisioni di prodotto | — | ✅ (censimento eseguito; glossario non ancora come documento) |
| 1 | Core i18n reattivo | store, `t` con parametri, cataloghi per area, fallback | parità chiavi/placeholder, orfani | ✅ |
| 2 | UI EN+IT | 738 chiavi, registry, assi dei grafici, export shell | `npm run check` | ✅ |
| 3 | Report locale-aware | prosa e tabelle per procedura in EN/IT | golden doppi per lingua | ✅ meccanismo `reportCopy`, catalogo EN completo (2002 msgid), `REPORT_LOCALES = it, en` |
| 4 | Menu lingue | sezione Impostazioni + selettore header, persistenza | e2e cambio/persistenza | ✅ |
| 5 | Infrastruttura manuale | schema, generatore, ricerca, stampa | build del libro | ✅ |
| 6 | Contenuti manuale | 40 schede × 2 livelli × IT/EN | copertura registry | ✅ |
| 7 | Integrazione manuale | scheda HELP, popup, deep-link | e2e tab + popup | ✅ |
| 8 | Ondate di traduzione | FR, ES, DE, PT-PT (UI, report, manuale) | parità + revisione | ⏳ in corso con un subagente per lingua |

## Stato di avanzamento (verificato)

Branch `wip/sessione-2` (worktree isolato), commit:

| Commit | Contenuto |
|---|---|
| `b8b2937` | core i18n reattivo, cataloghi EN/IT completi, menu lingua e persistenza |
| `d653946` | etichette del registry e dei grafici localizzate, ricerca bilingue |
| `394ad5a` | rientro nel limite di 700 righe dopo l'i18n delle etichette |
| `190b981` | libro HTML/CSS/JS bilingue a due livelli, scheda + popup, dataset di esempio |
| `2c031dd` | gating della lingua dei report, shell localizzata, documentazione, e2e |

Verifiche eseguite sull'ultimo commit:

- `npm run check`: **471 test**, 0 falliti; depcruise 374 moduli senza violazioni; nessun ciclo; file-size ok con **una sola eccezione** (`src/stats/kernels/arima.ts`). L'eccezione storica di `helpContent.ts` è stata rimossa insieme al file.
- `npm run build`: ok, `dist/help/en|it/*.html` presenti (il libro entra nel bundle statico).
- `npx playwright test --project=desktop`: **36 passati, 1 skipped** (skip preesistente), inclusi i 3 nuovi test su lingua persistente, libro nella scheda HELP e popup con deep-link (`e2e/locale.spec.ts`, in modalità serial perché condividono lo stesso dev server).

Numeri del contenuto:

- 738 chiavi di interfaccia × 2 lingue; 31 procedure + 10 famiglie con metadati localizzati;
- manuale: 40 schede per lingua (9 d'area + 31 di procedura), ognuna con tutorial + avanzato, dataset `score-groups.csv`;
- il badge "pesante"/"stale", i toast, gli export e le etichette del libro sono già localizzati.

## Debito residuo (in ordine di valore)

1. **Prosa dei report in inglese.** `src/stats/reports/*.ts` (29 file, ~18.600 parole) e le etichette delle tabelle (`src/stats/tables/*.ts`, ~980 stringhe) sono ancora italiane. Serve un catalogo per procedura (`src/stats/reports/catalog/en/<proc>.ts`, `src/stats/tables/catalog/en/<area>.ts`) con placeholder, `locale` inoltrato da `buildOutput` e golden doppi. Finché non è completo, `REPORT_LOCALES = ['it']` e Impostazioni lo dichiara esplicitamente.
2. **Ondate FR/ES/DE/PT-PT.** Aggiungere `src/i18n/catalog/<locale>/` + `src/help/content/<locale>/`, poi `ACTIVE_LOCALES`; ogni ondata passa da parità chiavi, pseudo-locale e revisione madrelingua.
3. **Glossario vincolante** (`docs/glossary/`) per coerenza terminologica nelle traduzioni.
4. **Estensioni del manuale**: dataset di esempio dedicato alle procedure che oggi riusano `score-groups.csv`; link "apri questo esempio nel programma"; e2e per famiglia che esegue l'esempio e verifica l'headline del report.

## Come estendere

- **Nuova lingua attiva**: tradurre `src/i18n/catalog/<locale>/` (il tipo impone tutte le chiavi), `src/help/content/<locale>/` (stessi `id`), aggiungere il locale ad `ACTIVE_LOCALES` e al registro `BOOKS`; `npm run help:build` e `npm run check`.
- **Nuova procedura**: aggiungere la voce al registry e la scheda con l'`id` corrispondente in `procedures-*.ts` per ogni lingua; `src/help/content.test.ts` fallisce finché manca (o non ha entrambi i livelli).
- **Nuova lingua dei report**: tradurre tutte le procedure, poi aggiungere il locale a `REPORT_LOCALES`.
