#!/usr/bin/env Rscript
#
# Reference fixture for the machine-learning kernel.
#
# Random forest, gradient boosting and the neural network are stochastic and
# use different internal optimisers, so the reference pins the error level and
# the importance ranking, not the individual tree weights.
#
# Run from the repository root:
#   Rscript src/stats/reference/r/mlW9.R

suppressPackageStartupMessages({
  library(randomForest)
  library(gbm)
  library(nnet)
  library(jsonlite)
})

set.seed(20261114)
n <- 80
x1 <- round(runif(n, -2, 2), 4)
x2 <- round(rnorm(n), 4)
x3 <- round(runif(n, 0, 3), 4)
y <- round(3 + 2 * x1 + 2 * sin(2 * x2) + 0.6 * x2 * x3 + rnorm(n, 0, 0.7), 4)
data <- data.frame(X1 = x1, X2 = x2, X3 = x3, Y = y)

set.seed(20261114)
forest <- randomForest(Y ~ ., data = data, ntree = 200, mtry = 2, nodesize = 5, importance = TRUE)
forest_prediction <- as.numeric(forest$predicted)
forest_r2 <- 1 - mean((data$Y - forest_prediction)^2) / var(data$Y)

set.seed(20261114)
boosting <- gbm(Y ~ ., data = data, distribution = "gaussian", n.trees = 200,
                shrinkage = 0.05, interaction.depth = 2, n.minobsinnode = 5,
                bag.fraction = 1, train.fraction = 1)
boosting_prediction <- as.numeric(predict(boosting, newdata = data, n.trees = 200))
boosting_rmse <- sqrt(mean((data$Y - boosting_prediction)^2))

set.seed(20261114)
network <- nnet(Y ~ ., data = data, size = 4, linout = TRUE, decay = 0,
                maxit = 500, trace = FALSE)
network_prediction <- as.numeric(predict(network, newdata = data))
network_rmse <- sqrt(mean((data$Y - network_prediction)^2))

importance <- as.numeric(importance(forest, type = 1)[, 1])
names(importance) <- rownames(importance(forest, type = 1))

result <- list(
  source = "randomForest + gbm + nnet",
  data = data,
  forest = list(
    r2 = forest_r2,
    rmse = sqrt(mean((data$Y - forest_prediction)^2)),
    importance = as.numeric(importance),
    names = names(importance)
  ),
  boosting = list(rmse = boosting_rmse, r2 = 1 - mean((data$Y - boosting_prediction)^2) / var(data$Y)),
  nnet = list(rmse = network_rmse, r2 = 1 - mean((data$Y - network_prediction)^2) / var(data$Y))
)

writeLines(
  toJSON(result, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  "src/stats/reference/fixtures/mlW9.json"
)
