import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors, { CorsOptionsDelegate } from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/products.routes";
import orderRoutes from "./routes/orders.routes";
import checkoutRoutes from "./routes/checkout.routes";
import webhookRoutes from "./routes/webhook.routes";
import analyticsRoutes from "./routes/analytics.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import reviewRoutes from "./routes/reviews.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logging Middlewares
app.use(helmet());
app.use(morgan("dev"));

// CORS Configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptionsDelegate: CorsOptionsDelegate = (req, callback) => {
  const origin = (req as Request).headers.origin;
  const isAllowed =
    !origin ||
    allowedOrigins.length === 0 ||
    allowedOrigins.includes(origin) ||
    origin.includes("localhost");
  callback(null, { origin: isAllowed, credentials: true });
};

app.use(cors(corsOptionsDelegate));

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,                   // max 30 auth attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,            // 200 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Rate limit exceeded. Please slow down." },
});

// Apply general rate limiter to all API routes
app.use("/api", generalLimiter);

// CRITICAL: Webhook routes must be registered before express.json()
// to allow raw body buffer access for Stripe signature validation
app.use("/api/webhooks", webhookRoutes);

// General JSON & Form Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "e-commerce-backend-api",
    timestamp: new Date().toISOString(),
  });
});

// Mount Application Routes
app.use("/api/auth", authLimiter, authRoutes);   // strict rate limit on auth
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/analytics", analyticsRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend API active on port ${PORT}`);
  console.log(`🔗 Health check available at http://localhost:${PORT}/health`);
});

export default app;
