const generateSoftCopyPDF = () => {
  if (!selectedCustomer) {
    alert("Please select a customer before generating a quotation.");
    return;
  }

  // Check if validity period and completion days are filled
  if (!validityPeriod || !completionDays) {
    alert("Please enter both the validity period and the date of completion.");
    return;
  }

  generatePDF("Soft Copy");
  saveQuotation(); // Save the quotation after generating the PDF
};

const generatePrintPDF = () => {
  if (!selectedCustomer) {
    alert("Please select a customer before generating a quotation.");
    return;
  }

  // Check if validity period and completion days are filled
  if (!validityPeriod || !completionDays) {
    alert("Please enter both the validity period and the date of completion.");
    return;
  }

  generatePDF("Print");
  saveQuotation(); // Save the quotation after printing the PDF
};

// Common function to generate PDF based on type
const generatePDF = (type) => {
  const doc = new jsPDF();

  // Base64 image strings for soft copy and print copy
  const softCopyLogo = "data:image/png;base64,..."; // Replace with actual Base64 string for soft copy
  const printCopyLogo = "data:image/png;base64,..."; // Replace with actual Base64 string for print copy

  // Choose image based on the copy type
  if (type === "Soft Copy") {
    doc.addImage(softCopyLogo, "PNG", 10, 10, 50, 50); // Soft Copy image
  } else if (type === "Print") {
    doc.addImage(printCopyLogo, "PNG", 10, 10, 50, 50); // Print image
  }

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString();

  const qtNumber = generateUniqueqtNumber();

  // Add other text content
  doc.setFontSize(18);
  doc.text(`Quotation Receipt (${type})`, 14, 70); // Position text after the image
  doc.setFontSize(12);
  doc.text(`Date: ${formattedDate}`, 14, 80);
  doc.text(`Time: ${formattedTime}`, 14, 86);
  doc.text(`Quotation Number: ${qtNumber}`, 14, 92);

  // Add customer details
  doc.text("Customer:", 14, 100);
  if (selectedCustomer) {
    doc.text(
      `Name: ${selectedCustomer.name} ${selectedCustomer.surname}`,
      14,
      106
    );
    doc.text(`Email: ${selectedCustomer.email}`, 14, 112);
    doc.text(`Phone: ${selectedCustomer.phone}`, 14, 118);
  }

  // Add product details
  doc.text("Products:", 14, 130);
  transaction.products.forEach((product, index) => {
    const y = 136 + index * 6;
    doc.text(
      `${product.name} - ${product.qty} x Rs.${product.price.toFixed(
        2
      )} = Rs.${(product.qty * product.price).toFixed(2)}`,
      14,
      y
    );
  });

  // Add total, validity period, and completion days
  doc.text(`Total: Rs.${transaction.total.toFixed(2)}`, 14, 170);
  doc.text(`Validity Period: ${validityPeriod} days`, 14, 180);
  doc.text(`Completion: within ${completionDays} working days`, 14, 186);

  if (type === "Soft Copy") {
    doc.save(`quotation_${qtNumber}.pdf`);
  } else if (type === "Print") {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  }
};
