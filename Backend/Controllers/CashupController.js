import db from "../db.js";
import Cashup from "../Models/Cashup.js";
import { broadcastCustomerChanges } from "../SocketIO/socketIO.js";

const CashupsCollection = db.collection("Cashups");

// Create a new Cashup
export const createCashup = async (req, res) => {
  const data = req.body;

  try {
    const cashup = new Cashup(
      data.reasonName,
      data.profitOrOther,
      data.reasonDetails,
      data.amount,
      data.addedDateAndTime,
      data.addedBy
    );

    const docRef = await CashupsCollection.add({ ...cashup });

    const newCashup = { id: docRef.id, ...cashup };

    broadcastCustomerChanges("CashupAdded", newCashup);

    return res
      .status(201)
      .send({ message: "Cashup created successfully", id: docRef.id });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Get all Cashups
export const getAllCashups = async (req, res) => {
  try {
    const snapshot = await CashupsCollection.get();
    const Cashups = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.status(200).send(Cashups);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Get a Cashup by ID
export const getCashupById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await CashupsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "Cashup not found" });
    }
    return res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Update a Cashup
export const updateCashup = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const doc = await CashupsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Cashup not found" });
    }

    await CashupsCollection.doc(id).update(updatedData);

    // Broadcast the updated customer to all POS systems
    const updatedCashup = { id, ...updatedData };

    broadcastCustomerChanges("CashupUpdated", updatedCashup);

    return res.status(200).send({ message: "Cashup updated successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Delete a Cashup
export const deleteCashup = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await CashupsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Cashup not found" });
    }

    await CashupsCollection.doc(id).delete();
    broadcastCustomerChanges("CashupDeleted", { id });

    return res.status(200).send({ message: "Cashup deleted successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
