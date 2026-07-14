function createValidationError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function assertValidTransactionPayload(payload) {
  // I am checking for a plain object because beginners often send arrays or empty values by accident.
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
