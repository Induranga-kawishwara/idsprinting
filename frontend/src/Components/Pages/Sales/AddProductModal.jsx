// ProductFormModal.jsx
import React from 'react';
import { Modal, Button } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Define the product validation schema
const ProductSchema = Yup.object().shape({
  name: Yup.string().required('Product Name is required'),
  price: Yup.number().required('Price is required').min(0, 'Price must be greater than zero'),
  qty: Yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1'),
});

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialValues }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
        <div className="modal-content custom-modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {initialValues.id ? 'Edit Product' : 'Add Product'}
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
              validationSchema={ProductSchema}
              onSubmit={onSubmit}
            >
              {({ errors, touched }) => (
                <Form>
                  <div className="mb-3">
                    <label>Product Name</label>
                    <Field name="name" className="form-control" />
                    {errors.name && touched.name ? (
                      <div className="text-danger">{errors.name}</div>
                    ) : null}
                  </div>
                  <div className="mb-3">
                    <label>Price</label>
                    <Field
                      name="price"
                      type="number"
                      className="form-control"
                    />
                    {errors.price && touched.price ? (
                      <div className="text-danger">{errors.price}</div>
                    ) : null}
                  </div>
                  <div className="mb-3">
                    <label>Quantity</label>
                    <Field
                      name="qty"
                      type="number"
                      className="form-control"
                    />
                    {errors.qty && touched.qty ? (
                      <div className="text-danger">{errors.qty}</div>
                    ) : null}
                  </div>
                  <div className="modal-footer">
                    <Button
                      variant="secondary"
                      onClick={onClose}
                      className="me-2"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      {initialValues.id ? 'Update Product' : 'Add Product'}
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

export default ProductFormModal;
