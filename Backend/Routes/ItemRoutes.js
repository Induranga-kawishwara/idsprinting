import express from "express";
import {
  createItem,
  getCategoryAndItemDetails,
  updateItemByItemId,
  deleteItemByItemId,
  deleteAndUpdate,
  // reduceQty,
} from "../Controllers/ItemController.js";

const router = express.Router();

router.post("/:categoryId", createItem);
// router.post("/qty/reduceQty", reduceQty);
router.get("/:categoryId/:itemId", getCategoryAndItemDetails);
router.put("/:categoryId/:itemId", updateItemByItemId);
router.put("/:prevCategoryId/:newCategoryId/:itemId", deleteAndUpdate);
router.delete("/:categoryId/:itemId", deleteItemByItemId);

export default router;
