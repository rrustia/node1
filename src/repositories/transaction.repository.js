const fs = require("fs/promises");
const path = require("path");

const dataFilePath = path.join(__dirname, "../../data/transactions.json");

// Ensures the storage file exists before read/write operations.
// Input: no direct arguments; uses configured data file path.
// Output: resolves when the file exists, creating it when missing.
async function ensureDataFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, "[]\n", "utf8");
  }
}

// Loads every transaction record from disk.
// Input: no arguments.
// Output: Promise resolving to Transaction[] parsed from JSON.
async function readAll() {
  await ensureDataFile();
  const raw = await fs.readFile(dataFilePath, "utf8");
  return JSON.parse(raw);
}

// Persists the full transaction list to disk.
// Input: transactions array of plain objects.
// Output: Promise resolving after the file write completes.
async function writeAll(transactions) {
  const stableJson = JSON.stringify(transactions, null, 2);
  await fs.writeFile(dataFilePath, `${stableJson}\n`, "utf8");
}

module.exports = {
  readAll,
  writeAll
};
