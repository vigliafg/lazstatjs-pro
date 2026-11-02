# Galleria stile JMP — piano di implementazione v1

- **Richiesta**: «aspettimao l'implementazione del sitema a galleria su cui sta
  lavorando proprio adesso l'altro agente. quando l'infrastruttura della
  galleria è funzionante proceduermo integrando i grafici stile jmp secondo le
  tue raccomandazioni. al momento interroghiamo il concilio e produciamo qui un
  dettagliato piano di implementazione dei grafici stile jmp dentro la nostra
  galleria (appena sarà pronta, al momento è in test in un altra sessione)»
- **Obiettivo**: aggiungere alla galleria corrente una famiglia di varianti
  **JMP-like** per i grafici che già esistono, senza cambiare il default
  LazStats, senza introdurre nuovi `kind` e senza toccare il motore statistico
  oltre ai dati necessari al rendering.
- **Criteri di successo**:
  1. ogni kind mantenuto ha ancora **un solo default**, identico al factory;
  2. le varianti JMP sono **opt-in** e mostrano una descrizione verificabile
     delle differenze statistiche;
  3. box, scatter e Q-Q JMP-like compilano, sono selezionabili e non richiedono
     un rerun quando si cambia stile;
  4. una variante non disponibile per i dati/la procedura non viene applicata
     silenziosamente: fallback al default o tile non selezionabile;
  5. `npm run check` e l'e2e della gallery restano verdi.
- **Non-obiettivi**:
  - Partition, Prediction Profiler, Scatterplot Matrix, Graph Builder,
    Data Filter/lasso/dynamic linking: sono nuovi `kind`/analisi o architettura
    di interazione, non varianti di stile;
  - pannelli compositi JMP Distribution/Oneway: richiedono un contratto di card
    composita, separato dalla gallery;
  - colori/tema JMP esatti (retta rossa, linea verde, griglia JMP): sono una
    skin/preset, non una convenzione statistica;
  - banda CI su `reg-observed-fitted` con `k >= 2`: richiede una stima di
    `seMean` per il profilo medio e una verifica statistica dedicata;
  - nuove tabelle, nuovi report, nuovi testi di prosa.
- **Assunzioni**:
  - l'infrastruttura gallery v1 corrente (`styles.ts`, `ChartStyleGallery`,
    `ChartStyles`, `useChartStyleLibrary`, `docs/plans/2026-11-02-style-gallery.md`)
    è il contratto di partenza;
  - il working tree può contenere file non ancora committati dall'altro agente;
  - «JMP-like» è un'etichetta descrittiva, non un marchio ufficiale; il nome
    interno degli id può usare `jmp-*`.

## Vincoli dal repository

- Uno stile è un **patch di opzioni specifiche del kind**: non tocca colori,
  tema, titoli o annotazioni. L'unica eccezione già ammessa è il tratteggio
  della retta di riferimento Q-Q (`src/charts/styles.ts:1-14`,
  `docs/plans/2026-11-02-style-gallery.md`).
- Lo stile viene applicato **dopo il run** (`factory < default utente < stile <
  opzioni della card`, `src/charts/defaults.ts:256-273`). Non può cambiare dati
  o statistiche: gli oggetti alternativi (percentili, IC media, banda) devono
  essere già presenti nel modello della card.
- Le opzioni esplicite del runner **vincono** sullo stile. Per far funzionare
  una variante JMP bisogna togliere l'override esplicito che la blocca, non
  invertire l'ordine di merge.
- `parseChartModel`/`mergeOptions` non eliminano automaticamente le chiavi
  sconosciute; le nuove opzioni devono comunque stare in `ChartOptions`,
  `factoryOptions` e nei controlli dell'editor per essere tipizzate, validate e
  serializzabili (`src/charts/schema.ts:100-140`, `src/charts/defaults.ts:147-213`).
- Un solo default per kind, che riproduce il factory: è già verificato da
  `src/charts/styles.test.ts:40-100`.
- Le nuove stringhe vanno in tutte e sei le lingue (`en,it,fr,es,de,pt-PT`).
- Non introdurre nuovi `kind`: usare `box`, `scatter`, `qq`.

## Stato attuale

