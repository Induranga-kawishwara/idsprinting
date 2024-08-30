import express from "express";
import cors from "cors";
import { port } from "./config.js";
import Supplier from "./Routes/SupplierRoutes.js";
import Customer from "./Routes/CustomerRoutes.js";
import Item from "./Routes/ItemRoutes.js";
import Expenses from "./Routes/ExpensesRoutes.js";
import Cashup from "./Routes/CashupRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/customers", Customer);
app.use("/item", Item);
app.use("/suppliers", Supplier);
app.use("/expenses", Expenses);
app.use("/cashup", Cashup);

app.listen(port, () =>
  console.log(`App is listening on url http://localhost:${port}`)
);
