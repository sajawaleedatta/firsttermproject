import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../types/auth";
import { validateProduct } from "../utils/validate";

const str = (v: unknown): string | undefined =>
  typeof v === "string" ? v : undefined;

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validation = validateProduct(req.body);
    if (!validation.valid) {
      res.status(400).json({ success: false, error: validation.errors.join(" ") });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;
    const images = files ? files.map((f) => `/uploads/${f.filename}`) : [];

    const product = await prisma.product.create({
      data: {
        name: str(req.body.name) || "",
        description: str(req.body.description),
        price: Number(req.body.price),
        images,
        category: str(req.body.category),
        stock: Number(req.body.stock) || 0,
        userId: req.user!.userId,
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch {
    res.status(500).json({ success: false, error: "Failed to create product." });
  }
};

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = "1",
      limit = "10",
    } = req.query as Record<string, string | undefined>;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      const price: Record<string, number> = {};
      if (minPrice) price.gte = Number(minPrice);
      if (maxPrice) price.lte = Number(maxPrice);
      where.price = price;
    }

    const orderField = ["price", "name", "createdAt"].includes(sortBy) ? sortBy : "createdAt";
    const order: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [orderField]: order },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch products." });
  }
};

export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ success: false, error: "Product not found." });
      return;
    }
    res.json({ success: true, data: product });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch product." });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: "Product not found." });
      return;
    }

    if (existing.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ success: false, error: "Not authorized to update this product." });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;
    const newImages = files ? files.map((f) => `/uploads/${f.filename}`) : undefined;

    const data: Record<string, unknown> = {};
    const name = str(req.body.name);
    if (name) data.name = name;
    if (req.body.description !== undefined) data.description = str(req.body.description);
    if (req.body.price) data.price = Number(req.body.price);
    if (newImages) data.images = newImages;
    if (req.body.category !== undefined) data.category = str(req.body.category);
    if (req.body.stock !== undefined) data.stock = Number(req.body.stock);

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: product });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update product." });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: "Product not found." });
      return;
    }

    if (existing.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ success: false, error: "Not authorized to delete this product." });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: "Product deleted." });
  } catch {
    res.status(500).json({ success: false, error: "Failed to delete product." });
  }
};
