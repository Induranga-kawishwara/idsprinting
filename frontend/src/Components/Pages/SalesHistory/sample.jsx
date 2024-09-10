// Get current date and time
const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString();
const formattedTime = currentDate.toLocaleTimeString();

// Add header image
const headerImg = "";

doc.addImage(headerImg, "PNG", 0, 0, 76.2, 65.53); // Adjust x, y, width, height as needed

//doc.setFontSize(18);
//doc.text("Transaction Receipt", 48.8, 21.2);
doc.setFontSize(4.5);
doc.text(`${invoiceNumber}`, 21.2, 53.5);
doc.text(`${formattedDate}   ${formattedTime}`, 21.2, 55.8);
//doc.text(`Time: ${formattedTime}`, 14, 42);
doc.setFontSize(4.5);
//doc.text("Customer:", 21.2, 48.8);
if (selectedCustomer) {
  doc.text(`${selectedCustomer.name} ${selectedCustomer.surname}`, 21.2, 48.8);
  //doc.text(`Email: ${selectedCustomer.email}`, 14, 62);
  doc.text(`${selectedCustomer.phone}`, 21.2, 51.1);
}

//doc.text("Products:", 14, 80);
doc.setFontSize(5.5);
transaction.products.forEach((product, index) => {
  const y = 67 + index * 6; // Adjust y position for each product

  // Define x positions for the different parts of the text
  const productNameX = 4.8; // X position for product name
  const qtyX = 40; // X position for quantity
  const priceX = 22.8; // X position for price
  const totalX = 62.5; // X position for total price (qty * price)

  // Draw each part of the text at different x positions
  doc.text(product.name, productNameX, y); // Product Name
  doc.text(`${product.qty}`, qtyX, y); // Quantity
  doc.text(`Rs.${product.price.toFixed(2)}`, priceX, y); // Unit Price
  doc.text(`Rs.${(product.qty * product.price).toFixed(2)}`, totalX, y); // Total Price
  doc.line(4.5, 72 + index * 6, 71.8, 72 + index * 6);
  doc.text("Products", margin, yPosition);
  yPosition += 5;
  transaction.products.forEach((product, index) => {
    const productTotal = (
      product.qty *
      (product.price - product.discount)
    ).toFixed(2); // Total after applying discount
    doc.text(
      `${product.name} | Qty: ${
        product.qty
      } | Price: Rs. ${product.price.toFixed(2)} | Discount: Rs. ${
        product.discount
      } | Total: Rs. ${productTotal}`,
      margin,
      yPosition
    );
    yPosition += 10;
  });
});

doc.text(`Total: Rs.${transaction.total.toFixed(2)}`, 14, 120);
doc.text(`Discount: Rs.${transaction.discount.toFixed(2)}`, 14, 126);
doc.text(`Net: Rs.${transaction.net.toFixed(2)}`, 14, 132);

doc.text("Payment Details:", 14, 150);
doc.text(`Method: ${paymentDetails.paymentMethod}`, 14, 156); // Ensure this prints correctly

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
  doc.text(`Credit Amount Paid: Rs.${paymentDetails.creditAmount}`, 14, 162);

  // Show the credit balance if there's any remaining balance
  if (paymentDetails.creditBalance > 0) {
    doc.text(`Remaining Balance: Rs.${paymentDetails.creditBalance}`, 14, 168);
  } else {
    doc.text(`Full payment received. No outstanding balance.`, 14, 168);
  }
}

return doc;

const generatePDF = (paymentDetails) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [76.2, 297], // Custom size
  });

  let yPosition = 20; // Start y-position for content

  // Add header and customer details
  doc.setFontSize(10);
  doc.text(`Invoice Number: ${invoiceNumber}`, 10, yPosition);
  yPosition += 10;

  if (selectedCustomer) {
    doc.text(
      `Customer: ${selectedCustomer.name} ${selectedCustomer.surname}`,
      10,
      yPosition
    );
    yPosition += 10;
  }

  // Add Products section
  doc.text("Products:", 10, yPosition);
  yPosition += 5;

  transaction.products.forEach((product) => {
    const productTotal = (
      product.qty *
      (product.price - product.discount)
    ).toFixed(2); // Reflect discount in total
    doc.text(
      `${product.name} | Qty: ${
        product.qty
      } | Price: Rs. ${product.price.toFixed(
        2
      )} | Discount: Rs. ${product.discount.toFixed(
        2
      )} | Total: Rs. ${productTotal}`,
      10,
      yPosition
    );
    yPosition += 10;
  });

  // Add final total, discount, and net amount
  doc.text(`Subtotal: Rs. ${transaction.total.toFixed(2)}`, 10, yPosition);
  yPosition += 5;
  doc.text(`Discount: Rs. ${transaction.discount.toFixed(2)}`, 10, yPosition);
  yPosition += 5;
  doc.text(`Net Amount: Rs. ${transaction.net.toFixed(2)}`, 10, yPosition);

  // Add Payment Details
  if (paymentDetails.paymentMethod === "Cash") {
    doc.text(`Cash Given: Rs. ${paymentDetails.cashGiven}`, 10, yPosition + 10);
  }

  return doc;
};
