import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  // reduceQty,
} from "../Controllers/CategoryController.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", createCategory);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
// router.post("/reduceQty", reduceQty);
router.delete("/:id", deleteCategory);

export default router;
