const express = require("express");

const controller = require("../controllers/transactions.controller");

const router = express.Router();

// Each endpoint is mapped to a controller method in one place.
// Input: HTTP requests that match transaction API paths.
// Output: control is passed to the matching controller handler.
router.get("/", controller.getAllTransactions);
router.get("/summary", controller.getSummary);
router.get("/:id", controller.getTransactionById);
router.post("/", controller.createTransaction);
router.put("/:id", controller.updateTransaction);
router.delete("/:id", controller.deleteTransaction);

module.exports = router;
