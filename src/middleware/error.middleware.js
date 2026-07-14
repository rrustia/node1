function notFoundHandler(req, res) {
  // I am returning JSON for unknown routes so client apps always receive a predictable format.
  res.status(404).json({
    error: "Route not found"
  });
}

function errorHandler(error, req, res, next) {
  // I am normalizing every thrown error into one response shape to make debugging easier.
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    error: message
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
