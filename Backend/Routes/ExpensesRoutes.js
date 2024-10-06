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
router.post("/", createExpenses);
router.get("/:id", getExpensesById);
router.put("/:id", updateExpenses);
router.delete("/:id", deleteExpenses);

export default router;
