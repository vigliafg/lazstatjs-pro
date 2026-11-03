#!/usr/bin/env python3
"""Reference fixture for the LDA topic model.

scikit-learn fits LDA by variational inference; the kernel uses collapsed
Gibbs. Both estimate the same model, so the comparison is on the perplexity
level and on the recovery of the three generating vocabularies, not on the
individual topic labels.

Run from the repository root:
    python src/stats/reference/python/textLdaW9.py
"""
import json
import re
from collections import Counter
from pathlib import Path

import numpy as np
from sklearn.decomposition import LatentDirichletAllocation

ROOT = Path(__file__).resolve().parents[4]
FIXTURE = ROOT / "src/stats/reference/fixtures/textW9.json"

documents = json.loads(FIXTURE.read_text())["documents"]


def tokenize(text: str) -> list[str]:
    text = re.sub(r"[^0-9A-Za-zÀ-ÿ\s]", " ", text.lower())
    return [
        token
        for token in text.split()
        if len(token) >= 2 and not token.isdigit()
    ]


tokens = [tokenize(document) for document in documents]
counts = Counter(token for document in tokens for token in document)
vocabulary = [
    term
    for term, _ in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:15]
]
index = {term: position for position, term in enumerate(vocabulary)}
matrix = np.zeros((len(documents), len(vocabulary)), dtype=np.int64)
for row, document in enumerate(tokens):
    for term in document:
        if term in index:
            matrix[row, index[term]] += 1

model = LatentDirichletAllocation(
    n_components=3,
    random_state=20261113,
    max_iter=300,
    learning_method="batch",
)
model.fit(matrix)
perplexity = float(model.perplexity(matrix))
topics = []
for topic, weights in enumerate(model.components_):
    order = np.argsort(weights)[::-1][:10]
    topics.append(
        {
            "topic": topic + 1,
            "prevalence": float(model.transform(matrix)[:, topic].mean()),
            "terms": [vocabulary[position] for position in order],
        }
    )

result = {
    "source": "scikit-learn LatentDirichletAllocation (variational inference)",
    "documents": documents,
    "vocabulary": vocabulary,
    "topics": topics,
    "perplexity": perplexity,
}
FIXTURE.with_name("textLdaW9.json").write_text(json.dumps(result, indent=2))
print(f"perplexity {perplexity:.3f}")
