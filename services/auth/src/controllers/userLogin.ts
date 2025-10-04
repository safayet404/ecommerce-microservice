import prisma from "@/prisma";
import { UserLoginSchema } from "@/schema";
import { LoginAttempt } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type LoginHistory = {
  userId: string;
  userAgent: string | undefined;
  ipAddress: string | undefined;
  attempt: LoginAttempt;
};

const createLoginHistory = async (info: LoginHistory) => {
  await prisma.loginHistoryy.create({
    data: {
      userId: info.userId,
      userAgent: info.userAgent,
      ipAddress: info.ipAddress,
      attempt: info.attempt,
    },
  });
};

const userLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ipAddress =
      (req.headers["x-forwarded-for"] as string) || req.ip || "";
    const userAgent = req.headers["user-agent"] || "";
    const parseBody = UserLoginSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.json(400).json({ errors: parseBody.error.issues });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: parseBody.data.email,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    //   Compare Password

    const isMatch = await bcrypt.compare(
      parseBody.data.password,
      user.password
    );

    if (!isMatch) {
      await createLoginHistory({
        userId: user.id,
        userAgent,
        ipAddress,
        attempt: "FAILURE",
      });
      return res.status(400).json({ message: "invalid credentials" });
    }
    if (!user.verified) {
      await createLoginHistory({
        userId: user.id,
        userAgent,
        ipAddress,
        attempt: "FAILURE",
      });
      return res.status(400).json({ message: "User is not verified" });
    }
    if (user.status !== "ACTIVE") {
      await createLoginHistory({
        userId: user.id,
        userAgent,
        ipAddress,
        attempt: "FAILURE",
      });
      return res.status(400).json({
        message: `Your account is ${user.status.toLocaleLowerCase()}`,
      });
    }

    //   generate token access token

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role, // optional if you have roles
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "2h",
    });

    await createLoginHistory({
      userId: user.id,
      userAgent,
      ipAddress,
      attempt: "SUCCESS",
    });

    return res.status(200).json({
      token,
    });
  } catch (error) {
    next(error);
  }
};

export default userLogin;
