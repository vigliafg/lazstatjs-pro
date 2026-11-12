# `lazstats batch`

Esegue più job, ognuno nella propria directory, usando lo stesso percorso di `run`.

```bash
lazstats batch --jobs jobs.json --out results
lazstats batch --jobs jobs.json --out results --concurrency 4 --continue-on-error
```

Formato del file:

```json
{
  "jobs": [
    {
      "id": "descriptive-iris",
      "data": "samples/descriptive/iris/data.csv",
      "analysis": "descriptive",
      "set": { "descVars": ["Sepal.Length", "Sepal.Width"] },
      "ciLevel": 95,
      "timeout": 120
    }
  ]
}
```

`id` è obbligatorio, unico e sicuro come nome di directory. Ogni job richiede `data` oppure `project`. `set` è un oggetto; gli array diventano liste separate da virgola. `--concurrency` va da 1 a 64 (default 2). Senza `--continue-on-error` i job non ancora avviati vengono marcati `skipped`.

Output: `<out>/<id>/result.json` oppure `<out>/<id>/failure.json`. Vedi il [riferimento](../riferimento.md).
