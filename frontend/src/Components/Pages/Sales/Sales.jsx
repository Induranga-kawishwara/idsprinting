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
import ProductFormModal from "./AddProductModal";
import ReceiptOptionsModal from "./ReceiptOptionsModal";
import PaymentModal from "./PaymentModal";

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

    const year = String(now.getFullYear()).slice(2); // Get the last two digits of the year
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

  const [editingProduct, setEditingProduct] = useState(null);

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

      console.log("Updated Products:", updatedProducts); // Log updated products

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
      // Log the transaction object to debug
      console.log("Transaction:", transaction);

      // Ensure the transaction contains products before proceeding to payment
      if (transaction.products.length > 0) {
        setIsPaymentModalOpen(true);
      } else {
        alert("Please add products to the cart before proceeding to payment.");
      }
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

    // Generate a unique invoice number
    const newInvoiceNumber = generateUniqueInvoiceNumber();
    setInvoiceNumber(newInvoiceNumber);

    // Define `wantsReceipt` to check if the user wants to download the receipt
    const wantsReceipt = window.confirm(
      "Would you like to download a receipt?"
    );

    // Generate PDF if the user wants a receipt
    if (wantsReceipt) {
      console.log(
        "Products in Transaction before generating PDF:",
        transaction.products
      );
      generatePDF(values); // Pass `values` as `paymentDetails` to the function
    }

    // Open the modal to choose download, print, or share
    setIsReceiptOptionsModalOpen(true);

    // Close the payment modal after handling payment
    setIsPaymentModalOpen(false);
  };

  const clearTransaction = () => {
    setTransaction({
      products: [],
      total: 0.0,
      discount: 0.0,
      net: 0.0,
    });
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

    // Customer details
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

    // Products in the transaction
    doc.text("Products:", 14, 80);
    if (transaction.products.length > 0) {
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
    } else {
      doc.text("No products", 14, 86);
    }

    // Totals
    doc.text(`Total: Rs.${transaction.total.toFixed(2)}`, 14, 120);
    doc.text(`Discount: Rs.${transaction.discount.toFixed(2)}`, 14, 126);
    doc.text(`Net: Rs.${transaction.net.toFixed(2)}`, 14, 132);

    // Payment details
    doc.text("Payment Details:", 14, 150);
    doc.text(`Method: ${paymentDetails.paymentMethod || "N/A"}`, 14, 156);

    if (paymentDetails.paymentMethod === "Cash") {
      doc.text(`Cash Given: Rs.${paymentDetails.cashGiven}`, 14, 162);
      const changeDue = paymentDetails.cashGiven - transaction.net;
      doc.text(`Change Due: Rs.${changeDue.toFixed(2)}`, 14, 168);
    } else if (paymentDetails.paymentMethod === "Card") {
      doc.text(`Card Details: ${paymentDetails.cardDetails || "N/A"}`, 14, 162);
    } else if (paymentDetails.paymentMethod === "Bank Transfer") {
      doc.text(
        `Bank Transfer Number: ${paymentDetails.bankTransferNumber || "N/A"}`,
        14,
        162
      );
    } else if (paymentDetails.paymentMethod === "Cheque") {
      doc.text(
        `Cheque Number: ${paymentDetails.chequeNumber || "N/A"}`,
        14,
        162
      );
    } else if (paymentDetails.paymentMethod === "Credit") {
      doc.text(
        `Credit Amount: Rs.${paymentDetails.creditAmount || 0}`,
        14,
        162
      );
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
              <button className="prevbutton2" onClick={clearSearch}>
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

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          initialValues={{
            paymentMethod: "",
            cashGiven: "",
            cardDetails: "",
            bankTransferNumber: "",
            chequeNumber: "",
            creditAmount: "",
          }}
          validationSchema={PaymentSchema}
          handleSubmit={handlePaymentSubmit}
          clearTransaction={clearTransaction}
        />

        <ReceiptOptionsModal
          isOpen={isReceiptOptionsModalOpen}
          onClose={() => setIsReceiptOptionsModalOpen(false)}
          downloadReceipt={downloadReceipt}
          printReceipt={printReceipt}
          shareReceipt={shareReceipt}
        />

        <ProductFormModal
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          onSubmit={handleAddProductSubmit}
          initialValues={
            editingProduct || {
              name: "",
              price: "",
              qty: "",
            }
          }
        />
      </div>
    </div>
  );
};

export default Sales;
