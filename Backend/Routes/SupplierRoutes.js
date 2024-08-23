import express from "express";
import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../Controllers/SupplierController.js";

const router = express.Router();

router.get("/", getAllSuppliers);
router.post("/supplier", createSupplier);
router.get("/supplier/:id", getSupplierById);
router.put("/supplier/:id", updateSupplier);
router.delete("/supplier/:id", deleteSupplier);

export default router;
