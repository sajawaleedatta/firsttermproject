import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../types/auth";

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentMethod } = req.body as { paymentMethod?: string };
    const method = paymentMethod === "VISA" ? "VISA" : "CASH";

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.userId },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, price: true, images: true, stock: true } } },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, error: "Cart is empty." });
      return;
    }

    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        res.status(400).json({ success: false, error: `Insufficient stock for ${item.product.name}.` });
        return;
      }
    }

    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          userId: req.user!.userId,
          total,
          paymentMethod: method,
          paymentStatus: method === "CASH" ? "PENDING" : "PAID",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return o;
    });

    res.status(201).json({ success: true, data: order });
  } catch {
    res.status(500).json({ success: false, error: "Failed to create order." });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      include: { items: { include: { product: { select: { id: true, name: true, price: true, images: true } } } } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: orders });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch orders." });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      res.status(404).json({ success: false, error: "Order not found." });
      return;
    }

    if (order.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ success: false, error: "Not authorized." });
      return;
    }

    res.json({ success: true, data: order });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch order." });
  }
};
