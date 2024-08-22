import React, { useState, useCallback, useMemo } from "react";
import { useTable } from "react-table";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import "./Expenses.scss"; // Create this file for your styles

const initialExpenses = [
  {
    id: 1,
    name: "Office Rent",
    type: "Electricity Bill",
    supplier: "",
    other: "",
    description: "Monthly office rent payment",
    amount: "2000.00",
    addedDate: "2024-08-13",
    addedTime: "14:30",
  },
  // Add more expenses if needed
];

const ExpenseSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  type: Yup.string().required("Type of Expenses is required"),
  supplier: Yup.string().when("type", {
    is: "Suppliers",
    then: Yup.string().required("Supplier is required"),
    otherwise: Yup.string().nullable(),
  }),
  other: Yup.string().when("type", {
    is: "Others",
    then: Yup.string().required("Other details are required"),
    otherwise: Yup.string().nullable(),
  }),
  description: Yup.string(),
  amount: Yup.number().required("Amount is required"),
});

const Expenses = () => {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(
    (id) => {
      setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== id));
    },
    [setExpenses]
  );

  const handleSubmit = (values) => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const formattedTime = currentDate.toTimeString().split(" ")[0]; // HH:MM:SS

    if (editingExpense) {
      setExpenses(
        expenses.map((expense) =>
          expense.id === editingExpense.id
            ? {
                ...values,
                id: editingExpense.id,
                addedDate: expense.addedDate,
                addedTime: expense.addedTime,
              }
            : expense
        )
      );
    } else {
      setExpenses([
        ...expenses,
        {
          ...values,
          id: expenses.length + 1,
          addedDate: formattedDate,
          addedTime: formattedTime,
        },
      ]);
    }
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Name", accessor: "name" },
      { Header: "Type of Expenses", accessor: "type" },
      { Header: "Supplier", accessor: "supplier" },
      { Header: "Other", accessor: "other" },
      { Header: "Description", accessor: "description" },
      { Header: "Amount Rs", accessor: "amount" },
      { Header: "Added Date", accessor: "addedDate" },
      { Header: "Added Time", accessor: "addedTime" },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleEdit(row.original)}
              className="edit-btn"
            >
              Edit
            </Button>{" "}
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleDelete(row.original.id)}
              className="delete-btn"
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [handleDelete]
  );

  const data = useMemo(() => filteredExpenses, [filteredExpenses]);

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div className="expenses">
      <div className="container mt-4">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
          className="new-expense-btn"
        >
          New Expense
        </Button>
        <div className="mt-3 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <table {...getTableProps()} className="table table-striped mt-3">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Form Modal */}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
            <div className="modal-content custom-modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingExpense ? "Edit Expense" : "New Expense"}
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
                    name: editingExpense?.name || "",
                    type: editingExpense?.type || "",
                    supplier: editingExpense?.supplier || "",
                    other: editingExpense?.other || "",
                    description: editingExpense?.description || "",
                    amount: editingExpense?.amount || "",
                    // Remove these fields from initialValues
                  }}
                  validationSchema={ExpenseSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched }) => (
                    <Form>
                      <div className="mb-3">
                        <label>Name</label>
                        <Field name="name" className="form-control" />
                        {errors.name && touched.name ? (
                          <div className="text-danger">{errors.name}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Type of Expenses</label>
                        <Field as="select" name="type" className="form-control">
                          <option value="" label="Select a type" disabled />
                          <option value="Electricity Bill">Electricity Bill</option>
                          <option value="Water Bill">Water Bill</option>
                          <option value="Internet Bill">Internet Bill</option>
                          <option value="Suppliers">Suppliers</option>
                          <option value="Others">Others</option>
                        </Field>
                        {errors.type && touched.type ? (
                          <div className="text-danger">{errors.type}</div>
                        ) : null}
                      </div>
                      {values.type === "Suppliers" && (
                        <div className="mb-3">
                          <label>Supplier</label>
                          <Field name="supplier" className="form-control" />
                          {errors.supplier && touched.supplier ? (
                            <div className="text-danger">{errors.supplier}</div>
                          ) : null}
                        </div>
                      )}
                      {values.type === "Others" && (
                        <div className="mb-3">
                          <label>Other</label>
                          <Field name="other" className="form-control" />
                          {errors.other && touched.other ? (
                            <div className="text-danger">{errors.other}</div>
                          ) : null}
                        </div>
                      )}
                      <div className="mb-3">
                        <label>Description</label>
                        <Field name="description" as="textarea" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label>Amount Rs</label>
                        <Field name="amount" type="number" className="form-control" />
                        {errors.amount && touched.amount ? (
                          <div className="text-danger">{errors.amount}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Added Date</label>
                        <Field
                          name="addedDate"
                          type="date"
                          className="form-control"
                          readOnly
                          value={editingExpense?.addedDate || new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="mb-3">
                        <label>Added Time</label>
                        <Field
                          name="addedTime"
                          type="time"
                          className="form-control"
                          readOnly
                          value={editingExpense?.addedTime || new Date().toTimeString().split(" ")[0]}
                        />
                      </div>
                      <div className="modal-footer">
                        <Button type="submit" variant="contained" color="primary">
                          {editingExpense ? "Update" : "Add"}
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => setIsModalOpen(false)}
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
      </div>
    </div>
  );
};

export default Expenses;
