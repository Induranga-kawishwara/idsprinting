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
  const formattedDate = new Date(sale.date).toLocaleDateString();
  const formattedTime = new Date(sale.date).toLocaleTimeString();

  // Add header image
  const headerImg = "";
  doc.addImage(headerImg, "PNG", 0, 0, 76.2, 65.53); // Adjust x, y, width, height as needed

  //doc.setFontSize(18);
  //doc.text("Transaction Receipt", 48.8, 21.2);
  doc.setFontSize(4.5);
  doc.text(`${sale.invoiceNumber}`, 21.2, 54.4);
  doc.text(`${formattedDate}   ${formattedTime}`, 21.2, 56.8);
  //doc.text(`Time: ${formattedTime}`, 14, 42);
  doc.setFontSize(4.5);
  //doc.text("Customer:", 21.2, 48.8);

  doc.text(`${sale.customerName}${sale.customerSurname}`, 21.2, 49.4);
  //doc.text(`Email: ${selectedCustomer.email}`, 14, 62);
  doc.text(`${sale.contactNumber}`, 21.2, 51.9);

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
      const remainingBalanceTextWidth = doc.getTextWidth(remainingBalanceText);
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
  const footerImg = "";
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
