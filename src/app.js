const express = require("express");

const transactionsRouter = require("./routes/transactions.routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");

const app = express();

// I am enabling JSON parsing so incoming request bodies become normal JavaScript objects.
// I do this early so every route can safely read req.body without manual parsing.
app.use(express.json());

// I am mounting the feature routes under /api so the URL structure stays consistent.
app.use("/api/transactions", transactionsRouter);

// I am adding a simple health endpoint to quickly confirm that my server is alive.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Service is running"
  });
});

// I am using a dedicated not found handler so unknown routes return a friendly JSON response.
app.use(notFoundHandler);

// I am placing the error handler at the end so it can catch errors from all previous middleware.
app.use(errorHandler);

module.exports = app;
