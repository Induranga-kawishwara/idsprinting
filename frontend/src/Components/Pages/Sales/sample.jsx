<Modal
open={isAddProductModalOpen}
onClose={() => setIsAddProductModalOpen(false)}
>
<div className="modal-dialog modal-dialog-centered custom-modal-dialog">
  <div className="modal-content custom-modal-content">
    <div className="modal-header">
      <h5 className="modal-title">Add Product</h5>
      <Button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={() => setIsAddProductModalOpen(false)}
      />
    </div>
    <div className="modal-body">
      <Formik
        initialValues={{
          name: "",
          price: "",
          qty: "",
        }}
        validationSchema={ProductSchema}
        onSubmit={handleAddProductSubmit}
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
                onClick={() => setIsAddProductModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add Product
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  </div>
</div>
</Modal>