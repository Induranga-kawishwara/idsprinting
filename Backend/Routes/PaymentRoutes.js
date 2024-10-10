import express from "express";
import {
  getAllPaymentHistory,
  getAllCreditPaymentHistory,
  createPayment,
  getCustomerAndPaymentDetails,
  updatePaymentByPaymentId,
  deletePaymentBypaymentId,
} from "../Controllers/PaymentController.js";

const router = express.Router();

router.get("/", getAllPaymentHistory);
router.get("/creditPayments", getAllCreditPaymentHistory);
router.post("/:customerId", createPayment);
router.get("/:customerId/:paymentId", getCustomerAndPaymentDetails);
router.put("/:customerId/:paymentId", updatePaymentByPaymentId);
router.delete("/:customerId/:paymentId", deletePaymentBypaymentId);

export default router;
