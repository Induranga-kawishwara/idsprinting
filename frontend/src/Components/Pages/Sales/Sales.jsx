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
  const invoiceNumber = `${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}`;

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

  const [paymentDetailsState, setPaymentDetailsState] = useState(null); // Add this to store payment details

  const handlePaymentSubmit = (values) => {
    console.log("Payment details:", values); // Log the values for debugging

    let creditBalance = 0; // Define the credit balance

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

    // Initialize PDF with custom width (3 inches) and larger height to accommodate content
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [76.2, 297], // 76.2 mm width (3 inches), 297 mm height (A4 size, for example)
    });
    const margin = 10; // Define a 10mm margin for left and right
    let yPosition = 20; // Initial Y-coordinate for content

    // Function to check if new page is needed and reset Y position
    const checkPageHeight = (y) => {
      if (y > 280) {
        // If content is nearing the bottom, create a new page
        doc.addPage();
        y = 20; // Reset y position for new page
      }
      return y;
    };

    // Get current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    // Add header image
    const headerImg =
      "data:image/png;base64,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2vBbOPHEEyXeReRIuAshhAjEiBEjnAEDBthWdhArhxxyiNOxY0fbU3q41T355JPO7NmzbY9IAk2aNHG22mor2yo9ZDJ64YUXjKtYPiTeRRxIuAshhMhLUNGezuqrr+4cffTRzrrrrmt7SgtpIAstpy+KDy4yG2+8cVmkhCSwedSoUWbWhloAQUG8U7W1UaNGtkeIuiHhLoQQIie4BNxxxx22FZ4NN9zQ6dGjhxHypebXX3913n33XVNWX5QnxElstNFGxtpeDrz55pvO888/7/z++++2Jxz/+9//nBNOOEHiXUSChLsQQois1FW0p7Pttts6Xbt2dVZccUXbUzq+/vpr45+M64MoDxZZZBHjz86y8MKlT3r38ccfO88884wzbdo021M4iPdjjz3Wady4se0RojAk3IUQQvgSpWj3WGyxxZzOnTubINalllrK9pYGUg1OnDjRmTBhQmLSDlYqzZo1M4GopT4n4NtvvzXxEFEXgFpyySVNtplVV13V9ggRHgl3IYQQCzBkyBDnvvvus63owR2C9JGkkSw1WN3HjRtnBJsoLssvv7zTvn17p379+randJAp5tlnn3Xef/992xM9iPdjjjnGWW211WyPEOGQcBdCCFGLuEV7Og0bNjTuM1tuuaXtKR34veP/jh+8iBcELBb25s2bOwsttJDtLQ2zZs0ymWJGjx5te+JliSWWMG4zEu+iECTchRBCzOPhhx92Hn30UdsqHgg4MtC0atXK9pQGbolknvnggw+cf/75x/aKqMB3nWOMHztuU6WGugQvv/yyEe/FBPF+1FFHGRchIcIg4S6EEMKAlR1reynZZJNNnMMOO6zkGUUQ7VRZ/eyzz4yYF3VnlVVWcdq2bVsW1XWZWRk+fHhJZ1cYuOA2I/EuwiDhLoQQoixEezo77LCDKeKED3QpIQUg+d+VPrJwll12WZOPHeFear788ksTePrjjz/antKCeD/yyCOdNdZYw/YIkRsJdyGEqHLIHEMGmXIDd4I999zT2XvvvY1PdCn57rvvnPfee8/5888/bY/Ix+KLL+6sv/76zpprrllyP/apU6c6Q4cOdT755BPbUz4g3o844gizn4TIh4S7EEJUMeUq2tPB6n7ggQc6O++8s+0pDf/9959JHan0kblBpLdo0cIU3kK8lxIGWrjEUESp3CHGo2XLlrYlhD8S7kIIUaUMGDDAGTFihG2VPxSv6datm0kfWEpIH0nKwMmTJ9se4bHyyiubOIVSuzjNmTPHeeWVV0zw6ezZs21v+SPxLvIh4S6EEFVI0kR7OggbMnKU2rXgl19+cd566y2lj0xB4SQs7E2bNrU9peOdd94xVvbffvvN9iQLiXeRCwl3IYSoMm644QZjiUw6HTp0MBZ4rLylglvopEmTjAX+77//tr3VwyKLLGJSO7Zu3do8LiXMgDzxxBPODz/8YHuSCz7v7FMhMpFwF0KIKqJSRHs6nTt3Nj7wpUwz+O+//xrfd4If8YWvBkhjSBElrO2lhJmPp59+2vn4449tT2Ug8S78kHAXQogqoX///s5rr71mW5UF4nHfffd1dt9995IW9iEYEleNKVOm2J7KA/914gzq169ve0oDRZOef/75ij2ngZoG6623nm0JIeEuhBBVQSWL9nQaNGhg8r937NjR9pQGhPu4ceNMHvhKgZScWNipclvq9I6jR492XnjhhaJXPC0FXbt2NfEDQoCEuxBCVDhXXHGF88Ybb9hWdbD66qubIL91113X9hQfbq+ffvqpqcCKK01SWXjhhZ1WrVoZX/ZSzmbA+PHjTfrS6dOn257qQOJdeEi4CyFEBVONoj2djTbayDn88MOdJk2a2J7iQ9Dqhx9+aKp2Ju2WS7XTtm3bljR+AL755htT8fTbb7+1PdWHxLsACXchhKhQ+vbt67z77ru2Vd106tTJuNCsuOKKtqf4kDaS9JEEU5Y7yy67rLPxxhsb4V5KKjXwtFAOOuggM5AS1YuEuxBCVCAS7QtCFc899tjD2WeffZz//e9/trf4fP3118blg0JO5QauMARDrr322iX1Y2ffPPfcc86YMWNsj/CQeK9uJNyFEKLCkGjPDdZkxM8uu+xie4rP3Llzje97uaSPRKS3aNHCWX/99U0QaqlIasXTYrP//vs7m266qW2JakLCXQghKogLL7zQFAMS+cENhAJOm222me0pPqSPxPpeSt9tClhtsskmJs1jKXn77beNlT2pFU+LjcR7dSLhLoQQFYJEe2FQXv6oo45y1lxzTdtTfH766ScjXIuZPpLc9wQ7Nm3a1PaUBmYdnnnmGefHH3+0PSIoe++9t6kgLKoHCXchhKgAzj//fON6IQpn8803Nxb4Ro0a2Z7iwu34iy++cD744APnn3/+sb3Rs8gii5jUjlTl5HGpQKiTKYZsO6JwJN6rCwl3IYRIMAi8Sy65RKI9QnbbbTfnwAMPdOrVq2d7igvHlOP52WefRZ4+slmzZqaIEtb2UkF2HXKxU6BKRIPEe/Ug4S6EEAkFgXfBBRcYVwMRLQhbss+QhaZURYdwm8F9BjeauoL/evv27Z369evbnuJDPvsRI0Y4o0aNsj0iSjp37lzyisEifiTchRAigSCCLrroIon2mEHokv99u+22sz3F57vvvnPee+89E8gaFjLEYGFv3rx5SdM7kinmpZdecmbNmmV7RBxIvFc+Eu5CCJEwEO34tOMPLYoDLibdu3cvWeVKUkZOmDDBLKSSzAcinaDbNm3alGzGAEhLSqaYGTNm2B4RNzvuuKNZRGUi4S6EEAmCwjS4x0i0l4Z1113XOfroo53VV1/d9hQXjj+ZgyZPnmx7FoQ0l1Q9JV99qSDg9KmnnnJ++OEH2yOKCVZ3rO+i8pBwF6KCoZgJgWDTp083Fi8WpqqXW245s6ywwgrG95XHpcwuIYKBaOvdu7czadIk2yNKxbbbbut07drVWXHFFW1Pcfnll1+ct956y/y+PRDqCHaEe6kgU8zQoUOdTz/91PaIUiHxXplIuAtRAXDzfuedd0wgG//JSMGNnSUo+PKSz3mjjTaat+AWUMrsE2I++Df36dNHor2MwAVl9913d/bbbz/nf//7n+0tHty+OR9wnyEH/dprr10yP3auQbjEcP0R5QOZZsg4IyqHihDu+HveeOONzhtvvFHL+pBEsJi0bdvWOeWUU5xlllnG9obj8ccfnzdFWYzDy80LcceNi4XHBETxH2suU8qrrbaa+U+FvlIGSFUKHFsKlrz55pvzhHocZdM5tuutt56x4u25557OTjvt5Cy++OL2WVEsEO3nnXee880339geUU5w3T7ggANMGslqg/vviy++6Lz22mtmhk+UHxLvlUVFCHcumI899phtVQbbb7+9SZsVljvuuMP4X5YriHmyGyDk8RWlzDYDFaxFEvS5YVD6yCOPOIMHDzYZGkpxk2zYsKEps33QQQc5W2yxhY5ZESAlIIGoEu3lDy4quM/w26gGlCkmOWy66abm2i2ST+KF+7Rp04wVtxKZOHGi06pVK9sKBpX/mHlIGg0aNDACnmWrrbZyttlmG1l2LfiK3nLLLc69997r/Pbbb7a39JCxAgF/xBFHlCxQr9JBtJ977rnO999/b3tEEsAQcdRRR5nfSCXCLB9uMUmf4a42JN4rg8QLdy4g7dq1s63KggsjrglhwOJDcFDSwd96l112MVPPO++8s3G5qTbIykD2kIcffjgWN5iowD3qyCOPdM466yynSZMmtlfUFUQRgagS7clls802MykkGzVqZHuSDUaEZ599VpliEgzGMQwuIrkkXrjj48vFsRLhArnrrrvaVjCYfWAWopLAX54MDt26dXP23XffkuYkLgYItr59+zoDBgxI1BQ0blBnnHGGc84555QkUK+S4Bw4++yznalTp9oekWQwQhx88MFOvXr1bE+ywBhE3NTnn39ue0SSoYIuLsYimUi4lzES7guCbzxT0Fh4S5nyLC5eeOEF59hjj0105hDcu2644QZnhx12sD0iDBLtlQmDWQIECfJOihsg5+KwYcOccePG2R5RKZAxjHgMkTwWtv+FSATffvutSYnXokULY4GnEEklMHv2bOekk04yrlFJT/dHCX6q9uE6oywT4SB9p0R7ZcLs2cCBA53jjjvOBHSWM3xWcrEz8yfRXpmMHz/eefDBB21LJAlZ3MsYWdzzs+iiizo9evQwvuCNGze2vcmC40XA0KhRo2xP5bDddtuZm0Mlzo5EDaIdN6Nq+v1WMwR04/9OqtVyYuTIkc7LL7+sTDFVgizvyUPCvYyRcA8OeZRPP/1042NdaP77UkDhFKbPP/vsM9tTeZBhY/jw4ea/8IffLHnaJdqrD9LiksK31JmZlCmmeqFWx2GHHWZbotyRq4yoCEibd+GFFzqtW7d2nn76adtb3pChAZeSShbt8MUXXxjLO0WixIIg1mVpr14+/vhjU3Dvuuuuc37++WfbWzxwbbvmmmucQYMGSbRXKVybSTcskoGEu6govvvuOxP8hb/4zJkzbW/58fXXX5vZlGpJ9UdsAsGqiHgxH3zZEe24yYjqBle5448/3rn//vuLcu0iU8xtt93m3HnnnUrvKIx4v+eee2xLlDMS7qIiuemmm0wxqvfee8/2lA/MDpCf/quvvrI91QFCYZ999nFmzJhhe6obRDuBqBLtwuPff/91nnzySeeYY44xwaFxwPUH6/rVV1+t9I6iFsz+3HXXXbYlyhUJd1GxfPDBB06HDh2MRamcIKsEF8hq5MMPPzT5rOfOnWt7qhNmWnr16iXXBOHLIoss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US1oGe94ebBP2bd+66cvyyyzjLkftm/f3t1ll13c3r17m3tyavBityTCkGjhHvTmmGthGzfffLM58fMRxftxE7vkkkvc2bNn261m54YbbvDdRpjl+eeft1ubz88//+y7rrdsvfXWgfaHH7zugAMOqLU9PzHEDzh9nTiW++67z75bZe/LIHz88cdu165ds96sgiw77rij+95779ktFod8+/eNN96waxYG4iZ9e4XsX47T4MGDAw+Gsi1cX+66667QAp594Lc9b2EfFsL777/vrr/++vO2ww03CNyMzz33XHfJJZes9TmCLE2bNnUfeOABu6X8RHkdwbASFwhov/dkYV/5MXnyZN/1wy4MuvyuXR7Dhw/3fZ23cH+sC99//7277bbbLrDdE0880a5R/PsB7LPPPr7rYeCZPn26XSsecmmJAQMG2LWC8+uvv/puK+qFczId9qnfekEX9nXnzp0LGqxUM1WfDpIp3BNOOMHZY489zHR23KQuYs7555/vpC6mzqRJk2xvefHqq68611xzjW2F4/LLLzdTwqKGUu/L1G/cbGeDDTZwHnzwQWfOnDn2mfC88MILxn3mvPPOM1P4SSd1g3TOPvts2yqMH3/80QQbMt2PK0hd4Fp0xBFHGD9oHpcSMm/wvQjWCwNuMDvvvLNz2WWX+bru5OPrr792Dj30UKdnz54VcY55DBw40D5akC5duthH8TBq1Chnp512Mud6apBpe+ezww47OKkBk20tyJNPPmkfhQd/cu51KWFme+bDcS4l2QKBcU1KDeJsS8QJ+/qZZ55xUgM7Z7vttnNeeeUV+4zIRdULd49nn33W3Hxz+WpFyRtvvGEGC6mRsu0pL4i8J1gqDAxKrrjiCtsSHqXal4iovffe2zn33HPrJNjTYTuIsr322sv5448/bG/y4IbB96gLY8aMMenjXnrpJdsTDePHj3c6dOhgrkmlgGPcrVs3448eBnxdO3fu7IwePdr2FE7//v2NgaMSQCxnG4Cvt956zjrrrGNb8cL1hGtBJsSJ5Mpmg5gKey7Ab7/9Zs6HL774wvbMB0MCA9RSwgBzmWWWsa3aKEC1+DC4YxCJoQmDk8iOhHsaWCYIlikWH330kQmSKUcIcjnqqKNCCb577rkn0WIuLkqxLwl82nXXXSMLZM2E4DJu9lENCIoNgagMjgoF6zpWTCzEccDsHwP7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0MH96aefTB+CyxMLLPmEO+cHfbfddpvtqeGXX34x4qVz5862x3X79u1r1u3Ro8e8cwTx1qVLF9N/yy23mD7wjutXX31le2r2I30sV199te2tYbvttjODD29/8LnZd/Sln6tjx4415xDCJ33f+QnDUaNGmb6NN9543v4B73d1yCGH2J7weMKd74/oZXsPPvigfXZBwn6fsOdCmGMD9LEcf/zx8973hx9+mDew5Nzy4Hyh76677rI9NSBk6ec9PcII97CfOSiFCncGEg0aNDDH9u2337a9rjtmzBhz3BDRvNbDO0b8/jmXRo8ebV7nnWthzz9PuCPAvfXZL4ceeqjpZx+m413703+7HMP111/fXMPSrzlCCJEkEi/cn3jiCdM+88wzTXvQoEGmDX7Cfdq0aUZ0Zd484cUXXzTrn3XWWbanBk+4Y63NZ+nCKo/1Hov+zJkzbW8NYYX70KFDfT/PX3/9Nc/aVBfhzn7gPZ555hmzMHuBEEEQcXPDIu7B4Ig+rNiZIMr4LNysPTzhjiBjn2fCDAbPX3fddbZnPsccc4x5jm14eEIgXVh7MODiufT3OeKII0zfm2++aXtq4PjxmXgun3DnRs93Tp8lAAYurJsunq644gqzbzItf4hz1iV9pwcpQel74IEHbI/r3nvvvaaP8yZ9XcQa58Wee+5pe1wzA7D//vu711xzje2Zz+GHH262ky6u/IQhx5vPO2LECNtTAzMVWJoRY4XiCXdSivK+LMy8ZCPs9wl7LoQ5NkAf50jm75drDc+li8Tx48ebvq5du9qeGs477zzTz3nuEUa4h/3MQfGEOxZzDAyZC9cans8U7l4aT799jgWb5zinPLxjtO2229qe2oQ9/zzh/tprr9meGn7++WfzG80crGHYOPLII21rPvfcc4/ZDml8hRAiiVSMcPes7htuuOE8q7ufcOfCT9/5559ve+aD2wPP7bHHHranBoTywIEDa7mN+MH7eu456VY5j7DCne1hIcKazRTzt99+a268TBezHZa6CHdvG5kLbgII+nTIJ89z6eLc47PPPjPPcbP08IT7YYcdZntqc8kll5jn08W5h2fpTrdiekIg020CPKtb+vHxZhQQApl4Lgj5hDtgsUeIprtHHH300WbdXK4fHrw/Mwhsx2PGjBlm0IRF14Nt4n6ENZ73885hLJW8l5+o9YPPz/rDhg2z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Huy0atXKOeSQQ5xhw4aZYolBwIJ95ZVXmgKMqYGCM23aNPtMMChc+NVXX9mWP1jGqT0SBjKurbPOOs7+++9vEjnMnDnTPpMbEkHceOONxvp+wAEHmMJqYQhyLkZJsd8vShLvKvPZZ5+ZapapUaU5SfnR77333k5q5GvXqGHMmDGBcnBTaMdvyocqp7wPFQrZflj4nFQ09YqkcGE4/PDDA10gUiNDc4Hr3bv3vOqf+aAiLJUucx1eqhT26dNngQqVTL3dddddztixY03u85VXXtnZbrvtTA70sNVlX375ZZOZhQsM03YdOnRwjjnmmKzTVOwnssCQO53PtdFGG5n1M6dFuciRiz3X9+OCyD4OA9/9qquuMhcfLsRBCLq/ghwT2HLLLZ3dd9/dtmpgPz722GOmOibTfFxYOVfJlJOPQs99bqwU93nhhRdM9UnOvU033dTs04YNG9q1slPo+3rflQs/50z79u2do446yqlfv75dIxhJO/eECAvXmZEjR9qWP+eee64p0OXHBRdc4Fx88cW2lR3cRhCaVBgPCtco3EVywe+zS5cutlUDr+G1+aCuRljxjrA8+eSTbSs777zzjrPJJpvYlj+4kHBd4hoZBVxT77//fmfHHXe0Pbnh+hzEnee5554zKZDzwYDj2GOPNZ8hCurVq+fceuutge+jQc/FqDjrrLMKGpCWBambT2JJCWl3ySWX5O7ppkSF26hRI/OY5eCDDzbTVx6pG+2853ItjzzyiH1Fbbp3726eZ/ooLKkf9rzps5QIMFOPPOazp34kdi1/UiLCTAumRITtCca777477zvlWlJi0r6ihtQFy23SpIl5LnVRqDWtyGdIDSDsmvk555xzzOuYEmVaMCW8TJsptZRIsmvNZ9CgQWZqj3XYR97jpk2bmv2QznvvvWeey7WkLoB27eBwTvHafv362Z7chNlfb7/99rznci0nnniifUXNdGjqYjrvudSgwJxDPGa/XnvttXbN7BRy7v/yyy9uSujOe47v6B2PBg0aBJqmLuR9TzvttHn9fFf2KY95f455UJJ47gkRlm233db3/EtfUsLdrr0gffr08X2N34IbRBhat27tu530JSXc7dq14Xfnt376wnUQl44wHHroob7bSl+47sydO9e+wp/p06e7m222me/r67Jwvbvrrrvsu+QGfeO3jcwlJdztK7Lzxx9/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fe/zZstm4PUHOQ88gv7mCCDlRkuGAi8fe1iScu4JUQmQXYZEDnERRLjnsqpHEZgqRFnhJpSbbrqJ+SN3xx13dFM/WNtbwy233GKe22677WxPbV544QXzfEqs2Z5w9OnTx7z+wQcftD3Z+fbbb92GDRu6KcHijhkzxvYWRkpcmPdt3bq17clN+/btzfrPPvus7anhxhtvNP0nnHCC7akhNQgy/auuuqr73Xff2d4aUgMA93//+5+7wgoruNOnT7e92UmJGrOtLl26uP/995/tdd2UKHMXW2wxNyVK3dmzZ9te102JHbN+s2bN3J9//tn2uua9UgLIPDds2DDbW0PXrl1NP98nnQceeMD0b7/99rYnOxtuuKE5NjNmzLA9wanL/vr999/dpZZayl1++eUXOH/TOfDAA817nH/++banhrlz57qHHnqoee6CCy6wvfkJcu5zXFZbbTV34YUXNuunw35ab731zDZeeukl25ufIO/Leco6a6yxRqBzLBtJOfeEqCspwWnOt1zLueeea9deEO9elmtp166duY75PectRx55pN3ifLhP+a2bvgS5h/7666/md+v3+vTl9ddft6+oTcuWLX3X9xa2/dtvv9m1/fnjjz98X5u5jB492r4iGJ07d/bdTvpyyimn2LVr4+mBfMtzzz1nX1GbzTff3Hf99OWyyy6za8dPkHORew/X8aBLXe4j5UxihTtiZ4sttjAHE/F16aWXutdff/08obPsssu6qVG4Xbs2xx9/vFnn1ltvtT3hCCPcjznmGLNukyZN3O7du2ddJkyYYF+RnbDC/eWXX3aXXHJJsxyZurD269fPiJlFF13UXXnlld1JkybZNedz6qmnmvdgsHH22We7AwYMcE8++WR3mWWWMf233367XTM3s2bNMseF13Tq1Mm9/PLL3dNOO82tX7++6bvvvvvsmvM55JBDzHPNmzd3e/Xq5Z555pluixYtTB8XuHQRBp988onboEEDIzAPOOAAt2/fvkZQ8f34vPkGSnx/tl0XkVXo/nr44YfN8xyPXHz++efmWLHubrvt5l577bVmX3bo0MH0tWnTJu9NJ52g5/7gwYPNfuWmdvTRR7s333yzGTxwbHg9+zkMQd7Xu9G3bdvW9zfCcvjhh7tz5syxr/AnCeeeEFFQDOHO7+6cc87xfc5buMdgpEonKuEO3vUu18K1MZOp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0aOHSfuYDrnc7777bufFF190/vrrL1Ox7eijj3bWXXddu8Z8SIM4bNgwU3GW56kWSuVRoPJbnz59TI5zP7bddltnzz33NI9/++0354YbbnDGjh3rLLroos52223nHH/88QtUpuWz33TTTaa6HBlcDjzwQGfvvfe2z9bkUyd/OhXnMuF7XnXVVbZVUyGWnOtvvfWWqVq35ZZbOscdd1zoYktCCCGEEOVMYi3ugwcPNuX7v/zyS7Mg4il3T+pDhGOpIZUkxXso5IMYZnn//fedU045xdl0002dH3/80axHqflrrrnGef311007HcR27969560LiGte/8orrzhrr722SfOIyN5jjz2cf//9167lmMcMYk4++WQjdElpSZrD9u3bO88//7xdq4ZTTz3V2X///U36SHK9P/TQQ2Y9xDX88ssvznXXXWe+k7e/Wb744gvn+uuvN5VZgVLIVGjlezNAadSokdOrVy9nv/32qyX6P/jgA5Nqke/Qtm1bU/Bon332qVXkiP3CoIXPnP6eLF999ZVdq0a0d+zY0bnwwguNUGdAxD7baaednL///tuuJYQQQghRAWBxTyLbbrutu9dee9lWDf/884/bvXt3NyVU3ZSQt72l4cEHH0SpuinhbntqePfdd91lllnGPeyww0w7JVrdpZZayk2JTdNOJyWwzTbeeust006JWbd58+budttt56ZEqemDZ555xqx355132h7Xvf32203fs88+a3tc8xr2W4sWLcy24J133jHrpcS2aUNqkOGussoq7iGHHGLaU6ZMcZs2bWr+pzNmzBjz2scee8y0U0LbTQ0k3NQgxLTB+xwjRoywPa45bnyPadOm2R7XPfTQQ91ll13WnTFjhmmnBh7mdWwzF6lBjzne7733nu1x3ZTYN6+95ZZbbI8QQgghRPKpKB93LMtYbbE2p8Ss7S0vNt54Y6dr167O0KFDTRsr8VZbbTXPap3OqFGjTAEgZhEAtxIs+EcddZSzxBJLmD7YbbfdnPXWW8+43XiMHDnS9O266662xzGvwVUGi/Unn3xi+nBpgS5dupj/wHtirU8Jc9PGcj558mTzP50hQ4aYKqM777yzabMtLOlbbLGFaQMuPHxH733gtddeMxVdV1ppJdvjmO/0+++/GxejMLzxxhvORhttVMs9CvccZiPS31MIIYQQIulUXHAqorNevXrO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7LPd8ePHu0888YTbpEkTt2PHjnYN173wwgvNOueee+4Cn/3ZZ591U8LerimEEEIIkWwSK9x33HFH94ADDrCt+fz5559GBF5wwQW2p0aUH3bYYfNEMWL86KOPdmfOnGnXqOGjjz4yIpjnEbgnnniie+ihh7rrrLOOXcN1f/31VzNgOPPMM22PP48++qh5r++++872BANRuvzyyy/w2TzoP+6448xnZPss6623nvvKK6/YNeaDKOeze+shqvlOs2bNsmu4ZgDgPe+3DBw40K7puj/++KO78MILu1dddZXtWZDhw4e7LVu2nPf6du3aue+//759dj5XXnmlW79+fbMO29x///3NwCWTq6++2l1hhRXmba9z587ulClT7LOuOQe85/yWsPtfCCGEEKJcWYg/KYFTFeDf/f3335tsNJlpH9PB/YJgVfyxSS2JCw0uJuUE1WGpUFqvXj0T/JkL/NJxX2G9dN/wuCCwlgJOuOSwr7NB5dRvv/3WpNykamo2yLbDeiuuuOK8mAQhhBBCiGqjqoR7WDzfbHyoKf4jhBBCCCFEqZBwz4BATwS7l0OcxwSsKsWgEEIIIYQoJRWVVSYKyGKyySabmAJBuKEMHz5col0IIYQQQpQcWdwzwOKOHzw5zfG9FkIIIYQQohyQcBdCCCGEECIByFVGCCGEEEKIBCDhLoQQQgghRAKQcBdCCCGEECIBSLgLIYQQQgiRACTchRBCCCGESAAS7kIIIYQQQiSAxKWDpJLpd999Z1vh2WyzzZxFF13U5GufMGGC7Q3POuus46y44orOv//+ayqrFkqTJk2cZs2amcfvvvuuM2vWLPM4LMstt5zTpk0b8/jzzz93pk6dah6HZaGFFnI6dOhgHv/444/OF198YR4XwgYbbGCKWM2cOdMZN26c7Q1P8+bNncaNG5vHb7zxhjNnzhzzOCzk5W/durV5zLHnHCiExRdf3Gnfvr15/O233zpff/21eVwIbdu2dZZccknnt99+cz788EPbG56WLVs6K6+8ssPP+fXXX7e94VlllVWcNdZYwzx+//33nT/++MM8DsvSSy/tbLTRRubxpEmTTG2EQtl8882dRRZZxPn555+dTz75xPaGZ91113VWWGEF559//nHeeust2xue1Vdf3SzwzjvvOH///bd5HJbll1/eWW+99czjTz/91Jk2bZp5HJaFF17Y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Wmgh+0gIIYQQQpSaxAp3aNq0qfmfTtu2bZ099tjDWWyxxUx7xowZTu/evZ3PP//ctD3eeust54ILLnDmzJlje2pcQwYOHOicfvrpZuExfTBz5kzn/PPPN64luOngT9+vXz/znMe///7r3HHHHcYqz8IsAH3pvPTSS+Z1P/zwg9neoYce6lx66aXOr7/+ap5/6qmnnKOOOso58cQTnZdfftn0ZfLss8+a57t37+5cddVVzu+//26fqcF7j3/++ce54YYbnFNOOcV544037LP+nHbaacbFaMSIEbYnO2z37rvvNp/z8MMPN+5Ks2fPts/WwHd/5JFHnHfeece8P5+VPmZCWJfX0NerVy/niy++sK+qTb7vKYQQQghRTSRSuHtuMH4W4RYtWhjx26pVK9P+/vvvjTCeMGGCaXsgZC+++GLn77//Nm0EeufOnY0Vf/r06UZIn3zyyc4uu+xixD3PEwyLaOU1PPYGEEDf9ttvbwI9EfmzZs0ygnXHHXesJWpxR+F9t956a+Pmw/v06dPHvJaBBAMGtvXiiy86O+ywg/Pkk0/aV9aAwOZzEoS7yCKLONdcc43x6//xxx/tGjXvgW/6McccY9a/55578s5AsM327dsvYHXPhO/CPkFQ//nnn2ZgwsBou+22qzVIQdife+65ZhDFfvr000+N0MfFad9993Xuv/9+s1/5bJtttpnz9ddf21fWEOR7hoVg29tvv915/vnnbY8QQgghRIJIiZnE8eGHH7p89CFDhtie7GRb9/rrrzf9f/zxh2mnxK5pjxkzxrQhJTbdRRdd1H388cdtj+tuu+227kEHHWRb87npppvMuq+//rrtcc1j+m6++Wbb47pnnXWWeZ+UYLU9rnvttdeavpYtW7q//fab6fvrr7/cNm3auJtuuqlpw7hx48x6vJfHt99+6zZs2NA9+uijbc/890iJaXfKlCluaqDjpkSyfbY2qQGCWfe9994z+4jHI0aMMM+lBiumnRoEmDYMGjTI9KUGFLbHdceOHesuvPDC7l133WV7XHfzzTd3l1pqKTc1YDJttrXffvuZ17L/+EzA8//73//cnj17mjYE/Z5hefXVV812l1xyyaz7QwghhBCiXElscGrUYJmHNdZYw/yHlJB2rrvuOqdJkya2JzuvvPKK065dO2eLLbawPY55TN/IkSNtTw2LL76406VLF9ty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qe3bt6uoqCg1cuRIVbNmTXXx4kW9hn9Hjx71fL6tW7eqMWPGqLVr13rK8H7Nede0adPUokWL1Ny5c2WeiIiIiMKLa2vc69Wrp3LmzCk1zcalS5fUY489phYsWKB27dql7rzzTr0kOHjOAgUKqE8//VSXJF+JEiXU3XffLe8JNeM//vijuu++++Tk4oknntBrJeznn39WxYsXlxOWFi1a6NI427Ztk6C9Y8eO8hmIiIiIKLyEVY47arQHDx4sATzSU262q1evqr1796o6depI0A5VqlSRNJkDBw7IfKiUK1dO9e/fn0E7ERERUZgKu8apqOFG7vexY8d0SaydO3eql19+WbVt21a9+OKLasOGDXqJUhcuXFCvvPKK2r9/v9Rc9+vXT7355pt6aawrV66o9957T2rJn3nmGTV16lR1/fp1vdQ3vA8E1M7XQo17TEyMKlasmC4JDaTiIHA/d+6cLlFq8uTJkluP1+zevbtq3769lOF9X758WY0fP17KXnrpJanR95aUz0xEREREKSPsAnc0UkXttjPAnDdvnqpYsaJasmSJuvXWW9V3332n7r//fjV79mxZfu3aNfW///1PAlXU1uP+8ePHZRmgDGk0vXv3Vn/++ac6ffq0pKT885//TDCQxUkCcvG//vprdejQIQmUS5curVq1aqXXCI3NmzerIUOGqBMnTugSpT744APVt29fabCLz7N792553507d5Z0GwTiuCqAPPzq1aurX3/9VT8yeZ85rUJW2MSJE+V3QEREROQ6yHF3o7p161rNmjXTc/FlzJjRGjhwoJ6zrPLly1t2oG7ZgbnM24G6ZQeg1l133SXzBp6zdevWei7O6NGjrUyZMlkbN27UJZa1aNEitA2wpk2bpkv8+9e//mUVLlxYpmLFill79uzRS4K3d+9eeb1Zs2bpkvimT58uy/fv369LLPnMWbNmtXbs2CHz+NwtW7aU9fA57QBcyrE8S5YsVq9evWQekvuZ06Jvv/1W3n9UVJRln7DoUiIiIiJ3iIh+3KdMmSIpI3ZAL/OolUfNMVJjvFNqfFm1apXU0KMrR6Nx48bSWHTlypW6xL/KlStLbzV//PGHsoNHeVxqqVGjhtTwAz53mzZt5D4a8Zq8eyzHemjQayT3M6dFFSpUUPbJnuratau65ZZbdCkRERGRO0RE4I7AuXDhwurIkSPqhx9+kMDz8OHDsgzBdEKQfpInTx49F6dgwYLxUmp8Qb488ucff/xxyStPaleVSZUrVy59L1bu3LnlFj3yOKH8/Pnzei55nzmtMr0QDR8+XJcQERERuUdEBO4bN25UtWvXVrfffruqX7++euSRRxIVvCEPfNmyZdLw1Tmh0SmW+TNz5kz1xhtvqKFDh6qPPvpIBksaOHCg9LcOyKXHlYC0KKmfmYiIiIhSRtgH7uhl5eGHH5YBjzZt2iTzqDFGg8xgIa2iTJky6tVXX403oaEjeqrx5+2331Z169b1rNOlSxf173//WxqoohcXjKA6YMAAqYlPa5L6mYmIiIgoZYRd4H7y5EnpBSVLliwyjx5kfv/9d+nesVKlSp687sT0jJItWzaVN29e6UrSe8IoqP789NNP0jOL04QJEyTdBI/74osv1LvvvqsyZ86sl6YdSf3MRERERJQywi5wx8iigLx2MAF61qxZ5dZA+ow3NF5Ft4feUPOMIBzdRRpIF0HeOrqa9AddT3oPtISA+KmnnlJHjx6VABg18mlRUj9zWmaxO0giIiJyMVcH7ugRZsGCBTJhuH/0Wd6jRw/VoEEDT0CMXlEQLGPZ2rVrJRhFzjnSWLwhh3v58uVq5MiRavXq1bpUSWoLGmu2a9dORUdHS5437qMf+EADKT366KOe3PYdO3ZIqg76Re/Vq5dq1KiRWrFihfS1nhYl9TOnZfhOO3XqJD3LoO9+IiIiIleJ7RXSfRo2bCh9cpspQ4YM0i/7Cy+8YMXExOi1Ys2YMcO64447POvWqFHDsoNpuX/gwAG9lmUdPnzYatKkiZUjRw6rYsWKujTWvHnzrOLFi3ueo3Tp0tbSpUv1Ut8uXLgg7wd9qTsfN3XqVFnep08fK3v27Nbu3btlPhC8Tzz+q6++0iXx4TNi+aFDh3SJZdWuXdtq06aNnou1Zs0aWW/dunW6JBbWw//UKSmfOS07c+aM9P1vnzzpEiIiIiL3SIc/dlAW9pAyg77UM2XKpAoVKqRL/cO/xeTDOyFfHsvQQ42v5b6gdve3336TXHY8zm2S8pmJiIiIKLQiJnAnIiIiInKziOjHnYiIiIjI7Ri4ExERERG5AAN3IiIiIiIXYOBOREREROQCDNyJiIiIiFyAgTsRERERkQswcCciIiIicgEG7kRERERELsDAnYiIiIjIBRi4ExERERG5AAN3IiIiIiIXYOBOREREROQCDNyJiIiIiFyAgTsRERERkQswcCciIiIicgEG7kRERERELsDAnYiIiIjIBRi4ExERERG5AAN3IiIiIiIXYOBOREREROQCDNyJiIiIiFyAgTsRERERkQswcCciIiIicgEG7kRERERELsDAnYiIiIjIBRi4ExERERG5AAN3IiIiIiIXYOBOREREROQCDNyJiIiIiFyAgTsRERERkQswcCciIiIicgEG7kSULKdOnVKHDh3Sc+QWf/75pzpy5Ii6ePGiLiE34vZHFFlcHbjXq1dPlShRQq1atUqXELnHgAED5Pc7ZMgQXeLb1atXVdmyZVXJkiXVzz//rEvThuXLl6s777xTFS5cWA0fPlyXUlqF39I777yjqlSporJmzapuv/12ucX8hAkTZDmlHnMM855Kly6t/va3v6nnnntOff/993rtG3H7iwxdunSR30W5cuXU6dOndSlFKlcH7nv37pXpzJkzuoTIPX7//Xf5/aLWMxAEUzt27FB79uxR586d06Vpw5dfful5T5999pncUtr0xx9/qMaNG0sQsGHDBpUnTx5VqVIllTdvXplHkPiPf/xDXbhwQT+CUpo5hnlPu3btUmvXrpWTqRo1aqhu3bqp69ev60fF4fYX/rD///zzz+V3sX37djlZo8gWtqkyP/74o6pWrZp69NFHdQkRhVrdunVV+vSxu5EGDRrILaVNnTt3Vt98840qWLCgBHw4Ydy0aZM6evSoBH0I5JcuXSpBoi8TJ05UVatWVUOHDtUlFCrTpk2TmlQznTx5Ur6b7t27y/Jx48b5/L+H4/b3zDPPyO8Mv0VS6ocfflAnTpzQc0p9/fXX+h4FK9ziwbAN3LHjW79+vdq8ebMuIaJQa9asmdq6datavXo1L9WnYdu2bVMff/yxBHmzZ89WTZs2VenSpZNlt9xyi2rVqpWaPn26zH/44YdS4+vt119/VdHR0eqXX37RJRQq2bNnV7ly5fJMt912m1wNGT16tOrdu7esg+3LO00iHLc/XF3E7yyhK5GRAifbgKtlwMA98cItHgzbwJ2IUkeZMmUkH5fSLgTr8Pe//11SL3xBYIBaKaRkLFy4UJfSzdavXz+VLVs2SXVasWKFLo3D7S+8mUC9V69eKn/+/NLOaffu3VJGkYmBuxfkk126dEnPJZ6vPERvlmXpe0Sp72bm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"; // Replace with your base64 or URL of the header image
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
      doc.text(
        `${selectedCustomer.name} ${selectedCustomer.surname}`,
        21.2,
        48.8
      );
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
      doc.text(
        `Credit Amount Paid: Rs.${paymentDetails.creditAmount}`,
        14,
        162
      );

      // Show the credit balance if there's any remaining balance
      if (paymentDetails.creditBalance > 0) {
        doc.text(
          `Remaining Balance: Rs.${paymentDetails.creditBalance}`,
          14,
          168
        );
      } else {
        doc.text(`Full payment received. No outstanding balance.`, 14, 168);
      }
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
    if (paymentDetailsState) {
      const doc = generatePDF(paymentDetailsState); // Use the saved payment details
      doc.save(`receipt_${invoiceNumber}.pdf`);

      // Immediately refresh the page
      // window.location.reload();
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
    const pdfDataUrl = pdfDoc.output("dataurl"); // Generate the PDF as a Data URL

    // Prepare the text and sharing content
    const formattedDate = new Date().toLocaleDateString();
    const formattedTime = new Date().toLocaleTimeString();

    // Use 'let' instead of 'const' because 'textMessage' will be updated later
    let textMessage = `IDS Printing House\nTransaction Receipt\nInvoice Number: ${invoiceNumber}\nDate: ${formattedDate}\nTime: ${formattedTime}\n\nCustomer:\nName: ${
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
    )}\nDiscount: Rs.${transaction.discount.toFixed(
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

    // Prepare WhatsApp and email sharing URLs
    const whatsappURL = `https://wa.me/+94${
      selectedCustomer.phone
    }?text=${encodeURIComponent(textMessage)}`;

    // Prepare the email content with the PDF URL
    const emailSubject = `Receipt for ${selectedCustomer.name} ${selectedCustomer.surname}`;
    const emailBody = `${textMessage}\n\nHere is your receipt PDF: ${pdfDataUrl}`;
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
