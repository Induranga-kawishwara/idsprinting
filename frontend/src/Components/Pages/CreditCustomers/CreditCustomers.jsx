import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Button, Modal } from "@mui/material";
import jsPDF from "jspdf"; // Import jsPDF
import "./CreditCustomers.scss";

const initialCreditCustomers = [
  {
    id: 1,
    name: "The J",
    surname: "Valoy",
    email: "valoy@domain.com",
    phone: "123-456-7890",
    totalSpent: "Rs. 5000",
    creditBalance: 1000,
    houseNo: "",
    street: "",
    city: "",
    postalCode: "",
    customerType: "Credit",
    addedDate: "2024-08-29",
    addedTime: "14:30",
  },
  // Add more customers if needed
];

const CreditCustomers = () => {
  const [creditCustomers, setCreditCustomers] = useState(initialCreditCustomers);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleEditCredit = (customer) => {
    setSelectedCustomer(customer);
    setIsPaymentModalOpen(true);
  };

  const handleDeleteCredit = (id) => {
    const customer = creditCustomers.find((customer) => customer.id === id);
    setSelectedCustomer(customer);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (values) => {
    const paidAmount = parseFloat(values.paidAmount);
    const updatedCustomers = creditCustomers.map((customer) => {
      if (customer.id === selectedCustomer.id) {
        const newCreditBalance = customer.creditBalance - paidAmount;
        if (newCreditBalance <= 0) {
          generatePDFReceipt(customer, paidAmount, 0); // Generate receipt for full payment
          return null; // Customer is fully paid, remove from list
        }
        generatePDFReceipt(customer, paidAmount, newCreditBalance); // Generate receipt for partial payment
        return { ...customer, creditBalance: newCreditBalance };
      }
      return customer;
    }).filter(Boolean); // Filter out null customers

    setCreditCustomers(updatedCustomers);
    setIsPaymentModalOpen(false);
    setSelectedCustomer(null);
  };

  const PaymentSchema = Yup.object().shape({
    paidAmount: Yup.number()
      .required("Amount is required")
      .min(0, "Amount must be positive"),
  });

  // Function to generate a PDF receipt
  const generatePDFReceipt = (customer, paidAmount, remainingBalance) => {
    const doc = new jsPDF();
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    doc.setFontSize(18);
    doc.text("Payment Receipt", 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${formattedDate}`, 14, 30);
    doc.text(`Time: ${formattedTime}`, 14, 36);
    doc.text(`Customer: ${customer.name} ${customer.surname}`, 14, 50);
    doc.text(`Email: ${customer.email}`, 14, 56);
    doc.text(`Phone: ${customer.phone}`, 14, 62);
    doc.text(`Paid Amount: Rs. ${paidAmount.toFixed(2)}`, 14, 80);
    doc.text(`Remaining Balance: Rs. ${remainingBalance.toFixed(2)}`, 14, 86);

    doc.save(`receipt_${customer.name}_${customer.surname}.pdf`);
  };

  return (
    <div className="credit-customers">
      <div className="container mt-4">
        <h3>Credit Customers</h3>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Surname</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Credit Balance (Rs.)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {creditCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.surname}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.creditBalance}</td>
                <td>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleEditCredit(customer)}
                  >
                    Edit
                  </Button>{" "}
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleDeleteCredit(customer.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Payment Modal */}
        <Modal open={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
          <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
            <div className="modal-content custom-modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Pay Amount</h5>
                <Button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setIsPaymentModalOpen(false)}
                />
              </div>
              <div className="modal-body">
                <Formik
                  initialValues={{
                    paidAmount: "",
                  }}
                  validationSchema={PaymentSchema}
                  onSubmit={handlePaymentSubmit}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <div className="mb-3">
                        <label>Paid Amount (Rs.)</label>
                        <Field name="paidAmount" type="number" className="form-control" />
                        {errors.paidAmount && touched.paidAmount ? (
                          <div className="text-danger">{errors.paidAmount}</div>
                        ) : null}
                      </div>
                      <div className="d-flex justify-content-end">
                        <Button variant="contained" type="submit" className="update-btn">
                          Submit Payment
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => setIsPaymentModalOpen(false)}
                          className="cancel-btn ms-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CreditCustomers;
