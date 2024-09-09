import React from "react";
import { Modal, Button } from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const PaymentSchema = Yup.object().shape({
  paymentMethod: Yup.string().required("Payment method is required"),
  cashGiven: Yup.number().when("paymentMethod", {
    is: "Cash",
    then: (schema) => schema.required("Cash given is required").min(0),
    otherwise: (schema) => schema.notRequired(),
  }),
  cardDetails: Yup.string().when("paymentMethod", {
    is: "Card",
    then: (schema) => schema.required("Card details are required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  bankTransferNumber: Yup.string().when("paymentMethod", {
    is: "Bank Transfer",
    then: (schema) => schema.required("Bank transfer number is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  chequeNumber: Yup.string().when("paymentMethod", {
    is: "Cheque",
    then: (schema) => schema.required("Cheque number is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  creditAmount: Yup.number().when("paymentMethod", {
    is: "Credit",
    then: (schema) => schema.required("Credit amount is required").min(0),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const PaymentModal = ({ isOpen, onClose, handlePaymentSubmit }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
        <div className="modal-content custom-modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Payment</h5>
            <Button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
          </div>
          <div className="modal-body">
            <Formik
              initialValues={{
                paymentMethod: "",
                cashGiven: "",
                cardDetails: "",
                bankTransferNumber: "",
                chequeNumber: "",
                creditAmount: "",
              }}
              validationSchema={PaymentSchema}
              onSubmit={handlePaymentSubmit}
            >
              {({ values, errors, touched }) => (
                <Form>
                  <div className="mb-3">
                    <label>Payment Method</label>
                    <Field
                      as="select"
                      name="paymentMethod"
                      className="form-control"
                    >
                      <option value="" label="Select" disabled />
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Credit">Credit</option>
                    </Field>
                    {errors.paymentMethod && touched.paymentMethod ? (
                      <div className="text-danger">{errors.paymentMethod}</div>
                    ) : null}
                  </div>
                  {values.paymentMethod === "Cash" && (
                    <div className="mb-3">
                      <label>Cash Given</label>
                      <Field
                        name="cashGiven"
                        type="number"
                        className="form-control"
                      />
                      {errors.cashGiven && touched.cashGiven ? (
                        <div className="text-danger">{errors.cashGiven}</div>
                      ) : null}
                    </div>
                  )}
                  {values.paymentMethod === "Card" && (
                    <div className="mb-3">
                      <label>Card Holder's Name or Last 4 Digits</label>
                      <Field name="cardDetails" className="form-control" />
                      {errors.cardDetails && touched.cardDetails ? (
                        <div className="text-danger">{errors.cardDetails}</div>
                      ) : null}
                    </div>
                  )}
                  {values.paymentMethod === "Bank Transfer" && (
                    <div className="mb-3">
                      <label>Bank Transfer Number</label>
                      <Field
                        name="bankTransferNumber"
                        className="form-control"
                      />
                      {errors.bankTransferNumber &&
                      touched.bankTransferNumber ? (
                        <div className="text-danger">
                          {errors.bankTransferNumber}
                        </div>
                      ) : null}
                    </div>
                  )}
                  {values.paymentMethod === "Cheque" && (
                    <div className="mb-3">
                      <label>Cheque Number</label>
                      <Field name="chequeNumber" className="form-control" />
                      {errors.chequeNumber && touched.chequeNumber ? (
                        <div className="text-danger">{errors.chequeNumber}</div>
                      ) : null}
                    </div>
                  )}
                  {values.paymentMethod === "Credit" && (
                    <div className="mb-3">
                      <label>Paying Amount</label>
                      <Field
                        name="creditAmount"
                        type="number"
                        className="form-control"
                      />
                      {errors.creditAmount && touched.creditAmount ? (
                        <div className="text-danger">{errors.creditAmount}</div>
                      ) : null}
                    </div>
                  )}
                  <div className="modal-footer">
                    <Button variant="secondary" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Submit Payment
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
