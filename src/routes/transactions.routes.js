const express = require("express");

const controller = require("../controllers/transactions.controller");

const router = express.Router();

// I am mapping each endpoint to a clear controller method.
// I keep this file focused on route definitions so it stays easy to scan.
router.get("/", controller.getAllTransactions);
router.get("/summary", controller.getSummary);
router.get("/:id", controller.getTransactionById);
router.post("/", controller.createTransaction);
router.put("/:id", controller.updateTransaction);
router.delete("/:id", controller.deleteTransaction);

module.exports = router;
