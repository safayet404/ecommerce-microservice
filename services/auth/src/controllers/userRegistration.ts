import axios from "axios";
import prisma from "@/prisma";
import { UserCreateSchema } from "@/schema";
import { Request, Response, NextFunction } from "express";

import bcrypt from "bcryptjs";
import { EMAIL_SERVICE_URL, USER_SERVICE } from "@/config";

const generateVerificationCode = () => {
  const timestamp = Date.now().toString();
  const ramdomNum = Math.floor(10 + Math.random() * 90);

  let code = (timestamp + ramdomNum).slice(-5);

  return code;
};

const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parseBody = UserCreateSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.json(400).json({ errors: parseBody.error.issues });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: parseBody.data.email,
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exist with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parseBody.data.password, salt);

    const user = await prisma.user.create({
      data: {
        ...parseBody.data,
        password: hashedPassword,
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

    console.log("user created", user);

    //   Create the user profile by calling user service

    await axios.post(`${USER_SERVICE}/users`, {
      authUserId: user.id,
      name: user.name,
      email: user.email,
    });

    const code = generateVerificationCode();
    await prisma.verificationCode.create({
      data: {
        code,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      },
    });

    await axios.post(`${EMAIL_SERVICE_URL}/emails/send`, {
      recipient: user.email,
      subject: "Verify your email",
      body: `Your verification code is ${code}. It will expire in 24 hours.`,
      source: "user-registration",
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", user });
  } catch (error) {
    next(error);
  }
};

export default userRegistration;
