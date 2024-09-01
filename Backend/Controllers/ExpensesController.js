import db from "../db.js";
import Expenses from "../Models/Expenses.js";

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
    res
      .status(201)
      .send({ message: "Expenses created successfully", id: docRef.id });
  } catch (error) {
    res.status(500).send({ error: error.message });
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

    // Convert `dateAndTime` to Date objects and sort expenses by date and time in descending order
    const sortedExpenses = expenses
      .map((expense) => ({
        ...expense,
        dateAndTime: new Date(expense.dateAndTime),
      }))
      .sort((a, b) => b.dateAndTime - a.dateAndTime) // Sort by descending date
      .map((expense) => ({
        ...expense,
        dateAndTime: expense.dateAndTime.toISOString(), // Optional: For consistent formatting
        addedDate: expense.dateAndTime.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        addedTime: expense.dateAndTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

    res.status(200).send(sortedExpenses);
  } catch (error) {
    res.status(500).send({ error: error.message });
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
    res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Update a Expenses
export const updateExpenses = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    await ExpensessCollection.doc(id).update(updatedData);
    res.status(200).send({ message: "Expenses updated successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Delete a Expenses
export const deleteExpenses = async (req, res) => {
  const { id } = req.params;

  try {
    await ExpensessCollection.doc(id).delete();
    res.status(200).send({ message: "Expenses deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
