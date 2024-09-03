// CustomerFormModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import './Customer.scss'; // Adjust the import path as necessary

const CustomerSchema = Yup.object().shape({
  surname: Yup.string().required('Surname is required'),
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email'),
  phone: Yup.string().required('Phone number is required'),
  houseNo: Yup.string(),
  street: Yup.string(),
  city: Yup.string(),
  postalCode: Yup.string(),
  customerType: Yup.string().required('Customer type is required'),
});

const CustomerFormModal = ({ isOpen, onClose, onSubmit, initialValues }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
        <div className="modal-content custom-modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {initialValues.id ? 'Edit Customer' : 'New Customer'}
            </h5>
            <Button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
          </div>
          <div className="modal-body">
            <Formik
              initialValues={initialValues}
              validationSchema={CustomerSchema}
              onSubmit={onSubmit}
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
                    <Field name="email" type="email" className="form-control" />
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
                    <Field as="select" name="customerType" className="form-control">
                      <option value="" label="Select" disabled />
                      <option value="Regular">Regular Customer</option>
                      <option value="Daily">Daily Customer</option>
                    </Field>
                    {errors.customerType && touched.customerType ? (
                      <div className="text-danger">{errors.customerType}</div>
                    ) : null}
                  </div>
                  <div className="d-flex justify-content-end">
                    <Button variant="contained" type="submit" className="update-btn">
                      {initialValues.id ? 'Update' : 'Add'}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={onClose}
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
  );
};

export default CustomerFormModal;
