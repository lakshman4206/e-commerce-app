import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors, { CorsOptionsDelegate } from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/products.routes";
import orderRoutes from "./routes/orders.routes";
import checkoutRoutes from "./routes/checkout.routes";
import webhookRoutes from "./routes/webhook.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logging Middlewares
app.use(helmet());
app.use(morgan("dev"));

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "https://localhost:3000",
];

const corsOptionsDelegate: CorsOptionsDelegate = (req, callback) => {
  const origin = (req as Request).headers.origin;
  // Allow requests with no origin (mobile apps, curl, Stripe webhooks) and all known origins
  callback(null, { origin: true, credentials: true });
};

app.use(cors(corsOptionsDelegate));

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
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/admin/analytics", analyticsRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend API active on port ${PORT}`);
  console.log(`🔗 Health check available at http://localhost:${PORT}/health`);
});

export default app;
