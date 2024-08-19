import express from "express";
import { createProduct } from "../Controllers/ProductController.js";

const router = express.Router();

// router.get("/", getAllCustomers);
router.post("/product", createProduct);
// router.get("/customer/:id", getCustomerById);
// router.put("/customer/:id", updateCustomer);
// router.delete("/customer/:id", deleteCustomer);

export default router;
