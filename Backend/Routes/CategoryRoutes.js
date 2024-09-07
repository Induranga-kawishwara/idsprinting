import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../Controllers/CategoryController.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/Category", createCategory);
router.get("/Category/:id", getCategoryById);
router.put("/Category/:id", updateCategory);
router.delete("/Category/:id", deleteCategory);

export default router;
