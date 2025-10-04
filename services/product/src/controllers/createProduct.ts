import { INVENTORY_URL } from "@/config";
import prisma from "@/prisma";
import { ProductCreateDTOSchema } from "@/schema";
import axios from "axios";

import { NextFunction, Request, Response } from "express";

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parseBody = ProductCreateDTOSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parseBody.error.issues,
      });
    }

    const exisitngProduct = await prisma.product.findFirst({
      where: {
        name: parseBody.data.sku,
      },
    });

    if (exisitngProduct) {
      return res.status(409).json({
        message: "Product with this SKU already exists",
      });
    }

    const product = await prisma.product.create({
      data: parseBody.data,
    });
    console.log("Product created successfully", product.id);
    const { data: inventory } = await axios.post(
      `${INVENTORY_URL}/inventories`,
      {
        productId: product.id,
        sku: product.sku,
      }
    );
    console.log("Inventory created successfully", inventory.id);

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        inventoryId: inventory.id,
      },
    });
    console.log("Product updated successfully with inventoryId", inventory.id);

    res.status(201).json({ ...product, inventoryId: inventory.id });
  } catch (error) {
    next(error);
  }
};

export default createProduct;
