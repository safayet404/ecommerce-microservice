"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@/config");
const prisma_1 = __importDefault(require("@/prisma"));
const schema_1 = require("@/schema");
const axios_1 = __importDefault(require("axios"));
const createProduct = async (req, res, next) => {
    try {
        const parseBody = schema_1.ProductCreateDTOSchema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({
                message: "Invalid request body",
                errors: parseBody.error.issues,
            });
        }
        const exisitngProduct = await prisma_1.default.product.findFirst({
            where: {
                name: parseBody.data.sku,
            },
        });
        if (exisitngProduct) {
            return res.status(409).json({
                message: "Product with this SKU already exists",
            });
        }
        const product = await prisma_1.default.product.create({
            data: parseBody.data,
        });
        console.log("Product created successfully", product.id);
        const { data: inventory } = await axios_1.default.post(`${config_1.INVENTORY_URL}/inventories`, {
            productId: product.id,
            sku: product.sku,
        });
        console.log("Inventory created successfully", inventory.id);
        await prisma_1.default.product.update({
            where: {
                id: product.id,
            },
            data: {
                inventoryId: inventory.id,
            },
        });
        console.log("Product updated successfully with inventoryId", inventory.id);
        res.status(201).json({ ...product, inventoryId: inventory.id });
    }
    catch (error) {
        next(error);
    }
};
exports.default = createProduct;
//# sourceMappingURL=createProduct.js.map