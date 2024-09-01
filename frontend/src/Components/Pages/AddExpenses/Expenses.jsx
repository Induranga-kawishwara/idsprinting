import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTable } from "react-table";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Expenses.scss"; // Create this file for your styles
import axios from "axios";
import { ImageUploader } from "../../Reusable/ImageUploder/ImageUploader.js";
import SyncLoader from "react-spinners/SyncLoader";
import _ from "lodash";

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
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expensesData = await axios.get(
          "https://idsprinting.vercel.app/expenses/"
          // "http://localhost:8080/expenses/"
        );

        const formattedExpenses = expensesData.data.map((expense, index) => {
          const utcDate = new Date(expense.dateAndTime);
          const sltDate = new Date(
            utcDate.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
          );

          return {
            id: expense.id,
            name: expense.expensesname,
            type: expense.expensesType,
            supplier: expense.supplier,
            other: expense.other,
            description: expense.description,
            amount: expense.amount,
            paymentMethod: expense.paymentMethod,
            addedDate: sltDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }),
            addedTime: sltDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            invoiceNumber: expense.invoiceNumber,
            photo: expense.image,
          };
        });

        setExpenses(formattedExpenses);
        setLoading(false); // Data fetched, set loading to false
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error); // Optional: Set error state
        setLoading(false); // Data fetching failed, set loading to false
      }
    };

    fetchData();
  }, []);

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(
    async (name, id) => {
      const confirmDelete = window.confirm(
        `Do you want to delete the expense: ${name}?`
      );

      if (confirmDelete) {
        try {
          const response = await axios.delete(
            `https://idsprinting.vercel.app/expenses/expenses/${id}`
          );

          setExpenses((prevExpenses) =>
            prevExpenses.filter((expense) => expense.id !== id)
          );
          alert(response.data.message);
        } catch (error) {
          console.error("Error deleting expense:", error);
          alert("Failed to delete the expense. Please try again.");
        }
      }
    },
    [setExpenses]
  );
  const handleSubmit = async (values) => {
    const currentDate = new Date();

    const downloadURL = await ImageUploader(
      values.name,
      currentDate,
      "Expencess",
      values.photo
    );

    const data = {
      expensesname: values.name,
      expensesType: values.type,
      supplier: values.supplier,
      other: values.other,
      description: values.description,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      bankTranferNum: values.bankTransferNumber,
      chequeNum: values.chequeNumber,
      invoiceNumber: values.invoiceNumber,
      image: downloadURL,
    };

    if (editingExpense) {
      try {
        const dateObject = new Date(
          `${editingExpense.addedDate} ${editingExpense.addedTime}`
        );

        const isoDateString = dateObject.toISOString();

        const response = await axios.put(
          `https://idsprinting.vercel.app/expenses/expenses/${editingExpense.id}`,
          { ...data, dateAndTime: isoDateString }
        );
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
        alert(response.data.message);
      } catch (error) {
        console.error("Error updating expense:", error);
        alert("Failed to update the expense. Please try again.");
      }
    } else {
      try {
        const response = await axios.post(
          "https://idsprinting.vercel.app/expenses/expenses",
          { ...data, dateAndTime: currentDate }
        );

        setExpenses([
          {
            ...values,
            id: response.data.id,
            addedDate: currentDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }),
            addedTime: currentDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            image: downloadURL,
          },
          ...expenses,
        ]);

        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert("Failed to add the expense. Please try again.");
      }
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
      {
        Header: "No",
        accessor: "id",
        Cell: ({ row }) => row.index + 1,
      },
      { Header: "Name", accessor: "name" },
      { Header: "Type of Expenses", accessor: "type" },
      {
        Header: "Supplier",
        accessor: "supplier",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Other",
        accessor: "other",
        Cell: ({ value }) => value || "-",
      },
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
          value ? (
            <div>
              <Button onClick={() => window.open(value, "_blank")}>View</Button>
              {/* <button onClick={() => handleViewClick(value)}>View</button> */}
            </div>
          ) : (
            <span>No File</span>
          ),
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
              onClick={() => handleDelete(row.original.name, row.original.id)}
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

        <div className="table-responsive">
          {loading || error || _.isEmpty(data) ? (
            <div className="message-container">
              {loading && <SyncLoader />}
              {error && (
                <p className="error-message">
                  Error loading data: {error.message}
                </p>
              )}
              {_.isEmpty(data) && (
                <p className="no-data-message">Don't Have Data to Show</p>
              )}
            </div>
          ) : (
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
          )}
        </div>

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
                          <option value="Gas Bill">Fuel Bill</option>
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
