// Creates an Error instance with an attached HTTP status code.
// Input: message string and optional statusCode number.
// Output: Error object carrying statusCode for middleware handling.
function createValidationError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Validates a transaction payload and throws on the first invalid field.
// Input: payload value expected to be a transaction-like object.
// Output: no return value; throws validation errors when checks fail.
function assertValidTransactionPayload(payload) {
  // A plain object is required because arrays and primitives are invalid request bodies.
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw createValidationError("Body must be a JSON object");
  }

  const { description, amount, type, category, date } = payload;

  if (typeof description !== "string" || description.trim().length < 3) {
    throw createValidationError("description must be a string with at least 3 characters");
  }

  if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
    throw createValidationError("amount must be a number greater than 0");
  }

  if (type !== "income" && type !== "expense") {
    throw createValidationError("type must be either income or expense");
  }

  if (typeof category !== "string" || category.trim().length < 2) {
    throw createValidationError("category must be a string with at least 2 characters");
  }

  if (typeof date !== "string" || Number.isNaN(Date.parse(date))) {
    throw createValidationError("date must be a valid ISO date string");
  }
}

module.exports = {
  createValidationError,
  assertValidTransactionPayload
};
