import express from "express";
import cors from "cors";
import Supplier from "./Routes/SupplierRoutes.js";
import Customer from "./Routes/CustomerRoutes.js";
import Item from "./Routes/ItemRoutes.js";
import Expenses from "./Routes/ExpensesRoutes.js";
import Cashup from "./Routes/CashupRoutes.js";
import dotenv from "dotenv";
import { app, server } from "./SocketIO/socketIO.js";
import cookieParser from "cookie-parser"; // Ensure this is imported

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

app.use("/customers", Customer);
app.use("/item", Item);
app.use("/suppliers", Supplier);
app.use("/expenses", Expenses);
app.use("/cashup", Cashup);

server.listen(PORT, () =>
  console.log(`App is listening on url http://localhost:${PORT}`)
);
