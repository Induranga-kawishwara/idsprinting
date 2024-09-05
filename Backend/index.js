import express from "express";
import cors from "cors";
import Supplier from "./Routes/SupplierRoutes.js";
import Customer from "./Routes/CustomerRoutes.js";
import Item from "./Routes/ItemRoutes.js";
import Expenses from "./Routes/ExpensesRoutes.js";
import Cashup from "./Routes/CashupRoutes.js";
import dotenv from "dotenv";
import { app, server } from "./SocketIO/socketIO.js";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Set up CORS to allow requests from your frontend
app.use(
  cors({
    origin: "*", // Make sure this is the correct origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

// Define your routes
app.use("/customers", Customer);
app.use("/item", Item);
app.use("/suppliers", Supplier);
app.use("/expenses", Expenses);
app.use("/cashup", Cashup);

// Start the server
server.listen(PORT, () =>
  console.log(`App is listening on http://localhost:${PORT}`)
);
