import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTable } from "react-table";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import {
  ImageUploader,
  deleteImage,
} from "../../Reusable/ImageUploder/ImageManager.js";
import _ from "lodash";
import TableChecker from "../../Reusable/TableChecker/TableChecker.js";
import "../All.scss";
import { ConvertToSLT } from "../../Utility/ConvertToSLT.js";
import socket from "../../Utility/SocketConnection.js";
import Loading from "../../Reusable/Loadingcomp/Loading.jsx";

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
  const [typeOfExpensesFilter, setTypeOfExpensesFilter] = useState(""); // Add this line
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // Current page state
  const [supplier, setSupplier] = useState([]);
  const itemsPerPage = 10; // Define how many items per page you want
  const [loadingpage, setLoadingpage] = useState(false);
  const totalPages = Math.ceil(expenses.length / itemsPerPage); // Calculate total pages

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both expenses and suppliers concurrently
        const [expensesData, suppliersData] = await Promise.all([
          axios.get(
            "https://candied-chartreuse-concavenator.glitch.me/expenses/"
          ),
          axios.get(
            "https://candied-chartreuse-concavenator.glitch.me/suppliers/"
          ),
        ]);

        // Format suppliers data (only extracting id and name)
        const needDetailsSuppliers = suppliersData.data.map((supplier) => ({
          id: supplier.id,
          name: supplier.name,
        }));

        // Format expenses data with date and time conversion
        const formattedExpenses = expensesData.data.map((expense) => {
          const { date, time } = ConvertToSLT(expense.dateAndTime);
          return {
            ...expense,
            id: expense.id,
            name: expense.expensesname,
            type: expense.expensesType,
            addedDate: date,
            addedTime: time,
            photo: expense.image,
          };
        });

        // Update state
        setExpenses(formattedExpenses);
        setSupplier(needDetailsSuppliers);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
        setLoading(false);
      }
    };

    // Call fetchData once
    fetchData();
  }, []);

  useEffect(() => {
    // Listen for real-time expenses updates
    socket.on("expensesAdded", (newexpenses) => {
      const { date, time } = ConvertToSLT(newexpenses.dateAndTime);

      const newExpenses = {
        ...newexpenses,
        name: newexpenses.expensesname,
        type: newexpenses.expensesType,
        addedDate: date,
        addedTime: time,
        photo: newexpenses.image,
      };
      setExpenses((prevExpenses) => [newExpenses, ...prevExpenses]);
    });

    socket.on("expensessUpdated", (updatedExpenses) => {
      const { date, time } = ConvertToSLT(updatedExpenses.dateAndTime);

      const newUpdatedExpenses = {
        ...updatedExpenses,
        name: updatedExpenses.expensesname,
        type: updatedExpenses.expensesType,
        addedDate: date,
        addedTime: time,
        photo: updatedExpenses.image,
      };
      setExpenses((prevExpenses) =>
        prevExpenses.map((expenses) =>
          expenses.id === updatedExpenses.id ? newUpdatedExpenses : expenses
        )
      );
    });

    socket.on("expensesDeleted", ({ id }) => {
      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== id)
      );
    });

    socket.on("supplierAdded", (newsupplier) => {
      setSupplier((prevsuppliers) => [
        { id: newsupplier.id, name: newsupplier.name },
        ...prevsuppliers,
      ]);
    });

    socket.on("supplierUpdated", (updatedsupplier) => {
      setSupplier((prevsuppliers) =>
        prevsuppliers.map((supplier) =>
          supplier.id === updatedsupplier.id
            ? { id: updatedsupplier.id, name: updatedsupplier.name }
            : supplier
        )
      );
    });

    socket.on("supplierDeleted", ({ id }) => {
      setSupplier((prevsuppliers) =>
        prevsuppliers.filter((supplier) => supplier.id !== id)
      );
    });

    return () => {
      socket.off("expensesAdded");
      socket.off("expensessUpdated");
      socket.off("expensesDeleted");

      //////

      socket.off("supplierAdded");
      socket.off("supplierUpdated");
      socket.off("supplierDeleted");
    };
  }, [expenses, supplier]);

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(async (name, id) => {
    const confirmDelete = window.confirm(
      `Do you want to delete the expense: ${name}?`
    );

    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `https://candied-chartreuse-concavenator.glitch.me/expenses/${id}`
        );

        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert("Failed to delete the expense. Please try again.");
      }
    }
  }, []);
  const handleSubmit = async (values) => {
    setLoadingpage(true);
    const currentDate = new Date();

    // Helper function to upload an image and handle errors
    const uploadImage = async (fileName, folder, imageFile) => {
      try {
        const downloadURL = await ImageUploader(
          fileName,
          currentDate,
          folder,
          imageFile
        );
        return downloadURL;
      } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
      }
    };

    let downloadURL = null;
    let imageFileName = `${values.name}-${currentDate.toISOString()}`; // Assuming this is a unique identifier for the image

    try {
      // Upload image
      downloadURL = await uploadImage(imageFileName, "Expenses", values.photo);

      // Prepare data object
      const data = {
        expensesname: values.name,
        expensesType: values.type,
        supplier: values.supplier,
        other: values.other,
        description: values.description,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        invoiceNumber: values.invoiceNumber,
        bankTranferNum: values.bankTransferNumber,
        chequeNum: values.chequeNumber,
        image: downloadURL,
      };

      if (editingExpense) {
        // Update existing expense
        const dateObject = new Date(
          `${editingExpense.addedDate} ${editingExpense.addedTime}`
        );
        const isoDateString = dateObject.toISOString();

        const response = await axios.put(
          `https://candied-chartreuse-concavenator.glitch.me/expenses/${editingExpense.id}`,
          { ...data, dateAndTime: isoDateString }
        );

        alert(response.data.message);
      } else {
        // Create new expense
        const response = await axios.post(
          "https://candied-chartreuse-concavenator.glitch.me/expenses/expenses",
          { ...data, dateAndTime: currentDate }
        );

        alert(response.data.message);
      }
    } catch (error) {
      // Error handling and cleanup
      console.error("Error:", error);

      // Attempt to delete the uploaded image if there's an error
      if (downloadURL) {
        try {
          await deleteImage(downloadURL); // Implement this function to delete images
          console.log(
            "Uploaded image deleted due to error in data submission."
          );
        } catch (deleteError) {
          console.error("Error deleting image:", deleteError);
        }
      }

      const errorMessage =
        error.response?.data?.message ||
        "Failed to add or update the expense. Please try again.";
      alert(`Error: ${errorMessage}`);
    } finally {
      // Close modal and reset editing state
      setLoadingpage(false);
      setIsModalOpen(false);
      setEditingExpense(null);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const searchString = searchQuery.toLowerCase().trim();
    const expenseDate = new Date(expense.addedDate);
    const isWithinDateRange =
      (!startDate || expenseDate >= startDate) &&
      (!endDate || expenseDate <= endDate);
    const matchesPaymentMethod =
      !paymentMethodFilter || expense.paymentMethod === paymentMethodFilter;
    const matchesTypeOfExpenses =
      !typeOfExpensesFilter || expense.type === typeOfExpensesFilter; // New condition for type filter

    return (
      isWithinDateRange &&
      matchesPaymentMethod &&
      matchesTypeOfExpenses && // Ensure this is checked
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
      {
        Header: "Added By",
        accessor: "addedBy",
      },

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
            <button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleEdit(row.original)}
              className="editbtn"
            >
              Edit
            </button>{" "}
            <button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleDelete(row.original.name, row.original.id)}
              className="deletebtn"
            >
              Delete
            </button>
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
                setEditingExpense(null);
              }}
              className="addnewbtntop"
            >
              New Expense
            </button>
            <div className="d-flex align-items-center mb-3">
              <input
                type="text"
                className="searchfunctions me-2"
                placeholder="Search by Name, Amount, and Invoice Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="d-flex align-items-center mb-3">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className="searchfunctionsdate me-2"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End Date"
                className="searchfunctionsdate me-2"
              />
              <select
                className="formdropdown"
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
              >
                <option value="" disabled>
                  Payment Method
                </option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>

              <select
                className="formdropdown"
                value={typeOfExpensesFilter}
                onChange={(e) => setTypeOfExpensesFilter(e.target.value)}
              >
                <option value="" disabled>
                  Expenses Type
                </option>
                <option value="Suppliers">Suppliers</option>
                <option value="Others">Others</option>
                <option value="Electricity Bill">Electricity Bill</option>
                <option value="Gas Bill">Gas Bill</option>
                <option value="Phone Bill">Phone Bill</option>
                {/* Add any other types of expenses */}
              </select>

              <button
                variant="contained"
                color="secondary"
                className="prevbutton"
                onClick={() => {
                  setSearchQuery("");
                  setStartDate(null);
                  setEndDate(null);
                  setPaymentMethodFilter("");
                  setTypeOfExpensesFilter("");
                }}
              >
                Clear
              </button>
            </div>

            <div className="table-responsive">
              {loading || error || _.isEmpty(data) ? (
                <TableChecker
                  loading={loading}
                  error={error}
                  hasData={data.length > 0}
                />
              ) : (
                <table {...getTableProps()} className="table mt-3 custom-table">
                  <thead>
                    {headerGroups.map((headerGroup) => (
                      <tr
                        {...headerGroup.getHeaderGroupProps()}
                        key={headerGroup.id}
                      >
                        {headerGroup.headers.map((column) => (
                          <th {...column.getHeaderProps()} key={column.id}>
                            {column.render("Header")}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...getTableBodyProps()} className="custom-table">
                    {rows.map((row) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()} key={row.id}>
                          {row.cells.map((cell) => (
                            <td {...cell.getCellProps()} key={cell.column.id}>
                              {cell.render("Cell")}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
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
            {/* Form Modal */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
                <div className="modal-content custom-modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingExpense ? "Edit Expense" : "Add New Expense"}
                    </h5>
                    <Button
                      className="btn-close"
                      onClick={() => {
                        setIsModalOpen(false);
                      }}
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
                              <div className="invalid-feedback">
                                {errors.name}
                              </div>
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
                              <div className="invalid-feedback">
                                {errors.type}
                              </div>
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
                                {supplier.map((supplier) => (
                                  <option
                                    key={supplier.id}
                                    value={supplier.name}
                                  >
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
                            <label htmlFor="paymentMethod">
                              Payment Method
                            </label>
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
                              <option value="Bank Transfer">
                                Bank Transfer
                              </option>
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
                              <label htmlFor="chequeNumber">
                                Cheque Number
                              </label>
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
                            <label htmlFor="invoiceNumber">
                              Invoice Number
                            </label>
                            <Field
                              name="invoiceNumber"
                              className={`form-control ${
                                errors.invoiceNumber && touched.invoiceNumber
                                  ? "is-invalid"
                                  : touched.invoiceNumber
                                  ? "is-valid"
                                  : ""
                              }`}
                            />
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
                            <button type="submit" className="savechangesbutton">
                              {editingExpense
                                ? "Update Expense"
                                : "Add Expense"}
                            </button>
                            <button
                              type="button"
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

export default Expenses;
