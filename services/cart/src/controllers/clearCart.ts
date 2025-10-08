import redis from "@/redis";
import { Request, Response, NextFunction } from "express";

const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartSessionId = (req.headers["x-cart-session-id"] as string) || null;

    if (!cartSessionId) {
      return res.status(200).json({ message: "Cart is empty" });
    }

    const exists = await redis.exists(`sessions:${cartSessionId}`);

    if (!exists) {
      delete req.headers["x-cart-session-id"];
      return res.status(200).json({ message: "Cart is empty" });
    }

    await redis.del(`sessions:${cartSessionId}`);

    await redis.del(`cart:${cartSessionId}`);
    return res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
};

export default clearCart;
