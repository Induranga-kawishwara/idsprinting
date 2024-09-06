import db from "../db.js";
import Supplier from "../Models/Suppliers.js";
import { broadcastCustomerChanges } from "../SocketIO/socketIO.js";

const suppliersCollection = db.collection("suppliers");

// Create a new Supplier
export const createSupplier = async (req, res) => {
  const {
    name,
    email,
    contactNumber,
    address1,
    address2,
    city,
    postalCode,
    businessId,
    additionalData,
  } = req.body;

  try {
    // Validate fields to ensure they are not empty
    if (!name || !contactNumber) {
      return res.status(400).send({
        message: "Name  and contact number are required.",
      });
    }

    // Convert name and email to lowercase for consistency
    const lowerCaseName = name.toLowerCase();
    const lowerCaseEmail = email ? email.toLowerCase() : " ";

    // Query for all documents where name matches the provided lowercase name
    const existingSupplierNameSnapshot = await suppliersCollection
      .where("name", "==", lowerCaseName)
      .get();

    if (!existingSupplierNameSnapshot.empty) {
      return res.status(400).send({ message: "Supplier name already exists." });
    }

    const supplier = new Supplier(
      lowerCaseName,
      lowerCaseEmail,
      contactNumber,
      address1,
      address2,
      city,
      postalCode,
      businessId,
      additionalData
    );

    const docRef = await suppliersCollection.add({ ...supplier });

    // Create a response object
    const newSupplier = { id: docRef.id, ...supplier };

    res
      .status(201)
      .send({ message: "Supplier created successfully", id: docRef.id });
    broadcastCustomerChanges("supplierAdded", newSupplier);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get all Suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const snapshot = await suppliersCollection.get();
    const Suppliers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).send(Suppliers);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get a Supplier by ID
export const getSupplierById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await suppliersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "Supplier not found" });
    }
    res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Update a Supplier
export const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const doc = await suppliersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Update the customer in the database
    await suppliersCollection.doc(id).update(updatedData);
    res.status(200).send({ message: "Supplier updated successfully" });

    // Broadcast the updated customer to all POS systems
    const updatedSupplier = { id, ...updatedData };
    broadcastCustomerChanges("supplierUpdated", updatedSupplier);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Delete a Supplier
export const deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await suppliersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await suppliersCollection.doc(id).delete();
    res.status(200).send({ message: "Supplier deleted successfully" });

    // Broadcast the deleted customer ID to all POS systems
    broadcastCustomerChanges("supplierDeleted", { id });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
