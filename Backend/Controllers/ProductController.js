import db from "../db.js";
import Product from "../Models/Product.js";
import { v4 as uuidv4 } from "uuid";

const ProductCollection = db.collection("products");

export const createProduct = async (req, res) => {
  const {
    productID,
    name,
    image,
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
    const product = new Product(productID, name, image, [
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

export const getstockdetailsById = async (req, res) => {
  const { id, detailId } = req.params;

  try {
    const doc = await ProductCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "Product not found" });
    }

    const productData = doc.data();

    // If a specific detailId is provided, find the corresponding detail
    if (detailId) {
      const matchingDetail = productData.details.find(
        (detail) => detail.id === detailId
      );

      if (!matchingDetail) {
        return res.status(404).send({ message: "Detail not found" });
      }

      return res.status(200).send({ detail: matchingDetail });
    }

    // If no detailId is provided, return the entire product
    res.status(200).send({ id: doc.id, ...productData });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const updateStockDetailById = async (req, res) => {
  const { id, detailId } = req.params;
  const updatedDetail = req.body;

  try {
    const doc = await ProductCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "Product not found" });
    }

    const productData = doc.data();

    const detailIndex = productData.details.findIndex(
      (detail) => detail.id === detailId
    );

    if (detailIndex === -1) {
      return res.status(404).send({ message: "Detail not found" });
    }

    productData.details[detailIndex] = {
      ...productData.details[detailIndex],
      ...updatedDetail,
      updatedAt: new Date().toISOString(),
    };

    // Save the updated product data back to Firestore
    await ProductCollection.doc(id).update(productData);

    res.status(200).send({ message: "Detail updated successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Delete a Product's stock detail
export const deleteProductsStock = async (req, res) => {
  const { id, detailId } = req.params;

  try {
    const doc = await ProductCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "Product not found" });
    }

    const productData = doc.data();

    const detailIndex = productData.details.findIndex(
      (detail) => detail.id === detailId
    );

    if (detailIndex === -1) {
      return res.status(404).send({ message: "Detail not found" });
    }

    productData.details.splice(detailIndex, 1);

    await ProductCollection.doc(id).update({ details: productData.details });

    res.status(200).send({ message: "Detail deleted successfully" });
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
