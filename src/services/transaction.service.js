const { randomUUID } = require("crypto");

const repository = require("../repositories/transaction.repository");
const { createValidationError, assertValidTransactionPayload } = require("../utils/validators");

async function getAll() {
  const transactions = await repository.readAll();

  // I am sorting by date descending so the latest entries appear first in the response.
  return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function getById(id) {
  const transactions = await repository.readAll();
  const found = transactions.find((transaction) => transaction.id === id);

  if (!found) {
    throw createValidationError("Transaction not found", 404);
  }

  return found;
}

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

async function remove(id) {
  const transactions = await repository.readAll();
  const initialLength = transactions.length;
  const filtered = transactions.filter((transaction) => transaction.id !== id);

  if (filtered.length === initialLength) {
    throw createValidationError("Transaction not found", 404);
  }

  await repository.writeAll(filtered);
}

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
