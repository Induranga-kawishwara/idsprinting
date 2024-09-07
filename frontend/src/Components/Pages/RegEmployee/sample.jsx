import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal, Switch } from "@mui/material";
import "./RegEmp.scss";
import SecondaryNavbar from "./../../Reusable/SecondnavBarSettings/SecondNavbar";

// Initial employee data with isAdmin and isEmployee fields
const initialEmployees = [
  {
    id: 1,
    name: "John",
    surname: "Doe",
    nicNumber: "123456789V",
    nicPhoto: "",
    nicBackPhoto: "",
    houseNo: "123",
    street: "Main St",
    city: "Colombo",
    zipCode: "00100",
    employeePhoto: "",
    contactNumber: "0771234567",
    refContactNumber: "0777654321",
    epfEtfNumber: "EPF001",
    email: "john.doe@example.com",
    password: "password123",
    updatedDate: "2024-08-13",
    updatedTime: "15:00",
    sex: "Male",
    isAdmin: true,  // Admin access
    isEmployee: true, // Employee access
  },
];

const RegEmpSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  surname: Yup.string().required("Surname is required"),
  nicNumber: Yup.string().required("NIC Number is required"),
  houseNo: Yup.string().required("House No. is required"),
  street: Yup.string().required("Street is required"),
  city: Yup.string().required("City is required"),
  zipCode: Yup.string().required("Zip Code is required"),
  contactNumber: Yup.string().required("Contact Number is required"),
  refContactNumber: Yup.string().required(
    "Reference Contact Number is required"
  ),
  epfEtfNumber: Yup.string().required("EPF/ETF Number is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Re-entering the password is required"),
  sex: Yup.string().required("Sex is required"),
});

