import React, { useMemo, useState } from "react";
import { useTable } from "react-table";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import NavBar from "../../Components/NavBar";

// Sample data
const initialCustomers = [
  {
    id: 1,
    surname: "Valoy",
    name: "The J",
    email: "valoy@domain.com",
    phone: "123-456-7890",
    totalSpent: "RD $50.00",
  },
  // Add more customers if needed
];

const CustomerSchema = Yup.object().shape({
  surname: Yup.string().required("Surname is required"),
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
});

const Customer = () => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Surname", accessor: "surname" },
      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      { Header: "Phone", accessor: "phone" },
      { Header: "Total Spent", accessor: "totalSpent" },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleEdit(row.original)}
            >
              Edit
            </Button>{" "}
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleDelete(row.original.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const data = useMemo(() => customers, [customers]);

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setCustomers(customers.filter((customer) => customer.id !== id));
  };

  const handleSubmit = (values) => {
    if (editingCustomer) {
      setCustomers(
        customers.map((customer) =>
          customer.id === editingCustomer.id
            ? { ...values, id: editingCustomer.id }
            : customer
        )
      );
    } else {
      setCustomers([...customers, { ...values, id: customers.length + 1 }]);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div>
      <NavBar />
      <br />
      <br />
      <br />
      <div className="container mt-4">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
        >
          New Client
        </Button>
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4">
              <h4>{editingCustomer ? "Edit Customer" : "New Customer"}</h4>
              <Formik
                initialValues={{
                  surname: editingCustomer?.surname || "",
                  name: editingCustomer?.name || "",
                  email: editingCustomer?.email || "",
                  phone: editingCustomer?.phone || "",
                }}
                validationSchema={CustomerSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched }) => (
                  <Form>
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
                    <Button variant="contained" color="primary" type="submit">
                      {editingCustomer ? "Update" : "Add"}
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => setIsModalOpen(false)}
                      className="ms-2"
                    >
                      Cancel
                    </Button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Customer;
