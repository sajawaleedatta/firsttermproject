import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
} from "../controllers/cart.controller";

const router = Router();

router.get("/", authenticate, getCart);
router.post("/", authenticate, addToCart);
router.put("/:productId", authenticate, updateQuantity);
router.delete("/:productId", authenticate, removeFromCart);

export default router;
