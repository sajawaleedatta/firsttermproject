import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../types/auth";

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: true,
                  stock: true,
                },
              },
            },
          },
        },
      });
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    res.json({ success: true, data: { ...cart, total } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch cart." });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity } = req.body as { productId?: string; quantity?: number };
    const qty = Math.max(1, Math.floor(Number(quantity)) || 1);

    if (!productId) {
      res.status(400).json({ success: false, error: "Product ID is required." });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ success: false, error: "Product not found." });
      return;
    }

    if (product.stock < 1) {
      res.status(400).json({ success: false, error: "Product is out of stock." });
      return;
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user!.userId } });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + qty },
        include: {
          product: {
            select: { id: true, name: true, price: true, images: true, stock: true },
          },
        },
      });
      res.json({ success: true, data: updated });
      return;
    }

    const item = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity: qty },
      include: {
        product: {
          select: { id: true, name: true, price: true, images: true, stock: true },
        },
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch {
    res.status(500).json({ success: false, error: "Failed to add product to cart." });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params as { productId: string };

    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId } });
    if (!cart) {
      res.status(404).json({ success: false, error: "Cart not found." });
      return;
    }

    const item = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (!item) {
      res.status(404).json({ success: false, error: "Product not in cart." });
      return;
    }

    await prisma.cartItem.delete({ where: { id: item.id } });
    res.json({ success: true, message: "Product removed from cart." });
  } catch {
    res.status(500).json({ success: false, error: "Failed to remove product from cart." });
  }
};

export const updateQuantity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params as { productId: string };
    const { quantity } = req.body as { quantity?: number };
    const qty = Math.max(1, Math.floor(Number(quantity)) || 1);

    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId } });
    if (!cart) {
      res.status(404).json({ success: false, error: "Cart not found." });
      return;
    }

    const item = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (!item) {
      res.status(404).json({ success: false, error: "Product not in cart." });
      return;
    }

    const updated = await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: qty },
      include: {
        product: {
          select: { id: true, name: true, price: true, images: true, stock: true },
        },
      },
    });

    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update quantity." });
  }
};
