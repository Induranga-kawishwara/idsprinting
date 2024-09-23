import PdfGenarator from "../../Reusable/PdfGenarator/PdfGenarator.js";

export const ShareReceipt = (
  selectedCustomer,
  paymentDetailsState,
  transaction,
  invoiceNumber
) => {
  if (!selectedCustomer) return;

  // Generate the PDF content using the paymentDetailsState
  const pdfDoc = PdfGenarator(
    paymentDetailsState,
    transaction,
    invoiceNumber,
    selectedCustomer
  );
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
        `${product.name} - ${product.qty} x Rs.${product.retailPrice.toFixed(
          2
        )} = Rs.${(product.qty * product.retailPrice).toFixed(2)}`
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

export const PrintReceipt = (
  selectedCustomer,
  paymentDetailsState,
  transaction,
  invoiceNumber
) => {
  if (paymentDetailsState) {
    const doc = PdfGenarator(
      paymentDetailsState,
      transaction,
      invoiceNumber,
      selectedCustomer
    ); // Use the saved payment details
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

export const DownloadReceipt = (
  selectedCustomer,
  paymentDetailsState,
  transaction,
  invoiceNumber
) => {
  if (paymentDetailsState) {
    const doc = PdfGenarator(
      paymentDetailsState,
      transaction,
      invoiceNumber,
      selectedCustomer
    ); // Use the saved payment details
    doc.save(`receipt_${invoiceNumber}.pdf`);

    // Immediately refresh the page
    window.location.reload();
  } else {
    alert(
      "Payment details are not available. Please complete the payment first."
    );
  }
};
