import db from "../db.js";
import Product from "../Models/Product.js";
import { v4 as uuidv4 } from "uuid";

const ProductCollection = db.collection("products");

export const createProduct = async (req, res) => {
  const {
    productID,
    name,
    stock,
    stockPrice,
    otherExpenses,
    totalExpenses,
    expectedProfit,
    oneItemSellingPrice,
    revenue,
    netProfit,
  } = req.body;

  try {
    // Check if a product with the same productID or name already exists
    const existingProductSnapshot = await ProductCollection.where(
      "productID",
      "==",
      productID
    ).get();

    if (!existingProductSnapshot.empty) {
      return res
        .status(400)
        .send({ message: "Product with this ID already exists." });
    }

    const existingNameSnapshot = await ProductCollection.where(
      "name",
      "==",
      name
    ).get();

    if (!existingNameSnapshot.empty) {
      return res
        .status(400)
        .send({ message: "Product with this name already exists." });
    }

    // Create a new product if it doesn't exist
    const product = new Product(productID, name, [
      {
        id: uuidv4(),
        stock,
        stockPrice,
        otherExpenses,
        totalExpenses,
        expectedProfit,
        oneItemSellingPrice,
        revenue,
        netProfit,
        createdAt: new Date().toISOString(),
      },
    ]);

    const docRef = await ProductCollection.add({ ...product });
    res
      .status(201)
      .send({ message: "Product created successfully", id: docRef.id });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get all product
export const getProducts = async (req, res) => {
  try {
    const snapshot = await ProductCollection.get();
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get a product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await ProductCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Delete a Products
export const deleteProducts = async (req, res) => {
  const { id } = req.params;

  try {
    await ProductCollection.doc(id).delete();
    res.status(200).send({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
