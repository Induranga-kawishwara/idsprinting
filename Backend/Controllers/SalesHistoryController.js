import { db } from "../db.js";
import { broadcastCustomerChanges } from "../SocketIO/socketIO.js";

const SalesHistorysCollection = db.collection("Customers");

// Get all SalesHistorys
export const getAllSalesHistory = async (req, res) => {
  try {
    const snapshot = await SalesHistorysCollection.get();
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

// Get a SalesHistory by ID
export const getSalesHistoryDetails = async (req, res) => {
  const { customerId, saleId } = req.params;

  try {
    const categoryRef = SalesHistorysCollection.doc(customerId);

    const categorySnapshot = await categoryRef.get();

    if (!categorySnapshot.exists) {
      return res.status(404).send({ message: "Category not found." });
    }

    const categoryData = categorySnapshot.data();
    const { items = [], ...categoryDetails } = categoryData;

    const item = items.find((item) => item.saleId === saleId);

    if (!item) {
      return res
        .status(404)
        .send({ message: "Item not found in this category." });
    }

    const result = {
      category: { id: customerId, ...categoryDetails },
      item,
    };

    return res.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving category and item details:", error);
    return res.status(500).send({ error: error.message });
  }
};

// Delete a SalesHistory
export const deleteSalesHistory = async (req, res) => {
  const { customerId, saleId } = req.params;

  try {
    const categoryRef = SalesHistorysCollection.doc(customerId);

    const categorySnapshot = await categoryRef.get();

    if (!categorySnapshot.exists) {
      return res.status(404).send({ message: "Category not found." });
    }

    const { items = [] } = categorySnapshot.data();

    const updatedItems = items.filter((item) => item.saleId !== saleId);

    // await updateDoc(categoryRef, { items: updatedItems });
    await categoryRef.update({ items: updatedItems });

    broadcastCustomerChanges("ItemDeleted", { saleId });

    return res.status(200).send({ message: "Item deleted successfully." });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res.status(500).send({ error: error.message });
  }
};
