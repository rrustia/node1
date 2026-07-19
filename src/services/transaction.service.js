const { randomUUID } = require("crypto");

const repository = require("../repositories/transaction.repository");
const { createValidationError, assertValidTransactionPayload } = require("../utils/validators");

// Retrieves all transactions ordered by most recent date first.
// Input: no arguments.
// Output: Promise resolving to a sorted Transaction[] list.
async function getAll() {
  const transactions = await repository.readAll();

  // Latest entries appear first for easier API consumption.
  return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Finds one transaction by identifier.
// Input: id string.
// Output: Promise resolving to a Transaction object or throws 404 validation error.
async function getById(id) {
  const transactions = await repository.readAll();
  const found = transactions.find((transaction) => transaction.id === id);

  if (!found) {
    throw createValidationError("Transaction not found", 404);
  }

  return found;
}

// Validates and stores a new transaction record.
// Input: payload object with description, amount, type, category, and date.
// Output: Promise resolving to the created Transaction object.
async function create(payload) {
  assertValidTransactionPayload(payload);

  const transactions = await repository.readAll();
  const transaction = {
    id: randomUUID(),
    description: payload.description.trim(),
    amount: payload.amount,
    type: payload.type,
    category: payload.category.trim(),
    date: new Date(payload.date).toISOString()
  };

  transactions.push(transaction);
  await repository.writeAll(transactions);

  return transaction;
}

// Validates payload and updates one existing transaction.
// Input: id string and payload object.
// Output: Promise resolving to the updated Transaction object.
async function update(id, payload) {
  assertValidTransactionPayload(payload);

  const transactions = await repository.readAll();
  const index = transactions.findIndex((transaction) => transaction.id === id);

  if (index === -1) {
    throw createValidationError("Transaction not found", 404);
  }

  const existing = transactions[index];
  const updated = {
    ...existing,
    description: payload.description.trim(),
    amount: payload.amount,
    type: payload.type,
    category: payload.category.trim(),
    date: new Date(payload.date).toISOString()
  };

  transactions[index] = updated;
  await repository.writeAll(transactions);

  return updated;
}

// Deletes a transaction by id.
// Input: id string.
// Output: Promise resolving when deletion is saved or throws 404 validation error.
async function remove(id) {
  const transactions = await repository.readAll();
  const initialLength = transactions.length;
  const filtered = transactions.filter((transaction) => transaction.id !== id);

  if (filtered.length === initialLength) {
    throw createValidationError("Transaction not found", 404);
  }

  await repository.writeAll(filtered);
}

// Builds totals, balance, and category aggregates across all records.
// Input: no arguments.
// Output: Promise resolving to a summary object with totals and byCategory values.
async function getSummary() {
  const transactions = await repository.readAll();

  const summary = transactions.reduce(
    (accumulator, transaction) => {
      if (transaction.type === "income") {
        accumulator.income += transaction.amount;
      } else {
        accumulator.expense += transaction.amount;
      }

      accumulator.balance = accumulator.income - accumulator.expense;
      accumulator.count += 1;

      const key = transaction.category.toLowerCase();
      accumulator.byCategory[key] = (accumulator.byCategory[key] || 0) + transaction.amount;

      return accumulator;
    },
    {
      income: 0,
      expense: 0,
      balance: 0,
      count: 0,
      byCategory: {}
    }
  );

  return summary;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getSummary
};
