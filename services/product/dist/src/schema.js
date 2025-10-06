"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductUpdateDTOSchema = exports.ProductCreateDTOSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.ProductCreateDTOSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    sku: zod_1.z.string().min(1).max(10),
    description: zod_1.z.string().max(1000).optional(),
    price: zod_1.z.number().optional().default(0),
    status: zod_1.z.nativeEnum(client_1.Status).optional().default(client_1.Status.DRAFT),
});
exports.ProductUpdateDTOSchema = exports.ProductCreateDTOSchema.omit({
    sku: true,
}).partial();
//# sourceMappingURL=schema.js.map