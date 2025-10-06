"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const controllers_1 = require("./controllers");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
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
app.get("/products", controllers_1.getProducts);
app.post("/products", controllers_1.createProduct);
app.get("/products/:id", controllers_1.getProductDetails);
//  404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});
// Errror handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res
        .status(500)
        .json({ message: "Something went wrong!", error: err.message });
});
const PORT = process.env.PORT || 4002;
const serviceName = process.env.SERVICE_NAME || "product-service";
app.listen(PORT, () => {
    console.log(`${serviceName} Service is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map