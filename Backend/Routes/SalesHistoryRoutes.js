import express from "express";
import {
  getAllSalesHistory,
  getSalesHistoryDetails,
  deleteSalesHistory,
} from "../Controllers/SalesHistoryController.js";

const router = express.Router();

router.get("/", getAllSalesHistory);
router.get("/:customerId/:saleId", getSalesHistoryDetails);
router.delete("/:customerId/:saleId", deleteSalesHistory);

export default router;
