// controller.js
import db from "../db.js";
import Customer from "../Models/Customer.js";
import { getSocket } from "../socket.js"; // Import the function to get the Socket.io instance

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
    // Check if a customer with the same name, email, or contactNumber already exists
    const existingCustomerNameSnapshot = await customersCollection
      .where("name", "==", name)
      .get();

    if (!existingCustomerNameSnapshot.empty) {
      return res
        .status(400)
        .send({ message: "Customer's name already exists." });
    }

    const existingCustomerEmailSnapshot = await customersCollection
      .where("email", "==", email)
      .get();

    if (!existingCustomerEmailSnapshot.empty) {
      return res
        .status(400)
        .send({ message: "Customer with this email already exists." });
    }

    const existingCustomerPhoneSnapshot = await customersCollection
      .where("contactNumber", "==", contactNumber)
      .get();

    if (!existingCustomerPhoneSnapshot.empty) {
      return res
        .status(400)
        .send({ message: "Customer with this contact number already exists." });
    }

    const customer = new Customer(
      name,
      surName,
      email,
      contactNumber,
      houseNo,
      street,
      city,
      postalcode,
      customerType,
      addedDateAndTime
    );

    const docRef = await customersCollection.add({ ...customer });
    const newCustomer = { id: docRef.id, ...customer };

    // Emit event to all connected clients
    getSocket().emit("customerAdded", newCustomer);

    res
      .status(201)
      .send({ message: "Customer created successfully", id: docRef.id });
  } catch (error) {
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
  const { id } = req.params;
  const updatedData = req.body;

  try {
    await customersCollection.doc(id).update(updatedData);
    const updatedCustomer = { id, ...updatedData };

    // Emit event to all connected clients
    getSocket().emit("customerUpdated", updatedCustomer);

    res.status(200).send({ message: "Customer updated successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Delete a customer
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    await customersCollection.doc(id).delete();

    // Emit event to all connected clients
    getSocket().emit("customerDeleted", id);

    res.status(200).send({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
