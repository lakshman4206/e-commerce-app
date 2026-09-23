import { Router } from "express";
import {
  getCustomerOrders,
  getAdminOrders,
  updateOrderStatus,
} from "../controllers/orders.controller";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

// Customer personal order history
router.get("/my-orders", verifyToken, getCustomerOrders);

// Admin order pipeline
router.get("/admin", verifyToken, requireAdmin, getAdminOrders);
router.patch("/:id/status", verifyToken, requireAdmin, updateOrderStatus);

export default router;
