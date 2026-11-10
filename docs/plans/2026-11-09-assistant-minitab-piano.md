# Piano — Assistant (copia funzionale dell'Assistant di Minitab)

Repo `lazstatjs-pro`, base `main` @ `20edee2`, v0.31.0.

## 1. Obiettivo

Pannello che (a) porta alla procedura giusta con un albero decisionale, (b) precompila la scheda, (c) esegue e accompagna il run-report con un **Report Card** sugli assunti.

Vincolo di layout: pannello **a sinistra del pannello DATA**, **tutta l'altezza utile** dell'area (dal bordo sotto l'header al footer), non una striscia nella toolbar.

## 2. Riferimenti

- **Minitab Assistant**: menu dedicato (MSA, Capability, Graphical Analysis, Hypothesis Tests, Regression, DOE, Control Charts, Before/After); albero "Help me choose" con definizioni ed esempi; dialoghi semplificati che cambiano con gli input; Summary, Diagnostic e **Report Card** con indicatori di stato; export Word/PowerPoint.
- **Statgraphics StatWizard/StatAdvisor**: scelta dell'analisi in base al tipo di dato e paragrafo di interpretazione in linguaggio naturale.
- **JMP/SPSS**: nessun assistente equivalente.

## 3. Base già nel repo

`profileColumns`, `groupChecks`, `recommendWizard` (`src/stats/kernels/wizard.ts`); `analysisRoles`, `assignRole`, `validateRoleTypes` (`src/analyses/roles.ts`); `paramsSnapshot`; `useProjectParams` e i default per analisi; `runAnalysisWith` (`src/hooks/useAnalysisRun.ts`); `AnalysisRunResult`; `ReportSpec`; `RunReportCard`, `useOutputConsole`, `io/outputs`; `ANALYSIS_IDS` e la famiglia `guided`; `UiMode`; sei locale.

## 4. Gap

1. Il wizard è una scheda: non resta accanto ai dati, non precompila, non esegue.
2. Non esiste un Report Card unico.
3. Manca un albero navigabile con definizioni/esempi.
4. L'area dati è un solo pannello.

## 5. Architettura

### 5.1 Layout (`src/App.tsx`, tab data)

```jsx
<div className="flex min-h-0 flex-1">
  <AssistantPanel ... />
  <div className="flex min-w-0 flex-1 flex-col"><DataWorkspace ... /></div>
</div>
```

### 5.2 Pannello (`src/ui/assistant/AssistantPanel.tsx`)

- `role="complementary"`, larghezza 320 px, resize 280–520 con maniglia 4 px (frecce ±16 px, doppio click reset), collasso a rail da 44 px.
- Larghezza, stato e percorso in `localStorage` (`lazstat.assistant.v1`): nessuna modifica allo schema progetto (`PROJECT_VERSION` resta 3).
- Sotto 1024 px: drawer sovrapposto. Aperto in Guided, chiuso in Expert, scelta memorizzata.
- Header (breadcrumb e chiusura) e azioni fissi; scroll solo nel contenuto.

### 5.3 Stato (`useAssistant.ts`)

`idle → guide(nodeId) → ready(leaf) → applied(analysisId) → ran(entryId)`, con `path`, `answers`, `leafId`, `analysisId`, `collapsed`, `width`. Hook consumato dal pannello, nessun contesto globale nuovo.

### 5.4 Albero (`tree.ts`, dato tipizzato)

```ts
type AssistantNode =
  | { id; kind: 'question'; prompt: MessageKey;
      help?: { definition: MessageKey; example: MessageKey };
      options: { id; label: MessageKey; next: string }[] }
  | { id; kind: 'leaf'; analysisId: string; variant?: MessageKey;
      roles: { roleKey: string; from: 'outcome'|'group'|'second' }[];
      checks: MessageKey[]; preset?: ...; alternative?: string };
```

Validatore unit: ogni `next` esiste, nessun ciclo, nessun nodo irraggiungibile, `analysisId` in `ANALYSIS_IDS`, `roleKey` in `analysisRoles(id)`, chiavi i18n nelle sei lingue.

### 5.5 Ponte (`apply.ts`)

1. parte dai parametri correnti dell'analisi target;
2. `assignRole(id, params, roleKey, column)` per ogni ruolo del leaf;
3. `validateRoleTypes` per i disallineamenti di tipo;
4. restituisce `{ params, assignments, missing, problems }`.

"Applica" = `setActiveAnalysis` + `setParams` + `setActiveTab('analysis')`. "Esegui" aggiunge `runAnalysisWith` e marca l'output con `assistant: { leafId, path }`.

### 5.6 Report Card (`card.ts`)

`CheckStatus = 'ok' | 'warn' | 'fail' | 'info'`; soglie in `CARD_THRESHOLDS`; i controlli leggono `AnalysisRunResult` e non ricalcolano alcun test.

Render: blocco `data-report="assistant-card"` in cima al run-report, più riepilogo compatto nel pannello; entra nell'HTML del run-report, quindi è esportato.

### 5.7 Tre blocchi

Summary (ReportSpec + "perché questa analisi"), Diagnostic (grafici già presenti con una riga di lettura), Report Card (semafori e prossimi passi).

## 6. Albero v1

- **Descrivere**: `descriptive`, `distfit`.
- **Confrontare**: `ttest` (independent/paired), `anova` (alternativa `nonparamrm`), `variances`, `proportions`.
- **Associare**: `correlation`, `chisquare` (2×2), `contingency` (R×C), `agreement`.
- **Prevedere**: `regression`, `logistic`, `countreg`, `ordinal`.
- **Tempo**: `timeseries`; sopravvivenza `survival`, `cox`.
- **Pianificare**: `samplesize`. **Dati mancanti**: `mi`.

Fuori v1 il ramo qualità (capability, control chart, MSA): non esiste in `ANALYSIS_IDS`.

## 7. Controlli previsti

n minimo per gruppo (15, 10 per i ranghi), normalità (Lilliefors), Levene, frequenze attese ≥ 5, 10 osservazioni per predittore, VIF > 10, Cook's D, potenza ≥ 0.80, Breusch–Pagan. Ogni voce con dettaglio numerico.

## 8. Fasi

1. **F1 Guscio**: layout, pannello, stato, i18n; e2e `assistant.spec.ts`.
2. **F2 Albero**: tipi, nodi v1, help, validatore e unit test.
3. **F3 Ponte**: precompilazione, "Non lo so" → `recommendWizard`.
4. **F4 Esecuzione**: "Esegui" e marker nell'output.
5. **F5 Report Card**: motore, soglie, UI, export; unit ai bordi.
6. **F6 Aiuto**: definizioni/esempi sui passi.
7. **F7 Rifinitura**: a11y, default Guided/Expert, docs, `npm run check`.

Stima 5–6 giornate.

## 9. Test e accettazione

- e2e: pannello a sinistra e alto quanto l'area dati; percorso obiettivo → leaf → Applica → Esegui → Report Card; persistenza dopo reload; drawer a 1024 px.
- a11y: nome accessibile, ordine di tabulazione, frecce per il resize, drawer senza rubare focus.
- i18n: nessuna stringa in chiaro, `check-locale` verde.
- Performance: `profileColumns` solo su richiesta ("Non lo so"), nessun run implicito.

## 10. Rischi

1. Duplicazione con la scheda `wizard`: l'Assistant è guscio + ponte + card, il kernel resta unico.
2. Copy in sei lingue: chiavi corte, fallback inglese.
3. Soglie del card: scelte di prodotto, centralizzate in `CARD_THRESHOLDS`.
4. Persistenza nel progetto: v1 solo locale; se serve nel file, versione 4 con migrazione.
5. Ramo qualità assente: dirlo esplicitamente.

## 11. Fuori perimetro

Nuove procedure statistiche, export nativi Word/PowerPoint in stile Minitab, suggerimenti da LLM: l'Assistant resta deterministico e documentato.
