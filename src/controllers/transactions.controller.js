const service = require("../services/transaction.service");

// I am wrapping each async controller method with a shared helper so errors flow to next().
function asyncHandler(handler) {
  return async function wrappedHandler(req, res, next) {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await service.getAll();
  res.json({ data: transactions });
});

const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await service.getById(req.params.id);
  res.json({ data: transaction });
});

const createTransaction = asyncHandler(async (req, res) => {
  const created = await service.create(req.body);
  res.status(201).json({ data: created });
});

const updateTransaction = asyncHandler(async (req, res) => {
  const updated = await service.update(req.params.id, req.body);
  res.json({ data: updated });
});

const deleteTransaction = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  res.status(204).send();
});

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
