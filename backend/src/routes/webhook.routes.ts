import { Router, raw } from "express";
import { handleStripeWebhook } from "../controllers/webhook.controller";

const router = Router();

// Express raw body buffer parser specifically for Stripe signature verification
router.post("/stripe", raw({ type: "application/json" }), handleStripeWebhook);

export default router;
