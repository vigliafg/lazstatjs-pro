# Boxplot: box con tacca e violin

- **Richiesta**:
  - «violin, notched... è possibile averli?»
  - «prepara il piano»
- **Obiettivo**: aggiungere al kind `box` la scelta `display: 'box' | 'notched' | 'violin'`, senza nuovi `ChartKind`, senza duplicare i runner e senza cambiare il default (`box`).
- **Criteri di successo**:
  - le tre modalità si selezionano dal pannello specifico dell’editor e aggiornano il preview;
  - il box standard resta visivamente invariato (a parte l’ordine delle categorie, allineato al sort);
  - notch e violin rispettano tema, palette, titoli, assi e tooltip;
  - le card esistenti e i `.lzs` senza `display` continuano a rendersi come box;
  - `npm run check`, `npm run guard`, `npm run test:e2e` verdi; nessun warning `vega-lite.compile()`;
  - verifica visiva documentata in tema chiaro e scuro.
- **Non-obiettivi**:
  - nuovi `ChartKind` (`violin` come kind separato);
  - modifiche alla logica statistica dei runner (è ammessa solo la propagazione di `n` nel summary manuale dei residui di regressione);
  - `box + violin` sovrapposti, ridge plot, box orizzontale, jitter dei punti, controllo del bandwidth;
  - modifica del layout o delle opzioni del box standard oltre all’ordine categorie;
  - violin per grafici privi di punti grezzi.
- **Assunzioni**:
  - il violin usa i `points` già presenti in tutti i box chart; il notch usa `n` dal summary;
  - il default resta `box`;
  - la KDE è una stima sui punti disponibili nel modello (cap 2000 per layer): limite documentato;
  - il notch è esatto perché deriva dal summary calcolato prima del downsampling.

## Vincoli dal repository

- **Dimensione file**: 700 righe (`scripts/check-file-size.mjs:11`). `src/charts/vega/layers.ts` è a 662 righe: `boxLayers` va estratto in un file dedicato prima di aggiungere notch/violin.
- **Dipendenze**: `src/charts/` non importa `ui/`, `analyses/`, `hooks/`, `io/`; i nuovi helper restano in `src/charts/kits/` e `src/charts/vega/`.
- **i18n**: 6 locale attive; le chiavi `chart.*` sono esenti dall’orphan check ma devono esistere in tutte le locale con gli stessi placeholder (`src/i18n.test.ts:19-33,59-73,85-95`).
- **Persistenza**: `mergeOptions` applica i default di fabbrica alle opzioni mancanti (`src/charts/defaults.ts:202-213`); `parseChartModel` usa lo stesso merge (`src/charts/schema.ts:120-123`), quindi una card vecchia senza `display` diventa `box`.
- **Test Vega**: `buildSpec.test.ts:31-44` compila ogni kind con `vega-lite.compile()` e pretende zero warning.
- **Cap punti**: `MAX_CHART_POINTS = 2000` per layer (`src/stats/charts.ts:11`), applicato dallo schema (`src/charts/schema.ts:43-56`).

## Stato attuale

- Un solo `ChartKind` box (`src/stats/charts.ts:20-37`); `BoxOptions` ha `showPoints`, `showOutliers`, `showMean`, `labelMedian`, `sort` (`:94-100`).
- `boxStats` calcola Q1/mediana/Q3, baffi Tukey e outlier ma **non salva n** (`src/charts/kits/common.ts:64-82`); `boxRows` produce `summary`, `points`, `outliers` (`:86-105`).
- L’ANOVA a una via include sempre i punti grezzi (`src/analyses/anova/run.tsx:242-263`, `:249`); il box dei residui di regressione costruisce il summary a mano e ricopia i campi (`src/analyses/regression/run.tsx:155-168`, `:266-273`).
- `boxLayers` usa x nominale `category`: bar per la scatola, rule/tick per baffi e mediana, point per media/outlier/punti (`src/charts/vega/layers.ts:237-329`).
- `rowsOf` ordina il summary per mediana (`src/charts/vega/encoding.ts:28-36`), ma l’encoding x del box è nominale senza `sort` esplicito (`layers.ts:240-248`): l’ordine effettivo resta alfabetico e il controllo `Ordine` del box non ha effetto. È un difetto pre-esistente, verificato compilando lo spec.
- Il pattern di densità calcolata in TS esiste già per l’istogramma (`src/charts/vega/layers.ts:356-377`): 60 punti passati come `data.values` a una line.
- `featuresFor` è l’unico registro (`src/charts/features.ts:424-434`); il box specifico è a `:304-325`.
- `e2e/chart-editor.spec.ts` usa `#chart-feature-<id>`, copre il box ANOVA, screenshot e reload (`:79-190`).

