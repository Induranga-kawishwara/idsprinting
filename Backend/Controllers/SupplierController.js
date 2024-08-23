import db from "../db.js";
import Supplier from "../Models/Suppliers.js";

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
    postalcode,
    businessId,
    additionalData,
  } = req.body;

  try {
    // Check if a product with the same productID or name already exists
    const existingSupplierNameSnapshot = await suppliersCollection
      .where("name", "==", name)
      .get();

    if (!existingSupplierNameSnapshot.empty) {
      return res
        .status(400)
        .send({ message: "Supplier's name is already exists." });
    }

    const existingSupplierEmailSnapshot = await suppliersCollection
      .where("email", "==", email)
      .get();

    if (!existingSupplierEmailSnapshot.empty) {
      return res
        .status(400)
        .send({ message: "Supplier with this email already exists." });
    }

    const existingSupplierphoneSnapshot = await suppliersCollection
      .where("contactNumber", "==", contactNumber)
      .get();

    if (!existingSupplierphoneSnapshot.empty) {
      return res
        .status(400)
        .send({ message: "Supplier with this Contact Number already exists." });
    }

    const supplier = new Supplier(
      name,
      email,
      contactNumber,
      address1,
      address2,
      city,
      postalcode,
      businessId,
      additionalData
    );

    const docRef = await suppliersCollection.add({ ...supplier });
    res
      .status(201)
      .send({ message: "Supplier created successfully", id: docRef.id });
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
    await suppliersCollection.doc(id).update(updatedData);
    res.status(200).send({ message: "Supplier updated successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Delete a Supplier
export const deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    await suppliersCollection.doc(id).delete();
    res.status(200).send({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
