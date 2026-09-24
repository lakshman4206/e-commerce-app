"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/products";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create account via registration API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Account created successfully! Signing you in...");

      // 2. Automatically log the customer in
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInResult?.error) {
        toast.info("Account created. Please log in with your credentials.");
        router.push("/login");
        return;
      }

      // 3. Redirect to destination (checkout if cart has items, else products)
      const cartItemsCount = useCartStore.getState().items.length;
      let targetUrl = callbackUrl;
      if (!searchParams.get("callbackUrl") || callbackUrl === "/products" || callbackUrl === "/") {
        targetUrl = cartItemsCount > 0 ? "/checkout" : "/products";
      }

      // Hard navigation to immediately pass session cookies to /checkout
      window.location.href = targetUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration error";
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl p-7 sm:p-9 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-orange-500 text-primary-foreground font-black flex items-center justify-center text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              E
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                E Kart
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold -mt-1">
                Storefront
              </span>
            </div>
          </Link>
          <h2 className="text-2xl font-black tracking-tight mt-3">Create Customer Account</h2>
          <p className="text-xs text-muted-foreground">
            Join thousands of shoppers for express payment gateway checkout, orders &amp; exclusive deals.
          </p>
        </div>

        {/* Perks Badge */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-muted/40 border border-border/80 text-[11px] text-muted-foreground text-center font-medium">
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-orange-500" />
            <span>Fast Checkout</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure Vault</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>Live Tracking</span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-foreground/80 block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
              <User className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground/80 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground/80 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-mono"
              />
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground/80 block mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-mono"
              />
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20 mt-2 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-primary-foreground transition-all rounded-xl"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating your E Kart account...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Create Account &amp; Continue</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground pt-1 border-t border-border/60">
          Already have an account?{" "}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-bold text-primary hover:underline hover:text-orange-500 transition"
          >
            Sign in here →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-background via-background/95 to-muted/30">
      <Suspense
        fallback={
          <div className="w-full max-w-md h-96 rounded-3xl border border-border bg-card p-8 animate-pulse flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
