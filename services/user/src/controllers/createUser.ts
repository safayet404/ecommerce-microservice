import prisma from "@/prisma";
import { UserCreateSchema } from "@/schema";
import { Request, Response, NextFunction } from "express";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseBody = UserCreateSchema.safeParse(req.body);

    if (!parseBody.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parseBody.error.issues,
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { authUserId: parseBody.data.authUserId },
    });

    if (existingUser) {
      return res.status(404).json({
        message: "User with this authUserId already exists",
      });
    }

    const user = await prisma.user.create({
      data: parseBody.data,
    });

    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export default createUser;
