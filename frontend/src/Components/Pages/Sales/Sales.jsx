import React, { useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Sales.scss";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory
import CustomerFormModal from "../Customer/CustomerFormModal"; // Adjust the import path
import "../All.scss";
import AddProductModal from "./AddProductModal"; // Import your new component
import ReceiptOptionsModal from "./ReceiptOptionsModal"; // Import the new component
import PaymentModal from "./PaymentModal"; // Import the new component
import images from "../../../Assest/receiptImages.json";

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
  // Add more customers if needed
];

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
      if (product.stoke > 0) {
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
      }
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
    doc.addImage(images.headerImg, "PNG", 0, 0, 76.2, 65.53); // Adjust x, y, width, height as needed

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

    const pageHeight = doc.internal.pageSize.getHeight(); // Get the page height

    const footerImageWidth = 76.2; // Adjust according to the image's width
    const footerImageHeight = 16.9; // Adjust according to the image's height

    // Add the image at the bottom of the page
    doc.addImage(
      images.footerImg,
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
                  <span>Stoke. {product.stoke}</span>
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
