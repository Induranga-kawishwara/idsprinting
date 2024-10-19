import express from "express";
import {
  createCashin,
  getAllCashins,
  getCashinById,
  updateCashin,
  deleteCashin,
} from "../Controllers/CashinController.js";

const router = express.Router();

router.get("/", getAllCashins);
router.post("/", createCashin);
router.get("/:id", getCashinById);
router.put("/:id", updateCashin);
router.delete("/:id", deleteCashin);

export default router;
