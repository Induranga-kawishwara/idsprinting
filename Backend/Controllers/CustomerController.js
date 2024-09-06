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
    if (!name || !surName || !email || !contactNumber) {
      return res.status(400).send({
        message: "Name, surname, email, and contact number are required.",
      });
    }

    // Convert name, surName, and email to lowercase for consistency
    const lowerCaseName = name.toLowerCase();
    const lowerCaseSurName = surName.toLowerCase();
    const lowerCaseEmail = email.toLowerCase();

    // Combine name and surName into a single fullName for the check
    const fullName = `${lowerCaseName} ${lowerCaseSurName}`;

    // Query for all documents where name matches the provided lowercase name
    const existingCustomerNameSnapshot = await customersCollection
      .where("name", "==", lowerCaseName)
      .get();

    // Iterate over the results and check if any full name matches
    let nameExists = false;
    existingCustomerNameSnapshot.forEach((doc) => {
      const data = doc.data();
      const existingFullName = `${data.name} ${data.surName}`;

      if (existingFullName === fullName) {
        nameExists = true;
      }
    });

    if (nameExists) {
      return res
        .status(400)
        .send({ message: "Customer with this full name already exists." });
    }

    // Check if a customer with the same email already exists
    const existingCustomerEmailSnapshot = await customersCollection
      .where("email", "==", lowerCaseEmail)
      .get();

    if (!existingCustomerEmailSnapshot.empty) {
      return res
        .status(400)
        .send({ message: "Customer with this email already exists." });
    }
    const customer = new Customer(
      lowerCaseName,
      lowerCaseSurName,
      lowerCaseEmail,
      contactNumber,
      houseNo,
      street,
      city,
      postalcode,
      customerType,
      addedDateAndTime
    );

    const docRef = await customersCollection.add({ ...customer });

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
