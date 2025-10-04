import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { EmailCreateSchema } from "@/schema";
import { defaultSender, transporter } from "@/config";

const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate the request body
    const parsedBody = EmailCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      console.error("EmailCreateSchema errors:", parsedBody.error.flatten());
      return res.status(400).json({ errors: parsedBody.error.issues });
    }

    // create mail option
    const { sender, recipient, subject, body, source } = parsedBody.data;
    const from = sender || defaultSender;
    const emailOption = {
      from,
      to: recipient,
      subject,
      text: body,
    };

    // send the email
    const { rejected } = await transporter.sendMail(emailOption);
    if (rejected.length) {
      console.log("Email rejected: ", rejected);
      return res.status(500).json({ message: "Failed" });
    }

    await prisma.email.create({
      data: {
        sender: from,
        recipient,
        subject,
        body,
        soruce: source || "unknown",
      },
    });

    return res.status(200).json({ message: "Email sent" });
  } catch (error) {
    next(error);
  }
};

export default sendEmail;
