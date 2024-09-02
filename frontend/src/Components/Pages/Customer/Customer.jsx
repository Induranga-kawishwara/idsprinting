import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useTable } from "react-table";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import "./Customer.scss";
import axios from "axios";
import TableChecker from "../../Reusable/TableChecker/TableChecker.js";
import _ from "lodash";

const CustomerSchema = Yup.object().shape({
  surname: Yup.string().required("Surname is required"),
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email"),
  phone: Yup.string().required("Phone number is required"),
  houseNo: Yup.string(),
  street: Yup.string(),
  city: Yup.string(),
  postalCode: Yup.string(),
  customerType: Yup.string().required("Customer type is required"),
});

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerData = await axios.get(
          // "https://idsprinting.vercel.app/customers/"
          "http://localhost:8080/customers/"
        );

        const formattedcustomers = customerData.data.map((customer, index) => {
          const utcDate = new Date(customer.addedDateAndTime);
          const sltDate = new Date(
            utcDate.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
          );

          return {
            id: customer.id,
            name: customer.name,
            surname: customer.surName,
            email: customer.email,
            phone: customer.contactNumber,
            // totalSpent: customer.,
            totalSpent: "100",
            houseNo: customer.houseNo,
            street: customer.street,
            city: customer.city,
            postalCode: customer.postalcode,
            customerType: customer.customerType,
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

        setCustomers(formattedcustomers);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(
    async (name, id) => {
      const confirmDelete = window.confirm(`Do you want to delete : ${name}?`);

      if (confirmDelete) {
        try {
          const response = await axios.delete(
            `https://idsprinting.vercel.app/customers/customer/${id}`
          );

          setCustomers((prevCustomers) =>
            prevCustomers.filter((customer) => customer.id !== id)
          );
          alert(response.data.message);
        } catch (error) {
          console.error("Error deleting details:", error);
          alert("Failed to delete the details . Please try again.");
        }
      }
    },
    [setCustomers]
  );

  const handleSubmit = async (values) => {
    const currentDate = new Date();

    const data = {
      name: values.name,
      surName: values.surname,
      email: values.email,
      contactNumber: values.phone,
      houseNo: values.houseNo,
      street: values.street,
      city: values.city,
      postalcode: values.postalCode,
      customerType: values.customerType,
    };

    if (editingCustomer) {
      try {
        const dateObject = new Date(
          `${editingCustomer.addedDate} ${editingCustomer.addedTime}`
        );

        const isoDateString = dateObject.toISOString();

        const response = await axios.put(
          `https://idsprinting.vercel.app/customers/customer/${editingCustomer.id}`,
          { ...data, addedDateAndTime: isoDateString }
        );
        setCustomers(
          customers.map((customer) =>
            customer.id === editingCustomer.id
              ? {
                  ...values,
                  id: editingCustomer.id,
                  addedDate: customer.addedDate,
                  addedTime: customer.addedTime,
                }
              : customer
          )
        );
        console.log(customers);

        alert(response.data.message);
      } catch (error) {
        console.error("Error updating expense:", error);
        alert("Failed to update the expense. Please try again.");
      }
    } else {
      try {
        const response = await axios.post(
          "https://idsprinting.vercel.app/customers/customer",
          { ...data, addedDateAndTime: currentDate }
        );

        setCustomers([
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
          },
          ...customers,
        ]);

        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert("Failed to add the expense. Please try again.");
      }
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
      {
        Header: "No",
        accessor: "id",
        Cell: ({ row }) => row.index + 1,
      },
      { Header: "Name", accessor: "name" },
      { Header: "Surname", accessor: "surname" },
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ value }) => value || "-",
      },
      { Header: "Phone", accessor: "phone" },
      {
        Header: "House No",
        accessor: "houseNo",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Street",
        accessor: "street",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "City",
        accessor: "city",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Postal Code",
        accessor: "postalCode",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Total Spent",
        accessor: "totalSpent",
        Cell: ({ value }) => value || "-",
      },
      { Header: "Customer Type", accessor: "customerType" },
      { Header: "Added Date", accessor: "addedDate" },
      { Header: "Added Time", accessor: "addedTime" },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleEdit(row.original)}
              className="edit-btn"
            >
              Edit
            </Button>{" "}
            <Button
              variant="contained"
              size="small"
              onClick={() =>
                handleDelete(
                  `${row.original.name} ${row.original.surname}`,
                  row.original.id
                )
              }
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

  const data = useMemo(() => filteredCustomers, [filteredCustomers]);

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div className="customer">
      <div className="container mt-4">
        <Button
          variant="contained"
          onClick={() => {
            setIsModalOpen(true);
            setEditingCustomer(null);
          }}
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
        <div class="table-responsive">
          {loading || error || _.isEmpty(data) ? (
            <TableChecker loading={loading} error={error} data={data} />
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
                    name: editingCustomer?.name || "",
                    surname: editingCustomer?.surname || "",
                    email: editingCustomer?.email || "",
                    phone: editingCustomer?.phone || "",
                    houseNo: editingCustomer?.houseNo || "",
                    street: editingCustomer?.street || "",
                    city: editingCustomer?.city || "",
                    postalCode: editingCustomer?.postalCode || "",
                    customerType: editingCustomer?.customerType || "Regular",
                  }}
                  validationSchema={CustomerSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <br />
                      <div className="mb-3">
                        <label>Name</label>
                        <Field name="name" className="form-control" />
                        {errors.name && touched.name ? (
                          <div className="text-danger">{errors.name}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Surname</label>
                        <Field name="surname" className="form-control" />
                        {errors.surname && touched.surname ? (
                          <div className="text-danger">{errors.surname}</div>
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
                      <div className="mb-3">
                        <label>Customer Type</label>
                        <Field
                          as="select"
                          name="customerType"
                          className="form-control"
                        >
                          <option value="Regular">Regular</option>
                          <option value="Daily">Daily</option>
                        </Field>
                        {errors.customerType && touched.customerType ? (
                          <div className="text-danger">
                            {errors.customerType}
                          </div>
                        ) : null}
                      </div>
                      <div className="d-flex justify-content-end">
                        <Button
                          variant="contained"
                          type="submit"
                          className="update-btn"
                        >
                          {editingCustomer ? "Update" : "Add"}
                        </Button>
                        <Button
                          variant="contained"
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

export default Customer;
