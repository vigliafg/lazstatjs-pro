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
- [ ] Estrarre header, footer e toasts.
- [x] Estrarre `useToasts`, `useOutputConsole` e `useImportExport` (`src/hooks/`).
- [ ] Estrarre `useProjectSession` e `useAnalysisRun`.

**Stato:** `App.tsx` 3.767 → **787 righe** (-79%). Restano la persistenza del progetto
(`useProjectSession`) e i wrapper `run*` (fase 2, `AnalysisSpec`).

### Fase 2 — Unificare il contratto

- [ ] `AnalysisSpec` + `useAnalysisRunner` + `useAnalysisParams`.
- [ ] Un solo punto che appende alla console (niente `pushOutput` sparsa).
- [ ] Eliminare `forwardRef`/`useImperativeHandle` dai 14 pannelli.
- [ ] Persistenza parametri unica per id di analisi (`.lzs` compatibile o migrato con versione).

**Fatto quando:** 19/19 analisi passano dalla stessa strada.

### Fase 3 — Stratificare `stats/`

- [ ] Separare `kernels` / `tables` / `reports`.
- [ ] Assorbire `statsHelpers.ts` nei kernel, con test che provano l'equivalenza numerica.
- [ ] Decidere `jstat`: wrapper unico o vendor isolato dietro un'interfaccia.
- [ ] Eliminare i `fmt` locali: una sola formattazione (`stats/format.ts`).

**Fatto quando:** nessun kernel importa React, nessun report ricalcola, una sola
implementazione per ogni test statistico.

### Fase 4 — Confine dei dati

- [ ] `Dataset` in sola lettura + `selectValues` / `groupBy` / `completeCases` condivisi.
- [ ] Eliminare `toValues` / `numericValues` / `parseNum` duplicati nei moduli.

**Fatto quando:** le analisi ricevono una vista tipizzata, non `string[][]` grezzo.

### Fase 5 — Guardrail

- [ ] `dependency-cruiser` con le regole di dipendenza.
- [ ] `madge --circular`.
- [ ] Limite righe per file, con lista eccezioni esplicita.
- [ ] `ARCHITECTURE.md` + checklist "aggiungi un'analisi = 1 spec + 1 test".

**Fatto quando:** il rispetto delle regole è automatico, non volontario.

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
| 1 — Sfoltire `App.tsx` | schermate, console e import/export estratti; `App.tsx` 3.767 → 787 righe |
| 2 — Contratto unico | non iniziata |
| 3 — Stratificare `stats/` | non iniziata |
| 4 — Confine dati | non iniziata |
| 5 — Guardrail | non iniziata |
