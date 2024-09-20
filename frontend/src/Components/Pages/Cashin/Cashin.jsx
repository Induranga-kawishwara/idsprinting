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

// Constants for pagination
const ITEMS_PER_PAGE = 100;

const CashinSchema = Yup.object().shape({
  reasonName: Yup.string().required("Reason Name is required"),
  incomeOrOther: Yup.string().required("This field is required"),
  reasonDetails: Yup.string().when("incomeOrOther", {
    is: "Other",
    then: (schema) => schema.required("Reason details are required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  amount: Yup.number().required("Amount is required"),
  addedBy: Yup.string().required("Added By is required"),
});

const Cashin = () => {
  const [cashins, setCashins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCashin, setEditingCashin] = useState(null);
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

  // Function to clear all filters and search inputs
  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("");
    setDateRange({ start: null, end: null });
    setStartDate("");
    setEndDate("");
  };

  // Pagination logic
  const totalPages = Math.ceil(cashins.length / ITEMS_PER_PAGE);
  const paginatedCashins = cashins.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Filtered cashins based on search and filter criteria
  const filteredCashins = paginatedCashins.filter((cashin) => {
    const date = new Date(cashin.addedDate);
    const isWithinDateRange =
      (!startDate || date >= new Date(startDate)) &&
      (!endDate || date <= new Date(endDate));

    // Search by both reasonName and amount
    const searchValue = searchTerm.toLowerCase();
    const isSearchMatched =
      cashin.reasonName.toLowerCase().includes(searchValue) ||
      cashin.amount.toString().includes(searchValue); // Convert amount to string for comparison

    return (
      isSearchMatched &&
      (filterType === "" || cashin.incomeOrOther === filterType) &&
      isWithinDateRange
    );
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const CashinData = await axios.get(
          "https://candied-chartreuse-concavenator.glitch.me/cashin/"
        );
        const formattedCashins = CashinData.data.map((Cashin) => {
          const { date, time } = ConvertToSLT(Cashin.addedDateAndTime);

          return {
            ...Cashin,
            id: Cashin.id,
            addedDate: date,
            addedTime: time,
          };
        });

        setCashins(formattedCashins);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();

    // Listen for real-time Cashin updates
    socket.on("CashinAdded", (newCashin) => {
      const { date, time } = ConvertToSLT(newCashin.addedDateAndTime);

      const newCashinadded = {
        ...newCashin,
        addedDate: date,
        addedTime: time,
      };
      setCashins((prevCashins) => [newCashinadded, ...prevCashins]);
    });

    socket.on("CashinUpdated", (updatedCashin) => {
      const { date, time } = ConvertToSLT(updatedCashin.addedDateAndTime);

      const newupdatedCashin = {
        ...updatedCashin,
        addedDate: date,
        addedTime: time,
      };
      setCashins((prevCashins) =>
        prevCashins.map((Cashin) =>
          Cashin.id === updatedCashin.id ? newupdatedCashin : Cashin
        )
      );
    });

    socket.on("CashinDeleted", ({ id }) => {
      setCashins((prevCashins) =>
        prevCashins.filter((Cashin) => Cashin.id !== id)
      );
    });

    return () => {
      socket.off("CashinAdded");
      socket.off("CashinUpdated");
      socket.off("CashinDeleted");
    };
  }, []);

  const handleEdit = (cashin) => {
    setEditingCashin(cashin);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Do you want to delete: ${name}?`);

    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `https://candied-chartreuse-concavenator.glitch.me/cashin/Cashin/${id}`
        );

        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting details:", error);
        alert("Failed to delete the details. Please try again.");
      }
    }
  };

  const handleSubmit = async (values) => {
    const currentDate = new Date();

    if (editingCashin) {
      try {
        const dateObject = new Date(
          `${editingCashin.addedDate} ${editingCashin.addedTime}`
        );

        const isoDateString = dateObject.toISOString();

        const response = await axios.put(
          `https://candied-chartreuse-concavenator.glitch.me/cashin/Cashin/${editingCashin.id}`,
          { ...values, addedDateAndTime: isoDateString }
        );

        alert(response.data.message);
      } catch (error) {
        console.error("Error updating Cashin:", error);
        alert("Failed to update the Cashin. Please try again.");
      }
    } else {
      try {
        const response = await axios.post(
          "https://candied-chartreuse-concavenator.glitch.me/cashin/Cashin",
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
          alert("Failed to add the Cashin. Please try again.");
        }
      }
    }
    setIsModalOpen(false);
    setEditingCashin(null);
  };

  return (
    <div className="bodyofpage">
      <div className="container">
        <button
          variant="contained"
          color="primary"
          onClick={() => {
            setIsModalOpen(true);
            setEditingCashin(null);
          }}
          className="addnewbtntop"
        >
          New Cashin
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
            <option value="Income">Income</option>
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
          {loading || error || _.isEmpty(filteredCashins) ? (
            <TableChecker
              loading={loading}
              error={error}
              hasData={filteredCashins.length > 0}
            />
          ) : (
            <table className="table mt-3 custom-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Reason Name</th>
                  <th>Income/Other</th>
                  <th>Reason Details</th>
                  <th>Amount Rs</th>
                  <th>Added Date</th>
                  <th>Added Time</th>
                  <th>Added By</th> {/* New column for who added */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="custom-table">
                {filteredCashins.map((cashin, index) => (
                  <tr key={cashin.id}>
                    <td>{index + 1}</td>
                    <td>{cashin.reasonName}</td>
                    <td>{cashin.incomeOrOther}</td>
                    <td>{cashin.reasonDetails || "N/A"}</td>
                    <td>{cashin.amount}</td>
                    <td>{cashin.addedDate}</td>
                    <td>{cashin.addedTime}</td>
                    <td>{cashin.addedBy}</td> {/* Display who added */}
                    <td>
                      <button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(cashin)}
                        className="editbtn"
                      >
                        Edit
                      </button>{" "}
                      <button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() =>
                          handleDelete(cashin.id, cashin.reasonName)
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
                  {editingCashin ? "Edit Cashin" : "New Cashin"}
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
                    reasonName: editingCashin?.reasonName || "",
                    incomeOrOther: editingCashin?.incomeOrOther || "",
                    reasonDetails: editingCashin?.reasonDetails || "",
                    amount: editingCashin?.amount || "",
                    addedBy: editingCashin?.addedBy || "", // New field for who added
                  }}
                  validationSchema={CashinSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched }) => (
                    <Form>
                      <div className="mb-3">
                        <label>Reason Name</label>
                        <Field name="reasonName" className="form-control" />
                        {errors.reasonName && touched.reasonName ? (
                          <div className="text-danger">{errors.reasonName}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Income or Other</label>
                        <Field
                          as="select"
                          name="incomeOrOther"
                          className="form-control"
                        >
                          <option value="" label="Select" disabled />
                          <option value="Income">Income</option>
                          <option value="Other">Other</option>
                        </Field>
                        {errors.incomeOrOther && touched.incomeOrOther ? (
                          <div className="text-danger">
                            {errors.incomeOrOther}
                          </div>
                        ) : null}
                      </div>
                      {values.incomeOrOther === "Other" && (
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
                          <div className="text-danger">{errors.addedBy}</div>
                        ) : null}
                      </div>
                      <div className="modal-footer">
                        <button
                          type="submit"
                          variant="primary"
                          className="savechangesbutton"
                        >
                          {editingCashin ? "Update" : "Add"}
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
  );
};

export default Cashin;
