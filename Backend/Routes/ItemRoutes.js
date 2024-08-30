import express from "express";
import {
  createProduct,
  getProducts,
  deleteProducts,
  getProductById,
  getstockdetailsById,
  updateStockDetailById,
  deleteProductsStock,
} from "../Controllers/ItemController.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/product", createProduct);
router.get("/customer/:id", getProductById);
router.get("/customer/:id/:detailId", getstockdetailsById);
router.put("/customer/:id/:detailId", updateStockDetailById);
router.delete("/product/:id", deleteProducts);
router.delete("/product/:id/:detailId", deleteProductsStock);

export default router;
