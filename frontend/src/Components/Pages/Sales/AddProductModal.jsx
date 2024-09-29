import React from "react";
import { Modal, Button } from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const ProductSchema = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  price: Yup.number()
    .required("Price is required")
    .min(0, "Price must be a positive number"),
  qty: Yup.number()
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1"),
  discount: Yup.number()
    .notRequired()
    .min(0, "Discount must be a positive number")
    .max(100, "Discount can't exceed 100%"),
});

const AddProductModal = ({ isOpen, onClose, onSubmit }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
        <div className="modal-content custom-modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Product</h5>
            <Button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <Formik
              initialValues={{ name: "", price: "", qty: "", discount: "" }}
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
                    <Field name="qty" type="number" className="form-control" />
                    {errors.qty && touched.qty ? (
                      <div className="text-danger">{errors.qty}</div>
                    ) : null}
                  </div>
                  <div className="mb-3">
                    <label>Discount (%)</label>
                    <Field
                      name="discount"
                      type="number"
                      className="form-control"
                    />
                    {errors.discount && touched.discount ? (
                      <div className="text-danger">{errors.discount}</div>
                    ) : null}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="submit"
                      variant="primary"
                      className="closebutton"
                    >
                      Add Product
                    </button>
                    <button
                      variant="secondary"
                      onClick={onClose}
                      className="savechangesbutton"
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
  );
};

export default AddProductModal;
