import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Button, Modal } from "@mui/material";
import { useTable } from "react-table";
import "../All.scss";
import socket from "../../../SocketConnection/SocketConnection.js";
import axios from "axios";
import _ from "lodash";
import TableChecker from "../../Reusable/TableChecker/TableChecker.js";

const SupplierSchema = Yup.object().shape({
  name: Yup.string().required("Supplier Name is required"),
  contactNumber: Yup.string().required("Contact Number is required"),
  email: Yup.string().email("Invalid email address").notRequired(),
  address1: Yup.string().notRequired(),
  address2: Yup.string().notRequired(),
  city: Yup.string().notRequired(),
  postalCode: Yup.string().notRequired(),
  businessId: Yup.string().notRequired(),
  additionalData: Yup.string().notRequired(), // New field validation
});

const Supplier = () => {
  const [suppliers, setup] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supplierData = await axios.get(
          "http://localhost:8080/suppliers/"
        );

        const formattedSuppliers = supplierData.data.map((supplier) => {
          const utcDate = new Date(supplier.additionalData);
          const sltDate = new Date(
            utcDate.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
          );

          return {
            ...supplier,
            id: supplier.id,
            addedDate: sltDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }),
            addedTime: sltDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });

        setup(formattedSuppliers);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();

    // Listen for real-time supplier updates
    socket.on("supplierAdded", (newsupplier) => {
      const utcDate = new Date(newsupplier.additionalData);
      const sltDate = new Date(
        utcDate.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
      );

      const newsupplieradded = {
        ...newsupplier,
        addedDate: sltDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        addedTime: sltDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        totalSpent: "500", // Example data; replace with real data if needed
      };
      setup((prevsuppliers) => [newsupplieradded, ...prevsuppliers]);
    });

    socket.on("supplierUpdated", (updatedsupplier) => {
      const utcDate = new Date(updatedsupplier.additionalData);
      const sltDate = new Date(
        utcDate.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
      );

      const newupdatedsupplier = {
        ...updatedsupplier,
        addedDate: sltDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        addedTime: sltDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        totalSpent: "600", // Example data; replace with real data if needed
      };
      setup((prevsuppliers) =>
        prevsuppliers.map((supplier) =>
          supplier.id === updatedsupplier.id ? newupdatedsupplier : supplier
        )
      );
    });

    socket.on("supplierDeleted", ({ id }) => {
      setup((prevsuppliers) =>
        prevsuppliers.filter((supplier) => supplier.id !== id)
      );
    });

    return () => {
      socket.off("supplierAdded");
      socket.off("supplierUpdated");
      socket.off("supplierDeleted");
    };
  }, []);

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(async (name, id) => {
    const confirmDelete = window.confirm(`Do you want to delete: ${name}?`);

    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `http://localhost:8080/suppliers/supplier/${id}`
        );

        // Emit event for supplier deletion
        socket.emit("supplierDeleted", { id });

        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting details:", error);
        alert("Failed to delete the details. Please try again.");
      }
    }
  }, []);
  const handleSubmit = async (values) => {
    const currentDate = new Date();

    const data = {
      ...values,
      additionalData: currentDate.toISOString(), // Automatically include the current date and time
    };

    if (editingSupplier) {
      try {
        const response = await axios.put(
          `http://localhost:8080/suppliers/supplier/${editingSupplier.id}`,
          data
        );

        const updatedsupplier = {
          ...values,
          id: editingSupplier.id,
          addedDate: currentDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
          addedTime: currentDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        // Emit event for supplier update
        socket.emit("supplierUpdated", updatedsupplier);

        alert(response.data.message);
      } catch (error) {
        console.error("Error updating Supplier:", error);
        alert("Failed to update the Supplier. Please try again.");
      }
    } else {
      try {
        const response = await axios.post(
          "http://localhost:8080/suppliers/supplier",
          data
        );

        const newsupplier = {
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
        };

        // Emit event for new supplier
        socket.emit("supplierAdded", newsupplier);

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
    setIsModalOpen(false);
    setEditingSupplier(null);
  };
  const handleClear = () => {
    setSearchQuery(""); // Reset search query to an empty string
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactNumber.includes(searchQuery)
  );

  const columns = useMemo(
    () => [
      {
        Header: "No",
        accessor: "id",
        Cell: ({ row }) => row.index + 1,
      },
      { Header: "Supplier Name", accessor: "name" },
      { Header: "Contact Number", accessor: "contactNumber" },
      {
        Header: "Email Address",
        accessor: "email",
        Cell: ({ value }) => (value ? value : "-"), // Show "-" if empty
      },
      {
        Header: "Address 1",
        accessor: "address1",
        Cell: ({ value }) => (value ? value : "-"),
      },
      {
        Header: "Address 2",
        accessor: "address2",
        Cell: ({ value }) => (value ? value : "-"),
      },
      {
        Header: "City",
        accessor: "city",
        Cell: ({ value }) => (value ? value : "-"),
      },
      {
        Header: "Postal Code",
        accessor: "postalCode",
        Cell: ({ value }) => (value ? value : "-"),
      },
      {
        Header: "Business ID",
        accessor: "businessId",
        Cell: ({ value }) => (value ? value : "-"),
      },
      { Header: "Added Date", accessor: "addedDate" },
      { Header: "Added Time", accessor: "addedTime" },
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

  const data = useMemo(() => filteredSuppliers, [filteredSuppliers]);

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div className="bodyofpage">
      <div className="container">
        <button
          variant="contained"
          color="primary"
          onClick={() => {
            setIsModalOpen(true);
            setEditingSupplier(null);
          }}
          className="addnewbtntop"
        >
          New Supplier
        </button>
        <div className="d-flex align-items-center mb-3">
          <input
            type="text"
            className="searchfunctions me-2"
            placeholder="Search by item Name or Phone number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            variant="outlined"
            color="secondary"
            onClick={handleClear}
            className="prevbutton"
          >
            Clear
          </button>
        </div>
        <div className="table-responsive">
          {loading || error || _.isEmpty(data) ? (
            <TableChecker loading={loading} error={error} data={data} />
          ) : (
            <table className="table mt-3 custom-table" {...getTableProps()}>
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
              <tbody {...getTableBodyProps()} className="custom-table">
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

        {/* Form Modal */}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
            <div className="modal-content custom-modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingSupplier ? "Edit Supplier" : "New Supplier"}
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
                    name: editingSupplier?.name || "",
                    contactNumber: editingSupplier?.contactNumber || "",
                    email: editingSupplier?.email || "",
                    address1: editingSupplier?.address1 || "",
                    address2: editingSupplier?.address2 || "",
                    city: editingSupplier?.city || "",
                    postalCode: editingSupplier?.postalCode || "",
                    businessId: editingSupplier?.businessId || "",
                    additionalData: editingSupplier?.additionalData || "", // New field
                  }}
                  validationSchema={SupplierSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <br />
                      <div className="mb-3">
                        <label>Supplier Name</label>
                        <Field name="name" className="form-control" />
                        {errors.name && touched.name ? (
                          <div className="text-danger">{errors.name}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Contact Number</label>
                        <Field name="contactNumber" className="form-control" />
                        {errors.contactNumber && touched.contactNumber ? (
                          <div className="text-danger">
                            {errors.contactNumber}
                          </div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Email Address (Optional)</label>
                        <Field name="email" className="form-control" />
                        {errors.email && touched.email ? (
                          <div className="text-danger">{errors.email}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Address 1 (Optional)</label>
                        <Field name="address1" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label>Address 2 (Optional)</label>
                        <Field name="address2" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label>City (Optional)</label>
                        <Field name="city" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label>Postal Code (Optional)</label>
                        <Field name="postalCode" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label>Business ID (Optional)</label>
                        <Field name="businessId" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label>Additional Data (Optional)</label>
                        <Field name="additionalData" className="form-control" />
                      </div>
                      <div className="d-flex justify-content-end">
                        <button
                          variant="contained"
                          color="primary"
                          type="submit"
                          className="savechangesbutton"
                        >
                          {editingSupplier ? "Update Supplier" : "Add"}
                        </button>
                        <button
                          variant="contained"
                          color="secondary"
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

export default Supplier;
