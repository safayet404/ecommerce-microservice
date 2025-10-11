import amqp from "amqplib";
import { QUEUE_URL } from "./config";

const sendToQueue = async (queue: string, message: string) => {
  try {
    const connection = await amqp.connect(QUEUE_URL);
    const channel = await connection.createChannel();

    const exchange = "order";
    await channel.assertExchange(exchange, "direct", { durable: true });

    channel.publish(exchange, queue, Buffer.from(message));
    console.log(" [x] Sent %s: '%s'", queue, message);
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error in sendToQueue:", error);
  }
};

export default sendToQueue;
