import express from "express";

import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { createUser, getUserById } from "./controllers";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).send("Inventory Service is healthy");
});

// app.use((req, res, next) => {
//   const allowOrigins = ["http://localhost:8081", "http://127.0.0.1:8081"];
//   const origin = req.headers.origin || "";
//   if (allowOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//   } else {
//     return res.status(403).json({ message: "Forbidden" });
//   }
// });

// routes

app.get("/users/:id", getUserById);
app.post("/users", createUser);

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

const PORT = process.env.PORT || 4004;
const serviceName = process.env.SERVICE_NAME || "user-service";

app.listen(PORT, () => {
  console.log(`${serviceName} Service is running on port ${PORT}`);
});
