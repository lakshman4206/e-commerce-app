import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleArchive,
  getCategories,
} from "../controllers/products.controller";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);

// Admin Protected
router.post("/", verifyToken, requireAdmin, createProduct);
router.put("/:id", verifyToken, requireAdmin, updateProduct);
router.patch("/:id/archive", verifyToken, requireAdmin, toggleArchive);

export default router;
