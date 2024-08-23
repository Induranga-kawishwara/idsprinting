import express from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../Controllers/CustomerController.js";

const router = express.Router();

router.get("/", getAllCustomers);
router.post("/customer", createCustomer);
router.get("/customer/:id", getCustomerById);
router.put("/customer/:id", updateCustomer);
router.delete("/customer/:id", deleteCustomer);

export default router;
