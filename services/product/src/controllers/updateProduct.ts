import prisma from "@/prisma";
import { ProductUpdateDTOSchema } from "@/schema";
import { Request, Response, NextFunction } from "express";

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parseBody = ProductUpdateDTOSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ error: parseBody.error.issues });
    }
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({ nessage: "Product not found" });
    }

    const updateProduct = await prisma.product.update({
      where: {
        id: req.params.id,
      },
      data: parseBody.data,
    });

    return res.status(200).json({ data: updateProduct });
  } catch (error) {
    next(error);
  }
};

export default updateProduct;
