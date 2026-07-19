const service = require("../services/transaction.service");

// Shared wrapper keeps async controller errors flowing into Express error middleware.
// Input: a controller handler with signature (req, res).
// Output: wrapped async handler that forwards caught errors to next(error).
function asyncHandler(handler) {
  return async function wrappedHandler(req, res, next) {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

// Lists all stored transactions for the API response.
// Input: Express req/res objects.
// Output: HTTP 200 with { data: Transaction[] }.
const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await service.getAll();
  res.json({ data: transactions });
});

// Looks up a single transaction by route id.
// Input: req.params.id string.
// Output: HTTP 200 with { data: Transaction } when found.
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await service.getById(req.params.id);
  res.json({ data: transaction });
});

// Creates a new transaction from the request body.
// Input: req.body transaction payload.
// Output: HTTP 201 with { data: createdTransaction }.
const createTransaction = asyncHandler(async (req, res) => {
  const created = await service.create(req.body);
  res.status(201).json({ data: created });
});

// Replaces fields of an existing transaction by id.
// Input: req.params.id and req.body payload.
// Output: HTTP 200 with { data: updatedTransaction }.
const updateTransaction = asyncHandler(async (req, res) => {
  const updated = await service.update(req.params.id, req.body);
  res.json({ data: updated });
});

// Deletes one transaction identified by route id.
// Input: req.params.id string.
// Output: HTTP 204 with no response body.
const deleteTransaction = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.status(204).send();
});

// Returns aggregate totals and category breakdown.
// Input: Express req/res objects.
// Output: HTTP 200 with { data: summaryObject }.
const getSummary = asyncHandler(async (req, res) => {
  const summary = await service.getSummary();
  res.json({ data: summary });
});

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary
};
