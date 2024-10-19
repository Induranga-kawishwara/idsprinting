import { db } from "../db.js";
import Cashin from "../Models/Cashin.js";
import { broadcastCustomerChanges } from "../SocketIO/socketIO.js";

const CashinsCollection = db.collection("Cashins");

// Create a new Cashin
export const createCashin = async (req, res) => {
  const data = req.body;
  try {
    const cashin = new Cashin(
      data.reasonName,
      data.incomeOrOther,
      data.reasonDetails,
      data.amount,
      data.addedDateAndTime,
      data.addedBy
    );

    const docRef = await CashinsCollection.add({ ...cashin });

    const newCashin = { id: docRef.id, ...cashin };

    broadcastCustomerChanges("CashinAdded", newCashin);

    return res
      .status(201)
      .send({ message: "Cashin created successfully", id: docRef.id });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Get all Cashins
export const getAllCashins = async (req, res) => {
  try {
    const snapshot = await CashinsCollection.get();
    const Cashins = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.status(200).send(Cashins);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Get a Cashin by ID
export const getCashinById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await CashinsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "Cashin not found" });
    }
    return res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Update a Cashin
export const updateCashin = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const doc = await CashinsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Cashin not found" });
    }

    await CashinsCollection.doc(id).update(updatedData);

    // Broadcast the updated customer to all POS systems
    const updatedCashin = { id, ...updatedData };

    broadcastCustomerChanges("CashinUpdated", updatedCashin);

    return res.status(200).send({ message: "Cashin updated successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Delete a Cashin
export const deleteCashin = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await CashinsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Cashin not found" });
    }

    await CashinsCollection.doc(id).delete();
    broadcastCustomerChanges("CashinDeleted", { id });

    return res.status(200).send({ message: "Cashin deleted successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
