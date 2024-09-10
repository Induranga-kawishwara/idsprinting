import db from "../db.js";
import Category from "../Models/Categories.js";
import { broadcastCustomerChanges } from "../SocketIO/socketIO.js";

const CategoriesCollection = db.collection("Categories");

// Create a new Category
export const createCategory = async (req, res) => {
  const {
    rawMaterialName,
    size,
    thickness,
    qty,
    supplier,
    company,
    buyingPrice,
    addedBy,
    dateAndTime,
  } = req.body;

  try {
    // Validate fields to ensure they are not empty
    if (!rawMaterialName) {
      return res.status(400).send({
        message: "Raw Material Name is required.",
      });
    }

    // Convert name to lowercase for consistency
    const lowerCaseName = rawMaterialName.toLowerCase();

    // Query for all documents where name matches the provided lowercase name
    const existingCategoryNameSnapshot = await CategoriesCollection.where(
      "rawMaterialName",
      "==",
      lowerCaseName
    ).get();

    if (!existingCategoryNameSnapshot.empty) {
      return res.status(400).send({ message: "Category name already exists." });
    }

    const category = new Category(
      lowerCaseName,
      size,
      thickness,
      qty,
      supplier,
      company,
      buyingPrice,
      addedBy,
      dateAndTime
    );

    const docRef = await CategoriesCollection.add({ ...category });

    // Create a response object
    const newCategory = { id: docRef.id, ...category };

    broadcastCustomerChanges("CategoryAdded", newCategory);

    return res
      .status(201)
      .send({ message: "Category created successfully", id: docRef.id });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get all Categories
export const getAllCategories = async (req, res) => {
  try {
    const snapshot = await CategoriesCollection.get();
    const Categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const sortedCategory = Categories.map((category) => ({
      ...category,
      dateAndTime: new Date(category.dateAndTime),
    })).sort((a, b) => b.dateAndTime - a.dateAndTime);

    return res.status(200).send(sortedCategory);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Get a Category by ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await CategoriesCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "Category not found" });
    }
    return res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Update a Category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const doc = await CategoriesCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update the customer in the database
    await CategoriesCollection.doc(id).update(updatedData);

    // Broadcast the updated customer to all POS systems
    const updatedCategory = { id, ...updatedData };
    broadcastCustomerChanges("CategoryUpdated", updatedCategory);
    return res.status(200).send({ message: "Category updated successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Delete a Category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await CategoriesCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Category not found" });
    }

    await CategoriesCollection.doc(id).delete();

    // Broadcast the deleted customer ID to all POS systems
    broadcastCustomerChanges("CategoryDeleted", { id });
    return res.status(200).send({ message: "Category deleted successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
