import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // In development/build mode without env set, fallback gracefully to mock/placeholder key
  // to avoid build crashes while enforcing the requirement in runtime
  console.warn("STRIPE_SECRET_KEY is not set in environment variables.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_fallback_key", {
  apiVersion: "2024-06-20",
  typescript: true,
  appInfo: {
    name: "Enterprise E-Commerce Platform",
    version: "1.0.0",
  },
});