## Approccio proposto

### 1. Dati: solo `n`

- `boxStats` aggiunge `n` (conteggio dei valori finiti) a `BoxStats`; `boxRows` lo copia nel summary.
- Il summary manuale dei residui di regressione aggiunge `n` (`regression/run.tsx:155-168`): è l’unica modifica autorizzata a un runner e non tocca la statistica.
- Le card vecchie senza `n` restano `box`: il notch non è calcolabile e il renderer usa il box standard. Dopo un re-run il campo c’è.

### 2. Opzione e feature

- `BoxOptions.display: 'box' | 'notched' | 'violin'`, default `'box'` in `factoryOptions`.
- Un helper `boxDisplayOf(options)` riporta a `'box'` qualunque valore sconosciuto: lo usano il renderer e il `get` della feature, così un valore sporco non lascia la select vuota. Nessuna modifica a `mergeOptions`.
- Feature specifica `display` (select) nella sezione `Summary`, sempre con le tre scelte; niente `choicesFor`: il renderer fa fallback se mancano i dati, e la select resta coerente col valore salvato.
- i18n: `chart.feature.display`, `chart.display.box`, `chart.display.notched`, `chart.display.violin` × 6 locale.

### 3. Ordine unico delle categorie

- Una sola lista `categories` deriva da `rowsOf(chart, 'summary', options)` (quindi rispetta `sort` asc/desc).
- Una mappa `categoria → centro 0..k-1` viene applicata **per stringa** a summary, points, outliers e righe violin: l’ordine delle righe nei singoli layer non può più disallineare i gruppi.
- Anche il box standard riceve `sort: categories` sull’encoding x nominale: il controllo `Ordine` inizia a funzionare e le tre modalità mostrano lo stesso ordine. È una correzione necessaria per l’allineamento, non un refactor del box.

### 4. Notch

- Formula: `notch = mediana ± 1.57 × IQR / √n`, con clamp a Q1/Q3 (notch “folded”).
- `n <= 1`, `IQR <= 0` o valori non finiti: il gruppo usa il box standard; il resto del chart resta in modalità notched.
- Disegno con un `area` tra `x1` e `x2` su cinque quote: Q1, notch inferiore, mediana (x1 = x2 = centro), notch superiore, Q3. Le righe sono ordinate per y.
- Baffi, mediana, cappucci, media, outlier e punti usano il centro numerico della categoria; i colori restano quelli del box attuale (`colorAt`).

### 5. Violin

- `violinRows(points, categories, centers, summary)` in `src/charts/kits/common.ts` (stessa casa di `boxStats`/`boxRows`):
  - KDE gaussiana per gruppo, bandwidth di Silverman `1.06 × sd × n^(-1/5)`;
  - griglia di 60 punti tra min e max del gruppo; densità normalizzata sul massimo del gruppo;
  - semilarghezza massima `0.38` in unità di categoria; righe `{category, value, x1, x2}` ordinate per categoria e y;
  - gruppi con `n < 2` o `sd = 0` saltati e restituiti in `skipped`; per questi il renderer disegna una **rule verticale** dal `min` al `max` del summary al centro del gruppo (gruppo esplicitamente non stimabile, nessun buco né fallback silenzioso);
  - se manca anche il summary, fallback al box standard.
