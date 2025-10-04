import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: Number(process.env.SMTP_PORT),
});

export const defaultSender =
  process.env.DEFAULT_SENDER_EMAIL || "admin@example.com";
