import { CART_SERVICE, EMAIL_SERVICE, PRODUCT_SERVICE } from "@/config";
import prisma from "@/prisma";
import sendToQueue from "@/queue";
import { CartItemSchema, OrderSchema } from "@/schema";

import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const checkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate request
    const parsedBody = OrderSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.issues });
    }

    // get cart details
    const { data: cartData } = await axios.get(`${CART_SERVICE}/cart/me`, {
      headers: {
        "x-cart-session-id": parsedBody.data.cartSessionId,
      },
    });
    console.log("cart items before zod", cartData.data);

    const cartItems = z.array(CartItemSchema).safeParse(cartData.data);
    console.log("cart items zod", cartItems);

    if (!cartItems.success) {
      console.log("erro", cartItems.error.issues);

      return res.status(400).json({ errors: cartItems.error.issues });
    }

    if (cartItems.data.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // get product details from cart items
    const productDetails = await Promise.all(
      cartItems.data.map(async (item) => {
        const { data: product } = await axios.get(
          `${PRODUCT_SERVICE}/products/${item.productId}`
        );
        const productPrice = parseFloat(product.price);
        return {
          productId: product.id as string,
          productName: product.name as string,
          sku: product.sku as string,
          price: productPrice.toString(),
          quantity: item.quantity,
          total: product.price * item.quantity,
        };
      })
    );

    const subtotal = productDetails.reduce((acc, item) => acc + item.total, 0);

    // TODO: will handle tax calculation later
    const tax = 0;
    const grandTotal = subtotal + tax;

    // create order
    const order = await prisma.order.create({
      data: {
        userId: parsedBody.data.userId,
        userName: parsedBody.data.userName,
        userEmail: parsedBody.data.userEmail,
        subtotal,
        tax,
        grandTotal,
        orderItems: {
          create: productDetails.map((item) => ({
            ...item,
          })),
        },
      },
    });

    console.log("Order created: ", order.id);

    // clear cart
    // await axios.get(`${CART_SERVICE}/cart/clear`, {
    //   headers: {
    //     "x-cart-session-id": parsedBody.data.cartSessionId,
    //   },
    // });

    // await axios.post(`${EMAIL_SERVICE}/emails/send`, {
    //   recipient: parsedBody.data.userEmail,
    //   subject: "Order Confirmation",
    //   body: `Thank you for your order. Your order id is ${order.id}. Your order total is $${grandTotal}`,
    //   soruce: "Checkout",
    // });

    // send to queue
    sendToQueue("send-email", JSON.stringify(order));
    sendToQueue(
      "clear-cart",
      JSON.stringify({ cartSessionId: parsedBody.data.cartSessionId })
    );

    return res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export default checkout;
