import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../All.scss";
import socket from "../../Utility/SocketConnection.js";
import _ from "lodash";
import TableChecker from "../../Reusable/TableChecker/TableChecker.js";
import { ConvertToSLT } from "../../Utility/ConvertToSLT.js";
import axios from "axios";
import Loading from "../../Reusable/Loadingcomp/Loading.jsx";

// Constants for pagination
const ITEMS_PER_PAGE = 100;

const CashupSchema = Yup.object().shape({
  reasonName: Yup.string().required("Reason Name is required"),
  profitOrOther: Yup.string().required("This field is required"),
  reasonDetails: Yup.string().when("profitOrOther", {
    is: "Other",
    then: (schema) => schema.required("Reason details are required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  amount: Yup.number().required("Amount is required"),
  addedBy: Yup.string().required("Added By is required"),
});

const Cashup = () => {
  const [cashups, setCashups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCashup, setEditingCashup] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingpage, setLoadingpage] = useState(false);

  // Function to clear all filters and search inputs
  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("");
    setDateRange({ start: null, end: null });
    setStartDate("");
    setEndDate("");
  };

  // Pagination logic
  const totalPages = Math.ceil(cashups.length / ITEMS_PER_PAGE);
  const paginatedCashups = cashups.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Filtered cashups based on search and filter criteria
  const filteredCashups = paginatedCashups.filter((cashup) => {
    const date = new Date(cashup.addedDate);
    const isWithinDateRange =
      (!startDate || date >= new Date(startDate)) &&
      (!endDate || date <= new Date(endDate));

    // Search by both reasonName and amount
    const searchValue = searchTerm.toLowerCase();
    const isSearchMatched =
      cashup.reasonName.toLowerCase().includes(searchValue) ||
      cashup.amount.toString().includes(searchValue); // Convert amount to string for comparison

    return (
      isSearchMatched &&
      (filterType === "" || cashup.profitOrOther === filterType) &&
      isWithinDateRange
    );
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const CashupData = await axios.get(
          "https://candied-chartreuse-concavenator.glitch.me/cashup/"
        );
        const formattedCashups = CashupData.data.map((Cashup) => {
          const { date, time } = ConvertToSLT(Cashup.addedDateAndTime);

          return {
            ...Cashup,
            id: Cashup.id,
            addedDate: date,
            addedTime: time,
          };
        });

        setCashups(formattedCashups);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();

    // Listen for real-time Cashup updates
    socket.on("CashupAdded", (newCashup) => {
      const { date, time } = ConvertToSLT(newCashup.addedDateAndTime);

      const newCashupadded = {
        ...newCashup,
        addedDate: date,
        addedTime: time,
      };
      setCashups((prevCashups) => [newCashupadded, ...prevCashups]);
    });

    socket.on("CashupUpdated", (updatedCashup) => {
      const { date, time } = ConvertToSLT(updatedCashup.addedDateAndTime);

      const newupdatedCashup = {
        ...updatedCashup,
        addedDate: date,
        addedTime: time,
      };
      setCashups((prevCashups) =>
        prevCashups.map((Cashup) =>
          Cashup.id === updatedCashup.id ? newupdatedCashup : Cashup
        )
      );
    });

    socket.on("CashupDeleted", ({ id }) => {
      setCashups((prevCashups) =>
        prevCashups.filter((Cashup) => Cashup.id !== id)
      );
    });

    return () => {
      socket.off("CashupAdded");
      socket.off("CashupUpdated");
      socket.off("CashupDeleted");
    };
  }, []);

  const handleEdit = (cashup) => {
    setEditingCashup(cashup);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Do you want to delete: ${name}?`);

    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `https://candied-chartreuse-concavenator.glitch.me/cashup/Cashup/${id}`
        );

        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting details:", error);
        alert("Failed to delete the details. Please try again.");
      }
    }
  };

  const handleSubmit = async (values) => {
    setLoadingpage(true);
    const currentDate = new Date();

    if (editingCashup) {
      try {
        const dateObject = new Date(
          `${editingCashup.addedDate} ${editingCashup.addedTime}`
        );

        const isoDateString = dateObject.toISOString();

        const response = await axios.put(
          `https://candied-chartreuse-concavenator.glitch.me/cashup/Cashup/${editingCashup.id}`,
          { ...values, addedDateAndTime: isoDateString }
        );

        alert(response.data.message);
      } catch (error) {
        console.error("Error updating Cashup:", error);
        alert("Failed to update the Cashup. Please try again.");
      }
    } else {
      try {
        const response = await axios.post(
          "https://candied-chartreuse-concavenator.glitch.me/cashup/Cashup",
          { ...values, addedDateAndTime: currentDate }
        );

        alert(response.data.message);
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          alert(`Error: ${error.response.data.message}`);
        } else {
          // Show a generic error message
          alert("Failed to add the customer. Please try again.");
        }
      }
    }
    setLoadingpage(false);
    setIsModalOpen(false);
    setEditingCashup(null);
  };

  return (
    <div>
      {loadingpage ? (
        <div>
          <Loading />
        </div>
      ) : (
        <div className="bodyofpage">
          <div className="container">
            <button
              variant="contained"
              color="primary"
              onClick={() => {
                setIsModalOpen(true);
                setEditingCashup(null);
              }}
              className="addnewbtntop"
            >
              New Cashup
            </button>

            <div className="d-flex align-items-center mb-3">
              <input
                type="text"
                placeholder="Search by Reason Name or Amount"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="searchfunctions me-2"
              />
              <button
                variant="contained"
                color="secondary"
                onClick={clearFilters}
                className="prevbutton"
              >
                Clear
              </button>
            </div>

            <div className="d-flex align-items-center mb-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="formdropdown"
              >
                <option value="">All Types</option>
                <option value="Profit">Profit</option>
                <option value="Other">Other</option>
              </select>
              {/* Start Date Picker */}
              <DatePicker
                selected={dateRange.start}
                onChange={(date) =>
                  setDateRange((prev) => ({ ...prev, start: date }))
                }
                selectsStart
                startDate={dateRange.start}
                endDate={dateRange.end}
                className="searchfunctionsdate me-2"
                placeholderText="S.Date"
                maxDate={dateRange.end || new Date()} // Prevent selecting a start date after the end date
              />

              {/* End Date Picker */}
              <DatePicker
                selected={dateRange.end}
                onChange={(date) =>
                  setDateRange((prev) => ({ ...prev, end: date }))
                }
                selectsEnd
                startDate={dateRange.start}
                endDate={dateRange.end}
                className="searchfunctionsdate me-2"
                placeholderText="E.Date"
                minDate={dateRange.start} // Prevent selecting an end date before the start date
              />
            </div>

            <div className="table-responsive">
              {loading || error || _.isEmpty(filteredCashups) ? (
                <TableChecker
                  loading={loading}
                  error={error}
                  hasData={filteredCashups.length > 0}
                />
              ) : (
                <table className="table mt-3 custom-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Reason Name</th>
                      <th>Profit/Other</th>
                      <th>Reason Details</th>
                      <th>Amount Rs</th>
                      <th>Added Date</th>
                      <th>Added Time</th>
                      <th>Added By</th> {/* New column for who added */}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="custom-table">
                    {filteredCashups.map((cashup, index) => (
                      <tr key={cashup.id}>
                        <td>{index + 1}</td>
                        <td>{cashup.reasonName}</td>
                        <td>{cashup.profitOrOther}</td>
                        <td>{cashup.reasonDetails || "N/A"}</td>
                        <td>{cashup.amount}</td>
                        <td>{cashup.addedDate}</td>
                        <td>{cashup.addedTime}</td>
                        <td>{cashup.addedBy}</td> {/* Display who added */}
                        <td>
                          <button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleEdit(cashup)}
                            className="editbtn"
                          >
                            Edit
                          </button>{" "}
                          <button
                            variant="contained"
                            color="secondary"
                            size="small"
                            onClick={() =>
                              handleDelete(cashup.id, cashup.reasonName)
                            }
                            className="deletebtn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
                <div className="modal-content custom-modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingCashup ? "Edit Cashup" : "New Cashup"}
                    </h5>
                    <Button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={() => setIsModalOpen(false)}
                    />
                  </div>
                  <div className="modal-body">
                    <Formik
                      initialValues={{
                        reasonName: editingCashup?.reasonName || "",
                        profitOrOther: editingCashup?.profitOrOther || "",
                        reasonDetails: editingCashup?.reasonDetails || "",
                        amount: editingCashup?.amount || "",
                        addedBy: editingCashup?.addedBy || "", // New field for who added
                      }}
                      validationSchema={CashupSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ values, errors, touched }) => (
                        <Form>
                          <div className="mb-3">
                            <label>Reason Name</label>
                            <Field name="reasonName" className="form-control" />
                            {errors.reasonName && touched.reasonName ? (
                              <div className="text-danger">
                                {errors.reasonName}
                              </div>
                            ) : null}
                          </div>
                          <div className="mb-3">
                            <label>Profit or Other</label>
                            <Field
                              as="select"
                              name="profitOrOther"
                              className="form-control"
                            >
                              <option value="" label="Select" disabled />
                              <option value="Profit">Profit</option>
                              <option value="Other">Other</option>
                            </Field>
                            {errors.profitOrOther && touched.profitOrOther ? (
                              <div className="text-danger">
                                {errors.profitOrOther}
                              </div>
                            ) : null}
                          </div>
                          {values.profitOrOther === "Other" && (
                            <div className="mb-3">
                              <label>Reason Details</label>
                              <Field
                                name="reasonDetails"
                                className="form-control"
                              />
                              {errors.reasonDetails && touched.reasonDetails ? (
                                <div className="text-danger">
                                  {errors.reasonDetails}
                                </div>
                              ) : null}
                            </div>
                          )}
                          <div className="mb-3">
                            <label>Amount Rs</label>
                            <Field name="amount" className="form-control" />
                            {errors.amount && touched.amount ? (
                              <div className="text-danger">{errors.amount}</div>
                            ) : null}
                          </div>
                          <div className="mb-3">
                            <label>Added By</label>
                            <Field name="addedBy" className="form-control" />
                            {errors.addedBy && touched.addedBy ? (
                              <div className="text-danger">
                                {errors.addedBy}
                              </div>
                            ) : null}
                          </div>
                          <div className="modal-footer">
                            <button
                              type="submit"
                              variant="primary"
                              className="savechangesbutton"
                            >
                              {editingCashup ? "Update" : "Add"}
                            </button>
                            <button
                              variant="secondary"
                              onClick={() => setIsModalOpen(false)}
                              className="closebutton"
                            >
                              Cancel
                            </button>
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
      )}
    </div>
  );
};

export default Cashup;
