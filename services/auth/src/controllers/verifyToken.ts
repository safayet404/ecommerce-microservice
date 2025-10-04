import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AccessTokenSchema } from "../schema";
import prisma from "@/prisma";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseBody = AccessTokenSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ errors: parseBody.error.issues });
    }

    const { token } = parseBody.data;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: {
        id: (decoded as any).id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        verified: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(200).json({ message: "Authorized", user });
  } catch (error) {}
};

export default verifyToken;
