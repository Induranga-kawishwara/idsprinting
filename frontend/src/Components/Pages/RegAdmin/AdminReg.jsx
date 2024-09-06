import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
// import "./AdminReg.scss";
import SecondaryNavbar from "./../../Reusable/SecondnavBarSettings/SecondNavbar";

const initialAdmins = [
  {
    id: 1,
    name: "Admin",
    surname: "User",
    email: "admin@example.com",
    phoneNumber: "0771234567",
    address: "123 Admin St, Colombo",
    password: "admin123",
    updatedDate: "2024-08-13",
    updatedTime: "15:00",
    sex: "Male", // Added field
  },
  // Add more admin records if needed
];

const AdminRegSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  surname: Yup.string().required("Surname is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string().required("Phone Number is required"),
  address: Yup.string().required("Address is required"),
  password: Yup.string().required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Re-entering the password is required"),
  sex: Yup.string().required("Sex is required"), // Added validation for Sex
});

const AdminReg = () => {
  const [admins, setAdmins] = useState(initialAdmins);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setAdmins(admins.filter((admin) => admin.id !== id));
  };

  const handleSubmit = (values) => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const formattedTime = currentDate.toTimeString().split(" ")[0];

    if (editingAdmin) {
      setAdmins(
        admins.map((admin) =>
          admin.id === editingAdmin.id
            ? {
                ...values,
                id: editingAdmin.id,
                updatedDate: formattedDate,
                updatedTime: formattedTime,
              }
            : admin
        )
      );
    } else {
      setAdmins([
        ...admins,
        {
          ...values,
          id: admins.length + 1,
          updatedDate: formattedDate,
          updatedTime: formattedTime,
        },
      ]);
    }
    setIsModalOpen(false);
    setEditingAdmin(null);
  };

  return (
    <div className="admin-reg">
      <SecondaryNavbar />
      <div className="container mt-4">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
          className="new-admin-btn"
        >
          New Admin
        </Button>
        <div class="table-responsive">
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Surname</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Address</th>
                <th>Sex</th> {/* Added column for Sex */}
                <th>Updated Date</th>
                <th>Updated Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.id}</td>
                  <td>{admin.name}</td>
                  <td>{admin.surname}</td>
                  <td>{admin.email}</td>
                  <td>{admin.phoneNumber}</td>
                  <td>{admin.address}</td>
                  <td>{admin.sex}</td> {/* Display Sex */}
                  <td>{admin.updatedDate}</td>
                  <td>{admin.updatedTime}</td>
                  <td>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleEdit(admin)}
                      className="edit-btn"
                    >
                      Edit
                    </Button>{" "}
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => handleDelete(admin.id)}
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
                  {editingAdmin ? "Edit Admin" : "New Admin"}
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
                    name: editingAdmin?.name || "",
                    surname: editingAdmin?.surname || "",
                    email: editingAdmin?.email || "",
                    phoneNumber: editingAdmin?.phoneNumber || "",
                    address: editingAdmin?.address || "",
                    password: "",
                    confirmPassword: "",
                    sex: editingAdmin?.sex || "Male", // Added field
                  }}
                  validationSchema={AdminRegSchema}
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
                        <label>Phone Number</label>
                        <Field name="phoneNumber" className="form-control" />
                        {errors.phoneNumber && touched.phoneNumber ? (
                          <div className="text-danger">
                            {errors.phoneNumber}
                          </div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Address</label>
                        <Field name="address" className="form-control" />
                        {errors.address && touched.address ? (
                          <div className="text-danger">{errors.address}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Sex</label>
                        <Field as="select" name="sex" className="form-control">
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
  );
};

export default AdminReg;
