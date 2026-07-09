import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { uploadMultiple } from "../middleware/upload";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", authenticate, authorize("ADMIN"), uploadMultiple, createProduct);
router.put("/:id", authenticate, authorize("ADMIN"), uploadMultiple, updateProduct);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteProduct);

export default router;
