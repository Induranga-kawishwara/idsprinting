import React, { useState } from 'react';
import { Button } from '@mui/material';
import './SalesHistory.scss';

const SalesHistory = () => {
  const [salesHistory, setSalesHistory] = useState([
    // This should be fetched from a database or global state
  ]);

  return (
    <div className="sales-history-page">
      <h2>Sales History</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Total Amount (Rs.)</th>
            <th>Payment Method</th>
            <th>Invoice Number</th>
          </tr>
        </thead>
        <tbody>
          {salesHistory.map((sale, index) => (
            <tr key={index}>
              <td>{new Date(sale.date).toLocaleDateString()}</td>
              <td>{sale.customerName}</td>
              <td>{sale.total.toFixed(2)}</td>
              <td>{sale.paymentDetails.paymentMethod}</td>
              <td>{sale.invoiceNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="contained" onClick={() => window.history.back()}>
        Back to Sales
      </Button>
    </div>
  );
};

export default SalesHistory;
