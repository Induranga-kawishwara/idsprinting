import express from "express";
import {
  createItem,
  getCategoryAndItemDetails,
  updateItemByItemId,
  deleteItemByItemId,
  deleteAndUpdate,
} from "../Controllers/ItemController.js";

const router = express.Router();

router.post("/:categoryId", createItem);
router.get("/:categoryId/:itemId", getCategoryAndItemDetails);
router.put("/:categoryId/:itemId", updateItemByItemId);
router.put("/:prevCategoryId/:newCategoryId/:itemId", deleteAndUpdate);
router.delete("/:categoryId/:itemId", deleteItemByItemId);

export default router;
