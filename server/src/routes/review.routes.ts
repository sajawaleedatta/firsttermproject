import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getProductReviews, createReview, deleteReview } from "../controllers/review.controller";
import { logActivity } from "../middleware/activityLog";

const router = Router();

router.get("/product/:productId", getProductReviews);
router.post("/", authenticate, logActivity("create", "review"), createReview);
router.delete("/:id", authenticate, logActivity("delete", "review"), deleteReview);

export default router;
