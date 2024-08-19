import db from "../db.js";
import Customer from "../Models/Customer.js";

const customersCollection = db.collection("customers");

// Create a new customer
export const createCustomer = async (req, res) => {
  const { name, contactInfo, purchaseHistory } = req.body;
  const customer = new Customer(name, contactInfo, purchaseHistory);

  try {
    const docRef = await customersCollection.add({ ...customer });
    res
      .status(201)
      .json({ message: "Customer created successfully", id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const snapshot = await customersCollection.get();
    const customers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a customer by ID
export const getCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await customersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a customer
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    await customersCollection.doc(id).update(updatedData);
    res.status(200).json({ message: "Customer updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a customer
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    await customersCollection.doc(id).delete();
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
