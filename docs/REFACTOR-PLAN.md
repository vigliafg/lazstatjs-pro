# Piano di ristrutturazione — LazStats Pro

Obiettivo: rendere il codice **modulare e manutenibile** senza cambiare il comportamento
osservabile dell'applicazione. Ogni fase lascia l'app funzionante, i test verdi e gli
output identici.

Il piano parte da una diagnosi misurata sul repo `lazstatjs` (30.668 righe TS/TSX).

## Diagnosi

| Sintomo | Dato | Conseguenza |
|---|---|---|
| `App.tsx` monolitico | 3.767 righe, 27 `useState`, 1 `useCallback` | ogni modifica tocca un file che nessuno legge intero |
| Due modelli di analisi | 6 analisi inline in `App.tsx` + 14 pannelli in `src/analyses/` | la stessa cosa fatta in due modi |
| Contratto dei pannelli | `forwardRef` + `useImperativeHandle({ run })` ripetuto in 14 file | ogni pannello duplica stato, rendering, emissione output |
| Prosa sparsa | 41 occorrenze di `ReportSpec`/`buildReport` (6 in `report.ts`, 13 nei moduli) | il contratto "il report deriva dalle tabelle" è una convenzione, non un vincolo |
| Numerica tripla | `jstat` in 9 file, `statsHelpers.ts` (563 righe), `src/stats/*` | possibili due implementazioni dello stesso test |
| Formattazione duplicata | `fmt`/`fmtP` in `App.tsx` **e** in `src/stats/format.ts`, con semantica diversa | arrotondamenti incoerenti tra schermo e tabelle |
| Test fuori rete | `npm test` usa `src/stats/*.test.ts` (un solo livello) | spostare i file in sottocartelle spegne i test in silenzio |
| 6 analisi senza test | `descriptive`, `ttest`, `anova`, `regression`, `correlation`, `chisquare` non hanno file `.test.ts` | sono proprio quelle che il refactor deve spostare |

Nota: `anova.ts` importa `calcKruskalWallis` da `../statsHelpers` e `chisquare.ts` importa
`calcFisherExact` dallo stesso file. Il modulo "legacy" è quindi una dipendenza del codice
nuovo, non un residuo isolato.

## Architettura target

```
src/
  data/          worksheet, colonne, livelli, selezione, missing   <- nessuna dipendenza
  stats/
    kernels/     matematica pura: (dati, opzioni) -> numeri        <- niente React, niente stringhe
    tables/      (numeri, opzioni) -> TableSpec                    <- niente prosa
    reports/     (tabelle, livello) -> ReportSpec                  <- niente ricalcolo
  analyses/      1 file per analisi: spec + form + wiring
  ui/            shell, console, grid, help                        <- non importa kernels
  io/            import/export/progetto                            <- non importa ui
```

Regola d'oro, verificabile in CI: **le frecce puntano solo verso il basso.**

- `stats/kernels` non conosce React né produce stringhe.
- `stats/reports` non ricalcola nulla: legge solo `TableSpec`.
- `ui` non importa `stats/kernels` direttamente.
- `io` non importa `ui`.
- Nessun ciclo di import.

## Il contratto che elimina la duplicazione

Una sola forma per ogni analisi, al posto di `forwardRef` + pannello + report + test:

```ts
interface AnalysisSpec<P> {
  id: string;
  label: string;
  defaults(ctx: DataContext): P;
  params: ParamSpec[];                    // guida il form
  compute(ctx: DataContext, p: P): { tables: TableSpec[]; charts?: ChartSpec[] };
  report(tables: TableSpec[], level: number): ReportSpec;   // solo prosa
}
```

Da questa dichiarazione derivano: registrazione del tab, form, validazione, esecuzione,
blocco nella console, report e test di contratto. Il codice bespoke si riduce al kernel.

## Fasi

### Fase 0 — Rete di sicurezza

- [x] Glob dei test ricorsivo (`src/**/*.test.ts`) + script `check` unico.
- [x] Fixture deterministica condivisa (`src/stats/testing/fixture.ts`).
- [x] Golden test di contratto per le 6 analisi legacy, senza test propri
      (`src/stats/testing/golden.test.ts`, rigenerabili con `UPDATE_GOLDEN=1`).
- [x] Golden anche per le 13 analisi nuove, comprese quelle con fit intermedio
      (logistica, Cox, PCA, Friedman, misure ripetute, wizard). 23 file, 19/19 analisi coperte.
- [x] CI: `npm run check` + build su push e pull request (`.github/workflows/check.yml`, verde).

**Fatto quando:** ogni analisi ha un output congelato che il refactor non può cambiare.

### Fase 1 — Sfoltire `App.tsx`

- [x] Estrarre le 6 analisi legacy: `descriptive`, `ttest`, `anova`, `regression`,
      `correlation`, `chisquare` (calcolo, grafici, tabelle, report) in `src/analyses/*/run.tsx`.
- [x] Estrarre i 6 form in `src/analyses/*/Form.tsx`.
- [x] `src/ui/OutputConsole.tsx`: console, `OutputEntry`, `restoredOutputs`.
- [x] `src/analyses/registry.ts`: registro unico di tab, id ed etichette.
- [x] Estrarre la scheda Data in `src/ui/DataTab.tsx` (45 prop esplicite).
- [x] Estrarre la scheda Settings in `src/ui/SettingsTab.tsx`.
- [x] Estrarre la scheda Analysis in `src/ui/AnalysisTab.tsx` (tab, form, 13 pannelli, console).
- [x] Estrarre header, footer e toasts (`src/ui/Header.tsx`, `Footer.tsx`, `Toasts.tsx`).
- [x] Estrarre `useToasts`, `useOutputConsole` e `useImportExport` (`src/hooks/`).
- [x] Estrarre `useProjectSession` (`src/hooks/useProjectSession.ts`).
- [x] Estrarre `useAnalysisRun` (`src/hooks/useAnalysisRun.ts`).

