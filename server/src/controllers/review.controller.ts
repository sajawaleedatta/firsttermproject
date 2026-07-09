import { Response } from "express";
import mongoose from "mongoose";
import prisma from "../config/database";
import { AuthRequest } from "../types/auth";
import Review from "../models/Review";

export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json({ success: true, data: [] });
      return;
    }

    const { productId } = req.params as { productId: string };
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: reviews });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch reviews." });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({ success: false, error: "Reviews are temporarily unavailable." });
      return;
    }

    const { productId, rating, comment } = req.body as {
      productId?: string;
      rating?: number;
      comment?: string;
    };

    if (!productId || !rating || !comment) {
      res.status(400).json({ success: false, error: "Product ID, rating, and comment are required." });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ success: false, error: "Rating must be between 1 and 5." });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ success: false, error: "Product not found." });
      return;
    }

    const existing = await Review.findOne({ productId, userId: req.user!.userId });
    if (existing) {
      res.status(409).json({ success: false, error: "You have already reviewed this product." });
      return;
    }

    const review = await Review.create({
      productId,
      userId: req.user!.userId,
      userName: req.user!.email,
      rating,
      comment,
    });

    const stats = await Review.aggregate([
      { $match: { productId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const avg = stats[0] ? Math.round(stats[0].avgRating * 10) / 10 : rating;
    const count = stats[0]?.count ?? 1;

    await prisma.product.update({
      where: { id: productId },
      data: { rating: avg, reviewCount: count },
    });

    res.status(201).json({ success: true, data: review });
  } catch {
    res.status(500).json({ success: false, error: "Failed to create review." });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({ success: false, error: "Reviews are temporarily unavailable." });
      return;
    }

    const { id } = req.params as { id: string };

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({ success: false, error: "Review not found." });
      return;
    }

    if (review.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ success: false, error: "Not authorized to delete this review." });
      return;
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(id);

    const stats = await Review.aggregate([
      { $match: { productId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const avg = stats[0] ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const count = stats[0]?.count ?? 0;

    await prisma.product.update({
      where: { id: productId },
      data: { rating: avg, reviewCount: count },
    });

    res.json({ success: true, message: "Review deleted." });
  } catch {
    res.status(500).json({ success: false, error: "Failed to delete review." });
  }
};
