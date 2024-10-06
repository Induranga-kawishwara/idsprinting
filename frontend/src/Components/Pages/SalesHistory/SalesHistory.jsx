import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, TextField } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import {
  ShareReceipt,
  PrintReceipt,
  DownloadReceipt,
} from "../../Reusable/ShareReceipt/ShareReceipt.js";
import TableChecker from "../../Reusable/TableChecker/TableChecker.js";
import _ from "lodash";
import socket from "../../Utility/SocketConnection.js";

const SalesHistory = () => {
  const [salesHistory, setSalesHistory] = useState([]);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const SalesHistoryDetails = await axios.get(
          "https://candied-chartreuse-concavenator.glitch.me/payment"
        );

        setSalesHistory(SalesHistoryDetails.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    socket.on("PaymentAdded", (newsale) => {
      setSalesHistory((prevSales) => [newsale, ...prevSales]);
    });

    socket.on("customerDeleted", ({ id }) => {
      setSalesHistory((prevSales) =>
        prevSales.filter((sale) => sale.id !== id)
      );
    });

    socket.on("PaymentDeleted", ({ paymentId }) => {
      setSalesHistory((prevSales) =>
        prevSales.filter((sale) => sale.paymentId !== paymentId)
      );
    });
    return () => {
      socket.off("PaymentAdded");
      socket.off("PaymentDeleted");

      socket.off("customerDeleted");
    };
  }, [salesHistory]);

  // Function to handle delete sale after admin authentication
  const handleDeleteSale = async () => {
    console.log(selectedSale);
    // Example admin credentials; replace with actual authentication logic
    const adminCredentials = {
      email: "admin@example.com",
      password: "password123",
    };

    if (
      adminEmail === adminCredentials.email &&
      adminPassword === adminCredentials.password
    ) {
      const confirmDelete = window.confirm(
        `Do you want to delete: ${selectedSale.invoicenumber}?`
      );

      if (confirmDelete) {
        try {
          const response = await axios.delete(
            `https://candied-chartreuse-concavenator.glitch.me/payment/${selectedSale.id}/${selectedSale.paymentId}`
          );

          alert(response.data.message);
        } catch (error) {
          console.error("Error deleting details:", error);
          alert("Failed to delete the details. Please try again.");
        }
      }

      handleCloseDeleteModal();
    } else {
      setDeleteError("Invalid email or password.");
    }
  };

  // Filter sales based on search, type, and date range
  const filteredSales = useMemo(() => {
    return salesHistory.filter((sale) => {
      const matchesSearch =
        sale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.contactNumber.includes(searchQuery);

      const matchesType = filterType
        ? sale.paymentDetails.paymentMethod === filterType
        : true;

      const matchesDateRange =
        (!dateRange.start ||
          new Date(sale.lastUpdatedDate) >= dateRange.start) &&
        (!dateRange.end || new Date(sale.lastUpdatedDate) <= dateRange.end);

      return matchesSearch && matchesType && matchesDateRange;
    });
  }, [salesHistory, searchQuery, filterType, dateRange]);

  // Function to clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterType("");
    setDateRange({ start: null, end: null });
  };

  const handleOpenReceiptModal = (sale) => {
    setSelectedSale(sale);
    setIsReceiptModalOpen(true);
  };

  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedSale(null);
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

  const ROWS_PER_PAGE = 100; // Maximum rows per page
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate total pages based on sales history
  const totalPages = Math.ceil(filteredSales.length / ROWS_PER_PAGE);

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
        <div>
          <button
            className="addnewbtntop"
            variant="contained"
            onClick={() => window.history.back()}
          >
            Back to Sales
          </button>
          {loading || error || _.isEmpty(filteredSales) ? (
            <TableChecker
              loading={loading}
              error={error}
              hasData={filteredSales.length > 0}
            />
          ) : (
            <div>
              <div className="table-responsive">
                <table className="table mt-3 custom-table">
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
                  <tbody className="custom-table">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id}>
                        <td>
                          {new Date(sale.lastUpdatedDate).toLocaleDateString()}
                        </td>
                        <td>{`${sale.name || ""} ${sale.surName || ""}`}</td>
                        <td>{sale.contactNumber}</td>
                        <td>{Number(sale.transaction.net).toFixed(2)}</td>
                        <td>{sale.paymentDetails.paymentMethod}</td>
                        <td>{sale.invoicenumber}</td>
                        <td>
                          <button
                            variant="contained"
                            size="small"
                            className="editbtn"
                            onClick={() => handleOpenReceiptModal(sale)}
                            aria-label={`View receipt for ${sale.name} ${sale.surName}`}
                          >
                            View Receipt
                          </button>
                          <button
                            variant="contained"
                            size="small"
                            color="secondary"
                            className="deletebtn"
                            onClick={() => handleOpenDeleteModal(sale)}
                            aria-label={`Delete sale for ${sale.name} ${sale.surName}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>{" "}
              {/* Pagination Controls */}
              <div className="pagination">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 0))
                  }
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
            </div>
          )}
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
                    {selectedSale.invoicenumber}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(
                      selectedSale.lastUpdatedDate
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {new Date(
                      selectedSale.lastUpdatedDate
                    ).toLocaleTimeString()}
                  </p>
                  <p>
                    <strong>Customer:</strong>{" "}
                    {`${selectedSale.name || ""} ${selectedSale.surName || ""}`}
                  </p>
                  <p>
                    <strong>Contact:</strong> {selectedSale.contactNumber}
                  </p>
                  <p>
                    <strong>Products:</strong>
                  </p>
                  <ul>
                    {selectedSale.transaction.products.map((product, index) => (
                      <li key={index}>
                        {product.itemName} - {product.qty} x Rs.
                        {Number(product.preItemsellingprice).toFixed(2)} = Rs.
                        {(
                          Number(product.qty) *
                          Number(product.preItemsellingprice)
                        ).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Total:</strong> Rs.
                    {Number(selectedSale.transaction.net).toFixed(2)}
                  </p>
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {selectedSale.paymentDetails.paymentMethod}
                  </p>

                  <div className="d-flex justify-content-end">
                    <button
                      variant="contained"
                      onClick={() =>
                        DownloadReceipt(
                          {
                            name: selectedSale.name,
                            surname: selectedSale.surName,
                            phone: selectedSale.contactNumber,
                          },
                          selectedSale.paymentDetails,
                          selectedSale.transaction,
                          selectedSale.invoicenumber
                        )
                      }
                      className="sharebutton"
                    >
                      Download PDF
                    </button>
                    <button
                      variant="contained"
                      onClick={() =>
                        PrintReceipt(
                          {
                            name: selectedSale.name,
                            surname: selectedSale.surName,
                            phone: selectedSale.contactNumber,
                          },
                          selectedSale.paymentDetails,
                          selectedSale.transaction,
                          selectedSale.invoicenumber
                        )
                      }
                      className="sharebutton"
                    >
                      Print Receipt
                    </button>
                    <button
                      variant="contained"
                      onClick={() =>
                        ShareReceipt(
                          {
                            name: selectedSale.name,
                            surname: selectedSale.surName,
                            phone: selectedSale.contactNumber,
                          },
                          selectedSale.paymentDetails,
                          selectedSale.transaction,
                          selectedSale.invoicenumber
                        )
                      }
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
