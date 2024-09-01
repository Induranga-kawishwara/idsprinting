import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import "./Cashup.scss"; // Create this file for your styles

const initialCashups = [
  {
    id: 1,
    reasonName: "Sale",
    profitOrOther: "Profit",
    reasonDetails: "",
    amount: "5000.00",
    addedDate: "2024-08-13",
    addedTime: "15:00",
  },
  // Add more cashups if needed
];

const CashupSchema = Yup.object().shape({
  reasonName: Yup.string().required("Reason Name is required"),
  profitOrOther: Yup.string().required("This field is required"),
  reasonDetails: Yup.string().when("profitOrOther", {
    is: "Other",
    then: (schema) => schema.required("Reason details are required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  amount: Yup.number().required("Amount is required"),
});

const Cashup = () => {
  const [cashups, setCashups] = useState(initialCashups);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCashup, setEditingCashup] = useState(null);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filtered cashups based on search and filter criteria
  const filteredCashups = cashups.filter((cashup) => {
    const date = new Date(cashup.addedDate);
    const isWithinDateRange =
      (!startDate || date >= new Date(startDate)) &&
      (!endDate || date <= new Date(endDate));

    return (
      (searchTerm === "" ||
        cashup.reasonName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === "" || cashup.profitOrOther === filterType) &&
      isWithinDateRange
    );
  });

  const handleEdit = (cashup) => {
    setEditingCashup(cashup);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setCashups(cashups.filter((cashup) => cashup.id !== id));
  };

  const handleSubmit = (values) => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const formattedTime = currentDate.toTimeString().split(" ")[0];

    if (editingCashup) {
      setCashups(
        cashups.map((cashup) =>
          cashup.id === editingCashup.id
            ? {
                ...values,
                id: editingCashup.id,
                addedDate: cashup.addedDate,
                addedTime: cashup.addedTime,
              }
            : cashup
        )
      );
    } else {
      setCashups([
        ...cashups,
        {
          ...values,
          id: cashups.length + 1,
          addedDate: formattedDate,
          addedTime: formattedTime,
        },
      ]);
    }
    setIsModalOpen(false);
    setEditingCashup(null);
  };

  return (
    <div className="cashup">
      <div className="container mt-4">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
          className="new-cashup-btn"
        >
          New Cashup
        </Button>

        {/* Search and filter UI */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search by Reason Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control mb-3"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-control mb-3"
          >
            <option value="">All Types</option>
            <option value="Profit">Profit</option>
            <option value="Other">Other</option>
          </select>
          <div className="mb-3">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
        <div class="table-responsive">
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>ID</th>
                <th>Reason Name</th>
                <th>Profit/Other</th>
                <th>Reason Details</th>
                <th>Amount Rs</th>
                <th>Added Date</th>
                <th>Added Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCashups.map((cashup) => (
                <tr key={cashup.id}>
                  <td>{cashup.id}</td>
                  <td>{cashup.reasonName}</td>
                  <td>{cashup.profitOrOther}</td>
                  <td>{cashup.reasonDetails || "N/A"}</td>
                  <td>{cashup.amount}</td>
                  <td>{cashup.addedDate}</td>
                  <td>{cashup.addedTime}</td>
                  <td>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleEdit(cashup)}
                      className="edit-btn"
                    >
                      Edit
                    </Button>{" "}
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => handleDelete(cashup.id)}
                      className="delete-btn"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                          <div className="text-danger">{errors.reasonName}</div>
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
                      <div className="modal-footer">
                        <Button
                          variant="secondary"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                          {editingCashup ? "Update" : "Add"}
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

export default Cashup;