- Rendering: **una sola** area layer con `detail: category` e `x/x2/y`; niente una layer per gruppo, niente transform `density`/`joinaggregate`/`calculate`, niente `order` (spezzerebbe il pathgroup). L’ordine del path è garantito dalle righe ordinate per y e dal `sort` di Vega-Lite sull’area.
- Asse numerico: dominio `[-0.5, k-0.5]`, `axis.values` = centri, `labelExpr: JSON.stringify(categories) + '[datum.value]'` (verificato con virgolette e backslash); titolo asse = variabile di gruppo.
- Il box standard resta sul percorso nominale; notched e violin usano il percorso numerico. L’estrazione in `src/charts/vega/boxLayers.ts` tiene entrambi sotto il limite di 700 righe.

### 6. Limiti

- La KDE usa i punti presenti nel modello: oltre 2000 punti per layer il modello è campionato e il violin è una stima; il notch e i gruppi “non stimabili” usano il summary, quindi restano esatti. Va scritto in `docs/CHART-ENGINE.md`.
- Il box standard ora rispetta l’ordine delle categorie; il grafico a barre ha lo stesso difetto storico sull’asse nominale, ma è fuori da questo piano.

## Passi

1. **Dati, ordine, notch e opzione** — file: `src/charts/kits/common.ts`, `src/analyses/regression/run.tsx`, `src/stats/charts.ts`, `src/charts/defaults.ts`, `src/charts/features.ts`, `src/charts/vega/boxLayers.ts` (nuovo), `src/charts/vega/layers.ts`, `src/charts/vega/buildSpec.ts`, `src/i18n/catalog/*/analysis.ts`, test.
   - `n` in `boxStats`/`boxRows`; spread nel summary regressione.
   - `display` nel tipo e nel factory default; `boxDisplayOf`; feature select con le tre scelte; 4 chiavi i18n.
   - Estrazione di `boxLayers` in `vega/boxLayers.ts`; `layers.ts` resta sotto 700.
   - Lista `categories` + mappa centri; `sort: categories` nel box standard.
   - `notchBounds` (pura, esportata) e layer notched con area a cinque quote; fallback per n/IQR non validi.
   - Test: `boxStats` n; `notchBounds` per n=1, n piccolo, IQR=0, mediana ai quartili; ordine categorie; `features`/`defaults`; `buildSpec` compila box e notched senza warning.
   - Rischio M. Verifica: `npm run lint`, `npm test`.

2. **Violin** — file: `src/charts/kits/common.ts`, `src/charts/vega/boxLayers.ts`, `src/charts/features.ts`, `src/charts/vega/buildSpec.test.ts`.
   - `violinRows` KDE + `skipped`; righe ordinate; una area layer con `detail`; rule per i gruppi saltati dal summary.
   - Aggiunta della scelta `violin` alla feature (la chiave i18n è già in tutte le locale dal passo 1).
   - Test: simmetria, max 0.38, y nel range, gruppi n<2/sd=0/misti saltati, ordine delle righe, assenza di buchi; `buildSpec` compila violin senza warning e il layer contiene `x1/x2`.
   - Rischio M. Verifica: `npm run lint`, `npm test`.

3. **E2E, documentazione e verifica visiva** — file: `e2e/chart-editor.spec.ts`, `docs/CHART-ENGINE.md`.
   - Test editor sul box ANOVA: seleziona `notched`, `violin`, verifica `data-chart-state=ready`, screenshot chiaro/scuro, Done/reload e persistenza del display.
   - `CHART-ENGINE.md`: nuova eccezione render-time (KDE del violin), limite dei 2000 punti, nota sull’ordine categorie e sul box standard.
   - Verifica visiva delle screenshot: notch leggibile, violin simmetrico, gruppi saltati rappresentati, nessun clip.
   - Rischio S. Verifica: `npm run check`, `npm run guard`, `npm run test:e2e`.

**Totale: M**

## Alternative considerate (e perché scartate)