| Area | Stato | Evidenza |
|---|---|---|
| Gallery v1 | stili built-in + utente, default/override, anteprime live, inserimento copia, test | `src/charts/styles.ts:370-433`, `src/components/charts/ChartStyleGallery.tsx:63-160` |
| Q-Q | `probability` (default, JMP-like: assi probabilità/z, curve CI, riferimento continuo) e `classic` (banda, asse z) | `src/charts/styles.ts` (gallery `qq`), `src/charts/defaults.ts:200-210` |
| Box | display box/notched/violin/raincloud; Tukey 1.5 IQR; punti al centro; media come punto; nessun jitter; nessun IC media | `src/charts/kits/common.ts:52-120`, `src/charts/vega/boxLayers.ts:75-165` |
| Scatter | OLS/Theil-Sen, banda CI/PI, equazione/R²/N, ellisse; nessuna linea della media | `src/charts/vega/layers.ts:21-120`, `src/analyses/regression/run.tsx:248-300` |
| Actual by Predicted | solo punti + diagonale per `k >= 2`; nessuna banda/linea media | `src/analyses/regression/run.tsx:268-300` |
| Gallery UI | tile con badge default/user; nessuna origine, descrizione o disponibilità | `src/components/charts/ChartStyleGallery.tsx:107-160` |
| Selettore pre-run | stile per kind, senza contesto chart | `src/ui/analysis/ChartStyles.tsx:30-60`, `src/hooks/useChartStyleLibrary.ts:67-80` |

## Approccio proposto

**Una variante JMP è una convenzione statistica, non una skin.** La gallery
deve poter dire: «questa è la variante JMP: baffi 10°-90°, media con IC, punti
jittered» oppure «questa è la variante LazStats: Tukey 1.5 IQR, media come
punto». I colori JMP restano fuori: se servirà l'aspetto cromatico, sarà un
preset separato.

La struttura è a tre strati:

1. **Metadati leggeri** su `ChartStyle`: `origin`, `descriptionKey`, `analyses`,
   `requires`. Nessuna modifica alle firme di `stylesFor`, `resolvedStyle`,
   `matchingChartStyle`: la disponibilità è una funzione separata
   `styleAvailable(style, { chart?, analysisId? })` usata dalla UI e da
   `patchesFor`.
