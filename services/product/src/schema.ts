import { Status } from "@prisma/client";
import { z } from "zod";

export const ProductCreateDTOSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().min(1).max(10),
  description: z.string().max(1000).optional(),
  price: z.number().optional().default(0),
  status: z.nativeEnum(Status).optional().default(Status.DRAFT),
});

export const ProductUpdateDTOSchema = ProductCreateDTOSchema.omit({
  sku: true,
}).partial();
