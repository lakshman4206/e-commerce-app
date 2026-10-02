import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
} from "../controllers/wishlist.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

// All wishlist routes require authentication
router.use(verifyToken);

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.get("/status/:productId", checkWishlistStatus);

export default router;
