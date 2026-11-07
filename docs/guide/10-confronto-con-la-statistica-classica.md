# 10 — Confronto con la statistica classica

**Cosa copre.** Come l'app si colloca rispetto a JMP, SPSS e R, e come si
documenta il confronto senza promettere una parità che non è stata verificata.

## Indice

- [Il metodo](#il-metodo)
- [Cosa coincide](#cosa-coincide)
- [Cosa differisce](#cosa-differisce)
- [La regola](#la-regola)
- [Punti di forza](#punti-di-forza)

## Il metodo

Il confronto non si fa a memoria. Si prende lo stesso dataset, si esegue la
stessa procedura nei due programmi e si confrontano le tabelle voce per voce e i
grafici tipo per tipo. I risultati restano in `docs/analysis/`, con un
inventario delle tabelle per tutte le procedure, un dettaglio sul modello
lineare, un confronto dei grafici e un documento che allarga il confronto agli
altri programmi.

## Cosa coincide

Le analisi di base — medie e intervalli, test, analisi della varianza,
regressione, sopravvivenza — seguono le convenzioni classiche: stesse quantità,
stessi risultati di riferimento, stessi nomi delle procedure per chi viene da
JMP o SPSS. Le differenze, quando ci sono, sono documentate e non nascoste.

L'ordine delle cose è pensato per chi arriva da un altro programma: si cerca la
procedura con il nome che si conosce, si ritrovano le stesse voci nelle tabelle
e la guida in-app spiega quando usarle e quando no.

## Cosa differisce

- La prosa è scritta per essere letta, non per imitare le frasi del programma di
  riferimento.
- Alcune impostazioni iniziali sono diverse — livello di confidenza, gestione
  dei mancanti, modello non lineare predefinito — e sono scelte dichiarate,
  spiegate dove servono.
- Alcune procedure hanno un perimetro più stretto o più largo del programma
  classico, e il documento di confronto lo dice esplicitamente.

## La regola

Un confronto si pubblica solo se è stato misurato. Se una procedura non è ancora
confrontata, lo si scrive; non si lascia intendere una parità verificata. Lo
stesso criterio vale per le note di rilascio: ciò che è cambiato nel confronto è
ciò che l'utente deve sapere.

## Punti di forza

- **La fiducia si costruisce con le prove.** Ogni affermazione di somiglianza
  con i programmi classici ha dietro un confronto eseguito e un documento che lo
  riporta.
- **L'idea è misurare, non dichiarare.** Il confronto è un lavoro ripetibile:
  stesso dataset, stessa procedura, stesso elenco di voci da verificare.
- **Rassicura chi arriva da altri programmi, senza chiedergli di fidarsi.** Chi
  conosce JMP o SPSS ritrova nomi e risultati attesi e trova scritto dove l'app
  si comporta diversamente; chi ha meno esperienza legge la prosa e la guida,
  senza dover conoscere il programma di riferimento.

**Cosa non copre.** I dettagli delle singole procedure: la guida in-app
([09](09-lingue-help-e-terminologia.md)) e i documenti di `docs/analysis/`.

**Fonti nel codice e nei documenti.** `docs/analysis/`, `samples/`, la guida
in-app `src/help/content/`.

**Vedi anche.** [`docs/ADVANCED-ROADMAP.md`](../ADVANCED-ROADMAP.md).
