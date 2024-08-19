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
    },
  ]);

  try {
    const docRef = await ProductCollection.add({ ...product });
    res
      .status(201)
      .json({ message: "Product created successfully", id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
