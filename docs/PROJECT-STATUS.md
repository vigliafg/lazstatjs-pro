# Documento di stato del progetto — LazStats

**Data:** 29 ottobre 2026  
**Branch:** `grid-roadmap`  
**HEAD:** `982c179` — `Test: dataset di prova multi-formato per famiglia di analisi`
**Stato git:** working tree pulito, branch allineato a `origin/grid-roadmap`
**Verifica:** `npm run check` → 480 test, 0 fail; Playwright → 43 passed / 35 skipped; build ok, nessun chunk >500 kB; file-size guard ok (340 file, 3 eccezioni).

---

## 1. Sintesi

LazStats è oggi un **workbench statistico locale per un singolo dataset**, pensato per ricercatore/studente. Non è un clone di SPSS: l’identità è “dato unico, analisi guidata, risultati spiegati, tutto locale”.

La struttura è matura: 31 procedure, 31 form, 31 runner, store dei parametri, snapshot delle card, stale, griglia tipizzata, import/export, report e **Web Worker per le 9 procedure pesanti**. Le fondamenta sono solide; restano debiti su **reshape, model comparison, diagnostica aggregata e scala dei dataset**.

---

## 2. Cosa fa oggi

### Dati
- Griglia tipizzata con 12 tipi di colonna (`num`, `int`, `dec`, `cat`, `str`, `id`, `bol`, `dat`, `dtm`, `tim`, `alp`, `chr`).
- Livelli categoriali con etichette, ordine, reference, ricodifica.
- Missing code per colonna, formule persistenti, colonne calcolate.
- Undo/redo con coalescing, validazione, auto-fix, clean, transform, sort, filtro.
- Import CSV/TSV/JSON/XLSX e **SPSS `.sav` / Stata `.dta`** (etichette variabile, value labels, date e missing); export CSV/TSV/JSON/SPSS syntax/XLSX.
- **21 dataset di prova** in `samples/`, divisi per famiglia di analisi e ciascuno in CSV, `.sav`, `.dta`, `.xlsx` e JSON, con `manifest.json` e generatore R; usati dai test unitari/e2e e disponibili per verifiche manuali.
- Variable Inspector, ricerca/filtro righe, virtualizzazione, fill handle e multi-cell editing.
- Limiti: 50.000 righe, 500 colonne; autosave localStorage ~4 MB; 20 card output; 1,5 MB HTML.

### Analisi
31 procedure in 10 famiglie:
Guided, Descriptive, Compare groups, Regression, Multivariate, Categorical, Survival, Time series, Missing data, Design & power.

Copertura: descriptive, distribution fit, t-test, ANOVA, factorial, ANCOVA, repeated/mixed ANOVA, non-parametric RM, TOST, regression, correlation, logistic, count regression, ordinal, LMM, GEE, PCA/alpha/EFA, chi-square, contingency, agreement, Kaplan–Meier, Cox, stratified Cox, time-dependent Cox, parametric survival, ARIMA/SARIMA, multiple imputation, sample size, resampling.

### Workbench
- Tre zone: Library, Setup, Output.
- Ricerca con ranking, famiglie, preferiti, A–Z, recenti, tastiera.
- Guided/Expert mode: in Guided le sezioni Advanced sono nascoste.
- Onboarding con tre percorsi: descrivere, confrontare, prevedere.
- Preset per t-test, ANOVA, regressione, logistica, correlazione.
- Live-run opt-in per procedure instant, con token di generazione.
- Le 9 procedure `heavy` girano in un **Web Worker** con fase, tempo trascorso e **Cancel**; se il browser non può creare il worker, il runner sincrono resta il fallback.
- Snapshot parametri nella card, Re-run, Apply, Re-run all.
- Stale su dati, dataset, filtro, parametri, CI; persistito dopo reload per dataset/revision/CI.

### Output
- Card con outline, collapse, pin, filtro per analisi, copia.
- Export HTML, Word, XLSX, grafici PNG.
- Export codice R/Python per descriptive, t-test, ANOVA, regressione, correlazione, logistica.
- Report in prosa italiano, pensato per lettura e tesi.

### Persistenza
- Progetto `.lzs` **versione 2**, con migrazione automatica dai file v1.
- Autosave su localStorage + **backup IndexedDB**, con “Restore backup” in Settings.
- Error boundary per pannello, con reload e download diagnostico.
- Limite noto: `filterSignature` non è persistito; una card con filtro analysis non viene confrontata dopo reload.

### Qualità e architettura
- `stats/` puro, `analyses/` form + runner, `grid/` modello dati, `ui/` composizione.
- dependency-cruiser, madge, file-size guard, sanitizer output HTML, cap di import/progetto.
- 480 test unitari, 43 e2e passati, 35 skipped (mobile/desktop non applicabili).
- i18n: 744 chiavi, UI inglese, help/report in italiano.

---

## 3. Stato dei tre sprint

| Sprint | Stato | Fatto | Non fatto |
|---|---|---|---|
| **1 — Robustezza** | **Quasi completa** | Error boundary, schema v2 + migrazione, backup IndexedDB, validazione numerica inline, **worker + cancel per i kernel pesanti** | Seed configurabile, storage oltre localStorage, recovery automatico all’avvio |
| **2 — Facilità** | **Quasi completa** | Guided/Expert, onboarding, preset, NumberField, label/fieldset, welcome, **import SPSS/Stata** | Inline validation su tutti i form, command palette globale |
| **3 — Potenza** | **Parziale** | Re-run all, report Word, export codice R/Python, fast-path formule, analysis cards, worker e import binario | Reshape long/wide, model comparison, diagnostics dashboard, desktop/large data |

