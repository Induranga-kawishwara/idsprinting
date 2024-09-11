import React, { useMemo, useState } from "react";
import { Button, Modal, TextField } from "@mui/material";
import jsPDF from "jspdf"; // Import jsPDF for PDF generation
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SalesHistory = () => {
  const [salesHistory, setSalesHistory] = useState([
    {
      date: "2024-08-29",
      customerName: "John Doe",
      contactNumber: "0778178584",
      total: 1000,
      paymentDetails: { paymentMethod: "Cash" },
      invoiceNumber: "INV-12345",
      products: [
        { name: "Shirts", qty: 2, price: 200 },
        { name: "Pants", qty: 1, price: 300 },
      ],
      addedBy: "Admin", // New field for 'who added'
    },
    // Add more sales records as needed
  ]);

  // Function to handle delete sale after admin authentication
  const handleDeleteSale = () => {
    // Example admin credentials; replace with actual authentication logic
    const adminCredentials = {
      email: "admin@example.com",
      password: "password123",
    };

    if (
      adminEmail === adminCredentials.email &&
      adminPassword === adminCredentials.password
    ) {
      setSalesHistory((prevSales) =>
        prevSales.filter(
          (sale) => sale.invoiceNumber !== selectedSale.invoiceNumber
        )
      );
      handleCloseDeleteModal();
    } else {
      setDeleteError("Invalid email or password.");
    }
  };

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Filter sales based on search, type, and date range
  const filteredSales = useMemo(() => {
    return salesHistory.filter((sale) => {
      const matchesSearch =
        sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.contactNumber.includes(searchQuery);

      const matchesType = filterType
        ? sale.paymentDetails.paymentMethod === filterType
        : true;

      const matchesDateRange =
        (!dateRange.start || new Date(sale.date) >= dateRange.start) &&
        (!dateRange.end || new Date(sale.date) <= dateRange.end);

      return matchesSearch && matchesType && matchesDateRange;
    });
  }, [salesHistory, searchQuery, filterType, dateRange]);

  // Function to clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterType("");
    setDateRange({ start: null, end: null });
  };

  // Function to generate a PDF receipt
  const generatePDFReceipt = (sale) => {
    const doc = new jsPDF();
    const formattedDate = new Date(sale.date).toLocaleDateString();
    const formattedTime = new Date(sale.date).toLocaleTimeString();

    doc.setFontSize(18);
    doc.text("Transaction Receipt", 14, 22);
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${sale.invoiceNumber}`, 14, 30);
    doc.text(`Date: ${formattedDate}`, 14, 36);
    doc.text(`Time: ${formattedTime}`, 14, 42);

    doc.text("Customer:", 14, 50);
    doc.text(`Name: ${sale.customerName}`, 14, 56);
    doc.text(`Contact: ${sale.contactNumber}`, 14, 62);

    doc.text("Products:", 14, 74);
    sale.products.forEach((product, index) => {
      const y = 80 + index * 6;
      doc.text(
        `${product.name} - ${product.qty} x Rs.${product.price.toFixed(
          2
        )} = Rs.${(product.qty * product.price).toFixed(2)}`,
        14,
        y
      );
    });

    doc.text(`Total: Rs.${sale.total.toFixed(2)}`, 14, 100);
    doc.text(`Payment Method: ${sale.paymentDetails.paymentMethod}`, 14, 106);
    doc.text(`Added By: ${sale.addedBy}`, 14, 112); // New Field for PDF

    return doc; // Make sure to return the document
  };

  const handleOpenReceiptModal = (sale) => {
    setSelectedSale(sale);
    setIsReceiptModalOpen(true);
  };

  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedSale(null);
  };

  const downloadReceipt = () => {
    if (!selectedSale) return;
    const doc = generatePDFReceipt(selectedSale); // Ensure generatePDFReceipt returns the doc
    doc.save(`receipt_${selectedSale.invoiceNumber}.pdf`); // Now this will work correctly
  };

  // Function to handle opening the delete modal
  const handleOpenDeleteModal = (sale) => {
    setSelectedSale(sale);
    setIsDeleteModalOpen(true);
  };
  // Function to handle closing the delete modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setAdminEmail("");
    setAdminPassword("");
    setDeleteError("");
  };

  // Function to print the receipt
  const printReceipt = () => {
    if (!selectedSale) return;
    const doc = generatePDFReceipt(selectedSale);
    const pdfBlob = doc.output("blob");
    const pdfURL = URL.createObjectURL(pdfBlob);

    const printWindow = window.open(pdfURL, "_blank");
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // Function to share the receipt via WhatsApp and email
  const shareReceipt = () => {
    if (!selectedSale) return;

    const formattedDate = new Date(selectedSale.date).toLocaleDateString();
    const formattedTime = new Date(selectedSale.date).toLocaleTimeString();

    // Construct the text message for sharing, including 'who added'
    const textMessage = `IDS Printing House\nTransaction Receipt\nInvoice Number: ${
      selectedSale.invoiceNumber
    }\nDate: ${formattedDate}\nTime: ${formattedTime}\n\nCustomer:\nName: ${
      selectedSale.customerName
    }\nContact: ${
      selectedSale.contactNumber
    }\n\nProducts:\n${selectedSale.products
      .map(
        (product) =>
          `${product.name} - ${product.qty} x Rs.${product.price.toFixed(
            2
          )} = Rs.${(product.qty * product.price).toFixed(2)}`
      )
      .join("\n")}\n\nTotal: Rs.${selectedSale.total.toFixed(
      2
    )}\nPayment Method: ${
      selectedSale.paymentDetails.paymentMethod
    }\n\nAdded By: ${selectedSale.addedBy}`; // Include 'Who Added'

    // Construct the WhatsApp and Email URLs with the text message
    const whatsappURL = `https://wa.me/+94${
      selectedSale.contactNumber
    }?text=${encodeURIComponent(textMessage)}`;
    const emailSubject = `Receipt for ${selectedSale.customerName}`;
    const emailBody = textMessage;
    const mailtoURL = `mailto:?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    // Open the share options
    window.open(whatsappURL, "_blank"); // Open WhatsApp
    window.open(mailtoURL, "_blank"); // Open Email
  };

  const ROWS_PER_PAGE = 100; // Maximum rows per page
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate total pages based on sales history
  const totalPages = Math.ceil(filteredSales.length / ROWS_PER_PAGE);

  const paginatedSales = filteredSales.slice(
    currentPage * ROWS_PER_PAGE,
    (currentPage + 1) * ROWS_PER_PAGE
  );
  return (
    <div className="bodyofpage">
      <div className="container">
        <h2>Sales History</h2>
        <div className="d-flex align-items-center mb-3">
          <input
            type="text"
            className="searchfunctions"
            placeholder="Search by name or phone"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center mb-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="formdropdown"
          >
            <option value="">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Cheque">Cheque</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Credit">Credit</option>
          </select>

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
          <button className="prevbutton" onClick={handleClearFilters}>
            Clear
          </button>
        </div>
        <div className="table-responsive">
          <button
            className="addnewbtntop"
            variant="contained"
            onClick={() => window.history.back()}
          >
            Back to Sales
          </button>
          <table className="table mt-3 custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Contact Number</th>
                <th>Total Amount (Rs.)</th>
                <th>Payment Method</th>
                <th>Invoice Number</th>
                <th>Who Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="custom-table">
              {filteredSales.map((sale, index) => (
                <tr key={index}>
                  <td>{new Date(sale.date).toLocaleDateString()}</td>
                  <td>{sale.customerName}</td>
                  <td>{sale.contactNumber}</td>
                  <td>{sale.total.toFixed(2)}</td>
                  <td>{sale.paymentDetails.paymentMethod}</td>
                  <td>{sale.invoiceNumber}</td>
                  <td>{sale.addedBy}</td> {/* New Field */}
                  <td>
                    <button
                      variant="contained"
                      size="small"
                      className="editbtn"
                      onClick={() => handleOpenReceiptModal(sale)}
                    >
                      View Receipt
                    </button>
                    <button
                      variant="contained"
                      size="small"
                      color="secondary"
                      className="deletebtn"
                      onClick={() => handleOpenDeleteModal(sale)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
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

        {/* Receipt Modal */}
        <Modal
          open={isReceiptModalOpen}
          onClose={handleCloseReceiptModal}
          aria-labelledby="receipt-modal-title"
          aria-describedby="receipt-modal-description"
        >
          <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
            <div className="modal-content custom-modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="receipt-modal-title">
                  Transaction Receipt
                </h5>
                <Button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCloseReceiptModal}
                />
              </div>
              {selectedSale && (
                <div className="modal-body" id="receipt-modal-description">
                  <p>
                    <strong>Invoice Number:</strong>{" "}
                    {selectedSale.invoiceNumber}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedSale.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {new Date(selectedSale.date).toLocaleTimeString()}
                  </p>
                  <p>
                    <strong>Customer:</strong> {selectedSale.customerName}
                  </p>
                  <p>
                    <strong>Contact:</strong> {selectedSale.contactNumber}
                  </p>
                  <p>
                    <strong>Products:</strong>
                  </p>
                  <ul>
                    {selectedSale.products.map((product, index) => (
                      <li key={index}>
                        {product.name} - {product.qty} x Rs.
                        {product.price.toFixed(2)} = Rs.
                        {(product.qty * product.price).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Total:</strong> Rs.{selectedSale.total.toFixed(2)}
                  </p>
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {selectedSale.paymentDetails.paymentMethod}
                  </p>
                  <div className="d-flex justify-content-end">
                    <button
                      variant="contained"
                      onClick={downloadReceipt}
                      className="sharebutton"
                    >
                      Download PDF
                    </button>
                    <button
                      variant="contained"
                      onClick={printReceipt}
                      className="sharebutton"
                    >
                      Print Receipt
                    </button>
                    <button
                      variant="contained"
                      onClick={shareReceipt}
                      className="sharebutton"
                    >
                      Share
                    </button>
                    <button
                      variant="contained"
                      onClick={handleCloseReceiptModal}
                      className="closebutton"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
        >
          <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
            <div className="modal-content custom-modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="delete-modal-title">
                  Admin Authentication Required
                </h5>
                <Button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCloseDeleteModal}
                />
              </div>
              <div className="modal-body" id="delete-modal-description">
                <TextField
                  label="Admin Email"
                  type="email"
                  fullWidth
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  margin="normal"
                />
                <TextField
                  label="Admin Password"
                  type="password"
                  fullWidth
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  margin="normal"
                />
                {deleteError && <p className="text-danger">{deleteError}</p>}
                <div className="d-flex justify-content-end mt-3">
                  <button
                    variant="contained"
                    color="secondary"
                    onClick={handleDeleteSale}
                    className="deletebtn"
                  >
                    Delete Sale
                  </button>
                  <button
                    variant="contained"
                    onClick={handleCloseDeleteModal}
                    className="editbtn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SalesHistory;
