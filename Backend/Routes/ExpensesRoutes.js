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
router.post("/expenses", createExpenses);
router.get("/expenses/:id", getExpensesById);
router.put("/expenses/:id", updateExpenses);
router.delete("/expenses/:id", deleteExpenses);

export default router;
