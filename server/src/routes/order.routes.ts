import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createOrder, getMyOrders, getOrderById } from "../controllers/order.controller";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/", authenticate, getMyOrders);
router.get("/:id", authenticate, getOrderById);

export default router;
