import db from "../db.js";
import Customer from "../Models/Customer.js";
import { broadcastCustomerChanges } from "../SocketIO/socketIO.js";

const customersCollection = db.collection("customers");

// Create a new customer
export const createCustomer = async (req, res) => {
  const {
    name,
    surName,
    email,
    contactNumber,
    houseNo,
    street,
    city,
    postalcode,
    customerType,
    addedDateAndTime,
  } = req.body;

  try {
    // Validate fields to ensure they are not empty
    if (!name || !email || !contactNumber) {
      return res
        .status(400)
        .send({ message: "Name, email, and contact number are required." });
    }

    // Check if a customer with the same name already exists
    const existingCustomerNameSnapshot = await customersCollection
      .where("name", "==", name)
      .get();

    if (!existingCustomerNameSnapshot.empty) {
      return res
        .status(400)
        .send({ message: "Customer's name already exists." });
    }

    // Check if a customer with the same email already exists
    const existingCustomerEmailSnapshot = await customersCollection
      .where("email", "==", email)
      .get();

    if (!existingCustomerEmailSnapshot.empty) {
      return res
        .status(400)
        .send({ message: "Customer with this email already exists." });
    }

    // Check if a customer with the same contact number already exists
    const existingCustomerphoneSnapshot = await customersCollection
      .where("contactNumber", "==", contactNumber)
      .get();

    if (!existingCustomerphoneSnapshot.empty) {
      return res
        .status(400)
        .send({ message: "Customer with this contact number already exists." });
    }

    // Create a new customer object
    const customer = {
      name,
      surName,
      email,
      contactNumber,
      houseNo,
      street,
      city,
      postalcode,
      customerType,
      addedDateAndTime,
    };

    // Add customer to Firestore
    const docRef = await customersCollection.add(customer);

    // Create a response object
    const newCustomer = { id: docRef.id, ...customer };

    // Send response
    res
      .status(201)
      .send({ message: "Customer created successfully", id: docRef.id });

    // Broadcast the change (assuming broadcastCustomerChanges is defined elsewhere)
    broadcastCustomerChanges("customerAdded", newCustomer);
  } catch (error) {
    console.error("Error creating customer:", error); // Log error for debugging
    res.status(500).send({ error: error.message });
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
    const sortedCustomers = customers
      .map((customer) => ({
        ...customer,
        addedDateAndTime: new Date(customer.addedDateAndTime),
      }))
      .sort((a, b) => b.addedDateAndTime - a.addedDateAndTime);

    res.status(200).send(sortedCustomers);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get a customer by ID
export const getCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await customersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "Customer not found" });
    }
    res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Update a customer
export const updateCustomer = async (req, res) => {
  const { id } = req.params; // Get the customer ID from the URL params
  const updatedData = req.body; // The updated customer data

  try {
    // Check if the customer exists
    const doc = await customersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Update the customer in the database
    await customersCollection.doc(id).update(updatedData);

    // Respond to the API call with success
    res.status(200).json({ message: "Customer updated successfully" });

    // Broadcast the updated customer to all POS systems
    const updatedCustomer = { id, ...updatedData };
    broadcastCustomerChanges("customerUpdated", updatedCustomer);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Delete a customer
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await customersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await customersCollection.doc(id).delete();
    res.status(200).json({ message: "Customer deleted successfully" });

    // Broadcast the deleted customer ID to all POS systems
    broadcastCustomerChanges("customerDeleted", { id });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
