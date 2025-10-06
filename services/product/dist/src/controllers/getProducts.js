"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const getProducts = async (req, res, next) => {
    try {
        // Read query params: /products?page=2&limit=10&search=phone&minPrice=100
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const minPrice = req.query.minPrice
            ? Number(req.query.minPrice)
            : undefined;
        const maxPrice = req.query.maxPrice
            ? Number(req.query.maxPrice)
            : undefined;
        // Calculate skip/take for pagination
        const skip = (page - 1) * limit;
        // Build dynamic where filter
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
            ];
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined)
                where.price.gte = minPrice;
            if (maxPrice !== undefined)
                where.price.lte = maxPrice;
        }
        const [products, total] = await Promise.all([
            prisma_1.default.product.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    sku: true,
                    name: true,
                    price: true,
                    inventoryId: true,
                },
            }),
            prisma_1.default.product.count({ where }),
        ]);
        return res.status(200).json({
            data: products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.default = getProducts;
//# sourceMappingURL=getProducts.js.map