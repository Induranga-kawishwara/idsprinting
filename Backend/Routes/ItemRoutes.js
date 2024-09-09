import express from "express";
import {
  createItem,
  getCategoryAndItemDetails,
  updateItemByItemId,
  deleteItemByItemId,
} from "../Controllers/ItemController.js";

const router = express.Router();

router.post("/item/:categoryId", createItem);
router.get("/item/:categoryId/:itemId", getCategoryAndItemDetails);
router.put("/item/:categoryId/:itemId", updateItemByItemId);
router.delete("/item/:categoryId/:itemId", deleteItemByItemId);

export default router;
