import React, { useState } from 'react';
import { Button, Modal } from '@mui/material';
import jsPDF from 'jspdf'; // Import jsPDF for PDF generation
import './SalesHistory.scss';

const SalesHistory = () => {
  const [salesHistory, setSalesHistory] = useState([
    // Example data; this should be fetched from a database or global state
    {
      date: '2024-08-29',
      customerName: 'John Doe',
      contactNumber: '123-456-7890',
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
  const [selectedSale, setSelectedSale] = useState(null);

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
  // Function to share the receipt via WhatsApp and email
const shareReceipt = () => {
    if (!selectedSale) return;
  
    const doc = new jsPDF();
    const formattedDate = new Date(selectedSale.date).toLocaleDateString();
    const formattedTime = new Date(selectedSale.date).toLocaleTimeString();
  
    doc.setFontSize(18);
    doc.text('Transaction Receipt', 14, 22);
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${selectedSale.invoiceNumber}`, 14, 30);
    doc.text(`Date: ${formattedDate}`, 14, 36);
    doc.text(`Time: ${formattedTime}`, 14, 42);
  
    doc.text('Customer:', 14, 50);
    doc.text(`Name: ${selectedSale.customerName}`, 14, 56);
    doc.text(`Contact: ${selectedSale.contactNumber}`, 14, 62);
  
    doc.text('Products:', 14, 74);
    if (selectedSale.products) {
      selectedSale.products.forEach((product, index) => {
        const y = 80 + index * 6;
        doc.text(
          `${product.name} - ${product.qty} x Rs.${product.price.toFixed(2)} = Rs.${(
            product.qty * product.price
          ).toFixed(2)}`,
          14,
          y
        );
      });
    }
  
    doc.text(`Total: Rs.${selectedSale.total.toFixed(2)}`, 14, 100);
    doc.text(`Payment Method: ${selectedSale.paymentDetails.paymentMethod}`, 14, 106);
  
    const pdfBlob = doc.output('blob');
    const pdfURL = URL.createObjectURL(pdfBlob);
  
    const whatsappMessage = `Receipt for ${selectedSale.customerName}\nTotal: Rs. ${selectedSale.total.toFixed(2)}\nDownload PDF: ${pdfURL}`;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
  
    const emailSubject = `Receipt for ${selectedSale.customerName}`;
    const emailBody = `Receipt for ${selectedSale.customerName}\nTotal: Rs. ${selectedSale.total.toFixed(2)}\nDownload PDF: ${pdfURL}`;
    const mailtoURL = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  
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

  return (
    <div className="sales-history-page">
        <br/><br/><br/><br/><br/>
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
    </div>
  );
};

export default SalesHistory;
