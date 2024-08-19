import db from "../db.js";
import Product from "../Models/Product.js";

const ProductCollection = db.collection("products");

// Create a new product
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

  const product = new Product(productID, name, [
    {
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

  try {
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
