import express from "express";
import {
  getAllPaymentHistory,
  createPayment,
  getCustomerAndPaymentDetails,
  updatePaymentByPaymentId,
  deletePaymentBypaymentId,
} from "../Controllers/PaymentController.js";

const router = express.Router();

router.get("/", getAllPaymentHistory);
router.post("/:customerId", createPayment);
router.get("/:customerId/:paymentId", getCustomerAndPaymentDetails);
router.put("/:customerId/:paymentId", updatePaymentByPaymentId);
router.delete("/:customerId/:paymentId", deletePaymentBypaymentId);

export default router;
