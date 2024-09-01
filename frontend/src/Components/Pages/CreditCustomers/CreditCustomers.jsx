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
  const [creditCustomers, setCreditCustomers] = useState(
    initialCreditCustomers
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleEditCredit = (customer) => {
    setSelectedCustomer(customer);
    setIsPaymentModalOpen(true);
  };

  const handleDeleteCredit = (id) => {
    const updatedCustomers = creditCustomers.filter(
      (customer) => customer.id !== id
    );
    setCreditCustomers(updatedCustomers);
  };

  const handlePaymentSubmit = (values) => {
    const paidAmount = parseFloat(values.paidAmount);
    const updatedCustomers = creditCustomers
      .map((customer) => {
        if (customer.id === selectedCustomer.id) {
          const newCreditBalance = customer.creditBalance - paidAmount;
          if (newCreditBalance <= 0) {
            generatePDFReceipt(customer, paidAmount, 0); // Generate receipt for full payment
            promptReceiptOptions(customer, paidAmount, 0); // Prompt user for receipt options
            return null; // Customer is fully paid, remove from list
          }
          generatePDFReceipt(customer, paidAmount, newCreditBalance); // Generate receipt for partial payment
          promptReceiptOptions(customer, paidAmount, newCreditBalance); // Prompt user for receipt options
          return { ...customer, creditBalance: newCreditBalance };
        }
        return customer;
      })
      .filter(Boolean); // Filter out null customers

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

  // Function to prompt the user for receipt options after payment
  const promptReceiptOptions = (customer, paidAmount, remainingBalance) => {
    const choice = window.confirm(
      "Payment completed. Would you like to download the PDF, print the receipt, or share it?"
    );

    if (choice) {
      setSelectedCustomer(customer); // Set the customer to display in the receipt modal
      setIsReceiptModalOpen(true); // Open the receipt modal
    }
  };

  // Function to open the receipt modal
  const handleOpenReceiptModal = (customer) => {
    setSelectedCustomer(customer);
    setIsReceiptModalOpen(true);
  };

  // Function to download the receipt
  const downloadReceipt = () => {
    if (!selectedCustomer) return;
    const doc = new jsPDF();
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    doc.setFontSize(18);
    doc.text("Payment Receipt", 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${formattedDate}`, 14, 30);
    doc.text(`Time: ${formattedTime}`, 14, 36);
    doc.text(
      `Customer: ${selectedCustomer.name} ${selectedCustomer.surname}`,
      14,
      50
    );
    doc.text(`Email: ${selectedCustomer.email}`, 14, 56);
    doc.text(`Phone: ${selectedCustomer.phone}`, 14, 62);
    doc.text(
      `Credit Balance: Rs. ${selectedCustomer.creditBalance.toFixed(2)}`,
      14,
      80
    );

    doc.save(
      `receipt_${selectedCustomer.name}_${selectedCustomer.surname}.pdf`
    );
  };

  // Function to print the receipt
  const printReceipt = () => {
    const printContents = document.getElementById("receipt-contents").innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload the page to restore the original state
  };

  // Function to share the receipt via WhatsApp and email
  const shareReceipt = () => {
    if (!selectedCustomer) return;

    const doc = new jsPDF();
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    doc.setFontSize(18);
    doc.text("Payment Receipt", 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${formattedDate}`, 14, 30);
    doc.text(`Time: ${formattedTime}`, 14, 36);
    doc.text(
      `Customer: ${selectedCustomer.name} ${selectedCustomer.surname}`,
      14,
      50
    );
    doc.text(`Email: ${selectedCustomer.email}`, 14, 56);
    doc.text(`Phone: ${selectedCustomer.phone}`, 14, 62);
    doc.text(
      `Credit Balance: Rs. ${selectedCustomer.creditBalance.toFixed(2)}`,
      14,
      80
    );

    const pdfBlob = doc.output("blob");
    const pdfURL = URL.createObjectURL(pdfBlob);

    const whatsappMessage = `Receipt for ${selectedCustomer.name} ${
      selectedCustomer.surname
    }\nCredit Balance: Rs. ${selectedCustomer.creditBalance.toFixed(
      2
    )}\nDownload PDF: ${pdfURL}`;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    const emailSubject = `Receipt for ${selectedCustomer.name} ${selectedCustomer.surname}`;
    const emailBody = `Receipt for ${selectedCustomer.name} ${
      selectedCustomer.surname
    }\nCredit Balance: Rs. ${selectedCustomer.creditBalance.toFixed(
      2
    )}\nDownload PDF: ${pdfURL}`;
    const mailtoURL = `mailto:?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    window.open(whatsappURL, "_blank"); // Open WhatsApp
    window.open(mailtoURL, "_blank"); // Open Email
  };

  // Function to handle closing the receipt modal
  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="credit-customers">
      <br />
      <br />
      <br />
      <br />
      <div className="container mt-4">
        <h3>Credit Customers</h3>
        <div class="table-responsive">
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
                      onClick={() => handleOpenReceiptModal(customer)}
                    >
                      View Receipt
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
        </div>

        {/* Payment Modal */}
        <Modal
          open={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        >
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
                        <Field
                          name="paidAmount"
                          type="number"
                          className="form-control"
                        />
                        {errors.paidAmount && touched.paidAmount ? (
                          <div className="text-danger">{errors.paidAmount}</div>
                        ) : null}
                      </div>
                      <div className="d-flex justify-content-end">
                        <Button
                          variant="contained"
                          type="submit"
                          className="update-btn"
                        >
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

        {/* Receipt Modal */}
        <Modal open={isReceiptModalOpen} onClose={handleCloseReceiptModal}>
          <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
            <div className="modal-content custom-modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Receipt Details</h5>
                <Button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCloseReceiptModal}
                />
              </div>
              {selectedCustomer && (
                <div className="modal-body" id="receipt-contents">
                  <p>
                    <strong>Customer:</strong> {selectedCustomer.name}{" "}
                    {selectedCustomer.surname}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedCustomer.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedCustomer.phone}
                  </p>
                  <p>
                    <strong>Total Spent:</strong> {selectedCustomer.totalSpent}
                  </p>
                  <p>
                    <strong>Credit Balance:</strong> Rs.{" "}
                    {selectedCustomer.creditBalance.toFixed(2)}
                  </p>
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="contained"
                      onClick={downloadReceipt}
                      className="download-btn me-2"
                    >
                      Download PDF
                    </Button>
                    <Button
                      variant="contained"
                      onClick={printReceipt}
                      className="print-btn me-2"
                    >
                      Print Receipt
                    </Button>
                    <Button
                      variant="contained"
                      onClick={shareReceipt}
                      className="share-btn me-2"
                    >
                      Share
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleCloseReceiptModal}
                      className="close-btn"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CreditCustomers;