- **Nuovo `ChartKind` violin**: i runner dovrebbero scegliere il kind, l’editor avrebbe un secondo pannello e la persistenza due tipi; il dato è lo stesso. Scartata.
- **Violin con transform Vega `density` per gruppo**: funziona (Vega-Lite 6.5 genera `kde`), ma richiede una layer per gruppo, `joinaggregate`/`calculate`, gestione degli assi per layer e non è più semplice della KDE TS; inoltre il pathgroup è fragile con `order`. Scartata a favore di una sola area layer.
- **Violin con facet per gruppo**: asse categorico gratis, ma cambia il layout in small multiples e impedisce un eventuale overlay box; non è la stessa vista. Scartata.
- **`box + violin` sovrapposti**: YAGNI rispetto alla richiesta «violin, notched»; il core numerico del notch renderebbe l’overlay poco costoso in seguito, ma non entra nel v1. Scartata.
- **Due checkbox `notched`/`showViolin`**: meno chiavi i18n, ma introduce la combinazione illegale notched+violin e più stati da disabilitare; la select a tre valori è più semplice. Scartata.
- **Notch calcolato nel modello**: `notchLo`/`notchHi` sono campi derivati e sarebbero persistiti; meglio `n` nel summary e formula nel renderer, accanto al disegno. Scartata.
- **KDE in un file dedicato**: `violinRows` sta in `kits/common.ts` con `boxStats`/`boxRows`, stesso livello di astrazione; un file in più non serve. Scartata.
- **Solo notch**: metà della richiesta; la KDE TS è gestibile. Scartata.

## Riconciliazione del Concilio

