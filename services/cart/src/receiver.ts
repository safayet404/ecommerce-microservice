import amqp from "amqplib";
import redis from "./redis";

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

receiveFromQueue("clear-cart", (msg) => {
  console.log("Message received in clear-cart queue:", msg);

  const parsedMessage = JSON.parse(msg);
  const cartSessionId = parsedMessage.cartSessionId;

  redis.del(`session:${cartSessionId}`);
  redis.del(`cart:${cartSessionId}`);

  console.log("Cart cleared");

  // Here you can add the logic to clear the cart based on the message content
});
