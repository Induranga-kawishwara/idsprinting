import express from "express";
import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../Controllers/SupplierController.js";

const router = express.Router();

router.get("/", createSupplier);
router.post("/supplier", getAllSuppliers);
router.get("/supplier/:id", getSupplierById);
router.put("/supplier/:id", updateSupplier);
router.delete("/supplier/:id", deleteSupplier);

export default router;
