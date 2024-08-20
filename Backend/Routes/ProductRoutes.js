import express from "express";
import {
  createProduct,
  getProducts,
  deleteProducts,
  getProductById,
} from "../Controllers/ProductController.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/product", createProduct);
router.get("/customer/:id", getProductById);
// router.put("/customer/:id", updateCustomer);
router.delete("/product/:id", deleteProducts);

export default router;
