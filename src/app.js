const express = require("express");
const path = require("path");

const transactionsRouter = require("./routes/transactions.routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(express.static(path.join(__dirname, "../public")));

// Express JSON middleware parses incoming JSON bodies for later route handlers.
// Input: HTTP requests with JSON payloads.
// Output: req.body contains parsed JavaScript values.
app.use(express.json());

// Transaction routes are mounted under a stable API path.
// Input: requests targeting /api/transactions.
// Output: request flow is delegated to the transactions router.
app.use("/api/transactions", transactionsRouter);

// A quick health handler confirms that the service is reachable.
// Input: GET /api/health request.
// Output: a small JSON status response.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Service is running"
  });
});

// The app root serves the browser dashboard for direct visits.
// Input: GET / request.
// Output: the single-page transaction dashboard.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Unknown routes are handled with a consistent JSON not-found response.
// Input: requests that do not match registered routes.
// Output: HTTP 404 with an error payload.
app.use(notFoundHandler);

// The global error middleware stays last so it can catch prior failures.
// Input: errors passed through next(error) or thrown in async flows.
// Output: normalized JSON error response.
app.use(errorHandler);

module.exports = app;
