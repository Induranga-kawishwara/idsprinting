import db from "../db.js";
import { broadcastCustomerChanges } from "../SocketIO/socketIO.js";
import { v4 as uuidv4 } from "uuid";

const ItemCollection = db.collection("Categories");

export const createItem = async (req, res) => {
  const { categoryId } = req.params;
  const {
    itemCode,
    itemName,
    color,
    wholesale,
    company,
    retailPrice,
    addedDateTime,
  } = req.body;

  try {
    // Reference to the specific document within the Categories collection
    const categoryDoc = ItemCollection.doc(categoryId);
    const categorySnapshot = await categoryDoc.get();

    if (!categorySnapshot.exists) {
      return res.status(404).json({ message: "Category not found." });
    }

    const { items = [] } = categorySnapshot.data();

    const newItem = {
      itemId: uuidv4(),
      itemCode,
      itemName,
      color,
      wholesale,
      company,
      retailPrice,
      addedDateTime,
    };

    // Update the document with the new item
    await categoryDoc.update({ items: [...items, newItem] });

    return res
      .status(200)
      .json({ message: "Product added to category successfully." });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Get a product by ID
export const getCategoryAndItemDetails = async (req, res) => {
  const { categoryId, itemId } = req.params;

  try {
    const categoryRef = ItemCollection.doc(categoryId);

    const categorySnapshot = await categoryRef.get();

    if (!categorySnapshot.exists) {
      return res.status(404).json({ message: "Category not found." });
    }

    const categoryData = categorySnapshot.data();
    const { items = [], ...categoryDetails } = categoryData;

    const item = items.find((item) => item.itemId === itemId);

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found in this category." });
    }

    const result = {
      category: categoryDetails,
      item,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error retrieving category and item details:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateItemByItemId = async (req, res) => {
  const { categoryId, itemId } = req.params;
  const {
    itemCode,
    itemName,
    color,
    wholesale,
    company,
    retailPrice,
    addedDateTime,
  } = req.body;

  try {
    const categoryRef = ItemCollection.doc(categoryId);

    const categorySnapshot = await categoryRef.get();

    if (!categorySnapshot.exists) {
      return res.status(404).json({ message: "Category not found." });
    }

    const { items = [] } = categorySnapshot.data();

    const updatedItems = items.map((item) => {
      if (item.itemId === itemId) {
        return {
          ...item,
          itemCode,
          itemName,
          color,
          wholesale,
          company,
          retailPrice,
          addedDateTime,
        };
      }
      return item;
    });

    await updateDoc(categoryRef, { items: updatedItems });

    res.status(200).json({ message: "Item updated successfully." });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a Item's stock detail
export const deleteItemByItemId = async (req, res) => {
  const { categoryId, itemId } = req.params;

  try {
    const categoryRef = ItemCollection.doc(categoryId);

    const categorySnapshot = await categoryRef.get();

    if (!categorySnapshot.exists) {
      return res.status(404).json({ message: "Category not found." });
    }

    const { items = [] } = categorySnapshot.data();

    const updatedItems = items.filter((item) => item.itemId !== itemId);

    await updateDoc(categoryRef, { items: updatedItems });

    res.status(200).json({ message: "Item deleted successfully." });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: error.message });
  }
};
