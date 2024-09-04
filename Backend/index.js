// index.js
import express from "express";
import cors from "cors";
import http from "http";
import { initializeSocket } from "./socket.js"; // Import the function to initialize Socket.io
import Supplier from "./Routes/SupplierRoutes.js";
import Customer from "./Routes/CustomerRoutes.js";
import Item from "./Routes/ItemRoutes.js";
import Expenses from "./Routes/ExpensesRoutes.js";
import Cashup from "./Routes/CashupRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

app.use(express.json());
app.use(cors());

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
