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
      return res.status(404).send({ message: "Category not found." });
    }

    const { items = [], ...categoryDetails } = categorySnapshot.data();

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

    const result = {
      category: { id: categoryId, ...categoryDetails },
      newItem,
    };

    broadcastCustomerChanges("ItemAdded", result);

    return res
      .status(200)
      .send({ message: "Item added to category successfully." });
  } catch (error) {
    console.error("Error adding Item:", error);
    return res.status(500).send({ error: error.message });
  }
};

// Get a Item by ID
export const getCategoryAndItemDetails = async (req, res) => {
  const { categoryId, itemId } = req.params;

  try {
    const categoryRef = ItemCollection.doc(categoryId);

    const categorySnapshot = await categoryRef.get();

    if (!categorySnapshot.exists) {
      return res.status(404).send({ message: "Category not found." });
    }

    const categoryData = categorySnapshot.data();
    const { items = [], ...categoryDetails } = categoryData;

    const item = items.find((item) => item.itemId === itemId);

    if (!item) {
      return res
        .status(404)
        .send({ message: "Item not found in this category." });
    }

    const result = {
      category: { categoryId, ...categoryDetails },
      item,
    };

    return res.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving category and item details:", error);
    return res.status(500).send({ error: error.message });
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
      return res.status(404).send({ message: "Category not found." });
    }

    const { items = [], ...categoryDetails } = categorySnapshot.data();

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

    await categoryRef.update({ items: updatedItems });

    const result = {
      category: categoryDetails,
      item: {
        itemId,
        itemCode,
        itemName,
        color,
        wholesale,
        company,
        retailPrice,
        addedDateTime,
      },
    };

    broadcastCustomerChanges("ItemUpdated", result);

    // await updateDoc(categoryRef, { items: updatedItems });

    return res.status(200).send({ message: "Item updated successfully." });
  } catch (error) {
    console.error("Error updating item:", error);
    return res.status(500).send({ error: error.message });
  }
};

export const deleteAndUpdate = async (req, res) => {
  const { prevCategoryId, newCategoryId, itemId } = req.params;
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
    // Get both previous and new category snapshots in parallel
    const [prevCategorySnapshot, newCategorySnapshot] = await Promise.all([
      ItemCollection.doc(prevCategoryId).get(),
      ItemCollection.doc(newCategoryId).get(),
    ]);

    // Check if new category exists
    if (!newCategorySnapshot.exists) {
      return res.status(404).send({ message: "New category not found." });
    }

    // Check if previous category exists
    if (!prevCategorySnapshot.exists) {
      return res.status(404).send({ message: "Previous category not found." });
    }

    // Extract items from the new category and prepare the new item object
    const newCategoryData = newCategorySnapshot.data();
    const { items: newCategoryItems = [], ...categoryDetails } =
      newCategoryData;

    const newItem = {
      itemId,
      itemCode,
      itemName,
      color,
      wholesale,
      company,
      retailPrice,
      addedDateTime,
    };

    // Update the new category by adding the new item
    await ItemCollection.doc(newCategoryId).update({
      items: [...newCategoryItems, newItem],
    });

    const result = {
      category: { newCategoryId, ...categoryDetails },
      newItem,
    };

    // Extract items from the previous category and filter out the deleted item
    const { items: prevCategoryItems = [] } = prevCategorySnapshot.data();
    const updatedPrevItems = prevCategoryItems.filter(
      (item) => item.itemId !== itemId
    );

    // Update the previous category by removing the item
    await ItemCollection.doc(prevCategoryId).update({
      items: updatedPrevItems,
    });

    broadcastCustomerChanges("ItemUpdated", result);

    return res.status(200).send({
      message: "Item moved and updated successfully.",
      newCategory: { id: newCategoryId, ...newCategoryData },
      newItem,
    });
  } catch (error) {
    console.error("Error updating and deleting item:", error);
    return res.status(500).send({ error: error.message });
  }
};

// Delete a Item's stock detail
export const deleteItemByItemId = async (req, res) => {
  const { categoryId, itemId } = req.params;

  try {
    const categoryRef = ItemCollection.doc(categoryId);

    const categorySnapshot = await categoryRef.get();

    if (!categorySnapshot.exists) {
      return res.status(404).send({ message: "Category not found." });
    }

    const { items = [] } = categorySnapshot.data();

    const updatedItems = items.filter((item) => item.itemId !== itemId);

    // await updateDoc(categoryRef, { items: updatedItems });
    await categoryRef.update({ items: updatedItems });
    console.log(itemId);

    broadcastCustomerChanges("ItemDeleted", { itemId });

    return res.status(200).send({ message: "Item deleted successfully." });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res.status(500).send({ error: error.message });
  }
};
