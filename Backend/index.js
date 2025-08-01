import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Supplier from "./Routes/SupplierRoutes.js";
import Customer from "./Routes/CustomerRoutes.js";
import Item from "./Routes/ItemRoutes.js";
import Expenses from "./Routes/ExpensesRoutes.js";
import Cashup from "./Routes/CashupRoutes.js";
import dotenv from "dotenv";
import { app, server } from "./SocketIO/socketIO.js";
import Categories from "./Routes/CategoryRoutes.js";
import User from "./Routes/UserRoutes.js";
import Payment from "./Routes/PaymentRoutes.js";
import Cashin from "./Routes/CashinRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

app.use("/customers", Customer);
app.use("/items", Item);
app.use("/suppliers", Supplier);
app.use("/expenses", Expenses);
app.use("/cashup", Cashup);
app.use("/cashin", Cashin);
app.use("/categories", Categories);
app.use("/users", User);
app.use("/payment", Payment);

server.listen(PORT, () =>
  console.log(`App is listening on url http://localhost:${PORT}`)
);
