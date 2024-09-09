import React, { useState, useMemo } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import "./Sales.scss";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory
import CustomerFormModal from "../Customer/CustomerFormModal"; // Adjust the import path
import "../All.scss";
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
    phone: "0711093799",
    totalSpent: "RD $50.00",
    houseNo: "12B",
    street: "Maple Street",
    city: "Santo Domingo",
    postalCode: "10101",
  },
  {
    id: 2,
    name: "Maria",
    surname: "Santiago",
    email: "maria.santiago@example.com",
    phone: "0711223344",
    totalSpent: "RD $200.00",
    houseNo: "45",
    street: "Elm Avenue",
    city: "Santiago",
    postalCode: "51000",
  },
  {
    id: 3,
    name: "Pedro",
    surname: "Gomez",
    email: "pedro.gomez@example.com",
    phone: "0722334455",
    totalSpent: "RD $120.50",
    houseNo: "89A",
    street: "Cedar Lane",
    city: "La Vega",
    postalCode: "41000",
  },
  {
    id: 4,
    name: "Laura",
    surname: "Martinez",
    email: "laura.martinez@example.com",
    phone: "0712334455",
    totalSpent: "RD $75.75",
    houseNo: "22C",
    street: "Oak Street",
    city: "Puerto Plata",
    postalCode: "57000",
  },
  {
    id: 5,
    name: "Juan",
    surname: "Rodriguez",
    email: "juan.rodriguez@example.com",
    phone: "0733445566",
    totalSpent: "RD $300.00",
    houseNo: "5",
    street: "Pine Boulevard",
    city: "Punta Cana",
    postalCode: "23000",
  },
  // Add more customers if needed
];

