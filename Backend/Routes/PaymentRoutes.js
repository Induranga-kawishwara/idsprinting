import express from "express";
import {
  createPayment,
  getCustomerAndPaymentDetails,
  updatePaymentByPaymentId,
  deletePaymentByPaymentId,
} from "../Controllers/PaymentController.js";

const router = express.Router();

router.post("/payment/:customerId", createPayment);
router.get("/payment/:customerId/:paymentId", getCustomerAndPaymentDetails);
router.put("/payment/:customerId/:paymentId", updatePaymentByPaymentId);
router.delete("/payment/:customerId/:paymentId", deletePaymentByPaymentId);

export default router;