2. **Dati alternativi precalcolati** nel modello della card:
   - box: `p10`, `p90` nel summary (per i baffi percentile), `meanLo`, `meanHi`
     (per l'IC della media); niente layer `outliersPercentile`;
   - scatter: `stats.meanY`; la banda CI usa il `grid` già emesso da
     `reg-scatter` con `seMean`/`sePred`;
   - Q-Q: già tutto presente.
3. **Nuove opzioni minime**:
   - `BoxOptions.whisker: 'tukey' | 'percentile'` default `'tukey'`;
   - `BoxOptions.showMeanInterval: boolean` default `false`;
   - `BoxOptions.jitter: boolean` default `false`;
   - `ScatterOptions.showMeanLine: boolean` default `false`.

**Scelte di perimetro v1**:

- `jmp-oneway` è la variante box: baffi 10°-90°, media con IC, punti jittered,
  outlier; non è il default.
- `jmp-regression` è la variante scatter per la regressione semplice `k = 1`:
  OLS, banda CI 95%, linea della media, equazione breve. Su `k >= 2` la banda è
  rinviata; la descrizione dice «banda CI quando disponibile».
- `qq.probability` resta l'id esistente e il default: viene solo marcato
  `origin: 'jmp'` e gli si aggiunge la descrizione.
- Il jitter riusa il pattern deterministico già presente in `dotLayers`
  (`((index % 9) - 4) * 0.04` + `xOffset`), non un nuovo transform Vega. Per
  ridurre la sovrapposizione ciclica si usa un ciclo più lungo (101 posizioni)
  e un test con valori ripetuti.
- Non si usa `lineDash` nello stile scatter: il fit OLS ha già un tratteggio
  esplicito in `scatterLayers`; cambiare il tratteggio comune sarebbe inefficace
  e fuori dal contratto della gallery.

## Passi

1. **Metadati e disponibilità leggera** — file: `src/charts/styles.ts`,
   `src/charts/styles.test.ts`.
   - Aggiungere `ChartStyleOrigin = 'lazstat' | 'jmp'`,
     `descriptionKey?: MessageKey`, `analyses?: readonly string[]`,
     `requires?: readonly ('meanY'|'meanCI'|'percentile'|'band')[]`.
   - Aggiungere `styleAvailable(style, context)`:
     - `analyses` filtra per `analysisId` quando presente;
     - `requires` controlla `chart.stats.meanY`, `summary.meanLo/Hi`,
       `summary.p10/p90`, `grid`/`band`;
     - senza `chart` (pre-run) i `requires` sono ottimistici: decide solo
       `analyses`.
   - Non cambiare le firme di `stylesFor`, `resolvedStyle`,
     `matchingChartStyle`; la gallery filtra il match attivo con
     `styleAvailable`.
   - Test: stile JMP con origine/descrizione; `styleAvailable` vero/falso;
     stile non disponibile -> nessuna tile selezionata; user styles invariati.
   - Rischio: basso. S.

2. **Chiavi i18n** — file: `src/i18n/catalog/{en,it,fr,es,de,pt-PT}/analysis.ts`.
   - Aggiungere: `chart.style.origin.jmp`,
     `chart.style.jmpOneway`, `chart.style.jmpRegression`,
     `chart.style.jmpOnewayHint`, `chart.style.jmpRegressionHint`,
     `chart.style.jmpQqHint`, `chart.whisker.tukey`,
     `chart.whisker.percentile`, `chart.feature.meanInterval`,
     `chart.feature.jitter`, `chart.feature.meanLine`.
   - Verifica: test i18n / `npm run locales:check`; nessuna chiave mancante nel
     tipo `MessageKey`.
   - Rischio: basso. S.

3. **Box: dati alternativi in place** — file: `src/charts/kits/common.ts`,
   `src/analyses/regression/run.tsx`, test `common.test.ts`.
   - `boxStats` calcola anche `p10`, `p90` con `percentile(values, 0.1/0.9)`
     (`src/stats/kernels/distributions.ts:98`).
   - `boxRows(groups, { level = 95 })` aggiunge al summary:
     `p10`, `p90`, `meanLo`, `meanHi`.
   - `meanCI` va calcolato sui **soli valori finiti** e solo con `n >= 2`; per
     `n < 2` o varianza non calcolabile **non si scrivono** `meanLo`/`meanHi`
     (niente `NaN`: `finiteRows` scarterebbe l'intera riga summary,
     `src/charts/vega/encoding.ts:19-30`).
   - Non aggiungere `outliersPercentile`: con `jmp-oneway` i punti sono tutti
     visibili (`showPoints: true`) e gli outlier Tukey restano il layer
     esistente. Questo evita duplicazione e pressione sul budget 120k.
   - Aggiornare i call site che hanno un livello CI: `anova` (`ciLevel`),
     `ttest` (`ciLevel`), `descriptive` (`input.level`). Gli altri restano 95.
   - Rifattorizzare il box dei residui di regressione
     (`src/analyses/regression/run.tsx:189-203,383-392`) per usare `boxRows`
     invece del summary manuale: una sola fonte di verità. Il filtro dei valori
     non finiti cambia in meglio; annotarlo nel test.
   - Test: Tukey vs p10/p90, singleton che resta visibile, IC media, gruppi
     costanti, outlier Tukey invariati.
   - Rischio: medio (contratto dati). M.

4. **Box: opzioni, renderer e stile JMP** — file: `src/stats/charts.ts`,
   `src/charts/defaults.ts`, `src/charts/features.ts`,
   `src/charts/vega/boxLayers.ts`, `src/charts/styles.ts`, test.
   - `BoxOptions.whisker` default `'tukey'`; `showMeanInterval` e `jitter`
     default `false` in `factoryOptions`.
   - `boxLayers`:
     - baffi: `p10/p90` se `whisker === 'percentile'`, altrimenti `min/max`;
     - IC media: rule verticale da `meanLo` a `meanHi` con cappucci, solo se
       entrambi finiti; il punto/diamante della media resta `showMean`;
     - jitter: per i punti, mappa deterministica con ciclo 101 e `xOffset`
       (`[-0.2, 0.2]`) solo per `display === 'box'`; nessun dato aggiuntivo.
   - Controlli editor: select `whisker` (Tukey / 10°-90°), checkbox
     `showMeanInterval`, checkbox `jitter`.
   - Stile `box.jmp-oneway`: `display:'box'`, `whisker:'percentile'`,
     `showPoints:true`, `jitter:true`, `showMean:true`,
     `showMeanInterval:true`, `showOutliers:true`; origine `jmp`, descrizione,
     `requires:['percentile','meanCI']`.
   - Test: geometria percentile, IC media, jitter deterministico con valori
     ripetuti, default invariato, compile senza warning.
   - Rischio: medio (Vega-Lite xOffset). M.

5. **Scatter: mean line e banda** — file: `src/stats/charts.ts`,
   `src/charts/defaults.ts`, `src/charts/features.ts`,
   `src/charts/vega/layers.ts`, `src/analyses/regression/run.tsx`, test.
   - `ScatterOptions.showMeanLine` default `false`; controllo editor visibile
     quando `stats.meanY` è finito.
   - `scatterLayers`: se `showMeanLine` e `stats.meanY` finito, aggiunge una
     rule orizzontale alla media (riusa il blocco `rules`/`lineStyle` esistente,
     non un nuovo layer).
   - `reg-scatter` aggiunge `stats.meanY: jStat.mean(Y)`.
   - Rimuovere l'override esplicito `band:'none'` dalle opzioni di
     `reg-scatter` (`src/analyses/regression/run.tsx:262-265`): il factory
     default resta `none`, ma lo stile può impostare `band:'ci'`. Non cambiare
     l'ordine di merge.
   - `reg-observed-fitted` aggiunge `stats.meanY` (una riga), ma **non** la
     banda: per `k >= 2` la banda resta fuori v1. Se lo stile viene applicato,
     `bandRows` restituisce `[]` e non disegna nulla.
   - Test: mean line presente solo con opzione; assenza senza `meanY`; banda
     CI su `reg-scatter` con `grid`; compile.
   - Rischio: basso/medio. S-M.

6. **Stile scatter JMP** — file: `src/charts/styles.ts`, test.
   - `scatter.jmp-regression`: `fit:'ols'`, `band:'ci'`, `showBand:true`,
     `bandLevel:95`, `showMeanLine:true`, `equation:'short'`, `ellipse:false`;
     origine `jmp`, descrizione, `analyses:['regression']`,
     `requires:['meanY','band']`.
   - Non includere `lineDash`.
   - Test: default invariato; apply; matching; compile con fixture `grid` e
     `seMean`/`sePred`; descrizione presente.
   - Rischio: basso. S.

7. **Q-Q metadata** — file: `src/charts/styles.ts`, i18n, test.
   - Marcare `qq.probability` con `origin:'jmp'` e `descriptionKey`; nessun
     nuovo id, nessun cambio di default.
   - Test: default factory invariato, origine/descrizione presenti.
   - Rischio: basso. S.

8. **Gallery UI e selettore pre-run** — file:
   `src/components/charts/ChartStyleGallery.tsx`,
   `src/ui/analysis/ChartStyles.tsx`,
   `src/hooks/useChartStyleLibrary.ts`, test/e2e.
   - Gallery: badge `JMP-like` per `origin === 'jmp'`; tooltip/`title` con
     `descriptionKey`; tile non disponibile nascosta o disabilitata con motivo;
     `matchingChartStyle` filtrato da `styleAvailable` (uno stile non
     disponibile non è «selezionato»).
   - Selettore pre-run: filtra per `analyses`; se un override punta a uno stile
     non disponibile, mostra «Follow global» e `patchesFor` usa il default del
     kind, non salta silenziosamente la patch.
   - Test: badge, descrizione, default selected, select JMP box/scatter,
     insert copy, reload; nessuna variante JMP su analisi non ammesse.
   - Rischio: basso/medio. S-M.

9. **Verifica e documentazione** — test finali, niente modifica al documento
   gallery v1 (il contratto non cambia). Aggiornare solo
   `docs/plans/2026-11-02-jmp-style-gallery.md` con lo stato finale.
   - `npm run lint`
   - `npm test`
   - `npm run guard`
   - `npm run check`
   - `npx playwright test e2e/chart-styles.spec.ts --project=desktop`
   - Rischio: basso. M.

**Totale: M**

## Alternative considerate

| Alternativa | Perché scartata |
|---|---|
| Solo colori/tema JMP | Non è una convenzione statistica; rompe accessibilità, brand e contratto gallery |
| Nuovi `kind` per ogni variante JMP | Duplica dati e renderer; la gallery è per kind esistenti |
| Pannelli compositi Distribution/Oneway subito | Richiedono un contratto di card composita e un piano separato |
| Toggle globale «JMP mode» | Sorprende l'utente e rende difficile il fallback per singolo kind |
| Salvare l'id dello stile nella card | L'id diventa stantio dopo editing; le opzioni sono la fonte di verità |
| Stili JMP come user styles | Non discoverabili, non testati, non raggruppabili |
| `outliersPercentile` separato | Duplica righe e aumenta il rischio budget; con `showPoints` i punti sono già visibili |
| Banda actual `k >= 2` in v1 | Richiede `seMean` per il profilo medio e una verifica statistica dedicata; rinviata |
| `window+calculate` per jitter | Nuovo transform non necessario; esiste già il pattern `dotLayers` con `xOffset` |
| `lineDash:'solid'` nello stile scatter | Il fit OLS ha già un tratteggio esplicito; sarebbe inefficace e fuori contratto |

## Riconciliazione del Concilio

| # | Rilievo | Chi | Severità | Decisione | Motivo |
|---|---|---|---|---|---|
| 1 | Lo stile scatter non può attivare la banda: il runner forza `band:'none'` e vince sullo stile | Luna | BLOCKER | **Accettato** | Rimuovere l'override `band:'none'` da `reg-scatter`; factory default resta `none`. Non cambiare l'ordine di merge. |
| 2 | `reg-observed-fitted` `k>=2` non ha `grid/seMean` per la banda | Luna, GLM | BLOCKER/MAJOR | **Accettato** | Banda actual rinviata a un piano successivo; lo stile mostra la banda solo quando `grid`/`band` esiste. |
| 3 | Il motore di contesto (`requires`/`analyses` con firme cambiate) è sovradimensionato | GLM | BLOCKER | **Accettato** | `stylesFor`/`resolvedStyle`/`matchingChartStyle` restano invariati; `styleAvailable` separato, usato da UI e `patchesFor`. |
| 4 | `analyses` da solo non distingue i diversi scatter della regressione | Luna | MAJOR | **Accettato con limite** | `analyses` filtra il pre-run; la gallery controlla `requires` sul chart. `patchesFor` applica lo stile per kind; la banda `k>=2` è dichiarata non disponibile. |
| 5 | Il box residui di regressione costruisce il summary a mano e non riceve i nuovi campi | Luna | MAJOR | **Accettato** | Rifattorizzare quel percorso con `boxRows`; un solo file `analyses` toccato. |
| 6 | `meanCI` senza filtro dei non finiti e semantica dell'IC non chiara | Luna | MAJOR | **Accettato** | Filtrare i valori finiti; `n<2` -> niente `meanLo/Hi`; l'IC è descrittivo per gruppo, non l'IC del modello ANOVA. |
| 7 | `lineDash:'solid'` è inefficace sul fit OLS e fuori contratto | Luna, GLM | MAJOR/MINOR | **Accettato** | Rimosso dallo stile scatter. |
| 8 | `outliersPercentile` duplica righe e aumenta il budget | Luna, GLM | MAJOR | **Accettato** | Non si aggiunge; bastano i punti visibili e gli outlier Tukey. |
| 9 | Jitter con `window+calculate` è un nuovo transform non verificato | Luna, GLM | MINOR/MAJOR | **Accettato con modifica** | Riusare il pattern `dotLayers` (`xOffset`), ciclo 101, default false, test con valori ripetuti. |
| 10 | `meanLo/meanHi = NaN` fa scartare l'intera riga summary | Luna | BLOCKER | **Accettato** | Omettere i campi se non finiti; test con gruppo singleton che resta visibile. |
| 11 | `stats.meanY` da solo non disegna la linea | Luna, GLM | MAJOR | **Accettato** | Aggiungere `ScatterOptions.showMeanLine` e il layer condizionale; test presenza/assenza. |
| 12 | `p10/p90` non hanno consumatore nel piano ridotto | GLM | MAJOR | **Rifiutato** | Sono richiesti da `whisker:'percentile'` per la variante `jmp-oneway`: `boxLayers` li usa al posto di `min/max`. Senza di loro il box JMP non esiste. |
| 13 | `patchesFor` deve definire il fallback di uno stile non disponibile | GLM, Luna | MINOR | **Accettato** | Stile non disponibile -> `defaultChartStyle(kind)`, non skip silenzioso. |
| 14 | `bandLevel` può contraddire il livello CI del run | GLM | MINOR | **Accettato** | Lo stile fissa `bandLevel:95` e la descrizione dice «banda 95%»; il livello del run resta invariato. |
| 15 | `matchingChartStyle` può selezionare il tile JMP su altre analisi | GLM | MINOR | **Accettato** | La gallery filtra il match con `styleAvailable`; il matcher non cambia firma. |
| 16 | Il refactoring del box residui cambia il filtraggio dei non finiti | GLM | MINOR | **Accettato** | È un miglioramento; annotarlo nel test. |
| 17 | Mancano le chiavi i18n per descrizioni/opzioni | GLM, Luna | MINOR | **Accettato** | Includere tutte le chiavi nel passo 2 e testare il tipo `MessageKey`. |
| 18 | `buildSpec` con dati generici non prova la banda JMP | GLM | MINOR | **Accettato** | Fixture dedicata con `grid`, `seMean`, `sePred`, `stats.df`. |
| 19 | Test di budget con molti gruppi/righe | Luna | MINOR | **Accettato** | Aggiungere un caso con molti gruppi e verificare `fitChartBudget`; i campi aggiunti sono pochi. |
| 20 | Claim «JMP-like» non verificato oltre il Q-Q | Luna | NON VERIFICATO | **Accettato come limite** | La descrizione dice «convenzione JMP-like», non fedeltà pixel-per-pixel; le differenze sono elencate nella tile. |

Nessun BLOCKER resta aperto **nella specifica finale**: i due blocker Luna del
secondo giro sono chiusi dal passo 3 (campi non finiti omessi) e dal passo 5
(`showMeanLine` esplicito). Non c'è stato un terzo giro di critica: il verdetto
formale di Luna resta `REJECT`, ma i suoi blocker sono indirizzati nel piano.

## Verdetto dei critici

- **Luna**: `REJECT` (secondo giro) — «meanLo/meanHi NaN può far scartare
  l'intera riga summary dei gruppi singleton» e «meanY da solo non produce la
  mean line: manca il collegamento a rules e un'opzione scatter». Entrambi sono
  chiusi nella v1 finale (passi 3 e 5), ma non ri-verificati in un terzo giro.
- **GLM**: `APPROVE_WITH_CHANGES` — «il piano ridotto è sostenibile; bloccanti
  solo i due punti ambigui (mean line scatter / p10-p90)». La mean line è stata
  resa esplicita; `p10/p90` sono stati mantenuti perché consumati da
  `whisker:'percentile'`.

**Stato**: piano pronto per l'implementazione, con confidenza **media-alta**;
Luna non ha dato l'assenso formale, GLM sì con modifiche. Le modifiche richieste
da GLM sono state applicate; i blocker di Luna sono chiusi nella specifica.

## Rischi e mitigazioni

| Rischio | Impatto | Mitigazione |
|---|---|---|
| Ambiguità statistica (10-90 vs Tukey, media con IC vs punto) | L'utente crede che i due box siano equivalenti | Descrizione obbligatoria nella tile; nota nel report; default LazStats invariato |
| Dati alternativi assenti | Tile JMP «vuota» o parziale | `requires` + `styleAvailable`; banda actual dichiarata «quando disponibile» |
| `meanLo/Hi` non finiti | Riga summary scartata da `finiteRows` | Omettere i campi se non finiti; test singleton |
| Dimensione modello 120k | Card omessa | Niente `outliersPercentile`, jitter non memorizzato, banda k=1 già nel grid; test budget |
| Default alterato | Regressione visiva su tutte le card | Default factory invariati; test `styles.test` |
| Stile non disponibile applicato dal pre-run | Tile non selezionata ma patch attiva | `patchesFor` fallback al default; `ChartStyles` mostra «Follow global» |
| Naming/brand JMP | Rischio legale/percezione | «JMP-like» nell'UI; nessun logo/colore JMP |
| Accessibilità | Rosso/verde JMP non accessibili | Nessun colore JMP nella gallery; palette esistente |
| Jitter ciclico | Sovrapposizione con molti valori uguali | Ciclo 101, test con valori ripetuti, default false |

## Test e verifica

- **Unit**
  - `src/charts/styles.test.ts`: origine/descrizione, un solo default,
    default = factory, `styleAvailable`, fallback, user styles.
  - `src/charts/defaults.test.ts` / `features.test.ts`: nuove opzioni e
    controlli.
  - `src/charts/kits/common.test.ts`: p10/p90, IC media, singleton, costanti,
    outlier Tukey.
  - `src/charts/vega/boxLayers.test.ts`: baffi percentile, IC media, jitter
    deterministico, default invariato.
  - `src/analyses/regression/run.test.ts`: `meanY`, banda CI su `reg-scatter`,
    `reg-observed-fitted` senza banda ma con mean line.
  - `src/charts/schema.test.ts` / `src/io/project.test.ts`: nuove opzioni
    sopravvivono a parse/reload; stili sconosciuti fallback; nessun bump di
    versione.
- **Compile**
  - `src/charts/vega/buildSpec.test.ts`: ogni stile di ogni kind compila senza
    warning; fixture dedicata per `jmp-regression` con `grid/seMean/sePred`.
- **E2E**
  - `e2e/chart-styles.spec.ts`: badge JMP, descrizione, default selected,
    selezione `jmp-oneway` su ANOVA, selezione `jmp-regression` su regressione,
    insert copy, reload, default invariato.
- **Comandi**
  - `npm run lint`
  - `npm test`
  - `npm run guard`
  - `npm run check`
  - `npx playwright test e2e/chart-styles.spec.ts --project=desktop`
  - `npm run locales:check` (chiavi nuove)

## Criteri di accettazione

1. Il default LazStats di ogni kind è visivamente e funzionalmente invariato;
   `styles.test` continua a verificare default = factory.
2. `jmp-oneway` mostra baffi 10°-90°, media con IC e punti jittered; il box
   Tukey standard resta il default.
3. `jmp-regression` mostra OLS, banda CI 95%, linea della media ed equazione
   breve su `reg-scatter`; su `reg-observed-fitted` la banda è dichiarata non
   disponibile, non simulata.
4. `qq.probability` resta il default e ha badge/descrizione JMP-like; nessun
   nuovo id.
5. Ogni variante JMP ha descrizione e requisiti; una variante non disponibile
   non è selezionata e non viene applicata silenziosamente.
6. Cambiare stile non rilancia l'analisi; `+` inserisce una copia; reload
   conserva opzioni e stile.
7. `npm run check` e l'e2e della gallery sono verdi; nessun golden delle
   tabelle cambia.

## Domande aperte / condizioni per l'assenso

1. **Nome UI**: «JMP-like» è accettabile, o preferisci «Convenzione JMP» /
   «Classico JMP»? Il piano usa «JMP-like» per evitare un claim di fedeltà
   ufficiale.
2. **Banda actual `k >= 2`**: resta fuori v1. Se ti serve subito, va aggiunto un
   passo separato con la formula di `seMean` per il profilo medio e un test di
   copertura.
3. **Colori JMP**: restano fuori dalla gallery. Se vuoi la skin cromatica, è un
   preset separato (`preset: 'jmp'`), non uno stile.
4. **Pannelli compositi** (Distribution/Oneway): restano fuori. Sono la parte
   più «JMP» del libro, ma richiedono una card composita, non una variante di
   kind.
