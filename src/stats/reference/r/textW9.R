#!/usr/bin/env Rscript
#
# Reference fixture for the text-mining kernel.
#
# Tokenisation, TF-IDF and cosine similarity are reimplemented in base R with
# the same rules as the kernel. The LDA topic model is compared separately
# with the scikit-learn variational reference (python/textLdaW9.py).
#
# Run from the repository root:
#   Rscript src/stats/reference/r/textW9.R

suppressPackageStartupMessages(library(jsonlite))

documents <- c(
  "model data regression estimate sample variable model",
  "patient treatment clinical trial dose outcome patient",
  "market price customer demand product sales market",
  "regression model estimate sample data variable regression",
  "clinical trial patient dose treatment outcome trial",
  "price demand market product customer sales price",
  "data model sample regression estimate model data",
  "treatment patient outcome clinical dose trial patient",
  "product price sales market demand customer product",
  "variable estimate regression model sample data estimate",
  "dose outcome patient trial clinical treatment dose",
  "sales customer product price market demand sales"
)

tokenize <- function(text) {
  text <- tolower(text)
  text <- gsub("[^[:alnum:][:space:]]", " ", text)
  tokens <- unlist(strsplit(text, "[[:space:]]+"))
  tokens <- tokens[nchar(tokens) >= 2]
  tokens[!grepl("^[0-9]+$", tokens)]
}

tokens <- lapply(documents, tokenize)
counts <- table(unlist(tokens))
counts <- sort(counts, decreasing = TRUE)
terms <- names(counts)[1:15]

matrix_counts <- t(vapply(tokens, function(words) {
  vapply(terms, function(term) sum(words == term), numeric(1))
}, numeric(length(terms))))

document_frequency <- colSums(matrix_counts > 0)
idf <- log((1 + length(documents)) / (1 + document_frequency)) + 1
tfidf <- matrix_counts
for (row in 1:nrow(tfidf)) {
  norm <- sqrt(sum(tfidf[row, ]^2))
  tfidf[row, ] <- if (norm > 0) tfidf[row, ] / norm * idf else tfidf[row, ]
}
average_tfidf <- colMeans(tfidf)

cosine <- function(a, b) {
  denominator <- sqrt(sum(a^2) * sum(b^2))
  if (denominator == 0) 0 else sum(a * b) / denominator
}
similarity <- matrix(1, length(documents), length(documents))
for (i in 1:(length(documents) - 1)) {
  for (j in (i + 1):length(documents)) {
    similarity[i, j] <- cosine(tfidf[i, ], tfidf[j, ])
    similarity[j, i] <- similarity[i, j]
  }
}

result <- list(
  source = "Base R tokenisation/TF-IDF/cosine and NMF::nmf(method='lee')",
  documents = documents,
  terms = terms,
  counts = as.numeric(counts[terms]),
  documents_per_term = as.numeric(document_frequency),
  idf = as.numeric(idf),
  average_tfidf = as.numeric(average_tfidf),
  similarity = similarity
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/textW9.json"
)
