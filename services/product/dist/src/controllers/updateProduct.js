"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schema_1 = require("@/schema");
const updateProduct = async (req, res, next) => {
    try {
        const parseBody = schema_1.ProductUpdateDTOSchema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({ error: parseBody.error.issues });
        }
        const product = await prisma_1.default.product.findUnique({
            where: { id: req.params.id },
        });
        if (!product) {
            return res.status(404).json({ nessage: "Product not found" });
        }
        const updateProduct = await prisma_1.default.product.update({
            where: {
                id: req.params.id,
            },
            data: parseBody.data,
        });
        return res.status(200).json({ data: updateProduct });
    }
    catch (error) {
        next(error);
    }
};
exports.default = updateProduct;
//# sourceMappingURL=updateProduct.js.map