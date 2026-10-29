# Audit form e parametri delle procedure

Data: 2026-10-29. Perimetro: 31 form in `src/analyses/*/Form.tsx`,
`AnalysisOptions`, `FormFields`, `roles.ts`, `LevelsEditor`.

## Copertura

- `e2e/forms.spec.ts`: apre tutte le 31 procedure e verifica id unici, controlli
  con nome accessibile, assenza di overflow orizzontale nel pannello setup.
- Test specifici: selezione duplicata disabilitata, livelli di gruppo presenti
  nelle procedure che usano un gruppo, CI assente dove il runner la ignora.
- Screenshot: `test-results/forms-audit/<id>.png` e `contact-sheet.png`.
- `npm test`: 555 test verdi. `npm run test:e2e`: 84 passati, 70 skip.

## Correzioni applicate

### Gruppi

- Nuovo componente unico `GroupSelect`:
  - filtra con `groupColumnIndexes` / `isGroupColumn`;
  - mostra l’empty state “No grouping variables…";
  - supporta `None`;
  - supporta un fallback esplicito per il valore corrente non più valido;
  - espone `LevelsEditor` in modo uniforme;
  - supporta `disabledValues`.
- Usato da ANOVA, ANCOVA, Factorial, Survival, Stratified Cox, LMM, GEE,
  Mixed ANOVA, Resampling, Non-parametric RM e Wizard.
- LMM, GEE, Mixed ANOVA, Resampling e Stratified Cox ora hanno **Edit levels**
  accanto al gruppo/cluster/stratum.
- ANOVA conserva il fallback “(numeric)” per il gruppo corrente non valido.
- Survival, Stratified Cox e Wizard usano `None`; gli altri gruppi restano
  obbligatori.

### Duplicati

- `VariableSelect`/`GroupSelect` supportano `disabledValues`.
- Impedita la stessa colonna in:
  - T-Test e TOST (`var1 = var2`);
  - Factorial ANOVA (`factorA = factorB`);
  - Cox, Survival e Parametric (`time = event`);
  - Time-dependent Cox (`start`, `stop`, `event`);
  - McNemar (`left = right`);
  - Resampling (`outcome = group`);
  - Wizard (`outcome`, `group`, `second`);
  - Stratified Cox (`stratum` = time/event).
- Regressione: la dipendente è esclusa dai predittori e viene rimossa dagli
  `indeps` quando cambia.

### Ruoli

- I label dei ruoli sono ora localizzati: `analysisLabel(id)` + suffisso
  tradotto (`dependent variable`, `group variable`, `predictors`, …).
- Test aggiornati per il caso inglese.
- Ordine di Stratified Cox allineato al form:
  `time, event, stratum, covariates`.
- Il ruolo `group` resta validato con `validateRoleTypes` e blocca Run.

### Input numerici

- Sample Size usa il `NumberField` condiviso: eliminata la copia locale.
- Resampling e Multivariate usano `NumberField` invece di input raw con
  `parseInt`/`parseFloat`.
- `NumberField` ora segnala anche i valori fuori da `min`/`max`, non solo
  `NaN`.
- I campi numerici mantengono `aria-invalid` e alert visibile.

### Layout e accessibilità

- Rimossi i `Field` che avvolgevano un `CheckboxField`:
  - Factorial ANOVA “Model”;
  - Logistic “Penalization”;
  - Multivariate “Matrix”.
- Chi-Square e Contingency non usano più un `<label>` attorno alla tabella:
  il titolo è un semplice heading.
- Wizard: il gruppo usa `GroupSelect` direttamente, senza `Field` esterno
  duplicato.
- Tutte le `VariableList` hanno un `emptyText` (`No numeric columns`, ecc.).
- La sezione **Confidence level** è nascosta per Descriptive e Sample Size,
  dove `ciLevel` non è usato dal runner.

## Limiti residui

- `Advanced` resta nascosto in Guided senza un hint: le opzioni avanzate
  (per esempio Theil–Sen in Regressione) sono attive ma non visibili.
- I `min`/`max` sono validati visivamente nel `NumberField`, ma il valore
  digitato resta nel parametro finché l’utente non lo corregge; i builder
  continuano a fare i propri controlli.
- Se un progetto salvato contiene già due ruoli uguali, il select mostra
  l’opzione disabilitata ma non rinumera automaticamente i parametri.
- L’empty state dei gruppi spiega come creare una variabile di gruppo, ma non
  offre un pulsante “converti in cat” direttamente nel form.
- `roles.ts` conserva le stringhe inglesi come fallback/sorgente; la
  localizzazione avviene al momento della visualizzazione.
- I test strutturali coprono il desktop a 300 px; il layout mobile dei singoli
  form non ha una matrice visuale dedicata.

## File modificati

- `src/components/FormFields.tsx` — `GroupSelect`, `disabledValues`,
  validazione range.
- `src/analyses/*/Form.tsx` — uso di `GroupSelect`, duplicati, empty state,
  CheckboxField, NumberField.
- `src/ui/analysis/AnalysisOptions.tsx` — CI condizionale, props livelli.
- `src/analyses/roles.ts` — label localizzati, ordine Stratified Cox.
- `e2e/forms.spec.ts` — audit strutturale e test mirati.
