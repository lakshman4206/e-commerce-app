import { Router } from "express";
import {
  getProductReviews,
  upsertReview,
  deleteReview,
  getMyReview,
} from "../controllers/reviews.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

// Public: get all reviews for a product
router.get("/product/:productId", getProductReviews);

// Protected: user's own review actions
router.get("/product/:productId/me", verifyToken, getMyReview);
router.post("/product/:productId", verifyToken, upsertReview);
router.delete("/product/:productId", verifyToken, deleteReview);

export default router;
