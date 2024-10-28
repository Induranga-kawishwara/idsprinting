import jsPDF from "jspdf";
import images from "../../../Assest/receiptImages.json";

const PdfGenarator = (
  paymentDetails,
  transaction,
  invoiceNumber,
  selectedCustomer
) => {
  // Calculate the position based on the number of products
  const lastProductY = 62 + transaction.products.length * 6; // Y position after the last product

  // Initialize PDF with custom width (3 inches) and larger height to accommodate content
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [76.2, lastProductY + 38], // Adjust the height to fit products
  });

  let yPosition = 20; // Initial Y-coordinate for content

  // Get current date and time
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString();

  // Add header image
  doc.addImage(images.headerImg, "PNG", 0, 0, 76.2, 65.53); // Adjust as needed

  // Invoice and date details
  doc.setFontSize(4.5);
  doc.text(`${invoiceNumber}`, 21.2, 54.4);
  doc.text(`${formattedDate}   ${formattedTime}`, 21.2, 56.8);

  // Customer details
  if (selectedCustomer) {
    const { name = "", surname = "", phone = "" } = selectedCustomer; // Avoid undefined errors
    doc.text(`${name} ${surname}`, 21.2, 49.4);
    doc.text(`${phone}`, 21.2, 51.9);
  }

  // Product list
  doc.setFontSize(6.5);
  transaction.products.forEach((product, index) => {
    const y = 67 + index * 6; // Adjust Y position for each product

    const productNameX = 4.4; // Product Name X-position
    const qtyX = 39.5; // Quantity X-position
    const priceX = 22; // Price X-position
    const discountX = 48; // Discount X-position
    const totalX = 71.6; // Total price X-position

    const { itemName = "", qty = 0, retailPrice = 0, discount = 0 } = product; // Avoid undefined errors

    // Add product details
    doc.text(itemName, productNameX, y); // Product Name
    doc.text(`${qty}`, qtyX, y); // Quantity
    doc.text(`Rs.${retailPrice.toFixed(2)}`, priceX, y); // Unit Price
    doc.text(`Rs.${discount.toFixed(2)}`, discountX, y); // Discount

    const total = qty * (retailPrice - discount);
    const totalText = `Rs.${total.toFixed(2)}`;
    const totalTextWidth = doc.getTextWidth(totalText); // Align total text to the right
    doc.text(totalText, totalX - totalTextWidth, y); // Total price
  });

  // Line after product list
  doc.line(4.5, lastProductY + 2, 71.8, lastProductY + 2);

  // Total amount
  doc.setFontSize(10);
  doc.text(`Total:`, 4.5, lastProductY + 7);
  const totalAmountText = `Rs. ${transaction.total.toFixed(2)}`;
  const totalAmountTextWidth = doc.getTextWidth(totalAmountText);
  doc.text(
    totalAmountText,
    75.9 - totalAmountTextWidth - 4.5,
    lastProductY + 7
  );

  // Discount amount
  doc.setFontSize(7);
  doc.text(`Discount: `, 4.5, lastProductY + 11);
  const discountText = `Rs. ${transaction.discount.toFixed(2)}`;
  const discountTextWidth = doc.getTextWidth(discountText);
  doc.text(discountText, 75.9 - discountTextWidth - 4.5, lastProductY + 11);

  // Payment method details
  const methodText = `${paymentDetails.paymentMethod}`;
  const methodTextWidth = doc.getTextWidth(methodText);
  doc.text(methodText, (114.6 - methodTextWidth) / 2, 52.6); // Centered text

  // Cash Given and Change Due (if Cash payment)
  if (paymentDetails.paymentMethod === "Cash") {
    doc.text(`Cash Given:.`, 4.5, lastProductY + 15);
    const cashGivenText = `Rs.${paymentDetails.onlyCashGiven}`;
    const cashGivenTextWidth = doc.getTextWidth(cashGivenText);
    doc.text(cashGivenText, 75.9 - cashGivenTextWidth - 4.5, lastProductY + 15);

    const changeDue = paymentDetails.onlyCashGiven - transaction.net;
    const changeDueText = `Rs.${changeDue.toFixed(2)}`;
    const changeDueTextWidth = doc.getTextWidth(changeDueText);
    doc.text(`Change Due:.`, 4.5, lastProductY + 19);
    doc.text(changeDueText, 75.9 - changeDueTextWidth - 4.5, lastProductY + 19);
  }

  // Footer image
  const footerImageWidth = 76.2;
  const footerImageHeight = 16.9;
  doc.addImage(
    images.footerImg,
    "PNG",
    0,
    lastProductY + 22.9,
    footerImageWidth,
    footerImageHeight
  );

  return doc;
};

export default PdfGenarator;