**Stato:** Fase 1 ha portato `App.tsx` da 3.767 a **451 righe**. La fase 2 ha poi
aggiunto gli stati dei parametri (`App.tsx` è a 576 righe), ma il file non
contiene più logica di analisi: solo stato, persistenza e composizione.

### Fase 2 — Unificare il contratto

- [x] Registro unico dei builder: tutte le 19 analisi espongono
      `(grid, params, ciLevel) -> AnalysisRunResult` (`src/analyses/runners.ts`).
- [x] `useAnalysisRun`: unico punto di avvio; `emit` unico punto di emissione.
- [x] Eliminare `forwardRef`/`useImperativeHandle` dai 13 pannelli.
- [x] Persistenza parametri per id in `ProjectParams`, con parser difensivo e
      `.lzs` retrocompatibile (i campi mancanti usano i default).

**Stato:** completa. Ogni analisi ha `Form.tsx` (controllato) + `run.tsx` (builder
puro); `App.tsx` possiede i parametri e li salva nel progetto. I 19/19 casi
passano dalla stessa strada.

**Fatto quando:** 19/19 analisi passano dalla stessa strada. ✔

### Fase 3 — Stratificare `stats/`

- [ ] Separare `kernels` / `tables` / `reports` (avviata: i kernel legacy sono in
      `src/stats/kernels/`).
- [x] Assorbire `statsHelpers.ts` nei kernel: `kernels/exact.ts`,
      `kernels/ranks.ts`, `kernels/normality.ts`, con test di equivalenza numerica.
- [x] `jstat` isolato dietro `src/stats/jstat.ts`: nessun altro modulo importa il
      pacchetto direttamente.
- [x] Eliminare i `fmt` locali: `fmt`, `fmtP`, `fmtPct` vivono solo in `stats/format.ts`
      (`fmtPctValue` rimosso da `multivariate`).

**Fatto quando:** nessun kernel importa React, nessun report ricalcola, una sola
implementazione per ogni test statistico.

### Fase 4 — Confine dei dati

- [x] Classificazione condivisa delle colonne: `isNumericColumn`, `columnStrings`,
      `distinctValues`, `numericColumnIndexes` in `src/analyses/shared/columns.ts`.
- [ ] `Dataset` in sola lettura + `selectValues` / `groupBy` / `completeCases` condivisi.
- [ ] Eliminare `toValues` / `numericValues` / `parseNum` duplicati nei moduli
      (restano locali in `stats/wizard.ts`).

**Fatto quando:** le analisi ricevono una vista tipizzata, non `string[][]` grezzo.

### Fase 5 — Guardrail

- [x] `dependency-cruiser` con le regole di dipendenza (`.dependency-cruiser.cjs`).
- [x] `madge --circular`.
- [x] Limite righe per file, con lista eccezioni esplicita (`scripts/check-file-size.mjs`).
- [x] `ARCHITECTURE.md` + checklist "aggiungi un'analisi = form + run + params + runner + test".
- [x] `npm run guard` dentro `npm run check`; la CI lo esegue già.

**Fatto quando:** il rispetto delle regole è automatico, non volontario. ✔

## Vincoli noti del codebase

- **`tsconfig` non ha `strict`.** Senza `strictNullChecks` i discriminated union non si
  restringono su `if (!x.ok)`: usare `'reason' in result` finché non si attiva lo strict.
- `npm test` deve restare con glob ricorsivo: spostare un file in una sottocartella non deve
  spegnere i test.
- `anova.ts` e `chisquare.ts` dipendono da `statsHelpers.ts`: non è un file morto, va assorbito
  con test di equivalenza prima di essere eliminato.

## Regole di lavoro

1. **Comportamento invariato.** Un commit che sposta codice non cambia numeri, testi o layout.
2. **Test verdi prima e dopo.** Se un golden cambia, il cambiamento va spiegato nel commit.
3. **Commit piccoli e tematici.** Un'estrazione = un commit.
4. **Nessun refactor e nessuna correzione numerica insieme.** Sono due attività separate.
5. **Nessun porting Rust durante il refactor.** I moduli che emergono qui (`kernels`, `tables`,
   `reports`) sono la specifica del port: prima si separano, poi si traducono.

## Stato

| Fase | Stato |
|---|---|
| 0 — Rete di sicurezza | **completa**: 19/19 analisi coperte (23 golden), CI attiva |
| 1 — Sfoltire `App.tsx` | **completa**: estrazioni fatte (451 righe); la fase 2 ha aggiunto gli stati dei parametri |
| 2 — Contratto unico | **completa**: 19/19 con builder puro e parametri persistiti |
| 3 — Stratificare `stats/` | avviata: kernel legacy assorbiti e formattazione unica |
| 4 — Confine dati | avviata: classificazione colonne condivisa in `analyses/shared/` |
| 5 — Guardrail | **completa**: dependency-cruiser, madge, limite righe, ARCHITECTURE.md |