const PaymentSchema = Yup.object().shape({
  paymentMethod: Yup.string().required("Payment method is required"),
  cashGiven: Yup.number().when("paymentMethod", {
    is: "Cash",
    then: (schema) => schema.required("Cash given is required").min(0),
    otherwise: (schema) => schema.notRequired(),
  }),
  cardDetails: Yup.string().when("paymentMethod", {
    is: "Card",
    then: (schema) => schema.required("Card details are required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  bankTransferNumber: Yup.string().when("paymentMethod", {
    is: "Bank Transfer",
    then: (schema) => schema.required("Bank transfer number is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  chequeNumber: Yup.string().when("paymentMethod", {
    is: "Cheque",
    then: (schema) => schema.required("Cheque number is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  creditAmount: Yup.number().when("paymentMethod", {
    is: "Credit",
    then: (schema) => schema.required("Credit amount is required").min(0),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const ProductSchema = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  price: Yup.number()
    .required("Price is required")
    .min(0, "Price must be a positive number"),
  qty: Yup.number()
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1"),
});

const Sales = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customers] = useState(initialCustomers);
  const [transaction, setTransaction] = useState({
    products: [],
    total: 0.0,
    discount: 0.0,
    net: 0.0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = (values) => {
    // Logic for handling form submission
    setIsModalOpen(false);
  };

  const [daySales, setDaySales] = useState(0); // State to track day sales
  const [salesHistory, setSalesHistory] = useState([]); // State to track sales history

  const navigate = useNavigate(); // Use useNavigate for navigation

  const [invoiceNumber, setInvoiceNumber] = useState(null);
  const [products] = useState(initialProducts);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("name");

  const generateUniqueInvoiceNumber = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    // Combine them into a unique invoice number
    const invoiceNumber = `INV-${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}`;

    return invoiceNumber;
  };

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

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

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
        .slice(0, 5),
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
      const net = total - prevTransaction.discount;

      return { ...prevTransaction, products: updatedProducts, total, net };
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
      const net = total - prevTransaction.discount;

      return { ...prevTransaction, products: updatedProducts, total, net };
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
      const net = total - prevTransaction.discount;

      return { ...prevTransaction, products: updatedProducts, total, net };
    });
  };

  const updateDiscount = (discount) => {
    setTransaction((prevTransaction) => {
      const net = prevTransaction.total - Number(discount);
      return { ...prevTransaction, discount: Number(discount), net };
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
      const net = total - prevTransaction.discount;

      return { ...prevTransaction, products: updatedProducts, total, net };
    });
  };

  const completeSale = () => {
    if (selectedCustomer) {
      setIsPaymentModalOpen(true);
    } else {
      alert("Please select a customer before proceeding to payment.");
    }
  };

  const clearSearch = () => {
    setProductSearchQuery("");
    setSearchField("name");
  };

  const handlePaymentSubmit = (values) => {
    // Handle different payment methods
    if (values.paymentMethod === "Cash") {
      const balance = values.cashGiven - transaction.net;
      alert(`Transaction completed. Change due: Rs.${balance.toFixed(2)}`);
    } else if (values.paymentMethod === "Card") {
      alert(
        `Transaction completed using card. Details saved: ${values.cardDetails}`
      );
    } else if (values.paymentMethod === "Bank Transfer") {
      alert(
        `Transaction completed using bank transfer. Number: ${values.bankTransferNumber}`
      );
    } else if (values.paymentMethod === "Cheque") {
      alert(
        `Transaction completed using cheque. Number: ${values.chequeNumber}`
      );
    } else if (values.paymentMethod === "Credit") {
      alert(`Credit payment of Rs.${values.creditAmount} recorded.`);
    }

    //  invoice number
    const newInvoiceNumber = generateUniqueInvoiceNumber();
    setInvoiceNumber(newInvoiceNumber);

    // Ask the user if they want a receipt
    const wantsReceipt = window.confirm(
      "Would you like to download a receipt?"
    );

    // Generate PDF if user wants a receipt
    if (wantsReceipt) {
      generatePDF(values);
    }

    // Open the modal to choose download, print, or share
    setIsReceiptOptionsModalOpen(true);

    // Clear the transaction table after payment
    setTransaction({
      products: [],
      total: 0.0,
      discount: 0.0,
      net: 0.0,
    });

    // Close the modal after handling payment
    setIsPaymentModalOpen(false);
  };

  const generatePDF = (paymentDetails) => {
    const doc = new jsPDF();

    // Get current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    doc.setFontSize(18);
    doc.text("Transaction Receipt", 14, 22);
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${invoiceNumber}`, 14, 30);
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
        `${product.name} - ${product.qty} x Rs.${product.price.toFixed(
          2
        )} = Rs.${(product.qty * product.price).toFixed(2)}`,
        14,
        y
      );
    });

    doc.text(`Total: Rs.${transaction.total.toFixed(2)}`, 14, 120);
    doc.text(`Discount: Rs.${transaction.discount.toFixed(2)}`, 14, 126);
    doc.text(`Net: Rs.${transaction.net.toFixed(2)}`, 14, 132);

    doc.text("Payment Details:", 14, 150);
    doc.text(`Method: ${paymentDetails.paymentMethod}`, 14, 156);
    if (paymentDetails.paymentMethod === "Cash") {
      doc.text(`Cash Given: Rs.${paymentDetails.cashGiven}`, 14, 162);
      const changeDue = paymentDetails.cashGiven - transaction.net;
      doc.text(`Change Due: Rs.${changeDue.toFixed(2)}`, 14, 168);
    } else if (paymentDetails.paymentMethod === "Card") {
      doc.text(`Card Details: ${paymentDetails.cardDetails}`, 14, 162);
    } else if (paymentDetails.paymentMethod === "Bank Transfer") {
      doc.text(
        `Bank Transfer Number: ${paymentDetails.bankTransferNumber}`,
        14,
        162
      );
    } else if (paymentDetails.paymentMethod === "Cheque") {
      doc.text(`Cheque Number: ${paymentDetails.chequeNumber}`, 14, 162);
    } else if (paymentDetails.paymentMethod === "Credit") {
      doc.text(`Credit Amount: Rs.${paymentDetails.creditAmount}`, 14, 162);
    }

    return doc;
  };

  const handleAddProductSubmit = (values) => {
    const newProduct = {
      id: new Date().getTime(),
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
      const net = total - prevTransaction.discount;

      return { ...prevTransaction, products: updatedProducts, total, net };
    });

    setIsAddProductModalOpen(false);
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery("");
  };

  const handleRemoveCustomer = () => {
    setSelectedCustomer(null);
  };

  const downloadReceipt = () => {
    const doc = generatePDF(invoiceNumber);
    doc.save(`receipt_${invoiceNumber}.pdf`);
  };

  const printReceipt = () => {
    const doc = generatePDF(invoiceNumber);
    const pdfBlob = doc.output("blob");
    const pdfURL = URL.createObjectURL(pdfBlob);

    const printWindow = window.open(pdfURL, "_blank");
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const shareReceipt = (paymentDetails) => {
    if (!selectedCustomer) return;

    const formattedDate = new Date().toLocaleDateString();
    const formattedTime = new Date().toLocaleTimeString();

    // Construct the text message for sharing
    const textMessage = `IDS Printing House\nTransaction Receipt\nInvoice Number: ${invoiceNumber}\nDate: ${formattedDate}\nTime: ${formattedTime}\n\nCustomer:\nName: ${
      selectedCustomer.name
    } ${selectedCustomer.surname}\nContact: ${
      selectedCustomer.phone
    }\n\nProducts:\n${transaction.products
      .map(
        (product) =>
          `${product.name} - ${product.qty} x Rs.${product.price.toFixed(
            2
          )} = Rs.${(product.qty * product.price).toFixed(2)}`
      )
      .join("\n")}\n\nTotal: Rs.${transaction.total.toFixed(
      2
    )}\nPayment Method: ${paymentDetails.paymentMethod}`;

    // Construct the WhatsApp and Email URLs with the text message
    const whatsappURL = `https://wa.me/+94${
      selectedCustomer.phone
    }?text=${encodeURIComponent(textMessage)}`;
    const emailSubject = `Receipt for ${selectedCustomer.name} ${selectedCustomer.surname}`;
    const emailBody = textMessage;
    const mailtoURL = `mailto:?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    // Open the share options
    window.open(whatsappURL, "_blank"); // Open WhatsApp
    window.open(mailtoURL, "_blank"); // Open Email
  };

  const [isReceiptOptionsModalOpen, setIsReceiptOptionsModalOpen] =
    useState(false);

  return (
    <div className="sales-page">
      <div className="sales-dashboard">
        <br />
        <br />
        <div className="sales-body">
          <div className="left-panel">
            {/* Display Day Sales */}
            <div className="day-sales-box">
              <h3>Day's Sale Rs. {daySales.toFixed(2)}</h3>
            </div>

            {/* Net Amount Box */}
            <div className="net-amount-box">
              <h2>Net Amount</h2>
              <p>Rs. {transaction.net.toFixed(2)}</p>
            </div>

            <div className="d-flex align-items-center mb-3 buttoncontainer">
              <button
                variant="contained"
                onClick={handleOpenModal}
                className="newcustomerbtn"
              >
                New Customer
              </button>

              <button
                variant="contained"
                onClick={() => navigate("/sales-history")} // Navigate to SalesHistory.jsx
                className="saleshistorybtn"
              >
                Sales History
              </button>
              <button
                variant="contained"
                onClick={() => navigate("/credit-customers")}
                className="creditcustomersbtn"
              >
                Credit Customers
              </button>
            </div>
            {/* Use the modal component */}
            <CustomerFormModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleSubmit}
              initialValues={{
                name: "",
                surname: "",
                email: "",
                phone: "",
                houseNo: "",
                street: "",
                city: "",
                postalCode: "",
                customerType: "",
              }}
            />

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
                      
                      <span>Phone: {selectedCustomer.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCustomer}
                    className="creditcustomersbtn"
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
              <div class="custom-table-sale table-responsive">
                <table className="table mt-3 custom-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody classname="custom-table-sale">
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
                        <td>Rs. {(product.qty * product.price).toFixed(2)}</td>
                        <td>
                          <button
                            className="tableremovebtn"
                            onClick={() => removeProduct(product.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex align-items-center mb-3">
                {/* Plus Button to Add Products Manually */}
                <div className="add-product-button-container">
                  <button
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="button-add-product"
                  >
                    + Add Product
                  </button>
                </div>
                <div className="totals">
                  <p>
                    Discount:{" "}
                    <input
                      type="number"
                      value={transaction.discount}
                      min="0"
                      step="0.01"
                      onChange={(e) => updateDiscount(e.target.value)}
                      classname="searchfunctions me-2"
                    />
                  </p>
                </div>{" "}
                {/* <p>Net: Rs. {transaction.net.toFixed(2)}</p> */}
              </div>
            </div>
            <div className="action-buttons">
              <button
                onClick={completeSale}
                className="button-pay"
                disabled={!selectedCustomer}
              >
                Pay
              </button>
            </div>
          </div>



          <div className="right-panel">
            {/* Product Search and Filter */}
            <div className="d-flex align-items-center mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Search by ${searchField}`}
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
 
              <select
                className="form-control"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="gsm">GSM</option>
                <option value="color">Color</option>
              </select>
              <button
                  className="prevbutton2"
                  onClick={clearSearch}
                >
                  Clear
                </button>
            </div>
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  className="product-button"
                  onClick={() => addProductToTransaction(product)}
                >
                  {product.name}
                  <span>Rs. {product.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>




        {/* Payment Modal */}
        <Modal
          open={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
        >
          <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
            <div className="modal-content custom-modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Payment</h5>
                <Button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setIsPaymentModalOpen(false)}
                />
              </div>
              <div className="modal-body">
                <Formik
                  initialValues={{
                    paymentMethod: "",
                    cashGiven: "",
                    cardDetails: "",
                    bankTransferNumber: "",
                    chequeNumber: "",
                    creditAmount: "",
                  }}
                  validationSchema={PaymentSchema}
                  onSubmit={handlePaymentSubmit}
                >
                  {({ values, errors, touched }) => (
                    <Form>
                      <div className="mb-3">
                        <label>Payment Method</label>
                        <Field
                          as="select"
                          name="paymentMethod"
                          className="form-control"
                        >
                          <option value="" label="Select" disabled />
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Credit">Credit</option>
                        </Field>
                        {errors.paymentMethod && touched.paymentMethod ? (
                          <div className="text-danger">
                            {errors.paymentMethod}
                          </div>
                        ) : null}
                      </div>
                      {values.paymentMethod === "Cash" && (
                        <div className="mb-3">
                          <label>Cash Given</label>
                          <Field
                            name="cashGiven"
                            type="number"
                            className="form-control"
                          />
                          {errors.cashGiven && touched.cashGiven ? (
                            <div className="text-danger">
                              {errors.cashGiven}
                            </div>
                          ) : null}
                        </div>
                      )}
                      {values.paymentMethod === "Card" && (
                        <div className="mb-3">
                          <label>Card Holder's Name or Last 4 Digits</label>
                          <Field name="cardDetails" className="form-control" />
                          {errors.cardDetails && touched.cardDetails ? (
                            <div className="text-danger">
                              {errors.cardDetails}
                            </div>
                          ) : null}
                        </div>
                      )}
                      {values.paymentMethod === "Bank Transfer" && (
                        <div className="mb-3">
                          <label>Bank Transfer Number</label>
                          <Field
                            name="bankTransferNumber"
                            className="form-control"
                          />
                          {errors.bankTransferNumber &&
                          touched.bankTransferNumber ? (
                            <div className="text-danger">
                              {errors.bankTransferNumber}
                            </div>
                          ) : null}
                        </div>
                      )}
                      {values.paymentMethod === "Cheque" && (
                        <div className="mb-3">
                          <label>Cheque Number</label>
                          <Field name="chequeNumber" className="form-control" />
                          {errors.chequeNumber && touched.chequeNumber ? (
                            <div className="text-danger">
                              {errors.chequeNumber}
                            </div>
                          ) : null}
                        </div>
                      )}
                      {values.paymentMethod === "Credit" && (
                        <div className="mb-3">
                          <label>Paying Amount</label>
                          <Field
                            name="creditAmount"
                            type="number"
                            className="form-control"
                          />
                          {errors.creditAmount && touched.creditAmount ? (
                            <div className="text-danger">
                              {errors.creditAmount}
                            </div>
                          ) : null}
                        </div>
                      )}
                      <div className="modal-footer">
                        <Button
                          variant="secondary"
                          onClick={() => setIsPaymentModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                          Submit Payment
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </Modal>

        {/* Receipt Options Modal */}
        <Modal
          open={isReceiptOptionsModalOpen}
          onClose={() => setIsReceiptOptionsModalOpen(false)}
        >
          <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
            <div className="modal-content custom-modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Receipt Options</h5>
                <Button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setIsReceiptOptionsModalOpen(false)}
                />
              </div>
              <div className="modal-body">
                <p>What would you like to do with the receipt?</p>
                <div className="d-flex justify-content-end">
                  <Button
                    variant="contained"
                    onClick={downloadReceipt}
                    className="download-btn me-2"
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="contained"
                    onClick={printReceipt}
                    className="print-btn me-2"
                  >
                    Print Receipt
                  </Button>
                  <Button
                    variant="contained"
                    onClick={shareReceipt}
                    className="share-btn me-2"
                  >
                    Share
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setIsReceiptOptionsModalOpen(false)}
                    className="close-btn"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>

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

export default Sales;
