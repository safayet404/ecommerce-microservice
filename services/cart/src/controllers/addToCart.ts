import axios from "axios";
import { CART_TTL, INVENTORY_SERVICE } from "@/config";
import redis from "@/redis";
import { CartItemSchema } from "@/schema";
import { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid";

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseBody = CartItemSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ error: parseBody.error.issues });
    }

    let cartSessionId = (req.headers["x-cart-session-id"] as string) || null;

    if (cartSessionId) {
      const exists = await redis.exists(`sessions:${cartSessionId}`);
      console.log("session exists", exists);

      if (!exists) {
        cartSessionId = null;
      }
    }

    if (!cartSessionId) {
      cartSessionId = uuid();
      console.log("new session id", cartSessionId);

      await redis.setex(`sessions:${cartSessionId}`, CART_TTL, cartSessionId);
      res.setHeader("x-cart-session-id", cartSessionId);
    }

    const { data } = await axios.get(
      `${INVENTORY_SERVICE}/inventories/${parseBody.data.inventoryId}`
    );

    if (Number(data.quantity) < parseBody.data.quantity) {
      return res.status(400).json({ message: "Inventory not availabe" });
    }

    await redis.hset(
      `cart:${cartSessionId}`,
      parseBody.data.productId,
      JSON.stringify({
        inventoryId: parseBody.data.inventoryId,
        quantity: parseBody.data.quantity,
      })
    );
    await axios.put(
      `${INVENTORY_SERVICE}/inventories/${parseBody.data?.inventoryId}`,
      {
        quantity: parseBody.data.quantity,
        actionType: "OUT",
      }
    );

    return res.status(200).json({ message: "Item add to cart", cartSessionId });
  } catch (error) {
    next(error);
  }
};

export default addToCart;
