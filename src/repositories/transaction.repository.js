const fs = require("fs/promises");
const path = require("path");

const dataFilePath = path.join(__dirname, "../../data/transactions.json");

async function ensureDataFile() {
  // I am creating the data file on demand so the app still works on a fresh clone.
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, "[]\n", "utf8");
  }
}

async function readAll() {
  await ensureDataFile();
  const raw = await fs.readFile(dataFilePath, "utf8");
  return JSON.parse(raw);
}

async function writeAll(transactions) {
  const stableJson = JSON.stringify(transactions, null, 2);
  await fs.writeFile(dataFilePath, `${stableJson}\n`, "utf8");
}

module.exports = {
  readAll,
  writeAll
};