| # | giro | rilievo | chi | severità | decisione | motivo |
|---|------|---------|-----|----------|-----------|--------|
| 1 | 1 | «Senza modificare i runner» contraddice l’aggiunta di `n` al summary manuale della regressione | Luna | BLOCKER | accettato | Il vincolo è stato riscritto: è autorizzata la sola propagazione di `n` nel summary dei residui (`regression/run.tsx:155-168`). |
| 2 | 1 | Il violin con transform Vega per layer è più complesso e fragile del necessario | GLM | BLOCKER | accettato | KDE in TS (`kits/common.ts`), una sola area layer; nessun `density`/`joinaggregate`/`calculate`. |
| 3 | 1 | `box-violin` è YAGNI rispetto a «violin, notched» | GLM | BLOCKER | accettato | Tagliato: display `box | notched | violin`. Il core numerico rende l’overlay un follow-up a basso costo. |
| 4 | 1 | La KDE usa punti che possono essere downsampled | Luna | MAJOR | accettato come limite documentato | Cap 2000 già esistente; notch esatto dal summary, gruppi non stimabili rappresentati con una rule min–max. Test e doc. |
| 5 | 1 | Mancano policy per gruppi singleton/vuoti/costanti | Luna | MAJOR | accettato | `violinRows` restituisce `skipped`; il renderer disegna la rule min–max dal summary. Test per n=1, sd=0, gruppi misti. |
| 6 | 1 | La compilazione senza warning non verifica la geometria | Luna | MAJOR | accettato | Test puri su `notchBounds`/`violinRows` + screenshot e2e con revisione visiva documentata. |
| 7 | 1 | Un `display` sconosciuto può persistere | Luna | MAJOR | accettato | `boxDisplayOf` normalizza a `box` nel renderer e nel `get` della feature; test con valore sporco. Nessuna modifica a `mergeOptions`. |
| 8 | 1 | `choicesFor` può togliere dalla select il valore salvato | Luna | MINOR | accettato | Niente `choicesFor`: tre scelte sempre presenti; fallback del renderer. |
| 9 | 1 | Il sort del box standard è potenzialmente inefficace e divergerebbe dalle nuove modalità | Luna | MINOR | accettato | Lista `categories` unica da `rowsOf` e `sort: categories` anche sul box nominale; test con categorie non alfabetiche. |
| 10 | 1 | Una layer per categoria può crescere troppo | Luna | MINOR | risolto | La KDE TS produce una sola area layer con `detail`. |
| 11 | 1 | La matematica del notch va in `boxStats`, non nel renderer | GLM | MAJOR | parzialmente accettato | Solo `n` nel modello; `notchLo/notchHi` sono derivati e restano nel renderer, accanto al disegno. Evita campi persistiti. |
| 12 | 1 | `choicesFor` con doppia condizione è ridondante | GLM | MAJOR | accettato | `choicesFor` eliminato. |
| 13 | 1 | Il ternario in `labelExpr` è ingombrante | GLM | MINOR | accettato | `labelExpr: JSON.stringify(categories) + '[datum.value]'`, verificato anche con virgolette/backslash. |
| 14 | 1 | 4 passi non sono il minimo | GLM | MINOR | accettato | 3 passi: dati/notch, violin, e2e/docs. |
| 15 | 1 | La verifica visiva è duplicata | GLM | MINOR | accettato | Screenshot chiaro/scuro dentro l’e2e; revisione visiva una volta. |
| 16 | 1 | «KDE in TypeScript» era un’alternativa aperta | GLM | MINOR | accettato | Decisa: KDE TS, non transform Vega. |
| 17 | 2 | Mappa categoria→centro non specificata: con `sort` attivo punti/outlier possono finire sotto il gruppo sbagliato | Luna, GLM | MAJOR | accettato | Una mappa unica da `rowsOf`, applicata per stringa a summary/points/outliers/violin; test con categorie non alfabetiche. |
| 18 | 2 | Il downsampling non è stratificato: gruppi piccoli possono sparire | Luna | MAJOR | accettato | Rule min–max dal summary per i gruppi saltati; test con gruppi sbilanciati; limite documentato. |
| 19 | 2 | L’ordine del path area non è dimostrato dalla compilazione | Luna | MAJOR | accettato | Righe ordinate per categoria/y, niente `order` sull’encoding, test puro dell’ordine e revisione visiva documentata. |
| 20 | 2 | Il fallback può mostrare un box mentre la select dice violin/notched | Luna | MINOR | accettato | I gruppi non stimabili mostrano una rule esplicita, non un box; per il notch senza `n` il renderer usa il box standard e il caso è documentato. |
| 21 | 2 | Servono test numerici del notch per n piccolo/mediana ai quartili | Luna | MINOR | accettato | `notchBounds` testato per n=1, n piccolo, IQR=0, mediana ai quartili. |
| 22 | 2 | Le nuove chiavi i18n vanno verificate nei cataloghi | Luna | MINOR | accettato | 4 chiavi × 6 locale; `npm test` (i18n test) e `npm run locales:check <locale>` in verifica. |
| 23 | 2 | `notchLo/notchHi` nel modello inquinano il contratto | GLM | MAJOR | accettato | Solo `n` nel summary; notch calcolato in `boxLayers`. |
| 24 | 2 | La normalizzazione in `mergeOptions` è YAGNI | GLM | MAJOR | accettato | Nessuna modifica a `mergeOptions`; `boxDisplayOf` nel renderer/feature. |
| 25 | 2 | `violinRows` in un file dedicato è un file in più | GLM | MINOR | accettato | Sta in `kits/common.ts`, accanto a `boxStats`/`boxRows`. |
| 26 | 2 | `n` e `notchLo/notchHi` insieme sarebbero ridondanti | GLM | MINOR | accettato | Solo `n`; i notch sono derivati nel renderer. |
| 27 | 2 | Il clamp Q1/Q3 va deciso in un solo posto | GLM | MINOR | accettato | Nel renderer, con `notchBounds`. |
| 28 | 2 | Il cap 2000 è già implementato: basta documentarlo | GLM | MINOR | accettato | Documentazione in `CHART-ENGINE.md`; test sui gruppi saltati. |
| 29 | 2 | Due checkbox sono più corte della select | GLM | alternativa | rifiutato | La select evita la combinazione notched+violin e gli stati illegali; 4 chiavi i18n sono accettabili. |
| 30 | 2 | Solo notch dimezza il piano | GLM | alternativa | rifiutato | La richiesta include entrambi; la KDE TS è contenuta. |
| 31 | 2 | Violin “istogramma levigato” senza KDE | GLM | alternativa | rifiutato | Non è un violin e la qualità sarebbe inferiore. |

Nessun BLOCKER resta aperto. Il piano finale recepisce i due giri; le divergenze residue (notch nel renderer invece che nel modello, `box-violin` tagliato) sono decise con motivazione tecnica.

## Verdetto dei critici

