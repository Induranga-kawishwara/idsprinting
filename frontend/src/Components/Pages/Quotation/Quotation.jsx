import React, { useState, useMemo } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal, TextField } from "@mui/material";
import "./Quotation.scss"; // Ensure the correct CSS file is imported
import jsPDF from "jspdf"; // Import jsPDF
import images from "./images.json";

const initialProducts = [
  { id: 1, name: "Shirts", price: 9.99, stoke: 10, gsm: 180, color: "Red" },
  { id: 2, name: "Pants", price: 14.99, stoke: 10, gsm: 200, color: "Blue" },
  { id: 3, name: "Dresses", price: 19.99, stoke: 10, gsm: 150, color: "Green" },
  { id: 4, name: "Shoes", price: 14.99, gsm: null, color: "Black" },
  { id: 5, name: "Jackets", price: 29.99, gsm: 300, color: "Grey" },
  { id: 6, name: "T-shirts", price: 7.99, gsm: 170, color: "White" },
  { id: 7, name: "Shorts", price: 11.99, gsm: 160, color: "Yellow" },
  { id: 8, name: "Hats", price: 5.99, gsm: null, color: "Red" },
  { id: 9, name: "Socks", price: 2.99, gsm: 100, color: "Black" },
  { id: 10, name: "Belts", price: 12.99, gsm: null, color: "Brown" },
  { id: 11, name: "Skirts", price: 16.99, gsm: 180, color: "Pink" },
  { id: 12, name: "Scarves", price: 8.99, gsm: 120, color: "Purple" },
  { id: 13, name: "Gloves", price: 6.99, gsm: null, color: "Blue" },
  { id: 14, name: "Jeans", price: 24.99, gsm: 250, color: "Dark Blue" },
  { id: 15, name: "Sweaters", price: 19.99, gsm: 300, color: "Green" },
  { id: 16, name: "Suits", price: 49.99, gsm: 350, color: "Black" },
  { id: 17, name: "Ties", price: 9.99, gsm: 90, color: "Red" },
  { id: 18, name: "Blouses", price: 15.99, gsm: 140, color: "Yellow" },
  { id: 19, name: "Sandals", price: 13.99, gsm: null, color: "Beige" },
  { id: 20, name: "Boots", price: 29.99, gsm: null, color: "Brown" },
  { id: 21, name: "Hoodies", price: 22.99, gsm: 320, color: "Grey" },
  { id: 22, name: "Caps", price: 7.99, gsm: null, color: "Black" },
  { id: 23, name: "Vests", price: 14.99, gsm: 200, color: "White" },
  { id: 24, name: "Coats", price: 39.99, gsm: 400, color: "Navy Blue" },
  { id: 25, name: "Leggings", price: 10.99, gsm: 160, color: "Black" },
  { id: 26, name: "Tracksuits", price: 25.99, gsm: 220, color: "Grey" },
  { id: 27, name: "Swimwear", price: 18.99, gsm: 80, color: "Red" },
  { id: 28, name: "Sneakers", price: 34.99, gsm: null, color: "White" },
  { id: 29, name: "Slippers", price: 8.99, gsm: null, color: "Blue" },
  { id: 30, name: "Blazers", price: 44.99, gsm: 280, color: "Black" },
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
];
const generateUniqueqtNumber = () => {
  const now = new Date();
  const year = String(now.getFullYear()).slice(2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  return `QUT-${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}`;
};

const adminEmail = "admin@admin.com";
const adminPassword = "admin123";

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
  const [qtNumber, setqtNumber] = useState(null);
  const [isViewQuotationModalOpen, setIsViewQuotationModalOpen] =
    useState(false);
  const [quotationToView, setQuotationToView] = useState(null);

  const [products] = useState(initialProducts);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("name"); // Default search field
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [copyType, setCopyType] = useState(""); // State for dropdown selection
  const [validityPeriod, setValidityPeriod] = useState(""); // State for validity period
  const [completionDays, setCompletionDays] = useState(""); // State for completion days
  const [quotations, setQuotations] = useState([]); // State to store quotations
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false); // State for admin modal
  const [adminCredentials, setAdminCredentials] = useState({
    email: "",
    password: "",
  }); // Admin credentials state
  const [quotationToDelete, setQuotationToDelete] = useState(null); // State to track which quotation to delete

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

  const handleViewQuotation = (quotation) => {
    setQuotationToView(quotation);
    setIsViewQuotationModalOpen(true);
  };

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

  // Function to save the current quotation to the list
  const saveQuotation = () => {
    const quotationNumber = generateUniqueqtNumber(); // Generate unique quotation number
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    const newQuotation = {
      date: formattedDate, // Save the date
      time: formattedTime, // Save the time
      customer: selectedCustomer
        ? `${selectedCustomer.name} ${selectedCustomer.surname}`
        : "No customer selected",
      contactNumber: selectedCustomer ? selectedCustomer.phone : "N/A",
      quotationNumber: quotationNumber, // Use the generated quotation number
      amount: transaction.total.toFixed(2),
      products: transaction.products, // Include products in the quotation
      validityPeriod: validityPeriod, // Save the validity period
      completionDays: completionDays, // Save the completion days
    };

    setQuotations((prevQuotations) => [...prevQuotations, newQuotation]);
  };

  // Function to generate Soft Copy PDF from table data
  const generateSoftCopyPDFFromTable = (quotation) => {
    generatePDF("Soft Copy");
  };

  const generatePrintPDFFromTable = (quotation) => {
    generatePDF("Print");
  };

  // Common function to generate a PDF from the table data
  // Function to generate a PDF for either Soft Copy or Print
  const generatePDF = (type) => {
    const doc = new jsPDF({
      format: [210, 297],
    });

    // Base64 images for soft copy and print
    const softCopyLogo = "";
    const printCopyLogo = "";

    // Add image based on type (Soft Copy or Print)
    if (type === "Soft Copy") {
      doc.addImage(images.softcopyy, "PNG", 0, 10, 210, 297); // Adjust the position of the image
    } else if (type === "Print") {
      doc.addImage(images.print, "PNG", 0, 10, 210, 297); // Adjust the position of the image
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    // doc.setFontSize(18);
    // doc.text(`Quotation Receipt (${type})`, 14, 70); // Position the title after the image
    doc.setFont("helvetica", "bold"); // Set the font to Helvetica, bold and italic
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255); // Set the text color to blue (RGB: 0, 0, 255)

    doc.text(`${formattedDate}`, 80.5, 61.8);
    doc.text(`${formattedTime}`, 80.5, 66.9);

    // Add Quotation Number
    const quotationNumber = qtNumber || generateUniqueqtNumber();
    doc.text(`${quotationNumber}`, 110.9, 64);

    doc.text(` ${selectedCustomer.address}`, 165, 64);

    doc.setTextColor(0, 0, 0); // Set the text color to blue (RGB: 0, 0, 255)
    if (selectedCustomer) {
      //doc.text("Customer:", 14, 100);
      doc.setFontSize(18);
      doc.text(
        `${selectedCustomer.name} ${selectedCustomer.surname}`,
        10.9,
        58.5
      );

      doc.setTextColor(117, 117, 117); // Set the text color to blue (RGB: 0, 0, 255)
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal"); // Set the font to Helvetica, normal (non-bold, non-italic)

      doc.text(`${selectedCustomer.phone}`, 10.9, 63);
      doc.text(`${selectedCustomer.email}`, 10.9, 67);
      doc.text(`Address: ${selectedCustomer.address}`, 10.9, 71);
    }

    // doc.text("Products:", 14, 130);
    // transaction.products.forEach((product, index) => {
    //   const y = 136 + index * 6;
    //   doc.text(
    //     `${product.name} - ${product.qty} x Rs.${product.price.toFixed(
    //       2
    //     )} = Rs.${(product.qty * product.price).toFixed(2)}`,
    //     14,
    //     y
    //   );
    // });

    transaction.products.forEach((product, index) => {
      const y = 91 + index * 7.5; // Adjust y position for each product

      // Define the X positions for each part of the text
      const productNameX = 15.3; // X position for product name
      const qtyX = 142.8; // X position for quantity
      const priceX = 105.8; // X position for price
      const totalX = 187.8; // X position for total (qty * price)

      // Draw each part of the text at the specified X positions
      doc.text(product.name, productNameX, y);
      doc.text(`${product.qty}`, qtyX, y, { align: "center" }); // Quantity
      doc.text(`Rs.${product.price.toFixed(2)}`, priceX, y, {
        align: "center",
      }); // Unit Price

      const totalPrice = `Rs.${(product.qty * product.price).toFixed(2)}`;
      doc.text(totalPrice, totalX, y, { align: "right" }); // Total price aligned
    });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold"); // Set the font to Helvetica, bold and italic
    doc.text(`${transaction.total.toFixed(2)}`, 195, 186, {
      align: "right",
    });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal"); // Set the font to Helvetica, bold and italic
    doc.text(`${completionDays}`, 79.7, 201.7, { align: "center" });
    doc.setTextColor(237, 28, 36);
    doc.text(`${validityPeriod} days`, 64.5, 257);

    if (type === "Soft Copy") {
      doc.save(`quotation_${quotationNumber}.pdf`);
    } else if (type === "Print") {
      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank");
    }
  };

  // Handle PDF generation based on copyType
  const handleGeneratePDF = () => {
    if (!selectedCustomer) {
      alert("Please select a customer before generating a quotation.");
      return;
    }

    // Check if validity period and completion days are filled
    if (!validityPeriod || !completionDays) {
      alert(
        "Please enter both the validity period and the date of completion."
      );
      return;
    }

    if (copyType === "Soft Copy") {
      generatePDF("Soft Copy");
    } else if (copyType === "Print") {
      generatePDF("Print");
    }
  };

  // Handle delete quotation with admin confirmation
  const handleDeleteQuotation = (quotation) => {
    setQuotationToDelete(quotation);
    setIsAdminModalOpen(true); // Open admin modal for authentication
  };

  const confirmDeleteQuotation = () => {
    if (
      adminCredentials.email === adminEmail &&
      adminCredentials.password === adminPassword
    ) {
      setQuotations((prevQuotations) =>
        prevQuotations.filter(
          (q) => q.quotationNumber !== quotationToDelete.quotationNumber
        )
      );
      setIsAdminModalOpen(false); // Close admin modal
      setAdminCredentials({ email: "", password: "" }); // Reset admin credentials
      setQuotationToDelete(null); // Clear the quotation to delete
    } else {
      alert("Invalid admin credentials. Please try again.");
    }
  };

  return (
    <div className="sales-page">
      <div className="sales-dashboard">
        <br />
        <br />
        <div className="sales-body">
          <div className="left-panel">
            <div className="net-amount-box">
              <h2>Net Amount</h2>
              <p>Rs. {transaction.net.toFixed(2)}</p>
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

              {/* Plus Button to Add Products Manually */}
              <div className="add-product-button-container">
                <Button
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="button-add-product"
                >
                  + Add Product
                </Button>
              </div>

              {/* <div className="totals">
                <p>Net: {transaction.net.toFixed(2)}</p>
              </div> */}
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

            <label>Do you want softcopy or print ?</label>
            <div className="action-buttons">
              <select
                value={copyType}
                onChange={(e) => setCopyType(e.target.value)}
                className="form-control mb-2"
              >
                <option value="" label="Select" disabled />
                <option value="Soft Copy">Soft Copy</option>
                <option value="Print">Print</option>
              </select>
              <button
                onClick={() => generatePDF(copyType)}
                className="button-add-product"
                disabled={!selectedCustomer}
              >
                {copyType === "Print" ? "Print PDF" : "Generate PDF"}
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
                  <span>{product.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quotation List */}
        <div className="quotation-list">
          <h4>Saved Quotations</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Customer</th>
                <th>Contact Number</th>
                <th>Quotation Number</th> {/* Add Quotation Number header */}
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((quotation) => (
                <tr key={quotation.quotationNumber}>
                  <td>{quotation.date}</td>
                  <td>{quotation.time}</td>
                  <td>{quotation.customer}</td>
                  <td>{quotation.contactNumber}</td>
                  <td>{quotation.quotationNumber}</td>{" "}
                  {/* Display the Quotation Number */}
                  <td>{quotation.amount}</td>
                  <td>
                    <button
                      onClick={() => generateSoftCopyPDFFromTable(quotation)}
                    >
                      Soft Copy
                    </button>
                    <button
                      onClick={() => generatePrintPDFFromTable(quotation)}
                    >
                      Print
                    </button>
                    <button onClick={() => handleDeleteQuotation(quotation)}>
                      Delete
                    </button>
                    <button onClick={() => handleViewQuotation(quotation)}>
                      View Quotation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal
          open={isViewQuotationModalOpen}
          onClose={() => setIsViewQuotationModalOpen(false)}
        >
          <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
            <div className="modal-content custom-modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Quotation Details</h5>
                <Button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setIsViewQuotationModalOpen(false)}
                />
              </div>
              <div className="modal-body">
                {quotationToView && (
                  <>
                    <p>
                      <strong>Date:</strong> {quotationToView.date}
                    </p>
                    <p>
                      <strong>Customer:</strong> {quotationToView.customer}
                    </p>
                    <p>
                      <strong>Contact Number:</strong>{" "}
                      {quotationToView.contactNumber}
                    </p>
                    <p>
                      <strong>Quotation Number:</strong>{" "}
                      {quotationToView.quotationNumber}
                    </p>
                    <p>
                      <strong>Amount:</strong> ${quotationToView.amount}
                    </p>
                    <h5>Products:</h5>
                    {quotationToView.products.map((product, index) => (
                      <p key={index}>
                        {product.name} - {product.qty} x $
                        {product.price.toFixed(2)} = $
                        {(product.qty * product.price).toFixed(2)}
                      </p>
                    ))}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => setIsViewQuotationModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Admin Authentication Modal */}
        <Modal
          open={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
        >
          <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
            <div className="modal-content custom-modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Admin Authentication</h5>
                <Button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setIsAdminModalOpen(false)}
                />
              </div>
              <div className="modal-body">
                <TextField
                  label="Admin Email"
                  type="email"
                  value={adminCredentials.email}
                  onChange={(e) =>
                    setAdminCredentials({
                      ...adminCredentials,
                      email: e.target.value,
                    })
                  }
                  fullWidth
                  className="mb-3"
                />
                <TextField
                  label="Admin Password"
                  type="password"
                  value={adminCredentials.password}
                  onChange={(e) =>
                    setAdminCredentials({
                      ...adminCredentials,
                      password: e.target.value,
                    })
                  }
                  fullWidth
                  className="mb-3"
                />
                <div className="modal-footer">
                  <Button
                    variant="secondary"
                    onClick={() => setIsAdminModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={confirmDeleteQuotation}>
                    Confirm Delete
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
                        <button
                          className="closebutton"
                          variant="secondary"
                          onClick={() => setIsAddProductModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="savechangesbutton"
                          type="submit"
                          variant="primary"
                        >
                          Add Product
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
  );
};

export default Quotation;
