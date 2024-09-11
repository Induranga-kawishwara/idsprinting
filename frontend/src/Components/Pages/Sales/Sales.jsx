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
import AddProductModal from "./AddProductModal"; // Import your new component
import ReceiptOptionsModal from "./ReceiptOptionsModal"; // Import the new component
import PaymentModal from "./PaymentModal"; // Import the new component

const initialProducts = [
  { id: 1, name: "Shirts", price: 9.99, gsm: 180, color: "Red" },
  { id: 2, name: "Pants", price: 14.99, gsm: 200, color: "Blue" },
  { id: 3, name: "Dresses", price: 19.99, gsm: 150, color: "Green" },
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

const generateUniqueInvoiceNumber = () => {
  const now = new Date();

  const year = String(now.getFullYear()).slice(2); // Get the last two digits of the year
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Adding leading zero
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0"); // Leading zeros for milliseconds

  // Combine them into the desired format
  const invoiceNumber = `INV-${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}`;

  return invoiceNumber;
};

const Sales = () => {
  const [isReceiptOptionsModalOpen, setIsReceiptOptionsModalOpen] =
    useState(false);

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
        updatedProducts = [
          ...prevTransaction.products,
          { ...product, qty: 1, discount: 0 },
        ];
      }

      const total = updatedProducts.reduce(
        (sum, p) =>
          sum + Number(p.qty) * (Number(p.price) - Number(p.discount)), // Ensure numbers
        0
      );
      const net = total - prevTransaction.discount;

      return { ...prevTransaction, products: updatedProducts, total, net };
    });
  };

  const updateProductDiscount = (productId, discount) => {
    setTransaction((prevTransaction) => {
      const updatedProducts = prevTransaction.products.map((product) =>
        product.id === productId
          ? { ...product, discount: Number(discount) }
          : product
      );

      const total = updatedProducts.reduce(
        (sum, p) => sum + p.qty * (p.price - p.discount), // Apply Rs discount to each product
        0
      );

      const net = total - prevTransaction.discount; // Adjust net total based on transaction-level discount, if any

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
      const net = prevTransaction.total - Number(discount); // Apply fixed Rs discount to total
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

  const [paymentDetailsState, setPaymentDetailsState] = useState(null); // Add this to store payment details

  const handlePaymentSubmit = (values) => {
    console.log("Payment details:", values); // Log the values for debugging

    let creditBalance = 0; // Define the credit balance
    let cashChangeDue = 0; // Define cash change due

    // Handle different payment methods
    if (values.paymentMethod === "Cash") {
      const balance = values.cashGiven - transaction.net;
      alert(`Transaction completed. Change due: Rs.${balance.toFixed(2)}`);
    } else if (values.paymentMethod === "Card") {
      alert(
        `Transaction completed using card. Details saved: ${values.cardDetails}`
      );
    } else if (values.paymentMethod === "Card and Cash") {
      const cashPart = values.cashGiven || 0;
      const remainingAmount = transaction.net - cashPart;
      cashChangeDue = cashPart - transaction.net;

      if (cashPart >= transaction.net) {
        alert(
          `Transaction completed. Change due: Rs.${cashChangeDue.toFixed(2)}`
        );
      } else {
        alert(
          `Transaction partially completed with cash (Rs.${cashPart}) and remaining amount (Rs.${remainingAmount.toFixed(
            2
          )}) covered by card.`
        );
      }
    } else if (values.paymentMethod === "Bank Transfer") {
      alert(
        `Transaction completed using bank transfer. Number: ${values.bankTransferNumber}`
      );
    } else if (values.paymentMethod === "Cheque") {
      alert(
        `Transaction completed using cheque. Number: ${values.chequeNumber}`
      );
    } else if (values.paymentMethod === "Credit") {
      // Calculate credit balance (outstanding amount)
      creditBalance = transaction.net - values.creditAmount;
      alert(
        `Credit payment of Rs.${
          values.creditAmount
        } recorded. Remaining balance: Rs.${creditBalance.toFixed(2)}`
      );
    }

    // Save the payment details and credit balance in state
    setPaymentDetailsState({
      ...values,
      cashChangeDue: cashChangeDue > 0 ? cashChangeDue : 0, // Store cash change due if there's any
      creditBalance: creditBalance > 0 ? creditBalance : 0, // Store credit balance if there's any
    });

    // Generate a unique invoice number
    setInvoiceNumber(generateUniqueInvoiceNumber());

    // Ask the user if they want a receipt
    const wantsReceipt = window.confirm(
      "Would you like to download a receipt?"
    );

    // Generate PDF if user wants a receipt
    if (wantsReceipt) {
      generatePDF({
        ...values,
        cashChangeDue,
        creditBalance: creditBalance > 0 ? creditBalance : 0, // Pass credit balance to the PDF function
      });
    }

    // Open the modal to choose download, print, or share
    setIsReceiptOptionsModalOpen(true);

    // Close the modal after handling payment
    setIsPaymentModalOpen(false);
  };

  const generatePDF = (paymentDetails) => {
    console.log("Generating PDF with payment details:", paymentDetails); // Log payment details
    const lastProductY = 62 + transaction.products.length * 6; // Y position after the last product
    // Initialize PDF with custom width (3 inches) and larger height to accommodate content
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [76.2, lastProductY + 38], // 76.2 mm width (3 inches), 297 mm height (A4 size, for example)
    });
    //const margin = 10; // Define a 10mm margin for left and right
    let yPosition = 20; // Initial Y-coordinate for content

    // Get current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    // Add header image
    const headerImg =
      "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KzoU2bi4uKBz58548803MWTIEE7hUzkXFxd0794dERER6Nevnyzb69y5c/jmm2+wZMkSyauLV6pUCWPHjuUSE06OCSGRhC5cuKBof2ooC12xYkW88sorOHXqFLZt24bnn3+eRRKKWbJkCX777TfRYdglNzc3TJgwAW5ubpK3ffPmTfz666+Ijo6W5P6bkjw9PfHUU0/hu+++Q//+/XmyJaG8vDxERkZi48aNokORlaurK/r164e33nrL5kJLJI+WLVvin//8J5588klJ7nsu6fbt21i0aBFmz54t2/nFU089xe9sYkJIJJXbt28jOztb0T7VkBAaaTQa9OzZEz/++COuXLmCBQsW8ET4/7355puKjx47Crmr3p0+fRozZ87E0qVLZfn8+vj4YOrUqfjqq6/Qrl07ydt3VgaDAd9++61TVPT18fHBCy+8gKefflrxtW6pdHXr1kVYWBief/551K5dW/L28/LysH79ekRGRuLAgQOSt2/Us2dPXmwgAEwIiSQjRxVDU9RafMDb2xsTJkxAQkIC0tPT8cMPP2D48OFCp7iKdPnyZXz55Zeiw7Bb3bt3R+vWrWVrv7CwEDt37sSnn36K7du3y7IYeuPGjfHhhx/i3XffRYMGDSRv31n98ssvWLRokegwFNGpUye89dZbsn4WqHyVK1dGSEgI3njjDTRt2lTy9g0GAw4ePIioqCisX79e8rVUi6tbty6GDRsmW/tkX5gQEknkzJkzivdZv359xfu0VO3atfHCCy9g+fLluHnzJpYuXYpnnnlG8nvD1C4qKkrxokOOJCQkBFWqVJG1j5ycHPz111/44osvcPLkSVn6CAgIwKxZsxAaGir763EW//3vf/HLL79Ivt6kGlWuXBnPPvssxo0b57QX2ERwd3dHUFAQIiIi0KVLF1lmvly8eBFz5szBwoULcevWLcnbL07O6fhkn5gQEknk0KFDivdpb0s/eHt7Y9SoUfj1119x+fJlHD9+HLNnz8bo0aMdvlrp3bt38fPPP4sOw25VrFgR48aNU2QK8rVr1/DDDz/gp59+kmXtO1dXVwwePBhz587Fk08+yaIhEli+fDmio6OdIikEAL1ejzfeeIPLnMhMo9EgICAAERERGDhwoCxFou7cuYMlS5bg66+/VmxZlZEjR8oy1ZXsFy8NEElERELo6+ureJ9SatGiBVq0aIFX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";
    doc.addImage(headerImg, "PNG", 0, 0, 76.2, 65.53); // Adjust x, y, width, height as needed

    //doc.setFontSize(18);
    //doc.text("Transaction Receipt", 48.8, 21.2);
    doc.setFontSize(4.5);
    doc.text(`${invoiceNumber}`, 21.2, 54.4);
    doc.text(`${formattedDate}   ${formattedTime}`, 21.2, 56.8);
    //doc.text(`Time: ${formattedTime}`, 14, 42);
    doc.setFontSize(4.5);
    //doc.text("Customer:", 21.2, 48.8);
    if (selectedCustomer) {
      doc.text(
        `${selectedCustomer.name} ${selectedCustomer.surname}`,
        21.2,
        49.4
      );
      //doc.text(`Email: ${selectedCustomer.email}`, 14, 62);
      doc.text(`${selectedCustomer.phone}`, 21.2, 51.9);
    }

    doc.setFontSize(6.5);
    transaction.products.forEach((product, index) => {
      const y = 67 + index * 6; // Adjust y position for each product

      // Define x positions for the different parts of the text
      const productNameX = 4.8; // X position for product name
      const qtyX = 39.5; // X position for quantity
      const priceX = 22; // X position for price
      const discountX = 48; // X position for discount
      const totalX = 63; // X position for total price (qty * (price - discount))

      // Draw each part of the text at different x positions
      doc.text(product.name, productNameX, y); // Product Name
      doc.text(`${product.qty}`, qtyX, y); // Quantity
      doc.text(`Rs.${product.price.toFixed(2)}`, priceX, y); // Unit Price
      doc.text(`Rs.${product.discount.toFixed(2)}`, discountX, y); // Discount

      const pageWidth = 71.8; // Example width of the content area, adjust as needed

      transaction.products.forEach((product, index) => {
        const y = 67 + index * 6; // Adjust y position for each product

        // Calculate total text and its width for dynamic positioning
        const totalText = `Rs.${(
          product.qty *
          (product.price - product.discount)
        ).toFixed(2)}`;
        const totalTextWidth = doc.getTextWidth(totalText); // Get the width of the total text
        const totalX = pageWidth - totalTextWidth; // Align total to the right

        // Draw the total price aligned to the right
        doc.text(totalText, totalX, y);
      });
    });
    //const lastProductY = 62 + transaction.products.length * 6; // Y position after the last product
    doc.line(4.5, lastProductY + 2, 71.8, lastProductY + 2); // Draw line from x=4.5 to x=71.8 at the y position

    //total
    doc.setFontSize(10);
    doc.text(`Total:`, 4.5, lastProductY + 7);
    const pageWidth = doc.internal.pageSize.getWidth(); // Get the page width
    const text = ` Rs. ${transaction.total.toFixed(2)}`;
    const textWidth = doc.getTextWidth(text); // Get the width of the text
    doc.text(
      text,
      pageWidth - textWidth - 4.5, // Position X: Page width minus text width and some padding
      lastProductY + 7
    );

    //discount
    doc.setFontSize(7);
    doc.text(`Discount: `, 4.5, lastProductY + 11);

    // Set discount text aligned to the right
    const discountText = `Rs. ${transaction.discount.toFixed(2)}`;

    const discountTextWidth = doc.getTextWidth(discountText); // Get the width of the discount text
    const discountXPosition = pageWidth - discountTextWidth - 4.5; // Align it to the right by subtracting from the total width

    doc.text(discountText, discountXPosition, lastProductY + 11); // Set the text at the right position

    //
    // doc.text(`Net: Rs.${transaction.net.toFixed(2)}`, 14, 132);

    // // doc.text("Payment Details:", 14, 150);
    // // doc.text(`Method: ${paymentDetails.paymentMethod}`, 14, 156); // Ensure this prints correctly
    // const methodText = `${paymentDetails.paymentMethod}`;
    // const methodTextWidth = doc.getTextWidth(methodText); // Get the width of the text
    // const methodTextX = pageWidth - methodTextWidth - 12.5; // Align to the right
    // doc.text(methodText, methodTextX, 52.6); // Render the text aligned to the right

    const methodText = `${paymentDetails.paymentMethod}`;
    const methodTextWidth = doc.getTextWidth(methodText); // Get the width of the text
    const methodTextX = (114.6 - methodTextWidth) / 2; // Calculate the center position  //57.3
    doc.text(methodText, methodTextX, 52.6); // Render the text centered horizontally

    //cash given
    if (paymentDetails.paymentMethod === "Cash") {
      doc.text(`Cash Given: Rs. `, 4.5, lastProductY + 15);

      const changeDue = paymentDetails.cashGiven - transaction.net;
      doc.text(`Change Due: Rs. `, 4.5, lastProductY + 19);
    } else if (paymentDetails.paymentMethod === "Card") {
      //doc.text(`Card Details: ${paymentDetails.cardDetails}`, 14, 162);
    } else if (paymentDetails.paymentMethod === "Bank Transfer") {
      //doc.text(`Bank Transfer Number: ${paymentDetails.bankTransferNumber}`, 14,162 );
    } else if (paymentDetails.paymentMethod === "Cheque") {
      //doc.text(`Cheque Number: ${paymentDetails.chequeNumber}`, 14, 162);
    } else if (paymentDetails.paymentMethod === "Credit") {
      doc.text(`Credit Amount Paid: `, 4.5, lastProductY + 15);
      // Show the credit balance if there's any remaining balance
      if (paymentDetails.creditBalance > 0) {
        doc.text(`Remaining Balance: `, 4.5, lastProductY + 19);
      } else {
        doc.text(
          `Full payment received. No outstanding balance.`,
          4.5,
          lastProductY + 19
        );
      }
    }

    if (paymentDetails.paymentMethod === "Cash") {
      // Cash Given
      const cashGivenText = `Rs.${paymentDetails.cashGiven}`;
      const cashGivenTextWidth = doc.getTextWidth(cashGivenText); // Get the width of the text
      const cashGivenX = pageWidth - cashGivenTextWidth - 4.5; // Align to the right
      doc.text(cashGivenText, cashGivenX, lastProductY + 15);

      // Change Due
      const changeDue = paymentDetails.cashGiven - transaction.net;
      const changeDueText = `Rs.${changeDue.toFixed(2)}`;
      const changeDueTextWidth = doc.getTextWidth(changeDueText);
      const changeDueX = pageWidth - changeDueTextWidth - 4.5;
      doc.text(changeDueText, changeDueX, lastProductY + 19);
    } else if (paymentDetails.paymentMethod === "Card") {
      doc.setFontSize(5); // Set the font size for the "Card Details" text
      const cardDetailsText = `Card Details: ${paymentDetails.cardDetails}`;
      const cardDetailsTextWidth = doc.getTextWidth(cardDetailsText);
      const cardDetailsX = (114.6 - cardDetailsTextWidth) / 2; // Center the text
      doc.text(cardDetailsText, cardDetailsX, 54.9);
    } else if (paymentDetails.paymentMethod === "Bank Transfer") {
      doc.setFontSize(5); // Set the font size for the "Card Details" text
      const bankTransferText = `Ref. Number: ${paymentDetails.bankTransferNumber}`;
      const bankTransferTextWidth = doc.getTextWidth(bankTransferText);
      const bankTransferX = (114.6 - bankTransferTextWidth) / 2; // Align the text to the right
      doc.text(bankTransferText, bankTransferX, 54.9);
    } else if (paymentDetails.paymentMethod === "Cheque") {
      doc.setFontSize(5); // Set the font size for the "Cheque Number" text
      const chequeText = `Cheque Number: ${paymentDetails.chequeNumber}`;
      const chequeTextWidth = doc.getTextWidth(chequeText);
      const chequeX = (114.6 - chequeTextWidth) / 2; // Align the text to the right
      doc.text(chequeText, chequeX, 54.9);
      doc.setFontSize(10); // Reset the font size to its original value (adjust as needed)
    } else if (paymentDetails.paymentMethod === "Credit") {
      const creditAmountText = `Rs.${paymentDetails.creditAmount}`;
      const creditAmountTextWidth = doc.getTextWidth(creditAmountText);
      const creditAmountX = pageWidth - creditAmountTextWidth - 4.5; // Align the text to the right
      doc.text(creditAmountText, creditAmountX, lastProductY + 15);
      if (paymentDetails.creditBalance > 0) {
        const remainingBalanceText = ` Rs.${paymentDetails.creditBalance}`;
        const remainingBalanceTextWidth =
          doc.getTextWidth(remainingBalanceText);
        const remainingBalanceX = pageWidth - remainingBalanceTextWidth - 4.5; // Align the text to the right
        doc.text(remainingBalanceText, remainingBalanceX, lastProductY + 19);
      }
      // else {
      //   const fullPaymentText = `Full payment received. No outstanding balance.`;
      //   const fullPaymentTextWidth = doc.getTextWidth(fullPaymentText);
      //   const fullPaymentX = pageWidth - fullPaymentTextWidth; // Align the text to the right
      //   doc.text(fullPaymentText, fullPaymentX, lastProductY + 25);
      // }
    }

    if (paymentDetails.paymentMethod === "Card and Cash") {
      // Cash given
      const cashGivenText = `Rs.${paymentDetails.cashGiven}`;
      const cashGivenTextWidth = doc.getTextWidth(cashGivenText);
      const cashGivenX = pageWidth - cashGivenTextWidth - 4.5;
      doc.text(cashGivenText, cashGivenX, lastProductY + 15);

      doc.text(`Cash Given: Rs. `, 4.5, lastProductY + 15);

      // Change Due
      doc.setFontSize(6);
      const changeDue = paymentDetails.cashGiven - transaction.net;
      const changeDueText = `Change due Rs. ${changeDue.toFixed(
        2
      )}  balance payid by card : ${paymentDetails.cardDetails}`;
      const changeDueTextWidth = doc.getTextWidth(changeDueText);
      doc.text(changeDueText, 4.5, lastProductY + 19);

      // Card details
      doc.setFontSize(5); // Set the font size for the "Card Details" text
      const cardDetailsText = `Card Details: ${paymentDetails.cardDetails}`;
      const cardDetailsTextWidth = doc.getTextWidth(cardDetailsText);
      const cardDetailsX = (114.6 - cardDetailsTextWidth) / 2; // Center the text
      doc.text(cardDetailsText, cardDetailsX, 54.9);
    }

    // Add the footer image
    const footerImg =
      "iVBORw0KGgoAAAANSUhEUgAAA4QAAADICAIAAAA/XrjmAAAACXBIWXMAAC4jAAAuIwF4pT92AAAw22lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDIgNzkuYTZhNjM5NiwgMjAyNC8wMy8xMi0wNzo0ODoyMyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6c3RNZnM9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9NYW5pZmVzdEl0ZW0jIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczppbGx1c3RyYXRvcj0iaHR0cDovL25zLmFkb2JlLmNvbS9pbGx1c3RyYXRvci8xLjAvIiB4bWxuczp4bXBUUGc9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC90L3BnLyIgeG1sbnM6c3REaW09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9EaW1lbnNpb25zIyIgeG1sbnM6c3RGbnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9Gb250IyIgeG1sbnM6eG1wRz0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL2cvIiB4bWxuczpwZGY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGRmLzEuMy8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDktMTBUMjM6MDY6MTcrMDU6MzAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTA5LTEwVDIzOjA2OjE3KzA1OjMwIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0wOS0xMFQxMjo1NToyMSswNjozMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBJbGx1c3RyYXRvciAyNy43IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3NTNhNTAwYy00MWE1LWI5NDgtOWI5YS1iYmMwMTQyNGRlNjIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTg3Y2I2ZWYtMmY3ZS0xZjQwLWFiN2EtZjBkMzRlMjc3NjNmIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InV1aWQ6NUQyMDg5MjQ5M0JGREIxMTkxNEE4NTkwRDMxNTA4QzgiIHhtcE1NOlJlbmRpdGlvbkNsYXNzPSJwcm9vZjpwZGYiIGlsbHVzdHJhdG9yOlN0YXJ0dXBQcm9maWxlPSJQcmludCIgaWxsdXN0cmF0b3I6Q3JlYXRvclN1YlRvb2w9IkFkb2JlIElsbHVzdHJhdG9yIiB4bXBUUGc6SGFzVmlzaWJsZU92ZXJwcmludD0iRmFsc2UiIHhtcFRQZzpIYXNWaXNpYmxlVHJhbnNwYXJlbmN5PSJGYWxzZSIgeG1wVFBnOk5QYWdlcz0iMSIgcGRmOlByb2R1Y2VyPSJBZG9iZSBQREYgbGlicmFyeSAxNy4wMCIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyI+IDxkYzp0aXRsZT4gPHJkZjpBbHQ+IDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+aWRzIHBvcyBiaWxsIEFpPC9yZGY6bGk+IDwvcmRmOkFsdD4gPC9kYzp0aXRsZT4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InV1aWQ6YWMxN2VhYTAtMTAwYi00NjFhLWIzNzYtNjlkNzVjZjEyY2NlIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjk4N2NiNmVmLTJmN2UtMWY0MC1hYjdhLWYwZDM0ZTI3NzYzZiIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ1dWlkOjVEMjA4OTI0OTNCRkRCMTE5MTRBODU5MEQzMTUwOEM4IiBzdFJlZjpyZW5kaXRpb25DbGFzcz0icHJvb2Y6cGRmIi8+IDx4bXBNTTpNYW5pZmVzdD4gPHJkZjpTZXE+IDxyZGY6bGk+IDxyZGY6RGVzY3JpcHRpb24gc3RNZnM6bGlua0Zvcm09IkVtYmVkQnlSZWZlcmVuY2UiPiA8c3RNZnM6cmVmZXJlbmNlIHN0UmVmOmZpbGVQYXRoPSJEOlxzYWRhcnV3YW5caW1lZWdccG9zIGJpbGwgaWRzLnBkZiIgc3RSZWY6ZG9jdW1lbnRJRD0iMCIgc3RSZWY6aW5zdGFuY2VJRD0iMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6bGk+IDxyZGY6bGk+IDxyZGY6RGVzY3JpcHRpb24gc3RNZnM6bGlua0Zvcm09IkVtYmVkQnlSZWZlcmVuY2UiPiA8c3RNZnM6cmVmZXJlbmNlIHN0UmVmOmZpbGVQYXRoPSJEOlxzYWRhcnV3YW5caW1lZWdccG9zIGJpbGwgaWRzLnBkZiIgc3RSZWY6ZG9jdW1lbnRJRD0iMCIgc3RSZWY6aW5zdGFuY2VJRD0iMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6bGk+IDwvcmRmOlNlcT4gPC94bXBNTTpNYW5pZmVzdD4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6OTg3Y2I2ZWYtMmY3ZS0xZjQwLWFiN2EtZjBkMzRlMjc3NjNmIiBzdEV2dDp3aGVuPSIyMDI0LTA5LTEwVDEyOjU1OjE4KzA1OjMwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBJbGx1c3RyYXRvciAyNy43IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3BkZiB0byBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NzUzYTUwMGMtNDFhNS1iOTQ4LTliOWEtYmJjMDE0MjRkZTYyIiBzdEV2dDp3aGVuPSIyMDI0LTA5LTEwVDIzOjA2OjE3KzA1OjMwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjUuMTEgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wVFBnOk1heFBhZ2VTaXplIHN0RGltOnc9IjMuMDAwMDAwIiBzdERpbTpoPSI4LjAwMDAwMCIgc3REaW06dW5pdD0iSW5jaGVzIi8+IDx4bXBUUGc6Rm9udHM+IDxyZGY6QmFnPiA8cmRmOmxpIHN0Rm50OmZvbnROYW1lPSJXQkFBQUErQmFybG93U2VtaUNvbmRlbnNlZC1Cb2xkIiBzdEZudDpmb250RmFtaWx5PSJXQkFBQUErQmFybG93U2VtaUNvbmRlbnNlZCBCb2xkIiBzdEZudDpmb250RmFjZT0iQm9sZCIgc3RGbnQ6Zm9udFR5cGU9IlVua25vd24iIHN0Rm50OnZlcnNpb25TdHJpbmc9IlZlcnNpb24gMi4xMDY7UFMgMi4wMDA7aG90Y29udiAxLjAuNzA7bWFrZW90Zi5saWIyLjUuNTgzMjkiIHN0Rm50OmNvbXBvc2l0ZT0iRmFsc2UiIHN0Rm50OmZvbnRGaWxlTmFtZT0iTXlyaWFkUHJvLVJlZ3VsYXIub3RmIi8+IDxyZGY6bGkgc3RGbnQ6Zm9udE5hbWU9IlVCQUFBQStCYXRhbmdhcy1Cb2xkIiBzdEZudDpmb250RmFtaWx5PSJVQkFBQUErQmF0YW5nYXMgQm9sZCIgc3RGbnQ6Zm9udEZhY2U9IkJvbGQiIHN0Rm50OmZvbnRUeXBlPSJVbmtub3duIiBzdEZudDp2ZXJzaW9uU3RyaW5nPSJWZXJzaW9uIDIuMTA2O1BTIDIuMDAwO2hvdGNvbnYgMS4wLjcwO21ha2VvdGYubGliMi41LjU4MzI5IiBzdEZudDpjb21wb3NpdGU9IkZhbHNlIiBzdEZudDpmb250RmlsZU5hbWU9Ik15cmlhZFByby1SZWd1bGFyLm90ZiIvPiA8cmRmOmxpIHN0Rm50OmZvbnROYW1lPSJaQkFBQUErSGFuZ3lhYm9seS1SZWd1bGFyIiBzdEZudDpmb250RmFtaWx5PSJaQkFBQUErSGFuZ3lhYm9seSBSZWd1bGFyIiBzdEZudDpmb250RmFjZT0iUmVndWxhciIgc3RGbnQ6Zm9udFR5cGU9IlVua25vd24iIHN0Rm50OnZlcnNpb25TdHJpbmc9IlZlcnNpb24gMi4xMDY7UFMgMi4wMDA7aG90Y29udiAxLjAuNzA7bWFrZW90Zi5saWIyLjUuNTgzMjkiIHN0Rm50OmNvbXBvc2l0ZT0iRmFsc2UiIHN0Rm50OmZvbnRGaWxlTmFtZT0iTXlyaWFkUHJvLVJlZ3VsYXIub3RmIi8+IDxyZGY6bGkgc3RGbnQ6Zm9udE5hbWU9IlZCQUFBQStCYXJsb3dTZW1pQ29uZGVuc2VkLVJlZ3VsYXIiIHN0Rm50OmZvbnRGYW1pbHk9IlZCQUFBQStCYXJsb3dTZW1pQ29uZGVuc2VkIFJlZ3VsYXIiIHN0Rm50OmZvbnRGYWNlPSJSZWd1bGFyIiBzdEZudDpmb250VHlwZT0iVW5rbm93biIgc3RGbnQ6dmVyc2lvblN0cmluZz0iVmVyc2lvbiAyLjEwNjtQUyAyLjAwMDtob3Rjb252IDEuMC43MDttYWtlb3RmLmxpYjIuNS41ODMyOSIgc3RGbnQ6Y29tcG9zaXRlPSJGYWxzZSIgc3RGbnQ6Zm9udEZpbGVOYW1lPSJNeXJpYWRQcm8tUmVndWxhci5vdGYiLz4gPC9yZGY6QmFnPiA8L3htcFRQZzpGb250cz4gPHhtcFRQZzpQbGF0ZU5hbWVzPiA8cmRmOlNlcT4gPHJkZjpsaT5DeWFuPC9yZGY6bGk+IDxyZGY6bGk+TWFnZW50YTwvcmRmOmxpPiA8cmRmOmxpPlllbGxvdzwvcmRmOmxpPiA8cmRmOmxpPkJsYWNrPC9yZGY6bGk+IDwvcmRmOlNlcT4gPC94bXBUUGc6UGxhdGVOYW1lcz4gPHhtcFRQZzpTd2F0Y2hHcm91cHM+IDxyZGY6U2VxPiA8cmRmOmxpPiA8cmRmOkRlc2NyaXB0aW9uIHhtcEc6Z3JvdXBOYW1lPSJEZWZhdWx0IFN3YXRjaCBHcm91cCIgeG1wRzpncm91cFR5cGU9IjAiPiA8eG1wRzpDb2xvcmFudHM+IDxyZGY6U2VxPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iV2hpdGUiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyNTUiIHhtcEc6Z3JlZW49IjI1NSIgeG1wRzpibHVlPSIyNTUiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkJsYWNrIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMzUiIHhtcEc6Z3JlZW49IjMxIiB4bXBHOmJsdWU9IjMyIi8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDTVlLIFJlZCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjIzNyIgeG1wRzpncmVlbj0iMjgiIHhtcEc6Ymx1ZT0iMzYiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkNNWUsgWWVsbG93IiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjU1IiB4bXBHOmdyZWVuPSIyNDIiIHhtcEc6Ymx1ZT0iMCIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQ01ZSyBHcmVlbiIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjAiIHhtcEc6Z3JlZW49IjE2NiIgeG1wRzpibHVlPSI4MSIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQ01ZSyBDeWFuIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMCIgeG1wRzpncmVlbj0iMTc0IiB4bXBHOmJsdWU9IjIzOSIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQ01ZSyBCbHVlIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iNDYiIHhtcEc6Z3JlZW49IjQ5IiB4bXBHOmJsdWU9IjE0NiIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQ01ZSyBNYWdlbnRhIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjM2IiB4bXBHOmdyZWVuPSIwIiB4bXBHOmJsdWU9IjE0MCIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0xNSBNPTEwMCBZPTkwIEs9MTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIxOTAiIHhtcEc6Z3JlZW49IjMwIiB4bXBHOmJsdWU9IjQ1Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT05MCBZPTg1IEs9MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjIzOSIgeG1wRzpncmVlbj0iNjUiIHhtcEc6Ymx1ZT0iNTQiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTgwIFk9OTUgSz0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjQxIiB4bXBHOmdyZWVuPSI5MCIgeG1wRzpibHVlPSI0MSIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0wIE09NTAgWT0xMDAgSz0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjQ3IiB4bXBHOmdyZWVuPSIxNDgiIHhtcEc6Ymx1ZT0iMjkiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTM1IFk9ODUgSz0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjUxIiB4bXBHOmdyZWVuPSIxNzYiIHhtcEc6Ymx1ZT0iNjQiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9NSBNPTAgWT05MCBLPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyNDkiIHhtcEc6Z3JlZW49IjIzNyIgeG1wRzpibHVlPSI1MCIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0yMCBNPTAgWT0xMDAgSz0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjE1IiB4bXBHOmdyZWVuPSIyMjMiIHhtcEc6Ymx1ZT0iMzUiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9NTAgTT0wIFk9MTAwIEs9MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjE0MSIgeG1wRzpncmVlbj0iMTk4IiB4bXBHOmJsdWU9IjYzIi8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTc1IE09MCBZPTEwMCBLPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSI1NyIgeG1wRzpncmVlbj0iMTgxIiB4bXBHOmJsdWU9Ijc0Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTg1IE09MTAgWT0xMDAgSz0xMCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjAiIHhtcEc6Z3JlZW49IjE0OCIgeG1wRzpibHVlPSI2OCIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz05MCBNPTMwIFk9OTUgSz0zMCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjAiIHhtcEc6Z3JlZW49IjEwNCIgeG1wRzpibHVlPSI1NiIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz03NSBNPTAgWT03NSBLPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSI0MyIgeG1wRzpncmVlbj0iMTgyIiB4bXBHOmJsdWU9IjExNSIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz04MCBNPTEwIFk9NDUgSz0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMCIgeG1wRzpncmVlbj0iMTY3IiB4bXBHOmJsdWU9IjE1NyIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz03MCBNPTE1IFk9MCBLPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIzOSIgeG1wRzpncmVlbj0iMTcwIiB4bXBHOmJsdWU9IjIyNSIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz04NSBNPTUwIFk9MCBLPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyOCIgeG1wRzpncmVlbj0iMTE3IiB4bXBHOmJsdWU9IjE4OCIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0xMDAgTT05NSBZPTUgSz0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iNDMiIHhtcEc6Z3JlZW49IjU3IiB4bXBHOmJsdWU9IjE0NCIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0xMDAgTT0xMDAgWT0yNSBLPTI1IiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMzgiIHhtcEc6Z3JlZW49IjM0IiB4bXBHOmJsdWU9Ijk4Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTc1IE09MTAwIFk9MCBLPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIxMDIiIHhtcEc6Z3JlZW49IjQ1IiB4bXBHOmJsdWU9IjE0NSIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz01MCBNPTEwMCBZPTAgSz0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTQ2IiB4bXBHOmdyZWVuPSIzOSIgeG1wRzpibHVlPSIxNDMiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MzUgTT0xMDAgWT0zNSBLPTEwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTU4IiB4bXBHOmdyZWVuPSIzMSIgeG1wRzpibHVlPSI5OSIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0xMCBNPTEwMCBZPTUwIEs9MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjIxOCIgeG1wRzpncmVlbj0iMjgiIHhtcEc6Ymx1ZT0iOTIiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTk1IFk9MjAgSz0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMjM4IiB4bXBHOmdyZWVuPSI0MiIgeG1wRzpibHVlPSIxMjMiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MjUgTT0yNSBZPTQwIEs9MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjE5NCIgeG1wRzpncmVlbj0iMTgxIiB4bXBHOmJsdWU9IjE1NSIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz00MCBNPTQ1IFk9NTAgSz01IiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTU1IiB4bXBHOmdyZWVuPSIxMzMiIHhtcEc6Ymx1ZT0iMTIxIi8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTUwIE09NTAgWT02MCBLPTI1IiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTE0IiB4bXBHOmdyZWVuPSIxMDIiIHhtcEc6Ymx1ZT0iODgiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9NTUgTT02MCBZPTY1IEs9NDAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSI4OSIgeG1wRzpncmVlbj0iNzQiIHhtcEc6Ymx1ZT0iNjYiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MjUgTT00MCBZPTY1IEs9MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjE5NiIgeG1wRzpncmVlbj0iMTU0IiB4bXBHOmJsdWU9IjEwOCIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0zMCBNPTUwIFk9NzUgSz0xMCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjE2OSIgeG1wRzpncmVlbj0iMTI0IiB4bXBHOmJsdWU9IjgwIi8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTM1IE09NjAgWT04MCBLPTI1IiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMTM5IiB4bXBHOmdyZWVuPSI5NCIgeG1wRzpibHVlPSI2MCIvPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz00MCBNPTY1IFk9OTAgSz0zNSIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjExNyIgeG1wRzpncmVlbj0iNzYiIHhtcEc6Ymx1ZT0iNDEiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9NDAgTT03MCBZPTEwMCBLPTUwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iOTYiIHhtcEc6Z3JlZW49IjU3IiB4bXBHOmJsdWU9IjE5Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTUwIE09NzAgWT04MCBLPTcwIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iNjAiIHhtcEc6Z3JlZW49IjM2IiB4bXBHOmJsdWU9IjIxIi8+IDwvcmRmOlNlcT4gPC94bXBHOkNvbG9yYW50cz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOmxpPiA8cmRmOmxpPiA8cmRmOkRlc2NyaXB0aW9uIHhtcEc6Z3JvdXBOYW1lPSJHcmF5cyIgeG1wRzpncm91cFR5cGU9IjEiPiA8eG1wRzpDb2xvcmFudHM+IDxyZGY6U2VxPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0wIE09MCBZPTAgSz0xMDAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIzNSIgeG1wRzpncmVlbj0iMzEiIHhtcEc6Ymx1ZT0iMzIiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTAgWT0wIEs9OTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSI2NSIgeG1wRzpncmVlbj0iNjQiIHhtcEc6Ymx1ZT0iNjYiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTAgWT0wIEs9ODAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSI4OCIgeG1wRzpncmVlbj0iODkiIHhtcEc6Ymx1ZT0iOTEiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTAgWT0wIEs9NzAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIxMDkiIHhtcEc6Z3JlZW49IjExMCIgeG1wRzpibHVlPSIxMTMiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTAgWT0wIEs9NjAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIxMjgiIHhtcEc6Z3JlZW49IjEzMCIgeG1wRzpibHVlPSIxMzMiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTAgWT0wIEs9NTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIxNDciIHhtcEc6Z3JlZW49IjE0OSIgeG1wRzpibHVlPSIxNTIiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTAgWT0wIEs9NDAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIxNjciIHhtcEc6Z3JlZW49IjE2OSIgeG1wRzpibHVlPSIxNzIiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTAgWT0wIEs9MzAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIxODgiIHhtcEc6Z3JlZW49IjE5MCIgeG1wRzpibHVlPSIxOTIiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTAgWT0wIEs9MjAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyMDkiIHhtcEc6Z3JlZW49IjIxMSIgeG1wRzpibHVlPSIyMTIiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTAgWT0wIEs9MTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIyMzAiIHhtcEc6Z3JlZW49IjIzMSIgeG1wRzpibHVlPSIyMzIiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTAgWT0wIEs9NSIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjI0MSIgeG1wRzpncmVlbj0iMjQyIiB4bXBHOmJsdWU9IjI0MiIvPiA8L3JkZjpTZXE+IDwveG1wRzpDb2xvcmFudHM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpsaT4gPHJkZjpsaT4gPHJkZjpEZXNjcmlwdGlvbiB4bXBHOmdyb3VwTmFtZT0iQnJpZ2h0cyIgeG1wRzpncm91cFR5cGU9IjEiPiA8eG1wRzpDb2xvcmFudHM+IDxyZGY6U2VxPiA8cmRmOmxpIHhtcEc6c3dhdGNoTmFtZT0iQz0wIE09MTAwIFk9MTAwIEs9MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjIzNyIgeG1wRzpncmVlbj0iMjgiIHhtcEc6Ymx1ZT0iMzYiLz4gPHJkZjpsaSB4bXBHOnN3YXRjaE5hbWU9IkM9MCBNPTc1IFk9MTAwIEs9MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjI0MiIgeG1wRzpncmVlbj0iMTAxIiB4bXBHOmJsdWU9IjM0Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTAgTT0xMCBZPTk1IEs9MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjI1NSIgeG1wRzpncmVlbj0iMjIyIiB4bXBHOmJsdWU9IjIzIi8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTg1IE09MTAgWT0xMDAgSz0wIiB4bXBHOm1vZGU9IlJHQiIgeG1wRzp0eXBlPSJQUk9DRVNTIiB4bXBHOnJlZD0iMCIgeG1wRzpncmVlbj0iMTYxIiB4bXBHOmJsdWU9Ijc1Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTEwMCBNPTkwIFk9MCBLPTAiIHhtcEc6bW9kZT0iUkdCIiB4bXBHOnR5cGU9IlBST0NFU1MiIHhtcEc6cmVkPSIzMyIgeG1wRzpncmVlbj0iNjQiIHhtcEc6Ymx1ZT0iMTU0Ii8+IDxyZGY6bGkgeG1wRzpzd2F0Y2hOYW1lPSJDPTYwIE09OTAgWT0wIEs9MCIgeG1wRzptb2RlPSJSR0IiIHhtcEc6dHlwZT0iUFJPQ0VTUyIgeG1wRzpyZWQ9IjEyNyIgeG1wRzpncmVlbj0iNjMiIHhtcEc6Ymx1ZT0iMTUyIi8+IDwvcmRmOlNlcT4gPC94bXBHOkNvbG9yYW50cz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOmxpPiA8L3JkZjpTZXE+IDwveG1wVFBnOlN3YXRjaEdyb3Vwcz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6q3zK1AAA0lUlEQVR4nO3dfWwTZ54H8CelvDZLMllS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";
    const pageHeight = doc.internal.pageSize.getHeight(); // Get the page height

    const footerImageWidth = 76.2; // Adjust according to the image's width
    const footerImageHeight = 16.9; // Adjust according to the image's height

    // Add the image at the bottom of the page
    doc.addImage(
      footerImg,
      "PNG", // Image format, can be 'PNG', 'JPEG', etc.
      0, // X position (left-aligned)
      lastProductY + 22.9, // Y position (bottom of the page)
      footerImageWidth, // Image width
      footerImageHeight // Image height
    );

    return doc;
  };

  const handleAddProductSubmit = (values) => {
    const newProduct = {
      id: new Date().getTime(),
      name: values.name,
      price: Number(values.price),
      qty: Number(values.qty),
      discount: Number(values.discount) || 0, // Include discount
    };

    setTransaction((prevTransaction) => {
      const updatedProducts = [...prevTransaction.products, newProduct];
      const total = updatedProducts.reduce(
        (sum, p) => sum + p.qty * (p.price - p.discount), // Subtract discount from price
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
    if (paymentDetailsState) {
      const doc = generatePDF(paymentDetailsState); // Use the saved payment details
      doc.save(`receipt_${invoiceNumber}.pdf`);

      // Immediately refresh the page
      window.location.reload();
    } else {
      alert(
        "Payment details are not available. Please complete the payment first."
      );
    }
  };

  const printReceipt = () => {
    if (paymentDetailsState) {
      const doc = generatePDF(paymentDetailsState); // Use the saved payment details
      const pdfBlob = doc.output("blob");
      const pdfURL = URL.createObjectURL(pdfBlob);

      const printWindow = window.open(pdfURL, "_blank");
      printWindow.onload = () => {
        printWindow.print();
      };
      window.location.reload();
    } else {
      alert(
        "Payment details are not available. Please complete the payment first."
      );
    }
  };

  const shareReceipt = () => {
    if (!selectedCustomer) return;

    // Generate the PDF content using the paymentDetailsState
    const pdfDoc = generatePDF(paymentDetailsState);
    const pdfBlob = pdfDoc.output("blob"); // Generate the PDF as a Blob
    const pdfUrl = URL.createObjectURL(pdfBlob); // Create an object URL from the Blob

    // Prepare the text and sharing content
    const formattedDate = new Date().toLocaleDateString();
    const formattedTime = new Date().toLocaleTimeString();

    let textMessage = `*IDS Printing House*\nTransaction Receipt\nInvoice Number: ${invoiceNumber}\nDate: ${formattedDate}\nTime: ${formattedTime}\n\nCustomer:\nName: '''${
      selectedCustomer.name
    } '''${selectedCustomer.surname}\nContact: ${
      selectedCustomer.phone
    }\n\nProducts:\n${transaction.products
      .map(
        (product) =>
          `${product.name} - ${product.qty} x Rs.${product.price.toFixed(
            2
          )} = Rs.${(product.qty * product.price).toFixed(2)}`
      )
      .join("\n")}\n\n*Total: Rs.${transaction.total.toFixed(
      2
    )}*\nDiscount: Rs.${transaction.discount.toFixed(
      2
    )}\nNet Amount: Rs.${transaction.net.toFixed(2)}\n\nPayment Method: ${
      paymentDetailsState.paymentMethod
    }`;

    // Handle different payment methods
    if (paymentDetailsState.paymentMethod === "Cash") {
      const changeDue = paymentDetailsState.cashGiven - transaction.net;
      textMessage += `\nCash Given: Rs.${
        paymentDetailsState.cashGiven
      }\nChange Due: Rs.${changeDue.toFixed(2)}`;
    } else if (paymentDetailsState.paymentMethod === "Card") {
      textMessage += `\nCard Details: ${paymentDetailsState.cardDetails}`;
    } else if (paymentDetailsState.paymentMethod === "Bank Transfer") {
      textMessage += `\nBank Transfer Number: ${paymentDetailsState.bankTransferNumber}`;
    } else if (paymentDetailsState.paymentMethod === "Cheque") {
      textMessage += `\nCheque Number: ${paymentDetailsState.chequeNumber}`;
    } else if (paymentDetailsState.paymentMethod === "Credit") {
      textMessage += `\nCredit Amount Paid: Rs.${paymentDetailsState.creditAmount}`;
      if (paymentDetailsState.creditBalance > 0) {
        textMessage += `\nRemaining Balance: Rs.${paymentDetailsState.creditBalance}`;
      } else {
        textMessage += `\nFull payment received. No outstanding balance.`;
      }
    }

    // Prepare WhatsApp sharing URL
    const whatsappURL = `https://wa.me/+94${
      selectedCustomer.phone
    }?text=${encodeURIComponent(textMessage)}`;

    // Prepare the email content with the PDF URL
    const emailSubject = `Receipt for ${selectedCustomer.name} ${selectedCustomer.surname}`;
    const emailBody = `${textMessage}\n\nHere is your receipt PDF: ${pdfUrl}`;
    const mailtoURL = `mailto:?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    // Open the sharing options
    window.open(whatsappURL, "_blank"); // Open WhatsApp
    window.open(mailtoURL, "_blank"); // Open Email
  };

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
                      <th>Discount (Rs)</th> {/* Changed from (%) to (Rs) */}
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
                        <td>
                          <input
                            type="number"
                            value={product.discount || 0}
                            min="0"
                            step="0.01"
                            onChange={(e) =>
                              updateProductDiscount(product.id, e.target.value)
                            }
                          />
                        </td>
                        <td>
                          Rs.{" "}
                          {(
                            Number(product.qty) *
                            (Number(product.price) - Number(product.discount))
                          ).toFixed(2)}{" "}
                          {/* Ensure all inputs are numbers */}
                        </td>
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
                  <AddProductModal
                    isOpen={isAddProductModalOpen}
                    onClose={() => setIsAddProductModalOpen(false)}
                    onSubmit={handleAddProductSubmit}
                  />
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
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          handlePaymentSubmit={handlePaymentSubmit}
        />
        {/* Use the ReceiptOptionsModal */}
        <ReceiptOptionsModal
          isOpen={isReceiptOptionsModalOpen}
          onClose={() => setIsReceiptOptionsModalOpen(false)}
          downloadReceipt={downloadReceipt}
          printReceipt={printReceipt}
          shareReceipt={shareReceipt}
        />
      </div>
    </div>
  );
};

export default Sales;
