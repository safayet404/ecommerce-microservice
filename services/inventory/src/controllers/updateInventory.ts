import prisma from "@/prisma";
import { InventoryUpdateDTOSchema } from "@/schema";
import { Request, Response, NextFunction } from "express";
import { parse } from "path";

const updateInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    const parseBody = InventoryUpdateDTOSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: parseBody.error.issues,
      });
    }

    const lastHistory = await prisma.history.findFirst({
      where: { inventoryId: id },
      orderBy: { createdAt: "desc" },
    });

    let newQuantity = inventory.quantity;
    if (parseBody.data.actionType === "IN") {
      newQuantity += parseBody.data.quantity;
    } else if (parseBody.data.actionType === "OUT") {
      newQuantity -= parseBody.data.quantity;
    } else {
      return res.status(400).json({ message: "Invalid action type" });
    }

    const updateInventory = await prisma.inventory.update({
      where: { id },
      data: {
        quantity: newQuantity,
        histories: {
          create: {
            actionType: parseBody.data.actionType,
            quantityChanged: parseBody.data.quantity,
            lastQuantity: lastHistory?.newQuantity || 0,
            newQuantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    return res.status(200).json(updateInventory);
  } catch (error) {
    next(error);
  }
};

export default updateInventory;