- **Luna, primo giro: REJECT** — «il piano, così scritto, non può rispettare insieme il divieto di modificare i runner e l’aggiunta affidabile di n al summary manuale della regressione».
- **Luna, secondo giro: APPROVE_WITH_CHANGES** — «direzione valida, ma ordine, gruppi mancanti e verifica del path richiedono correzioni prima dell’implementazione»; le correzioni sono nei passi 1-3.
- **GLM, primo giro: APPROVE_WITH_CHANGES** — «il piano è fondato e l’opzione sul kind box è la scelta giusta, ma tre tagli concreti (notch+KDE in TS, box-violin fuori dal v1, assorbimento del passo 1) lo rendono corto, deterministico e a rischio Vega-zero».
- **GLM, secondo giro: APPROVE_WITH_CHANGES** — «piano già vicino al minimo e implementabile, ma va fissata la mappa unica categoria→centro, il notch va al renderer (solo n nel modello) e la normalizzazione in mergeOptions va tagliata»; tutte e tre le richieste sono nel piano finale.

## Rischi e mitigazioni

- **Ordine categorie**: la mappa unica e `sort: categories` allineano box/notch/violin; test con categorie non alfabetiche e sort asc/desc. Il grafico a barre resta fuori perimetro.
- **Gruppi non stimabili**: rule min–max dal summary; test per n=1/sd=0/gruppi misti. Nessun buco silenzioso.
- **KDE su punti campionati**: limite documentato; notch esatto; test su gruppi sbilanciati.
- **Path area**: righe ordinate per categoria/y, `detail` per gruppo, niente `order`; screenshot e revisione visiva.
- **Dimensione file**: `boxLayers.ts` estratto; `layers.ts` scende sotto 700; `kits/common.ts` cresce di ~50 righe.
- **Card vecchie**: default box; notch senza `n` → box; `display` sporco → box tramite `boxDisplayOf`.
- **i18n**: 4 chiavi × 6 locale; il test i18n copre presenza e placeholder.

## Test e verifica

- Dopo ogni passo: `npm run lint`, `npm test`.
- Passo 1: `buildSpec` compila box e notched senza warning; test numerici `boxStats`/`notchBounds`; ordine categorie.
- Passo 2: `violinRows` (simmetria, max 0.38, n<2/sd=0/misti, ordine righe), `buildSpec` violin senza warning, layer con `x1/x2`.
- Passo 3: `npx playwright test e2e/chart-editor.spec.ts --project=desktop`; screenshot chiaro/scuro; reload e persistenza; revisione visiva.
- Finale: `npm run check`, `npm run guard`, `npm run test:e2e`; `npm run locales:check it` (e le altre locale toccate, se necessario).
- Casi limite: gruppi con un punto, gruppo costante, categorie non alfabetiche, etichette con virgolette/backslash, card senza `display`/`n`, violin su chart senza punti.

## Criteri di accettazione

- La select mostra Box, Notched box, Violin; il preview cambia e resta `data-chart-state=ready`.
- Il box standard è visivamente invariato tranne l’ordine categorie, che ora rispetta `Ordine`.
- Il notch ha la tacca al centro, clampata a Q1/Q3; n=1/IQR=0 mostrano il box standard.
- Il violin è simmetrico, con semilarghezza ≤0.38, gruppi non stimabili rappresentati da una rule min–max.
- Le card vecchie senza `display`/`n` restano leggibili; un `display` invalido non rompe la select.
- Le 6 locale hanno le 4 chiavi; nessun warning Vega-Lite; `check`, `guard`, `test:e2e` verdi.
- `docs/CHART-ENGINE.md` documenta KDE, cap punti e ordine categorie.

## Domande aperte / condizioni per l’assenso

- Il cap 2000 punti è accettato come limite della KDE; se in futuro serve una densità esatta su dataset grandi, va calcolata prima del downsampling o aggiunta al modello.
- Il sort del grafico a barre ha lo stesso difetto storico del box; non è incluso. Se il Concilio lo vuole, è un follow-up separato.
- `box + violin` resta un follow-up: il core numerico di notch/violin lo rende poco costoso, ma non è nella richiesta attuale.
