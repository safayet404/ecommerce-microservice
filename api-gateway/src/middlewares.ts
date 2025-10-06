import { Request, Response, NextFunction } from "express";

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers["authorization"]) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch (error) {
    next(error);
  }
};

const middlewares = { auth };

export default middlewares;
