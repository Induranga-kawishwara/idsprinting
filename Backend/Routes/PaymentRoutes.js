import express from "express";
import {
  createPayment,
  getCustomerAndPaymentDetails,
  updatePaymentByPaymentId,
  deletePaymentBypaymentId,
} from "../Controllers/PaymentController.js";

const router = express.Router();

router.post("/:customerId", createPayment);
router.get("/:customerId/:paymentId", getCustomerAndPaymentDetails);
router.put("/:customerId/:paymentId", updatePaymentByPaymentId);
router.delete("/:customerId/:paymentId", deletePaymentBypaymentId);

export default router;