---

## 4. Punti di forza

- Kernel puri e report che non ricalcolano: la parte statisticamente più solida.
- 31 procedure con form coerenti e runner separati.
- Snapshot parametri, stale e re-run: il ciclo di lavoro è chiuso.
- Local-first: nessun dato inviato a un server.
- Griglia tipizzata, livelli, missing code e formule: buona base per dati reali.
- Test e guardrail: il progetto non è fragile sul piano della manutenzione.

---

## 5. Limiti e debito tecnico

1. **Worker limitato alle procedure heavy**: le 22 procedure instant restano sincrone; il clone della griglia verso il worker è O(righe×colonne) e non è ancora trasferibile con `ArrayBuffer`.
2. **Import binario senza `.zsav`**: `.sav` e `.dta` sono supportati; i file SPSS compressi `.zsav` richiedono zlib nel browser e sono rifiutati con un messaggio esplicito.
3. **Nessun reshape long/wide** guidato: dataset longitudinali reali restano fuori.
4. **Nessun model comparison** né diagnostics dashboard aggregata.
5. **Seed non configurabile**: i kernel usano seed fissi, quindi i risultati sono deterministici ma non controllabili dall’utente.
6. **Limiti di scala**: 50k×500, 4 MB autosave, 20 card; nessun desktop wrapper/File System Access.
7. **Filtro analysis non persistito**: limite noto sullo stale dopo reload.
8. **Accessibilità**: migliorata, ma senza audit con screen reader reali; mobile editing limitato.
9. **Collaborazione assente** per scelta: nessun cloud, ruoli, audit trail.
10. **Lingua mista**: UI inglese, help/report e prosa del Wizard in italiano.

---

## 6. Rischi principali

- **Worker**: il payload è serializzabile e il fallback sincrono esiste, ma il clone della griglia e il rendering Victory nel worker vanno monitorati su dataset grandi.
- **Persistenza**: IndexedDB è un backup, non ancora la fonte primaria; migrazioni e recovery vanno testate su file reali.
- **Interoperabilità**: il parser è una porta TS di ReadStat; vanno provati file reali SPSS/Stata oltre alle fixture, inclusi user-missing e formati data rari.
- **Validazione statistica**: i test coprono i kernel, ma mancano property test/fuzz e un oracle indipendente su tutti i metodi.
- **Crescita della UI**: `AnalysisOptions` è a 688 righe, `App` a 684; il prossimo blocco deve usare hook/componenti, non aggiungere righe inline.

---

## 7. Prossimi passi consigliati

1. **Reshape long/wide** guidato.
2. **Model comparison + diagnostics dashboard**.
3. **Seed utente** e ripetibilità dichiarata nel report.
4. **A11y audit + mobile editing**.
5. **Trasferimento dati al worker senza clone** (SharedArrayBuffer/ArrayBuffer) e worker anche per import binari grandi.
6. Solo dopo: dataset più grandi, desktop wrapper, condivisione.

---

## 8. Come eseguire

```bash
npm run dev              # sviluppo
npm run check            # lint + unit + guardrail
npm run test:samples     # verifica i dataset di prova in tutti i formati
npm run samples:generate # rigenera samples/ da R
npm run test:e2e         # Playwright desktop + mobile
npm run build            # produzione
npm run bench:grid       # benchmark griglia/formule
```

---

## 9. File chiave

| File | Ruolo |
|---|---|
| `src/App.tsx` | Shell, stato, persistenza, orchestrazione |
| `src/ui/AnalysisTab.tsx` | Workbench a tre zone |
| `src/ui/analysis/AnalysisOptions.tsx` | Setup, preset, code export, run |
| `src/ui/OutputConsole.tsx` | Card, outline, stale, export |
| `src/ui/analysis/store.tsx` | Store parametri |
| `src/analyses/registry.ts` | 31 procedure e famiglie |
| `src/analyses/runners.ts` | Registro runner |
| `src/grid/DataGrid.tsx` | Griglia, editing, tastiera |
| `src/io/project/index.ts` | `.lzs`, autosave, migrazione |
| `src/io/backup.ts` | Backup IndexedDB |
| `src/io/statfiles.ts` | Import SPSS `.sav` / Stata `.dta` |
| `samples/` | 21 dataset di prova per famiglia, 5 formati, manifest e generatore R |
| `src/io/samples.test.ts` | Verifica manifest, formati e copertura delle procedure |
| `src/io/codeExport.ts` | Export R/Python |
| `src/io/statfiles.ts` | Import SPSS `.sav` / Stata `.dta` |
| `src/analyses/worker/` | Worker, protocollo, registry heavy e client |
| `src/components/AnalysisCharts.tsx` | Grafici serializzabili per worker e output |
| `src/ui/ErrorBoundary.tsx` | Recovery di pannello |
| `src/i18n.ts` | 744 chiavi di chrome |

---

**Giudizio sintetico:** progetto **solido e coerente**, con una base statistica e di test sopra la media per un’app locale. Le due soglie di qualità — worker per i kernel pesanti e import SPSS/Stata — sono state superate; la distanza da un “ambiente di ricerca completo” ora è in **reshape, model comparison, diagnostica e scala dei dati**.
