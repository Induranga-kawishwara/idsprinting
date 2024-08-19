import express from "express";
import cors from "cors";
import { port } from "./config.js";
import Customer from "./Routes/CustomerRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/customers", Customer);

app.listen(port, () =>
  console.log(`App is listening on url http://localhost:${port}`)
);
