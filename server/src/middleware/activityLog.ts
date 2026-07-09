import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../types/auth";
import ActivityLog from "../models/ActivityLog";

export function logActivity(action: string, resource: string) {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user && mongoose.connection.readyState === 1) {
        await ActivityLog.create({
          userId: req.user.userId,
          userEmail: req.user.email,
          action,
          resource,
          details: JSON.stringify({ method: req.method, path: req.path }),
        });
      }
    } catch {
      // silently fail — logging should never crash the request
    }
    next();
  };
}
