import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal, Switch } from "@mui/material";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";
import "./RegEmp.scss";
import SecondaryNavbar from "./../../Reusable/SecondnavBarSettings/SecondNavbar";
import {
  ImageUploader,
  deleteImage,
} from "../../Reusable/ImageUploder/ImageManager.js";
import { auth } from "../../../config/firebaseConfig.js";
import axios from "axios";
import _ from "lodash";
import socket from "../../Utility/SocketConnection.js";
import { ConvertToSLT } from "../../Utility/ConvertToSLT.js";
import TableChecker from "../../Reusable/TableChecker/TableChecker.js";

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
  epfNumber: Yup.string().required("EPF Number is required"),
  EtfNumber: Yup.string().required("ETF Number is required"),
  birthDate: Yup.string().required("Birth Date is required"), // Birth Date validation
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  sex: Yup.string().required("Sex is required"),
});

const RegEmp = () => {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const mapEmp = (dataset) => {
      const { date, time } = ConvertToSLT(dataset.dateAndTime);
      return {
        ...dataset,
        id: dataset.id,
        uid: dataset.uid,
        surname: dataset.surName,
        birthDate: dataset.birthDay,
        nicPhoto: dataset.nicFront,
        nicBackPhoto: dataset.nicBack,
        employeePhoto: dataset.employeePic,
        contactNumber: dataset.contactNum,
        refContactNumber: dataset.referenceConNum,
        EtfNumber: dataset.etfNUmber,
        updatedDate: date,
        updatedTime: time,
      };
    };

    const fetchData = async () => {
      try {
        const userData = await axios.get("http://localhost:8080/users");

        const formattedusers = userData.data.map((user) => mapEmp(user));

        setEmployees(formattedusers);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();

    // Listen for real-time user updates
    socket.on("UserAdded", (newuser) => {
      setEmployees((prevusers) => [mapEmp(newuser), ...prevusers]);
    });

    socket.on("UsersUpdated", (updatedUsers) => {
      setEmployees((prevusers) =>
        prevusers.map((user) =>
          user.id === updatedUsers.id ? mapEmp(updatedUsers) : user
        )
      );
    });

    socket.on("UserDeleted", ({ id }) => {
      setEmployees((prevusers) => prevusers.filter((user) => user.id !== id));
    });

    socket.on("updateUserAccessibility", (updatedUsers) => {
      setEmployees((prevusers) =>
        prevusers.map((user) =>
          user.id === updatedUsers.id ? updatedUsers : user
        )
      );
    });

    return () => {
      socket.off("UserAdded");
      socket.off("UsersUpdated");
      socket.off("updateUserAccessibility");
      socket.off("UserDeleted");
    };
  }, []);

  // Reusable component for displaying file links
  const FileViewer = ({ fileUrl, fileLabel }) => (
    <td>
      {fileUrl ? (
        <div>
          <Button onClick={() => window.open(fileUrl, "_blank")}>View</Button>
        </div>
      ) : (
        <span>No {fileLabel}</span>
      )}
    </td>
  );

  const handleToggleAdmin = async (id) => {
    const employee = employees.find((emp) => emp.id === id);

    if (!employee) {
      alert("Employee not found.");
      return;
    }
    try {
      // Toggle the employee status and send the update request
      const response = await axios.put(
        `http://localhost:8080/users/userAccess/${id}`,
        { isAdmin: !employee.isAdmin }
      );

      alert(response.data.message);
    } catch (error) {
      console.error("Error updating employee access:", error);
      alert("Failed to update the employee. Please try again.");
    }
  };

  const handleToggleEmployee = async (id) => {
    const employee = employees.find((emp) => emp.id === id);

    if (!employee) {
      alert("Employee not found.");
      return;
    }
    try {
      // Toggle the employee status and send the update request
      const response = await axios.put(
        `http://localhost:8080/users/userAccess/${id}`,
        { isEmployee: !employee.isEmployee }
      );

      alert(response.data.message);
    } catch (error) {
      console.error("Error updating employee access:", error);
      alert("Failed to update the employee. Please try again.");
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = async (name, id) => {
    const confirmDelete = window.confirm(`Do you want to delete: ${name}?`);

    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `http://localhost:8080/users/user/${id}`
        );

        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting details:", error);
        alert("Failed to delete the details. Please try again.");
      }
    }
  };

  const handleReset = (id) => {
    const employee = employees.find((emp) => emp.id === id);

    if (!employee) {
      alert("Employee not found.");
      return;
    }

    const { email } = employee;

    sendPasswordResetEmail(getAuth(), email)
      .then(() => {
        alert(`Password reset email sent to: ${email}`);
      })
      .catch((error) => {
        alert(
          `Error sending password reset email: ${error.code} - ${error.message}`
        );
      });
  };

  const handleSubmit = async (values) => {
    const currentDate = new Date();

    // Helper function for uploading images
    const uploadImage = async (fileName, folder, imageFile) => {
      if (!imageFile) return null;
      return ImageUploader(
        `${values.name}-${values.surname}-${fileName}`,
        currentDate,
        folder,
        imageFile
      );
    };

    // Helper function to construct user data object
    const constructUserData = (employURL, nicBackPhotoURL, nicPhotoURL) => ({
      name: values.name,
      surName: values.surname,
      birthDay: values.birthDate,
      email: values.email,
      nicNumber: values.nicNumber,
      nicFront: nicPhotoURL,
      nicBack: nicBackPhotoURL,
      houseNo: values.houseNo,
      street: values.street,
      city: values.city,
      zipCode: values.zipCode,
      employeePic: employURL,
      contactNum: values.contactNumber,
      referenceConNum: values.refContactNumber,
      epfNumber: values.epfNumber,
      etfNUmber: values.EtfNumber,
      sex: values.sex,
      isAdmin: false,
      isEmployee: false,
      dateAndTime: currentDate.toISOString(),
    });

    let userCredential = null;
    let uploadedImages = [];

    try {
      // Upload images concurrently
      const [employURL, nicBackPhotoURL, nicPhotoURL] = await Promise.all([
        uploadImage("", "EmployeePhotos", values.employeePhoto),
        uploadImage("nicBackPhoto", "NIC", values.nicBackPhoto),
        uploadImage("nicPhoto", "NIC", values.nicPhoto),
      ]);

      uploadedImages = [employURL, nicBackPhotoURL, nicPhotoURL];

      // Construct user data object
      const userData = constructUserData(
        employURL,
        nicBackPhotoURL,
        nicPhotoURL
      );

      if (editingEmployee) {
        // Update existing user
        const response = await axios.put(
          `http://localhost:8080/users/user/${editingEmployee.id}`,
          userData
        );
        alert(`${response.data.message}`);
      } else {
        // Create new user
        userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          "emp@123"
        );
        const user = userCredential.user;

        const response = await axios.post("http://localhost:8080/users/user", {
          uid: user.uid,
          ...userData,
        });

        alert(`${response.data.message} \nDefault Password: emp@123`);

        // Send password reset email
        await sendPasswordResetEmail(getAuth(), values.email);
        console.log("Password reset email sent.");
      }
    } catch (error) {
      console.error("Error:", error);

      // Delete created user if there's an error during submission
      if (userCredential) {
        try {
          await userCredential.user.delete();
          console.log("Created user deleted due to error in data submission.");
        } catch (deleteError) {
          console.error("Error deleting user:", deleteError);
        }
      }

      // Delete uploaded images if submission fails
      if (uploadedImages.length) {
        await Promise.all(uploadedImages.map((img) => deleteImage(img)));
        console.log("Uploaded images deleted due to error in data submission.");
      }

      const errorMessage =
        error.response?.data?.message ||
        "Failed to add or update the user. Please try again.";
      alert(`Error: ${errorMessage}`);
    } finally {
      // Close modal and reset editing state
      setIsModalOpen(false);
      setEditingEmployee(null);
    }
  };

  return (
    <div>
      <div className="reg-emp">
        <SecondaryNavbar />
        <br />
        <div className="">
          <div className="container">
            <button
              variant="contained"
              color="primary"
              onClick={() => {
                setIsModalOpen(true);
                setEditingEmployee(null);
              }}
              className="addnewbtntop"
            >
              New Employee
            </button>
            <div className="table-responsive">
              {loading || error || _.isEmpty(employees) ? (
                <TableChecker
                  loading={loading}
                  error={error}
                  hasData={employees.length > 0}
                />
              ) : (
                <table className="table mt-3 custom-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Name</th>
                      <th>Surname</th>
                      <th>NIC Number</th>
                      <th>Email</th>
                      <th>Contact Number</th>
                      <th>Reference Contact</th>
                      <th>EPF Number</th>
                      <th>ETF Number</th>
                      <th>Birth Date</th>
                      <th>Sex</th>
                      <th>Admin Access</th>
                      <th>Employee Access</th>
                      <th>Employee Photo</th>
                      <th>NIC Front Photo</th>
                      <th>NIC Back Photo</th>
                      <th>Updated Date</th>
                      <th>Updated Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="custom-table">
                    {employees.map((employee, index) => (
                      <tr key={employee.id}>
                        <td value={employee.id}>{index + 1}</td>
                        <td>{employee.name}</td>
                        <td>{employee.surname}</td>
                        <td>{employee.nicNumber}</td>
                        <td>{employee.email}</td>
                        <td>{employee.contactNumber}</td>
                        <td>{employee.refContactNumber}</td>
                        <td>{employee.epfNumber}</td>
                        <td>{employee.EtfNumber}</td>
                        <td>{employee.birthDate}</td> {/* Display Birth Date */}
                        <td>{employee.sex}</td>
                        <td>
                          <Switch
                            checked={employee.isAdmin}
                            onChange={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to toggle Admin rights?"
                                )
                              ) {
                                handleToggleAdmin(employee.id);
                              }
                            }}
                          />
                        </td>
                        <td>
                          <Switch
                            checked={employee.isEmployee}
                            onChange={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to toggle Employee status?"
                                )
                              ) {
                                handleToggleEmployee(employee.id);
                              }
                            }}
                          />
                        </td>
                        <FileViewer
                          fileUrl={employee.employeePic}
                          fileLabel="File"
                        />
                        <FileViewer
                          fileUrl={employee.nicFront}
                          fileLabel="NIC Front"
                        />
                        <FileViewer
                          fileUrl={employee.nicBack}
                          fileLabel="NIC Back"
                        />
                        <td>{employee.updatedDate}</td>
                        <td>{employee.updatedTime}</td>
                        <td>
                          <button
                            variant="contained"
                            size="small"
                            onClick={() => handleReset(employee.id)}
                            className="resetbtn"
                          >
                            Reset password
                          </button>
                          <button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleEdit(employee)}
                            className="editbtn"
                          >
                            Edit
                          </button>{" "}
                          <button
                            variant="contained"
                            color="secondary"
                            size="small"
                            onClick={() =>
                              handleDelete(
                                `${employee.name}, ${employee.surname}`,
                                employee.id
                              )
                            }
                            className="deletebtn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                        nicPhoto: editingEmployee?.nicPhoto || null,
                        nicBackPhoto: editingEmployee?.nicBackPhoto || null,
                        houseNo: editingEmployee?.houseNo || "",
                        street: editingEmployee?.street || "",
                        city: editingEmployee?.city || "",
                        zipCode: editingEmployee?.zipCode || "",
                        employeePhoto: editingEmployee?.employeePhoto || null,
                        contactNumber: editingEmployee?.contactNumber || "",
                        refContactNumber:
                          editingEmployee?.refContactNumber || "",
                        epfNumber: editingEmployee?.epfNumber || "",
                        EtfNumber: editingEmployee?.EtfNumber || "",
                        birthDate: editingEmployee?.birthDate || "", // Birth Date Field
                        email: editingEmployee?.email || "",
                        // password: "",
                        // confirmPassword: "",
                        sex: editingEmployee?.sex || "Male",
                      }}
                      validationSchema={RegEmpSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ setFieldValue, errors, touched }) => (
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
                              <div className="text-danger">
                                {errors.surname}
                              </div>
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
                            <label>Birth Date</label>{" "}
                            {/* Birth Date Field in Form */}
                            <Field
                              name="birthDate"
                              type="date"
                              className="form-control"
                            />
                            {errors.birthDate && touched.birthDate ? (
                              <div className="text-danger">
                                {errors.birthDate}
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
                            <label htmlFor="photo">NIC Photo</label>
                            <input
                              name="nicPhoto"
                              type="file"
                              onChange={(event) =>
                                setFieldValue("nicPhoto", event.target.files[0])
                              }
                              className="form-control"
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="photo">NIC Back Photo</label>
                            <input
                              name="nicBackPhoto"
                              type="file"
                              onChange={(event) =>
                                setFieldValue(
                                  "nicBackPhoto",
                                  event.target.files[0]
                                )
                              }
                              className="form-control"
                            />
                          </div>
                          <div className="mb-3">
                            <label>House No.</label>
                            <Field name="houseNo" className="form-control" />
                            {errors.houseNo && touched.houseNo ? (
                              <div className="text-danger">
                                {errors.houseNo}
                              </div>
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
                              <div className="text-danger">
                                {errors.zipCode}
                              </div>
                            ) : null}
                          </div>
                          <div className="mb-3">
                            <label htmlFor="photo">Employee Photo</label>
                            <input
                              name="employeePhoto"
                              type="file"
                              className="form-control"
                              onChange={(event) =>
                                setFieldValue(
                                  "employeePhoto",
                                  event.target.files[0]
                                )
                              }
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
                            <label>EPF Number</label>
                            <Field name="epfNumber" className="form-control" />
                            {errors.epfNumber && touched.epfNumber ? (
                              <div className="text-danger">
                                {errors.epfNumber}
                              </div>
                            ) : null}
                          </div>
                          <div className="mb-3">
                            <label>ETF Number</label>
                            <Field name="EtfNumber" className="form-control" />
                            {errors.EtfNumber && touched.EtfNumber ? (
                              <div className="text-danger">
                                {errors.EtfNumber}
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
                          <div className="text-end">
                            <button
                              variant="contained"
                              color="primary"
                              type="submit"
                              className="savechangesbutton"
                            >
                              Save
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
      </div>
    </div>
  );
};

export default RegEmp;
