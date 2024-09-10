import db from "../db.js";
import Expenses from "../Models/Expenses.js";
import { broadcastCustomerChanges } from "../SocketIO/socketIO.js";

const ExpensessCollection = db.collection("Expenses");

// Create a new Expenses
export const createExpenses = async (req, res) => {
  const {
    expensesname,
    expensesType,
    supplier,
    other,
    description,
    amount,
    paymentMethod,
    bankTranferNum,
    chequeNum,
    invoiceNumber,
    dateAndTime,
    image,
  } = req.body;

  try {
    const expenses = new Expenses(
      expensesname,
      expensesType,
      supplier,
      other,
      description,
      amount,
      paymentMethod,
      bankTranferNum,
      chequeNum,
      invoiceNumber,
      dateAndTime,
      image
    );

    const docRef = await ExpensessCollection.add({ ...expenses });
    const newExpenses = { id: docRef.id, ...expenses };

    broadcastCustomerChanges("expensesAdded", newExpenses);

    return res
      .status(201)
      .send({ message: "Expenses created successfully", id: docRef.id });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Get all Expensess
export const getAllExpensess = async (req, res) => {
  try {
    const snapshot = await ExpensessCollection.get();
    const expenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const sortedExpenses = expenses
      .map((expense) => ({
        ...expense,
        dateAndTime: new Date(expense.dateAndTime),
      }))
      .sort((a, b) => b.dateAndTime - a.dateAndTime);
    return res.status(200).send(sortedExpenses);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Get a Expenses by ID
export const getExpensesById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await ExpensessCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "Expenses not found" });
    }
    return res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Update a Expenses
export const updateExpenses = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    // Check if the customer exists
    const doc = await ExpensessCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Expenses not found" });
    }

    await ExpensessCollection.doc(id).update(updatedData);

    const updatedExpensess = { id, ...updatedData };
    broadcastCustomerChanges("expensessUpdated", updatedExpensess);

    return res.status(200).send({ message: "Expenses updated successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Delete a Expenses
export const deleteExpenses = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const doc = await ExpensessCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Expenses not found" });
    }

    await ExpensessCollection.doc(id).delete();

    broadcastCustomerChanges("expensesDeleted", { id });

    return res.status(200).send({ message: "Expenses deleted successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
