# Architettura — LazStats Pro

Obiettivo: un'analisi si aggiunge o si modifica toccando pochi file, senza
duplicare calcolo, form, report e persistenza. Le regole sono verificate da
`npm run guard` (dentro `npm run check`).

## Strati

```
src/
  grid/         modello dati: celle, colonne, livelli, operazioni, history
  stats/        motore numerico e prosa dei report (nessun React):
                kernels/ numeri puri, tables/ TableSpec, reports/ ReportSpec
  analyses/     una cartella per analisi: Form.tsx + run.tsx (+ defaults.ts)
                e helper condivisi in analyses/shared/
  components/   componenti riusabili (tabelle, report) senza schermate
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
- `grid/` verso `ui/`, `analyses/`, `hooks/`, `io/`;
- `components/` verso `ui/`, `analyses/`, `hooks/`;
- `io/` verso `ui/`, `analyses/`, `hooks/`;
- `analyses/` verso `ui/`.

Le eccezioni di dimensione sono in `scripts/check-file-size.mjs`: un file sopra
700 righe va spezzato o aggiunto con una motivazione. Le eccezioni non possono
crescere in silenzio.

## Contratto di un'analisi

Tutte le 19 analisi passano dallo stesso punto:

```ts
// src/analyses/<id>/run.tsx
buildOutput({ grid, params, ciLevel }): AnalysisRunResult
// ok: { ok: true, node, tables, report }
// no: { ok: false, reason }
```

`src/analyses/runners.ts` mappa `id -> buildOutput`; `useAnalysisRun` chiama il
runner attivo e `App.emit` appende alla console (o mostra il motivo del rifiuto).
Nessun pannello espone `forwardRef` o chiama la console direttamente.

## Aggiungere un'analisi

Checklist minima:

1. **Form** — `src/analyses/<id>/Form.tsx`, controllato:
   riceve `params` e il setter, non tiene stato proprio.
2. **Builder** — `src/analyses/<id>/run.tsx`: numeri, tabelle, grafici e
   `report`, senza console/toast; restituisce `AnalysisRunResult`.
3. **Parametri** — tipo in `ProjectParams` (`src/io/project.ts`), default in
   `DEFAULT_PARAMS`, parsing difensivo in `parseParams` (indici clampati,
   enum validati, campi mancanti = default).
4. **Default grid-aware** — se il vecchio pannello sceglieva colonne in base ai
   dati, metti la scelta in `src/analyses/<id>/defaults.ts` e usala nell'App.
5. **Runner** — aggiungi la voce in `ANALYSIS_RUNNERS` e il test del registro.
6. **Wiring** — stato nell'App, prop in `AnalysisTab`, render del Form.
7. **Test** — builder valido + validazioni; parsing `.lzs` con valori fuori
   range; se il calcolo è nuovo, golden test.

Una voce in più è un errore: la lista delle analisi vive solo in
`src/analyses/registry.ts` e nel registro dei runner.

## Persistenza `.lzs`

`ProjectSnapshot` contiene griglia, preferenze, impostazioni, parametri e
snapshot HTML della console. I campi aggiunti dopo la versione 1 sono opzionali
nel parser: un file vecchio continua a caricarsi con i default. Non cambiare
`PROJECT_VERSION` per aggiungere un campo; fallo solo per modifiche
incompatibili.

## Test

- `npm test` usa il glob ricorsivo `src/**/*.test.ts`.
- Golden di contratto per tutte le 19 analisi (`UPDATE_GOLDEN=1` per rigenerarli).
- Ogni builder ha un test dedicato (caso valido + rifiuti).
- `npm run check` = typecheck + test + guardrail.

## Debito noto

- `src/io/project.ts` contiene lo schema completo (855 righe): da spezzare in
  `io/project/` quando si affronterà la Fase 4.
- `stats/` non è ancora diviso in `kernels`/`tables`/`reports` per tutte le
  analisi: `samplesize`, `distfit`, `logistic`, `survival` e `contingency` sono
  i modelli; gli altri moduli tengono ancora calcolo, tabelle e prosa nello
  stesso file.
