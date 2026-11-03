import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import { describeP, isDecided, show, showInt } from '../reportKit';
import type { LoglinearStats } from '../loglinear/types';
import type { ReportSpec } from './shared';

const modelName = (model: LoglinearStats['model']): string =>
  model === 'saturated' ? copy('saturo') : copy('di indipendenza');

const alphaText = (level: number): string => (1 - level / 100).toFixed(2);

/** Plain-language reading of a two-way Poisson log-linear model. */
export const loglinearReport = (stats: LoglinearStats, level: number): ReportSpec => {
  const g2 = stats.deviance;
  const df = stats.dfResidual;
  const p = stats.p;
  const saturated = stats.model === 'saturated';
  const significant = !saturated && isDecided(p, level);
  const lowCells = stats.cellsTable.filter(cell => cell.expected < 5).length;

  const notable = stats.coefficients
    .filter(coefficient => coefficient.term !== '(Intercept)')
    .filter(coefficient => Number.isFinite(coefficient.p) && coefficient.p < 1 - level / 100)
    .sort((a, b) => Math.abs(b.beta) - Math.abs(a.beta))
    .slice(0, 4);

  const headline = saturated
    ? copy('Modello saturo: G² = 0 con 0 gradi di libertà, perché le attese coincidono con i conteggi osservati.')
    : Number.isFinite(p) && significant
      ? copy('L’ipotesi di indipendenza non regge (G² = {s1}, df = {s2}, p = {s3}).', {
          s1: fmtEst(g2, 3),
          s2: df,
          s3: fmtP(p),
        })
      : copy('Nessuna evidenza contro l’indipendenza (G² = {s1}, df = {s2}, p = {s3}).', {
          s1: fmtEst(g2, 3),
          s2: df,
          s3: fmtP(p),
        });

  const coefficientBullets =
    notable.length > 0
      ? notable.map(coefficient =>
          copy('{s1}: β = {s2}, exp(β) = {s3} — a parità delle altre categorie il conteggio atteso si moltiplica per {s4}.', {
            s1: coefficient.term,
            s2: show(coefficient.beta, 3),
            s3: show(coefficient.expBeta, 3),
            s4: show(coefficient.expBeta, 3),
          })
        )
      : [
          copy('Nessun coefficiente supera la soglia α = {s1} su scala log: le differenze tra categorie sono compatibili con il rumore campionario.', {
            s1: alphaText(level),
          }),
        ];

  const sections: ReportSpec['sections'] = [
    {
      heading: copy('Che cosa stimano i due modelli'),
      body: [
        copy('Il modello log-lineare tratta il conteggio di ogni cella come una variabile di Poisson e ne modella il logaritmo con effetti additivi. L’indipendenza include solo l’effetto di riga e quello di colonna: se descrive bene la tabella, conoscere la riga non cambia la distribuzione della colonna.'),
        copy('Il modello saturo aggiunge l’interazione riga × colonna, cioè una deviazione dall’indipendenza specifica per ogni combinazione. Con due categorie per lato l’interazione è unica e il suo esponenziale è l’odds ratio della tabella 2×2.'),
        copy('Il modello scelto è {s1}: {s2} parametri stimati su {s3} celle e N = {s4}.', {
          s1: modelName(stats.model),
          s2: stats.coefficients.length,
          s3: stats.cells,
          s4: showInt(stats.n),
        }),
      ],
    },
    {
      heading: copy('Come si leggono i coefficienti'),
      body: [
        copy('I coefficienti vivono sulla scala log: β positivo significa più conteggi attesi della categoria di riferimento, β negativo meno. Il valore exp(β) è il fattore moltiplicativo, quindi exp(β) = 1,5 corrisponde a un atteso maggiore del 50%.'),
        copy('La codifica è a trattamento: la prima riga e la prima colonna sono il riferimento, per cui i loro coefficienti non compaiono. Un coefficiente di riga confronta quella riga con la prima a parità di colonna; un coefficiente di colonna fa lo stesso tra colonne a parità di riga.'),
        copy('I p-value dei singoli coefficienti riguardano quel termine, non l’adattamento complessivo: guarda prima G² e i gradi di libertà, poi i coefficienti per capire dove sta l’effetto.'),
      ],
      bullets: coefficientBullets,
    },
    {
      heading: copy('Bontà di adattamento e G²'),
      body: [
        saturated
          ? copy('Il modello saturo ha un parametro per cella e riproduce i dati: G² vale 0, i gradi di libertà residui sono 0 e non esiste un test di adattamento. Serve come termine di confronto per il modello di indipendenza.')
          : copy('G² = {s1} con {s2} gradi di libertà: {s3}. Più il valore è grande rispetto ai gradi di libertà, più le frequenze osservate si allontanano da quelle previste dall’indipendenza.', {
              s1: show(g2, 3),
              s2: df,
              s3: describeP(p),
            }),
        copy('G² è la statistica del rapporto di verosimiglianza, χ² di Pearson è la somma dei quadrati degli scarti standardizzati. Entrambe sono asintoticamente χ² con gli stessi gradi di libertà e in grandi campioni danno conclusioni simili; G² è additiva tra tabelle annidate, χ² è spesso più intuitiva cella per cella.'),
        copy('La devianza nulla ({s1}) misura la variabilità totale rispetto a un modello con tutte le celle uguali: la differenza tra devianza nulla e G² è quanto riga e colonna spiegano insieme.', {
          s1: show(stats.nullDeviance, 3),
        }),
        lowCells > 0
          ? copy('{s1} celle su {s2} hanno attesa sotto 5: l’approssimazione χ² di G² è fragile e il p-value va letto con cautela.', {
              s1: lowCells,
              s2: stats.cells,
            })
          : copy('Tutte le celle hanno attesa almeno 5: l’approssimazione χ² di G² è adeguata.'),
      ],
    },
  ];

  if (stats.oddsRatio) {
    sections.push({
      heading: copy('Odds ratio dell’interazione'),
      body: [
        copy('Nella tabella 2×2 satura l’unico termine di interazione ha exp(β) = {s1} (CI {s2}%: {s3} – {s4}).', {
          s1: show(stats.oddsRatio.oddsRatio, 3),
          s2: level,
          s3: show(stats.oddsRatio.lo, 3),
          s4: show(stats.oddsRatio.hi, 3),
        }),
        Number.isFinite(stats.oddsRatio.lo) && Number.isFinite(stats.oddsRatio.hi) &&
        stats.oddsRatio.lo <= 1 && stats.oddsRatio.hi >= 1
          ? copy('L’intervallo contiene 1: l’associazione osservata è compatibile con l’indipendenza al livello scelto.')
          : copy('L’intervallo non contiene 1: l’associazione tra riga e colonna è coerente con un’interazione diversa da zero.'),
      ],
    });
  }

  sections.push({
    heading: copy('Limiti di questa analisi'),
    body: [
      copy('Il modello riguarda una sola tabella a due vie: con tre o più fattori servono interazioni di ordine superiore e il modello saturo non basta più.'),
      copy('Il test descrive un’associazione, non una relazione causale: l’ordine riga/colonna è arbitrario e il modello non dice quale variabile influenzi l’altra.'),
    ],
  });

  return {
    id: 'loglinear',
    title: copy('Report del modello log-lineare'),
    headline,
    badge: saturated
      ? copy('Modello saturo')
      : significant
        ? copy('Associazione (interazione)')
        : copy('Indipendenza compatibile'),
    tone: saturated ? 'neutral' : significant ? 'caution' : 'neutral',
    intro: [
      copy('Una tabella a due vie può essere letta come un modello di Poisson sui conteggi delle celle. L’indipendenza impone che l’effetto di riga e quello di colonna si sommino sul logaritmo dell’atteso; il modello saturo lascia che ogni cella abbia la propria deviazione.'),
      copy('La domanda statistica è se l’interazione riga × colonna sia necessaria: se non lo è, le due variabili categoriche sono compatibili con l’indipendenza.'),
    ],
    sections,
    limitations: [
      copy('Una sola tabella a due vie: per tre o più fattori servono interazioni di ordine superiore.'),
      copy('Celle con attese piccole rendono fragile l’approssimazione χ² di G² e dei p-value dei coefficienti.'),
      copy('Il modello assume conteggi indipendenti; misure ripetute o osservazioni raggruppate violano questa assunzione.'),
      copy('Un’associazione significativa non implica causalità né una direzione dell’effetto.'),
    ],
  };
};
