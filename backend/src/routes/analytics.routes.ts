import { Router } from "express";
import { getDashboardAnalytics } from "../controllers/analytics.controller";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/dashboard", verifyToken, requireAdmin, getDashboardAnalytics);

export default router;