const RegEmp = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setEmployees(employees.filter((employee) => employee.id !== id));
  };

  const handleSubmit = (values) => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const formattedTime = currentDate.toTimeString().split(" ")[0];

    if (editingEmployee) {
      setEmployees(
        employees.map((employee) =>
          employee.id === editingEmployee.id
            ? {
                ...values,
                id: editingEmployee.id,
                updatedDate: formattedDate,
                updatedTime: formattedTime,
              }
            : employee
        )
      );
    } else {
      setEmployees([
        ...employees,
        {
          ...values,
          id: employees.length + 1,
          updatedDate: formattedDate,
          updatedTime: formattedTime,
        },
      ]);
    }
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  return (
    <div>
      <div className="reg-emp">
        <SecondaryNavbar />
        <div className="container mt-4">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsModalOpen(true)}
            className="new-emp-btn"
          >
            New Employee
          </Button>
          <div class="table-responsive">
            <table className="table table-striped mt-3">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Surname</th>
                  <th>NIC Number</th>
                  <th>Email</th>
                  <th>Contact Number</th>
                  <th>Reference Contact</th>
                  <th>EPF/ETF Number</th>
                  <th>Sex</th>
                  <th>Admin Access</th> {/* Admin Access Column */}
                  <th>Employee Access</th> {/* Employee Access Column */}
                  <th>Updated Date</th>
                  <th>Updated Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.surname}</td>
                    <td>{employee.nicNumber}</td>
                    <td>{employee.email}</td>
                    <td>{employee.contactNumber}</td>
                    <td>{employee.refContactNumber}</td>
                    <td>{employee.epfEtfNumber}</td>
                    <td>{employee.sex}</td>
                    <td>
                      <Switch
                        checked={employee.isAdmin}
                        onChange={() =>
                          setEmployees(
                            employees.map((emp) =>
                              emp.id === employee.id
                                ? { ...emp, isAdmin: !emp.isAdmin }
                                : emp
                            )
                          )
                        }
                      />
                    </td> {/* Admin Access Switch */}
                    <td>
                      <Switch
                        checked={employee.isEmployee}
                        onChange={() =>
                          setEmployees(
                            employees.map((emp) =>
                              emp.id === employee.id
                                ? { ...emp, isEmployee: !emp.isEmployee }
                                : emp
                            )
                          )
                        }
                      />
                    </td> {/* Employee Access Switch */}
                    <td>{employee.updatedDate}</td>
                    <td>{employee.updatedTime}</td>
                    <td>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(employee)}
                        className="edit-btn"
                      >
                        Edit
                      </Button>{" "}
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleDelete(employee.id)}
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
                    {editingEmployee ? "Edit Employee" : "New Employee"}
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
                      name: editingEmployee?.name || "",
                      surname: editingEmployee?.surname || "",
                      nicNumber: editingEmployee?.nicNumber || "",
                      nicPhoto: editingEmployee?.nicPhoto || "",
                      nicBackPhoto: editingEmployee?.nicBackPhoto || "",
                      houseNo: editingEmployee?.houseNo || "",
                      street: editingEmployee?.street || "",
                      city: editingEmployee?.city || "",
                      zipCode: editingEmployee?.zipCode || "",
                      employeePhoto: editingEmployee?.employeePhoto || "",
                      contactNumber: editingEmployee?.contactNumber || "",
                      refContactNumber: editingEmployee?.refContactNumber || "",
                      epfEtfNumber: editingEmployee?.epfEtfNumber || "",
                      email: editingEmployee?.email || "",
                      password: "",
                      confirmPassword: "",
                      sex: editingEmployee?.sex || "Male", // Added field
                    }}
                    validationSchema={RegEmpSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ errors, touched }) => (
                      <Form>
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
                          <label>NIC Number</label>
                          <Field name="nicNumber" className="form-control" />
                          {errors.nicNumber && touched.nicNumber ? (
                            <div className="text-danger">
                              {errors.nicNumber}
                            </div>
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
                          <label>NIC Photo</label>
                          <Field
                            name="nicPhoto"
                            type="file"
                            className="form-control"
                          />
                        </div>
                        <div className="mb-3">
                          <label>NIC Back Photo</label>
                          <Field
                            name="nicBackPhoto"
                            type="file"
                            className="form-control"
                          />
                        </div>
                        <div className="mb-3">
                          <label>House No.</label>
                          <Field name="houseNo" className="form-control" />
                          {errors.houseNo && touched.houseNo ? (
                            <div className="text-danger">{errors.houseNo}</div>
                          ) : null}
                        </div>
                        <div className="mb-3">
                          <label>Street</label>
                          <Field name="street" className="form-control" />
                          {errors.street && touched.street ? (
                            <div className="text-danger">{errors.street}</div>
                          ) : null}
                        </div>
                        <div className="mb-3">
                          <label>City</label>
                          <Field name="city" className="form-control" />
                          {errors.city && touched.city ? (
                            <div className="text-danger">{errors.city}</div>
                          ) : null}
                        </div>
                        <div className="mb-3">
                          <label>Zip Code</label>
                          <Field name="zipCode" className="form-control" />
                          {errors.zipCode && touched.zipCode ? (
                            <div className="text-danger">{errors.zipCode}</div>
                          ) : null}
                        </div>
                        <div className="mb-3">
                          <label>Employee Photo</label>
                          <Field
                            name="employeePhoto"
                            type="file"
                            className="form-control"
                          />
                        </div>
                        <div className="mb-3">
                          <label>Contact Number</label>
                          <Field
                            name="contactNumber"
                            className="form-control"
                          />
                          {errors.contactNumber && touched.contactNumber ? (
                            <div className="text-danger">
                              {errors.contactNumber}
                            </div>
                          ) : null}
                        </div>
                        <div className="mb-3">
                          <label>Reference Contact Number</label>
                          <Field
                            name="refContactNumber"
                            className="form-control"
                          />
                          {errors.refContactNumber &&
                          touched.refContactNumber ? (
                            <div className="text-danger">
                              {errors.refContactNumber}
                            </div>
                          ) : null}
                        </div>
                        <div className="mb-3">
                          <label>EPF/ETF Number</label>
                          <Field name="epfEtfNumber" className="form-control" />
                          {errors.epfEtfNumber && touched.epfEtfNumber ? (
                            <div className="text-danger">
                              {errors.epfEtfNumber}
                            </div>
                          ) : null}
                        </div>
                        <div className="mb-3">
                          <label>Sex</label>
                          <Field
                            as="select"
                            name="sex"
                            className="form-control"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </Field>
                          {errors.sex && touched.sex ? (
                            <div className="text-danger">{errors.sex}</div>
                          ) : null}
                        </div>
                        <div className="mb-3">
                          <label>Password</label>
                          <div className="input-group">
                            <Field
                              name="password"
                              type={showPassword ? "text" : "password"}
                              className="form-control"
                            />
                            <Button
                              onClick={toggleShowPassword}
                              className="btn btn-outline-secondary"
                            >
                              {showPassword ? "Hide" : "Show"}
                            </Button>
                          </div>
                          {errors.password && touched.password ? (
                            <div className="text-danger">{errors.password}</div>
                          ) : null}
                        </div>
                        <div className="mb-3">
                          <label>Re-enter Password</label>
                          <div className="input-group">
                            <Field
                              name="confirmPassword"
                              type={showPassword ? "text" : "password"}
                              className="form-control"
                            />
                            <Button
                              onClick={toggleShowPassword}
                              className="btn btn-outline-secondary"
                            >
                              {showPassword ? "Hide" : "Show"}
                            </Button>
                          </div>
                          {errors.confirmPassword && touched.confirmPassword ? (
                            <div className="text-danger">
                              {errors.confirmPassword}
                            </div>
                          ) : null}
                        </div>
                        <div className="text-end">
                          <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            className="me-2"
                          >
                            Save
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
    </div>
  );
};

export default RegEmp;
