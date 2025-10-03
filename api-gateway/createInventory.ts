import { Request, Response, NextFunction } from "express";

import prisma from "@/prisma";
import { InventoryCreateDTOSchema } from "@/schema";

const createInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parseBody = InventoryCreateDTOSchema.safeParse(req.body);

    if (!parseBody.success) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: parseBody.error.issues,
      });
    }

    //   Create Inventory

    const inventory = await prisma.inventory.upsert({
      where: { sku: parseBody.data.sku },
      update: {},
      create: {
        ...parseBody.data,
        histories: {
          create: {
            actionType: "IN",
            quantityChanged: parseBody.data.quantity,
            lastQuantity: 0,
            newQuantity: parseBody.data.quantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    return res.status(201).json(inventory);
  } catch (error) {
    next(error);
  }
};

export default createInventory;
