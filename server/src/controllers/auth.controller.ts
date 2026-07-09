import { Request, Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../types/auth";
import { hashPassword, comparePassword, generateToken } from "../utils/auth";
import { sendWelcomeEmail } from "../utils/email";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password, role } = req.body;
    const userRole = role === "ADMIN" ? "ADMIN" : "CUSTOMER";

    if (!email || !password) {
      res.status(400).json({ success: false, error: "Email and password are required." });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, error: "Email already in use." });
      return;
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, name, password: hashed, role: userRole as "ADMIN" | "CUSTOMER" },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    sendWelcomeEmail(user.email, user.name || "");

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Registration failed." });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: "Email and password are required." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, error: "Invalid email or password." });
      return;
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      res.status(401).json({ success: false, error: "Invalid email or password." });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Login failed." });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found." });
      return;
    }
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch user." });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found." });
      return;
    }
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch profile." });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found." });
      return;
    }

    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(409).json({ success: false, error: "Email already in use." });
        return;
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ success: false, error: "Current password is required to set a new password." });
        return;
      }
      const valid = await comparePassword(currentPassword, user.password);
      if (!valid) {
        res.status(401).json({ success: false, error: "Current password is incorrect." });
        return;
      }
    }

    const data: { name?: string; email?: string; password?: string } = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (newPassword) data.password = await hashPassword(newPassword);

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });

    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update profile." });
  }
};
