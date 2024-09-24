import express from "express";
import {
  createPayment,
  getCustomerAndPaymentDetails,
  updatePaymentByPaymentId,
  deletePaymentByPaymentId,
} from "../Controllers/PaymentController.js";

const router = express.Router();

router.post("/:customerId", createPayment);
router.get("/:customerId/:paymentId", getCustomerAndPaymentDetails);
router.put("/:customerId/:paymentId", updatePaymentByPaymentId);
router.delete("/:customerId/:paymentId", deletePaymentByPaymentId);

export default router;
