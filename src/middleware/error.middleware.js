function notFoundHandler(req, res) {
  // Unknown routes get a predictable JSON response.
  // Input: any request that bypasses registered endpoints.
  // Output: HTTP 404 with an error message.
  res.status(404).json({
    error: "Route not found"
  });
}

function errorHandler(error, req, res, next) {
  // Errors are normalized into one response shape for clients.
  // Input: error object plus Express req/res/next.
  // Output: HTTP error response with a consistent JSON body.
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
