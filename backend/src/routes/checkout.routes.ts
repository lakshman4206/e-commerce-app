import { Router } from "express";
import { createPaymentIntent } from "../controllers/checkout.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/create-intent", verifyToken, createPaymentIntent);

export default router;
