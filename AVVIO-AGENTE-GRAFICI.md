# Avvio agente — Grafici delle procedure

Leggi questo file per primo. Contiene le istruzioni operative per iniziare a
lavorare sul piano.

## Contesto

- Repository: `/home/vigliafg/Documenti/GitHub/lazstatjs-pro`
- Piano: `2026-11-03-grafici-procedure-piano.md` (in radice; copia in
  `docs/plans/`)
- Documento di stato: `2026-11-03-grafici-procedure-stato.md` (in radice; copia
  in `docs/plans/`)

## Regole vincolanti

1. Sei l'unico scrittore: non usare subagenti che modificano file.
2. Crea il branch `grafici-procedure` da `main`.
3. Leggi solo §0, §0.1, §1, §3, §4, §5, §6 del piano e la sezione della fase
   che devi eseguire. Non rileggere tutto il piano.
4. Una fase alla volta, nell'ordine. Nessuna fase deve superare 60 minuti.
   Hai 4 ore al giorno e una deadline di 10 giorni lavorativi.
5. Dopo ogni fase: test mirati verdi, aggiorna il documento di stato (fase,
   commit, test, decisioni, prossimi 3 passi) e committa con
   `feat(charts): <fase> <cosa>`. Non dichiarare verde una fase con test rossi.
6. Non toccare kernel, report, form o parametri se la fase non lo richiede.
   Non creare nuovi kind se basta uno esistente.
7. Se un dato non è disponibile, non inventarlo: helper puro con test oppure
   grafico rinviato, e annotalo nello stato.
8. Non committare i PDF `jmp*.pdf`: sono non tracciati e non fanno parte del
   lavoro.
9. `npm run check` completo solo a fine ondata; durante le fasi usa i test
   mirati indicati nel piano.

## Primo compito

Inizia da **F0.1 — Inventario, guardrail, stato**.

Esegui solo F0.1, poi fermati e riporta:

- file cambiati;
- test eseguiti ed esito;
- commit creato;
- prossimi 3 passi.

## Riferimento rapido

- Comandi di base: piano §0.
- Come leggere il piano senza sprecare contesto: piano §0.1.
- Matrice dei grafici e fasi: piano §6 e §7.
- Procedura standard per aggiungere un grafico: piano §8.
- Test e gate: piano §11.
- Traduzioni e help: piano §12.
- Checkpoint e handoff: piano §13 e documento di stato.
