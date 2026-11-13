# LazStats CLI

La CLI `lazstats` usa lo stesso motore dell'app e dell'MCP. Non avvia l'interfaccia, non usa la rete e produce un envelope JSON o un report renderizzato.

## Installazione da release

```bash
npm install -g ./lazstats-<versione>.tgz
lazstats --help
```

Il tarball è allegato alla release GitHub e richiede Node.js 22.12+. Non è un binario nativo: installa il bundle ESM e il comando `lazstats` nel prefix npm.

## Build e avvio

```bash
npm run build:cli
node dist-cli/lazstats.mjs --help
```

In sviluppo, senza build:

```bash
npm run cli -- --help
```

Il comando installato dal pacchetto è `lazstats`; il bundle è `dist-cli/lazstats.mjs` con il worker sibling `worker-entry.mjs`. Per creare il tarball: `npm run pack:cli`; per verificarlo con installazione temporanea: `npm run smoke:cli:package`.

## Quickstart

```bash
# catalogo
lazstats analyses --json

# contratto di una procedura
lazstats schema descriptive --json

# colonne e tipi
lazstats inspect samples/descriptive/iris/data.csv --json

# esecuzione
lazstats run \
  --data samples/descriptive/iris/data.csv \
  --analysis descriptive \
  --set descVars=Sepal.Length,Sepal.Width \
  --json

# report HTML
lazstats run \
  --data samples/descriptive/iris/data.csv \
  --analysis descriptive \
  --format html \
  --out report.html
```

## Comandi

| Comando | Uso |
| --- | --- |
| [`analyses`](comandi/analyses.md) | Catalogo delle procedure eseguibili |
| [`schema`](comandi/schema.md) | Ruoli, default ed esempio di una procedura |
| [`inspect`](comandi/inspect.md) | Metadati, colonne e preview di un dataset |
| [`run`](comandi/run.md) | Esecuzione da dataset o progetto |
| [`project`](comandi/project.md) | Ispezione e run di un file `.lzs` |
| [`batch`](comandi/batch.md) | Più job in directory separate |
| [`render`](comandi/render.md) | Render di un envelope JSON già prodotto |

## Guida agente

Il flusso consigliato a un agente è:

1. `analyses --json`
2. `schema <id> --json`
3. `inspect <file> --json`
4. `run ... --json`
5. `render --result result.json ...` solo se serve un formato umano.

Leggi [`guida-agente.md`](guida-agente.md) per precedenze dei parametri, envelope, batch ed errori. Il [`riferimento.md`](riferimento.md) è generato dal catalogo usato dal parser.

## Help

```bash
lazstats --help
lazstats help run
lazstats run --help
lazstats help run --json
lazstats run --help --json
```

L'help testuale è pensato per il terminale; `--json` produce un contratto stabile su stdout. L'help non esegue analisi e non richiede gli argomenti obbligatori del comando.
