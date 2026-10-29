# Glossario vincolante delle traduzioni

Terminologia condivisa da interfaccia, manuale e report. Le traduzioni devono
usare **la stessa parola per lo stesso concetto** in tutta l'applicazione; se un
termine manca, va aggiunto qui prima di essere usato.

- Numeri: punto decimale (12.5), nessuna conversione locale nei report.
- Unità e simboli (N, SD, SE, CI, p, α, η², R², OR, HR) restano invariati.
- Tono: impersonale o seconda persona coerente; niente gergo non spiegato.
- I messaggi sorgente sono in inglese (`src/i18n/catalog/en/`) e italiano per i
  report (`copy('frase italiana')`): le chiavi non si traducono mai.

| Concetto | en | it | fr | es | de | pt-PT |
|---|---|---|---|---|---|---|
| media | mean | media | moyenne | media | Mittelwert | média |
| mediana | median | mediana | médiane | mediana | Median | mediana |
| deviazione standard | standard deviation | deviazione standard | écart-type | desviación estándar | Standardabweichung | desvio-padrão |
| errore standard | standard error | errore standard | erreur standard | error estándar | Standardfehler | erro padrão |
| intervallo di confidenza | confidence interval | intervallo di confidenza | intervalle de confiance | intervalo de confianza | Konfidenzintervall | intervalo de confiança |
| p-value | p-value | p-value | valeur p | valor p | p-Wert | valor p |
| ipotesi nulla | null hypothesis | ipotesi nulla | hypothèse nulle | hipótesis nula | Nullhypothese | hipótese nula |
| livello di significatività | significance level | livello di significatività | seuil de signification | nivel de significación | Signifikanzniveau | nível de significância |
| dimensione dell'effetto | effect size | dimensione dell'effetto | taille d'effet | tamaño del efecto | Effektstärke | tamanho do efeito |
| potenza | power | potenza | puissance | potencia | Power | potência |
| numerosità campionaria | sample size | numerosità campionaria | taille d'échantillon | tamaño de la muestra | Stichprobengröße | dimensão da amostra |
| assunzione | assumption | assunzione | hypothèse | supuesto | Annahme | pressuposto |
| normalità | normality | normalità | normalité | normalidad | Normalität | normalidade |
| omoschedasticità | homoscedasticity | omoschedasticità | homoscédasticité | homocedasticidad | Homoskedastizität | homocedasticidade |
| valore anomalo | outlier | valore anomalo | valeur aberrante | valor atípico | Ausreißer | valor atípico |
| quantile | quantile | quantile | quantile | cuantil | Quantil | quantil |
| regressione | regression | regressione | régression | regresión | Regression | regressão |
| coefficiente | coefficient | coefficiente | coefficient | coeficiente | Koeffizient | coeficiente |
| predittore | predictor | predittore | prédicteur | predictor | Prädiktor | preditor |
| variabile dipendente | dependent variable | variabile dipendente | variable dépendante | variable dependiente | abhängige Variable | variável dependente |
| odds ratio | odds ratio | odds ratio | odds ratio | odds ratio | Odds Ratio | odds ratio |
| hazard ratio | hazard ratio | hazard ratio | hazard ratio | hazard ratio | Hazard Ratio | hazard ratio |
| sopravvivenza | survival | sopravvivenza | survie | supervivencia | Überleben | sobrevivência |
| censura | censoring | censura | censure | censura | Zensierung | censura |
| correlazione | correlation | correlazione | corrélation | correlación | Korrelation | correlação |
| rango | rank | rango | rang | rango | Rang | posto |
| permutazione | permutation | permutazione | permutation | permutación | Permutation | permutação |
| bootstrap | bootstrap | bootstrap | bootstrap | bootstrap | Bootstrap | bootstrap |
| imputazione | imputation | imputazione | imputation | imputación | Imputation | imputação |
| confronto post-hoc | post-hoc comparison | confronto post-hoc | comparaison post-hoc | comparación post-hoc | Post-hoc-Vergleich | comparação post-hoc |
| interazione | interaction | interazione | interaction | interacción | Interaktion | interação |
| fattore | factor | fattore | facteur | factor | Faktor | fator |
| livello | level | livello | niveau | nivel | Stufe | nível |
| residuo | residual | residuo | résidu | residuo | Residuum | resíduo |
| asimmetria | skewness | asimmetria | asymétrie | asimetría | Schiefe | assimetria |
| curtosi | kurtosis | curtosi | aplatissement | curtosis | Kurtosis | curtose |
| modello misto | mixed model | modello misto | modèle mixte | modelo mixto | gemischtes Modell | modelo misto |
| non parametrico | non-parametric | non parametrico | non paramétrique | no paramétrico | nicht parametrisch | não paramétrico |
| misure appaiate | paired measures | misure appaiate | mesures appariées | medidas emparejadas | gepaarte Messungen | medidas emparelhadas |
| campioni indipendenti | independent samples | campioni indipendenti | échantillons indépendants | muestras independientes | unabhängige Stichproben | amostras independentes |
| test a una coda | one-sided test | test a una coda | test unilatéral | test unilateral | einseitiger Test | teste unilateral |
| test a due code | two-sided test | test a due code | test bilatéral | test bilateral | zweiseitiger Test | teste bilateral |
| margine di equivalenza | equivalence margin | margine di equivalenza | marge d'équivalence | margen de equivalencia | Äquivalenzmarge | margem de equivalência |
| saturazione | loading | saturazione | saturation | saturación | Ladung | saturação |
| affidabilità | reliability | affidabilità | fiabilité | fiabilidad | Reliabilität | fiabilidade |
| accordo | agreement | accordo | concordance | concordancia | Übereinstimmung | concordância |
| tabella di contingenza | contingency table | tabella di contingenza | table de contingence | tabla de contingencia | Kontingenztabelle | tabela de contingência |
| prova esatta | exact test | test esatto | test exact | prueba exacta | exakter Test | teste exato |

## Regole di stile

- **en**: sentence case per i titoli delle sezioni, imperativo diretto, "you"
  solo quando serve; numeri e simboli invariati.
- **fr**: seconda persona plurale ("vous"), frasi brevi, virgolette « » nel testo
  libero; nei report mantenere i simboli matematici.
- **es**: seconda persona singolare ("tú") o impersonale con "se"; evitare
  regionalismi; "ordenador" non serve, il dominio è statistico.
- **de**: "Sie", sostantivi con iniziale maiuscola, frasi brevi; evitare
  anglicismi quando esiste il termine tedesco (ma "Odds Ratio"/"Hazard Ratio"
  restano, come da tabella).
- **pt-PT**: portoghese europeo, "utilizador", "ecrã", "ficheiro"; gerundio
  evitato, infinitivo personale quando naturale; "você" solo se indispensabile.

## Come si aggiunge una lingua

1. `src/i18n/catalog/<locale>/` con le stesse chiavi di `en/` (il tipo
   `Record<keyof typeof enMessages, string>` non compila se ne manca una).
2. `src/help/content/<locale>/` con gli stessi `id` di `content/en/`.
3. `src/stats/reportCopy/catalog/<locale>/` con le stesse chiavi di `en/`
   (msgid italiani identici, segnaposto `{s1}` identici).
4. Registrare la lingua in `ACTIVE_LOCALES`, `BOOKS`, `TRANSLATED_REPORT_LOCALES`
   e `REPORT_LOCALES` solo quando i test di parità sono verdi.
