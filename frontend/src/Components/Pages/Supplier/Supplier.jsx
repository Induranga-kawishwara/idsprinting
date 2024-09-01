import React, { useState, useMemo, useCallback } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Button, Modal } from "@mui/material";
import { useTable } from "react-table";
import "./Supplier.scss";

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

const initialSuppliers = [
  {
    id: 1,
    name: "Supplier A",
    contactNumber: "1234567890",
    email: "supplierA@example.com",
    address1: "123 Main St",
    address2: "Suite 101",
    city: "Somewhere",
    postalCode: "12345",
    businessId: "BUS123",
    additionalData: "", // New field
    addedDate: "2024-08-13",
    addedTime: "14:30",
  },
];

const Supplier = () => {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback((id) => {
    setSuppliers((prevSuppliers) =>
      prevSuppliers.filter((supplier) => supplier.id !== id)
    );
  }, []);

  const handleSubmit = (values) => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const formattedTime = currentDate.toTimeString().split(" ")[0];

    if (editingSupplier) {
      setSuppliers(
        suppliers.map((supplier) =>
          supplier.id === editingSupplier.id
            ? {
                ...values,
                id: editingSupplier.id,
                addedDate: supplier.addedDate,
                addedTime: supplier.addedTime,
              }
            : supplier
        )
      );
    } else {
      setSuppliers([
        ...suppliers,
        {
          ...values,
          id: suppliers.length + 1,
          addedDate: formattedDate,
          addedTime: formattedTime,
        },
      ]);
    }
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactNumber.includes(searchQuery)
  );

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Supplier Name", accessor: "name" },
      { Header: "Contact Number", accessor: "contactNumber" },
      { Header: "Email Address", accessor: "email" },
      { Header: "Address 1", accessor: "address1" },
      { Header: "Address 2", accessor: "address2" },
      { Header: "City", accessor: "city" },
      { Header: "Postal Code", accessor: "postalCode" },
      { Header: "Business ID", accessor: "businessId" },
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

  const data = useMemo(() => filteredSuppliers, [filteredSuppliers]);

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div className="supplier">
      <div className="container mt-4">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
          className="newsupplier-btn"
        >
          New Supplier
        </Button>
        <div className="mt-3 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by item code or name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="table-responsive">
          <table className="table table-striped mt-3" {...getTableProps()}>
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
                        <Button
                          variant="contained"
                          color="primary"
                          type="submit"
                          className="update-btn"
                        >
                          {editingSupplier ? "Update" : "Add"}
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => setIsModalOpen(false)}
                          className="cancel-btn ms-2"
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

export default Supplier;
