import React, { useState, useCallback, useMemo } from "react";
import { useTable } from "react-table";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Expenses.scss"; // Create this file for your styles

const initialExpenses = [
  {
    id: 1,
    name: "Office Rent",
    type: "Electricity Bill",
    supplier: "",
    other: "",
    description: "",
    amount: "2000.00",
    addedDate: "2024-08-13",
    addedTime: "14:30",
    invoiceNumber: "",
    photo: "",
    paymentMethod: "Card",
  },
  // Add more expenses if needed
];

const suppliers = [
  { id: 1, name: "Supplier A" },
  { id: 2, name: "Supplier B" },
  { id: 3, name: "Supplier C" },
  // Add more suppliers as needed
];

const ExpenseSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  type: Yup.string().required("Type of Expenses is required"),
  supplier: Yup.string().when("type", {
    is: "Suppliers",
    then: (schema) => schema.required("Supplier is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  other: Yup.string().when("type", {
    is: "Others",
    then: (schema) => schema.required("Other details are required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  description: Yup.string(),
  amount: Yup.number().required("Amount is required"),
  invoiceNumber: Yup.string().nullable(),
  photo: Yup.mixed().nullable(),
  paymentMethod: Yup.string().required("Payment method is required"),
  bankTransferNumber: Yup.string().when("paymentMethod", {
    is: "Bank Transfer",
    then: (schema) => schema.required("Bank Transfer Number is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  chequeNumber: Yup.string().when("paymentMethod", {
    is: "Cheque",
    then: (schema) => schema.required("Cheque Number is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
});

const Expenses = () => {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(
    (id) => {
      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== id)
      );
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

  const filteredExpenses = expenses.filter((expense) => {
    const searchString = searchQuery.toLowerCase().trim();
    const expenseDate = new Date(expense.addedDate);
    const isWithinDateRange =
      (!startDate || expenseDate >= startDate) &&
      (!endDate || expenseDate <= endDate);
    const matchesPaymentMethod =
      !paymentMethodFilter || expense.paymentMethod === paymentMethodFilter;

    return (
      isWithinDateRange &&
      matchesPaymentMethod &&
      (expense.name.toLowerCase().includes(searchString) ||
        expense.invoiceNumber.toLowerCase().includes(searchString) ||
        expense.amount.toString().includes(searchString))
    );
  });

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Name", accessor: "name" },
      { Header: "Type of Expenses", accessor: "type" },
      { Header: "Supplier", accessor: "supplier" },
      { Header: "Other", accessor: "other" },
      { Header: "Description", accessor: "description" },
      { Header: "Amount Rs", accessor: "amount" },
      { Header: "Payment Method", accessor: "paymentMethod" },
      { Header: "Added Date", accessor: "addedDate" },
      { Header: "Added Time", accessor: "addedTime" },
      { Header: "Invoice Number", accessor: "invoiceNumber" },
      {
        Header: "Photo",
        accessor: "photo",
        Cell: ({ value }) =>
          value ? <span>{value.name}</span> : <span>No file uploaded</span>,
      },
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
            placeholder="Search by Name, Amount, and Invoice Number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Filter by Date Range:</label>
          <div className="d-flex">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              className="form-control me-2"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              className="form-control"
            />
          </div>
        </div>
        <div className="mb-3">
          <label>Filter by Payment Method:</label>
          <select
            className="form-control"
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
          </select>
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

        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingExpense ? "Edit Expense" : "Add New Expense"}
                </h5>
                <Button
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                ></Button>
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
                    invoiceNumber: editingExpense?.invoiceNumber || "",
                    photo: editingExpense?.photo || null,
                    paymentMethod: editingExpense?.paymentMethod || "",
                    bankTransferNumber:
                      editingExpense?.bankTransferNumber || "",
                    chequeNumber: editingExpense?.chequeNumber || "",
                  }}
                  validationSchema={ExpenseSchema}
                  onSubmit={handleSubmit}
                >
                  {({ setFieldValue, errors, touched, values }) => (
                    <Form>
                      <div className="mb-3">
                        <label htmlFor="name">Name</label>
                        <Field
                          name="name"
                          className={`form-control ${
                            errors.name && touched.name
                              ? "is-invalid"
                              : touched.name
                              ? "is-valid"
                              : ""
                          }`}
                        />
                        {errors.name && touched.name ? (
                          <div className="invalid-feedback">{errors.name}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="type">Type of Expenses</label>
                        <Field
                          as="select"
                          name="type"
                          className={`form-control ${
                            errors.type && touched.type
                              ? "is-invalid"
                              : touched.type
                              ? "is-valid"
                              : ""
                          }`}
                        >
                          <option value="">Select Type</option>
                          <option value="Suppliers">Suppliers</option>
                          <option value="Others">Others</option>
                          <option value="Electricity Bill">
                            Electricity Bill
                          </option>
                          <option value="Gas Bill">Gas Bill</option>
                          <option value="Phone Bill">Phone Bill</option>
                        </Field>
                        {errors.type && touched.type ? (
                          <div className="invalid-feedback">{errors.type}</div>
                        ) : null}
                      </div>
                      {values.type === "Suppliers" && (
                        <div className="mb-3">
                          <label htmlFor="supplier">Supplier</label>
                          <Field
                            as="select"
                            name="supplier"
                            className={`form-control ${
                              errors.supplier && touched.supplier
                                ? "is-invalid"
                                : touched.supplier
                                ? "is-valid"
                                : ""
                            }`}
                          >
                            <option value="">Select Supplier</option>
                            {suppliers.map((supplier) => (
                              <option key={supplier.id} value={supplier.name}>
                                {supplier.name}
                              </option>
                            ))}
                          </Field>
                          {errors.supplier && touched.supplier ? (
                            <div className="invalid-feedback">
                              {errors.supplier}
                            </div>
                          ) : null}
                        </div>
                      )}
                      {values.type === "Others" && (
                        <div className="mb-3">
                          <label htmlFor="other">Other Details</label>
                          <Field
                            name="other"
                            className={`form-control ${
                              errors.other && touched.other
                                ? "is-invalid"
                                : touched.other
                                ? "is-valid"
                                : ""
                            }`}
                          />
                          {errors.other && touched.other ? (
                            <div className="invalid-feedback">
                              {errors.other}
                            </div>
                          ) : null}
                        </div>
                      )}
                      <div className="mb-3">
                        <label htmlFor="description">Description</label>
                        <Field
                          name="description"
                          as="textarea"
                          className="form-control"
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="amount">Amount Rs</label>
                        <Field
                          name="amount"
                          className={`form-control ${
                            errors.amount && touched.amount
                              ? "is-invalid"
                              : touched.amount
                              ? "is-valid"
                              : ""
                          }`}
                        />
                        {errors.amount && touched.amount ? (
                          <div className="invalid-feedback">
                            {errors.amount}
                          </div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="paymentMethod">Payment Method</label>
                        <Field
                          as="select"
                          name="paymentMethod"
                          className={`form-control ${
                            errors.paymentMethod && touched.paymentMethod
                              ? "is-invalid"
                              : touched.paymentMethod
                              ? "is-valid"
                              : ""
                          }`}
                        >
                          <option value="">Select Payment Method</option>
                          <option value="Card">Card</option>
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cheque">Cheque</option>
                        </Field>
                        {errors.paymentMethod && touched.paymentMethod ? (
                          <div className="invalid-feedback">
                            {errors.paymentMethod}
                          </div>
                        ) : null}
                      </div>
                      {values.paymentMethod === "Bank Transfer" && (
                        <div className="mb-3">
                          <label htmlFor="bankTransferNumber">
                            Bank Transfer Number
                          </label>
                          <Field
                            name="bankTransferNumber"
                            className={`form-control ${
                              errors.bankTransferNumber &&
                              touched.bankTransferNumber
                                ? "is-invalid"
                                : touched.bankTransferNumber
                                ? "is-valid"
                                : ""
                            }`}
                          />
                          {errors.bankTransferNumber &&
                          touched.bankTransferNumber ? (
                            <div className="invalid-feedback">
                              {errors.bankTransferNumber}
                            </div>
                          ) : null}
                        </div>
                      )}
                      {values.paymentMethod === "Cheque" && (
                        <div className="mb-3">
                          <label htmlFor="chequeNumber">Cheque Number</label>
                          <Field
                            name="chequeNumber"
                            className={`form-control ${
                              errors.chequeNumber && touched.chequeNumber
                                ? "is-invalid"
                                : touched.chequeNumber
                                ? "is-valid"
                                : ""
                            }`}
                          />
                          {errors.chequeNumber && touched.chequeNumber ? (
                            <div className="invalid-feedback">
                              {errors.chequeNumber}
                            </div>
                          ) : null}
                        </div>
                      )}
                      <div className="mb-3">
                        <label htmlFor="invoiceNumber">Invoice Number</label>
                        <Field name="invoiceNumber" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="photo">Upload Photo</label>
                        <input
                          type="file"
                          name="photo"
                          onChange={(event) =>
                            setFieldValue("photo", event.target.files[0])
                          }
                          className="form-control"
                        />
                      </div>
                      <div className="modal-footer">
                        <Button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="btn btn-primary">
                          {editingExpense ? "Update Expense" : "Add Expense"}
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
