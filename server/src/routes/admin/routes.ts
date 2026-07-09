import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { getStats, getUsers, deleteUser, getActivityLogs, getOrders, updateOrderStatus } from "../../controllers/admin.controller";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.get("/activity-logs", getActivityLogs);
router.get("/orders", getOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.delete("/users/:id", deleteUser);

export default router;
