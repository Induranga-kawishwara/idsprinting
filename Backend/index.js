import express from "express";
import cors from "cors";
import { port } from "./config.js";
import Supplier from "./Routes/SupplierRoutes.js";
import Customer from "./Routes/CustomerRoutes.js";
import Product from "./Routes/ProductRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/customers", Customer);
app.use("/products", Product);
app.use("/suppliers", Supplier);

app.listen(port, () =>
  console.log(`App is listening on url http://localhost:${port}`)
);
