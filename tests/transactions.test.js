const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs/promises");
const path = require("path");

const request = require("supertest");
const app = require("../src/app");

const dataFilePath = path.join(__dirname, "../data/transactions.json");

// Resets transaction storage so each test starts from a clean state.
// Input: no arguments.
// Output: Promise resolving after transactions.json is rewritten.
async function resetData() {
  await fs.writeFile(dataFilePath, "[]\n", "utf8");
}

test("GET /api/health should confirm server health", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, "ok");
});

test("GET / should return a friendly welcome response", async () => {
  const response = await request(app).get("/");

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, "ok");
  assert.match(response.body.message, /api/i);
});

test("POST and GET flow should create and fetch a transaction", async () => {
  await resetData();

  const payload = {
    description: "Freelance invoice",
    amount: 1200,
    type: "income",
    category: "Work",
    date: "2026-06-20"
  };

  const createResponse = await request(app).post("/api/transactions").send(payload);

  assert.equal(createResponse.statusCode, 201);
  assert.ok(createResponse.body.data.id);
  assert.equal(createResponse.body.data.description, payload.description);

  const id = createResponse.body.data.id;
  const getByIdResponse = await request(app).get(`/api/transactions/${id}`);

  assert.equal(getByIdResponse.statusCode, 200);
  assert.equal(getByIdResponse.body.data.id, id);

  const getAllResponse = await request(app).get("/api/transactions");

  assert.equal(getAllResponse.statusCode, 200);
  assert.equal(getAllResponse.body.data.length, 1);
});

test("PUT /api/transactions/:id should update an existing transaction", async () => {
  await resetData();

  const createResponse = await request(app).post("/api/transactions").send({
    description: "Groceries",
    amount: 90,
    type: "expense",
    category: "Food",
    date: "2026-06-21"
  });

  const id = createResponse.body.data.id;
  const updateResponse = await request(app).put(`/api/transactions/${id}`).send({
    description: "Weekly groceries",
    amount: 100,
    type: "expense",
    category: "Food",
    date: "2026-06-22"
  });

  assert.equal(updateResponse.statusCode, 200);
  assert.equal(updateResponse.body.data.description, "Weekly groceries");
  assert.equal(updateResponse.body.data.amount, 100);
});

test("DELETE /api/transactions/:id should remove a transaction", async () => {
  await resetData();

  const createResponse = await request(app).post("/api/transactions").send({
    description: "Bus card",
    amount: 40,
    type: "expense",
    category: "Transport",
    date: "2026-06-23"
  });

  const id = createResponse.body.data.id;
  const deleteResponse = await request(app).delete(`/api/transactions/${id}`);

  assert.equal(deleteResponse.statusCode, 204);

  const getAllResponse = await request(app).get("/api/transactions");
  assert.equal(getAllResponse.body.data.length, 0);
});

test("GET /api/transactions/summary should compute totals and categories", async () => {
  await resetData();

  await request(app).post("/api/transactions").send({
    description: "Salary",
    amount: 2500,
    type: "income",
    category: "Work",
    date: "2026-06-01"
  });

  await request(app).post("/api/transactions").send({
    description: "Rent",
    amount: 800,
    type: "expense",
    category: "Housing",
    date: "2026-06-02"
  });

  await request(app).post("/api/transactions").send({
    description: "Dinner",
    amount: 50,
    type: "expense",
    category: "Food",
    date: "2026-06-03"
  });

  const summaryResponse = await request(app).get("/api/transactions/summary");

  assert.equal(summaryResponse.statusCode, 200);
  assert.equal(summaryResponse.body.data.income, 2500);
  assert.equal(summaryResponse.body.data.expense, 850);
  assert.equal(summaryResponse.body.data.balance, 1650);
  assert.equal(summaryResponse.body.data.count, 3);
  assert.equal(summaryResponse.body.data.byCategory.work, 2500);
  assert.equal(summaryResponse.body.data.byCategory.housing, 800);
  assert.equal(summaryResponse.body.data.byCategory.food, 50);
});

test("Validation should reject invalid payloads", async () => {
  await resetData();

  const response = await request(app).post("/api/transactions").send({
    description: "ab",
    amount: -10,
    type: "other",
    category: "X",
    date: "bad-date"
  });

  assert.equal(response.statusCode, 400);
  assert.equal(typeof response.body.error, "string");
});

test("Unknown routes should return 404 JSON", async () => {
  const response = await request(app).get("/api/does-not-exist");

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "Route not found");
});
