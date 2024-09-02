import React, { useState, useMemo } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import "./Quotation.scss"; // Ensure the correct CSS file is imported
import jsPDF from "jspdf"; // Import jspdf

const initialProducts = [
  {
    id: 1,
    name: "Shirts",
    price: 9.99,
    gsm: 180,
    color: "Red",
  },
  {
    id: 2,
    name: "Pants",
    price: 14.99,
    gsm: 200,
    color: "Blue",
  },
  {
    id: 3,
    name: "Dresses",
    price: 19.99,
    gsm: 150,
    color: "Green",
  },
  {
    id: 4,
    name: "Shoes",
    price: 14.99,
    gsm: null,
    color: "Black",
  },
  // Add more products as needed
];

const initialCustomers = [
  {
    id: 1,
    name: "The J",
    surname: "Valoy",
    email: "valoy@domain.com",
    phone: "123-456-7890",
    totalSpent: "RD $50.00",
    houseNo: "",
    street: "",
    city: "",
    postalCode: "",
  },
  // Add more customers if needed
];

const ProductSchema = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  price: Yup.number()
    .required("Price is required")
    .min(0, "Price must be a positive number"),
  qty: Yup.number()
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1"),
});

const Quotation = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customers] = useState(initialCustomers);
  const [transaction, setTransaction] = useState({
    products: [],
    total: 0.0,
    net: 0.0,
  });

  const [products] = useState(initialProducts);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("name"); // Default search field
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [copyType, setCopyType] = useState("Soft Copy"); // State for dropdown selection
  const [validityPeriod, setValidityPeriod] = useState(""); // State for validity period
  const [completionDays, setCompletionDays] = useState(""); // State for completion days

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (searchField === "name") {
        return product.name
          .toLowerCase()
          .includes(productSearchQuery.toLowerCase());
      } else if (searchField === "price") {
        return product.price.toString().includes(productSearchQuery);
      } else if (searchField === "gsm") {
        return (
          product.gsm && product.gsm.toString().includes(productSearchQuery)
        );
      } else if (searchField === "color") {
        return product.color
          .toLowerCase()
          .includes(productSearchQuery.toLowerCase());
      }
      return true;
    });
  }, [productSearchQuery, searchField, products]);

  const filteredCustomers = useMemo(
    () =>
      customers
        .filter(
          (customer) =>
            customer.surname
              .toLowerCase()
              .includes(customerSearchQuery.toLowerCase()) ||
            customer.name
              .toLowerCase()
              .includes(customerSearchQuery.toLowerCase()) ||
            customer.phone.includes(customerSearchQuery)
        )
        .slice(0, 5), // Limit to top 5 customers
    [customerSearchQuery, customers]
  );

  const addProductToTransaction = (product) => {
    setTransaction((prevTransaction) => {
      const existingProduct = prevTransaction.products.find(
        (p) => p.id === product.id
      );
      let updatedProducts;

      if (existingProduct) {
        updatedProducts = prevTransaction.products.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      } else {
        updatedProducts = [...prevTransaction.products, { ...product, qty: 1 }];
      }

      const total = updatedProducts.reduce(
        (sum, p) => sum + p.qty * p.price,
        0
      );

      return {
        ...prevTransaction,
        products: updatedProducts,
        total,
        net: total,
      };
    });
  };

  const updateProductQty = (productId, qty) => {
    setTransaction((prevTransaction) => {
      const updatedProducts = prevTransaction.products.map((product) =>
        product.id === productId ? { ...product, qty: Number(qty) } : product
      );
      const total = updatedProducts.reduce(
        (sum, p) => sum + p.qty * p.price,
        0
      );

      return {
        ...prevTransaction,
        products: updatedProducts,
        total,
        net: total,
      };
    });
  };

  const updateProductPrice = (productId, price) => {
    setTransaction((prevTransaction) => {
      const updatedProducts = prevTransaction.products.map((product) =>
        product.id === productId
          ? { ...product, price: Number(price) }
          : product
      );
      const total = updatedProducts.reduce(
        (sum, p) => sum + p.qty * p.price,
        0
      );

      return {
        ...prevTransaction,
        products: updatedProducts,
        total,
        net: total,
      };
    });
  };

  const removeProduct = (productId) => {
    setTransaction((prevTransaction) => {
      const updatedProducts = prevTransaction.products.filter(
        (product) => product.id !== productId
      );
      const total = updatedProducts.reduce(
        (sum, p) => sum + p.qty * p.price,
        0
      );

      return {
        ...prevTransaction,
        products: updatedProducts,
        total,
        net: total,
      };
    });
  };

  const clearSearch = () => {
    setProductSearchQuery("");
    setSearchField("name"); // Reset search field to default value
  };

  const handleAddProductSubmit = (values) => {
    const newProduct = {
      id: new Date().getTime(), // Generate a unique id
      name: values.name,
      price: Number(values.price),
      qty: Number(values.qty),
    };

    setTransaction((prevTransaction) => {
      const updatedProducts = [...prevTransaction.products, newProduct];
      const total = updatedProducts.reduce(
        (sum, p) => sum + p.qty * p.price,
        0
      );

      return {
        ...prevTransaction,
        products: updatedProducts,
        total,
        net: total,
      };
    });

    setIsAddProductModalOpen(false);
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(""); // Clear search input after selection
  };

  const handleRemoveCustomer = () => {
    setSelectedCustomer(null);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    doc.setFontSize(18);
    doc.text("Quotation Receipt", 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${formattedDate}`, 14, 36);
    doc.text(`Time: ${formattedTime}`, 14, 42);

    doc.text("Customer:", 14, 50);
    if (selectedCustomer) {
      doc.text(
        `Name: ${selectedCustomer.name} ${selectedCustomer.surname}`,
        14,
        56
      );
      doc.text(`Email: ${selectedCustomer.email}`, 14, 62);
      doc.text(`Phone: ${selectedCustomer.phone}`, 14, 68);
    }

    doc.text("Products:", 14, 80);
    transaction.products.forEach((product, index) => {
      const y = 86 + index * 6;
      doc.text(
        `${product.name} - ${product.qty} x $${product.price.toFixed(2)} = $${(
          product.qty * product.price
        ).toFixed(2)}`,
        14,
        y
      );
    });

    doc.text(`Total: $${transaction.total.toFixed(2)}`, 14, 120);

    doc.text(`Validity Period: ${validityPeriod} days`, 14, 130); // Add validity period
    doc.text(`Completion: within ${completionDays} working days`, 14, 136); // Add completion days

    doc.save("quotation_receipt.pdf");
  };

  return (
    <div className="quotation-page">
      <div className="quotation-dashboard">
        <br />
        <br />
        <div className="quotation-body">
          <div className="left-panel">
            <div className="customer-info">
              {selectedCustomer ? (
                <div className="customer-selected">
                  <div className="customer-details">
                    <h3>
                      {selectedCustomer.name} {selectedCustomer.surname}
                    </h3>
                    <p>
                      {selectedCustomer.loyaltyStatus || "Regular Customer"}
                    </p>
                    <div className="customer-metrics">
                      <span>Email: {selectedCustomer.email}</span>
                      <br />
                      <span>Phone: {selectedCustomer.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCustomer}
                    className="remove-customer-button"
                  >
                    Remove Customer
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search customer by name, surname, or phone"
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  />
                  <ul className="customer-search-list">
                    {filteredCustomers.map((customer) => (
                      <li
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        {customer.name} {customer.surname} - {customer.phone}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="transaction-summary">
              <div class="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaction.products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>
                          <input
                            type="number"
                            value={product.qty}
                            min="1"
                            onChange={(e) =>
                              updateProductQty(product.id, e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={product.price}
                            min="0"
                            step="0.01"
                            onChange={(e) =>
                              updateProductPrice(product.id, e.target.value)
                            }
                          />
                        </td>
                        <td>{(product.qty * product.price).toFixed(2)}</td>
                        <td>
                          <button onClick={() => removeProduct(product.id)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Plus Button to Add Products Manually */}
              <div className="add-product-button-container">
                <Button
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="button-add-product"
                >
                  + Add Product
                </Button>
              </div>

              <div className="totals">
                <p>Net: {transaction.net.toFixed(2)}</p>
              </div>
            </div>

            {/* Inputs for Validity Period and Completion Days */}
            <div className="additional-info">
              <div className="form-group mb-3">
                <label>Validity Period (days)</label>
                <input
                  type="number"
                  className="form-control"
                  value={validityPeriod}
                  onChange={(e) => setValidityPeriod(e.target.value)}
                  min="1"
                />
              </div>
              <div className="form-group mb-3">
                <label>Date of Completion (working days)</label>
                <input
                  type="text"
                  className="form-control"
                  value={completionDays}
                  onChange={(e) => setCompletionDays(e.target.value)}
                  placeholder="e.g., 5-10"
                />
              </div>
            </div>

            {/* Dropdown for selecting Print or Soft Copy */}
            <div className="action-buttons">
              <select
                value={copyType}
                onChange={(e) => setCopyType(e.target.value)}
                className="form-control mb-2"
              >
                <option value="Soft Copy">Soft Copy</option>
                <option value="Print">Print</option>
              </select>
              <button onClick={generatePDF} className="button-generate-pdf">
                Generate PDF
              </button>
            </div>
          </div>
          <div className="right-panel">
            {/* Product Search and Filter */}
            <div className="product-search">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Search by ${searchField}`}
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
                <button
                  className="btn btn-outline-secondary"
                  onClick={clearSearch}
                >
                  Clear
                </button>
              </div>
              <select
                className="form-control mt-2"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="gsm">GSM</option>
                <option value="color">Color</option>
              </select>
            </div>
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  className="product-button"
                  onClick={() => addProductToTransaction(product)}
                >
                  {product.name}
                  <span>{product.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add Product Modal */}
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
      </div>
    </div>
  );
};

export default Quotation;
