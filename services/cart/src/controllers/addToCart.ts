import { NextFunction, Request, Response } from "express";

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (error) {
    next(error);
  }
};

export default addToCart;
