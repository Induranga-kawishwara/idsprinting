import db from "../db.js";
import Cashup from "../Models/Cashup.js";

const CashupsCollection = db.collection("Cashups");

// Create a new Cashup
export const createCashup = async (req, res) => {
  const { reasonName, profitOrOther, details, amount } = req.body;

  try {
    const cashup = new Cashup(reasonName, profitOrOther, details, amount);

    const docRef = await CashupsCollection.add({ ...cashup });
    res
      .status(201)
      .send({ message: "Cashup created successfully", id: docRef.id });
  } catch (error) {
    res.status(500).send({ error: error.message });
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
    res.status(200).send(Cashups);
  } catch (error) {
    res.status(500).send({ error: error.message });
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
    res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Update a Cashup
export const updateCashup = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    await CashupsCollection.doc(id).update(updatedData);
    res.status(200).send({ message: "Cashup updated successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Delete a Cashup
export const deleteCashup = async (req, res) => {
  const { id } = req.params;

  try {
    await CashupsCollection.doc(id).delete();
    res.status(200).send({ message: "Cashup deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
