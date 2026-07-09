import { Response } from "express";
import mongoose from "mongoose";
import prisma from "../config/database";
import { AuthRequest } from "../types/auth";
import ActivityLog from "../models/ActivityLog";

export const getStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalProducts,
      totalUsers,
      totalOrders,
      lowStockProducts,
      revenueResult,
      revenueTodayResult,
      revenueMonthResult,
      revenueYearResult,
      ordersByStatus,
      productsByCategory,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfToday }, paymentStatus: "PAID" } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfMonth }, paymentStatus: "PAID" } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startOfYear }, paymentStatus: "PAID" } }),
      prisma.order.groupBy({ by: ["status"], _count: true }),
      prisma.product.groupBy({ by: ["category"], _count: true }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, name: true } },
          items: { take: 3, include: { product: { select: { id: true, name: true } } } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalUsers,
        totalOrders,
        lowStockProducts,
        totalRevenue: revenueResult._sum.total || 0,
        revenueToday: revenueTodayResult._sum.total || 0,
        revenueThisMonth: revenueMonthResult._sum.total || 0,
        revenueThisYear: revenueYearResult._sum.total || 0,
        ordersByStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count })),
        productsByCategory: productsByCategory.map((c) => ({ category: c.category || "Uncategorized", count: c._count })),
        recentOrders,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch stats." });
  }
};

export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json({ success: true, data: users });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch users." });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    if (id === req.user!.userId) {
      res.status(400).json({ success: false, error: "Cannot delete yourself." });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: "User not found." });
      return;
    }

    if (existing.role === "ADMIN") {
      res.status(403).json({ success: false, error: "Cannot delete admin users." });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: "User deleted." });
  } catch {
    res.status(500).json({ success: false, error: "Failed to delete user." });
  }
};

export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));

    if (mongoose.connection.readyState !== 1) {
      res.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      return;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ActivityLog.countDocuments(),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch activity logs." });
  }
};

export const getOrders = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: { include: { product: { select: { id: true, name: true, price: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: orders });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch orders." });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { status, paymentStatus } = req.body as { status?: string; paymentStatus?: string };

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: "Order not found." });
      return;
    }

    const data: Record<string, string> = {};
    if (status) data.status = status;
    if (paymentStatus) data.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: { include: { product: { select: { id: true, name: true, price: true } } } },
      },
    });

    res.json({ success: true, data: order });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update order." });
  }
};
