import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Button, Modal } from "@mui/material";
import jsPDF from "jspdf";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const initialCreditCustomers = [
  {
    id: 1,
    name: "The J",
    surname: "Valoy",
    email: "valoy@domain.com",
    phone: "0711093799",
    totalSpent: "Rs. 5000",
    creditBalance: 1000,
    houseNo: "",
    street: "",
    city: "",
    postalCode: "",
    customerType: "Credit",
    addedDate: "2024-08-29",
    addedTime: "14:30",
    addedBy: "Admin",
  },
  // Add more customers if needed
];

const ITEMS_PER_PAGE = 100;

const CreditCustomers = () => {
  const [creditCustomers, setCreditCustomers] = useState(initialCreditCustomers);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [currentPage, setCurrentPage] = useState(0);
  const [receiptData, setReceiptData] = useState({
    paidAmount: 0,
    remainingBalance: 0,
  }); // New state for receipt data

  const totalPages = Math.ceil(creditCustomers.length / ITEMS_PER_PAGE);

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
    let updatedCustomers = creditCustomers.map((customer) => {
      if (customer.id === selectedCustomer.id) {
        const newCreditBalance = customer.creditBalance - paidAmount;
        if (newCreditBalance <= 0) {
          generatePDFReceipt(customer, paidAmount, 0);
          promptReceiptOptions(customer, paidAmount, 0);
          return null;
        }
        generatePDFReceipt(customer, paidAmount, newCreditBalance);
        promptReceiptOptions(customer, paidAmount, newCreditBalance);
        return { ...customer, creditBalance: newCreditBalance };
      }
      return customer;
    });

    updatedCustomers = updatedCustomers.filter(Boolean); // Remove null entries
    setCreditCustomers(updatedCustomers);
    setIsPaymentModalOpen(false);
    // Removed setSelectedCustomer(null) to keep the customer data for the receipt modal
  };

  const PaymentSchema = Yup.object().shape({
    paidAmount: Yup.number()
      .required("Amount is required")
      .min(0, "Amount must be positive"),
  });

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
    doc.text(`Paid Amount: Rs. ${paidAmount?.toFixed(2) ?? "0.00"}`, 14, 80);
    doc.text(
      `Remaining Balance: Rs. ${remainingBalance?.toFixed(2) ?? "0.00"}`,
      14,
      86
    );
    doc.text(`Added By: ${customer.addedBy}`, 14, 92);

    return doc;
  };

  const promptReceiptOptions = (customer, paidAmount, remainingBalance) => {
    const choice = window.confirm(
      "Payment completed. Would you like to download the PDF, print the receipt, or share it?"
    );

    if (choice) {
      setSelectedCustomer(customer);
      setReceiptData({ paidAmount, remainingBalance }); // Store receipt data
      setIsReceiptModalOpen(true);
    }
  };

  const handleOpenReceiptModal = (customer) => {
    setSelectedCustomer(customer);
    setReceiptData({
      paidAmount: 0,
      remainingBalance: customer.creditBalance ?? 0,
    });
    setIsReceiptModalOpen(true);
  };

  const downloadReceipt = () => {
    if (!selectedCustomer) return;
    const doc = generatePDFReceipt(
      selectedCustomer,
      receiptData.paidAmount,
      receiptData.remainingBalance
    );
    doc.save(
      `receipt_${selectedCustomer.name}_${selectedCustomer.surname}.pdf`
    );
  };

  const printReceipt = () => {
    if (!selectedCustomer) return;
    const doc = generatePDFReceipt(
      selectedCustomer,
      receiptData.paidAmount,
      receiptData.remainingBalance
    );
    const pdfBlob = doc.output("blob");
    const pdfURL = URL.createObjectURL(pdfBlob);

    const printWindow = window.open(pdfURL, "_blank");
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const shareReceipt = () => {
    if (!selectedCustomer) return;

    const formattedDate = new Date().toLocaleDateString();
    const formattedTime = new Date().toLocaleTimeString();

    const textMessage = `IDS Printing House\nPayment Receipt\nDate: ${formattedDate}\nTime: ${formattedTime}\n\nCustomer:\nName: ${selectedCustomer.name} ${selectedCustomer.surname}\nContact: ${selectedCustomer.phone}\n\nCredit Balance: Rs. ${(
      receiptData.remainingBalance ?? 0
    ).toFixed(2)}\nAdded By: ${selectedCustomer.addedBy}`;

    const whatsappURL = `https://wa.me/+94${selectedCustomer.phone}?text=${encodeURIComponent(
      textMessage
    )}`;
    const emailSubject = `Receipt for ${selectedCustomer.name} ${selectedCustomer.surname}`;
    const emailBody = textMessage;
    const mailtoURL = `mailto:?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    window.open(whatsappURL, "_blank");
    window.open(mailtoURL, "_blank");
  };

  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedCustomer(null); // Reset selectedCustomer here
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateRange({ start: null, end: null });
    setCurrentPage(0);
  };

  const filteredCustomers = creditCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesDate =
      (!dateRange.start || new Date(customer.addedDate) >= dateRange.start) &&
      (!dateRange.end || new Date(customer.addedDate) <= dateRange.end);

    return matchesSearch && matchesDate;
  });

  const paginatedCustomers = filteredCustomers.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="credit-customers">
      <br />
      <br />
      <div className="container mt-4">
        <h3>Credit Customers</h3>

        {/* Search and Filters */}
        <div className="search-filters mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="searchfunctions me-2"
            placeholder="Search by name or phone"
          />
          <DatePicker
            selected={dateRange.start}
            onChange={(date) =>
              setDateRange((prev) => ({ ...prev, start: date }))
            }
            selectsStart
            startDate={dateRange.start}
            endDate={dateRange.end}
            className="searchfunctionsdate me-2"
            placeholderText="Start Date"
          />
          <DatePicker
            selected={dateRange.end}
            onChange={(date) =>
              setDateRange((prev) => ({ ...prev, end: date }))
            }
            selectsEnd
            startDate={dateRange.start}
            endDate={dateRange.end}
            className="searchfunctionsdate me-2"
            placeholderText="End Date"
          />
          <Button variant="contained" onClick={handleClearFilters}>
            Clear
          </Button>
        </div>

        {/* Customer Table */}
        <div className="table-responsive">
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Surname</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Credit Balance (Rs.)</th>
                <th>Added By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.surname}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.creditBalance ?? 0}</td>
                  <td>{customer.addedBy}</td>
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

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            Next
          </button>
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
                          <div className="text-danger">
                            {errors.paidAmount}
                          </div>
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
                    <strong>Paid Amount:</strong> Rs.{" "}
                    {receiptData.paidAmount.toFixed(2)}
                  </p>
                  <p>
                    <strong>Remaining Balance:</strong> Rs.{" "}
                    {receiptData.remainingBalance.toFixed(2)}
                  </p>
                  <p>
                    <strong>Added By:</strong> {selectedCustomer.addedBy}
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
