import { db } from "../db.js";
import { broadcastCustomerChanges } from "../SocketIO/socketIO.js";
import { v4 as uuidv4 } from "uuid";

const PaymentCollection = db.collection("Customers");

// Get all SalesHistorys
export const getAllPaymentHistory = async (req, res) => {
  try {
    const snapshot = await PaymentCollection.get();
    const SalesHistorys = snapshot.docs.flatMap((doc) => {
      const payments = (doc.data().payments || [])
        .map((payment) => ({
          id: doc.id,
          name: doc.data().name || "",
          surName: doc.data().surName || "",
          contactNumber: doc.data().contactNumber || "",
          invoicenumber: payment.invoicenumber || "",
          paymentId: payment.paymentId || "",
          transaction: payment.transaction || {},
          paymentDetails: payment.paymentDetails || {},
          lastUpdatedDate: new Date(payment.lastUpdatedDate),
        }))
        .filter((payment) => payment.lastUpdatedDate);

      payments.sort((a, b) => b.lastUpdatedDate - a.lastUpdatedDate);

      return payments.length > 0 ? payments : [];
    });

    return res.status(200).send(SalesHistorys);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

export const createPayment = async (req, res) => {
  const { customerId } = req.params;
  const { paymentDetails, transaction, invoicenumber, lastUpdatedDate } =
    req.body;

  try {
    // Reference to the specific document within the Categories collection
    const customerDoc = PaymentCollection.doc(customerId);
    const customerSnapshot = await customerDoc.get();
    if (!customerSnapshot.exists) {
      return res.status(404).send({ message: "Customer not found." });
    }
    const { payments = [], ...customerDetails } = customerSnapshot.data();
    const newPayment = {
      paymentId: uuidv4(),
      paymentDetails,
      transaction,
      invoicenumber,
      lastUpdatedDate,
    };
    // Update the document with the new Payment
    await customerDoc.update({ payments: [...payments, newPayment] });

    const result = {
      id: customerId,
      name: customerDetails.name,
      surName: customerDetails.surName,
      contactNumber: customerDetails.contactNumber,
      invoicenumber,
      paymentId: newPayment.paymentId,
      transaction,
      paymentDetails,
      lastUpdatedDate,
    };

    broadcastCustomerChanges("PaymentAdded", result);
    return res
      .status(200)
      .send({ message: "Payment added to customer successfully." });
  } catch (error) {
    console.error("Error adding Payment:", error);
    return res.status(500).send({ error: error.message });
  }
};

// Get a Payment by ID
export const getCustomerAndPaymentDetails = async (req, res) => {
  const { customerId, paymentId } = req.params;

  try {
    const categoryRef = PaymentCollection.doc(customerId);

    const customerSnapshot = await categoryRef.get();

    if (!customerSnapshot.exists) {
      return res.status(404).send({ message: "Category not found." });
    }

    const categoryData = customerSnapshot.data();
    const { payments = [], ...customerDetails } = categoryData;

    const Payment = payments.find((Payment) => Payment.paymentId === paymentId);

    if (!Payment) {
      return res
        .status(404)
        .send({ message: "Payment not found in this category." });
    }

    const result = {
      category: { id: customerId, ...customerDetails },
      Payment,
    };

    return res.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving category and Payment details:", error);
    return res.status(500).send({ error: error.message });
  }
};

export const updatePaymentByPaymentId = async (req, res) => {
  const { customerId, paymentId } = req.params;
  const {
    PaymentCode,
    PaymentName,
    color,
    wholesale,
    company,
    retailPrice,
    discount,
    addedDateTime,
  } = req.body;

  try {
    const categoryRef = PaymentCollection.doc(customerId);

    const customerSnapshot = await categoryRef.get();

    if (!customerSnapshot.exists) {
      return res.status(404).send({ message: "Customer not found." });
    }

    const { payments = [], ...customerDetails } = customerSnapshot.data();

    const updatedPayments = payments.map((Payment) => {
      if (Payment.paymentId === paymentId) {
        return {
          ...Payment,
          PaymentCode,
          PaymentName,
          color,
          wholesale,
          company,
          retailPrice,
          discount,
          addedDateTime,
        };
      }
      return Payment;
    });

    await categoryRef.update({ Payments: updatedPayments });

    const result = {
      category: { id: customerId, ...customerDetails },
      Payment: {
        paymentId,
        PaymentCode,
        PaymentName,
        color,
        wholesale,
        company,
        retailPrice,
        discount,
        addedDateTime,
      },
    };

    broadcastCustomerChanges("PaymentUpdated", result);

    // await updateDoc(categoryRef, { Payments: updatedPayments });

    return res.status(200).send({ message: "Payment updated successfully." });
  } catch (error) {
    console.error("Error updating Payment:", error);
    return res.status(500).send({ error: error.message });
  }
};

// Delete a Payment's stock detail
export const deletePaymentBypaymentId = async (req, res) => {
  const { customerId, paymentId } = req.params;

  try {
    const categoryRef = PaymentCollection.doc(customerId);

    const customerSnapshot = await categoryRef.get();

    if (!customerSnapshot.exists) {
      return res.status(404).send({ message: "Customer not found." });
    }

    const { payments = [] } = customerSnapshot.data();

    const updatedPayments = payments.filter(
      (Payment) => Payment.paymentId !== paymentId
    );

    // await updateDoc(categoryRef, { Payments: updatedPayments });
    await categoryRef.update({ Payments: updatedPayments });

    broadcastCustomerChanges("PaymentDeleted", { paymentId });

    return res.status(200).send({ message: "Payment deleted successfully." });
  } catch (error) {
    console.error("Error deleting Payment:", error);
    return res.status(500).send({ error: error.message });
  }
};
