import amqp from "amqplib";
import { defaultSender, transporter } from "./config";
import prisma from "./prisma";
import { fr } from "zod/v4/locales";

const receiveFromQueue = async (
  queue: string,
  callback: (msg: string) => void
) => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "order";
    await channel.assertExchange(exchange, "direct", { durable: true });

    const q = await channel.assertQueue(queue, { exclusive: true });
    console.log(
      " [*] Waiting for messages in %s. To exit press CTRL+C",
      q.queue
    );
    await channel.bindQueue(q.queue, exchange, queue);

    channel.consume(
      q.queue,
      (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          console.log(" [x] Received %s: '%s'", queue, messageContent);
          callback(messageContent);
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error in receiveFromQueue:", error);
  }
};

receiveFromQueue("send-email", async (msg) => {
  console.log("Message received in email queue:", msg);

  const parsedBody = JSON.parse(msg);
  const { userEmail, grandTotal, id } = parsedBody;
  const from = defaultSender;

  const subject = "Mubarok ho apka order confirm hua hain";
  const body = `Bhai valo thaken sukhe thaken.ei nen apnar order id ${id}.ar ei lon apnar total ${grandTotal}`;

  const emalOption = {
    from,
    to: userEmail,
    subject,
    text: body,
  };

  const { rejected } = await transporter.sendMail(emalOption);
  if (rejected.length > 0) {
    console.error("Email sending failed to:", rejected);
    return;
  }

  await prisma.email.create({
    data: {
      sender: from,
      recipient: userEmail,
      subject: "Order confirmation",
      body,
      soruce: "Order Service",
    },
  });

  console.log("email sent");

  // Here you can add the logic to clear the cart based on the message content
});
