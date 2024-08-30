import express from "express";
import {
  createExpenses,
  getAllExpensess,
  getExpensesById,
  updateExpenses,
  deleteExpenses,
} from "../Controllers/ExpensesController.js";

const router = express.Router();

router.get("/", getAllExpensess);
router.post("/Expenses", createExpenses);
router.get("/Expenses/:id", getExpensesById);
router.put("/Expenses/:id", updateExpenses);
router.delete("/Expenses/:id", deleteExpenses);

export default router;
