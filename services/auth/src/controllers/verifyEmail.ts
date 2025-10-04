import { parse } from "path";
import prisma from "@/prisma";
import { Request, Response, NextFunction } from "express";
import { AccessTokenSchema, EmailVerificationSchema } from "@/schema";
import axios from "axios";
import { EMAIL_SERVICE_URL } from "@/config";

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseBody = EmailVerificationSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({ errors: parseBody.error.issues });
    }
    const user = await prisma.user.findUnique({
      where: {
        email: parseBody.data.email,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or code" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code: parseBody.data.code,
      },
    });

    if (!verificationCode) {
      return res.status(400).json({ message: "Invalid email or code" });
    }
    if (verificationCode.expiresAt < new Date()) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    //   Update user status to verified
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verified: true,
        status: "ACTIVE",
      },
    });

    //   Update verification code status

    await prisma.verificationCode.update({
      where: {
        id: verificationCode.id,
      },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
      },
    });

    //   send success email

    await axios.post(`${EMAIL_SERVICE_URL}/emails/send`, {
      recipient: user.email,
      subject: "Email verified successfully",
      body: `Your email has been verified successfully.`,
      source: "email-verification",
    });

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

export default verifyEmail;
