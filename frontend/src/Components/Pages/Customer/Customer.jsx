import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useTable } from "react-table";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import "./Customer.scss";
import axios from "axios";

const CustomerSchema = Yup.object().shape({
  surname: Yup.string().required("Surname is required"),
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
  houseNo: Yup.string(),
  street: Yup.string(),
  city: Yup.string(),
  postalCode: Yup.string(),
});

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get("http://localhost:8080/customers");

        const transformedData = result.data.map((customer) => ({
          id: customer.id,
          surname: "",
          name: customer.name,
          email: customer.contactInfo,
          phone: "",
          totalSpent: "",
          houseNo: "",
          street: "",
          city: "",
          postalCode: "",
        }));

        setCustomers(transformedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(
    (id) => {
      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer.id !== id)
      );
    },
    [setCustomers]
  );

  const handleSubmit = (values) => {
    const newCustomer = {
      // id: customers.length + 1, // Generate a new ID (ensure unique IDs in production)
      surname: values.surname || "",
      name: values.name || "",
      email: values.email || "",
      phone: values.phone || "",
      totalSpent: values.totalSpent || "",
      houseNo: values.houseNo || "",
      street: values.street || "",
      city: values.city || "",
      postalCode: values.postalCode || "",
    };

    if (editingCustomer) {
      setCustomers(
        customers.map((customer) =>
          customer.id === editingCustomer.id
            ? { ...newCustomer, id: editingCustomer.id }
            : customer
        )
      );
    } else {
      setCustomers([...customers, newCustomer]);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  );

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Surname", accessor: "surname" },
      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      { Header: "Phone", accessor: "phone" },
      { Header: "House No", accessor: "houseNo" }, // New column
      { Header: "Street", accessor: "street" }, // New column
      { Header: "City", accessor: "city" }, // New column
      { Header: "Postal Code", accessor: "postalCode" }, // New column
      { Header: "Total Spent", accessor: "totalSpent" },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleEdit(row.original)}
              className="edit-btn" // Apply edit button class
            >
              Edit
            </Button>{" "}
            <Button
              variant="contained"
              size="small"
              onClick={() => handleDelete(row.original.id)}
              className="delete-btn" // Apply delete button class
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [handleDelete]
  );

  const data = useMemo(() => filteredCustomers, [filteredCustomers]);

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div className="customer">
      <div className="container mt-4">
        <Button
          variant="contained"
          onClick={() => setIsModalOpen(true)}
          className="newitem-btn"
        >
          New Client
        </Button>
        <div className="mt-3 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, surname, or phone"
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
                  {editingCustomer ? "Edit Customer" : "New Customer"}
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
                    surname: editingCustomer?.surname || "",
                    name: editingCustomer?.name || "",
                    email: editingCustomer?.email || "",
                    phone: editingCustomer?.phone || "",
                    houseNo: editingCustomer?.houseNo || "", // New field
                    street: editingCustomer?.street || "", // New field
                    city: editingCustomer?.city || "", // New field
                    postalCode: editingCustomer?.postalCode || "", // New field
                  }}
                  validationSchema={CustomerSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <br />
                      <div className="mb-3">
                        <label>Surname</label>
                        <Field name="surname" className="form-control" />
                        {errors.surname && touched.surname ? (
                          <div className="text-danger">{errors.surname}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Name</label>
                        <Field name="name" className="form-control" />
                        {errors.name && touched.name ? (
                          <div className="text-danger">{errors.name}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Email</label>
                        <Field
                          name="email"
                          type="email"
                          className="form-control"
                        />
                        {errors.email && touched.email ? (
                          <div className="text-danger">{errors.email}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Phone</label>
                        <Field name="phone" className="form-control" />
                        {errors.phone && touched.phone ? (
                          <div className="text-danger">{errors.phone}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>House No</label>
                        <Field name="houseNo" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label>Street</label>
                        <Field name="street" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label>City</label>
                        <Field name="city" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label>Postal Code</label>
                        <Field name="postalCode" className="form-control" />
                      </div>
                      <div className="d-flex justify-content-end">
                        <Button
                          variant="contained"
                          type="submit"
                          className="update-btn" // Apply update button class
                        >
                          {editingCustomer ? "Update" : "Add"}
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => setIsModalOpen(false)}
                          className="cancel-btn ms-2" // Apply cancel button class
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

export default Customer;
