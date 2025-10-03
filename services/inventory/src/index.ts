import express from "express";

import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { createInventory, updateInventory } from "./controllers";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).send("Inventory Service is healthy");
});

// routes

app.put("/inventories/:id", updateInventory);
app.post("/inventories", createInventory);

//  404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Errror handler

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: err.message });
  }
);

const PORT = process.env.PORT || 3000;
const serviceName = process.env.SERVICE_NAME || "inventory-service";

app.listen(PORT, () => {
  console.log(`${serviceName} Service is running on port ${PORT}`);
});
