import React, { useState, useMemo, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Sales.scss";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory
import CustomerFormModal from "../Customer/CustomerFormModal"; // Adjust the import path
import "../All.scss";
import AddProductModal from "./AddProductModal"; // Import your new component
import ReceiptOptionsModal from "./ReceiptOptionsModal"; // Import the new component
import PaymentModal from "./PaymentModal"; // Import the new component
import TableChecker from "../../Reusable/TableChecker/TableChecker.js";
import _ from "lodash";
import axios from "axios";
import {
  ShareReceipt,
  PrintReceipt,
  DownloadReceipt,
} from "../../Reusable/ShareReceipt/ShareReceipt.js";
import socket from "../../Utility/SocketConnection.js";
import Loading from "../../Reusable/Loadingcomp/Loading.jsx";

const Sales = () => {
  const [isReceiptOptionsModalOpen, setIsReceiptOptionsModalOpen] =
    useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [transaction, setTransaction] = useState({
    products: [],
    total: 0.0,
    discount: 0.0,
    net: 0.0,
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate(); // Use useNavigate for navigation
  const [invoiceNumber, setInvoiceNumber] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDetailsState, setPaymentDetailsState] = useState(null);
  const [loadingpage, setLoadingpage] = useState(false);

  const mapItemData = (category, item) => {
    return {
      categoryid: category.id,
      Itemid: item.itemId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: category.rawMaterialName,
      color: item.color,
      qty: category.qty,
      gsm: category.thickness,
      buyingPrice: category.buyingPrice,
      company: category.company,
      wholesale: item.wholesale,
      retailPrice: item.retailPrice,
      size: category.size,
      discount: item.discount || 0,
      addedDateTime: item.addedDateTime,
    };
  };

  const customerDetails = (customer) => {
    return {
      ...customer,
      id: customer.id,
      surname: customer.surName,
      phone: customer.contactNumber,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ItemData, customerData] = await Promise.all([
          axios.get(
            "https://candied-chartreuse-concavenator.glitch.me/categories/"
          ),
          axios.get(
            "https://candied-chartreuse-concavenator.glitch.me/customers/"
          ),
        ]);

        const newData = ItemData.data
          .filter((category) => Number(category.qty) > 0)
          .map((category) => {
            const items = category.items
              .map((item) => mapItemData(category, item))
              .sort(
                (a, b) => new Date(b.addedDateTime) - new Date(a.addedDateTime)
              );

            return {
              category: category.rawMaterialName,
              categoryid: category.id,
              items,
            };
          });

        const formattedCustomers = customerData.data.map((customer) =>
          customerDetails(customer)
        );

        setCustomers(formattedCustomers);
        setAllProducts(newData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    socket.on("ItemAdded", (newItem) => {
      const newProduct = mapItemData(newItem.category, newItem.newItem);
      setAllProducts((prevProducts) =>
        prevProducts.map((category) => {
          if (category.categoryid === newItem.category.id) {
            return {
              ...category,
              items: [newProduct, ...category.items],
            };
          }
          return category;
        })
      );
    });

    socket.on("ItemUpdated", (updatedItem) => {
      setAllProducts((prevProducts) =>
        prevProducts.map((category) => {
          if (category.categoryid === updatedItem.category.id) {
            return {
              ...category,
              items: category.items.map((item) =>
                item.Itemid === updatedItem.item.itemId
                  ? mapItemData(updatedItem.category, updatedItem.item)
                  : item
              ),
            };
          }
          return category;
        })
      );
    });

    socket.on("ItemDeleted", ({ itemId }) => {
      setAllProducts((prevProducts) => {
        return prevProducts.map((category) => {
          return {
            ...category,
            items: category.items.filter((item) => item.Itemid !== itemId),
          };
        });
      });
    });

    socket.on("CategoryUpdated", (updatedCategory) => {
      setAllProducts((prevProducts) => {
        const updatedProducts = prevProducts.map((category) => {
          if (category.categoryid === updatedCategory.id) {
            return {
              ...category,
              category: updatedCategory.rawMaterialName,
              items: category.items.map((item) => {
                return {
                  ...item,
                  category: updatedCategory.rawMaterialName,
                  size: updatedCategory.size,
                  gsm: updatedCategory.thickness,
                  qty: updatedCategory.qty,
                  buyingPrice: updatedCategory.buyingPrice,
                  company: updatedCategory.company,
                };
              }),
            };
          }
          return category;
        });
        return updatedProducts;
      });
    });

    socket.on("CategoryDeleted", ({ id }) => {
      setAllProducts((prevCategory) =>
        prevCategory.filter((Category) => Category.categoryid !== id)
      );
    });

    // // Listen for real-time customer updates
    socket.on("customerAdded", (newCustomer) => {
      setCustomers((prevCustomers) => [
        customerDetails(newCustomer),
        ...prevCustomers,
      ]);
    });

    socket.on("customerUpdated", (updatedCustomer) => {
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.id === updatedCustomer.id
            ? customerDetails(updatedCustomer)
            : customer
        )
      );
    });

    socket.on("customerDeleted", ({ id }) => {
      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer.id !== id)
      );
    });
    return () => {
      socket.off("ItemAdded");
      socket.off("ItemUpdated");
      socket.off("ItemDeleted");

      socket.off("CategoryUpdated");
      socket.off("CategoryDeleted");

      socket.off("customerAdded");
      socket.off("customerUpdated");
      socket.off("customerDeleted");
    };
  }, [customers, allProducts]);

  const handleSubmit = async (values) => {
    setLoadingpage(true);
    try {
      const response = await axios.post(
        "https://candied-chartreuse-concavenator.glitch.me/customers/",
        {
          name: values.name,
          surName: values.surname,
          contactNumber: values.phone,
          email: values.email,
          houseNo: values.houseNo,
          street: values.street,
          city: values.city,
          postalCode: values.postalCode,
          customerType: values.customerType,
          addedDateAndTime: new Date().toISOString(),
        }
      );

      alert(response.data.message);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        // Show a generic error message
        alert("Failed to add the customer. Please try again.");
      }
    }
    setLoadingpage(false);
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return allProducts
      .map((category) => {
        const filteredItems = category.items.filter((item) => {
          if (searchField === "name") {
            return item.itemName
              .toLowerCase()
              .includes(productSearchQuery.toLowerCase());
          } else if (searchField === "price") {
            return item.price.toString().includes(productSearchQuery);
          } else if (searchField === "gsm") {
            return item.gsm && item.gsm.includes(productSearchQuery);
          } else if (searchField === "color") {
            return item.color
              .toLowerCase()
              .includes(productSearchQuery.toLowerCase());
          }
          return true; // Include all if no specific searchField is matched
        });

        // Return the category with filtered items if there are any
        return filteredItems.length > 0
          ? {
              category: category.category,
              categoryid: category.categoryid,
              items: filteredItems,
            }
          : null; // Return null if no items match
      })
      .filter((category) => category !== null); // Remove null categories
  }, [productSearchQuery, searchField, allProducts]);

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

  const addProductToTransaction = (product) => {
    // console.log(product);
    setTransaction((prevTransaction) => {
      const existingProduct = prevTransaction.products.find(
        (p) => p.Itemid === product.Itemid
      );
      let updatedProducts;

      if (existingProduct) {
        updatedProducts = prevTransaction.products.map((p) =>
          p.Itemid === product.Itemid ? { ...p, qty: p.qty + 1 } : p
        );
      } else {
        updatedProducts = [
          ...prevTransaction.products,
          { ...product, qty: 1, discount: product.discount },
        ];
      }

      const total = updatedProducts.reduce(
        (sum, p) =>
          sum + Number(p.qty) * (Number(p.retailPrice) - Number(p.discount)),
        0
      );

      const net = total - prevTransaction.discount;

      return { ...prevTransaction, products: updatedProducts, total, net };
    });
  };

  const updateProductDiscount = (productId, discount) => {
    setTransaction((prevTransaction) => {
      const updatedProducts = prevTransaction.products.map((product) =>
        product.Itemid === productId
          ? { ...product, discount: Number(discount) }
          : product
      );

      const total = updatedProducts.reduce(
        (sum, p) => sum + p.qty * (p.retailPrice - p.discount), // Apply Rs discount to each product
        0
      );

      const net = total - prevTransaction.discount; // Adjust net total based on transaction-level discount, if any

      return { ...prevTransaction, products: updatedProducts, total, net };
    });
  };

  const updateProductQty = (productId, qty) => {
    setTransaction((prevTransaction) => {
      const updatedProducts = prevTransaction.products.map((product) =>
        product.Itemid === productId
          ? { ...product, qty: Number(qty) }
          : product
      );
      const total = updatedProducts.reduce(
        (sum, p) => sum + p.qty * (p.retailPrice - p.discount),
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
        (product) => product.Itemid !== productId
      );
      const total = updatedProducts.reduce(
        (sum, p) => sum + p.qty * (p.retailPrice - p.discount),
        0
      );
      const net = total - prevTransaction.discount;

      return { ...prevTransaction, products: updatedProducts, total, net };
    });
  };

  const completeSale = () => {
    // setLoadingpage(true);

    if (selectedCustomer && transaction.products.length !== 0) {
      setIsPaymentModalOpen(true);
    } else if (transaction.products.length === 0) {
      alert("Please select products before proceeding to payment.");
    } else {
      alert("Please select a customer before proceeding to payment.");
    }
  };

  const clearSearch = () => {
    setProductSearchQuery("");
    setSearchField("name");
  };

  const handlePaymentSubmit = async (values) => {
    let creditBalance = 0;
    let cashChangeDue = 0;

    // Helper function for showing alerts
    const showAlert = (message) => alert(message);

    // Helper function to handle different payment methods
    const handlePaymentMethod = () => {
      const {
        paymentMethod,
        cashGiven,
        onlyCashGiven,
        cardDetails,
        bankTransferNumber,
        chequeNumber,
        creditAmount,
      } = values;

      switch (paymentMethod) {
        case "Cash":
          const balance = onlyCashGiven
            ? onlyCashGiven - transaction.net
            : cashGiven - transaction.net;

          showAlert(
            `Transaction completed. Change due: Rs.${balance.toFixed(2)}`
          );
          break;

        case "Card":
          showAlert(
            `Transaction completed using card. Details saved: ${cardDetails}`
          );
          break;

        case "Card and Cash":
          const cashPart = cashGiven || 0;
          const remainingAmount = transaction.net - cashPart;
          cashChangeDue = cashPart - transaction.net;

          if (cashPart >= transaction.net) {
            showAlert(
              `Transaction completed. Change due: Rs.${cashChangeDue.toFixed(
                2
              )}`
            );
          } else {
            showAlert(
              `Transaction partially completed with cash (Rs.${cashPart}) and remaining amount (Rs.${remainingAmount.toFixed(
                2
              )}) covered by card.`
            );
          }
          break;

        case "Bank Transfer":
          showAlert(
            `Transaction completed using bank transfer. Number: ${bankTransferNumber}`
          );
          break;

        case "Cheque":
          showAlert(
            `Transaction completed using cheque. Number: ${chequeNumber}`
          );
          break;

        case "Credit":
          creditBalance = transaction.net - creditAmount;
          showAlert(
            `Credit payment of Rs.${creditAmount} recorded. Remaining balance: Rs.${creditBalance.toFixed(
              2
            )}`
          );
          break;

        default:
          showAlert("Invalid payment method.");
          break;
      }
    };

    // Call the payment method handler
    handlePaymentMethod();

    // Prepare payment details and invoice number
    const newPaymentDetailsState = {
      ...values,
      cashChangeDue: Math.max(cashChangeDue, 0),
      creditBalance: Math.max(creditBalance, 0),
    };

    const newInvoiceNumber = generateUniqueInvoiceNumber();

    setPaymentDetailsState(newPaymentDetailsState);
    setInvoiceNumber(newInvoiceNumber);

    // Submit payment details to backend
    try {
      const extractCategory =
        transaction?.products?.map((product) => ({
          categoryid: product.categoryid,
          qty: product.qty,
        })) || [];

      const responsetest = await axios.post(
        `https://candied-chartreuse-concavenator.glitch.me/categories/reduceQty`,
        extractCategory
      );

      if (responsetest.status === 200) {
        const response = await axios.post(
          `https://candied-chartreuse-concavenator.glitch.me/payment/${selectedCustomer.id}`,
          {
            paymentDetails: newPaymentDetailsState,
            transaction: {
              ...transaction,
              products: transaction.products.map(
                ({
                  itemName,
                  categoryid,
                  Itemid,
                  color,
                  qty,
                  discount,
                  retailPrice,
                }) => ({
                  itemName,
                  categoryid,
                  Itemid,
                  color,
                  qty,
                  discount,
                  retailPrice,
                  preItemsellingprice: retailPrice - discount,
                })
              ),
            },
            invoicenumber: newInvoiceNumber,
            lastUpdatedDate: new Date(),
          }
        );

        showAlert(response.data.message);
        // Open the modal to choose download, print, or share
        // setLoadingpage(false);

        setIsReceiptOptionsModalOpen(true);

        // Close the payment modal
        setIsPaymentModalOpen(false);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to process the request. Please try again.";
      showAlert(`Error: ${errorMessage}`);
      console.error("Error processing item:", error);
    }
  };

  const handleAddProductSubmit = (values) => {
    const newProduct = {
      Itemid: Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      itemName: values.name,
      color: values.color,
      retailPrice: Number(values.price),
      qty: Number(values.qty),
      discount: Number(values.discount) || 0, // Include discount
    };

    setTransaction((prevTransaction) => {
      const updatedProducts = [...prevTransaction.products, newProduct];
      const total = updatedProducts.reduce(
        (sum, p) => sum + p.qty * (p.retailPrice - p.discount), // Subtract discount from price
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

  return (
    <div>
      {loadingpage ? (
        <div>
          <Loading />
        </div>
      ) : (
        <div className="sales-page">
          <div className="sales-dashboard">
            <br />
            <br />
            <div className="sales-body">
              <div className="left-panel">
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
                        {loading || error || _.isEmpty(filteredCustomers) ? (
                          <TableChecker
                            loading={loading}
                            error={error}
                            hasData={filteredCustomers.length > 0}
                          />
                        ) : (
                          filteredCustomers.map((customer) => (
                            <li
                              key={customer.id}
                              onClick={() => handleSelectCustomer(customer)}
                            >
                              {customer.name} {customer.surname} -{" "}
                              {customer.phone}
                            </li>
                          ))
                        )}
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
                          <th>Color</th>
                          <th>Price</th>
                          <th>Discount (Rs)</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transaction.products.map((product) => (
                          <tr key={product.Itemid}>
                            <td>{product.itemName}</td>
                            <td>
                              <input
                                type="number"
                                value={product.qty}
                                min="1"
                                onChange={(e) =>
                                  updateProductQty(
                                    product.Itemid,
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td>{product.color}</td>
                            <td>
                              <input
                                type="number"
                                value={product.retailPrice}
                                min="0"
                                step="0.01"
                                disabled
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={product.discount || 0}
                                min="0"
                                step="0.01"
                                onChange={(e) =>
                                  updateProductDiscount(
                                    product.Itemid,
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td>
                              Rs.{" "}
                              {(
                                Number(product.qty) *
                                (Number(product.retailPrice) -
                                  Number(product.discount))
                              ).toFixed(2)}{" "}
                              {/* Ensure all inputs are numbers */}
                            </td>
                            <td>
                              <button
                                className="tableremovebtn"
                                onClick={() => removeProduct(product.Itemid)}
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
                    disabled={
                      !selectedCustomer || transaction.products.length === 0
                    }
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
                  {loading || error || _.isEmpty(filteredProducts) ? (
                    <TableChecker
                      loading={loading}
                      error={error}
                      hasData={filteredProducts.length > 0}
                    />
                  ) : (
                    filteredProducts.map((data) => (
                      <div>
                        {" "}
                        <span>{data.category}</span>
                        {data.items.map((item) => (
                          <button
                            key={item.Itemid}
                            className="product-button"
                            onClick={() => addProductToTransaction(item)}
                          >
                            <span>{item.itemCode}</span>

                            <span>IN- {item.itemName}</span>
                            {/* <span>

                            <span>Item Name. {item.itemName}</span>
                            <span>Color. {item.color}</span>

                            <span>

                              Discount Price RS.
                              {item.discount.toFixed(2) + "/="}
                            </span> */}
                            <span>
                              Rs.{" "}
                              {(item.retailPrice - item.discount).toFixed(2)}
                            </span>
                            <span>Stock. {item.qty}</span>
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          handlePaymentSubmit={handlePaymentSubmit}
          networth={transaction.net}
        />
      )}
      <ReceiptOptionsModal
        isOpen={isReceiptOptionsModalOpen}
        onClose={() => setIsReceiptOptionsModalOpen(false)}
        downloadReceipt={() =>
          DownloadReceipt(
            selectedCustomer,
            paymentDetailsState,
            transaction,
            invoiceNumber
          )
        }
        printReceipt={() =>
          PrintReceipt(
            selectedCustomer,
            paymentDetailsState,
            transaction,
            invoiceNumber
          )
        }
        shareReceipt={() =>
          ShareReceipt(
            selectedCustomer,
            paymentDetailsState,
            transaction,
            invoiceNumber
          )
        }
      />
    </div>
  );
};

export default Sales;
