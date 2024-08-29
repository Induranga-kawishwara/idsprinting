import React, { useState, useMemo } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal } from '@mui/material';
import './Sales.scss'; // Ensure the correct CSS file is imported
import jsPDF from 'jspdf';  // Import jspdf


const initialProducts = [
    {
      id: 1,
      name: 'Shirts',
      price: 9.99,
      gsm: 180,
      color: 'Red'
    },
    {
      id: 2,
      name: 'Pants',
      price: 14.99,
      gsm: 200,
      color: 'Blue'
    },
    {
      id: 3,
      name: 'Dresses',
      price: 19.99,
      gsm: 150,
      color: 'Green'
    },
    {
      id: 4,
      name: 'Shoes',
      price: 14.99,
      gsm: null,
      color: 'Black'
    },
    // Add more products as needed
  ];


const initialCustomers = [
  {
    id: 1,
    name: 'The J',
    surname: 'Valoy',
    email: 'valoy@domain.com',
    phone: '123-456-7890',
    totalSpent: 'RD $50.00',
    houseNo: '',
    street: '',
    city: '',
    postalCode: '',
  },
  // Add more customers if needed
];

const PaymentSchema = Yup.object().shape({
  paymentMethod: Yup.string().required('Payment method is required'),
  cashGiven: Yup.number().when('paymentMethod', {
    is: 'Cash',
    then: (schema) => schema.required('Cash given is required').min(0),
    otherwise: (schema) => schema.notRequired(),
  }),
  cardDetails: Yup.string().when('paymentMethod', {
    is: 'Card',
    then: (schema) => schema.required('Card details are required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  bankTransferNumber: Yup.string().when('paymentMethod', {
    is: 'Bank Transfer',
    then: (schema) => schema.required('Bank transfer number is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  chequeNumber: Yup.string().when('paymentMethod', {
    is: 'Cheque',
    then: (schema) => schema.required('Cheque number is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  creditAmount: Yup.number().when('paymentMethod', {
    is: 'Credit',
    then: (schema) => schema.required('Credit amount is required').min(0),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const ProductSchema = Yup.object().shape({
  name: Yup.string().required('Product name is required'),
  price: Yup.number().required('Price is required').min(0, 'Price must be a positive number'),
  qty: Yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1'),
});

const Sales = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customers] = useState(initialCustomers);
  const [transaction, setTransaction] = useState({
    products: [],
    total: 0.0,
    discount: 0.0,
    net: 0.0,
  });



  const [invoiceNumber, setInvoiceNumber] = useState(null); // Add state for invoice number


  
  const [products] = useState(initialProducts);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('name'); // Default search field

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (searchField === 'name') {
        return product.name.toLowerCase().includes(productSearchQuery.toLowerCase());
      } else if (searchField === 'price') {
        return product.price.toString().includes(productSearchQuery);
      } else if (searchField === 'gsm') {
        return product.gsm && product.gsm.toString().includes(productSearchQuery);
      } else if (searchField === 'color') {
        return product.color.toLowerCase().includes(productSearchQuery.toLowerCase());
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
            customer.surname.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
            customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
            customer.phone.includes(customerSearchQuery)
        )
        .slice(0, 5), // Limit to top 5 customers
    [customerSearchQuery, customers]
  );

  const addProductToTransaction = (product) => {
    setTransaction((prevTransaction) => {
      const existingProduct = prevTransaction.products.find((p) => p.id === product.id);
      let updatedProducts;

      if (existingProduct) {
        updatedProducts = prevTransaction.products.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      } else {
        updatedProducts = [...prevTransaction.products, { ...product, qty: 1 }];
      }

      const total = updatedProducts.reduce((sum, p) => sum + p.qty * p.price, 0);
      const net = total - prevTransaction.discount;

      return { ...prevTransaction, products: updatedProducts, total, net };
    });
  };

  const updateProductQty = (productId, qty) => {
    setTransaction((prevTransaction) => {
      const updatedProducts = prevTransaction.products.map((product) =>
        product.id === productId ? { ...product, qty: Number(qty) } : product
      );
      const total = updatedProducts.reduce((sum, p) => sum + p.qty * p.price, 0);
      const net = total - prevTransaction.discount;

      return { ...prevTransaction, products: updatedProducts, total, net };
    });
  };

  const updateProductPrice = (productId, price) => {
    setTransaction((prevTransaction) => {
      const updatedProducts = prevTransaction.products.map((product) =>
        product.id === productId ? { ...product, price: Number(price) } : product
      );
      const total = updatedProducts.reduce((sum, p) => sum + p.qty * p.price, 0);
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
      const updatedProducts = prevTransaction.products.filter((product) => product.id !== productId);
      const total = updatedProducts.reduce((sum, p) => sum + p.qty * p.price, 0);
      const net = total - prevTransaction.discount;

      return { ...prevTransaction, products: updatedProducts, total, net };
    });
  };

  const completeSale = () => {
    if (selectedCustomer) {
      setIsPaymentModalOpen(true);
    } else {
      alert('Please select a customer before proceeding to payment.');
    }
  };
  const clearSearch = () => {
    setProductSearchQuery('');
    setSearchField('name'); // Reset search field to default value
  };


  const handlePaymentSubmit = (values) => {
    // Handle different payment methods
    if (values.paymentMethod === 'Cash') {
      const balance = values.cashGiven - transaction.net;
      alert(`Transaction completed. Change due: ${balance.toFixed(2)}`);
    } else if (values.paymentMethod === 'Card') {
      alert(`Transaction completed using card. Details saved: ${values.cardDetails}`);
    } else if (values.paymentMethod === 'Bank Transfer') {
      alert(`Transaction completed using bank transfer. Number: ${values.bankTransferNumber}`);
    } else if (values.paymentMethod === 'Cheque') {
      alert(`Transaction completed using cheque. Number: ${values.chequeNumber}`);
    } else if (values.paymentMethod === 'Credit') {
      alert(`Credit payment of ${values.creditAmount} recorded.`);
    }

        // Generate a unique invoice number
        const newInvoiceNumber = `INV-${new Date().getTime()}`;
        setInvoiceNumber(newInvoiceNumber);

        
     // Ask the user if they want a receipt
     const wantsReceipt = window.confirm('Would you like to download a receipt?');

    // Generate PDF if user wants a receipt
    if (wantsReceipt) {
        generatePDF(values);
      }

    // Clear the transaction table after payment
    setTransaction({
      products: [],
      total: 0.0,
      discount: 0.0,
      net: 0.0,
    });

    // Close the modal after handling payment
    setIsPaymentModalOpen(false);
  };




  const generatePDF = (paymentDetails, invoiceNumber) => {
    const doc = new jsPDF();
    
    // Get current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString(); // Format: MM/DD/YYYY
    const formattedTime = currentDate.toLocaleTimeString(); // Format: HH:MM:SS AM/PM

    doc.setFontSize(18);
    doc.text('Transaction Receipt', 14, 22);
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${invoiceNumber}`, 14, 30); // Add invoice number
    doc.text(`Date: ${formattedDate}`, 14, 36);
    doc.text(`Time: ${formattedTime}`, 14, 42);

    doc.text('Customer:', 14, 50);
    if (selectedCustomer) {
      doc.text(`Name: ${selectedCustomer.name} ${selectedCustomer.surname}`, 14, 56);
      doc.text(`Email: ${selectedCustomer.email}`, 14, 62);
      doc.text(`Phone: ${selectedCustomer.phone}`, 14, 68);
    }

    doc.text('Products:', 14, 80);
    transaction.products.forEach((product, index) => {
      const y = 86 + index * 6;
      doc.text(
        `${product.name} - ${product.qty} x $${product.price.toFixed(2)} = $${(product.qty * product.price).toFixed(2)}`,
        14,
        y
      );
    });

    doc.text(`Total: $${transaction.total.toFixed(2)}`, 14, 120);
    doc.text(`Discount: $${transaction.discount.toFixed(2)}`, 14, 126);
    doc.text(`Net: $${transaction.net.toFixed(2)}`, 14, 132);

    doc.text('Payment Details:', 14, 150);
    doc.text(`Method: ${paymentDetails.paymentMethod}`, 14, 156);
    if (paymentDetails.paymentMethod === 'Cash') {
      doc.text(`Cash Given: $${paymentDetails.cashGiven}`, 14, 162);
      const changeDue = paymentDetails.cashGiven - transaction.net;
      doc.text(`Change Due: $${changeDue.toFixed(2)}`, 14, 168);
    } else if (paymentDetails.paymentMethod === 'Card') {
      doc.text(`Card Details: ${paymentDetails.cardDetails}`, 14, 162);
    } else if (paymentDetails.paymentMethod === 'Bank Transfer') {
      doc.text(`Bank Transfer Number: ${paymentDetails.bankTransferNumber}`, 14, 162);
    } else if (paymentDetails.paymentMethod === 'Cheque') {
      doc.text(`Cheque Number: ${paymentDetails.chequeNumber}`, 14, 162);
    } else if (paymentDetails.paymentMethod === 'Credit') {
      doc.text(`Credit Amount: $${paymentDetails.creditAmount}`, 14, 162);
    }

    doc.save('transaction_receipt.pdf');
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
      const total = updatedProducts.reduce((sum, p) => sum + p.qty * p.price, 0);
      const net = total - prevTransaction.discount;

      return { ...prevTransaction, products: updatedProducts, total, net };
    });

    setIsAddProductModalOpen(false);
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(''); // Clear search input after selection
  };

  const handleRemoveCustomer = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className="sales-page"> 
    <div className="sales-dashboard">
        <br />
        <br />
      <div className="sales-body">
        <div className="left-panel">
          {/* Net Amount Box */}
          <div className="net-amount-box">
            <h2>Net Amount</h2>
            <p>{transaction.net.toFixed(2)}</p>
          </div>

          <div className="customer-info">
            {selectedCustomer ? (
              <div className="customer-selected">
                <div className="customer-details">
                  <h3>
                    {selectedCustomer.name} {selectedCustomer.surname}
                  </h3>
                  <p>{selectedCustomer.loyaltyStatus || 'Regular Customer'}</p>
                  <div className="customer-metrics">
                    <span>Email: {selectedCustomer.email}</span>
                    <br />
                    <span>Phone: {selectedCustomer.phone}</span>
                  </div>
                </div>
                <button onClick={handleRemoveCustomer} className="remove-customer-button">
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
                    <li key={customer.id} onClick={() => handleSelectCustomer(customer)}>
                      {customer.name} {customer.surname} - {customer.phone}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="transaction-summary">
            <table>
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
                        onChange={(e) => updateProductQty(product.id, e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={product.price}
                        min="0"
                        step="0.01"
                        onChange={(e) => updateProductPrice(product.id, e.target.value)}
                      />
                    </td>
                    <td>{(product.qty * product.price).toFixed(2)}</td>
                    <td>
                      <button onClick={() => removeProduct(product.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Plus Button to Add Products Manually */}
            <div className="add-product-button-container">
              <Button onClick={() => setIsAddProductModalOpen(true)} className="button-add-product">
                + Add Product
              </Button>
            </div>

            <div className="totals">
              <p>
                Discount:{' '}
                <input
                  type="number"
                  value={transaction.discount}
                  min="0"
                  step="0.01"
                  onChange={(e) => updateDiscount(e.target.value)}
                />
              </p>
              <p>Net: {transaction.net.toFixed(2)}</p>
            </div>
          </div>
          <div className="action-buttons">
            <button onClick={completeSale} className="button-pay" disabled={!selectedCustomer}>
              Pay
            </button>
          </div>
        </div>
        <div className="right-panel">
          {/* Product Search and Filter */}
          <div className="product-search">
          <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder={`Search by ${searchField}`}
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-secondary" onClick={clearSearch}>
                Clear
              </button>
            </div>
            <select
              className="form-control mt-2"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="gsm">GSM</option>
              <option value="color">Color</option>
            </select>
          </div>
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <button key={product.id} className="product-button" onClick={() => addProductToTransaction(product)}>
                {product.name}
                <span>{product.price.toFixed(2)}</span>
              </button>
            ))}
          </div>
          </div>
      </div>

      {/* Payment Modal */}
      <Modal open={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
        <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
          <div className="modal-content custom-modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Payment</h5>
              <Button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setIsPaymentModalOpen(false)}
              />
            </div>
            <div className="modal-body">
              <Formik
                initialValues={{
                  paymentMethod: '',
                  cashGiven: '',
                  cardDetails: '',
                  bankTransferNumber: '',
                  chequeNumber: '',
                  creditAmount: '',
                }}
                validationSchema={PaymentSchema}
                onSubmit={handlePaymentSubmit}
              >
                {({ values, errors, touched }) => (
                  <Form>
                    <div className="mb-3">
                      <label>Payment Method</label>
                      <Field as="select" name="paymentMethod" className="form-control">
                        <option value="" label="Select" disabled />
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Credit">Credit</option>
                      </Field>
                      {errors.paymentMethod && touched.paymentMethod ? (
                        <div className="text-danger">{errors.paymentMethod}</div>
                      ) : null}
                    </div>
                    {values.paymentMethod === 'Cash' && (
                      <div className="mb-3">
                        <label>Cash Given</label>
                        <Field name="cashGiven" type="number" className="form-control" />
                        {errors.cashGiven && touched.cashGiven ? (
                          <div className="text-danger">{errors.cashGiven}</div>
                        ) : null}
                      </div>
                    )}
                    {values.paymentMethod === 'Card' && (
                      <div className="mb-3">
                        <label>Card Holder's Name or Last 4 Digits</label>
                        <Field name="cardDetails" className="form-control" />
                        {errors.cardDetails && touched.cardDetails ? (
                          <div className="text-danger">{errors.cardDetails}</div>
                        ) : null}
                      </div>
                    )}
                    {values.paymentMethod === 'Bank Transfer' && (
                      <div className="mb-3">
                        <label>Bank Transfer Number</label>
                        <Field name="bankTransferNumber" className="form-control" />
                        {errors.bankTransferNumber && touched.bankTransferNumber ? (
                          <div className="text-danger">{errors.bankTransferNumber}</div>
                        ) : null}
                      </div>
                    )}
                    {values.paymentMethod === 'Cheque' && (
                      <div className="mb-3">
                        <label>Cheque Number</label>
                        <Field name="chequeNumber" className="form-control" />
                        {errors.chequeNumber && touched.chequeNumber ? (
                          <div className="text-danger">{errors.chequeNumber}</div>
                        ) : null}
                      </div>
                    )}
                    {values.paymentMethod === 'Credit' && (
                      <div className="mb-3">
                        <label>Paying Amount</label>
                        <Field name="creditAmount" type="number" className="form-control" />
                        {errors.creditAmount && touched.creditAmount ? (
                          <div className="text-danger">{errors.creditAmount}</div>
                        ) : null}
                      </div>
                    )}
                    <div className="modal-footer">
                      <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary">
                        Submit Payment
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Product Modal */}
      <Modal open={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)}>
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
                  name: '',
                  price: '',
                  qty: '',
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
                      <Field name="price" type="number" className="form-control" />
                      {errors.price && touched.price ? (
                        <div className="text-danger">{errors.price}</div>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <label>Quantity</label>
                      <Field name="qty" type="number" className="form-control" />
                      {errors.qty && touched.qty ? (
                        <div className="text-danger">{errors.qty}</div>
                      ) : null}
                    </div>
                    <div className="modal-footer">
                      <Button variant="secondary" onClick={() => setIsAddProductModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary">
                        Add Product
                      </Button>
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

export default Sales;
