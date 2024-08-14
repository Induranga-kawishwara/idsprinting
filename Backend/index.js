import express from "express";
import cors from "cors";
import { port } from "./config.js";

const app = express();

app.use(express.json());
app.use(cors());

app.listen(port, () =>
  console.log(`App is listening on url http://localhost: ${port}`)
);
