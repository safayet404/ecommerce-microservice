import prisma from "@/prisma";
import { EmailCreateSchema } from "@/schema";
import { Request, Response, NextFunction } from "express";
import { defaultSender, transporter } from "@/config";

const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedBody = EmailCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.issues });
    }

    const { sender, recipient, subject, body, source } = parsedBody.data;
    const from = sender || defaultSender;
    const emailOption = {
      from,
      to: recipient,
      subject,
      text: body,
    };

    //   send the mail

    const { rejected } = await transporter.sendMail(emailOption);

    if (rejected.length > 0) {
      console.log(rejected);

      return res.status(500).json({ message: "Failed to send email" });
    }
    await prisma.email.create({
      data: {
        sender: from,
        recipient,

        subject,
        body,
        soruce: source,
      },
    });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    next(error);
  }
};

export default sendEmail;
