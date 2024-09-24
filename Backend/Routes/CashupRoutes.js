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
router.get("/:id", getCashupById);
router.put("/:id", updateCashup);
router.delete("/:id", deleteCashup);

export default router;
