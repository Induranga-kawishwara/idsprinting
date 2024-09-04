// SalesHistory.jsx
import React, { useState } from 'react';
import { Button, Modal, TextField } from '@mui/material';
import jsPDF from 'jspdf'; // Import jsPDF for PDF generation
import './SalesHistory.scss';

const SalesHistory = () => {
  const [salesHistory, setSalesHistory] = useState([
    // Example data; this should be fetched from a database or global state
    {
      date: '2024-08-29',
      customerName: 'John Doe',
      contactNumber: '0778178584',
      total: 1000,
      paymentDetails: { paymentMethod: 'Cash' },
      invoiceNumber: 'INV-12345',
      products: [
        { name: 'Shirts', qty: 2, price: 200 },
        { name: 'Pants', qty: 1, price: 300 },
      ],
    },
    // Add more sales records as needed
  ]);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Function to generate a PDF receipt
  const generatePDFReceipt = (sale) => {
    const doc = new jsPDF();
    const formattedDate = new Date(sale.date).toLocaleDateString();
    const formattedTime = new Date(sale.date).toLocaleTimeString();

    doc.setFontSize(18);
    doc.text('Transaction Receipt', 14, 22);
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${sale.invoiceNumber}`, 14, 30);
    doc.text(`Date: ${formattedDate}`, 14, 36);
    doc.text(`Time: ${formattedTime}`, 14, 42);

    doc.text('Customer:', 14, 50);
    doc.text(`Name: ${sale.customerName}`, 14, 56);
    doc.text(`Contact: ${sale.contactNumber}`, 14, 62);

    doc.text('Products:', 14, 74);
    sale.products.forEach((product, index) => {
      const y = 80 + index * 6;
      doc.text(
        `${product.name} - ${product.qty} x Rs.${product.price.toFixed(2)} = Rs.${(
          product.qty * product.price
        ).toFixed(2)}`,
        14,
        y
      );
    });

    doc.text(`Total: Rs.${sale.total.toFixed(2)}`, 14, 100);
    doc.text(`Payment Method: ${sale.paymentDetails.paymentMethod}`, 14, 106);

    return doc;
  };

  // Function to handle opening the receipt modal
  const handleOpenReceiptModal = (sale) => {
    setSelectedSale(sale);
    setIsReceiptModalOpen(true);
  };

  // Function to handle closing the receipt modal
  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedSale(null);
  };

  // Function to download the receipt
  const downloadReceipt = () => {
    if (!selectedSale) return;
    const doc = generatePDFReceipt(selectedSale);
    doc.save(`receipt_${selectedSale.invoiceNumber}.pdf`);
  };

  // Function to print the receipt
  const printReceipt = () => {
    if (!selectedSale) return;
    const doc = generatePDFReceipt(selectedSale);
    const pdfBlob = doc.output('blob');
    const pdfURL = URL.createObjectURL(pdfBlob);

    const printWindow = window.open(pdfURL, '_blank');
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // Function to share the receipt via WhatsApp and email
  const shareReceipt = () => {
    if (!selectedSale) return;
  
    const formattedDate = new Date(selectedSale.date).toLocaleDateString();
    const formattedTime = new Date(selectedSale.date).toLocaleTimeString();
  
    // Construct the text message for sharing
    const textMessage = `IDS Printing House\nTransaction Receipt\nInvoice Number: ${selectedSale.invoiceNumber}\nDate: ${formattedDate}\nTime: ${formattedTime}\n\nCustomer:\nName: ${selectedSale.customerName}\nContact: ${selectedSale.contactNumber}\n\nProducts:\n${selectedSale.products
      .map(
        (product) =>
          `${product.name} - ${product.qty} x Rs.${product.price.toFixed(2)} = Rs.${(
            product.qty * product.price
          ).toFixed(2)}`
      )
      .join('\n')}\n\nTotal: Rs.${selectedSale.total.toFixed(2)}\nPayment Method: ${selectedSale.paymentDetails.paymentMethod}`;
  
    // Construct the WhatsApp and Email URLs with the text message
    const whatsappURL = `https://wa.me/+94${selectedSale.contactNumber}?text=${encodeURIComponent(textMessage)}`;
    const emailSubject = `Receipt for ${selectedSale.customerName}`;
    const emailBody = textMessage;
    const mailtoURL = `mailto:?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
  
    // Open the share options
    window.open(whatsappURL, '_blank'); // Open WhatsApp
    window.open(mailtoURL, '_blank'); // Open Email
  };
  
  
  // Function to prompt the user for receipt options after generating
  const promptReceiptOptions = () => {
    if (!selectedSale) return;
    const choice = window.confirm("Payment completed. Would you like to download the PDF, print the receipt, or share it?");

    if (choice) {
      setIsReceiptModalOpen(true); // Open the receipt modal
    }
  };

  // Function to handle opening the delete modal
  const handleOpenDeleteModal = (sale) => {
    setSelectedSale(sale);
    setIsDeleteModalOpen(true);
  };

  // Function to handle closing the delete modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setAdminEmail('');
    setAdminPassword('');
    setDeleteError('');
  };

  // Function to handle delete sale after admin authentication
  const handleDeleteSale = () => {
    // Example admin credentials; replace with actual authentication logic
    const adminCredentials = {
      email: 'admin@example.com',
      password: 'password123',
    };

    if (adminEmail === adminCredentials.email && adminPassword === adminCredentials.password) {
      setSalesHistory((prevSales) =>
        prevSales.filter((sale) => sale.invoiceNumber !== selectedSale.invoiceNumber)
      );
      handleCloseDeleteModal();
    } else {
      setDeleteError('Invalid email or password.');
    }
  };

  return (
    <div className="sales-history-page">
      <br /><br /><br /><br /><br />
      <h2>Sales History</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Contact Number</th>
            <th>Total Amount (Rs.)</th>
            <th>Payment Method</th>
            <th>Invoice Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {salesHistory.map((sale, index) => (
            <tr key={index}>
              <td>{new Date(sale.date).toLocaleDateString()}</td>
              <td>{sale.customerName}</td>
              <td>{sale.contactNumber}</td>
              <td>{sale.total.toFixed(2)}</td>
              <td>{sale.paymentDetails.paymentMethod}</td>
              <td>{sale.invoiceNumber}</td>
              <td>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleOpenReceiptModal(sale)}
                >
                  View Receipt
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="secondary"
                  onClick={() => handleOpenDeleteModal(sale)}
                  style={{ marginLeft: '8px' }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="contained" onClick={() => window.history.back()}>
        Back to Sales
      </Button>

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
                <p><strong>Invoice Number:</strong> {selectedSale.invoiceNumber}</p>
                <p><strong>Date:</strong> {new Date(selectedSale.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(selectedSale.date).toLocaleTimeString()}</p>
                <p><strong>Customer:</strong> {selectedSale.customerName}</p>
                <p><strong>Contact:</strong> {selectedSale.contactNumber}</p>
                <p><strong>Products:</strong></p>
                <ul>
                  {selectedSale.products.map((product, index) => (
                    <li key={index}>
                      {product.name} - {product.qty} x Rs.{product.price.toFixed(2)} = Rs.{(product.qty * product.price).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p><strong>Total:</strong> Rs.{selectedSale.total.toFixed(2)}</p>
                <p><strong>Payment Method:</strong> {selectedSale.paymentDetails.paymentMethod}</p>
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
              {deleteError && (
                <p className="text-danger">{deleteError}</p>
              )}
              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleDeleteSale}
                >
                  Delete Sale
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCloseDeleteModal}
                  className="ms-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesHistory;
