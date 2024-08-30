import express from "express";
import {
  createCashup,
  getAllCashups,
  getCashupById,
  updateCashup,
  deleteCashup,
} from "../Controllers/CashupController.js";

const router = express.Router();

router.get("/", getAllCashups);
router.post("/Cashup", createCashup);
router.get("/Cashup/:id", getCashupById);
router.put("/Cashup/:id", updateCashup);
router.delete("/Cashup/:id", deleteCashup);

export default router;
